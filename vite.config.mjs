import { defineConfig, searchForWorkspaceRoot } from 'vite';
import path from 'path';
import vue from '@vitejs/plugin-vue';
// import { vitePluginRequire } from 'vite-plugin-require';
// import { node } from 'globals';
// const { resolve } = require('path');
// const appRoot = '/Users/brett/work/repo/git/arches/split/bcrhp';
const appRoot = '/web_root/bcrhp';

export default defineConfig({
    optimizeDeps: {
        include: [
            /*'mod_arches', 'arches'*/
        ],
    },
    // publicDir: 'http://localhost/',
    // base: '/bcrhp/static',
    resolve: {
        extensions: ['.js', '.json'],
        alias: [
            {
                // This is to get out of the webpack/requireJS ecosystem
                find: '/bcrhp/static/build/js/views/root.js',
                replacement: path.resolve(
                    path.join(appRoot, 'bcrhp', 'src', 'root.js'),
                ),
            },
            // {
            //     find: '/bcrhp/static/build/js/views/root.js',
            //     replacement: path.resolve(
            //         path.join(
            //             appRoot,
            //             'bcrhp',
            //             'media',
            //             'js',
            //             'views',
            //             'root.js',
            //         ),
            //     ),
            // },
            {
                find: '@/arches',
                replacement: path.resolve(
                    path.join(
                        appRoot,
                        '..',
                        'arches',
                        'arches',
                        'app',
                        'src',
                        'arches',
                    ),
                ),
            },
            // {
            //     find: 'mod_arches_vue_init',
            //     replacement: path.resolve(
            //         path.join(
            //             appRoot,
            //             '..',
            //             'arches',
            //             'arches',
            //             'app',
            //             'media',
            //             'js',
            //             'utils',
            //             'create-vue-application_esm.js',
            //         ),
            //     ),
            // },
            // {
            //     find: 'mod_arches',
            //     replacement: path.resolve(
            //         path.join(
            //             appRoot,
            //             '..',
            //             'arches',
            //             'arches',
            //             'app',
            //             'media',
            //             'js',
            //             'arches_esm.js',
            //         ),
            //     ),
            // },
            // {
            //     find: /^arches$/,
            //     replacement: path.resolve(
            //         path.join(
            //             appRoot,
            //             '..',
            //             'arches',
            //             'arches',
            //             'app',
            //             'media',
            //             'js',
            //             'arches.js',
            //         ),
            //     ),
            // },

            {
                find: '@/bcgov_arches_common',
                replacement: path.resolve(
                    path.join(
                        __dirname,
                        '../arches_common/bcgov_arches_common/src/bcgov_arches_common',
                    ),
                ),
            },
            {
                find: '@/bcrhp',
                replacement: path.resolve(
                    path.join(__dirname, './bcrhp/src/bcrhp'),
                ),
            },
        ],
        // alias: [
        //     {
        //         find: '@/bcrhp/',
        //         replacement: fileURLToPath(new URL('bcrhp', import.meta.url)),
        //     },
        // ],
    },
    plugins: [vue()],
    server: {
        root: path.resolve('./bcrhp/src'),
        host: 'localhost',
        open: false,
        cors: {
            // the origin you will be accessing via browser
            origin: 'http://localhost',
        },
        base: '/bcrhp/static',
        origin: 'http://localhost',
        // port: 80,
        watch: {
            usePolling: true,
            disableGlobbing: false,
            ignored: ['**/*.log', '.idea/**'],
        },
        deps: {
            inline: ['node' /*'mod_arches'*/, 'arches'],
        },
        fs: {
            allow: [
                searchForWorkspaceRoot(process.cwd()),
                '/web_root/arches_common/bcgov_arches_common/media',
                '/web_root/arches/arches/app',
            ],
        },
    },
    build: {
        outdir: path.resolve('./bcrhp/staticfiles/dist'),
        // ssrManifest: 'manifest.json',
        sourcemap: true,
        assetsDir: '',
        // manifest: 'manifest.json',
        manifest: true,
        emptyOutDir: true,
        target: 'es2015',
        appType: 'mpa',
        commonjsOptions: {
            transformMixedEsModules: true,
            include: [/arches.js/, /arches/],
            extensions: ['.js', '.cjs'],
        },
        rollupOptions: {
            input: {
                main: path.resolve('./bcrhp/media/js/views/root.js'),
                //main: path.resolve('./bcrhp/src/root.js'),
            },
            output: {
                chunkFileNames: undefined,
            },
        },
    },
});
