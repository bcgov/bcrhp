import logging
import traceback
from arches.app.utils.response import JSONResponse
from rest_framework import status
from arches_component_lab.views.node_config_mixin import CardNodeWidgetConfigMixin

from rest_framework.generics import ListCreateAPIView, CreateAPIView, UpdateAPIView
from rest_framework.parsers import JSONParser

import json
from arches_querysets.rest_framework.multipart_json_parser import MultiPartJSONParser
from arches_querysets.rest_framework.pagination import ArchesLimitOffsetPagination
from arches_querysets.rest_framework.permissions import ReadOnly, ResourceEditor
from arches_querysets.rest_framework.serializers import (
    ArchesResourceSerializer,
)
from arches_querysets.rest_framework.view_mixins import ArchesModelAPIMixin

logger = logging.getLogger(__name__)


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

    @property
    def graph_slug(self):
        return getattr(self, "_graph_slug", None) or getattr(
            self.Meta, "graph_slug", None
        )


class SubmitHeritageSite(ArchesModelAPIMixin, CardNodeWidgetConfigMixin, CreateAPIView):
    permission_classes = [ResourceEditor | ReadOnly]
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

    def patch_data(self, site):
        pass

    def prune_data(self, site):
        allowed_sections = self.required_sections + self.optional_sections
        for key in site.keys():
            if key not in allowed_sections:
                site.pop(key)

    def create(self, request, *args, **kwargs):
        raw = request.data
        # print(f"Raw: {raw}")
        # cleaned_object = {
        #     "aliased_data": {
        #         "project_details": raw.get("aliased_data")["project_details"],
        #         "assessment_details": raw.get("aliased_data")["assessment_details"],
        #     },
        # }
        cleaned_object = raw
        logger.info(f"Before clean")
        # patched = self.patch_data(cleaned_object)
        # logger.info(f"After clean")
        # print(f"\n\n\nCleaned: {patched}\n\n\n")
        serializer = self.get_serializer(data=raw)
        logger.info(f"After get_serializer")

        logger.info(f"Checking valid")
        raw["aliased_data"]["heritage_theme"] = raw["aliased_data"]["heritage_theme"][0]
        # serializer.debug_validation()
        # inspect_nested_data(raw)

        if not serializer.is_valid():
            # print the errors you’re currently not seeing
            print("serializer.errors:", serializer.errors)
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
