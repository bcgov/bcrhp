import os

from django.db import migrations, models
from bcrhp.migrations.util.migration_util import format_files_into_sql
from bcgov_arches_common.migrations.operations.privileged_sql import RunPrivilegedSQL
from bcrhp.settings import DATABASES


class Migration(migrations.Migration):

    replaces = [
        ("bcrhp", "0001_initial"),
        ("bcrhp", "0002_alter_crhpexportdata_table"),
    ]

    initial = True

    arches_db_name = DATABASES["default"]["NAME"]
    arches_db_user = DATABASES["default"]["USER"]
    db_databc_user = DATABASES["default"]["DATABC_USERNAME"]
    db_databc_password = DATABASES["default"]["DATABC_PASSWORD"]
    sql_dir = os.path.join(os.path.dirname(__file__), "sql", "2024")

    dependencies = []

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
        RunPrivilegedSQL("create schema databc;", " drop schema databc;"),
        RunPrivilegedSQL(
            f"""
                 grant all privileges on schema databc to {arches_db_user};
                 """,
            migrations.RunSQL.noop,
        ),
        RunPrivilegedSQL(
            f"""
                   DO
                   $$
                       DECLARE
                           databc_role_exists boolean;
                       BEGIN
                           select count(*) > 0 into databc_role_exists from pg_roles where rolname = '{db_databc_user}';
                           if not databc_role_exists then
                               Raise NOTICE 'Creating role {db_databc_user}';
                               create role {db_databc_user} password '{db_databc_password}';
                           else
                               Raise NOTICE 'Not creating role {db_databc_user} - it already exists';
                           end if;
                           alter role {db_databc_user} with login;
                           alter role {db_databc_user} set search_path = databc,public;
                           revoke all on schema public from {db_databc_user};
                           grant connect on database {arches_db_name} to {db_databc_user};
                           grant usage on schema databc to {db_databc_user};
                           grant select on geometry_columns TO {db_databc_user};
                           grant select on geography_columns TO {db_databc_user};
                           grant select on spatial_ref_sys TO {db_databc_user};
                       END
                   $$ language plpgsql;
               """,
            f"""
                DO
                $$
                    DECLARE
                        databc_role record;
                    BEGIN
                        for databc_role in (select rolname from pg_roles where rolname = '{db_databc_user}') loop
                            Raise NOTICE 'Dropping role {db_databc_user} and all associated grants';
                            drop owned by {db_databc_user} cascade;
                            drop role {db_databc_user};
                        end loop;
                    END
                $$ language plpgsql;
            """,
        ),
        # These were moved out of package
    ]
