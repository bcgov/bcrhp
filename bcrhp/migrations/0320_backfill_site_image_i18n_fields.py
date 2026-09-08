import json

from django.db import migrations

_I18N_FIELDS = ("title", "altText", "attribution", "description")
_LANGUAGE_CODES = ("en", "en-US", "fr")
_BLANK_VALUE = {"direction": "ltr", "value": ""}


def backfill_site_image_i18n(apps, schema_editor):
    with schema_editor.connection.cursor() as cursor:
        cursor.execute("""
            SELECT n.nodeid::text, n.nodegroupid::text
            FROM nodes n
            JOIN graphs g ON n.graphid = g.graphid
            WHERE g.slug = 'heritage_site'
              AND n.alias = 'site_images'
            """)
        row = cursor.fetchone()
        if not row:
            return
        node_id, nodegroup_id = row

        cursor.execute(
            """
            SELECT tileid::text, tiledata
            FROM tiles
            WHERE nodegroupid = %s::uuid
              AND jsonb_typeof(tiledata->%s) = 'array'
            """,
            [nodegroup_id, node_id],
        )
        tiles = cursor.fetchall()

    to_update = []
    for tileid, tiledata_raw in tiles:
        tiledata = (
            json.loads(tiledata_raw) if isinstance(tiledata_raw, str) else tiledata_raw
        )
        file_list = tiledata.get(node_id)
        if not file_list:
            continue

        changed = False
        for file_entry in file_list:
            if not isinstance(file_entry, dict):
                continue
            for field in _I18N_FIELDS:
                if field not in file_entry:
                    file_entry[field] = {
                        lang: dict(_BLANK_VALUE) for lang in _LANGUAGE_CODES
                    }
                    changed = True
                else:
                    for lang in _LANGUAGE_CODES:
                        if lang not in file_entry[field]:
                            file_entry[field][lang] = dict(_BLANK_VALUE)
                            changed = True

        if changed:
            to_update.append((json.dumps(tiledata), tileid))

    if to_update:
        with schema_editor.connection.cursor() as cursor:
            cursor.executemany(
                "UPDATE tiles SET tiledata = %s::jsonb WHERE tileid = %s::uuid",
                to_update,
            )


class Migration(migrations.Migration):

    dependencies = [
        ("bcrhp", "0320_add_language_keys_to_site_strings"),
    ]

    operations = [
        migrations.RunPython(backfill_site_image_i18n, migrations.RunPython.noop),
    ]
