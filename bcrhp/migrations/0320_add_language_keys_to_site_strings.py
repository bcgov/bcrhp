from django.db import migrations

# String-type node aliases in the heritage_site graph that need language keys
# pre-populated so that pre_structure_tile_data does not introduce spurious
# provisional edits when a tile is saved.
_ALIASES = [
    "accuracy_remarks",
    "chronology_notes",
    "city",
    "construction_actor",
    "construction_actor_notes",
    "copyright",
    "defining_elements",
    "document_description",
    "document_location",
    "heritage_value",
    "image_description",
    "image_features",
    "information_source",
    "internal_remark",
    "legal_address_internal_notes",
    "legal_description",
    "locality",
    "location_description",
    "name",
    "photographer",
    "physical_description",
    "postal_code",
    "protection_notes",
    "reference_number",
    "source_notes",
    "street_address",
]

# Languages that pre_structure_tile_data will inject on every save.
# Tile data must already contain these keys so no diff is seen.
_LANGUAGE_CODES = ["en-US", "fr"]


def backfill_language_keys(apps, schema_editor):
    # Ensure 'fr' exists — it may have been absent or deleted before this migration.
    schema_editor.execute("""
        INSERT INTO languages (code, name, default_direction, scope, isdefault)
        VALUES ('fr', 'French', 'ltr', 'system', false)
        ON CONFLICT (code) DO NOTHING
        """)

    with schema_editor.connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT n.nodeid::text
            FROM nodes n
            JOIN graphs g ON n.graphid = g.graphid
            WHERE g.slug = 'heritage_site'
              AND n.alias = ANY(%s)
              AND n.datatype = 'string'
            """,
            [_ALIASES],
        )
        node_ids = [row[0] for row in cursor.fetchall()]

    for node_id in node_ids:
        for lang_code in _LANGUAGE_CODES:
            # Add the blank language key to every tile where:
            #   • the node has a JSON object value (not null — null means unset)
            #   • the language key is not already present
            schema_editor.execute(
                """
                UPDATE tiles
                SET tiledata = jsonb_set(
                    tiledata,
                    ARRAY[%s, %s],
                    '{"direction": "ltr", "value": ""}'::jsonb,
                    true
                )
                WHERE jsonb_typeof(tiledata->%s) = 'object'
                  AND NOT (tiledata->%s ? %s)
                """,
                [node_id, lang_code, node_id, node_id, lang_code],
            )


class Migration(migrations.Migration):

    dependencies = [
        ("bcrhp", "0320_remove_unused_languages"),
    ]

    operations = [
        migrations.RunPython(backfill_language_keys, migrations.RunPython.noop),
    ]
