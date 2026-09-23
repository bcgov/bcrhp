from django.db import migrations
from arches.app.models import models

graph_slug = "heritage_site"
node_alias = "site_boundary"
update_notes = (
    "321 - Re-apply advancedStyle and enable advancedStyling on site_boundary node"
)
LAYER_LEGEND = (
    '<p><div class="legend-swatch site-provincial"></div>Provincial<br />\n'
    '<div class="legend-swatch site-federal"></div>Federal<br />\n'
    '<div class="legend-swatch site-municipal"></div>Municipal</p>\n'
)

ADVANCED_STYLE = (
    '[\n  {\n    "id": "resources-fill-1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "type": "fill",\n'
    '    "source": "resources-1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "source-layer": "1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "layout": {\n      "visibility": "visible"\n    },\n'
    '    "filter": [ "all", [ "==", "$type", "Polygon" ], [ "==", "total", 1 ] ],\n'
    '    "paint": {\n'
    '      "fill-color": [ "case",\n'
    '\t\t\t\t    ["in", "Provincial", ["get","authorities"]], "rgba(165,0,38,.5)",\n'
    '                    ["in", "Federal", ["get","authorities"]], "rgba(244,109,67,.5)",\n'
    '      \t\t\t\t["in", "Municipal", ["get","authorities"]], "rgba(254,224,144,.5)",\n'
    '      \t\t\t\t  "rgba(0,0,0,.3)" ] }\n'
    "  },\n"
    "  {\n"
    '    "id": "resources-fill-1b6235b0-0d0f-11ed-98c2-5254008afee6-click",\n'
    '    "type": "fill",\n'
    '    "source": "resources-1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "source-layer": "1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "layout": {\n      "visibility": "visible"\n    },\n'
    '    "filter": [ "all", [ "==", "$type", "Polygon" ], [ "==", "total", 1 ], [ "==", "resourceinstanceid", "" ] ],\n'
    '    "paint": {\n'
    '      "fill-color": [ "case",\n'
    '\t\t\t         ["in", "Provincial", ["get","authorities"]], "rgba(165,0,38,1)",\n'
    '                     ["in", "Federal", ["get","authorities"]], "rgba(244,109,67,1)",\n'
    '\t\t\t         ["in", "Municipal", ["get","authorities"]], "rgba(254,224,144,1)",\n'
    '        \t\t\t\t"rgba(0,0,0,0.3)" ]\n'
    "    }\n"
    "  },\n"
    "  {\n"
    '    "id": "resources-fill-1b6235b0-0d0f-11ed-98c2-5254008afee6-hover",\n'
    '    "type": "fill",\n'
    '    "source": "resources-1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "source-layer": "1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "layout": {\n      "visibility": "visible"\n    },\n'
    '    "filter": [ "all", [ "==", "$type", "Polygon" ], [ "==", "total", 1 ], [ "==", "resourceinstanceid", "" ] ],\n'
    '    "paint": {\n      "fill-color": "rgba(255,122,0,0.73)"\n    }\n'
    "  },\n"
    "  {\n"
    '    "id": "resources-poly-outline-1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "type": "line",\n'
    '    "source": "resources-1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "source-layer": "1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "layout": {\n      "visibility": "visible"\n    },\n'
    '    "filter": [ "all", [ "==", "$type", "Polygon" ], [ "==", "total", 1 ] ],\n'
    '    "paint": {\n'
    '      "line-width": 2,\n'
    '      "line-color": [ "case",\n'
    '\t\t\t         ["in", "Provincial", ["get","authorities"]], "rgba(165,0,38,1)",\n'
    '                     ["in", "Federal", ["get","authorities"]], "rgba(244,109,67,1)",\n'
    '\t\t\t         ["in", "Municipal", ["get","authorities"]], "rgba(254,224,144,1)",\n'
    '        \t\t\t  "rgba(0,0,0,1)" ]\n'
    "    }\n"
    "  },\n"
    "  {\n"
    '    "id": "resources-poly-outline-1b6235b0-0d0f-11ed-98c2-5254008afee6-hover",\n'
    '    "type": "line",\n'
    '    "source": "resources-1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "source-layer": "1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "layout": {\n      "visibility": "visible"\n    },\n'
    '    "filter": [ "all", [ "==", "$type", "Polygon" ], [ "==", "total", 1 ], [ "==", "resourceinstanceid", "" ] ],\n'
    '    "paint": {\n      "line-width": 4,\n      "line-color": "rgba(255,122,0,0.3)"\n    }\n'
    "  },\n"
    "  {\n"
    '    "id": "resources-poly-outline-1b6235b0-0d0f-11ed-98c2-5254008afee6-click",\n'
    '    "type": "line",\n'
    '    "source": "resources-1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "source-layer": "1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "layout": {\n      "visibility": "visible"\n    },\n'
    '    "filter": [ "all", [ "==", "$type", "Polygon" ], [ "==", "total", 1 ], [ "==", "resourceinstanceid", "" ]\n    ],\n'
    '    "paint": {\n      "line-width": 4,\n      "line-color": "rgba(255,122,0,0.3)"\n    }\n'
    "  },\n"
    "  {\n"
    '    "id": "resources-line-halo-1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "type": "line",\n'
    '    "source": "resources-1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "source-layer": "1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "layout": {\n      "visibility": "visible"\n    },\n'
    '    "filter": [\n      "all",\n      [\n        "==",\n        "$type",\n        "LineString"\n      ],\n      [\n        "==",\n        "total",\n        1\n      ]\n    ],\n'
    '    "paint": {\n      "line-width": 4,\n      "line-color": "rgba(255,122,0,0.3)"\n    }\n'
    "  },\n"
    "  {\n"
    '    "id": "resources-line-1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "type": "line",\n'
    '    "source": "resources-1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "source-layer": "1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "layout": {\n      "visibility": "visible"\n    },\n'
    '    "filter": [\n      "all",\n      [\n        "==",\n        "$type",\n        "LineString"\n      ],\n      [\n        "==",\n        "total",\n        1\n      ]\n    ],\n'
    '    "paint": {\n      "line-width": 2,\n      "line-color": "rgba(255,122,0,0.73)"\n    }\n'
    "  },\n"
    "  {\n"
    '    "id": "resources-line-halo-1b6235b0-0d0f-11ed-98c2-5254008afee6-hover",\n'
    '    "type": "line",\n'
    '    "source": "resources-1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "source-layer": "1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "layout": {\n      "visibility": "visible"\n    },\n'
    '    "filter": [\n      "all",\n      [\n        "==",\n        "$type",\n        "LineString"\n      ],\n      [\n        "==",\n        "total",\n        1\n      ],\n      [\n        "==",\n        "resourceinstanceid",\n        ""\n      ]\n    ],\n'
    '    "paint": {\n      "line-width": 8,\n      "line-color": "rgba(255,122,0,0.3)"\n    }\n'
    "  },\n"
    "  {\n"
    '    "id": "resources-line-1b6235b0-0d0f-11ed-98c2-5254008afee6-hover",\n'
    '    "type": "line",\n'
    '    "source": "resources-1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "source-layer": "1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "layout": {\n      "visibility": "visible"\n    },\n'
    '    "filter": [\n      "all",\n      [\n        "==",\n        "$type",\n        "LineString"\n      ],\n      [\n        "==",\n        "total",\n        1\n      ],\n      [\n        "==",\n        "resourceinstanceid",\n        ""\n      ]\n    ],\n'
    '    "paint": {\n      "line-width": 4,\n      "line-color": "rgba(255,122,0,0.73)"\n    }\n'
    "  },\n"
    "  {\n"
    '    "id": "resources-line-halo-1b6235b0-0d0f-11ed-98c2-5254008afee6-click",\n'
    '    "type": "line",\n'
    '    "source": "resources-1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "source-layer": "1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "layout": {\n      "visibility": "visible"\n    },\n'
    '    "filter": [\n      "all",\n      [\n        "==",\n        "$type",\n        "LineString"\n      ],\n      [\n        "==",\n        "total",\n        1\n      ],\n      [\n        "==",\n        "resourceinstanceid",\n        ""\n      ]\n    ],\n'
    '    "paint": {\n      "line-width": 8,\n      "line-color": "rgba(255,122,0,0.3)"\n    }\n'
    "  },\n"
    "  {\n"
    '    "id": "resources-line-1b6235b0-0d0f-11ed-98c2-5254008afee6-click",\n'
    '    "type": "line",\n'
    '    "source": "resources-1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "source-layer": "1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "layout": {\n      "visibility": "visible"\n    },\n'
    '    "filter": [\n      "all",\n      [\n        "==",\n        "$type",\n        "LineString"\n      ],\n      [\n        "==",\n        "total",\n        1\n      ],\n      [\n        "==",\n        "resourceinstanceid",\n        ""\n      ]\n    ],\n'
    '    "paint": {\n      "line-width": 4,\n      "line-color": "rgba(255,122,0,0.73)"\n    }\n'
    "  },\n"
    "  {\n"
    '    "id": "resources-point-halo-1b6235b0-0d0f-11ed-98c2-5254008afee6-hover",\n'
    '    "type": "circle",\n'
    '    "source": "resources-1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "source-layer": "1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "layout": {\n      "visibility": "visible"\n    },\n'
    '    "filter": [\n      "all",\n      [\n        "==",\n        "$type",\n        "Point"\n      ],\n      [\n        "==",\n        "total",\n        1\n      ],\n      [\n        "==",\n        "resourceinstanceid",\n        ""\n      ]\n    ],\n'
    '    "paint": {\n      "circle-radius": 8,\n      "circle-color": "rgba(255,122,0,0.3)"\n    }\n'
    "  },\n"
    "  {\n"
    '    "id": "resources-point-1b6235b0-0d0f-11ed-98c2-5254008afee6-hover",\n'
    '    "type": "circle",\n'
    '    "source": "resources-1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "source-layer": "1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "layout": {\n      "visibility": "visible"\n    },\n'
    '    "filter": [\n      "all",\n      [\n        "==",\n        "$type",\n        "Point"\n      ],\n      [\n        "==",\n        "total",\n        1\n      ],\n      [\n        "==",\n        "resourceinstanceid",\n        ""\n      ]\n    ],\n'
    '    "paint": {\n      "circle-radius": 4,\n      "circle-color": "rgba(255,122,0,0.73)"\n    }\n'
    "  },\n"
    "  {\n"
    '    "id": "resources-point-halo-1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "type": "circle",\n'
    '    "source": "resources-1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "source-layer": "1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "layout": {\n      "visibility": "visible"\n    },\n'
    '    "filter": [\n      "all",\n      [\n        "==",\n        "$type",\n        "Point"\n      ],\n      [\n        "==",\n        "total",\n        1\n      ]\n    ],\n'
    '    "paint": {\n      "circle-radius": 4,\n      "circle-color": "rgba(255,122,0,0.3)"\n    }\n'
    "  },\n"
    "  {\n"
    '    "id": "resources-point-1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "type": "circle",\n'
    '    "source": "resources-1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "source-layer": "1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "layout": {\n      "visibility": "visible"\n    },\n'
    '    "filter": [\n      "all",\n      [\n        "==",\n        "$type",\n        "Point"\n      ],\n      [\n        "==",\n        "total",\n        1\n      ]\n    ],\n'
    '    "paint": {\n      "circle-radius": 2,\n      "circle-color": "rgba(255,122,0,0.73)"\n    }\n'
    "  },\n"
    "  {\n"
    '    "id": "resources-point-halo-1b6235b0-0d0f-11ed-98c2-5254008afee6-click",\n'
    '    "type": "circle",\n'
    '    "source": "resources-1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "source-layer": "1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "layout": {\n      "visibility": "visible"\n    },\n'
    '    "filter": [\n      "all",\n      [\n        "==",\n        "$type",\n        "Point"\n      ],\n      [\n        "==",\n        "total",\n        1\n      ],\n      [\n        "==",\n        "resourceinstanceid",\n        ""\n      ]\n    ],\n'
    '    "paint": {\n      "circle-radius": 8,\n      "circle-color": "rgba(255,122,0,0.3)"\n    }\n'
    "  },\n"
    "  {\n"
    '    "id": "resources-point-1b6235b0-0d0f-11ed-98c2-5254008afee6-click",\n'
    '    "type": "circle",\n'
    '    "source": "resources-1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "source-layer": "1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "layout": {\n      "visibility": "visible"\n    },\n'
    '    "filter": [\n      "all",\n      [\n        "==",\n        "$type",\n        "Point"\n      ],\n      [\n        "==",\n        "total",\n        1\n      ],\n      [\n        "==",\n        "resourceinstanceid",\n        ""\n      ]\n    ],\n'
    '    "paint": {\n      "circle-radius": 4,\n      "circle-color": "rgba(255,122,0,0.73)"\n    }\n'
    "  },\n"
    "  {\n"
    '    "id": "resources-cluster-point-halo-1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "type": "circle",\n'
    '    "source": "resources-1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "source-layer": "1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "layout": {\n      "visibility": "visible"\n    },\n'
    '    "filter": [\n      "all",\n      [\n        "==",\n        "$type",\n        "Point"\n      ],\n      [\n        ">",\n        "total",\n        1\n      ]\n    ],\n'
    '    "paint": {\n'
    '      "circle-radius": {\n'
    '        "property": "total",\n'
    '        "stops": [\n'
    "          [ 0, 22 ],\n          [ 50, 24 ],\n          [ 100, 26 ],\n          [ 200, 28 ],\n"
    "          [ 400, 30 ],\n          [ 800, 32 ],\n          [ 1200, 34 ],\n          [ 1600, 36 ],\n"
    "          [ 2000, 38 ],\n          [ 2500, 40 ],\n          [ 3000, 42 ],\n          [ 4000, 44 ],\n"
    "          [ 5000, 46 ]\n"
    "        ]\n"
    "      },\n"
    '      "circle-color": "rgba(255,122,0,0.3)"\n'
    "    }\n"
    "  },\n"
    "  {\n"
    '    "id": "resources-cluster-point-1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "type": "circle",\n'
    '    "source": "resources-1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "source-layer": "1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "layout": {\n      "visibility": "visible"\n    },\n'
    '    "filter": [\n      "all",\n      [\n        "==",\n        "$type",\n        "Point"\n      ],\n      [\n        ">",\n        "total",\n        1\n      ]\n    ],\n'
    '    "paint": {\n'
    '      "circle-radius": {\n'
    '        "property": "total",\n'
    '        "type": "exponential",\n'
    '        "stops": [\n'
    "          [ 0, 12 ],\n          [ 50, 14 ],\n          [ 100, 16 ],\n          [ 200, 18 ],\n"
    "          [ 400, 20 ],\n          [ 800, 22 ],\n          [ 1200, 24 ],\n          [ 1600, 26 ],\n"
    "          [ 2000, 28 ],\n          [ 2500, 30 ],\n          [ 3000, 32 ],\n          [ 4000, 34 ],\n"
    "          [ 5000, 36 ]\n"
    "        ]\n"
    "      },\n"
    '      "circle-color": "rgba(255,122,0,0.73)"\n'
    "    }\n"
    "  },\n"
    "  {\n"
    '    "id": "resources-cluster-count-1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "type": "symbol",\n'
    '    "source": "resources-1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "source-layer": "1b6235b0-0d0f-11ed-98c2-5254008afee6",\n'
    '    "layout": {\n      "text-field": "{total}",\n      "text-size": 10\n    },\n'
    '    "paint": {\n      "text-color": "#fff"\n    },\n'
    '    "filter": [\n      "all",\n      [\n        ">",\n        "total",\n        1\n      ]\n    ]\n'
    "  },"
    ' { "id": "borden_number_label", "type": "symbol",'
    ' "source": "resources-1b6235b0-0d0f-11ed-98c2-5254008afee6",'
    ' "source-layer": "1b6235b0-0d0f-11ed-98c2-5254008afee6",'
    ' "layout": { "text-field": "{borden_number}", "text-size": 10 },'
    ' "paint": { "text-color": "#000" } }\n]'
)


def apply_site_boundary_advanced_style(apps, schema_editor):
    try:
        source_graph = models.Graph.objects.get(
            slug=graph_slug, source_identifier__isnull=True
        )
    except models.Graph.DoesNotExist:
        return

    draft_graph = source_graph.draft.first()
    if not draft_graph:
        print("no draft, creating one")
        draft_graph = source_graph.create_draft_graph()

    node_to_update = models.Node.objects.get(
        graph=draft_graph,
        alias=node_alias,
        is_immutable=False,
    )
    node_to_update.config["advancedStyle"] = ADVANCED_STYLE
    node_to_update.config["advancedStyling"] = True
    node_to_update.config["layerLegend"] = LAYER_LEGEND
    node_to_update.save()

    source_graph.promote_draft_graph_to_active_graph()
    source_graph.publish(notes=update_notes)

    target_graph = models.Graph.objects.get(
        slug=graph_slug, source_identifier__isnull=True
    )
    instances = models.ResourceInstance.objects.filter(graph=target_graph).exclude(
        graph_publication_id=target_graph.publication_id
    )
    print(f"Updating {instances.count()} instances")
    models.ResourceInstance.objects.filter(graph=target_graph).exclude(
        graph_publication_id=target_graph.publication_id
    ).update(graph_publication_id=target_graph.publication_id)
    print("Instances updated.")


def revert_site_boundary_advanced_style(apps, schema_editor):
    try:
        current_graph = models.Graph.objects.get(
            slug=graph_slug, source_identifier__isnull=True
        )
    except models.Graph.DoesNotExist:
        return

    if current_graph.publication.notes == update_notes:
        published_graphs = models.GraphXPublishedGraph.objects.filter(
            graph=current_graph
        ).order_by("-published_time")
        if published_graphs[0].notes == update_notes:
            published = models.PublishedGraph.objects.get(
                publication_id=published_graphs[1].publicationid
            )
            serialized_graph = published.serialized_graph
            graph = models.Graph.objects.get(graphid=published_graphs[1].graph.graphid)
            graph.restore_state_from_serialized_graph(serialized_graph=serialized_graph)

            target_graph = models.Graph.objects.get(
                slug=graph_slug, source_identifier__isnull=True
            )
            instances = models.ResourceInstance.objects.filter(
                graph=target_graph
            ).exclude(graph_publication_id=target_graph.publication_id)
            print(f"Updating {instances.count()} instances")
            models.ResourceInstance.objects.filter(graph=target_graph).exclude(
                graph_publication_id=target_graph.publication_id
            ).update(graph_publication_id=target_graph.publication_id)
            print("Instances updated.")

            published_graph = models.GraphXPublishedGraph.objects.filter(
                notes=update_notes
            ).first()
            if published_graph:
                print(f"Deleting {published_graph}")
                published_graph.delete()


class Migration(migrations.Migration):

    dependencies = [
        ("bcrhp", "0320_backfill_site_image_i18n_fields"),
    ]

    operations = [
        migrations.RunPython(
            apply_site_boundary_advanced_style,
            revert_site_boundary_advanced_style,
        ),
    ]
