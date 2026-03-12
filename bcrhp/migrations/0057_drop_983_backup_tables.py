from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("bcrhp", "0127_remove_sample_widget"),
    ]


operations = [
    migrations.RunSQL(
        """
            DROP TABLE IF EXISTS heritage_site.backup_983_bc_property_legal_description;
            DROP TABLE IF EXISTS heritage_site.backup_983_bc_property_address;
            """,
        migrations.RunSQL.noop,
    ),
]
