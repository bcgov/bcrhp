vi.mock('maplibre-gl', () => ({ default: {} }));
vi.mock('@/bcgov_arches_common/widgets/SimpleMap/api.ts', () => ({
    fetchSystemMapData: vi.fn(),
}));

import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import Step3SpatialLocationView from './Step3_SpatialLocationView.vue';

// ---------------------------------------------------------------------------
// Stubs
// ---------------------------------------------------------------------------

const stubs = {
    Fieldset: {
        props: ['legend'],
        template: `<fieldset><legend>{{ legend }}</legend><slot /></fieldset>`,
    },
    SimpleMap: { template: '<div class="simple-map" />' },
};

// ---------------------------------------------------------------------------
// Test data helpers
// ---------------------------------------------------------------------------

function makeSiteBoundaryData(features: any[] = []) {
    return {
        display_value: '',
        node_value: { type: 'FeatureCollection', features },
        details: [],
    };
}

function makeHeritageSiteWithBoundary({
    boundaryData = makeSiteBoundaryData([
        { type: 'Feature', geometry: null, properties: {} },
    ]),
    mappedArea = null as any,
} = {}) {
    return ref({
        aliased_data: {
            heritage_site_location: [
                {
                    aliased_data: {
                        site_boundary: [
                            {
                                aliased_data: {
                                    site_boundary: boundaryData,
                                    mapped_area: mappedArea,
                                },
                            },
                        ],
                    },
                },
            ],
        },
    });
}

function makeHeritageSiteWithoutBoundary() {
    return ref({
        aliased_data: {
            heritage_site_location: [
                {
                    aliased_data: {
                        site_boundary: [],
                    },
                },
            ],
        },
    });
}

function mountComponent(heritageSite: ReturnType<typeof ref>) {
    return mount(Step3SpatialLocationView, {
        global: {
            stubs,
            provide: { heritageSite },
        },
    });
}

// ---------------------------------------------------------------------------
// Rendering with boundary data
// ---------------------------------------------------------------------------

describe('Step3_SpatialLocationView — with boundary data', () => {
    it('mounts without error', () => {
        expect(mountComponent(makeHeritageSiteWithBoundary()).exists()).toBe(
            true,
        );
    });

    it('renders the "Site Boundary" fieldset', () => {
        const wrapper = mountComponent(makeHeritageSiteWithBoundary());
        expect(wrapper.find('fieldset').exists()).toBe(true);
        expect(wrapper.find('legend').text()).toBe('Site Boundary');
    });

    it('renders SimpleMap when boundary data is present', () => {
        const wrapper = mountComponent(makeHeritageSiteWithBoundary());
        expect(wrapper.find('.simple-map').exists()).toBe(true);
    });

    it('does not render the "No boundary data" message when data is present', () => {
        const wrapper = mountComponent(makeHeritageSiteWithBoundary());
        expect(wrapper.text()).not.toContain('No boundary data uploaded.');
    });
});

// ---------------------------------------------------------------------------
// Rendering without boundary data
// ---------------------------------------------------------------------------

describe('Step3_SpatialLocationView — without boundary data', () => {
    it('mounts without error', () => {
        expect(mountComponent(makeHeritageSiteWithoutBoundary()).exists()).toBe(
            true,
        );
    });

    it('does not render SimpleMap when boundary data is absent', () => {
        const wrapper = mountComponent(makeHeritageSiteWithoutBoundary());
        expect(wrapper.find('.simple-map').exists()).toBe(false);
    });

    it('renders the "No boundary data uploaded." message', () => {
        const wrapper = mountComponent(makeHeritageSiteWithoutBoundary());
        expect(wrapper.text()).toContain('No boundary data uploaded.');
    });
});

// ---------------------------------------------------------------------------
// Mapped area display
// ---------------------------------------------------------------------------

describe('Step3_SpatialLocationView — mapped area', () => {
    it('does not show the mapped area section when mapped_area is null', () => {
        const wrapper = mountComponent(
            makeHeritageSiteWithBoundary({ mappedArea: null }),
        );
        expect(wrapper.find('dt').exists()).toBe(false);
    });

    it('shows mapped area using display_value when present', () => {
        const wrapper = mountComponent(
            makeHeritageSiteWithBoundary({
                mappedArea: {
                    display_value: '1.23 ha',
                    node_value: null,
                    details: [],
                },
            }),
        );
        expect(wrapper.find('dt').text()).toBe('Mapped Area');
        expect(wrapper.find('dd').text()).toBe('1.23 ha');
    });

    it('falls back to node_value when display_value is empty', () => {
        const wrapper = mountComponent(
            makeHeritageSiteWithBoundary({
                mappedArea: {
                    display_value: '',
                    node_value: '2.50 ha',
                    details: [],
                },
            }),
        );
        expect(wrapper.find('dd').text()).toBe('2.50 ha');
    });

    it('prefers display_value over node_value when both are present', () => {
        const wrapper = mountComponent(
            makeHeritageSiteWithBoundary({
                mappedArea: {
                    display_value: 'Display Area',
                    node_value: 'Node Area',
                    details: [],
                },
            }),
        );
        expect(wrapper.find('dd').text()).toBe('Display Area');
    });

    it('does not show the mapped area section when both display_value and node_value are empty/falsy', () => {
        const wrapper = mountComponent(
            makeHeritageSiteWithBoundary({
                mappedArea: {
                    display_value: '',
                    node_value: null,
                    details: [],
                },
            }),
        );
        expect(wrapper.find('dt').exists()).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Edge cases — missing nested paths
// ---------------------------------------------------------------------------

describe('Step3_SpatialLocationView — edge cases', () => {
    it('handles missing heritage_site_location gracefully', () => {
        const hs = ref({ aliased_data: { heritage_site_location: [] } });
        const wrapper = mountComponent(hs);
        expect(wrapper.find('.simple-map').exists()).toBe(false);
        expect(wrapper.text()).toContain('No boundary data uploaded.');
    });

    it('handles undefined heritage_site_location gracefully', () => {
        const hs = ref({ aliased_data: {} });
        const wrapper = mountComponent(hs as any);
        expect(wrapper.find('.simple-map').exists()).toBe(false);
    });
});
