from django.urls import include, path, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.conf.urls.i18n import i18n_patterns
from bcrhp.views.api import BordenNumber, MVT, LegislativeAct, UserProfile
from bcrhp.views.crhp import CRHPXmlExport
from bcrhp.views.search import export_results as bcrhp_export_results
from bcrhp.views.resource import ResourceReportView
from bcrhp.views.root import BcrhpRootView
from bcgov_arches_common.views.map import BCTileserverProxyView
from bcrhp.views.workflows.heritage_site_submissions import (
    SubmitHeritageSite,
    PatchedArchesResourceBlankView,
)
from bcrhp.views.relatable_resources import BcrhpRelatableResourcesView
import re

uuid_regex = settings.UUID_REGEX
path_prefix_re = re.compile(r"^(\^)(.*)$")
from arches.app.views.file import FileView


def bc_path_prefix(path=""):
    if not settings.BCGOV_PROXY_PREFIX:
        return path
    else:
        if not path:
            return settings.BCGOV_PROXY_PREFIX
        new_path = path_prefix_re.sub(r"\1%s\2", path)
        return new_path % settings.BCGOV_PROXY_PREFIX


urlpatterns = [
    re_path(
        bc_path_prefix(r"^submissions/"), BcrhpRootView.as_view(), name="submissions"
    ),
    re_path(
        bc_path_prefix(r"^api/submit_new_site/"),
        SubmitHeritageSite.as_view(),
        name="submit-new-site",
    ),
    re_path(
        bc_path_prefix(r"^bctileserver/(?P<path>.*)$"),
        BCTileserverProxyView.as_view(),
        name="bcrhp_tile_server",
    ),
    re_path(
        bc_path_prefix(r"^borden_number/(?P<resourceinstanceid>%s)$" % uuid_regex),
        BordenNumber.as_view(),
        name="borden_number",
    ),
    re_path(
        bc_path_prefix(r"^legislative_act/(?P<act_id>%s)$" % uuid_regex),
        LegislativeAct.as_view(),
        name="legislative_act",
    ),
    re_path(
        bc_path_prefix(r"^user_profile$"),
        UserProfile.as_view(),
        name="user_profile",
    ),
    re_path(
        bc_path_prefix(r"^crhp_export/(?P<resourceinstanceid>%s)$" % uuid_regex),
        CRHPXmlExport.as_view(),
        name="crhp_export",
    ),
    # Redirect the admin login page to use OAuth
    re_path(
        bc_path_prefix(
            r"^mvt/(?P<nodeid>%s)/(?P<zoom>[0-9]+|\{z\})/(?P<x>[0-9]+|\{x\})/(?P<y>[0-9]+|\{y\}).pbf$"
            % uuid_regex
        ),
        MVT.as_view(),
        name="mvt",
    ),
    re_path(
        bc_path_prefix(r"^report/(?P<resourceid>%s)$" % uuid_regex),
        ResourceReportView.as_view(),
        name="resource_report",
    ),
    # Override base export results
    re_path(
        bc_path_prefix(r"^search/export_results$"),
        bcrhp_export_results,
        name="export_results",
    ),
    path(
        f"{bc_path_prefix()}bcrhp/api/resource/<slug:graph>/blank",
        PatchedArchesResourceBlankView.as_view(),
        name="api-resource-blank",
    ),
    # Shadow arches_component_lab's relatable-resources URL to allow special node aliases
    path(
        f"{bc_path_prefix()}api/relatable-resources/<slug:graph>/<slug:node_alias>",
        BcrhpRelatableResourcesView.as_view(),
        name="bcrhp-api-relatable-resources",
    ),
    path(bc_path_prefix(), include("bcgov_arches_common.urls")),
    path(bc_path_prefix(), include("arches_querysets.urls")),
    path(bc_path_prefix(), include("arches_component_lab.urls")),
    path(bc_path_prefix(), include("arches.urls")),
]

# Adds URL pattern to serve media files during development
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

handler400 = "arches.app.views.main.custom_400"
handler403 = "arches.app.views.main.custom_403"
handler404 = "arches.app.views.main.custom_404"
handler500 = "arches.app.views.main.custom_500"

# Only handle i18n routing in active project. This will still handle the routes provided by Arches core and Arches applications,
# but handling i18n routes in multiple places causes application errors.
if settings.ROOT_URLCONF == __name__:
    if settings.SHOW_LANGUAGE_SWITCH is True:
        urlpatterns = i18n_patterns(*urlpatterns)

    urlpatterns.append(path("i18n/", include("django.conf.urls.i18n")))
