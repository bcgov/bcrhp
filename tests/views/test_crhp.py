"""
Unit tests for bcrhp/views/crhp.py
"""

import datetime
from unittest.mock import MagicMock, patch

from django.test import TestCase

from bcrhp.views.crhp import CRHPXmlExport


class SetCrhpAuthorityValueTest(TestCase):
    def setUp(self):
        self.view = CRHPXmlExport()

    def _event(self, authority, legal_instrument="", government_name=""):
        return {
            "authority": authority,
            "legal_instrument": legal_instrument,
            "government_name": government_name,
        }

    def test_provincial(self):
        event = self._event("Provincial")
        self.view.set_crhp_authority_value(event)
        self.assertEqual(event["crhp_authority"], "Province of British Columbia")

    def test_vancouver_charter(self):
        event = self._event("Local", legal_instrument="Vancouver Charter")
        self.view.set_crhp_authority_value(event)
        self.assertEqual(event["crhp_authority"], "City of Vancouver")

    def test_government_name_vancouver(self):
        event = self._event("Local", government_name="Vancouver")
        self.view.set_crhp_authority_value(event)
        self.assertEqual(event["crhp_authority"], "City of Vancouver")

    def test_other_local(self):
        event = self._event(
            "Local", legal_instrument="BC Heritage Act", government_name="Kelowna"
        )
        self.view.set_crhp_authority_value(event)
        self.assertEqual(event["crhp_authority"], "Local Governments (BC)")


class ConvertStringToDateTest(TestCase):
    def setUp(self):
        self.view = CRHPXmlExport()

    def test_converts_iso_string_to_datetime(self):
        obj = {"start_year": "2020-06-15"}
        self.view.convert_string_to_date(obj, "start_year")
        self.assertIsInstance(obj["start_year"], datetime.datetime)
        self.assertEqual(obj["start_year"].year, 2020)
        self.assertEqual(obj["start_year"].month, 6)
        self.assertEqual(obj["start_year"].day, 15)

    def test_none_obj_is_noop(self):
        self.view.convert_string_to_date(None, "start_year")  # must not raise


class FormatEventTypeTest(TestCase):
    def setUp(self):
        self.view = CRHPXmlExport()

    def test_construction_approximate(self):
        se = {"event_type": "Construction", "dates_approximate": True}
        self.view.format_event_type(se)
        self.assertEqual(se["event_type"], "Construction (circa)")

    def test_construction_not_approximate(self):
        se = {"event_type": "Construction", "dates_approximate": False}
        self.view.format_event_type(se)
        self.assertEqual(se["event_type"], "Construction")

    def test_non_construction_becomes_significant(self):
        se = {"event_type": "Occupation", "dates_approximate": False}
        self.view.format_event_type(se)
        self.assertEqual(se["event_type"], "Significant")

    def test_any_non_construction_type_becomes_significant(self):
        for event_type in ("Use", "Modification", "Event"):
            se = {"event_type": event_type, "dates_approximate": False}
            self.view.format_event_type(se)
            self.assertEqual(se["event_type"], "Significant", msg=event_type)


class ConvertStringTest(TestCase):
    def setUp(self):
        self.view = CRHPXmlExport()

    def test_strips_html_tags(self):
        result = self.view.convert_string("<p>Hello world</p>")
        self.assertNotIn("<p>", result)
        self.assertIn("Hello world", result)

    def test_empty_string(self):
        result = self.view.convert_string("")
        self.assertEqual(result, "")

    def test_escapes_angle_brackets(self):
        result = self.view.convert_string("<p>a &lt; b</p>")
        self.assertNotIn("<p>", result)


class GetContextDataTest(TestCase):
    def setUp(self):
        self.view = CRHPXmlExport()

    def _mock_data(self, **overrides):
        data = MagicMock()
        data.site_names = overrides.get("site_names", [])
        data.sos = overrides.get("sos", [])
        data.protection_events = overrides.get("protection_events", [])
        data.significant_events = overrides.get("significant_events", [])
        data.site_images = overrides.get("site_images", [])
        data.heritage_categories = []
        data.heritage_themes = []
        return data

    @patch("bcrhp.views.crhp.CrhpExportData")
    def test_returns_empty_context_on_exception(self, mock_model):
        mock_model.objects.get.side_effect = Exception("not found")
        context = self.view.get_context_data("bad-uuid")
        self.assertEqual(context, {})

    @patch("bcrhp.views.crhp.CrhpExportData")
    def test_separates_common_and_other_names(self, mock_model):
        mock_model.objects.get.return_value = self._mock_data(
            site_names=[
                {"name": "Common Name", "name_type": "Common"},
                {"name": "Other Name", "name_type": "Historical"},
            ]
        )
        context = self.view.get_context_data("uuid")
        self.assertEqual(len(context["data"].common_names), 1)
        self.assertEqual(len(context["data"].other_names), 1)

    @patch("bcrhp.views.crhp.CrhpExportData")
    def test_sos_sorted_provincial_first(self, mock_model):
        mock_model.objects.get.return_value = self._mock_data(
            sos=[
                {
                    "significance_type": "Local",
                    "heritage_value": "",
                    "defining_elements": "",
                    "physical_description": "",
                    "document_location": "",
                },
                {
                    "significance_type": "Provincial",
                    "heritage_value": "",
                    "defining_elements": "",
                    "physical_description": "",
                    "document_location": "",
                },
            ]
        )
        context = self.view.get_context_data("uuid")
        self.assertEqual(context["data"].sos[0]["significance_type"], "Provincial")

    @patch("bcrhp.views.crhp.CrhpExportData")
    def test_protection_events_sorted_provincial_first(self, mock_model):
        mock_model.objects.get.return_value = self._mock_data(
            protection_events=[
                {
                    "authority": "Local",
                    "designation_or_protection_start_date": "2000-01-01",
                    "legal_instrument": "",
                    "government_name": "",
                },
                {
                    "authority": "Provincial",
                    "designation_or_protection_start_date": "1990-01-01",
                    "legal_instrument": "",
                    "government_name": "",
                },
            ]
        )
        context = self.view.get_context_data("uuid")
        self.assertEqual(
            context["data"].protection_events[0]["authority"], "Provincial"
        )

    @patch("bcrhp.views.crhp.CrhpExportData")
    def test_single_protection_event_not_sorted(self, mock_model):
        mock_model.objects.get.return_value = self._mock_data(
            protection_events=[
                {
                    "authority": "Local",
                    "designation_or_protection_start_date": "2000-01-01",
                    "legal_instrument": "",
                    "government_name": "",
                },
            ]
        )
        context = self.view.get_context_data("uuid")
        self.assertEqual(context["data"].protection_events[0]["authority"], "Local")

    @patch("bcrhp.views.crhp.CrhpExportData")
    def test_image_type_historical_mapped(self, mock_model):
        mock_model.objects.get.return_value = self._mock_data(
            site_images=[
                {
                    "image_type": "Historical",
                    "copyright": "",
                    "image_caption": "",
                    "image_description": "",
                    "image_content_type": "",
                }
            ]
        )
        context = self.view.get_context_data("uuid")
        self.assertEqual(context["data"].site_images[0]["image_type"], "Historic Image")

    @patch("bcrhp.views.crhp.CrhpExportData")
    def test_image_type_non_historical_mapped(self, mock_model):
        mock_model.objects.get.return_value = self._mock_data(
            site_images=[
                {
                    "image_type": "Contemporary",
                    "copyright": "",
                    "image_caption": "",
                    "image_description": "",
                    "image_content_type": "",
                }
            ]
        )
        context = self.view.get_context_data("uuid")
        self.assertEqual(
            context["data"].site_images[0]["image_type"], "Contemporary Photograph"
        )

    @patch("bcrhp.views.crhp.CrhpExportData")
    def test_significant_event_date_converted(self, mock_model):
        mock_model.objects.get.return_value = self._mock_data(
            significant_events=[
                {
                    "start_year": "1950-01-01",
                    "end_year": "1960-01-01",
                    "event_type": "Construction",
                    "dates_approximate": False,
                }
            ]
        )
        context = self.view.get_context_data("uuid")
        self.assertIsInstance(
            context["data"].significant_events[0]["start_year"], datetime.datetime
        )
