import { vi } from 'vitest';

// These mocks MUST be at the top level so Vitest can hoist them before any
// static imports are evaluated.  Calling vi.mock() inside beforeAll() runs
// too late – modules have already been imported by then and module-level
// side effects (e.g. arches.urls['api-map-data']) will have already fired.
vi.mock('arches', () => ({
    default: { urls: {} },
}));

vi.mock('vue3-gettext', () => ({
    useGettext: () => ({
        $gettext: (text: string) => text,
    }),
}));
