### Steps to get Vite dev server running
1. Delete and recreate docker containers to map the Vite dev server port (5173):
```shell
docker compose down
docker image rm bcgov/bcrhp7-6 bcgov/bcrhp-webpack7-6
docker compose up
```
2. Login to docker conatiner
```shell
docker exec -it bcrhp7-6 /bin/bash
```
2. Run `pip install .[dev]` in bcrhp directory
3. Run `npm install` directory
4. Run `cd ../arches_common && npm install && cd ../bcrhp` (need to figure out why is install here is necessary)
5. Run `npm build_development` in bcrhp directory
6. Run `npm vite_dev` in bcrhp directory - this should start the Vite dev server
7. Open BCRHP app in web browser then login
8. Navigate to `http://localhost/bcrhp/submissions/` - you should see assets being served by Vite dev server

### Concepts
1. The idea is to have Vite server host all the Vue assets while leaving Webpack to deal with the Arches core /
KO assets
2. We have replicated the Vue entrypoint `media/js/views/root.js` with an ESM version in `bcrhp/src/root.js` to
help segregate the Webpack/RequireJS from Vite (we may be able to put it back in the original place - tbd).
3. We have created a copy of the `templates/views/bcrhp/root.htm` -> root_vue_dev.htm to isolate that file from the rest of the Webpack / RequireJS
stack, which was pulling in libraries and frameworks that were causing issues.

### TODOs
1. Eliminate the base dir configuration in vite.config.mjs
2. Only load the django-vite app and configuration in dev mode
3. See if we can eliminate the copy of root.js in `bcrhp/src`
4. Remove some configuration around `arches` and `arches.js`, etc in `vite.config.js` to clean things up
5. Revisit config added to settings.py (duplicate values, ensure removing doesn't mess up order)