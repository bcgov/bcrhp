from django.contrib.auth.models import Group, User
from django.core.cache import caches
from django.db import migrations
from django.db.models import Q
from guardian.shortcuts import assign_perm, remove_perm

from arches.app.models.models import Node

lg_nodes = [
    ("heritage_site", "internal_remark"),
    ("heritage_site", "site_record_admin"),
    ("heritage_site_historical_data", "decision_history_n1"),
    ("lg_person", "contact_information"),
    ("lg_person", "government_association"),
    ("lg_person", "government_person_name"),
    ("lg_person", "username"),
    ("project_sandbox", "project_boundary"),
    ("project_sandbox", "sandcastle_project"),
]

guest_nodes = [
    ("heritage_site", "internal_remark"),
    ("heritage_site", "site_record_admin"),
]


def get_nodegroups(pairs):
    query = Q()
    for slug, alias in pairs:
        query |= Q(graph__slug=slug, alias=alias)

    nodes = list(Node.objects.filter(query).select_related("graph"))
    return [node.nodegroup for node in nodes]


def guest_forwards(apps, schema_editor):
    groups = Group.objects.filter(name="Guest").all()

    for nodegroup in get_nodegroups(guest_nodes):
        for group in groups:
            assign_perm("no_access_to_nodegroup", group, nodegroup)
    user_permission_cache = caches["user_permission"]
    if user_permission_cache:
        user_permission_cache.clear()


def guest_backwards(apps, schema_editor):
    groups = Group.objects.filter(name="Guest").all()
    nodegroups = get_nodegroups(guest_nodes)
    for nodegroup in nodegroups:
        for group in groups:
            remove_perm("no_access_to_nodegroup", group, nodegroup)
    user_permission_cache = caches["user_permission"]
    if user_permission_cache:
        user_permission_cache.clear()


def lg_forwards(apps, schema_editor):
    groups = Group.objects.filter(name="Local Government").all()

    for nodegroup in get_nodegroups(lg_nodes):
        for group in groups:
            assign_perm("no_access_to_nodegroup", group, nodegroup)
    user_permission_cache = caches["user_permission"]
    if user_permission_cache:
        user_permission_cache.clear()


def lg_backwards(apps, schema_editor):
    groups = Group.objects.filter(name="Local Government").all()
    nodegroups = get_nodegroups(lg_nodes)
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
        ("models", "12343_generate_geom_feature_id"),
    ]

    operations = [
        migrations.RunPython(guest_forwards, guest_backwards),
        migrations.RunPython(lg_forwards, lg_backwards),
    ]
