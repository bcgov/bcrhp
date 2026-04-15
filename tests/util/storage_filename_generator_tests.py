import os
from unittest.mock import Mock, patch

from django.test import TestCase

from bcrhp.util.storage_filename_generator import generate_filename


class TestGenerateFilename(TestCase):
    def setUp(self):
        # Clear cached function attributes so each test starts fresh
        for attr in ("borden_number_node", "borden_number_datatype"):
            if hasattr(generate_filename, attr):
                delattr(generate_filename, attr)

    def _make_instance(self, resource_id="resource-uuid", graph_slug="heritage_site"):
        instance = Mock()
        instance.tile.resourceinstance.resourceinstanceid = resource_id
        instance.tile.resourceinstance.graph.slug = graph_slug
        return instance

    def _setup_mocks(self, mock_node_objects, mock_factory_cls, borden_display_value):
        mock_node = Mock()
        mock_node.datatype = "string"
        mock_node.nodegroup = Mock()
        mock_node_objects.filter.return_value.first.return_value = mock_node

        mock_datatype = Mock()
        mock_datatype.get_display_value.return_value = borden_display_value
        mock_factory_cls.return_value.get_instance.return_value = mock_datatype

        return mock_node, mock_datatype

    @patch("bcrhp.util.storage_filename_generator.datatypes.datatypes.DataTypeFactory")
    @patch("bcrhp.util.storage_filename_generator.models.Node.objects")
    @patch("bcrhp.util.storage_filename_generator.models.TileModel.objects")
    def test_borden_number_with_hyphen_splits_into_path_components(
        self, mock_tile_objects, mock_node_objects, mock_factory_cls
    ):
        self._setup_mocks(mock_node_objects, mock_factory_cls, "GcRs-1")
        mock_tile_objects.filter.return_value.first.return_value = Mock()

        result = generate_filename(self._make_instance(), "photo.jpg")

        self.assertEqual(
            result, os.path.join("heritage_site", "GcRs", "1", "photo.jpg")
        )

    @patch("bcrhp.util.storage_filename_generator.datatypes.datatypes.DataTypeFactory")
    @patch("bcrhp.util.storage_filename_generator.models.Node.objects")
    @patch("bcrhp.util.storage_filename_generator.models.TileModel.objects")
    def test_borden_number_without_hyphen_falls_back_to_resource_id(
        self, mock_tile_objects, mock_node_objects, mock_factory_cls
    ):
        self._setup_mocks(mock_node_objects, mock_factory_cls, "GcRs1")
        mock_tile_objects.filter.return_value.first.return_value = Mock()

        result = generate_filename(
            self._make_instance(resource_id="resource-uuid-123"), "photo.jpg"
        )

        self.assertEqual(
            result, os.path.join("heritage_site", "resource-uuid-123", "photo.jpg")
        )

    @patch("bcrhp.util.storage_filename_generator.datatypes.datatypes.DataTypeFactory")
    @patch("bcrhp.util.storage_filename_generator.models.Node.objects")
    @patch("bcrhp.util.storage_filename_generator.models.TileModel.objects")
    def test_none_borden_number_falls_back_to_resource_id(
        self, mock_tile_objects, mock_node_objects, mock_factory_cls
    ):
        self._setup_mocks(mock_node_objects, mock_factory_cls, None)
        mock_tile_objects.filter.return_value.first.return_value = Mock()

        result = generate_filename(
            self._make_instance(resource_id="resource-uuid-456"), "file.txt"
        )

        self.assertEqual(
            result, os.path.join("heritage_site", "resource-uuid-456", "file.txt")
        )

    @patch("bcrhp.util.storage_filename_generator.datatypes.datatypes.DataTypeFactory")
    @patch("bcrhp.util.storage_filename_generator.models.Node.objects")
    @patch("bcrhp.util.storage_filename_generator.models.TileModel.objects")
    def test_no_borden_number_tile_uses_resource_id(
        self, mock_tile_objects, mock_node_objects, mock_factory_cls
    ):
        self._setup_mocks(mock_node_objects, mock_factory_cls, "GcRs-1")
        mock_tile_objects.filter.return_value.first.return_value = None  # no tile

        result = generate_filename(
            self._make_instance(resource_id="resource-uuid-789"), "doc.pdf"
        )

        self.assertEqual(
            result, os.path.join("heritage_site", "resource-uuid-789", "doc.pdf")
        )

    @patch("bcrhp.util.storage_filename_generator.datatypes.datatypes.DataTypeFactory")
    @patch("bcrhp.util.storage_filename_generator.models.Node.objects")
    @patch("bcrhp.util.storage_filename_generator.models.TileModel.objects")
    def test_no_graph_slug_falls_back_to_system_settings(
        self, mock_tile_objects, mock_node_objects, mock_factory_cls
    ):
        self._setup_mocks(mock_node_objects, mock_factory_cls, "GcRs-1")
        mock_tile_objects.filter.return_value.first.return_value = Mock()

        result = generate_filename(self._make_instance(graph_slug=None), "image.png")

        self.assertEqual(
            result, os.path.join("system_settings", "GcRs", "1", "image.png")
        )

    @patch("bcrhp.util.storage_filename_generator.datatypes.datatypes.DataTypeFactory")
    @patch("bcrhp.util.storage_filename_generator.models.Node.objects")
    @patch("bcrhp.util.storage_filename_generator.models.TileModel.objects")
    def test_node_and_datatype_are_cached_after_first_call(
        self, mock_tile_objects, mock_node_objects, mock_factory_cls
    ):
        self._setup_mocks(mock_node_objects, mock_factory_cls, "GcRs-1")
        mock_tile_objects.filter.return_value.first.return_value = Mock()

        generate_filename(self._make_instance(), "a.jpg")
        generate_filename(self._make_instance(), "b.jpg")

        # Node and datatype lookups should only happen once despite two calls
        mock_node_objects.filter.assert_called_once()
        mock_factory_cls.assert_called_once()
