from typing import Iterable

from bcrhp.util.business_data_proxy import HeritageSiteDataProxy
from arches.app.models.models import Group

from django.contrib.auth.models import User

from arches.app.models.resource import Resource
from arches.app.permissions.arches_default_deny import (
    ArchesDefaultDenyPermissionFramework,
)


class BcrhpDefaultDenyPermissionFramework(ArchesDefaultDenyPermissionFramework):
    heritage_branch_group = None

    @staticmethod
    def _get_heritage_branch_group():
        if BcrhpDefaultDenyPermissionFramework.heritage_branch_group is None:
            BcrhpDefaultDenyPermissionFramework.heritage_branch_group = (
                Group.objects.filter(name="Heritage Branch").first()
            )
        return BcrhpDefaultDenyPermissionFramework.heritage_branch_group

    def get_index_values(
        self, resource: Resource, *, all_users: Iterable[User] = User.objects.none()
    ):
        permissions = super().get_index_values(resource, all_users=all_users)
        if str(
            resource.graph_id
        ) == "cef9c510-e3e6-4057-ac08-89ad926180b4" and not HeritageSiteDataProxy().is_site_public(
            resource
        ):
            # print(f"Before {permissions}")
            permissions["groups_read"] = [self._get_heritage_branch_group().id]
            permissions["groups_edit"] = [self._get_heritage_branch_group().id]
            # print(f"After {permissions}")
        return permissions
