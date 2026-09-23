"""
Tests for PR #187: bcrhp.rest_framework.permissions and bcrhp.permissions.bcrhp_default_deny
"""

from unittest.mock import MagicMock, patch, PropertyMock
from django.test import TestCase, RequestFactory
from django.contrib.auth.models import User, Group

HERITAGE_SITE_GRAPH_ID = "cef9c510-e3e6-4057-ac08-89ad926180b4"


class LocalGovernmentPermissionTest(TestCase):
    """Tests for bcrhp.rest_framework.permissions.LocalGovernment"""

    def setUp(self):
        self.factory = RequestFactory()
        self.lg_group, _ = Group.objects.get_or_create(name="Local Government")

        self.lg_user = User.objects.create_user(username="lg_user", password="pw")
        self.lg_user.groups.add(self.lg_group)

        self.other_user = User.objects.create_user(username="other_user", password="pw")

    def _make_permission(self):
        from bcrhp.rest_framework.permissions import LocalGovernment

        return LocalGovernment()

    def _make_request(self, user):
        request = self.factory.get("/")
        request.user = user
        return request

    def test_local_government_member_has_permission(self):
        perm = self._make_permission()
        request = self._make_request(self.lg_user)
        self.assertTrue(perm.has_permission(request, view=None))

    def test_non_member_denied(self):
        perm = self._make_permission()
        request = self._make_request(self.other_user)
        self.assertFalse(perm.has_permission(request, view=None))

    def test_unauthenticated_user_denied(self):
        from django.contrib.auth.models import AnonymousUser

        perm = self._make_permission()
        request = self._make_request(AnonymousUser())
        self.assertFalse(perm.has_permission(request, view=None))

    def test_user_removed_from_group_loses_permission(self):
        perm = self._make_permission()
        self.lg_user.groups.remove(self.lg_group)
        request = self._make_request(self.lg_user)
        self.assertFalse(perm.has_permission(request, view=None))


class BcrhpDefaultDenyGetHeritageBranchGroupTest(TestCase):
    """Tests for BcrhpDefaultDenyPermissionFramework._get_heritage_branch_group"""

    def setUp(self):
        # Reset cached class-level value before each test
        from bcrhp.permissions.bcrhp_default_deny import (
            BcrhpDefaultDenyPermissionFramework,
        )

        BcrhpDefaultDenyPermissionFramework.heritage_branch_group = None

    def test_returns_heritage_branch_group(self):
        from bcrhp.permissions.bcrhp_default_deny import (
            BcrhpDefaultDenyPermissionFramework,
        )

        group, _ = Group.objects.get_or_create(name="Heritage Branch")
        result = BcrhpDefaultDenyPermissionFramework._get_heritage_branch_group()
        self.assertEqual(result, group)

    def test_caches_group_after_first_call(self):
        from bcrhp.permissions.bcrhp_default_deny import (
            BcrhpDefaultDenyPermissionFramework,
        )

        Group.objects.get_or_create(name="Heritage Branch")

        with patch("bcrhp.permissions.bcrhp_default_deny.Group") as mock_group_model:
            mock_group_model.objects.filter.return_value.first.return_value = MagicMock(
                id=99
            )

            # First call — hits DB (mock)
            result1 = BcrhpDefaultDenyPermissionFramework._get_heritage_branch_group()
            # Second call — should use cache, not call DB again
            result2 = BcrhpDefaultDenyPermissionFramework._get_heritage_branch_group()

            self.assertEqual(mock_group_model.objects.filter.call_count, 1)
            self.assertIs(result1, result2)

    def test_returns_none_when_group_missing(self):
        from bcrhp.permissions.bcrhp_default_deny import (
            BcrhpDefaultDenyPermissionFramework,
        )

        Group.objects.filter(name="Heritage Branch").delete()
        result = BcrhpDefaultDenyPermissionFramework._get_heritage_branch_group()
        self.assertIsNone(result)


class BcrhpDefaultDenyGetIndexValuesTest(TestCase):
    """Tests for BcrhpDefaultDenyPermissionFramework.get_index_values"""

    def setUp(self):
        from bcrhp.permissions.bcrhp_default_deny import (
            BcrhpDefaultDenyPermissionFramework,
        )

        BcrhpDefaultDenyPermissionFramework.heritage_branch_group = None
        self.hb_group, _ = Group.objects.get_or_create(name="Heritage Branch")

    def _make_framework(self):
        from bcrhp.permissions.bcrhp_default_deny import (
            BcrhpDefaultDenyPermissionFramework,
        )

        return BcrhpDefaultDenyPermissionFramework()

    def _make_resource(self, graph_id):
        resource = MagicMock()
        resource.graph_id = graph_id
        return resource

    @patch("bcrhp.permissions.bcrhp_default_deny.HeritageSiteDataProxy")
    def test_non_public_heritage_site_restricts_to_heritage_branch(
        self, mock_proxy_cls
    ):
        mock_proxy_cls.return_value.is_site_public.return_value = False
        resource = self._make_resource(HERITAGE_SITE_GRAPH_ID)

        framework = self._make_framework()
        base_permissions = {"groups_read": [1, 2], "groups_edit": [1, 2]}

        with patch.object(
            framework.__class__.__bases__[0],
            "get_index_values",
            return_value=base_permissions,
        ):
            result = framework.get_index_values(resource)

        self.assertEqual(result["groups_read"], [self.hb_group.id])
        self.assertEqual(result["groups_edit"], [self.hb_group.id])

    @patch("bcrhp.permissions.bcrhp_default_deny.HeritageSiteDataProxy")
    def test_public_heritage_site_does_not_restrict(self, mock_proxy_cls):
        mock_proxy_cls.return_value.is_site_public.return_value = True
        resource = self._make_resource(HERITAGE_SITE_GRAPH_ID)

        framework = self._make_framework()
        base_permissions = {"groups_read": [1, 2], "groups_edit": [1, 2]}

        with patch.object(
            framework.__class__.__bases__[0],
            "get_index_values",
            return_value=base_permissions,
        ):
            result = framework.get_index_values(resource)

        # Should be unchanged from base
        self.assertEqual(result["groups_read"], [1, 2])
        self.assertEqual(result["groups_edit"], [1, 2])

    @patch("bcrhp.permissions.bcrhp_default_deny.HeritageSiteDataProxy")
    def test_non_heritage_site_graph_is_unaffected(self, mock_proxy_cls):
        mock_proxy_cls.return_value.is_site_public.return_value = False
        resource = self._make_resource("00000000-0000-0000-0000-000000000000")

        framework = self._make_framework()
        base_permissions = {"groups_read": [3, 4], "groups_edit": [3, 4]}

        with patch.object(
            framework.__class__.__bases__[0],
            "get_index_values",
            return_value=base_permissions,
        ):
            result = framework.get_index_values(resource)

        # Different graph — proxy should not be consulted
        mock_proxy_cls.return_value.is_site_public.assert_not_called()
        self.assertEqual(result["groups_read"], [3, 4])
        self.assertEqual(result["groups_edit"], [3, 4])

    @patch("bcrhp.permissions.bcrhp_default_deny.HeritageSiteDataProxy")
    def test_non_public_site_does_not_affect_other_permission_keys(
        self, mock_proxy_cls
    ):
        mock_proxy_cls.return_value.is_site_public.return_value = False
        resource = self._make_resource(HERITAGE_SITE_GRAPH_ID)

        framework = self._make_framework()
        base_permissions = {
            "groups_read": [1],
            "groups_edit": [1],
            "users_read": [5],
        }

        with patch.object(
            framework.__class__.__bases__[0],
            "get_index_values",
            return_value=base_permissions,
        ):
            result = framework.get_index_values(resource)

        # Only groups_read and groups_edit should be overridden
        self.assertEqual(result["users_read"], [5])

    @patch("bcrhp.permissions.bcrhp_default_deny.HeritageSiteDataProxy")
    def test_passes_all_users_to_super(self, mock_proxy_cls):
        mock_proxy_cls.return_value.is_site_public.return_value = True
        resource = self._make_resource(HERITAGE_SITE_GRAPH_ID)
        users = User.objects.none()

        framework = self._make_framework()

        with patch.object(
            framework.__class__.__bases__[0],
            "get_index_values",
            return_value={},
        ) as mock_super:
            framework.get_index_values(resource, all_users=users)
            mock_super.assert_called_once_with(resource, all_users=users)
