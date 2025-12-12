from arches.app.models import models
import json
from bcrhp.util.bcrhp_aliases import (
    BCRHPSiteAliases as site_aliases,
    GraphSlugs as slugs,
)
from django.conf import settings

import urllib3


# API to get next borden number, check if a borden number already exists and
# reserve a borden number in BCAP
class BordenNumberApi:
    geom_node = None
    bcap_api_settings = None

    def __init__(self):
        super().__init__()
        self.bcap_api_settings = settings.BCAP_API

    def _initialize_models(self):
        if not self.geom_node:
            graph = models.GraphModel.objects.filter(slug=slugs.HERITAGE_SITE).first()
            self.geom_node = models.Node.objects.filter(
                alias=site_aliases.SITE_BOUNDARY, graph=graph
            ).first()

    def _get_site_geometry(self, resourceinstanceid):
        tile = models.TileModel.objects.filter(
            resourceinstance_id=resourceinstanceid,
            nodegroup_id=self.geom_node.nodegroup_id,
        ).first()
        geometry = tile.data[str(self.geom_node.nodeid)]
        return geometry

    def _get_request_context(self):
        if (
            hasattr(settings, "TILESERVER_OUTBOUND_PROXY")
            and settings.TILESERVER_OUTBOUND_PROXY
        ):
            return urllib3.ProxyManager(settings.TILESERVER_OUTBOUND_PROXY)
        else:
            return urllib3.PoolManager()

    def get_oauth_token(self):

        bcap_api_host = self.bcap_api_settings["API_HOST"]
        token_endpoint = self.bcap_api_settings["OAUTH_TOKEN_ENDPOINT"]
        oauth_client_id = self.bcap_api_settings["BCAP_CREDENTIALS"]["OAUTH_CLIENT_ID"]
        oauth_client_secret = self.bcap_api_settings["BCAP_CREDENTIALS"][
            "OAUTH_CLIENT_SECRET"
        ]
        url = f"{bcap_api_host}{token_endpoint}"
        # print(url)

        req = self._get_request_context()
        response = req.request(
            "POST",
            url,
            {
                "client_id": oauth_client_id,
                "client_secret": oauth_client_secret,
                "grant_type": "client_credentials",
            },
        )
        if response.status == 200:
            body = json.loads(response.data.decode())
            print(body)
            return body["access_token"]
        else:
            print(response.data.decode("utf-8"))

    def get_next_borden_number(self, resourceinstanceid, reserve_borden_number=False):
        self._initialize_models()

        access_token = self.get_oauth_token()

        bcap_api_host = self.bcap_api_settings["API_HOST"]
        bcap_borden_number_endpoint = self.bcap_api_settings["BORDEN_NUMBER_ENDPOINT"]
        url = f"{bcap_api_host}{bcap_borden_number_endpoint}"

        geometry = self._get_site_geometry(resourceinstanceid)
        if not geometry:
            return None

        req = self._get_request_context()
        response = req.request(
            "POST",
            url,
            {
                "site_boundary": json.dumps(geometry),
                "reserve_borden_number": reserve_borden_number,
            },
            {"Authorization": f"Bearer {access_token}"},
        )
        if response.status == 200:
            body = json.loads(response.data.decode("utf-8"))
            return body["borden_number"]
        else:
            print(response.data.decode("utf-8"))

    def validate_borden_number(self, borden_number, resourceinstanceid):
        return borden_number == self.get_next_borden_number(resourceinstanceid, False)
