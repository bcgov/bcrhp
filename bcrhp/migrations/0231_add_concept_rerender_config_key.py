from django.db import migrations
from arches.app.models import models


def add_config_entry(apps, schema_editor):
    widgets = models.Widget.objects.filter(datatype__contains="concept")
    for widget in widgets:
        widget.defaultconfig["rerender"] = True
        widget.save()


def remove_config_key(apps, schema_editor):
    widgets = models.Widget.objects.filter(datatype__contains="concept")
    for widget in widgets:
        if "rerender" in widget.defaultconfig:
            del widget.defaultconfig["rerender"]
        widget.save()


class Migration(migrations.Migration):

    dependencies = [
        ("bcrhp", "0226_add_activatemax_config_key"),
    ]

    operations = [migrations.RunPython(add_config_entry, remove_config_key)]
