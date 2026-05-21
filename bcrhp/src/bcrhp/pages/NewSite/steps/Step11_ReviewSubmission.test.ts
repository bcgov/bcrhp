import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
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
            bc_right: { aliased_data: { protection_event: [] } },
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

describe('Step11_ReviewSubmission', () => {
    it('mounts without error', () => {
        const wrapper = mount(Step11ReviewSubmission, {
            global: {
                stubs,
                provide: { heritageSite: makeHeritageSite() },
            },
            props: { submissionErrors: [] },
        });
        expect(wrapper.exists()).toBe(true);
    });

    it("isValid adds today's date to an empty site_record_admin and returns true", () => {
        const heritageSite = makeHeritageSite({ site_record_admin: [] });
        const wrapper = mount(Step11ReviewSubmission, {
            global: {
                stubs,
                provide: { heritageSite },
            },
            props: { submissionErrors: [] },
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
            global: {
                stubs,
                provide: { heritageSite },
            },
            props: { submissionErrors: [] },
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
            global: {
                stubs,
                provide: { heritageSite: makeHeritageSite() },
            },
            props: { submissionErrors: [] },
        });
        expect(wrapper.text()).toContain('No address provided');
    });

    it('shows "No documents uploaded" when siteDocuments is empty', () => {
        const wrapper = mount(Step11ReviewSubmission, {
            global: {
                stubs,
                provide: { heritageSite: makeHeritageSite() },
            },
            props: { submissionErrors: [] },
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
        const wrapper = mount(Step11ReviewSubmission, {
            global: {
                stubs,
                provide: { heritageSite: makeHeritageSite() },
            },
            props: { submissionErrors: errors },
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
            global: {
                stubs,
                provide: { heritageSite },
            },
            props: { submissionErrors: [] },
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
            global: {
                stubs,
                provide: { heritageSite },
            },
            props: { submissionErrors: [] },
        });
        expect(wrapper.text()).toContain('Main Name');
        expect(wrapper.text()).toContain('Historic Name');
    });
});
