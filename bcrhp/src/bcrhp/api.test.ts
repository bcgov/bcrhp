import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('arches', () => ({
    default: {
        urls: {
            api_resource_blank: (type: string) => `/api/resource/blank/${type}`,
            pmbc_parcel_data: (pid: string) => `/api/pmbc/${pid}`,
            submit_new_site: '/api/submit',
        },
    },
}));

vi.mock('@/arches_component_lab/datatypes/concept/api.ts', () => ({
    fetchConceptsTree: vi.fn(),
}));

vi.mock('@/bcgov_arches_common/api.ts', () => ({
    getToken: vi.fn().mockResolvedValue('test-csrf-token'),
}));

vi.mock('@/arches_component_lab/datatypes/concept/utils.ts', () => ({
    convertConceptOptionToFormValue: vi.fn(),
}));

import {
    getBlankHeritageSite,
    getNameType,
    getPidData,
    submitHeritageSite,
} from './api.ts';
import { fetchConceptsTree } from '@/arches_component_lab/datatypes/concept/api.ts';
import { convertConceptOptionToFormValue } from '@/arches_component_lab/datatypes/concept/utils.ts';

afterEach(() => {
    vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// getBlankHeritageSite
// ---------------------------------------------------------------------------

describe('getBlankHeritageSite', () => {
    it('fetches the blank heritage site resource with the correct URL', async () => {
        vi.spyOn(global, 'fetch').mockResolvedValue({
            json: vi.fn().mockResolvedValue({}),
        } as any);

        await getBlankHeritageSite();

        expect(fetch).toHaveBeenCalledWith(
            '/api/resource/blank/heritage_site?format=json',
            {},
        );
    });

    it('returns the parsed JSON response', async () => {
        const siteData = { aliased_data: { site_name: [] } };
        vi.spyOn(global, 'fetch').mockResolvedValue({
            json: vi.fn().mockResolvedValue(siteData),
        } as any);

        const result = await getBlankHeritageSite();

        expect(result).toEqual(siteData);
    });
});

// ---------------------------------------------------------------------------
// getNameType
// ---------------------------------------------------------------------------

describe('getNameType', () => {
    // Note: siteNameTypes is a module-level cache. Tests in this block rely on
    // sequential execution: the first test populates the cache, subsequent tests
    // observe that no re-fetch occurs.

    it('fetches the concept tree on first call and returns the matching name type', async () => {
        const mockConceptValue = { id: 'common-uuid', label: 'Common' };
        vi.mocked(fetchConceptsTree).mockResolvedValue({
            results: [{ label: 'Common', key: 'common-uuid' }],
        });
        vi.mocked(convertConceptOptionToFormValue).mockReturnValue(
            mockConceptValue as any,
        );

        const result = await getNameType('Common');

        expect(fetchConceptsTree).toHaveBeenCalledWith(
            'heritage_site',
            'name_type',
        );
        expect(convertConceptOptionToFormValue).toHaveBeenCalledWith(
            'common-uuid',
            [{ label: 'Common', key: 'common-uuid' }],
        );
        expect(result).toEqual(mockConceptValue);
    });

    it('does not re-fetch when the cache is already populated', async () => {
        vi.mocked(fetchConceptsTree).mockClear();

        await getNameType('Common');

        expect(fetchConceptsTree).not.toHaveBeenCalled();
    });

    it('returns undefined for a name type not in the concept tree', async () => {
        const result = await getNameType('NonExistentType');

        expect(result).toBeUndefined();
    });
});

// ---------------------------------------------------------------------------
// getPidData
// ---------------------------------------------------------------------------

describe('getPidData', () => {
    it('calls fetch with the parcel data URL for the given pid', async () => {
        vi.spyOn(global, 'fetch').mockResolvedValue({
            ok: false,
            statusText: 'Not Found',
        } as any);

        await getPidData('123-456-789');

        expect(fetch).toHaveBeenCalledWith('/api/pmbc/123-456-789', {
            method: 'GET',
        });
    });

    it('returns failure with statusText when the response is not ok', async () => {
        vi.spyOn(global, 'fetch').mockResolvedValue({
            ok: false,
            statusText: 'Not Found',
        } as any);

        const result = await getPidData('123-456-789');

        expect(result).toEqual({ success: false, errors: ['Not Found'] });
    });

    it('returns failure when the response contains no features', async () => {
        vi.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({ data: { features: [] } }),
        } as any);

        const result = await getPidData('123-456-789');

        expect(result).toEqual({
            success: false,
            errors: ['no features found'],
        });
    });

    it('returns success with pid, legalDescription, and boundary for a single feature', async () => {
        const feature = {
            properties: {
                PID: '123456789',
                LEGALDESCRIPTION: 'Lot 1 Block 2',
            },
            geometry: { type: 'Polygon', coordinates: [] },
        };
        vi.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({ data: { features: [feature] } }),
        } as any);

        const result = await getPidData('123-456-789');

        expect(result).toEqual({
            success: true,
            pid: '123456789',
            legalDescription: 'Lot 1 Block 2',
            boundary: feature,
        });
    });

    it('does not include errors when exactly one feature is returned', async () => {
        const feature = {
            properties: { PID: '111', LEGALDESCRIPTION: 'Lot A' },
        };
        vi.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({ data: { features: [feature] } }),
        } as any);

        const result = await getPidData('123-456-789');

        expect(result.errors).toBeUndefined();
    });

    it('includes a warning error when more than one feature is returned', async () => {
        const feature = {
            properties: { PID: '111', LEGALDESCRIPTION: 'Lot A' },
        };
        vi.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: vi
                .fn()
                .mockResolvedValue({ data: { features: [feature, feature] } }),
        } as any);

        const result = await getPidData('123-456-789');

        expect(result.success).toBe(true);
        expect(result.errors).toEqual(['warning: more than one feature found']);
    });
});

// ---------------------------------------------------------------------------
// submitHeritageSite
// ---------------------------------------------------------------------------

function makeMinimalSite(images: any[] = [], documents: any[] = []): any {
    return {
        aliased_data: {
            site_images: images,
            site_document: documents,
        },
    };
}

function makeImageTile(index: number, withFile = true) {
    return {
        tileid: `image-tile-${index}`,
        aliased_data: {
            site_images: {
                node_value: withFile
                    ? [
                          {
                              node_id: `image-node-${index}`,
                              name: `image${index}.jpg`,
                              file: new File([''], `image${index}.jpg`),
                          },
                      ]
                    : [null],
            },
        },
    };
}

function makeDocumentTile(index: number) {
    return {
        tileid: `doc-tile-${index}`,
        aliased_data: {
            site_document: {
                node_value: [
                    {
                        node_id: `doc-node-${index}`,
                        name: `doc${index}.pdf`,
                        file: new File([''], `doc${index}.pdf`),
                    },
                ],
            },
        },
    };
}

describe('submitHeritageSite', () => {
    it('posts to submit_new_site with the correct method and CSRF header', async () => {
        vi.spyOn(global, 'fetch').mockResolvedValue({
            status: 201,
            json: vi.fn().mockResolvedValue({}),
        } as any);

        await submitHeritageSite(makeMinimalSite());

        expect(fetch).toHaveBeenCalledWith(
            '/api/submit',
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'X-CSRFToken': 'test-csrf-token',
                    Accept: 'application/json',
                }),
            }),
        );
    });

    it('returns the parsed response JSON on a 201 response', async () => {
        const responseData = { resourceinstance_id: 'abc-123' };
        vi.spyOn(global, 'fetch').mockResolvedValue({
            status: 201,
            json: vi.fn().mockResolvedValue(responseData),
        } as any);

        const result = await submitHeritageSite(makeMinimalSite());

        expect(result).toEqual(responseData);
    });

    it('throws the parsed error JSON on a non-201 response with valid JSON', async () => {
        const errorData = { message: 'Validation failed' };
        vi.spyOn(global, 'fetch').mockResolvedValue({
            status: 400,
            json: vi.fn().mockResolvedValue(errorData),
        } as any);

        await expect(submitHeritageSite(makeMinimalSite())).rejects.toEqual(
            errorData,
        );
    });

    it('throws an Error with statusText when non-201 response body is not parseable JSON', async () => {
        vi.spyOn(global, 'fetch').mockResolvedValue({
            status: 500,
            statusText: 'Internal Server Error',
            json: vi
                .fn()
                .mockRejectedValue(new SyntaxError('Unexpected token')),
        } as any);

        await expect(submitHeritageSite(makeMinimalSite())).rejects.toThrow(
            'Unable to save submission: Internal Server Error',
        );
    });

    it('appends image files to FormData and sets file_id on the file reference', async () => {
        let capturedBody: FormData | undefined;
        vi.spyOn(global, 'fetch').mockImplementation(
            async (_url, options: any) => {
                capturedBody = options.body;
                return {
                    status: 201,
                    json: vi.fn().mockResolvedValue({}),
                } as any;
            },
        );

        const image = makeImageTile(0);
        await submitHeritageSite(makeMinimalSite([image]));

        const expectedKey = 'file-list_image-tile-0-image-node-0';
        expect(capturedBody?.get(expectedKey)).toBeInstanceOf(File);
        expect(image.aliased_data.site_images.node_value[0].file_id).toBe(
            expectedKey,
        );
    });

    it('appends document files to FormData and sets file_id on the file reference', async () => {
        let capturedBody: FormData | undefined;
        vi.spyOn(global, 'fetch').mockImplementation(
            async (_url, options: any) => {
                capturedBody = options.body;
                return {
                    status: 201,
                    json: vi.fn().mockResolvedValue({}),
                } as any;
            },
        );

        const doc = makeDocumentTile(0);
        await submitHeritageSite(makeMinimalSite([], [doc]));

        const expectedKey = 'file-list_doc-tile-0-doc-node-0';
        expect(capturedBody?.get(expectedKey)).toBeInstanceOf(File);
        expect(doc.aliased_data.site_document.node_value[0].file_id).toBe(
            expectedKey,
        );
    });

    it('appends JSON-serialized site data to FormData', async () => {
        let capturedBody: FormData | undefined;
        vi.spyOn(global, 'fetch').mockImplementation(
            async (_url, options: any) => {
                capturedBody = options.body;
                return {
                    status: 201,
                    json: vi.fn().mockResolvedValue({}),
                } as any;
            },
        );

        const site = makeMinimalSite();
        await submitHeritageSite(site);

        expect(capturedBody?.get('json')).toBe(JSON.stringify(site));
    });

    it('skips appending an image tile when node_value[0] is null', async () => {
        let capturedBody: FormData | undefined;
        vi.spyOn(global, 'fetch').mockImplementation(
            async (_url, options: any) => {
                capturedBody = options.body;
                return {
                    status: 201,
                    json: vi.fn().mockResolvedValue({}),
                } as any;
            },
        );

        const image = makeImageTile(0, false);
        await submitHeritageSite(makeMinimalSite([image]));

        // FormData should only contain the 'json' entry, no file entry
        const keys = [...(capturedBody?.keys() ?? [])];
        expect(keys).toEqual(['json']);
    });
});
