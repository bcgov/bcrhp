"""
Unit tests for bcrhp/views/relatable_resources.py
"""

from unittest.mock import MagicMock, patch

from django.db.models import Q
from django.test import TestCase, RequestFactory

from bcrhp.views.relatable_resources import (
    BcrhpRelatableResourcesView,
    SPECIAL_NODE_ALIASES,
)


def _mock_request(factory, method="GET", **params):
    request = factory.get("/", params) if method == "GET" else factory.post("/", params)
    request.user = MagicMock()
    request.user.username = "testuser"
    return request


class SpecialNodeAliasesTest(TestCase):
    def test_municipal_sites_in_special_aliases(self):
        self.assertIn("municipal_sites", SPECIAL_NODE_ALIASES)


class BcrhpRelatableResourcesViewGetTest(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.view = BcrhpRelatableResourcesView()

    def test_non_special_alias_delegates_to_parent(self):
        request = _mock_request(self.factory)
        parent = BcrhpRelatableResourcesView.__bases__[0]
        sentinel = MagicMock(status_code=200)
        with patch.object(parent, "get", return_value=sentinel) as mock_parent:
            result = self.view.get(request, "some_graph", "non_special_alias")
            mock_parent.assert_called_once_with(request, "some_graph", "non_special_alias")
            self.assertIs(result, sentinel)

    def test_special_alias_does_not_delegate_to_parent(self):
        request = _mock_request(self.factory)
        parent = BcrhpRelatableResourcesView.__bases__[0]
        with patch.object(parent, "get") as mock_parent, \
             patch("bcrhp.views.relatable_resources.ResourceInstance") as mock_ri, \
             patch("bcrhp.views.relatable_resources.ResourceTileTree") as mock_tt, \
             patch("bcrhp.views.relatable_resources.Paginator") as mock_pager:
            mock_ri.objects.exclude.return_value.values.return_value \
                .annotate.return_value.order_by.return_value \
                .filter.return_value = []
            mock_ri.objects.filter.return_value.values.return_value \
                .annotate.return_value.order_by.return_value = []
            mock_pager.return_value.get_page.return_value.object_list = []
            mock_pager.return_value.get_page.return_value.number = 1
            mock_pager.return_value.num_pages = 1
            mock_pager.return_value.per_page = 25
            mock_pager.return_value.count = 0
            mock_tt.get_tiles.side_effect = Exception("no user")
            self.view.get(request, "heritage_site", "municipal_sites")
            mock_parent.assert_not_called()


class GetFilterForSpecialAliasTest(TestCase):
    def setUp(self):
        self.view = BcrhpRelatableResourcesView()
        self.user = MagicMock()
        self.user.username = "testuser"

    def test_exception_returns_empty_queryset_filter(self):
        with patch("bcrhp.views.relatable_resources.ResourceTileTree") as mock_tt:
            mock_tt.get_tiles.side_effect = Exception("DB error")
            q = self.view._get_filter_for_special_alias("municipal_sites", self.user)
        self.assertEqual(str(q), str(Q(pk__in=[])))

    def test_no_government_association_returns_empty_filter(self):
        with patch("bcrhp.views.relatable_resources.ResourceTileTree") as mock_tt:
            person = MagicMock()
            person.aliased_data.government_association = None
            mock_tt.get_tiles.return_value.filter.return_value.get.return_value = person
            q = self.view._get_filter_for_special_alias("municipal_sites", self.user)
        self.assertEqual(str(q), str(Q(pk__in=[])))

    def test_with_government_association_builds_filter(self):
        with patch("bcrhp.views.relatable_resources.ResourceTileTree") as mock_tt, \
             patch("bcrhp.views.relatable_resources.ResourceInstance"):
            person = MagicMock()
            lg = MagicMock()
            lg.pk = "lg-uuid"
            person.aliased_data.government_association.aliased_data.government_association = lg

            site_ids_qs = MagicMock()
            mock_tt.get_tiles.side_effect = [
                MagicMock(**{"filter.return_value.get.return_value": person}),
                MagicMock(**{"filter.return_value.values.return_value": site_ids_qs}),
            ]
            q = self.view._get_filter_for_special_alias("municipal_sites", self.user)

        self.assertNotEqual(str(q), str(Q(pk__in=[])))

    def test_unknown_alias_returns_empty_filter(self):
        q = self.view._get_filter_for_special_alias("unknown_alias", self.user)
        self.assertEqual(str(q), str(Q()))
