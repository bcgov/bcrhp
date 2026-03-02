import os

from django.db import migrations, models
from bcrhp.migrations.util.migration_util import format_files_into_sql


class Migration(migrations.Migration):

    replaces = [
        ("bcrhp", "0001_initial"),
        ("bcrhp", "0002_alter_crhpexportdata_table"),
    ]

    initial = True

    sql_dir = os.path.join(os.path.dirname(__file__), "sql", "2024")

    dependencies = [("models", "11499_add_editlog_resourceinstance_idx")]

    operations = [
        migrations.CreateModel(
            name="CrhpExportData",
            fields=[
                (
                    "resourceinstanceid",
                    models.UUIDField(primary_key=True, serialize=False),
                ),
                ("site_descriptors", models.JSONField()),
                ("borden_number", models.CharField()),
                ("site_names", models.JSONField()),
                ("sos", models.JSONField()),
                ("addresses", models.JSONField()),
                ("site_boundary", models.IntegerField()),
                ("boundary_geojson", models.CharField()),
                ("site_centroid_latitude", models.FloatField()),
                ("site_centroid_longitude", models.FloatField()),
                ("area_sqm", models.DecimalField(decimal_places=5, max_digits=12)),
                ("heritage_categories", models.JSONField()),
                ("heritage_functions", models.JSONField()),
                ("significant_events", models.JSONField()),
                ("construction_actors", models.JSONField()),
                ("heritage_themes", models.JSONField()),
                ("registration_status", models.CharField()),
                ("registry_types", models.JSONField()),
                ("officially_recognized_site", models.BooleanField()),
                ("protection_events", models.JSONField()),
                ("site_images", models.JSONField()),
                ("external_urls", models.JSONField()),
            ],
            options={
                "db_table": "",
                "managed": False,
            },
        ),
        migrations.AlterModelTable(
            name="crhpexportdata",
            table="bcrhp_crhp_data_vw",
        ),
        # These were moved from packages/preliminary_sql
        migrations.RunSQL(
            format_files_into_sql(["2024-02-08__get_map_attribute_data.sql"], sql_dir),
            migrations.RunSQL.noop,
        ),
        migrations.RunSQL(
            "update languages set isdefault = false where code <> 'en';",
            migrations.RunSQL.noop,
        ),
        migrations.RunSQL(
            """
                update search_component set modulename = 'bc_map_filter.py',
                    classname = 'BCMapFilter'
                    where searchcomponentid = '09d97fc6-8c83-4319-9cef-3aaa08c3fbec';
            """,
            migrations.RunSQL.noop,
        ),
    ]
