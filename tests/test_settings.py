"""
ARCHES - a program developed to inventory and manage immovable cultural heritage.
Copyright (C) 2013 J. Paul Getty Trust and World Monuments Fund

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.
"""

import os

from bcrhp.settings import *

PACKAGE_NAME = "bcrhp"

PROJECT_TEST_ROOT = os.path.dirname(__file__)
MEDIA_ROOT = os.path.join(PROJECT_TEST_ROOT, "fixtures", "data")

BUSINESS_DATA_FILES = (
    # Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
)

DATABASES = {
    "default": {
        "ATOMIC_REQUESTS": False,
        "AUTOCOMMIT": True,
        "CONN_MAX_AGE": 0,
        "ENGINE": "django.contrib.gis.db.backends.postgis",
        "HOST": "localhost",
        "NAME": "bcrhp",
        "OPTIONS": {},
        "PASSWORD": "postgis",
        "PORT": "5432",
        "POSTGIS_TEMPLATE": "template_postgis",
        "TEST": {"CHARSET": None, "COLLATION": None, "MIRROR": None, "NAME": None},
        "TIME_ZONE": None,
        "USER": "postgres",
        "DATABC_USERNAME": "proxy_databc",
        "DATABC_PASSWORD": "databc_password",
    }
}

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.dummy.DummyCache",
    },
    "user_permission": {
        "BACKEND": "django.core.cache.backends.dummy.DummyCache",
        "LOCATION": "user_permission_cache",
    },
}

LOGGING["loggers"]["arches"]["level"] = "ERROR"

ELASTICSEARCH_PREFIX = "test"

TEST_RUNNER = "arches.test.runner.ArchesTestRunner"
SILENCED_SYSTEM_CHECKS.append(
    "arches.W001",  # Cache backend does not support rate-limiting
)

ELASTICSEARCH_HOSTS = [
    {"scheme": "http", "host": "localhost", "port": ELASTICSEARCH_HTTP_PORT}
]

AUTHLIB_OAUTH_CLIENTS = {
    "default": {
        "auth_required": False,
        "client_id": get_env_variable("OAUTH_CLIENT_ID"),
        "client_secret": get_env_variable("OAUTH_CLIENT_SECRET"),
        "authorize_url": get_env_variable("OAUTH_AUTH_ENDPOINT"),
        "access_token_url": get_env_variable("OAUTH_TOKEN_ENDPOINT"),
        "refresh_token_url": get_env_variable("OAUTH_TOKEN_ENDPOINT"),
        "server_metadata_url": get_env_variable("OAUTH_SERVER_METADATA_URL"),
        "client_kwargs": {
            "scope": "openid profile email",
            "token_endpoint_auth_method": "client_secret_post",
        },
        "urls": {
            "home_page": "/bcrhp/search",
            "unauthorized_page": "/bcrhp/unauthorized",
            "unauthorized_template": "unauthorized.htm",
            "auth_exempt_pages": [],
        },
    }
}
