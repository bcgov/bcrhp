from django.contrib.auth.models import Group, User
from django.core.cache import caches
from django.db import migrations
from guardian.shortcuts import assign_perm, remove_perm

from arches.app.models.models import Node

groups_to_change = ["Guest", "Local Government"]


def forwards(apps, schema_editor):
    groups = Group.objects.filter(name__in=groups_to_change).all()
    nodegroups = [
        Node.objects.get(alias="internal_remark").nodegroup,
        Node.objects.get(alias="site_record_admin").nodegroup,
    ]
    for nodegroup in nodegroups:
        for group in groups:
            assign_perm("no_access_to_nodegroup", group, nodegroup)
    user_permission_cache = caches["user_permission"]
    if user_permission_cache:
        user_permission_cache.clear()


def backwards(apps, schema_editor):
    groups = Group.objects.filter(name__in=groups_to_change).all()
    nodegroups = [
        Node.objects.get(alias="internal_remark").nodegroup,
        Node.objects.get(alias="site_record_admin").nodegroup,
    ]
    for nodegroup in nodegroups:
        for group in groups:
            remove_perm("no_access_to_nodegroup", group, nodegroup)
    user_permission_cache = caches["user_permission"]
    if user_permission_cache:
        user_permission_cache.clear()


class Migration(migrations.Migration):

    dependencies = [
        ("bcrhp", "0186_remove_permission_functions"),
        ("guardian", "0002_generic_permissions_index"),
    ]

    operations = [migrations.RunPython(forwards, backwards)]
