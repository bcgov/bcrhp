from django.core.paginator import Paginator
from django.db.models import F, Q
from django.utils.translation import get_language
from arches.app.models.models import ResourceInstance
from arches.app.utils.response import JSONResponse
from arches_component_lab.views.api.relatable_resources import RelatableResourcesView
from arches_querysets.models import ResourceTileTree

# Add node aliases here that should return all ResourceInstances
# rather than filtering by a node's graph config.
SPECIAL_NODE_ALIASES = {"municipal_sites"}


class BcrhpRelatableResourcesView(RelatableResourcesView):
    def get(self, request, graph, node_alias):
        if node_alias not in SPECIAL_NODE_ALIASES:
            return super().get(request, graph, node_alias)

        language = get_language()
        page_number = request.GET.get("page", 1)
        items_per_page = request.GET.get("items", 25)
        initial_values = request.GET.getlist("initialValue", "")

        resources = (
            ResourceInstance.objects.exclude(resourceinstanceid__in=initial_values)
            .values("resourceinstanceid")
            .annotate(display_value=F("descriptors__{}__name".format(language)))
            .order_by("graph", "pk")
        )
        resources = resources.filter(
            self._get_filter_for_special_alias(node_alias, request.user)
        )

        selected_resources = (
            ResourceInstance.objects.filter(resourceinstanceid__in=initial_values)
            .values("resourceinstanceid")
            .annotate(display_value=F("descriptors__{}__name".format(language)))
            .order_by("graph", "pk")
            if int(page_number) == 1
            else []
        )

        paginator = Paginator(resources, items_per_page)

        data = list(selected_resources) + sorted(
            paginator.get_page(page_number).object_list,
            key=lambda resource: (resource.get("display_value") or "").lower(),
        )

        return JSONResponse(
            {
                "graphs": [],
                "current_page": paginator.get_page(page_number).number,
                "total_pages": paginator.num_pages,
                "results_per_page": paginator.per_page,
                "total_results": paginator.count,
                "data": data,
            }
        )

    def _get_filter_for_special_alias(self, alias, user):
        query_filter = Q()
        if alias == "municipal_sites":
            try:
                government_user = (
                    ResourceTileTree.get_tiles(graph_slug="lg_person")
                    .filter(username__en__value=user.username)
                    .get()
                )
                if government_user.aliased_data.government_association:
                    lg = (
                        government_user.aliased_data.government_association.aliased_data.government_association
                    )
                    site_ids = (
                        ResourceTileTree.get_tiles(graph_slug="heritage_site")
                        .filter(responsible_government__ids_contain=str(lg.pk))
                        .values("pk")
                    )
                    query_filter = query_filter & Q(pk__in=site_ids)
                else:
                    query_filter = Q(pk__in=[])
            except Exception as e:
                print(e)
                query_filter = Q(pk__in=[])
        return query_filter
