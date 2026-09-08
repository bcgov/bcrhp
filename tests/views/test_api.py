"""
Unit tests for bcrhp/views/api.py
"""

import json
from unittest.mock import MagicMock, patch

from django.http import Http404
from django.test import TestCase, RequestFactory

from bcrhp.views.api import BordenNumber, LegislativeAct, UserProfile, MVT

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _unwrap(func):
    """Return the innermost function, bypassing @wraps-style decorators."""
    while hasattr(func, "__wrapped__"):
        func = func.__wrapped__
    return func


def _mock_request(factory, method="GET", **params):
    request = factory.get("/", params) if method == "GET" else factory.post("/", params)
    request.user = MagicMock()
    request.user.username = "testuser"
    return request


class _UserWithoutProfile:
    """Plain user object that has no userprofile attribute."""

    pk = 1
    username = "test"


# ===========================================================================
# BordenNumber
# ===========================================================================


class BordenNumberTest(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.view = BordenNumber()
        self.view.api = MagicMock()

    def _get(self):
        return _mock_request(self.factory)

    def test_success_returns_status_and_number(self):
        self.view.api.get_next_borden_number.return_value = "DkSf-1"
        response = self.view.get(self._get(), "resource-id")
        body = json.loads(response.content)
        self.assertEqual(body["status"], "success")
        self.assertEqual(body["borden_number"], "DkSf-1")

    def test_success_is_200(self):
        self.view.api.get_next_borden_number.return_value = "DkSf-1"
        self.assertEqual(self.view.get(self._get(), "resource-id").status_code, 200)

    def test_exception_returns_fail_status(self):
        self.view.api.get_next_borden_number.side_effect = Exception("API error")
        response = self.view.get(self._get(), "resource-id")
        body = json.loads(response.content)
        self.assertEqual(body["status"], "fail")

    def test_exception_returns_empty_borden_number(self):
        self.view.api.get_next_borden_number.side_effect = Exception("API error")
        response = self.view.get(self._get(), "resource-id")
        body = json.loads(response.content)
        self.assertEqual(body["borden_number"], "")

    def test_exception_is_still_200(self):
        self.view.api.get_next_borden_number.side_effect = Exception("API error")
        self.assertEqual(self.view.get(self._get(), "resource-id").status_code, 200)

    def test_resourceinstanceid_passed_to_api(self):
        self.view.api.get_next_borden_number.return_value = "X"
        self.view.get(self._get(), "my-resource-id")
        self.view.api.get_next_borden_number.assert_called_once_with("my-resource-id")


# ===========================================================================
# LegislativeAct
# ===========================================================================


class LegislativeActTest(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.view = LegislativeAct()

    @patch("bcrhp.views.api.LegislativeActDataProxy")
    def test_returns_200(self, mock_cls):
        mock_cls.return_value.get_authorities.return_value = []
        response = self.view.get(_mock_request(self.factory), act_id="abc")
        self.assertEqual(response.status_code, 200)

    @patch("bcrhp.views.api.LegislativeActDataProxy")
    def test_calls_get_authorities_with_act_id(self, mock_cls):
        mock_cls.return_value.get_authorities.return_value = []
        self.view.get(_mock_request(self.factory), act_id="act-42")
        mock_cls.return_value.get_authorities.assert_called_once_with("act-42")

    @patch("bcrhp.views.api.LegislativeActDataProxy")
    def test_response_contains_authorities(self, mock_cls):
        mock_cls.return_value.get_authorities.return_value = [{"name": "Act 1"}]
        response = self.view.get(_mock_request(self.factory), act_id="abc")
        body = json.loads(response.content)
        self.assertEqual(body[0]["name"], "Act 1")


# ===========================================================================
# UserProfile
# ===========================================================================


class UserProfileViewTest(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.view = UserProfile()

    @patch("bcrhp.views.api.models")
    def test_returns_200(self, mock_models):
        mock_user = MagicMock(username="jdoe", first_name="John", last_name="Doe")
        mock_models.User.objects.get.return_value = mock_user
        mock_models.Group.objects.filter.return_value.all.return_value = []
        request = _mock_request(self.factory)
        self.assertEqual(self.view.get(request).status_code, 200)

    @patch("bcrhp.views.api.models")
    def test_response_includes_username(self, mock_models):
        mock_user = MagicMock(username="jdoe", first_name="John", last_name="Doe")
        mock_models.User.objects.get.return_value = mock_user
        mock_models.Group.objects.filter.return_value.all.return_value = []
        response = self.view.get(_mock_request(self.factory))
        self.assertEqual(json.loads(response.content)["username"], "jdoe")

    @patch("bcrhp.views.api.models")
    def test_response_includes_group_names(self, mock_models):
        mock_user = MagicMock(username="u", first_name="", last_name="")
        mock_models.User.objects.get.return_value = mock_user
        grp = MagicMock()
        grp.name = "Resource Editor"
        mock_models.Group.objects.filter.return_value.all.return_value = [grp]
        response = self.view.get(_mock_request(self.factory))
        self.assertIn("Resource Editor", json.loads(response.content)["groups"])

    @patch("bcrhp.views.api.models")
    def test_looks_up_user_by_pk(self, mock_models):
        mock_user = MagicMock(username="u", first_name="", last_name="")
        mock_models.User.objects.get.return_value = mock_user
        mock_models.Group.objects.filter.return_value.all.return_value = []
        request = _mock_request(self.factory)
        request.user.pk = 99
        self.view.get(request)
        mock_models.User.objects.get.assert_called_once_with(id=99)


# ===========================================================================
# MVT
# ===========================================================================


class MVTViewTest(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.view = MVT()

    def _user_with_profile(self):
        user = MagicMock()
        user.userprofile = MagicMock()
        user.userprofile.viewable_nodegroups = []
        return user

    @patch("bcrhp.views.api.MVTTiler")
    @patch("bcrhp.views.api.models")
    def test_creates_userprofile_when_missing(self, mock_models, mock_tiler_cls):
        tile_data = b"tile"
        mock_tiler_cls.return_value.createTile.return_value = tile_data

        user = _UserWithoutProfile()

        def _attach_profile(**kwargs):
            user.userprofile = MagicMock()
            user.userprofile.viewable_nodegroups = []

        mock_models.UserProfile.objects.create.side_effect = _attach_profile

        request = self.factory.get("/")
        request.user = user
        self.view.get(request, "node-id", 10, 1, 1)

        mock_models.UserProfile.objects.create.assert_called_once_with(user=user)

    @patch("bcrhp.views.api.MVTTiler")
    def test_does_not_create_profile_when_present(self, mock_tiler_cls):
        mock_tiler_cls.return_value.createTile.return_value = b"tile"
        request = self.factory.get("/")
        request.user = self._user_with_profile()
        with patch("bcrhp.views.api.models") as mock_models:
            self.view.get(request, "node-id", 10, 1, 1)
            mock_models.UserProfile.objects.create.assert_not_called()

    @patch("bcrhp.views.api.MVTTiler")
    def test_raises_404_for_empty_tile(self, mock_tiler_cls):
        mock_tiler_cls.return_value.createTile.return_value = b""
        request = self.factory.get("/")
        request.user = self._user_with_profile()
        with self.assertRaises(Http404):
            self.view.get(request, "node-id", 10, 1, 1)

    @patch("bcrhp.views.api.MVTTiler")
    def test_raises_404_for_none_tile(self, mock_tiler_cls):
        mock_tiler_cls.return_value.createTile.return_value = None
        request = self.factory.get("/")
        request.user = self._user_with_profile()
        with self.assertRaises(Http404):
            self.view.get(request, "node-id", 10, 1, 1)

    @patch("bcrhp.views.api.MVTTiler")
    def test_returns_protobuf_content_type(self, mock_tiler_cls):
        mock_tiler_cls.return_value.createTile.return_value = b"valid"
        request = self.factory.get("/")
        request.user = self._user_with_profile()
        response = self.view.get(request, "node-id", 10, 1, 1)
        self.assertEqual(response["Content-Type"], "application/x-protobuf")

    @patch("bcrhp.views.api.MVTTiler")
    def test_returns_200(self, mock_tiler_cls):
        mock_tiler_cls.return_value.createTile.return_value = b"valid"
        request = self.factory.get("/")
        request.user = self._user_with_profile()
        self.assertEqual(self.view.get(request, "node-id", 10, 1, 1).status_code, 200)
