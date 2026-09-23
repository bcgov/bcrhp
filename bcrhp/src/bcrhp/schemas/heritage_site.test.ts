import { describe, it, expect } from 'vitest';
import {
    HeritageSite,
    HeritageSiteSchema,
    getHeritageSite,
    getUniquePIDsFromHeritageSite,
} from './heritage_site.ts';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeLegalDesc(pidValue: number | null | undefined) {
    return {
        aliased_data: {
            legal_address_internal_notes: {
                display_value: '',
                node_value: { en: { value: '', direction: 'ltr' } },
                details: [],
            },
            pin: {
                display_value: '',
                node_value: null,
                details: [],
                value: null,
            },
            pid: {
                display_value: '',
                node_value: null,
                details: [],
                value: pidValue,
            },
            legal_description: {
                display_value: '',
                node_value: { en: { value: '', direction: 'ltr' } },
                details: [],
            },
        },
    };
}

function makeAddress(legalDescs: ReturnType<typeof makeLegalDesc>[] = []) {
    return {
        aliased_data: {
            street_address: {
                display_value: '',
                node_value: { en: { value: '123 Main St', direction: 'ltr' } },
                details: [],
            },
            postal_code: {
                display_value: '',
                node_value: { en: { value: '', direction: 'ltr' } },
                details: [],
            },
            location_description: {
                display_value: '',
                node_value: { en: { value: '', direction: 'ltr' } },
                details: [],
            },
            city: {
                display_value: '',
                node_value: { en: { value: '', direction: 'ltr' } },
                details: [],
            },
            province: { display_value: '', node_value: null, details: [] },
            locality: {
                display_value: '',
                node_value: { en: { value: '', direction: 'ltr' } },
                details: [],
            },
            bc_property_legal_description: legalDescs,
        },
    };
}

function makeSiteWithAddresses(
    addresses: ReturnType<typeof makeAddress>[] = [],
): HeritageSite {
    const site = getHeritageSite();
    site.aliased_data.heritage_site_location[0].aliased_data.bc_property_address =
        addresses as any;
    return site;
}

// ---------------------------------------------------------------------------
// getUniquePIDsFromHeritageSite
// ---------------------------------------------------------------------------

describe('getUniquePIDsFromHeritageSite', () => {
    it('returns empty array for null input', () => {
        expect(getUniquePIDsFromHeritageSite(null)).toEqual([]);
    });

    it('returns empty array for undefined input', () => {
        expect(getUniquePIDsFromHeritageSite(undefined)).toEqual([]);
    });

    it('returns empty array when there are no property addresses', () => {
        const site = getHeritageSite();
        expect(getUniquePIDsFromHeritageSite(site)).toEqual([]);
    });

    it('returns empty array when addresses have no legal descriptions', () => {
        const site = makeSiteWithAddresses([makeAddress([])]);
        expect(getUniquePIDsFromHeritageSite(site)).toEqual([]);
    });

    it('returns empty array when all PIDs are null', () => {
        const site = makeSiteWithAddresses([
            makeAddress([makeLegalDesc(null), makeLegalDesc(null)]),
        ]);
        expect(getUniquePIDsFromHeritageSite(site)).toEqual([]);
    });

    it('returns empty array when all PIDs are undefined', () => {
        const site = makeSiteWithAddresses([
            makeAddress([makeLegalDesc(undefined)]),
        ]);
        expect(getUniquePIDsFromHeritageSite(site)).toEqual([]);
    });

    it('returns a single PID from a single legal description', () => {
        const site = makeSiteWithAddresses([
            makeAddress([makeLegalDesc(123456789)]),
        ]);
        expect(getUniquePIDsFromHeritageSite(site)).toEqual([123456789]);
    });

    it('returns multiple PIDs from multiple legal descriptions', () => {
        const site = makeSiteWithAddresses([
            makeAddress([makeLegalDesc(111111111), makeLegalDesc(222222222)]),
        ]);
        expect(getUniquePIDsFromHeritageSite(site)).toEqual([
            111111111, 222222222,
        ]);
    });

    it('deduplicates PIDs that appear in multiple legal descriptions', () => {
        const site = makeSiteWithAddresses([
            makeAddress([makeLegalDesc(123456789), makeLegalDesc(123456789)]),
        ]);
        expect(getUniquePIDsFromHeritageSite(site)).toEqual([123456789]);
    });

    it('deduplicates PIDs that appear across multiple addresses', () => {
        const site = makeSiteWithAddresses([
            makeAddress([makeLegalDesc(123456789)]),
            makeAddress([makeLegalDesc(123456789)]),
        ]);
        expect(getUniquePIDsFromHeritageSite(site)).toEqual([123456789]);
    });

    it('returns PIDs sorted in ascending numeric order', () => {
        const site = makeSiteWithAddresses([
            makeAddress([makeLegalDesc(999999999), makeLegalDesc(111111111)]),
            makeAddress([makeLegalDesc(555555555)]),
        ]);
        expect(getUniquePIDsFromHeritageSite(site)).toEqual([
            111111111, 555555555, 999999999,
        ]);
    });

    it('filters out null PIDs while keeping valid ones', () => {
        const site = makeSiteWithAddresses([
            makeAddress([makeLegalDesc(null), makeLegalDesc(123456789)]),
        ]);
        expect(getUniquePIDsFromHeritageSite(site)).toEqual([123456789]);
    });

    it('returns PIDs as numbers, not strings', () => {
        const site = makeSiteWithAddresses([
            makeAddress([makeLegalDesc(123456789)]),
        ]);
        const result = getUniquePIDsFromHeritageSite(site);
        expect(typeof result[0]).toBe('number');
    });
});

// ---------------------------------------------------------------------------
// HeritageSite constructor / getHeritageSite factory
// ---------------------------------------------------------------------------

describe('HeritageSite constructor', () => {
    it('creates an instance via getHeritageSite()', () => {
        expect(getHeritageSite()).toBeInstanceOf(HeritageSite);
    });

    it('initialises with empty site_names array', () => {
        expect(getHeritageSite().aliased_data.site_names).toEqual([]);
    });

    it('initialises with empty site_document array', () => {
        expect(getHeritageSite().aliased_data.site_document).toEqual([]);
    });

    it('initialises with empty external_url array', () => {
        expect(getHeritageSite().aliased_data.external_url).toEqual([]);
    });

    it('initialises with a single heritage_site_location entry', () => {
        const site = getHeritageSite();
        expect(site.aliased_data.heritage_site_location).toHaveLength(1);
        expect(
            site.aliased_data.heritage_site_location[0].aliased_data
                .bc_property_address,
        ).toEqual([]);
        expect(
            site.aliased_data.heritage_site_location[0].aliased_data
                .site_boundary,
        ).toEqual([]);
    });

    it('initialises with a single bc_statement_of_significance entry', () => {
        expect(
            getHeritageSite().aliased_data.bc_statement_of_significance,
        ).toHaveLength(1);
    });

    it('initialises borden_number with a blank string value', () => {
        const borden =
            getHeritageSite().aliased_data.borden_number.aliased_data
                .borden_number;
        expect(borden.display_value).toBe('');
        expect(borden.node_value).toHaveProperty('en');
    });

    it('returns independent instances on each call', () => {
        const a = getHeritageSite();
        const b = getHeritageSite();
        a.aliased_data.site_names.push({ aliased_data: {} } as any);
        expect(b.aliased_data.site_names).toHaveLength(0);
    });
});

// ---------------------------------------------------------------------------
// HeritageSiteSchema — validation
// ---------------------------------------------------------------------------

describe('HeritageSiteSchema', () => {
    // Note: factory class instances use `// @ts-ignore` because blank TileSchema
    // sub-instances omit required tile metadata fields (e.g. tileid). Schema
    // validation tests therefore only cover the rejection of obviously invalid shapes.

    it('fails when aliased_data is missing', () => {
        const result = HeritageSiteSchema.safeParse({
            resourceinstanceid: null,
        });
        expect(result.success).toBe(false);
    });

    it('fails when heritage_site_location is not an array', () => {
        const site = getHeritageSite();
        const invalid = {
            ...site,
            aliased_data: {
                ...site.aliased_data,
                heritage_site_location: 'not-an-array',
            },
        };
        const result = HeritageSiteSchema.safeParse(invalid);
        expect(result.success).toBe(false);
    });

    it('fails when site_names is not an array', () => {
        const site = getHeritageSite();
        const invalid = {
            ...site,
            aliased_data: {
                ...site.aliased_data,
                site_names: 'invalid',
            },
        };
        const result = HeritageSiteSchema.safeParse(invalid);
        expect(result.success).toBe(false);
    });
});
