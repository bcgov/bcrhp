"""
Tests for bcrhp.views.workflows.heritage_site_submissions
"""

import json
import uuid
from unittest.mock import MagicMock, patch, call

from django.test import TestCase, RequestFactory

from bcrhp.views.workflows.heritage_site_submissions import (
    format_deep_errors,
    inspect_nested_data,
    PatchedArchesResourceBlankView,
    SubmitHeritageSite,
)

# ---------------------------------------------------------------------------
# format_deep_errors
# ---------------------------------------------------------------------------


class FormatDeepErrorsTest(TestCase):
    def test_empty_dict_returns_empty_list(self):
        self.assertEqual(format_deep_errors({}), [])

    def test_flat_string_values(self):
        errors = {"name": "This field is required."}
        result = format_deep_errors(errors)
        self.assertEqual(result, ["name: This field is required."])

    def test_flat_list_of_strings(self):
        errors = {"email": ["Enter a valid email.", "This field may not be blank."]}
        result = format_deep_errors(errors)
        self.assertIn("email: Enter a valid email.", result)
        self.assertIn("email: This field may not be blank.", result)

    def test_nested_dict_builds_dotted_path(self):
        errors = {"outer": {"inner": "bad value"}}
        result = format_deep_errors(errors)
        self.assertEqual(result, ["outer.inner: bad value"])

    def test_deeply_nested_dict(self):
        errors = {"a": {"b": {"c": "error"}}}
        result = format_deep_errors(errors)
        self.assertEqual(result, ["a.b.c: error"])

    def test_list_of_dicts_recurses(self):
        errors = {"items": [{"field": "required"}, {"other": "invalid"}]}
        result = format_deep_errors(errors)
        self.assertIn("items.field: required", result)
        self.assertIn("items.other: invalid", result)

    def test_path_prefix_prepended(self):
        errors = {"name": "error"}
        result = format_deep_errors(errors, path="root")
        self.assertEqual(result, ["root.name: error"])

    def test_mixed_list_items(self):
        errors = {"field": ["string error", {"nested": "dict error"}]}
        result = format_deep_errors(errors)
        self.assertIn("field: string error", result)
        self.assertIn("field.nested: dict error", result)

    def test_non_string_scalar_in_list(self):
        # Non-string, non-dict items in lists are still included
        errors = {"field": [42]}
        result = format_deep_errors(errors)
        self.assertEqual(result, ["field: 42"])


# ---------------------------------------------------------------------------
# inspect_nested_data
# ---------------------------------------------------------------------------


class InspectNestedDataTest(TestCase):
    """
    inspect_nested_data only prints; tests verify it runs without error for
    every branch and honours the max_depth guard.
    """

    def test_dict_input(self):
        inspect_nested_data({"key": "value"})

    def test_list_input_single_item(self):
        inspect_nested_data(["only"])

    def test_list_input_multiple_items(self):
        inspect_nested_data(["first", "second", "third"])

    def test_scalar_input(self):
        inspect_nested_data("a string")
        inspect_nested_data(42)
        inspect_nested_data(None)

    def test_max_depth_guard(self):
        # Deeply nested structure; should stop recursing and print the guard message
        deep = {}
        node = deep
        for _ in range(15):
            node["child"] = {}
            node = node["child"]
        inspect_nested_data(deep, max_depth=5)  # should not raise


# ---------------------------------------------------------------------------
# PatchedArchesResourceBlankView.get_serializer_context
# ---------------------------------------------------------------------------


class PatchedArchesResourceBlankViewTest(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.view = PatchedArchesResourceBlankView()

    def _attach_request(self, query_string=""):
        request = self.factory.get(f"/?{query_string}")
        self.view.request = request
        self.view.kwargs = {}
        self.view.format_kwarg = None

    def test_fill_blanks_true(self):
        self._attach_request("fill_blanks=true")
        with patch.object(
            PatchedArchesResourceBlankView.__bases__[0],
            "get_serializer_context",
            return_value={},
        ):
            ctx = self.view.get_serializer_context()
        self.assertTrue(ctx["fill_blanks"])

    def test_fill_blanks_false(self):
        self._attach_request("fill_blanks=false")
        with patch.object(
            PatchedArchesResourceBlankView.__bases__[0],
            "get_serializer_context",
            return_value={},
        ):
            ctx = self.view.get_serializer_context()
        self.assertFalse(ctx["fill_blanks"])

    def test_fill_blanks_missing(self):
        self._attach_request()
        with patch.object(
            PatchedArchesResourceBlankView.__bases__[0],
            "get_serializer_context",
            return_value={},
        ):
            ctx = self.view.get_serializer_context()
        self.assertFalse(ctx["fill_blanks"])

    def test_fill_blanks_case_insensitive(self):
        self._attach_request("fill_blanks=TRUE")
        with patch.object(
            PatchedArchesResourceBlankView.__bases__[0],
            "get_serializer_context",
            return_value={},
        ):
            ctx = self.view.get_serializer_context()
        self.assertTrue(ctx["fill_blanks"])


# ---------------------------------------------------------------------------
# SubmitHeritageSite.prune_data
# ---------------------------------------------------------------------------


class PruneDataTest(TestCase):
    def setUp(self):
        self.view = SubmitHeritageSite()

    def _site(self, keys):
        return {"aliased_data": {k: f"value_{k}" for k in keys}}

    def test_required_section_preserved(self):
        site = self._site(["heritage_site_location"])
        self.view.prune_data(site)
        self.assertIn("heritage_site_location", site["aliased_data"])

    def test_optional_section_preserved(self):
        site = self._site(["site_document"])
        self.view.prune_data(site)
        self.assertIn("site_document", site["aliased_data"])

    def test_unknown_section_removed(self):
        site = self._site(["unknown_section", "heritage_site_location"])
        self.view.prune_data(site)
        self.assertNotIn("unknown_section", site["aliased_data"])
        self.assertIn("heritage_site_location", site["aliased_data"])

    def test_all_required_sections_preserved(self):
        site = self._site(self.view.required_sections)
        self.view.prune_data(site)
        for key in self.view.required_sections:
            self.assertIn(key, site["aliased_data"])

    def test_all_optional_sections_preserved(self):
        site = self._site(self.view.optional_sections)
        self.view.prune_data(site)
        for key in self.view.optional_sections:
            self.assertIn(key, site["aliased_data"])

    def test_empty_aliased_data_unchanged(self):
        site = {"aliased_data": {}}
        self.view.prune_data(site)
        self.assertEqual(site["aliased_data"], {})


# ---------------------------------------------------------------------------
# SubmitHeritageSite.patch_data
# ---------------------------------------------------------------------------


def _make_site(feature_id=None, include_bbox=True):
    """Build a minimal site payload for patch_data testing."""
    if feature_id is None:
        feature_id = str(uuid.uuid4())
    geometry = {"type": "Polygon", "coordinates": [[[0, 0], [1, 0], [1, 1], [0, 0]]]}
    if include_bbox:
        geometry["bbox"] = [0, 0, 1, 1]
    return {
        "aliased_data": {
            "heritage_site_location": [
                {
                    "aliased_data": {
                        "site_boundary": [
                            {
                                "aliased_data": {
                                    "site_boundary": {
                                        "node_value": {
                                            "features": [
                                                {"id": feature_id, "geometry": geometry}
                                            ]
                                        }
                                    }
                                }
                            }
                        ]
                    }
                }
            ],
            "borden_number": "DkSf-1",
            "bc_right": {
                "aliased_data": {
                    "registration_status": {"node_value": None},
                    "registry_types": {"node_value": None},
                    "officially_recognized_site": {"node_value": None},
                }
            },
            "internal_remark": [
                {
                    "aliased_data": {
                        "remark_type": {
                            "node_value": None,
                            "display_value": "",
                            "details": None,
                        }
                    }
                }
            ],
        }
    }


class PatchDataTest(TestCase):
    def setUp(self):
        self.view = SubmitHeritageSite()
        self.reg_uuid = str(uuid.uuid4())
        self.reg_type_uuid = str(uuid.uuid4())
        self.remark_type_uuid = str(uuid.uuid4())
        self.view.get_default_registration_status_uuid = MagicMock(
            return_value=self.reg_uuid
        )
        self.view.get_default_registry_type_uuid = MagicMock(
            return_value=self.reg_type_uuid
        )
        self.view.get_default_remark_type_uuid = MagicMock(
            return_value=self.remark_type_uuid
        )

    def _get_feature(self, site):
        return site["aliased_data"]["heritage_site_location"][0]["aliased_data"][
            "site_boundary"
        ][0]["aliased_data"]["site_boundary"]["node_value"]["features"][0]

    def test_bbox_removed_from_geometry(self):
        site = _make_site(include_bbox=True)
        self.view.patch_data(site)
        # node_value is serialized to a JSON string by patch_data
        node_value = json.loads(
            site["aliased_data"]["heritage_site_location"][0]["aliased_data"][
                "site_boundary"
            ][0]["aliased_data"]["site_boundary"]["node_value"]
        )
        self.assertNotIn("bbox", node_value["features"][0]["geometry"])

    def test_no_bbox_is_fine(self):
        site = _make_site(include_bbox=False)
        self.view.patch_data(site)  # should not raise

    def test_non_uuid_feature_id_replaced(self):
        site = _make_site(feature_id="cadastral-non-uuid-id")
        self.view.patch_data(site)
        node_value_str = site["aliased_data"]["heritage_site_location"][0][
            "aliased_data"
        ]["site_boundary"][0]["aliased_data"]["site_boundary"]["node_value"]
        node_value = json.loads(node_value_str)
        new_id = node_value["features"][0]["id"]
        # Must be a valid UUID now
        uuid.UUID(new_id)

    def test_valid_uuid_feature_id_preserved(self):
        original_id = str(uuid.uuid4())
        site = _make_site(feature_id=original_id)
        self.view.patch_data(site)
        node_value_str = site["aliased_data"]["heritage_site_location"][0][
            "aliased_data"
        ]["site_boundary"][0]["aliased_data"]["site_boundary"]["node_value"]
        node_value = json.loads(node_value_str)
        self.assertEqual(node_value["features"][0]["id"], original_id)

    def test_node_value_serialized_to_string(self):
        site = _make_site()
        self.view.patch_data(site)
        node_value = site["aliased_data"]["heritage_site_location"][0]["aliased_data"][
            "site_boundary"
        ][0]["aliased_data"]["site_boundary"]["node_value"]
        self.assertIsInstance(node_value, str)

    def test_borden_number_removed(self):
        site = _make_site()
        self.view.patch_data(site)
        self.assertNotIn("borden_number", site["aliased_data"])

    def test_registration_status_set(self):
        site = _make_site()
        self.view.patch_data(site)
        status = site["aliased_data"]["bc_right"]["aliased_data"][
            "registration_status"
        ]["node_value"]
        self.assertEqual(status, self.reg_uuid)

    def test_registry_types_set_as_list(self):
        site = _make_site()
        self.view.patch_data(site)
        types = site["aliased_data"]["bc_right"]["aliased_data"]["registry_types"][
            "node_value"
        ]
        self.assertEqual(types, [self.reg_type_uuid])

    def test_remark_type_set_when_one_internal_remark(self):
        site = _make_site()
        self.view.patch_data(site)
        node_value = site["aliased_data"]["internal_remark"][0]["aliased_data"][
            "remark_type"
        ]["node_value"]
        self.assertEqual(node_value, self.remark_type_uuid)

    def test_remark_type_not_set_when_no_internal_remarks(self):
        site = _make_site()
        site["aliased_data"]["internal_remark"] = []
        self.view.patch_data(site)
        self.assertEqual(site["aliased_data"]["internal_remark"], [])


# ---------------------------------------------------------------------------
# SubmitHeritageSite.create
# ---------------------------------------------------------------------------


def _make_mock_request(data=None):
    """Return a MagicMock that quacks like a DRF Request for create() tests."""
    request = MagicMock()
    request.data = data if data is not None else {"aliased_data": {}}
    request.FILES = {}
    return request


class SubmitHeritageSiteCreateTest(TestCase):
    def setUp(self):
        self.view = SubmitHeritageSite()
        self.view.kwargs = {}
        self.view.format_kwarg = None

    def _make_view_with_mocks(self):
        """Return a view with patch_data and prune_data mocked."""
        self.view.patch_data = MagicMock()
        self.view.prune_data = MagicMock()
        return self.view

    def test_invalid_serializer_returns_400(self):
        view = self._make_view_with_mocks()

        mock_serializer = MagicMock()
        mock_serializer.is_valid.return_value = False
        mock_serializer.errors = {"name": ["required"]}
        view.get_serializer = MagicMock(return_value=mock_serializer)

        request = _make_mock_request()
        view.request = request

        response = view.create(request)
        self.assertEqual(response.status_code, 400)

    def test_perform_create_exception_returns_400(self):
        view = self._make_view_with_mocks()

        mock_serializer = MagicMock()
        mock_serializer.is_valid.return_value = True
        view.get_serializer = MagicMock(return_value=mock_serializer)
        view.perform_create = MagicMock(side_effect=ValueError("Something went wrong"))

        request = _make_mock_request()
        view.request = request

        response = view.create(request)
        self.assertEqual(response.status_code, 400)
        body = json.loads(response.content)
        self.assertIn("error", body)
        self.assertEqual(body["type"], "ValueError")

    def test_successful_create_returns_201(self):
        view = self._make_view_with_mocks()

        mock_serializer = MagicMock()
        mock_serializer.is_valid.return_value = True
        mock_serializer.data = {"resourceinstanceid": str(uuid.uuid4())}
        view.get_serializer = MagicMock(return_value=mock_serializer)
        view.perform_create = MagicMock()
        view.get_success_headers = MagicMock(return_value={})

        request = _make_mock_request()
        view.request = request

        response = view.create(request)
        self.assertEqual(response.status_code, 201)

    def test_patch_data_called_before_serializer(self):
        view = self._make_view_with_mocks()
        call_order = []
        view.patch_data.side_effect = lambda _: call_order.append("patch")
        view.prune_data.side_effect = lambda _: call_order.append("prune")

        mock_serializer = MagicMock()
        mock_serializer.is_valid.return_value = True
        mock_serializer.data = {}

        def record_get_serializer(*args, **kwargs):
            call_order.append("get_serializer")
            return mock_serializer

        view.get_serializer = record_get_serializer
        view.perform_create = MagicMock()
        view.get_success_headers = MagicMock(return_value={})

        request = _make_mock_request()
        view.request = request

        view.create(request)
        self.assertEqual(call_order, ["patch", "prune", "get_serializer"])


# ---------------------------------------------------------------------------
# SubmitHeritageSite.transform_retrieved_data
# ---------------------------------------------------------------------------


def _make_image(primary_value):
    return {"aliased_data": {"primary_image": {"node_value": primary_value}}}


class TransformRetrievedDataTest(TestCase):
    def setUp(self):
        self.view = SubmitHeritageSite()

    def _data(self, site_images=None, internal_remark=None):
        aliased = {}
        if site_images is not None:
            aliased["site_images"] = site_images
        if internal_remark is not None:
            aliased["internal_remark"] = internal_remark
        return {"aliased_data": aliased}

    def test_returns_same_data_object(self):
        data = self._data()
        self.assertIs(self.view.transform_retrieved_data(data), data)

    def test_no_site_images_key_untouched(self):
        data = self._data()
        self.view.transform_retrieved_data(data)
        self.assertNotIn("site_images", data["aliased_data"])

    def test_single_image_not_reordered(self):
        images = [_make_image(False)]
        data = self._data(site_images=images)
        self.view.transform_retrieved_data(data)
        self.assertEqual(data["aliased_data"]["site_images"], images)

    def test_multiple_images_true_first(self):
        images = [_make_image(False), _make_image(None), _make_image(True)]
        data = self._data(site_images=images)
        self.view.transform_retrieved_data(data)
        result = data["aliased_data"]["site_images"]
        self.assertIs(result[0]["aliased_data"]["primary_image"]["node_value"], True)

    def test_multiple_images_false_before_none(self):
        images = [_make_image(None), _make_image(True), _make_image(False)]
        data = self._data(site_images=images)
        self.view.transform_retrieved_data(data)
        result = data["aliased_data"]["site_images"]
        self.assertIs(result[1]["aliased_data"]["primary_image"]["node_value"], False)
        self.assertIsNone(result[2]["aliased_data"]["primary_image"]["node_value"])

    def test_sort_is_stable_for_equal_values(self):
        img_a = {**_make_image(False), "label": "a"}
        img_b = {**_make_image(False), "label": "b"}
        data = self._data(site_images=[img_a, img_b, _make_image(True)])
        self.view.transform_retrieved_data(data)
        false_images = [
            img
            for img in data["aliased_data"]["site_images"]
            if img["aliased_data"]["primary_image"]["node_value"] is False
        ]
        self.assertEqual(false_images[0].get("label"), "a")
        self.assertEqual(false_images[1].get("label"), "b")

    def test_internal_remark_always_cleared(self):
        remarks = [{"tileid": str(uuid.uuid4()), "aliased_data": {}}]
        data = self._data(internal_remark=remarks)
        self.view.transform_retrieved_data(data)
        self.assertEqual(data["aliased_data"]["internal_remark"], [])

    def test_site_document_always_cleared(self):
        docs = [{"tileid": str(uuid.uuid4()), "aliased_data": {}}]
        data = self._data()
        data["aliased_data"]["site_document"] = docs
        self.view.transform_retrieved_data(data)
        self.assertEqual(data["aliased_data"]["site_document"], [])

    def test_missing_primary_image_key_sorts_last(self):
        img_no_key = {"aliased_data": {}}  # no primary_image key at all
        data = self._data(site_images=[img_no_key, _make_image(True)])
        self.view.transform_retrieved_data(data)
        result = data["aliased_data"]["site_images"]
        self.assertIs(result[0]["aliased_data"]["primary_image"]["node_value"], True)


# ---------------------------------------------------------------------------
# SubmitHeritageSite.retrieve
# ---------------------------------------------------------------------------


class RetrieveTest(TestCase):
    def setUp(self):
        self.view = SubmitHeritageSite()
        self.view.kwargs = {}
        self.view.format_kwarg = None

    def _setup_view(self, serializer_data=None):
        self.view.get_object = MagicMock(return_value=MagicMock())
        mock_serializer = MagicMock()
        mock_serializer.data = serializer_data or {"aliased_data": {}}
        self.view.get_serializer = MagicMock(return_value=mock_serializer)
        self.view.request = _make_mock_request()
        return mock_serializer

    def test_returns_200(self):
        self._setup_view()
        response = self.view.retrieve(self.view.request)
        self.assertEqual(response.status_code, 200)

    def test_calls_transform_retrieved_data(self):
        mock_serializer = self._setup_view()
        self.view.transform_retrieved_data = MagicMock(
            return_value={"aliased_data": {}}
        )
        self.view.retrieve(self.view.request)
        self.view.transform_retrieved_data.assert_called_once_with(mock_serializer.data)

    def test_response_body_is_transformed_data(self):
        self._setup_view()
        sentinel = {"aliased_data": {"transformed": True}}
        self.view.transform_retrieved_data = MagicMock(return_value=sentinel)
        response = self.view.retrieve(self.view.request)
        self.assertEqual(json.loads(response.content), sentinel)


# ---------------------------------------------------------------------------
# SubmitHeritageSite._filter_new_remarks
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# SubmitHeritageSite._delete_orphaned_tiles
# ---------------------------------------------------------------------------

_PATCH_NODE = "bcrhp.views.workflows.heritage_site_submissions.Node"
_PATCH_TILE = "bcrhp.views.workflows.heritage_site_submissions.Tile"


class DeleteOrphanedTilesTest(TestCase):
    def setUp(self):
        self.view = SubmitHeritageSite()
        self.resource_id = str(uuid.uuid4())
        self.request = _make_mock_request()

    def test_skips_alias_not_in_deletable_list(self):
        # internal_remark is intentionally absent from deletable_list_aliases
        data = {"aliased_data": {"internal_remark": []}}
        with patch(_PATCH_NODE) as mock_node:
            self.view._delete_orphaned_tiles(data, self.resource_id, self.request)
            mock_node.objects.filter.assert_not_called()

    def test_skips_non_list_value(self):
        data = {"aliased_data": {"site_images": "not-a-list"}}
        with patch(_PATCH_NODE) as mock_node:
            self.view._delete_orphaned_tiles(data, self.resource_id, self.request)
            mock_node.objects.filter.assert_not_called()

    def test_skips_when_node_not_found(self):
        data = {"aliased_data": {"site_images": []}}
        with patch(_PATCH_NODE) as mock_node_cls, patch(_PATCH_TILE) as mock_tile_cls:
            mock_node_cls.objects.filter.return_value.first.return_value = None
            self.view._delete_orphaned_tiles(data, self.resource_id, self.request)
            mock_tile_cls.objects.filter.assert_not_called()

    def test_deletes_orphaned_tile(self):
        kept_id = str(uuid.uuid4())
        data = {"aliased_data": {"site_images": [{"tileid": kept_id}]}}

        mock_node = MagicMock()
        mock_node.nodegroup_id = "ng-id"

        orphan = MagicMock()
        orphan_qs = MagicMock()
        orphan_qs.count.return_value = 1
        orphan_qs.__iter__ = MagicMock(return_value=iter([orphan]))

        with patch(_PATCH_NODE) as mock_node_cls, patch(_PATCH_TILE) as mock_tile_cls:
            mock_node_cls.objects.filter.return_value.first.return_value = mock_node
            mock_tile_cls.objects.filter.return_value.exclude.return_value = orphan_qs
            self.view._delete_orphaned_tiles(data, self.resource_id, self.request)

        orphan.delete.assert_called_once_with(request=self.request)

    def test_no_orphans_means_no_delete_calls(self):
        kept_id = str(uuid.uuid4())
        data = {"aliased_data": {"site_images": [{"tileid": kept_id}]}}

        mock_node = MagicMock()
        mock_node.nodegroup_id = "ng-id"

        orphan = MagicMock()
        empty_qs = MagicMock()
        empty_qs.count.return_value = 0

        with patch(_PATCH_NODE) as mock_node_cls, patch(_PATCH_TILE) as mock_tile_cls:
            mock_node_cls.objects.filter.return_value.first.return_value = mock_node
            mock_tile_cls.objects.filter.return_value.exclude.return_value = empty_qs
            self.view._delete_orphaned_tiles(data, self.resource_id, self.request)

        orphan.delete.assert_not_called()

    def test_only_deletable_aliases_are_processed(self):
        """Aliases in deletable_list_aliases trigger a node lookup; others do not."""
        alias = next(iter(self.view.deletable_list_aliases))
        data = {"aliased_data": {alias: [], "some_other": []}}

        mock_node = MagicMock()
        mock_node.nodegroup_id = "ng-id"
        empty_qs = MagicMock()
        empty_qs.count.return_value = 0

        with patch(_PATCH_NODE) as mock_node_cls, patch(_PATCH_TILE) as mock_tile_cls:
            mock_node_cls.objects.filter.return_value.first.return_value = mock_node
            mock_tile_cls.objects.filter.return_value.exclude.return_value = empty_qs
            self.view._delete_orphaned_tiles(data, self.resource_id, self.request)

        # filter called exactly once (for the one deletable alias)
        self.assertEqual(mock_node_cls.objects.filter.call_count, 1)


# ---------------------------------------------------------------------------
# SubmitHeritageSite.partial_update
# ---------------------------------------------------------------------------


class PartialUpdateTest(TestCase):
    def setUp(self):
        self.view = SubmitHeritageSite()
        self.resource_id = str(uuid.uuid4())
        self.view.kwargs = {"resourceinstanceid": self.resource_id}
        self.view.format_kwarg = None
        # Pre-mock the methods that have external dependencies so individual
        # tests only need to override what they're interested in.
        self.view.patch_data = MagicMock()
        self.view.prune_data = MagicMock()
        self.view._delete_orphaned_tiles = MagicMock()
        self.view.get_object = MagicMock(return_value=MagicMock())

    def _make_serializer(self, valid=True, raises=None):
        mock_serializer = MagicMock()
        mock_serializer.is_valid.return_value = valid
        mock_serializer.errors = {"field": ["error"]}
        mock_serializer.data = {"resourceinstanceid": self.resource_id}
        if raises:
            self.view.perform_update = MagicMock(side_effect=raises)
        else:
            self.view.perform_update = MagicMock()
        self.view.get_serializer = MagicMock(return_value=mock_serializer)
        return mock_serializer

    def _run(self, data=None, **serializer_kwargs):
        self._make_serializer(**serializer_kwargs)
        request = _make_mock_request(data or {"aliased_data": {}})
        self.view.request = request
        return self.view.partial_update(request)

    def test_success_returns_200(self):
        self.assertEqual(self._run().status_code, 200)

    def test_invalid_serializer_returns_400(self):
        self.assertEqual(self._run(valid=False).status_code, 400)

    def test_perform_update_exception_returns_400(self):
        response = self._run(raises=RuntimeError("db error"))
        self.assertEqual(response.status_code, 400)
        body = json.loads(response.content)
        self.assertEqual(body["type"], "RuntimeError")

    def test_call_order_patch_then_prune(self):
        call_order = []
        self.view.patch_data.side_effect = lambda _: call_order.append("patch")
        self.view.prune_data.side_effect = lambda _: call_order.append("prune")
        self._run()
        self.assertEqual(call_order, ["patch", "prune"])

    def test_delete_orphaned_tiles_called(self):
        self._run()
        self.view._delete_orphaned_tiles.assert_called_once()

    def test_delete_orphaned_tiles_receives_resourceinstanceid(self):
        self._run()
        args = self.view._delete_orphaned_tiles.call_args
        self.assertEqual(args[0][1], self.resource_id)
