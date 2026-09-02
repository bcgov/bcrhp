"""
Unit tests for bcrhp/views/search.py
"""

import json
from unittest.mock import MagicMock, patch

from django.test import TestCase, RequestFactory

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _unwrap(func):
    """Return the innermost function, bypassing @wraps-style decorators."""
    while hasattr(func, "__wrapped__"):
        func = func.__wrapped__
    return func


def _mock_request(factory, method="GET", **params):
    request = factory.get("/", params) if method == "GET" else factory.post("/", params)
    request.user = MagicMock()
    request.user.username = "testuser"
    return request


def _get_export_results():
    """Import and unwrap export_results to bypass group_required."""
    from bcrhp.views.search import export_results

    return _unwrap(export_results)


# ===========================================================================
# export_results — below download threshold
# ===========================================================================


class ExportResultsBelowLimitTest(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.export_results = _get_export_results()

    def _request(self, **params):
        return _mock_request(self.factory, **params)

    @patch("bcrhp.views.search.settings")
    @patch("bcrhp.views.search.zip_utils")
    def test_tilecsv_calls_exporter_and_zip(self, mock_zip, mock_settings):
        mock_settings.SEARCH_EXPORT_IMMEDIATE_DOWNLOAD_THRESHOLD = 1000
        mock_settings.SEARCH_EXPORT_IMMEDIATE_DOWNLOAD_THRESHOLD_HTML_FORMAT = 500
        mock_settings.APP_NAME = "BCRHP"
        mock_zip.zip_response.return_value = MagicMock(status_code=200)

        request = self._request(total="5", format="tilecsv")
        with patch(
            "bcrhp.search.search_export.BCRHPSearchResultsExporter"
        ) as mock_exp_cls:
            mock_exp_cls.return_value.export.return_value = ([], {})
            self.export_results(request)
            mock_exp_cls.return_value.export.assert_called_once()
            mock_zip.zip_response.assert_called_once()

    @patch("bcrhp.views.search.settings")
    @patch("bcrhp.views.search.zip_utils")
    def test_empty_shp_export_appends_error_file(self, mock_zip, mock_settings):
        mock_settings.SEARCH_EXPORT_IMMEDIATE_DOWNLOAD_THRESHOLD = 1000
        mock_settings.SEARCH_EXPORT_IMMEDIATE_DOWNLOAD_THRESHOLD_HTML_FORMAT = 500
        mock_settings.APP_NAME = "BCRHP"
        mock_zip.zip_response.return_value = MagicMock(status_code=200)

        request = self._request(total="5", format="shp")
        with patch(
            "bcrhp.search.search_export.BCRHPSearchResultsExporter"
        ) as mock_exp_cls:
            mock_exp_cls.return_value.export.return_value = ([], {})
            self.export_results(request)
            files_arg = mock_zip.zip_response.call_args[0][0]
            self.assertEqual(len(files_arg), 1)
            self.assertEqual(files_arg[0]["name"], "error.txt")

    @patch("bcrhp.views.search.settings")
    @patch("bcrhp.views.search.zip_utils")
    def test_tilexl_saves_to_temp_file(self, mock_zip, mock_settings):
        mock_settings.SEARCH_EXPORT_IMMEDIATE_DOWNLOAD_THRESHOLD = 1000
        mock_settings.SEARCH_EXPORT_IMMEDIATE_DOWNLOAD_THRESHOLD_HTML_FORMAT = 500
        mock_settings.APP_NAME = "BCRHP"
        mock_zip.zip_response.return_value = MagicMock(status_code=200)

        request = self._request(total="5", format="tilexl")
        fake_wb = MagicMock()
        fake_wb.save = MagicMock()
        with patch(
            "bcrhp.search.search_export.BCRHPSearchResultsExporter"
        ) as mock_exp_cls:
            mock_exp_cls.return_value.export.return_value = (
                [{"name": "export.xlsx", "outputfile": fake_wb}],
                {},
            )
            self.export_results(request)
            fake_wb.save.assert_called_once()
            mock_zip.zip_response.assert_called_once()


# ===========================================================================
# export_results — above download threshold
# ===========================================================================


class ExportResultsAboveLimitTest(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.export_results = _get_export_results()

    def _patch_settings(self, mock_settings, restrict_anonymous=True):
        mock_settings.SEARCH_EXPORT_IMMEDIATE_DOWNLOAD_THRESHOLD = 10
        mock_settings.SEARCH_EXPORT_IMMEDIATE_DOWNLOAD_THRESHOLD_HTML_FORMAT = 5
        mock_settings.APP_NAME = "BCRHP"
        mock_settings.RESTRICT_CELERY_EXPORT_FOR_ANONYMOUS_USER = restrict_anonymous

    def _request(self, username="testuser", **params):
        request = _mock_request(self.factory, total="100", format="tilecsv", **params)
        request.user.username = username
        return request

    @patch("bcrhp.views.search.settings")
    def test_anonymous_user_restricted_returns_failure(self, mock_settings):
        self._patch_settings(mock_settings, restrict_anonymous=True)
        response = self.export_results(self._request(username="anonymous"))
        body = json.loads(response.content)
        self.assertFalse(body["success"])

    @patch("bcrhp.views.search.settings")
    @patch("bcrhp.views.search.task_management")
    @patch("bcrhp.views.search.tasks")
    @patch("bcrhp.views.search.update_user_task_record", new=MagicMock())
    @patch("bcrhp.views.search.log_error", new=MagicMock())
    def test_celery_available_dispatches_task_and_returns_success(
        self, mock_tasks, mock_tm, mock_settings
    ):
        self._patch_settings(mock_settings, restrict_anonymous=False)
        mock_tm.check_if_celery_available.return_value = True
        mock_tasks.export_search_results.apply_async.return_value = MagicMock()

        response = self.export_results(self._request())
        body = json.loads(response.content)
        self.assertTrue(body["success"])
        mock_tasks.export_search_results.apply_async.assert_called_once()

    @patch("bcrhp.views.search.settings")
    @patch("bcrhp.views.search.task_management")
    def test_celery_unavailable_returns_failure(self, mock_tm, mock_settings):
        self._patch_settings(mock_settings, restrict_anonymous=False)
        mock_tm.check_if_celery_available.return_value = False

        response = self.export_results(self._request())
        body = json.loads(response.content)
        self.assertFalse(body["success"])

    @patch("bcrhp.views.search.settings")
    def test_html_format_uses_html_download_threshold(self, mock_settings):
        # HTML threshold is lower; with total=6 it should exceed the HTML limit (5)
        # but not the normal limit (10). Restrict anon=True and user=anonymous to
        # confirm the over-limit path is triggered.
        self._patch_settings(mock_settings, restrict_anonymous=True)
        request = _mock_request(self.factory, total="6", format="html")
        request.user.username = "anonymous"

        response = self.export_results(request)
        body = json.loads(response.content)
        self.assertFalse(body["success"])

    @patch("bcrhp.views.search.settings")
    @patch("bcrhp.views.search.zip_utils")
    def test_geojson_above_limit_skips_celery(self, mock_zip, mock_settings):
        # geojson bypasses the celery path even above the limit
        self._patch_settings(mock_settings, restrict_anonymous=False)
        mock_zip.zip_response.return_value = MagicMock(status_code=200)

        request = _mock_request(self.factory, total="100", format="geojson")
        with patch(
            "bcrhp.search.search_export.BCRHPSearchResultsExporter"
        ) as mock_exp_cls:
            mock_exp_cls.return_value.export.return_value = ([], {})
            self.export_results(request)
            mock_zip.zip_response.assert_called_once()
