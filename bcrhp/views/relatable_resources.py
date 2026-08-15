import uuid
from django.core.paginator import Paginator
from django.db.models import F, Q
from django.db.models.fields.json import KeyTextTransform, KeyTransform
from django.db.models.functions import Lower
from django.utils.translation import get_language
from arches.app.models.concept import Concept
from arches.app.models.models import ResourceInstance, Value
from arches.app.utils.response import JSONResponse
from arches_component_lab.views.api.relatable_resources import RelatableResourcesView
from arches_querysets.models import ResourceTileTree
from bcrhp.util.bcrhp_aliases import GraphSlugs as slugs
from bcrhp.util.bcrhp_aliases import BCRHPSiteAliases as heritageSiteAliases

# Add node aliases here that should return all ResourceInstances
# rather than filtering by a node's graph config.


# This isn't a real alias - it's to filter the sites in the LG edit site workflow
MUNICIPAL_SITES_ALIAS = "municipal_sites"
LEGISLATIVE_ACT_ACTIVE_ALIAS = "legislative_act_active"
# Synthetic aliases that don't correspond to a real node in any graph. These
# always go through the custom view path so the parent view (which would fail
# to resolve them) is never reached, even for superusers.
CUSTOM_NODE_ALIASES = [MUNICIPAL_SITES_ALIAS, LEGISLATIVE_ACT_ACTIVE_ALIAS]
SPECIAL_NODE_ALIASES = {
    # Aliases listed here are real node aliases whose results should be filtered
    # for non-superusers. Superusers bypass this and go directly to the parent view.
    slugs.HERITAGE_SITE: {heritageSiteAliases.LEGISLATIVE_ACT}
}


class BcrhpRelatableResourcesView(RelatableResourcesView):
    def get(self, request, graph, node_alias):
        # Custom aliases and non-superuser special aliases need custom handling;
        # delegate everything else to the parent view.
        if not self._should_override_alias(graph, node_alias, request.user):
            return super().get(request, graph, node_alias)

        language = get_language()
        page_number = request.GET.get("page", 1)
        items_per_page = request.GET.get("items", 25)
        initial_values = request.GET.getlist("initialValue", "")
        filter_terms = request.GET.getlist("filter_term", [])

        resources = (
            ResourceInstance.objects.exclude(resourceinstanceid__in=initial_values)
            .values("resourceinstanceid")
            .annotate(
                display_value=KeyTextTransform(
                    "name", KeyTransform(language, "descriptors")
                )
            )
            .order_by(Lower("display_value").asc(nulls_last=True), "pk")
        )
        resources = resources.filter(
            self._get_filter_for_special_alias(
                graph_slug=graph, alias=node_alias, user=request.user
            )
        )

        if filter_terms:
            text_filter = Q()
            for term in filter_terms:
                try:
                    uuid.UUID(str(term))
                    text_filter = text_filter & Q(resourceinstanceid=str(term))
                except ValueError:
                    text_filter = text_filter & Q(display_value__icontains=term)
            resources = resources.filter(text_filter)

        selected_resources = (
            ResourceInstance.objects.filter(resourceinstanceid__in=initial_values)
            .values("resourceinstanceid")
            .annotate(
                display_value=KeyTextTransform(
                    "name", KeyTransform(language, "descriptors")
                )
            )
            .order_by(Lower("display_value").asc(nulls_last=True), "pk")
            if int(page_number) == 1
            else []
        )

        paginator = Paginator(resources, items_per_page)
        page = paginator.get_page(page_number)

        data = list(selected_resources) + list(page.object_list)

        return JSONResponse(
            {
                "graphs": [],
                "current_page": page.number,
                "total_pages": paginator.num_pages,
                "results_per_page": paginator.per_page,
                "total_results": paginator.count,
                "data": data,
            }
        )

    def _should_override_alias(self, graph_slug, alias, user):
        # We need to override if:
        # 1. It's a custom alias (ie - the slug/alias combination doesn't actually exist)
        # 2. It's a valid slug/alias and we're not a superuser (this is typically for adding extra filters to the criteria)

        return alias in CUSTOM_NODE_ALIASES or (
            graph_slug in SPECIAL_NODE_ALIASES
            and alias in SPECIAL_NODE_ALIASES[graph_slug]
            and not user.is_superuser
        )

    def _get_filter_for_special_alias(self, graph_slug, alias, user):
        query_filter = Q()
        try:

            if graph_slug == slugs.HERITAGE_SITE and alias == MUNICIPAL_SITES_ALIAS:
                # Superusers see all published heritage sites; non-superusers are
                # restricted to sites belonging to their local government.
                if user.is_superuser:
                    return Q(
                        graph__slug=graph_slug,
                        graph__publication__isnull=False,
                        graph__is_active=True,
                    )
                government_user = (
                    ResourceTileTree.get_tiles(graph_slug=slugs.GOVERNMENT_PERSON)
                    .filter(username=user.username)
                    .get()
                )
                if government_user.aliased_data.government_association:
                    lg = (
                        government_user.aliased_data.government_association.aliased_data.government_association
                    )
                    site_ids = (
                        ResourceTileTree.get_tiles(graph_slug=slugs.HERITAGE_SITE)
                        .filter(responsible_government__ids_contain=str(lg.pk))
                        .values("pk")
                    )
                    query_filter = query_filter & Q(pk__in=site_ids)
                else:
                    query_filter = Q(pk__in=[])
            elif graph_slug == slugs.HERITAGE_SITE and alias in {
                heritageSiteAliases.LEGISLATIVE_ACT,
                LEGISLATIVE_ACT_ACTIVE_ALIAS,
            }:
                act_tiles = ResourceTileTree.get_tiles(graph_slug=slugs.LEGISLATIVE_ACT)
                if not user.is_superuser:
                    collection_record = (
                        Value.objects.filter(
                            value="BC Protection Authority",
                            valuetype="prefLabel",
                            concept__nodetype="Collection",
                        )
                        .select_related("concept")
                        .first()
                    )
                    if not collection_record:
                        return Q(pk__in=[])
                    parent = Concept().get(str(collection_record.concept.pk))
                    children = parent.get_child_collections(
                        str(collection_record.concept.pk)
                    )
                    municipal = next((c for c in children if c[1] == "Municipal"), None)
                    if not municipal:
                        return Q(pk__in=[])
                    act_tiles = act_tiles.filter(authority=str(municipal[2]))
                if alias == LEGISLATIVE_ACT_ACTIVE_ALIAS:
                    act_tiles = act_tiles.filter(active=True)
                query_filter = query_filter & Q(pk__in=act_tiles.values("pk"))
        except Exception as e:
            print(e)
            query_filter = Q(pk__in=[])

        return query_filter
