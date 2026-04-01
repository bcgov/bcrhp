import logging
import traceback
import uuid
from urllib.parse import urlparse, parse_qs

from arches.app.utils.betterJSONSerializer import JSONSerializer
from arches.app.utils.response import JSONResponse
from arches.app.models.concept import Concept
from arches.app.models.models import Node
from rest_framework import status
from arches_component_lab.views.node_config_mixin import CardNodeWidgetConfigMixin

from rest_framework.generics import ListCreateAPIView, CreateAPIView, UpdateAPIView
from rest_framework.parsers import JSONParser

import json
from arches_querysets.rest_framework.multipart_json_parser import MultiPartJSONParser
from arches_querysets.rest_framework.pagination import ArchesLimitOffsetPagination
from arches_querysets.rest_framework.permissions import ReadOnly, ResourceEditor
from bcrhp.rest_framework.permissions import LocalGovernment
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
        print(f"{prefix}[MAX DEPTH REACHED]")
        return

    if isinstance(data, dict):
        print(f"{prefix}Dict with {len(data)} keys:")
        for key, value in data.items():
            print(f"{prefix}  Key '{key}':")
            inspect_nested_data(value, prefix + "    ", max_depth, current_depth + 1)
    elif isinstance(data, list):
        print(f"{prefix}List with {len(data)} items:")
        if len(data) > 0:
            print(f"{prefix}  First item:")
            inspect_nested_data(data[0], prefix + "    ", max_depth, current_depth + 1)
            if len(data) > 1:
                print(f"{prefix}  Last item:")
                inspect_nested_data(
                    data[-1], prefix + "    ", max_depth, current_depth + 1
                )
    else:
        print(f"{prefix}Value: {data} (Type: {type(data).__name__})")


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


class SubmitHeritageSite(ArchesModelAPIMixin, CardNodeWidgetConfigMixin, CreateAPIView):
    permission_classes = [ResourceEditor | LocalGovernment]
    serializer_class = HeritageSiteSerializer
    parser_classes = [JSONParser, MultiPartJSONParser]
    pagination_class = ArchesLimitOffsetPagination
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
    ]

    def get_default_registration_status_uuid(self):
        return self.get_concept_uuid(
            "heritage_site", "registration_status", "Registered"
        )

    def get_default_registry_type_uuid(self):
        return self.get_concept_uuid(
            "heritage_site", "registry_types", "Local/Regional Heritage Site"
        )

    def get_concept_uuid(self, graph_slug, node_alias, pref_label):
        config = self.get_card_x_node_x_widget(graph_slug, node_alias)
        print(JSONSerializer().serialize(config))

        if "url" in config.config:
            url = config.config["url"]
            concept_id = parse_qs(urlparse(url).query).get("conceptid", [None])[0]
        else:
            node = Node.objects.filter(alias=node_alias).first()
            print(f"Got node config: {node.config}")
            concept_id = node.config["rdmCollection"]
            print(f"Got concept id: {concept_id}")

        parent_concept = Concept().get(concept_id)
        child_concepts = parent_concept.get_child_collections(
            concept_id,
        )

        filtered = [t for t in child_concepts if t[1] == pref_label]
        print(f"Filtered: {JSONSerializer().serialize(filtered)}")

        # print(f"Returning {filtered[0][2]}")
        return filtered[0][2] if filtered else None

    def patch_data(self, site):
        # This seems wrong. We should allow a GeoJSON to be supplied as an object,
        # not already serialized?
        for loc in site["aliased_data"]["heritage_site_location"]:
            for sb in loc["aliased_data"]["site_boundary"]:
                print(sb["aliased_data"]["site_boundary"])
                if (
                    "bbox"
                    in sb["aliased_data"]["site_boundary"]["node_value"]["features"][0][
                        "geometry"
                    ]
                ):
                    print(
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

        site["aliased_data"].pop("borden_number")
        site["aliased_data"]["bc_right"]["aliased_data"]["registration_status"][
            "node_value"
        ] = self.get_default_registration_status_uuid()
        site["aliased_data"]["bc_right"]["aliased_data"]["registry_types"][
            "node_value"
        ] = [self.get_default_registry_type_uuid()]

    def prune_data(self, site):
        allowed_sections = self.required_sections + self.optional_sections
        for key in site.keys():
            if key not in allowed_sections:
                site.pop(key)

    def create(self, request, *args, **kwargs):
        raw = request.data
        print(f"Raw: {raw}")
        # cleaned_object = {
        #     "aliased_data": {
        #         "project_details": raw.get("aliased_data")["project_details"],
        #         "assessment_details": raw.get("aliased_data")["assessment_details"],
        #     },
        # }
        cleaned_object = raw
        logger.info("FILES keys=%s", list(request.FILES.keys()))

        for field_name, f in request.FILES.items():  # one file per field
            logger.info(
                "file field=%s name=%s size=%s content_type=%s",
                field_name,
                f.name,
                f.size,
                getattr(f, "content_type", None),
            )
        logger.info(f"Before clean")
        self.patch_data(cleaned_object)
        patched = cleaned_object
        # logger.info(f"After clean")
        # print(f"\n\n\nCleaned: {patched}\n\n\n")
        # for loc in raw["aliased_data"]["heritage_site_location"]:
        #     for sb in loc["aliased_data"]["site_boundary"]:
        #         print(sb["aliased_data"]["site_boundary"])
        #         print(
        #             sb["aliased_data"]["site_boundary"]["node_value"]["features"][0][
        #                 "geometry"
        #             ].pop("bbox")
        #         )
        #         sb["aliased_data"]["site_boundary"][
        #             "node_value"
        #         ] = JSONSerializer().serialize(
        #             sb["aliased_data"]["site_boundary"]["node_value"]
        #         )
        serializer = self.get_serializer(data=patched)
        logger.info(f"After get_serializer")

        logger.info(f"Checking valid")
        # serializer.debug_validation()
        # inspect_nested_data(raw)

        if not serializer.is_valid():
            # print the errors you’re currently not seeing
            print("serializer.errors:", serializer.errors)
            for error in format_deep_errors(serializer.errors):
                print(f" - {error}")

            return JSONResponse(serializer.errors, status=400)
        serializer.is_valid(raise_exception=True)
        logger.info("It's valid again")
        try:
            logger.info("Before perform_create")
            self.perform_create(serializer)
            logger.info("Created")
        except Exception as e:
            print(f"Unable to create: {e}")
            traceback.print_exc()
            return JSONResponse(
                {
                    "error": "Unable to create resource",
                    "message": str(e),
                    "type": e.__class__.__name__,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        logger.info("Created successfully... getting headers")
        headers = self.get_success_headers(serializer.data)
        logger.info("Got headers, returning JSON response")
        return JSONResponse(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )


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
