1. Add django-vite python package
2. Run pip install .[dev] in bcrhp directory
3. Run npm install in bcrhp directory
4. Run npm install in arches_common directory (why is this necssary?)
5. Run npm build_development in bcrhp directory
6. Run npm dev in bcrhp directory

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
4. Remove some of configuration around `arches` and `arches.js`, etc in `vite.config.js` to clean things up