from arches.app.models.models import Plugin
from django.contrib.auth.models import Group
from guardian.shortcuts import assign_perm

from django.db import migrations


def add_plugin_config(apps, schema_editor):
    plugin = Plugin()
    plugin.name = {"en": "Local Government Workflows"}
    plugin.icon = "fa fa-play-circle"
    plugin.component = "views/components/plugins/workflow-list"
    plugin.componentname = "workflow-list"
    plugin.slug = "workflow-list"
    plugin.config = {"show": True, "workflows": []}
    plugin.sortorder = 0
    plugin.save()

    group = Group.objects.get(name="Local Government")
    assign_perm("view_plugin", group, plugin)


def remote_plugin_config(apps, schema_editor):
    plugin = Plugin.objects.get(slug="workflow-list")
    plugin.delete()


class Migration(migrations.Migration):

    dependencies = [
        ("bcrhp", "0003_post_package_load"),
    ]

    operations = [migrations.RunPython(add_plugin_config, remote_plugin_config)]
