from django.db import migrations
from bcgov_arches_common.migrations.operations.privileged_sql import RunPrivilegedSQL
from arches.app.models.system_settings import settings


class Migration(migrations.Migration):

    app_db_user = settings.DATABASES["default"]["USER"]
    db_name = settings.DATABASES["default"]["NAME"]
    databc_db_user = settings.DATABASES["default"]["DATABC_USER"]
    databc_db_password = settings.DATABASES["default"]["DATABC_PASSWORD"]

    dependencies = [
        ("bcrhp", "0002_alter_crhpexportdata_table"),
    ]

    create_databc_proxy_schema = """
        create schema databc;
    """

    drop_databc_proxy_schema = """
        drop schema databc;
    """

    grant_databc_proxy_schema = """
        grant all privileges on schema databc to {arches_db_user};
    """.format(
        arches_db_user=app_db_user
    )

    create_databc_proxy_role = """
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
    """.format(
        arches_db_name=db_name,
        db_databc_user=databc_db_user,
        db_databc_password=databc_db_password,
    )

    drop_databc_proxy_role = """
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
    """.format(
        db_databc_user=databc_db_user
    )

    operations = [
        RunPrivilegedSQL(
            create_databc_proxy_schema,
            drop_databc_proxy_schema,
        ),
        RunPrivilegedSQL(
            grant_databc_proxy_schema,
            migrations.RunSQL.noop,
        ),
        RunPrivilegedSQL(
            create_databc_proxy_role,
            drop_databc_proxy_role,
        ),
    ]
