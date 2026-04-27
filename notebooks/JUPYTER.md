# Jupyter in Docker

This document describes how to run Jupyter Server inside the `bcrhp-jupyter` container for interactive data exploration and analysis against the live Django/Arches environment.

---

## Overview

Jupyter runs as a separate Docker service built from the same base image as the main `bcrhp` application. This means the notebook environment has direct access to the Django ORM, all installed Arches packages, and the same database the application uses.

Jupyter dependencies (`jupyterlab`, `pandas`, `matplotlib`, etc.) are installed only in the `jupyter` stage of the multi-stage Dockerfile and are not present in the main application container.

---

## Prerequisites

- Docker and Docker Compose installed and running
- The `arches7-5-2-dev` Docker network exists (shared with the main stack)
- The main `bcrhp` service is running or has been built at least once

---

## Starting the Jupyter Container

The Jupyter service is not started by default with `docker compose up`. Start it explicitly:

```bash
docker compose up bcrhp-jupyter
```

Or to run it in the background:

```bash
docker compose up -d bcrhp-jupyter
```

On first run, Docker will build the `jupyter` stage of the Dockerfile. Subsequent starts reuse the cached image.

---

## Connecting from PyCharm

1. Start the Jupyter container as described above.
2. Look for the token in the container logs:
   ```bash
   docker compose logs bcrhp-jupyter
   ```
   You will see a line like:
   ```
   http://127.0.0.1:8888/lab?token=abc123def456...
   ```
3. In PyCharm, open **Settings → Languages & Frameworks → Jupyter**.
4. Click **Add Jupyter Server** (`+`) and select **Configured Server**.
5. Enter the server URL including the token:
   ```
   http://localhost:8888/?token=abc123def456...
   ```
6. Click **Apply** and **OK**.

### Setting a fixed token

To avoid copying a new token each time the container restarts, set a fixed token in `docker/env_file.env`:

```bash
JUPYTER_TOKEN=yourtoken
```

Then connect PyCharm to:
```
http://localhost:8888/?token=yourtoken
```

---

## Using the Django ORM in Notebooks

Because the Jupyter container shares the same environment and database credentials as the main application, you can query Django models directly. Add this setup block at the top of any notebook:

```python
import django
import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "bcrhp.settings")
django.setup()
```

After that, import and use models normally:

```python
from arches.app.models.models import ResourceInstance

ResourceInstance.objects.filter(graph_id="...").count()
```

---

## Notebook Files

Notebooks are stored in `bcrhp/notebooks/` and are mounted into the container at `/web_root/bcrhp/notebooks`. This directory is version-controlled, but notebook output is stripped before commit (see [Pre-commit Hook](#pre-commit-hook) below).

Create subdirectories to organise notebooks by topic, for example:

```
notebooks/
  exploration/
  reporting/
  data-fixes/
```

---

## Pre-commit Hook (nbstripout)

`nbstripout` is included in the `jupyter` dependency group. It strips cell outputs and execution counts from notebooks before they are committed, keeping diffs clean and avoiding accidental commit of sensitive query results.

### Setup (one time per developer)

With the virtual environment or uv environment active:

```bash
nbstripout --install
```

This installs a git filter that runs automatically on `git add` for any `.ipynb` file.

### Verify it is installed

```bash
nbstripout --status
```

---

## Dependency Management

Jupyter dependencies are declared separately in `pyproject.toml` under the `jupyter` dependency group:

```toml
[dependency-groups]
jupyter = [
    "ipykernel",
    "jupyterlab",
    "pandas",
    "matplotlib",
    "seaborn",
    "tabulate",
    "openpyxl",
    "nbstripout",
]
```

To add a new library for use in notebooks, add it to this group and rebuild the Jupyter image:

```bash
docker compose build bcrhp-jupyter
docker compose up bcrhp-jupyter
```

The main `bcrhp` application image is not affected by changes to the `jupyter` group.

---

## Stopping the Container

```bash
docker compose stop bcrhp-jupyter
```

Or to remove the container entirely:

```bash
docker compose rm -sf bcrhp-jupyter
```

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `localhost:8888` not reachable | Container not running or port conflict | Run `docker compose ps` to confirm it is up; check nothing else is using port 8888 |
| `403 Forbidden` in PyCharm | Wrong or expired token | Re-check token from `docker compose logs bcrhp-jupyter` |
| `ImproperlyConfigured` in notebook | `DJANGO_SETTINGS_MODULE` not set | Add `os.environ.setdefault(...)` and `django.setup()` as shown above |
| Database connection error in notebook | DB env vars not available | Confirm the `jupyter` service uses the same `env_file` as the `bcrhp` service |
| Image not rebuilding after dep change | Docker cache | Run `docker compose build --no-cache bcrhp-jupyter` |
| Notebook output committed to git | `nbstripout` not installed | Run `nbstripout --install` in the repo root |
