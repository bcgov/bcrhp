from django.db import migrations
from arches.app.models import models
from django.db.models import F, Func, Value
from django.db.models.fields.json import JSONField, KeyTransform
from django.db.models.functions import JSONObject

graph_slug = "lg_person"
node_alias = "username"
update_notes = "264 - Update username datatype and max length"


def fix_username_config_and_data(apps, schema_editor):
    # First update the graph to make submission photos 1:n
    try:
        source_graph = models.Graph.objects.get(
            slug=graph_slug, source_identifier__isnull=True
        )
    except models.Graph.DoesNotExist:
        return
    draft_graph = source_graph.draft.first()
    # print(f"Got draft {draft_graph}")
    if not draft_graph:
        print(f"no draft, creating one")
        draft_graph = source_graph.create_draft_graph()

    node_to_update = models.Node.objects.get(
        graph=draft_graph,
        alias=node_alias,
        is_immutable=False,
    )
    node_to_update.datatype = "non-localized-string"
    node_to_update.config = {}
    node_to_update.isrequired = True
    node_to_update.save()

    nls_widget = models.Widget.objects.get(name="non-localized-text-widget")

    cnw_to_update = models.CardXNodeXWidget.objects.get(node=node_to_update)
    cnw_to_update.widget = nls_widget
    cnw_to_update.config = {
        "label": "Username",
        "width": "30%",
        "maxLength": 50,
        "uneditable": False,
        "placeholder": "Enter user's BCRHP Login credentials",
        "defaultValue": "",
        "i18n_properties": ["placeholder"],
    }
    cnw_to_update.save()

    source_graph.promote_draft_graph_to_active_graph()
    source_graph.publish(notes=update_notes)

    # Move all resources to updated collection event graph
    target_graph = models.Graph.objects.get(
        slug=graph_slug, source_identifier__isnull=True
    )
    instances = models.ResourceInstance.objects.filter(graph=target_graph).exclude(
        graph_publication_id=target_graph.publication_id
    )
    print(f"Updating {instances.count()} instances")
    (
        models.ResourceInstance.objects.filter(graph=target_graph)
        .exclude(graph_publication_id=target_graph.publication_id)
        .update(graph_publication_id=target_graph.publication_id)
    )
    print("Instances updated.")

    updated_node = models.Node.objects.get(alias=node_alias, graph=target_graph)
    nodeid = str(updated_node.nodeid)
    nodegroupid = updated_node.nodegroup_id
    (
        models.TileModel.objects.filter(nodegroup_id=nodegroupid).update(
            data=Func(
                F("data"),
                Value([nodeid]),  # JSON path
                F(f"data__{nodeid}__en__value"),
                Value(True),
                function="jsonb_set",
                output_field=JSONField(),
            )
        )
    )


def revert_username_config_and_data(apps, schema_editor):
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
            published_graph = models.GraphXPublishedGraph.objects.get(
                notes=update_notes
            )
            if published_graph:
                print(f"Deleting {published_graph}")
                published_graph.delete()

            node_to_update = models.Node.objects.get(
                graph=target_graph, alias=node_alias
            )
            nodegroupid = node_to_update.nodegroup_id
            nodeid = str(node_to_update.nodeid)
            (
                models.TileModel.objects.filter(nodegroup_id=nodegroupid).update(
                    data=Func(
                        F("data"),
                        Value([nodeid]),  # JSON path
                        JSONObject(
                            en=JSONObject(
                                value=KeyTransform(
                                    str(nodeid), "data"
                                ),  # existing data -> nodeid2
                                direction=Value("ltr"),
                            )
                        ),
                        Value(True),
                        function="jsonb_set",
                        output_field=JSONField(),
                    )
                )
            )


class Migration(migrations.Migration):

    dependencies = [
        ("bcrhp", "0232_remove_map_rerender_config_key"),
    ]

    operations = [
        migrations.RunPython(
            fix_username_config_and_data, revert_username_config_and_data
        ),
    ]
