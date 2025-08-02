import os
from django.db import migrations, connection
from django.core.management import call_command

import bcgov_arches_common
from bcgov_arches_common.functions import unique_boolean_value
from bcgov_arches_common.migrations.operations.privileged_sql import RunPrivilegedSQL
from django.conf import settings


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
        ("bcgov_arches_common", "2025-02-07_create_concept_functions"),
    ]

    arches_db_name = settings.DATABASES["default"]["NAME"]
    arches_db_user = settings.DATABASES["default"]["USER"]
    db_databc_user = settings.DATABASES["default"]["DATABC_USERNAME"]
    db_databc_password = settings.DATABASES["default"]["DATABC_PASSWORD"]

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
    def load_common_functions(app, someethingelse):
        call_command(
            "fn",
            operation="register",
            source=unique_boolean_value.__file__,
        )

    @staticmethod
    def load_common_widgets(app, someethingelse):
        call_command(
            "widget",
            operation="register",
            source=os.path.join(
                os.path.dirname(bcgov_arches_common.__file__),
                "widgets",
                "checkbox-boolean-widget.json",
            ),
        )

    @staticmethod
    def load_package(app, someethingelse):
        call_command(
            "packages",
            operation="load_package",
            source=f"{settings.APP_ROOT}/pkg",
            yes=True,
        )
        call_command("graph", operation="publish")
        with connection.cursor() as cursor:
            cursor.execute(Migration.create_resource_proxy_views_sql)
            rows = cursor.fetchall()
            for row in rows:
                print(row)

    @staticmethod
    def create_cache(app, somethingelse):
        call_command("createcachetable")

    operations = [
        RunPrivilegedSQL("create schema if not exists databc;", " drop schema databc;"),
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
        migrations.RunPython(create_cache, migrations.RunPython.noop),
        migrations.RunPython(load_common_functions, migrations.RunPython.noop),
        migrations.RunPython(load_common_widgets, migrations.RunPython.noop),
        migrations.RunPython(load_package, migrations.RunPython.noop),
        # migrations.RunSQL(
        #     create_resource_proxy_views_sql,
        #     migrations.RunSQL.noop,
        # ),
        # migrations.RunSQL(
        #     format_sql(create_node_aliases_function_file),
        #     migrations.RunSQL.noop,
        # ),
        # migrations.RunSQL(
        #     create_node_aliases_sql,
        #     migrations.RunSQL.noop,
        # ),
    ]
