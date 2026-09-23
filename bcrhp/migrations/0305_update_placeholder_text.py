from django.db import migrations
from arches.app.models import models
from django.db.models import F, Func, Value
from django.db.models.fields.json import JSONField, KeyTransform
from django.db.models.functions import JSONObject

graph_slug = "heritage_site"
node_aliases = {
    "street_address": "E.g. 207 Government St",
    "document_description": "E.g. 207 Government St - Bylaw No. 165",
    "image_description": "E.g. View of the front entrance of Point Ellice House and gardens in summer",
    "photographer": "E.g. John Taylor",
    "chronology_notes": "E.g. North wing addition",
    "construction_actor": "E.g. Cornelia Hahn Oberlander",
}
update_notes = "305 - Update placeholder text on multiple nodes"


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

    cnws_to_update = models.CardXNodeXWidget.objects.filter(
        node__graph=draft_graph, node__alias__in=node_aliases.keys()
    )
    for cnw_to_update in cnws_to_update:
        new_placeholder = node_aliases[cnw_to_update.node.alias]
        cnw_to_update.config["placeholder"] = {"en": new_placeholder}
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


class Migration(migrations.Migration):

    dependencies = [
        ("bcrhp", "0264_government_person_username"),
    ]

    operations = [
        migrations.RunPython(
            fix_username_config_and_data, revert_username_config_and_data
        ),
    ]
