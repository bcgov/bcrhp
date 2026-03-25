from unittest.mock import Mock, patch

from django.test import TestCase

import bcrhp
from bcrhp.util.context_processors import deployment_settings


class TestDeploymentSettings(TestCase):
    def test_returns_deployment_timestamp_when_set(self):
        with patch(
            "bcrhp.util.context_processors.DEPLOYMENT_TIMESTAMP", "2026-01-01T00:00:00"
        ):
            result = deployment_settings()

        self.assertEqual(
            result["deployment_settings"]["DEPLOYMENT_TIMESTAMP"],
            "2026-01-01T00:00:00",
        )

    def test_returns_empty_string_when_timestamp_is_none(self):
        with patch("bcrhp.util.context_processors.DEPLOYMENT_TIMESTAMP", None):
            result = deployment_settings()

        self.assertEqual(result["deployment_settings"]["DEPLOYMENT_TIMESTAMP"], "")

    def test_returns_empty_string_when_timestamp_is_empty(self):
        with patch("bcrhp.util.context_processors.DEPLOYMENT_TIMESTAMP", ""):
            result = deployment_settings()

        self.assertEqual(result["deployment_settings"]["DEPLOYMENT_TIMESTAMP"], "")

    def test_returns_package_version(self):
        result = deployment_settings()

        self.assertEqual(result["deployment_settings"]["VERSION"], bcrhp.__version__)

    def test_deployment_settings_key_present(self):
        result = deployment_settings()

        self.assertIn("deployment_settings", result)

    def test_accepts_none_request(self):
        result = deployment_settings(request=None)

        self.assertIn("deployment_settings", result)

    def test_accepts_request_object(self):
        result = deployment_settings(request=Mock())

        self.assertIn("deployment_settings", result)
