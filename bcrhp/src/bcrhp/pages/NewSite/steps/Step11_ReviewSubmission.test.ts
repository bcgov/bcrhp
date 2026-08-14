import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';

// Step3_SpatialLocationView → SimpleMap → maplibre-gl calls
// window.URL.createObjectURL() at module-evaluation time, which jsdom does
// not implement.  Mock the entire library before any imports are evaluated.
vi.mock('maplibre-gl', () => ({ default: {} }));

// Step3_SpatialLocationView → SimpleMap/SimpleMap.vue → SimpleMap/api.ts →
// geojson-feature-collection/api.ts calls createRequest('api-map-data') at
// module-evaluation time, which accesses arches.urls before the Django server
// has populated it.  Mock the api module to prevent the side effect.
vi.mock('@/bcgov_arches_common/widgets/SimpleMap/api.ts', () => ({
    fetchSystemMapData: vi.fn(),
}));

import Step11ReviewSubmission from './Step11_ReviewSubmission.vue';

const stubs = {
    Fieldset: { template: '<fieldset><slot /></fieldset>' },
    GenericWidget: { template: '<div />' },
    Message: { template: '<div class="p-message"><slot /></div>' },
};

function makeHeritageSite(overrides: Record<string, any> = {}) {
    return ref({
        aliased_data: {
            site_names: [],
            site_document: [],
            site_record_admin: [],
            internal_remark: [],
            heritage_site_location: [
                { aliased_data: { bc_property_address: [] } },
            ],
            bc_right: {
                aliased_data: {
                    protection_event: [],
                    officially_recognized_site: {
                        display_value: '',
                        node_value: null,
                        details: [],
                    },
                },
            },
            bc_statement_of_significance: [],
            site_images: [],
            heritage_class: [],
            heritage_function: [],
            chronology: [],
            construction_actors: [],
            external_url: [],
            heritage_theme: {
                aliased_data: { heritage_theme: { display_value: '' } },
            },
            ...overrides,
        },
    });
}

// Default global config shared by all tests.
// workflowSubmissionErrors and workflowSubmissionComplete are the inject keys
// that useWorkflowStep() (used inside Step11) reads.  They must be provided
// here; passing them as `props` has no effect because the component never
// calls defineProps for them.
const makeGlobal = (extraProvide: Record<string, unknown> = {}) => ({
    stubs,
    provide: {
        workflowSubmissionErrors: ref<unknown[]>([]),
        workflowSubmissionComplete: ref(false),
        ...extraProvide,
    },
});

describe('Step11_ReviewSubmission', () => {
    it('mounts without error', () => {
        const wrapper = mount(Step11ReviewSubmission, {
            global: makeGlobal({ heritageSite: makeHeritageSite() }),
        });
        expect(wrapper.exists()).toBe(true);
    });

    it("isValid adds today's date to an empty site_record_admin and returns true", () => {
        const heritageSite = makeHeritageSite({ site_record_admin: [] });
        const wrapper = mount(Step11ReviewSubmission, {
            global: makeGlobal({ heritageSite }),
        });

        const result = wrapper.vm.isValid();

        expect(result).toBe(true);
        expect(heritageSite.value.aliased_data.site_record_admin).toHaveLength(
            1,
        );
        const submittedDate =
            heritageSite.value.aliased_data.site_record_admin[0].aliased_data
                .date_submitted_to_crhp.display_value;
        expect(submittedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('isValid does not add a date entry when site_record_admin is already populated', () => {
        const existingAdmin = {
            aliased_data: {
                date_submitted_to_crhp: {
                    display_value: '2025-01-01',
                    node_value: '2025-01-01',
                    details: [],
                },
            },
        };
        const heritageSite = makeHeritageSite({
            site_record_admin: [existingAdmin],
        });
        const wrapper = mount(Step11ReviewSubmission, {
            global: makeGlobal({ heritageSite }),
        });

        wrapper.vm.isValid();

        expect(heritageSite.value.aliased_data.site_record_admin).toHaveLength(
            1,
        );
        expect(
            heritageSite.value.aliased_data.site_record_admin[0].aliased_data
                .date_submitted_to_crhp.display_value,
        ).toBe('2025-01-01');
    });

    it('shows "No address provided" when propertyAddresses is empty', () => {
        const wrapper = mount(Step11ReviewSubmission, {
            global: makeGlobal({ heritageSite: makeHeritageSite() }),
        });
        expect(wrapper.text()).toContain('No address provided');
    });

    it('shows "No documents uploaded" when siteDocuments is empty', () => {
        const wrapper = mount(Step11ReviewSubmission, {
            global: makeGlobal({ heritageSite: makeHeritageSite() }),
        });
        expect(wrapper.text()).toContain('No documents uploaded');
    });

    it('renders submission error messages when submissionErrors is non-empty', () => {
        const errors = [
            {
                type: 'ValidationError',
                error: 'site_names',
                message: 'Required field missing',
            },
        ];
        // submissionErrors comes from inject('workflowSubmissionErrors'), not
        // from a declared prop.  Providing it here is the correct approach.
        const wrapper = mount(Step11ReviewSubmission, {
            global: makeGlobal({
                heritageSite: makeHeritageSite(),
                workflowSubmissionErrors: ref(errors),
            }),
        });
        expect(wrapper.text()).toContain('ValidationError');
        expect(wrapper.text()).toContain('Required field missing');
    });

    it('renders common site name when present', () => {
        const heritageSite = makeHeritageSite({
            site_names: [
                {
                    aliased_data: {
                        name_type: {
                            display_value: 'Common',
                            node_value: null,
                            details: [],
                        },
                        name: {
                            display_value: 'Humboldt House',
                            node_value: null,
                            details: [],
                        },
                    },
                },
            ],
        });
        const wrapper = mount(Step11ReviewSubmission, {
            global: makeGlobal({ heritageSite }),
        });
        expect(wrapper.text()).toContain('Humboldt House');
    });

    it('renders other site names separately from common name', () => {
        const heritageSite = makeHeritageSite({
            site_names: [
                {
                    aliased_data: {
                        name_type: {
                            display_value: 'Common',
                            node_value: null,
                            details: [],
                        },
                        name: {
                            display_value: 'Main Name',
                            node_value: null,
                            details: [],
                        },
                    },
                },
                {
                    aliased_data: {
                        name_type: {
                            display_value: 'Other',
                            node_value: null,
                            details: [],
                        },
                        name: {
                            display_value: 'Historic Name',
                            node_value: null,
                            details: [],
                        },
                    },
                },
            ],
        });
        const wrapper = mount(Step11ReviewSubmission, {
            global: makeGlobal({ heritageSite }),
        });
        expect(wrapper.text()).toContain('Main Name');
        expect(wrapper.text()).toContain('Historic Name');
    });
});
