import logging
import uuid
from urllib.parse import urlparse, parse_qs

from arches.app.utils.betterJSONSerializer import JSONSerializer
from arches.app.utils.response import JSONResponse
from arches.app.models.concept import Concept
from arches.app.models.models import Node
from arches.app.models.tile import Tile
from django.db.models import F
from rest_framework import status
from arches_component_lab.views.node_config_mixin import CardNodeWidgetConfigMixin

from rest_framework.generics import (
    CreateAPIView,
    UpdateAPIView,
    RetrieveAPIView,
)
from rest_framework.parsers import JSONParser

from arches_querysets.models import ResourceTileTree
from arches_querysets.rest_framework.multipart_json_parser import MultiPartJSONParser
from arches_querysets.rest_framework.pagination import ArchesLimitOffsetPagination
from arches_querysets.rest_framework.permissions import ReadOnly, ResourceEditor
from bcrhp.rest_framework.permissions import LocalGovernment
from bcrhp.util.bcrhp_aliases import GraphSlugs as slugs
from arches_querysets.rest_framework.serializers import (
    ArchesResourceSerializer,
)
from arches_querysets.rest_framework.view_mixins import ArchesModelAPIMixin
from arches_querysets.rest_framework.generic_views import ArchesResourceBlankView

logger = logging.getLogger(__name__)
from rest_framework import serializers


class HeritageSiteSerializer(ArchesResourceSerializer):

    class Meta(ArchesResourceSerializer.Meta):
        # used by ArchesModelAPIMixin
        graph_slug = "heritage_site"

        # Extend base extra_kwargs so DRF doesn't require these on input.
        extra_kwargs = {
            **getattr(ArchesResourceSerializer.Meta, "extra_kwargs", {}),
            "graph": {"required": False, "allow_null": True},
            "resourceinstanceid": {
                "required": False,
                "allow_null": True,
                "read_only": True,
            },
        }

    def __init__(self, *args, graph_slug=None, context=None, **kwargs):
        # This is required because ArchesResourceSerializer is not picking up the
        # slug from the Meta field
        graph_slug = graph_slug or getattr(self.Meta, "graph_slug", None)
        super().__init__(*args, context=context, graph_slug=graph_slug, **kwargs)
        # Override validation for all DateTimeField/DateField instances
        self._modify_datetime_validators(self)

    def _modify_datetime_validators(self, serializer):
        """
        Recursively modify all DateTimeField and DateField validators in the serializer
        """
        if hasattr(serializer, "fields"):
            for field_name, field in serializer.fields.items():
                if isinstance(field, serializers.DateTimeField) or isinstance(
                    field, serializers.DateField
                ):
                    # Replace the input formats with our custom formats
                    field.input_formats = [
                        "%Y",
                        "%Y-%m-%d",
                        "%Y-%m-%dT%H:%M:%S",
                        "%Y-%m-%dT%H:%M:%S.%f%z",
                    ]

                # Recursively process nested serializers
                if hasattr(field, "fields"):
                    self._modify_datetime_validators(field)
                # Handle ListSerializer children
                elif hasattr(field, "child") and hasattr(field.child, "fields"):
                    self._modify_datetime_validators(field.child)

    @property
    def graph_slug(self):
        return getattr(self, "_graph_slug", None) or getattr(
            self.Meta, "graph_slug", None
        )


def inspect_nested_data(data, prefix="", max_depth=10, current_depth=0):
    """Recursively inspect and print a nested data structure"""
    if current_depth > max_depth:
        logger.debug(f"{prefix}[MAX DEPTH REACHED]")
        return

    if isinstance(data, dict):
        logger.debug(f"{prefix}Dict with {len(data)} keys:")
        for key, value in data.items():
            logger.debug(f"{prefix}  Key '{key}':")
            inspect_nested_data(value, prefix + "    ", max_depth, current_depth + 1)
    elif isinstance(data, list):
        logger.debug(f"{prefix}List with {len(data)} items:")
        if len(data) > 0:
            logger.debug(f"{prefix}  First item:")
            inspect_nested_data(data[0], prefix + "    ", max_depth, current_depth + 1)
            if len(data) > 1:
                logger.debug(f"{prefix}  Last item:")
                inspect_nested_data(
                    data[-1], prefix + "    ", max_depth, current_depth + 1
                )
    else:
        logger.debug(f"{prefix}Value: {data} (Type: {type(data).__name__})")


def format_deep_errors(errors, path=""):
    """Format nested errors with their full path for better debugging"""
    formatted = []

    if isinstance(errors, dict):
        for key, value in errors.items():
            new_path = f"{path}.{key}" if path else key

            if isinstance(value, dict):
                formatted.extend(format_deep_errors(value, new_path))
            elif isinstance(value, list):
                for item in value:
                    if isinstance(item, dict):
                        formatted.extend(format_deep_errors(item, new_path))
                    elif isinstance(item, str):
                        formatted.append(f"{new_path}: {item}")
                    else:
                        formatted.append(f"{new_path}: {item}")
            else:
                formatted.append(f"{new_path}: {value}")

    return formatted


class PatchedArchesResourceBlankView(ArchesResourceBlankView):
    # This is just a patched version of the parent that takes
    # a parameter to control whether the 1:m values are filled with
    # a single aliased tile data value
    permission_classes = [ReadOnly]
    serializer_class = ArchesResourceSerializer

    def get_serializer_context(self):
        serializer_context = super().get_serializer_context()
        fill_blanks = self.request.GET.get("fill_blanks", "").lower() == "true"
        serializer_context["fill_blanks"] = fill_blanks
        return serializer_context


class SubmitHeritageSite(
    ArchesModelAPIMixin,
    CardNodeWidgetConfigMixin,
    RetrieveAPIView,
    CreateAPIView,
    UpdateAPIView,
):
    permission_classes = [ResourceEditor | LocalGovernment]
    serializer_class = HeritageSiteSerializer
    parser_classes = [JSONParser, MultiPartJSONParser]
    pagination_class = ArchesLimitOffsetPagination
    # This will apply provisional edits visible to the user
    provisional_edits = True

    lookup_field = "resourceinstanceid"
    valid_keys = ["aliased_data"]
    required_sections = [
        "resourceinstanceid",
        "heritage_site_location",
        "site_names",
        "bc_right",
    ]
    optional_sections = [
        "site_document",
        "heritage_theme",
        "external_url",
        "site_images",
        "chronology",
        "heritage_class",
        "bc_statement_of_significance",
        "heritage_function",
        "construction_actors",
        "internal_remark",
    ]
    # Aliases whose orphaned tiles should be deleted when omitted from a PATCH
    # payload list. Sections absent from this set are never orphan-deleted even
    # if they appear in the payload, preserving sparse-tree semantics for them.
    deletable_list_aliases = {
        "site_images",
        "external_url",
        "chronology",
        "construction_actors",
        "heritage_theme",
        "heritage_class",
        "heritage_function",
    }

    def get_default_registration_status_uuid(self):
        return self.get_concept_uuid(
            "heritage_site", "registration_status", "Registered"
        )

    def get_default_registry_type_uuid(self):
        return self.get_concept_uuid(
            "heritage_site", "registry_types", "Local/Regional Heritage Site"
        )

    def get_default_remark_type_uuid(self):
        return self.get_concept_uuid("heritage_site", "remark_type", "General")

    def get_concept_uuid(self, graph_slug, node_alias, pref_label):
        config = self.get_card_x_node_x_widget(graph_slug, node_alias)
        logger.debug(JSONSerializer().serialize(config))

        if "url" in config.config:
            url = config.config["url"]
            concept_id = parse_qs(urlparse(url).query).get("conceptid", [None])[0]
        else:
            node = Node.objects.filter(alias=node_alias).first()
            logger.debug(f"Got node config: {node.config}")
            concept_id = node.config["rdmCollection"]
            logger.debug(f"Got concept id: {concept_id}")

        parent_concept = Concept().get(concept_id)
        child_concepts = parent_concept.get_child_collections(
            concept_id,
        )

        filtered = [t for t in child_concepts if t[1] == pref_label]
        logger.debug(f"Filtered: {JSONSerializer().serialize(filtered)}")

        return filtered[0][2] if filtered else None

    def patch_data(self, site):
        # This seems wrong. We should allow a GeoJSON to be supplied as an object,
        # not already serialized?
        for loc in site["aliased_data"]["heritage_site_location"]:
            loc["aliased_data"]["site_boundary"] = [
                sb
                for sb in loc["aliased_data"]["site_boundary"]
                if sb["aliased_data"]["site_boundary"]["node_value"]["features"]
            ]
            for sb in loc["aliased_data"]["site_boundary"]:
                logger.debug(sb["aliased_data"]["site_boundary"])
                if (
                    "bbox"
                    in sb["aliased_data"]["site_boundary"]["node_value"]["features"][0][
                        "geometry"
                    ]
                ):
                    logger.debug(
                        sb["aliased_data"]["site_boundary"]["node_value"]["features"][
                            0
                        ]["geometry"].pop("bbox")
                    )

                # The feature ID coming from Cadastral Parcelmap is not a UUID so replace it with on
                try:
                    uuid.UUID(
                        str(
                            sb["aliased_data"]["site_boundary"]["node_value"][
                                "features"
                            ][0]["id"]
                        )
                    )
                except ValueError:
                    sb["aliased_data"]["site_boundary"]["node_value"]["features"][0][
                        "id"
                    ] = str(uuid.uuid4())

                sb["aliased_data"]["site_boundary"][
                    "node_value"
                ] = JSONSerializer().serialize(
                    sb["aliased_data"]["site_boundary"]["node_value"]
                )

        site["aliased_data"].pop("borden_number", None)
        site["aliased_data"]["bc_right"]["aliased_data"]["registration_status"][
            "node_value"
        ] = self.get_default_registration_status_uuid()
        site["aliased_data"]["bc_right"]["aliased_data"]["registry_types"][
            "node_value"
        ] = [self.get_default_registry_type_uuid()]
        if site["aliased_data"]["bc_right"]["aliased_data"][
            "officially_recognized_site"
        ]["node_value"] not in (True, False):
            site["aliased_data"]["bc_right"]["aliased_data"][
                "officially_recognized_site"
            ]["node_value"] = True
        if (
            "internal_remark" in site["aliased_data"]
            and len(site["aliased_data"]["internal_remark"]) == 1
        ):
            site["aliased_data"]["internal_remark"][0]["aliased_data"]["remark_type"][
                "node_value"
            ] = self.get_default_remark_type_uuid()

    def prune_data(self, site):
        allowed_sections = self.required_sections + self.optional_sections
        keys = list(site["aliased_data"].keys())
        for key in keys:
            if key not in allowed_sections:
                site["aliased_data"].pop(key)

    _DEFAULT_I18N = {"en": {"value": "", "direction": "ltr"}}
    _IMAGE_I18N_FIELDS = ("title", "altText", "attribution", "description")

    def _ensure_image_i18n_fields(self, site: dict) -> None:
        """Add missing i18n metadata fields to every file entry in site_images tiles."""
        for image_tile in site.get("aliased_data", {}).get("site_images", []):
            files = (
                image_tile.get("aliased_data", {})
                .get("site_images", {})
                .get("node_value")
                or []
            )
            for file_entry in files:
                if not isinstance(file_entry, dict):
                    continue
                for field in self._IMAGE_I18N_FIELDS:
                    if field not in file_entry:
                        file_entry[field] = dict(self._DEFAULT_I18N)

    def _get_user_government_node_value(self, user):
        """Return the government_association node_value for the authenticated user.

        Returns a resource-instance-list value suitable for setting responsible_government:
            [{"resourceId": "<uuid>", "ontologyProperty": "", "inverseOntologyProperty": ""}]

        Returns None if the user has no linked government_person or government_association.
        """
        try:
            government_user = (
                ResourceTileTree.get_tiles(graph_slug=slugs.GOVERNMENT_PERSON)
                .filter(username=user.username)
                .get()
            )
            gov_assoc_tile = government_user.aliased_data.government_association
            if not gov_assoc_tile:
                return None
            gov_assoc_resource = gov_assoc_tile.aliased_data.government_association
            if not gov_assoc_resource:
                return None
            return [
                {
                    "resourceId": str(gov_assoc_resource.pk),
                    "ontologyProperty": "",
                    "inverseOntologyProperty": "",
                }
            ]
        except Exception:
            pass
        return None

    def _set_responsible_government(self, site: dict, government_node_value) -> None:
        """Set responsible_government on new protection_event tiles only.

        Skips any event that already has a tileid (already saved to the DB) or
        that already carries a responsible_government value.
        """
        protection_events = (
            site.get("aliased_data", {})
            .get("bc_right", {})
            .get("aliased_data", {})
            .get("protection_event", [])
        )
        for event in protection_events:
            if not isinstance(event, dict):
                continue
            if event.get("tileid"):
                continue
            aliased = event.setdefault("aliased_data", {})
            if (aliased.get("responsible_government") or {}).get("node_value"):
                continue
            aliased["responsible_government"] = {"node_value": government_node_value}

    # Alias → (list_alias, node_alias) for every boolean node covered by
    # UniqueBooleanValue that lives inside a cardinality-n nodegroup.  The
    # stash keyed by (str(tileid), str(node_pk)) lets the function hook see
    # pending batch values before bulk_update commits them.
    _UNIQUE_BOOL_NODES = [
        ("site_images", "primary_image"),
    ]

    def _stash_pending_tile_data(self, request, patched: dict) -> None:
        """Attach incoming node values to the request so UniqueBooleanValue
        can detect same-batch flag swaps before bulk_update commits them."""
        from arches.app.models.models import Node as _Node

        stash: dict = getattr(request, "_pending_tile_data", {})

        for list_alias, node_alias in self._UNIQUE_BOOL_NODES:
            tiles = patched.get("aliased_data", {}).get(list_alias, [])
            if not tiles:
                continue
            node_pk = (
                _Node.objects.filter(
                    alias=node_alias,
                    graph__slug=self.serializer_class.Meta.graph_slug,
                )
                .values_list("pk", flat=True)
                .first()
            )
            if node_pk is None:
                continue
            node_id_str = str(node_pk)
            for tile in tiles:
                tileid = tile.get("tileid") if isinstance(tile, dict) else None
                if not tileid:
                    continue
                node_value = (
                    tile.get("aliased_data", {}).get(node_alias, {}).get("node_value")
                )
                stash[str(tileid)] = {node_id_str: node_value}

        request._pending_tile_data = stash

    def create(self, request, *args, **kwargs):
        raw = request.data
        cleaned_object = raw
        logger.debug("FILES keys=%s", list(request.FILES.keys()))

        for field_name, f in request.FILES.items():  # one file per field
            logger.debug(
                "file field=%s name=%s size=%s content_type=%s",
                field_name,
                f.name,
                f.size,
                getattr(f, "content_type", None),
            )
        logger.debug(f"Before clean")
        self.patch_data(cleaned_object)
        self.prune_data(cleaned_object)
        self._ensure_image_i18n_fields(cleaned_object)
        government_node_value = self._get_user_government_node_value(request.user)
        if government_node_value:
            self._set_responsible_government(cleaned_object, government_node_value)
        patched = cleaned_object
        serializer = self.get_serializer(data=patched)

        logger.info(f"Checking valid")
        if not serializer.is_valid():
            # print the errors you’re currently not seeing
            logger.warning("serializer.errors:", serializer.errors)
            for error in format_deep_errors(serializer.errors):
                logger.warning(f" - {error}")

            return JSONResponse(serializer.errors, status=400)
        serializer.is_valid(raise_exception=True)
        logger.info("It's valid again")
        try:
            logger.info("Before perform_create")
            self.perform_create(serializer)
            logger.info("Created")
        except Exception as e:
            logger.error(f"Unable to create: {e}", exc_info=True)
            return JSONResponse(
                {
                    "error": "Unable to create resource",
                    "message": str(e),
                    "type": e.__class__.__name__,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        logger.debug("Created successfully... getting headers")
        headers = self.get_success_headers(serializer.data)
        logger.debug("Got headers, returning JSON response")
        return JSONResponse(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    def transform_retrieved_data(self, data: dict) -> dict:
        aliased = data.get("aliased_data", {})
        site_images = aliased.get("site_images")
        if isinstance(site_images, list) and len(site_images) > 1:

            def primary_sort_key(image):
                val = (
                    image.get("aliased_data", {})
                    .get("primary_image", {})
                    .get("node_value")
                )
                if val is True:
                    return 0
                if val is False:
                    return 1
                return 2

            aliased["site_images"] = sorted(site_images, key=primary_sort_key)
        # We don't want internal remarks or site_documents being sent to the client
        aliased["internal_remark"] = []
        aliased["site_document"] = []
        return data

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = self.transform_retrieved_data(serializer.data)
        return JSONResponse(data, status=status.HTTP_200_OK)

    def _delete_orphaned_tiles(
        self, patched_data: dict, resourceinstanceid: str, request
    ) -> None:
        """Delete tiles that were removed from a list-type section in the payload.

        Only sections that ARE present in the payload are diffed — sections
        absent from the (sparse) payload are left completely untouched.

        Uses Tile.delete() (not a bulk queryset delete) so that audit logging,
        search index cleanup, and datatype post_tile_delete hooks all run.
        """
        aliased = patched_data.get("aliased_data", {})
        for alias, value in aliased.items():
            if alias not in self.deletable_list_aliases:
                continue
            if not isinstance(value, list):
                continue
            incoming_tileids = {
                t["tileid"] for t in value if isinstance(t, dict) and t.get("tileid")
            }
            # The grouping node for a nodegroup is the node whose nodeid
            # equals its own nodegroup_id.
            node = Node.objects.filter(
                alias=alias,
                graph__slug="heritage_site",
                nodeid=F("nodegroup_id"),
            ).first()
            if node is None:
                continue
            orphans = Tile.objects.filter(
                resourceinstance_id=resourceinstanceid,
                nodegroup_id=node.nodegroup_id,
            ).exclude(tileid__in=incoming_tileids)
            count = orphans.count()
            if count:
                logger.info(
                    "Deleting %d orphaned tile(s) for alias=%s resource=%s",
                    count,
                    alias,
                    resourceinstanceid,
                )
                for tile in orphans:
                    tile.delete(request=request)

    def partial_update(self, request, *args, **kwargs):
        raw = request.data
        cleaned_object = raw
        logger.debug("FILES keys=%s", list(request.FILES.keys()))

        for field_name, f in request.FILES.items():
            logger.debug(
                "file field=%s name=%s size=%s content_type=%s",
                field_name,
                f.name,
                f.size,
                getattr(f, "content_type", None),
            )

        self.patch_data(cleaned_object)
        self.prune_data(cleaned_object)
        self._ensure_image_i18n_fields(cleaned_object)
        government_node_value = self._get_user_government_node_value(request.user)
        if government_node_value:
            self._set_responsible_government(cleaned_object, government_node_value)
        patched = cleaned_object

        resourceinstanceid = self.kwargs.get("resourceinstanceid")
        self._delete_orphaned_tiles(patched, resourceinstanceid, request)

        # Pre-populate a stash of incoming node values so that pre-save
        # function hooks (e.g. UniqueBooleanValue) can see what ALL tiles
        # in this batch will be saved to, even though bulk_update hasn't
        # committed yet.  Without this, a primary-image handoff (tile A:
        # True→False, tile B: False→True in the same save) always causes a
        # false uniqueness conflict because every __preSave() sees the
        # pre-batch DB state.
        self._stash_pending_tile_data(request, patched)

        instance = self.get_object()
        serializer = self.get_serializer(instance, data=patched, partial=True)

        if not serializer.is_valid():
            logger.warning("serializer.errors: %s", serializer.errors)
            for error in format_deep_errors(serializer.errors):
                logger.warning(f" - {error}")
            return JSONResponse(serializer.errors, status=400)

        try:
            # Capture the tileids of any documents/remarks submitted in this request so we
            # can filter the server-processed response to just those tiles (rather than
            # returning all historical documents).
            submitted_doc_tileids = {
                t.get("tileid")
                for t in patched.get("aliased_data", {}).get("site_document", [])
                if t.get("tileid")
            }
            internal_remark = patched.get("aliased_data", {}).get("internal_remark", [])
            self.perform_update(serializer)
        except Exception as e:
            logger.error(f"Unable to update: {e}", exc_info=True)
            return JSONResponse(
                {
                    "error": "Unable to update resource",
                    "message": str(e),
                    "type": e.__class__.__name__,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Return the server-processed versions of the submitted document tiles so the
        # client receives permanent file_ids (UUIDs) rather than the temporary upload-key
        # format ("file-list_<tileid>-<nodeid>") that was in the original request body.
        # Returning the client-sent payload here would cause the non-UUID file_id to
        # persist in the client state and be re-sent on subsequent saves, making the
        # server treat an unchanged existing document as a new upload every time.
        return_object = serializer.data
        all_saved_docs = return_object.get("aliased_data", {}).get("site_document", [])
        saved_submitted_docs = [
            t for t in all_saved_docs if t.get("tileid") in submitted_doc_tileids
        ]
        return_object.get("aliased_data", {})["site_document"] = saved_submitted_docs
        return_object.get("aliased_data", {})["internal_remark"] = internal_remark
        return JSONResponse(return_object, status=status.HTTP_200_OK)


# class SubmissionsForReviewPagination(ArchesLimitOffsetPagination):
#     default_limit = 10
#
#
# class IPAsForReview(ArchesModelAPIMixin, CardNodeWidgetConfigMixin, ListCreateAPIView):
#     permission_classes = [ResourceEditor | ReadOnly]
#     serializer_class = HeritageSiteSerializer
#     parser_classes = [JSONParser, MultiPartJSONParser]
#     pagination_class = SubmissionsForReviewPagination
#
#     def filter_queryset(self, queryset):
#         queryset = super().filter_queryset(queryset)
#         queryset = queryset.filter(initial_review_level_of_risk__isnull=True)
#         sort = self.request.GET.get("sort")
#         if sort:
#             queryset = queryset.order_by(sort)
#         return queryset
