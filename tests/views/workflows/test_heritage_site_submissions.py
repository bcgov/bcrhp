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
                }
            },
        }
    }


class PatchDataTest(TestCase):
    def setUp(self):
        self.view = SubmitHeritageSite()
        self.reg_uuid = str(uuid.uuid4())
        self.reg_type_uuid = str(uuid.uuid4())
        self.view.get_default_registration_status_uuid = MagicMock(
            return_value=self.reg_uuid
        )
        self.view.get_default_registry_type_uuid = MagicMock(
            return_value=self.reg_type_uuid
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
