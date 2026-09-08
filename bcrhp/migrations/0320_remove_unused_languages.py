from django.db import migrations

_REMOVED_LANGUAGES = [
    {
        "id": 4,
        "code": "zh",
        "name": "Chinese",
        "default_direction": "ltr",
        "scope": "system",
        "isdefault": False,
    },
    {
        "id": 5,
        "code": "de",
        "name": "German",
        "default_direction": "ltr",
        "scope": "system",
        "isdefault": False,
    },
    {
        "id": 6,
        "code": "pt",
        "name": "Portuguese",
        "default_direction": "ltr",
        "scope": "system",
        "isdefault": False,
    },
    {
        "id": 7,
        "code": "ru",
        "name": "Russian",
        "default_direction": "ltr",
        "scope": "system",
        "isdefault": False,
    },
    {
        "id": 8,
        "code": "el",
        "name": "Greek",
        "default_direction": "ltr",
        "scope": "system",
        "isdefault": False,
    },
    {
        "id": 9,
        "code": "en-us",
        "name": "English",
        "default_direction": "ltr",
        "scope": "system",
        "isdefault": False,
    },
]


def remove_unused_languages(apps, schema_editor):
    schema_editor.execute(
        "DELETE FROM languages WHERE code not in ('en', 'en-US', 'fr')"
    )


def restore_unused_languages(apps, schema_editor):
    for lang in _REMOVED_LANGUAGES:
        schema_editor.execute(
            """
            INSERT INTO languages (id, code, name, default_direction, scope, isdefault)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (code) DO NOTHING
            """,
            [
                lang["id"],
                lang["code"],
                lang["name"],
                lang["default_direction"],
                lang["scope"],
                lang["isdefault"],
            ],
        )


class Migration(migrations.Migration):

    dependencies = [
        ("bcrhp", "0276_rename_workflow_list_plugin"),
    ]

    operations = [
        migrations.RunPython(remove_unused_languages, restore_unused_languages),
    ]
