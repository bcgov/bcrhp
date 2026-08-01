"""
Unit tests for bcrhp/views/relatable_resources.py
"""

import uuid
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

    def test_local_government_acts_in_special_aliases(self):
        self.assertIn("local_government_acts", SPECIAL_NODE_ALIASES)


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
        self.user.is_superuser = False
        with patch("bcrhp.views.relatable_resources.ResourceTileTree") as mock_tt:
            mock_tt.get_tiles.side_effect = Exception("DB error")
            q = self.view._get_filter_for_special_alias("municipal_sites", self.user)
        self.assertEqual(str(q), str(Q(pk__in=[])))

    def test_superuser_no_government_association_returns_empty_q(self):
        self.user.is_superuser = True
        q = self.view._get_filter_for_special_alias("municipal_sites", self.user)
        self.assertEqual(str(q), str(Q()))

    def test_no_government_association_returns_empty_filter(self):
        self.user.is_superuser = False
        with patch("bcrhp.views.relatable_resources.ResourceTileTree") as mock_tt:
            person = MagicMock()
            person.aliased_data.government_association = None
            mock_tt.get_tiles.return_value.filter.return_value.get.return_value = person
            q = self.view._get_filter_for_special_alias("municipal_sites", self.user)
        self.assertEqual(str(q), str(Q(pk__in=[])))

    def test_with_government_association_builds_filter(self):
        self.user.is_superuser = False
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
        self.user.is_superuser = False
        q = self.view._get_filter_for_special_alias("unknown_alias", self.user)
        self.assertEqual(str(q), str(Q()))


class GetFilterLocalGovernmentActsTest(TestCase):
    def setUp(self):
        self.view = BcrhpRelatableResourcesView()
        self.user = MagicMock()
        self.user.is_superuser = False
        self.user.username = "testuser"

    def test_superuser_returns_unrestricted_q(self):
        self.user.is_superuser = True
        q = self.view._get_filter_for_special_alias("local_government_acts", self.user)
        self.assertEqual(str(q), str(Q()))

    def test_collection_not_found_returns_empty_filter(self):
        with patch("bcrhp.views.relatable_resources.Value") as mock_value:
            mock_value.objects.filter.return_value.select_related.return_value.first.return_value = None
            q = self.view._get_filter_for_special_alias("local_government_acts", self.user)
        self.assertEqual(str(q), str(Q(pk__in=[])))

    def test_municipal_child_not_found_returns_empty_filter(self):
        collection_concept_pk = uuid.uuid4()
        mock_collection_record = MagicMock()
        mock_collection_record.concept.pk = collection_concept_pk

        mock_parent = MagicMock()
        mock_parent.get_child_collections.return_value = [
            (str(uuid.uuid4()), "Provincial", str(uuid.uuid4())),
            (str(uuid.uuid4()), "Federal", str(uuid.uuid4())),
        ]

        with patch("bcrhp.views.relatable_resources.Value") as mock_value, \
             patch("bcrhp.views.relatable_resources.Concept") as mock_concept_cls:
            mock_value.objects.filter.return_value.select_related.return_value.first.return_value = (
                mock_collection_record
            )
            mock_concept_cls.return_value.get.return_value = mock_parent
            q = self.view._get_filter_for_special_alias("local_government_acts", self.user)

        self.assertEqual(str(q), str(Q(pk__in=[])))

    def test_success_filters_by_municipal_value_id(self):
        collection_concept_pk = uuid.uuid4()
        municipal_value_id = uuid.uuid4()
        mock_collection_record = MagicMock()
        mock_collection_record.concept.pk = collection_concept_pk

        mock_parent = MagicMock()
        mock_parent.get_child_collections.return_value = [
            (str(uuid.uuid4()), "Provincial", str(uuid.uuid4())),
            (str(uuid.uuid4()), "Municipal", str(municipal_value_id)),
        ]

        mock_act_ids = [uuid.uuid4(), uuid.uuid4()]
        mock_qs = MagicMock()
        mock_qs.filter.return_value.values.return_value = mock_act_ids

        with patch("bcrhp.views.relatable_resources.Value") as mock_value, \
             patch("bcrhp.views.relatable_resources.Concept") as mock_concept_cls, \
             patch("bcrhp.views.relatable_resources.ResourceTileTree") as mock_tt:
            mock_value.objects.filter.return_value.select_related.return_value.first.return_value = (
                mock_collection_record
            )
            mock_concept_cls.return_value.get.return_value = mock_parent
            mock_tt.get_tiles.return_value = mock_qs
            q = self.view._get_filter_for_special_alias("local_government_acts", self.user)

        mock_tt.get_tiles.assert_called_once_with(graph_slug="legislative_act")
        mock_qs.filter.assert_called_once_with(authority=str(municipal_value_id))
        self.assertEqual(str(q), str(Q(pk__in=mock_act_ids)))

    def test_concept_get_called_with_collection_pk_as_string(self):
        collection_concept_pk = uuid.uuid4()
        municipal_value_id = uuid.uuid4()
        mock_collection_record = MagicMock()
        mock_collection_record.concept.pk = collection_concept_pk

        mock_parent = MagicMock()
        mock_parent.get_child_collections.return_value = [
            (str(uuid.uuid4()), "Municipal", str(municipal_value_id)),
        ]

        mock_qs = MagicMock()
        mock_qs.filter.return_value.values.return_value = []

        with patch("bcrhp.views.relatable_resources.Value") as mock_value, \
             patch("bcrhp.views.relatable_resources.Concept") as mock_concept_cls, \
             patch("bcrhp.views.relatable_resources.ResourceTileTree") as mock_tt:
            mock_value.objects.filter.return_value.select_related.return_value.first.return_value = (
                mock_collection_record
            )
            mock_concept_instance = mock_concept_cls.return_value
            mock_concept_instance.get.return_value = mock_parent
            mock_tt.get_tiles.return_value = mock_qs
            self.view._get_filter_for_special_alias("local_government_acts", self.user)

        mock_concept_instance.get.assert_called_once_with(str(collection_concept_pk))
        mock_parent.get_child_collections.assert_called_once_with(str(collection_concept_pk))

    def test_exception_returns_empty_filter(self):
        with patch("bcrhp.views.relatable_resources.Value") as mock_value:
            mock_value.objects.filter.side_effect = Exception("DB error")
            q = self.view._get_filter_for_special_alias("local_government_acts", self.user)
        self.assertEqual(str(q), str(Q(pk__in=[])))
