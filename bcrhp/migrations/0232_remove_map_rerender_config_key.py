from django.db import migrations
from arches.app.models import models


def add_config_entry(apps, schema_editor):
    cnws = models.CardXNodeXWidget.objects.filter(
        node__datatype__contains="geojson"
    ).all()

    for cnw in cnws:
        cnw.config["rerender"] = True
        cnw.save()

    widgets = models.Widget.objects.filter(datatype__contains="geojson")
    for widget in widgets:
        widget.defaultconfig["rerender"] = True
        widget.save()


def remove_config_key(apps, schema_editor):
    cnws = models.CardXNodeXWidget.objects.filter(
        node__datatype__contains="geojson"
    ).all()

    for cnw in cnws:
        cnw.config.pop("rerender")
        cnw.save()

    widgets = models.Widget.objects.filter(datatype__contains="geojson")
    for widget in widgets:
        if "rerender" in widget.defaultconfig:
            widget.defaultconfig.pop("rerender")
            widget.save()


class Migration(migrations.Migration):

    dependencies = [
        ("bcrhp", "0231_add_concept_rerender_config_key"),
    ]

    operations = [migrations.RunPython(remove_config_key, add_config_entry)]
