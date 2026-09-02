import {
    describe,
    it,
    expect,
    vi,
    afterEach,
    beforeAll,
    afterAll,
} from 'vitest';
import { getFeatureForObjectId } from './parcelmap-api.ts';

afterEach(() => {
    vi.restoreAllMocks();
});

const EXPECTED_URL =
    '/bcrhp/bctileserver/geo/pub/WHSE_CADASTRE.PMBC_PARCEL_FABRIC_POLY_SVW/ows' +
    '?service=WFS&version=2.0.0&request=GetFeature&srsName=EPSG:4326' +
    '&typeNames=WHSE_CADASTRE.PMBC_PARCEL_FABRIC_POLY_SVW' +
    '&outputFormat=application/json&CQL_FILTER=OBJECTID=';

const mockGeometry = {
    type: 'Polygon',
    coordinates: [
        [
            [-123.36, 48.42],
            [-123.35, 48.42],
            [-123.35, 48.43],
            [-123.36, 48.43],
            [-123.36, 48.42],
        ],
    ],
};

function makeFeatureCollection(features: object[]) {
    return { type: 'FeatureCollection', features };
}

function makeFeature() {
    return {
        type: 'Feature',
        geometry: mockGeometry,
        properties: { OBJECTID: 255056656 },
    };
}

// ---------------------------------------------------------------------------
// URL construction
// ---------------------------------------------------------------------------

describe('getFeatureForObjectId — URL', () => {
    it('calls fetch with the full parcelmap WFS URL for the given objectid', async () => {
        vi.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: vi
                .fn()
                .mockResolvedValue(makeFeatureCollection([makeFeature()])),
        } as any);

        await getFeatureForObjectId(255056656);

        expect(fetch).toHaveBeenCalledWith(EXPECTED_URL + 255056656);
    });
});

// ---------------------------------------------------------------------------
// Success path
// ---------------------------------------------------------------------------

describe('getFeatureForObjectId — success', () => {
    it('returns a GeoJSON Feature wrapping the geometry of the first collection feature', async () => {
        vi.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: vi
                .fn()
                .mockResolvedValue(makeFeatureCollection([makeFeature()])),
        } as any);

        const result = await getFeatureForObjectId(255056656);

        expect(result).toEqual({
            type: 'Feature',
            geometry: mockGeometry,
            properties: {},
        });
    });

    it('returns null when the feature collection contains no features', async () => {
        vi.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(makeFeatureCollection([])),
        } as any);

        const result = await getFeatureForObjectId(255056656);

        expect(result).toBeNull();
    });

    it('uses the first feature when multiple are returned', async () => {
        const first = {
            type: 'Feature',
            geometry: mockGeometry,
            properties: {},
        };
        const second = {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [0, 0] },
            properties: {},
        };
        vi.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: vi
                .fn()
                .mockResolvedValue(makeFeatureCollection([first, second])),
        } as any);

        const result = await getFeatureForObjectId(255056656);

        expect(result?.geometry).toEqual(mockGeometry);
    });
});

// ---------------------------------------------------------------------------
// Error path
// ---------------------------------------------------------------------------

describe('getFeatureForObjectId — error', () => {
    it('returns null when the response is not ok', async () => {
        vi.spyOn(global, 'fetch').mockResolvedValue({
            ok: false,
            statusText: 'Service Unavailable',
        } as any);
        vi.spyOn(console, 'error').mockImplementation(() => {});

        const result = await getFeatureForObjectId(255056656);

        expect(result).toBeNull();
    });

    it('logs the statusText when the response is not ok', async () => {
        const errorSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {});
        vi.spyOn(global, 'fetch').mockResolvedValue({
            ok: false,
            statusText: 'Service Unavailable',
        } as any);

        await getFeatureForObjectId(255056656);

        expect(errorSpy).toHaveBeenCalledWith('Service Unavailable');
    });
});

// ---------------------------------------------------------------------------
// Live integration test
//
// The implementation uses relative URLs (e.g. /bcrhp/bctileserver/...) which
// cannot be resolved in the Node test environment without a base host.  Set
// the BCRHP_TEST_HOST environment variable to the running server before
// executing this block, e.g.:
//
//   BCRHP_TEST_HOST=http://localhost vitest run parcelmap-api.test.ts
//
// The beforeAll hook stubs `fetch` with a wrapper that prepends the host so
// the implementation stays unchanged (relative URLs in production, full URLs
// in the live test).
// ---------------------------------------------------------------------------

describe.skip('getFeatureForObjectId (live — requires network)', () => {
    const host = process.env.BCRHP_TEST_HOST ?? '';

    beforeAll(() => {
        if (!host) return;
        const realFetch = globalThis.fetch;
        vi.stubGlobal('fetch', (url: string, init?: RequestInit) =>
            realFetch(host + url, init),
        );
    });

    afterAll(() => {
        vi.unstubAllGlobals();
    });

    it.skipIf(!host)('returns a Feature for OBJECTID 255056656', async () => {
        const result = await getFeatureForObjectId(255056656);

        expect(result).not.toBeNull();
        expect(result?.type).toBe('Feature');
        expect(result?.geometry).toBeDefined();
        expect(result?.properties).toEqual({});
    });
});
