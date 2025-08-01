import bcgov_arches_common.migrations.operations.privileged_sql
from django.db import migrations
from django.core.management import call_command
from bcgov_arches_common.migrations.operations.privileged_sql import RunPrivilegedSQL
from django.conf import settings
import os


def format_sql(file_path: str, params: dict = None) -> str:
    with open(os.path.join(os.path.dirname(__file__), "..", file_path)) as file:
        sql_string = file.read()
        return sql_string.format(**params) if params else sql_string


class Migration(migrations.Migration):
    replaces = [
        ("bcrhp", "0003_create_databc_proxy_role"),
    ]
    dependencies = [
        ("bcrhp", "0001_initial_pre_package"),
    ]

    create_resource_proxy_views_sql = """
        select __arches_create_resource_model_views(graphid)
            from graphs
            where isresource = true
              and publicationid is not null
              and name->>'en' != 'Arches System Settings';
        """

    # create_node_aliases_function_file = os.path.join(
    #     "sql", "2024", "2024-12-02___bc_create_node_aliases.sql"
    # )
    # sql_dir = os.path.join(os.path.dirname(__file__), "sql")

    # create_node_aliases_sql = """
    #     call __bc_create_node_aliases('collection_event', 'fossil_collection_event');
    #     call __bc_create_node_aliases('fossil_sample');
    #     call __bc_create_node_aliases('fossil_type');
    #     call __bc_create_node_aliases('storage_location','fossil_storage_location');
    #     call __bc_create_node_aliases('publication');
    #     call __bc_create_node_aliases('contributor');
    # """

    @staticmethod
    def load_package(app, someethingelse):
        call_command(
            "packages",
            operation="load_package",
            source=f"{settings.APP_ROOT}/pkg",
            yes=True,
        )

    @staticmethod
    def create_cache(app, somethingelse):
        call_command("createcachetable")

    operations = [
        bcgov_arches_common.migrations.operations.privileged_sql.RunPrivilegedSQL(
            sql="\n        create schema databc;\n    ",
            reverse_sql="\n        drop schema databc;\n    ",
        ),
        bcgov_arches_common.migrations.operations.privileged_sql.RunPrivilegedSQL(
            sql="\n        grant all privileges on schema databc to postgres;\n    ",
            reverse_sql="",
        ),
        bcgov_arches_common.migrations.operations.privileged_sql.RunPrivilegedSQL(
            sql="\n        DO\n        $$\n            DECLARE\n                databc_role_exists boolean;\n            BEGIN\n                select count(*) > 0 into databc_role_exists from pg_roles where rolname = 'proxy_databc';\n                if not databc_role_exists then\n                    Raise NOTICE 'Creating role proxy_databc';\n                    create role proxy_databc password 'None';\n                else\n                    Raise NOTICE 'Not creating role proxy_databc - it already exists';\n                end if;\n                alter role proxy_databc with login;\n                alter role proxy_databc set search_path = databc,public;\n                revoke all on schema public from proxy_databc;\n                grant connect on database bcrhp to proxy_databc;\n                grant usage on schema databc to proxy_databc;\n                grant select on geometry_columns TO proxy_databc;\n                grant select on geography_columns TO proxy_databc;\n                grant select on spatial_ref_sys TO proxy_databc;\n            END\n        $$ language plpgsql;\n    ",
            reverse_sql="\n        DO\n        $$\n            DECLARE\n                databc_role record;\n            BEGIN\n                for databc_role in (select rolname from pg_roles where rolname = 'proxy_databc') loop\n                    Raise NOTICE 'Dropping role proxy_databc and all associated grants';\n                    drop owned by proxy_databc cascade;\n                    drop role proxy_databc;\n                end loop;\n            END\n        $$ language plpgsql;\n    ",
        ),
        migrations.RunPython(create_cache, migrations.RunPython.noop),
        migrations.RunPython(load_package, migrations.RunPython.noop),
        migrations.RunSQL(
            create_resource_proxy_views_sql,
            migrations.RunSQL.noop,
        ),
        # migrations.RunSQL(
        #     format_sql(create_node_aliases_function_file),
        #     migrations.RunSQL.noop,
        # ),
        # migrations.RunSQL(
        #     create_node_aliases_sql,
        #     migrations.RunSQL.noop,
        # ),
    ]
