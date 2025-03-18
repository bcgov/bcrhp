from django.http import HttpResponse, Http404
from arches.app.views.api import MVT as MVTBase
import logging
from arches.app.views.api import APIBase
from django.http import HttpResponse

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from arches.app.utils.response import JSONResponse
from arches.app.utils.betterJSONSerializer import JSONSerializer
from bcrhp.util.borden_number_api import BordenNumberApi
from bcrhp.util.business_data_proxy import LegislativeActDataProxy
from arches.app.models import models
from bcrhp.util.mvt_tiler import MVTTiler
from django.urls import reverse

logger = logging.getLogger(__name__)

DUMMY_UUID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"


@method_decorator(csrf_exempt, name="dispatch")
class ArchesUrls(APIBase):
    def get(self, request):
        api_urls = {
            "api_card": reverse(
                "api_card",
                kwargs={"resourceid": DUMMY_UUID},
            ).replace(DUMMY_UUID, ""),
            "api_tiles": reverse("api_tiles", kwargs={"tileid": DUMMY_UUID}).replace(
                DUMMY_UUID, ""
            ),
            # "api_nodegroup": ('(nodegroupid)=>{ return "{% url "api_nodegroup' '" " aaaaaaaa - aaaa - aaaa - aaaa - aaaaaaaaaaaa " %}".replace("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", nodegroupid); }'),
            # "api_nodes": '(nodeid)=>{ return "{% url " api_nodes " " aaaaaaaa - aaaa - aaaa - aaaa - aaaaaaaaaaaa " %}".replace("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", nodeid); }',
            "api_node_value": reverse("api_node_value"),
            "api_bulk_disambiguated_resource_instance": reverse(
                "api_bulk_disambiguated_resource_instance"
            ),
            # "api_resources": '(resourceid)=>{return "{% url "resources" "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" %}".replace("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", resourceid)}'
            "api_search_component_data": reverse(
                "api_search_component_data", kwargs={"componentname": None}
            ),
            "api_user_incomplete_workflows": reverse("api_user_incomplete_workflows"),
            "api_get_frontend_i18n_data": reverse("get_frontend_i18n_data"),
        }

        return JSONResponse(JSONSerializer().serializeToPython(api_urls))


@method_decorator(csrf_exempt, name="dispatch")
class BordenNumber(APIBase):
    api = BordenNumberApi()

    # Generate a new borden number in HRIA and return it
    def get(self, request, resourceinstanceid):
        new_borden_number = self.api.get_next_borden_number(resourceinstanceid)
        # print("Got borden grid: %s" % borden_grid)
        return_data = '{"status": "success", "borden_number": "%s"}' % new_borden_number
        return_bytes = return_data.encode("utf-8")
        return HttpResponse(return_bytes, content_type="application/json")


class LegislativeAct(APIBase):

    def get(self, request, act_id):
        legislative_act_proxy = LegislativeActDataProxy()
        act = legislative_act_proxy.get_authorities(act_id)
        # print("Scientific Names: %s" % names)
        return JSONResponse(JSONSerializer().serializeToPython(act))


class UserProfile(APIBase):
    def get(self, request):
        user_profile = models.User.objects.get(id=request.user.pk)
        group_names = [
            group.name for group in models.Group.objects.filter(user=user_profile).all()
        ]
        return JSONResponse(
            JSONSerializer().serializeToPython(
                {
                    "username": user_profile.username,
                    "first_name": user_profile.first_name,
                    "last_name": user_profile.last_name,
                    "groups": group_names,
                }
            )
        )


class MVT(MVTBase):

    def get(self, request, nodeid, zoom, x, y):
        if hasattr(request.user, "userprofile") is not True:
            models.UserProfile.objects.create(user=request.user)
        viewable_nodegroups = request.user.userprofile.viewable_nodegroups
        user = request.user

        tile = MVTTiler().createTile(nodeid, viewable_nodegroups, user, zoom, x, y)
        if not tile or not len(tile):
            raise Http404()
        return HttpResponse(tile, content_type="application/x-protobuf")
