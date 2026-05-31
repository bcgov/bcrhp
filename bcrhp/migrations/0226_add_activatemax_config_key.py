from django.db import migrations
from arches.app.models import models


def add_config_entry(apps, schema_editor):
    cnws = (
        models.CardXNodeXWidget.objects.filter(node__datatype__contains="file")
        .prefetch_related("node")
        .all()
    )

    for cnw in cnws:
        cnw.node.config["activateMax"] = True
        cnw.node.save()


def remove_config_key(apps, schema_editor):
    cnws = (
        models.CardXNodeXWidget.objects.filter(node__datatype__contains="file")
        .prefetch_related("node")
        .all()
    )

    for cnw in cnws:
        if "activateMax" in cnw.node.config:
            cnw.node.config.pop("activateMax")
            cnw.node.save()


class Migration(migrations.Migration):

    dependencies = [
        ("bcrhp", "0206_guest_no_access_admin_nodegroups"),
    ]

    operations = [migrations.RunPython(add_config_entry, remove_config_key)]
