from django.db import migrations
from arches.app.models.models import Plugin

SLUG = "workflow-list"
OLD_NAME = {"en": "Local Government Workflows"}
NEW_NAME = {"en": "Local Government Submissions"}


def rename_plugin(apps, schema_editor):
    Plugin.objects.filter(slug=SLUG, name=OLD_NAME).update(name=NEW_NAME)


def revert_rename_plugin(apps, schema_editor):
    Plugin.objects.filter(slug=SLUG, name=NEW_NAME).update(name=OLD_NAME)


class Migration(migrations.Migration):

    dependencies = [
        ("bcrhp", "0305_update_placeholder_text"),
    ]

    operations = [
        migrations.RunPython(rename_plugin, revert_rename_plugin),
    ]
