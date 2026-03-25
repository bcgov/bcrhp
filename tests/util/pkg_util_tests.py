import json
import os
import tempfile
from unittest.mock import patch

from django.test import TestCase

from bcrhp.util.pkg_util import get_mapbox_spec_files


class TestGetMapboxSpecFiles(TestCase):
    def _map_layers_dir(self, tmp_dir):
        """Returns the map_layers path and the mocked dirname value for a temp dir."""
        util_dir = os.path.join(tmp_dir, "util")
        map_layers_dir = os.path.join(tmp_dir, "pkg", "map_layers")
        os.makedirs(util_dir)
        os.makedirs(map_layers_dir)
        return util_dir, map_layers_dir

    def test_returns_name_and_realpath_for_valid_json(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            util_dir, map_layers_dir = self._map_layers_dir(tmp_dir)
            spec_file = os.path.join(map_layers_dir, "satellite.json")
            with open(spec_file, "w") as f:
                json.dump({"name": "Satellite Imagery"}, f)

            with patch("bcrhp.util.pkg_util.os.path.dirname", return_value=util_dir):
                result = get_mapbox_spec_files()

        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["name"], "Satellite Imagery")
        self.assertEqual(result[0]["path"], os.path.realpath(spec_file))

    def test_ignores_non_json_files(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            util_dir, map_layers_dir = self._map_layers_dir(tmp_dir)
            with open(os.path.join(map_layers_dir, "readme.txt"), "w") as f:
                f.write("not json")

            with patch("bcrhp.util.pkg_util.os.path.dirname", return_value=util_dir):
                result = get_mapbox_spec_files()

        self.assertEqual(result, [])

    def test_skips_invalid_json(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            util_dir, map_layers_dir = self._map_layers_dir(tmp_dir)
            with open(os.path.join(map_layers_dir, "bad.json"), "w") as f:
                f.write("{not valid json{{")

            with patch("bcrhp.util.pkg_util.os.path.dirname", return_value=util_dir):
                result = get_mapbox_spec_files()

        self.assertEqual(result, [])

    def test_skips_json_missing_name_key(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            util_dir, map_layers_dir = self._map_layers_dir(tmp_dir)
            with open(os.path.join(map_layers_dir, "noname.json"), "w") as f:
                json.dump({"type": "raster", "tiles": []}, f)

            with patch("bcrhp.util.pkg_util.os.path.dirname", return_value=util_dir):
                result = get_mapbox_spec_files()

        self.assertEqual(result, [])

    def test_returns_empty_list_for_empty_directory(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            util_dir, _ = self._map_layers_dir(tmp_dir)

            with patch("bcrhp.util.pkg_util.os.path.dirname", return_value=util_dir):
                result = get_mapbox_spec_files()

        self.assertEqual(result, [])

    def test_discovers_specs_in_nested_subdirectories(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            util_dir, map_layers_dir = self._map_layers_dir(tmp_dir)
            sub_dir = os.path.join(map_layers_dir, "overlays")
            os.makedirs(sub_dir)

            with open(os.path.join(map_layers_dir, "base.json"), "w") as f:
                json.dump({"name": "Base Map"}, f)
            with open(os.path.join(sub_dir, "overlay.json"), "w") as f:
                json.dump({"name": "Overlay"}, f)

            with patch("bcrhp.util.pkg_util.os.path.dirname", return_value=util_dir):
                result = get_mapbox_spec_files()

        names = {r["name"] for r in result}
        self.assertEqual(names, {"Base Map", "Overlay"})

    def test_returns_multiple_specs_from_same_directory(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            util_dir, map_layers_dir = self._map_layers_dir(tmp_dir)

            for name in ["Layer A", "Layer B", "Layer C"]:
                with open(os.path.join(map_layers_dir, f"{name}.json"), "w") as f:
                    json.dump({"name": name}, f)

            with patch("bcrhp.util.pkg_util.os.path.dirname", return_value=util_dir):
                result = get_mapbox_spec_files()

        self.assertEqual(len(result), 3)
        self.assertEqual({r["name"] for r in result}, {"Layer A", "Layer B", "Layer C"})
