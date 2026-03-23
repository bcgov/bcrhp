from bcrhp.settings import *


def deployment_settings(request=None):
    return {
        "deployment_settings": {
            "DEPLOYMENT_TIMESTAMP": (
                DEPLOYMENT_TIMESTAMP if DEPLOYMENT_TIMESTAMP else ""
            ),
        }
    }
