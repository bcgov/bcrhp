Developing in Docker instance.

1. Branches:
BCRHP: `brf/feat/1290_integrate_component_lab`
BCGov Arches Common: `brf/feat/update_api`
Arches Component Lab: `main`
Arches: `stable/7.6.9_bcgov`


2. Change the following lines in pyproject.json:
```shell
    "arches==7.6.9",
    "bcgov_arches_common @ git+https://github.com/bcgov/arches_common@release/1.1.0_add_vue_components",
    "arches-component-lab==0.0.1",
```
to 
```shell
    "arches @ file:../arches",
    "bcgov_arches_common @ file:../arches_common",
    "arches-component-lab @ file:../arches-component-lab",
```

3. Change the following lines in package.json:
```shell
        "arches-component-lab": "latest",
        "bcgov_arches_common": "github:bcgov/arches_common#release/1.1.0_add_vue_components",
```
to
```shell
        "arches-component-lab": "file:../arches-component-lab",
        "bcgov_arches_common": "file:../arches_common",
```
4. Update `bcrhp/settings.py` to run using Vite. Change the following line
```python
DJANGO_VITE = {
    "default": {
        "dev_mode": False,  # <---- This value
        "static_url_prefix": "/",
    }
}
```
to
```python
DJANGO_VITE = {
    "default": {
        "dev_mode": True,# <---- This value
        "static_url_prefix": "/",
    }
}
```

5. Start the container from `bcrhp` (directory with the `docker-compose.yml` file:
`docker compose up`

6. Connect to docker container and build the frontend components:
```shell
docker exec -it bcrhp7-6 /bin/bash
python3.11 manage.py check
npm run build_development
npm run vite_dev
```