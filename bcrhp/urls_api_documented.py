# This is used so we don't try to get the OpenAPI Spec of Arches serializers.
# The introspection will fail unless we override by hand-declaring their schema with @extend_schema(responses=...)
# So our views only consider bcap only for now.
# python3 manage.py spectacular --urlconf bcap.urls_api_documented --file schema.yml
# npm run openapi:types (see README.md, "BCAP API contract")
from django.urls import include, path, re_path
from bcrhp.urls import bc_path_prefix

urlpatterns = [
    path(bc_path_prefix(), include("bcrhp.urls_api_generated")),
]
