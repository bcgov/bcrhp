import { defineConfig, searchForWorkspaceRoot } from 'vite';
import path from 'path';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
// const appRoot = '/Users/brett/work/repo/git/arches/split/bcrhp';
const appRoot = '/web_root/bcrhp';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import Components from 'unplugin-vue-components/vite';
import { PrimeVueResolver } from '@primevue/auto-import-resolver';

export default defineConfig({
    optimizeDeps: {
        include: [
            'primevue/components/utils/DomHandler',
            /*'mod_arches', 'arches'*/
        ],
    },
    // publicDir: 'http://localhost/',
    base: '/bcrhp/static',
    // css: {
    //     postcss: {
    //         plugins: [tailwindcss()],
    //     },
    // },
    resolve: {
        // extensions: ['.js', '.json', '.ts','.vue'],
        preserveSymlinks: true, // This is the fix!
        alias: [
            {
                // This is to get out of the webpack/requireJS ecosystem
                find: /^.*\/root_vue.js$/,
                replacement: path.resolve(
                    path.join(appRoot, 'bcrhp', 'src', 'root_vue.js'),
                ),
            },
            {
                // This is to get out of the webpack/requireJS ecosystem
                find: /^\/bcrhp\/static\/build\/css/,
                replacement: path.resolve(
                    path.join(appRoot, 'bcrhp', 'media', 'css'),
                ),
            },
            {
                // This is to get out of the webpack/requireJS ecosystem
                find: /^\/bcrhp\/static\/css/,
                replacement: path.resolve(
                    path.join(appRoot, 'bcrhp', 'media', 'css'),
                ),
            },
            {
                find: /^primevue/,
                replacement: path.resolve(
                    path.join(appRoot, 'node_modules', 'primevue'),
                ),
            },
            {
                find: /^@primevue/,
                replacement: path.resolve(
                    path.join(appRoot, 'node_modules', '@primevue'),
                ),
            },
            // {
            //     find: /.*\/primevue\/fieldset/,
            //     replacement: path.resolve(
            //         path.join(appRoot, 'node_modules', 'primevue', 'fieldset'),
            //     ),
            // },
            // {
            //     // This is to get out of the webpack/requireJS ecosystem
            //     find: /^.*\/output.css$/,
            //     replacement: path.resolve(
            //         path.join(appRoot, 'bcrhp', 'media', 'css', 'output.css'),
            //     ),
            // },
            // {
            //     // This is to get out of the webpack/requireJS ecosystem
            //     find: /^.*\/project.css$/,
            //     replacement: path.resolve(
            //         path.join(appRoot, 'bcrhp', 'media', 'css', 'project.css'),
            //     ),
            // },
            {
                find: /^.*\/node_modules/,
                replacement: path.resolve(path.join(appRoot, 'node_modules')),
            },
            {
                find: '@/arches_component_lab',
                replacement: path.resolve(
                    path.join(
                        __dirname,
                        './node_modules/arches-component-lab/arches_component_lab/src/arches_component_lab',
                    ),
                ),
            },
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
            // This is to override the arches core AMD module with an ESM version
            // {
            //     find: 'arches',
            //     replacement: path.resolve(
            //         path.join(appRoot, 'bcrhp', 'media', 'js', 'arches_esm'),
            //     ),
            // },
            // {
            //     find: 'utils/set-csrf-token_esm',
            //     replacement: path.resolve(
            //         path.join(
            //             appRoot,
            //             'bcrhp',
            //             'media',
            //             'js',
            //             'utils',
            //             'set-csrf-token_esm',
            //         ),
            //     ),
            // },
            // {
            //     find: 'arches2',
            //     replacement: path.resolve(
            //         path.join(
            //             appRoot,
            //             '..',
            //             'arches',
            //             'arches',
            //             'app',
            //             'media',
            //             'js',
            //             'arches_esm',
            //         ),
            //     ),
            // },
            // {
            //     find: 'utils/set-csrf-token2',
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
            //             'set-csrf-token2',
            //         ),
            //     ),
            // },
            {
                find: '@/bcgov_arches_common',
                replacement: path.resolve(
                    path.join(
                        __dirname,
                        './node_modules/bcgov_arches_common/bcgov_arches_common/src/bcgov_arches_common',
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
    },
    plugins: [
        vue(),
        cssInjectedByJsPlugin({ jsAssetsFilterFunction: () => true }),
        tailwindcss(),
        Components({
            resolvers: [PrimeVueResolver()],
        }),
    ],
    ssr: { optimizeDeps: { noDiscovery: false } },
    server: {
        root: path.resolve('./bcrhp/src'),
        host: 'localhost',
        open: false,
        cors: true,
        base: '/bcrhp/static',
        origin: 'http://localhost',
        watch: {
            usePolling: true,
            disableGlobbing: false,
            ignored: ['**/*.log', '.idea/**'],
        },
        deps: {
            inline: ['node', 'arches'],
        },
        // Force all API calls back to the Arches Dev server
        proxy: {
            '/bcrhp/arches-component-lab/api': 'http://localhost:80',
            '/bcrhp/api': 'http://localhost:80',
        },
        fs: {
            allow: [
                searchForWorkspaceRoot(process.cwd()),
                '/web_root/arches_common/bcgov_arches_common/media',
                '/web_root/arches/arches/app',
                '/web_root/bcfms/bcfms/media',
                '/web_root/bcfms/node_modules',
            ],
        },
    },
    appType: 'mpa',
    build: {
        outDir: path.resolve('./bcrhp/staticfiles/dist'),
        cssCodeSplit: false,
        // ssrManifest: 'manifest.json',
        sourcemap: true,
        assetsDir: '',
        manifest: 'manifest.json',
        // manifest: true,
        emptyOutDir: true,
        target: 'es2015',
        appType: 'mpa',
        commonjsOptions: {
            transformMixedEsModules: true,
            include: [/.*arches\.js/, /arches/, /views\/root.js/, /.*quill.*/],
            extensions: ['.js', '.cjs'],
            esmExternals: true,
        },
        rollupOptions: {
            input: {
                // main: path.resolve('./bcrhp/media/js/views/root.js'),
                main: path.resolve('./bcrhp/src/root_vue.js'),
                // main: path.resolve('./bcrhp/src/root.js'),
                // main_css: path.resolve('./bcrhp/media/css/output.css'),
            },
            output: {
                chunkFileNames: undefined,
            },
        },
    },
});
