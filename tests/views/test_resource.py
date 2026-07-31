"""
Unit tests for bcrhp/views/resource.py
"""

from unittest.mock import MagicMock, patch

from django.test import TestCase, RequestFactory

from bcrhp.views.resource import ResourceReportView


def _mock_request(factory, method="GET", **params):
    request = factory.get("/", params) if method == "GET" else factory.post("/", params)
    request.user = MagicMock()
    request.user.username = "testuser"
    return request


class ResourceReportViewTest(TestCase):
    def setUp(self):
        self.factory = RequestFactory()

    def test_get_delegates_to_parent(self):
        view = ResourceReportView()
        request = _mock_request(self.factory)
        resource_id = "test-resource-id"
        parent_cls = ResourceReportView.__bases__[0]
        sentinel = MagicMock(status_code=200)
        with patch.object(parent_cls, "get", return_value=sentinel) as mock_parent:
            result = view.get(request, resourceid=resource_id)
            mock_parent.assert_called_once_with(request, resource_id)
            self.assertIs(result, sentinel)
