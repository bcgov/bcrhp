import { defineConfig, searchForWorkspaceRoot } from 'vite';
import path from 'path';
import vue from '@vitejs/plugin-vue';
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
        extensions: ['.js', '.json', '.ts','.vue'],
        alias: [
            {
                // This is to get out of the webpack/requireJS ecosystem
                find: /^.*\/root.js$/,
                replacement: path.resolve(
                    path.join(appRoot, 'bcrhp', 'src', 'root.js'),
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
    },
    plugins: [vue()],
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
            include: [/arches.js/, /arches/, /views\/root.js/],
            extensions: ['.js', '.cjs'],
        },
        rollupOptions: {
            input: {
                // main: path.resolve('./bcrhp/media/js/views/root.js'),
                main: path.resolve('./bcrhp/src/root.js'),
            },
            output: {
                chunkFileNames: undefined,
            },
        },
    },
});
