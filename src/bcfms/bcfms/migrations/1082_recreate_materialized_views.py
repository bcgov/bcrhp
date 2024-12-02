from django.db import migrations
import os
from .util.migration_util import format_files_into_sql


class Migration(migrations.Migration):
    dependencies = [("bcfms", "1082_drop_materialized_views")]

    files = [
        "2024-07-25_fossil_sample.fossil_name_vw.sql",
        "2024-07-25_fossil_sample.fossil_name_mv.sql",
        "2024-07-25_fossil_sample.stratigraphy_vw.sql",
        "2024-07-25_fossil_sample.geological_age_vw.sql",
        "2024-07-25_fossil_type.fossil_name_vw.sql",
        "2024-07-25_fossil_type.fossil_name_mv.sql",
        "2024-07-25_fossil_sample.ce_sample_summary_mv.sql",
        "2024-07-25_publication.publication_details_vw.sql",
        "2024-07-25_publication.ce_publication_summary_mv.sql",
        "2024-07-25_fossil_collection_event.collection_event_vw.sql",
        "2024-07-25_fossil_collection_event.collection_event_csv_export_vw.sql",
        "2024-08-15_databc.provincially_protected_fossil_sites_vw.sql",
        "2024-07-25_refresh_export_mvs.sql",
    ]
    sql_dir = os.path.join(os.path.dirname(__file__), "sql")
    create_materialized_views = (
        format_files_into_sql(files, sql_dir)
        + "\n"
        + " begin; call refresh_export_mvs(); commit;"
    )

    drop_materialized_views = """
        drop view if exists fossil_collection_event.collection_event_csv_export_vw;
        drop view if exists fossil_collection_event.collection_event_vw;
        drop materialized view if exists fossil_sample.ce_sample_summary_mv;
        drop materialized view if exists fossil_sample.fossil_name_mv;
        drop view if exists fossil_sample.fossil_name_vw;
        drop view if exists fossil_sample.stratigraphy_vw;
        drop view if exists fossil_sample.geological_age_vw;
        drop materialized view if exists fossil_type.fossil_name_mv;
        drop view if exists fossil_type.fossil_name_vw;
        drop materialized view if exists publication.ce_publication_summary_mv;
        drop view if exists publication.publication_details_vw;
        drop view if exists databc.provincially_protected_fossil_sites_vw;
        drop view if exists databc.fossil_sites_vw;
        """

    operations = [
        migrations.RunSQL(create_materialized_views, drop_materialized_views),
    ]
