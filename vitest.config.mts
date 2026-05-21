import fs from 'fs';
import path from 'path';
import vue from '@vitejs/plugin-vue';

import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

import type { UserConfig } from 'vitest/config';

function generateConfig(): Promise<UserConfig> {
    return new Promise((resolve, reject) => {
        const filePath = path.dirname(fileURLToPath(import.meta.url));

        const exclude = [
            '**/*.d.ts',
            '**/node_modules/**',
            '**/dist/**',
            '**/install/**',
            '**/cypress/**',
            '**/playwright/**',
            '**/.{idea,git,cache,output,temp}/**',
            '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
            '**/build/**',
            '**/staticfiles/**',
        ];

        const rawData = fs.readFileSync(
            path.join(
                __dirname,
                'frontend_configuration',
                'webpack-metadata.json',
            ),
            'utf-8',
        );
        const parsedData = JSON.parse(rawData);

        const alias: { find: string | RegExp; replacement: string }[] = [
            {
                find: '@/arches',
                replacement: path.join(
                    parsedData['ROOT_DIR'],
                    'app',
                    'src',
                    'arches',
                ),
            },
            {
                find: 'arches',
                replacement: path.join(
                    parsedData['ROOT_DIR'],
                    'app',
                    'media',
                    'js',
                    'arches.js',
                ),
            },
        ];

        for (const [
            archesApplicationName,
            archesApplicationPath,
        ] of Object.entries(
            parsedData['ARCHES_APPLICATIONS_PATHS'] as {
                [key: string]: string;
            },
        )) {
            alias.push({
                find: `@/${archesApplicationName}`,
                replacement: path.join(
                    archesApplicationPath,
                    'src',
                    archesApplicationName,
                ),
            });
        }

        // Catch-all: any bare package import (not starting with . or /) is
        // resolved against the project's own node_modules. This mirrors the
        // TypeScript paths entry `"*": ["../node_modules/*"]` and ensures
        // that files from outside the project root (e.g. Python-installed
        // packages in CI) can still find their npm dependencies.
        //
        // The pattern deliberately excludes:
        //   \0  – Rollup/Vite virtual module null-byte prefix
        //   :   – Vite virtual module convention (e.g. plugin-vue:export-helper)
        // Real npm package names (including scoped @scope/pkg and subpaths
        // like primevue/message) never contain these characters.
        alias.push({
            find: /^([^./\0][^:]*)$/,
            replacement: path.join(filePath, 'node_modules') + '/$1',
        });

        resolve({
            plugins: [vue() as any],
            test: {
                alias: alias,
                coverage: {
                    include: [
                        path.join(
                            parsedData['APP_RELATIVE_PATH'],
                            'src',
                            path.sep,
                        ),
                    ],
                    exclude: exclude,
                    reporter: [['clover', { file: 'coverage.xml' }], 'text'],
                    reportsDirectory: path.join(
                        filePath,
                        'coverage',
                        'frontend',
                    ),
                },
                environment: 'jsdom',
                globals: true,
                exclude: exclude,
                passWithNoTests: true,
                setupFiles: ['vitest.setup.mts'],
            },
        });
    });
}

export default (async () => {
    const config = await generateConfig();
    return defineConfig(config);
})();
