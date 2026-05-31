import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import Step6SOS from './Step6_SOS.vue';

const stubs = {
    Form: { template: '<form><slot v-bind="{}" /></form>' },
    FieldSet: { template: '<fieldset><slot /></fieldset>' },
    LabelledInput: { template: '<div><slot /></div>' },
    GenericWidget: { template: '<div />' },
};

function makeHeritageSite(bc_statement_of_significance: any[] = []) {
    return ref({
        aliased_data: {
            bc_statement_of_significance,
        },
    });
}

describe('Step6_SOS', () => {
    it('mounts without error', () => {
        const wrapper = mount(Step6SOS, {
            global: {
                stubs,
                provide: { heritageSite: makeHeritageSite([]) },
            },
        });
        expect(wrapper.exists()).toBe(true);
    });

    it('isValid always returns true', () => {
        const wrapper = mount(Step6SOS, {
            global: {
                stubs,
                provide: { heritageSite: makeHeritageSite([]) },
            },
        });
        expect(wrapper.vm.isValid()).toBe(true);
    });

    it('isValid returns true even when SOS tile is populated', () => {
        const sosTile = {
            aliased_data: {
                physical_description: {
                    display_value: 'A heritage house',
                    node_value: null,
                    details: [],
                },
                heritage_value: {
                    display_value: 'High',
                    node_value: null,
                    details: [],
                },
                defining_elements: {
                    display_value: 'Windows',
                    node_value: null,
                    details: [],
                },
                significance_type: {
                    display_value: '',
                    node_value: null,
                    details: [],
                },
                document_location: {
                    display_value: 'City Hall',
                    node_value: null,
                    details: [],
                },
            },
        };
        const wrapper = mount(Step6SOS, {
            global: {
                stubs,
                provide: { heritageSite: makeHeritageSite([sosTile]) },
            },
        });
        expect(wrapper.vm.isValid()).toBe(true);
    });
});
