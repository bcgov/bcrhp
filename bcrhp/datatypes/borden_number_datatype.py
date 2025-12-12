import json
import logging

from arches.app.datatypes.datatypes import StringDataType
from arches.app.models import models
import re
from bcrhp.util.bcap_borden_number_api import BordenNumberApi

borden_number_widget = models.Widget.objects.get(name="borden-number-widget")

details = {
    "datatype": "borden-number-datatype",
    "iconclass": "fa fa-file-code-o",
    "modulename": "borden_number_datatype.py",
    "classname": "BordenNumberDataType",
    "defaultwidget": borden_number_widget,
    "defaultconfig": {"format": "AaAa-000", "pgDatatype": "jsonb"},
    "configcomponent": "views/components/datatypes/string",
    "configname": "string-datatype-config",
    "isgeometric": False,
    "issearchable": True,
}

logger = logging.getLogger(__name__)


class BordenNumberDataType(StringDataType):
    borden_number_format = re.compile("^[A-Z][a-z][A-Z][a-z]-\\d{1,4}$")
    bn_api = BordenNumberApi()

    def validate(
        self,
        value,
        row_number=None,
        source=None,
        node=None,
        nodeid=None,
        strict=False,
        **kwargs,
    ):
        errors = super(BordenNumberDataType, self).validate(
            value, row_number, source, node, nodeid, strict, **kwargs
        )
        resource_id = None

        if (
            kwargs["request"]
            and kwargs["request"].POST
            and kwargs["request"].POST.get("data")
        ):
            dict = json.JSONDecoder().decode(kwargs["request"].POST.get("data"))
            if dict is not None:
                resource_id = dict["resourceinstance_id"]

        logger.debug("Validating for resource instance id %s" % resource_id)
        try:
            if value is not None:
                result = self.borden_number_format.match(value["en"]["value"])
                if not result:
                    errors.append(
                        {
                            "type": "ERROR",
                            "message": "Invalid borden number format: {0}. Valid format is: {1}. {2}".format(
                                value["en"]["value"],
                                self.datatype_model.defaultconfig["format"],
                                "This data was not imported.",
                            ),
                        }
                    )
                elif resource_id:
                    try:
                        logger.debug("Values: %s, %s" % (value, resource_id))
                        logger.debug("Validating BN existence in validate()")
                        if self.bn_api.validate_borden_number(
                            value["en"]["value"], resource_id
                        ):
                            errors.append(
                                {
                                    "type": "ERROR",
                                    "message": "Borden Number already exists.",
                                }
                            )
                    except Exception as e:
                        errors.append({"type": "ERROR", "message": str(e)})
        except Exception as e:
            print(e)
            errors.append(
                {
                    "type": "ERROR",
                    "message": "datatype: {0} value: {1} Exception: {2}".format(
                        self.datatype_model.datatype, value, e
                    ),
                }
            )
        return errors

    def clean(self, tile, nodeid):
        pass

    def pre_tile_save(self, tile, nodeid):
        super().pre_tile_save(tile, nodeid)
        if not self.bn_api.validate_borden_number(
            tile.data[nodeid]["en"]["value"], tile.resourceinstance_id
        ):
            raise Exception("Borden Number has been allocated to another site.")

    def post_tile_save(self, tile, nodeid, request):
        # This needs to happen after the save as we can't rollback the HRIA transaction after it is done.
        # @todo - Should look into whether we can actually create the record in HRIA before the save and commit after

        logger.debug("Tile: %s" % tile.data)
        value = tile.data[nodeid]["en"]["value"]
        # print("Saving %s:%s" % (tile.resourceinstance_id, value))
        logger.debug(
            "Trying to reserve borden number %s for %s"
            % (value, tile.resourceinstance_id)
        )
        reserved_borden_number = self.bn_api.get_next_borden_number(
            tile.resourceinstance_id, True
        )
        # If the next value has changed, set it in the tile and re-save
        if reserved_borden_number != value:
            tile.data[nodeid]["en"]["value"] = reserved_borden_number
            tile.save()
