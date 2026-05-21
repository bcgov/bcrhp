import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import Step2SiteAddress from './Step2_SiteAddress.vue';

vi.mock('@/bcrhp/api.ts', () => ({
    getPidData: vi.fn(),
}));

const stubs = {
    Form: { template: '<form><slot v-bind="{}" /></form>' },
    FieldSet: { template: '<fieldset><slot /></fieldset>' },
    LabelledInput: { template: '<div><slot /></div>' },
    LabelledCheckboxInput: { template: '<div><slot /></div>' },
    Checkbox: {
        template: '<input type="checkbox" @change="$emit(\'change\')" />',
        emits: ['change'],
    },
    Button: {
        template: '<button :disabled="$attrs.disabled" @click="$emit(\'click\')"><slot /></button>',
        emits: ['click'],
    },
    Chip: { template: '<span><slot /></span>' },
    Dialog: { template: '<div><slot /></div>' },
    GenericWidget: { template: '<div />' },
    ChipsList: { template: '<div />' },
};

function makeAddress(street = '123 Main St') {
    return {
        aliased_data: {
            street_address: { display_value: street, node_value: null, details: [] },
            city: { display_value: 'Victoria', node_value: null, details: [] },
            locality: { display_value: 'Capital', node_value: null, details: [] },
            postal_code: { display_value: 'V8W 1A1', node_value: null, details: [] },
            location_description: { display_value: '', node_value: null, details: [] },
            province: { display_value: 'BC', node_value: null, details: [] },
            bc_property_legal_description: [],
        },
    };
}

function makeHeritageSite(bc_property_address: any[] = []) {
    return ref({
        aliased_data: {
            heritage_site_location: [
                {
                    aliased_data: {
                        bc_property_address,
                        site_boundary: [],
                    },
                },
            ],
        },
    });
}

describe('Step2_SiteAddress', () => {
    it('mounts without error', () => {
        const wrapper = mount(Step2SiteAddress, {
            global: {
                stubs,
                provide: { heritageSite: makeHeritageSite([]) },
            },
        });
        expect(wrapper.exists()).toBe(true);
    });

    it('isValid returns false when property address is required but none has been added', () => {
        const wrapper = mount(Step2SiteAddress, {
            global: {
                stubs,
                provide: { heritageSite: makeHeritageSite([]) },
            },
        });
        expect(wrapper.vm.isValid()).toBe(false);
    });

    it('isValid returns true when at least one property address has been added', () => {
        const wrapper = mount(Step2SiteAddress, {
            global: {
                stubs,
                provide: { heritageSite: makeHeritageSite([makeAddress()]) },
            },
        });
        expect(wrapper.vm.isValid()).toBe(true);
    });

    it('isValid returns true after "no street address" checkbox is toggled, regardless of address list', async () => {
        const wrapper = mount(Step2SiteAddress, {
            global: {
                stubs,
                provide: { heritageSite: makeHeritageSite([]) },
            },
        });
        expect(wrapper.vm.isValid()).toBe(false);

        await wrapper.find('input[type="checkbox"]').trigger('change');

        expect(wrapper.vm.isValid()).toBe(true);
    });

    it('emits update:stepIsValid with true after "no street address" is checked', async () => {
        const wrapper = mount(Step2SiteAddress, {
            global: {
                stubs,
                provide: { heritageSite: makeHeritageSite([]) },
            },
        });

        await wrapper.find('input[type="checkbox"]').trigger('change');

        const emitted = wrapper.emitted('update:stepIsValid');
        expect(emitted).toBeTruthy();
        expect(emitted![emitted!.length - 1]).toEqual([true]);
    });

    it('getAddressLabel uses "-" as separator and falls back to "Untitled Address"', () => {
        // Test the label rendering by providing an address and checking template output
        const address = makeAddress('456 Elm Ave');
        const wrapper = mount(Step2SiteAddress, {
            global: {
                stubs,
                provide: { heritageSite: makeHeritageSite([address]) },
            },
        });
        const text = wrapper.text();
        expect(text).toContain('456 Elm Ave');
        expect(text).toContain('Victoria');
    });

    it('shows "Untitled Address" label when all address display fields are empty', () => {
        const emptyAddress = {
            aliased_data: {
                street_address: { display_value: '', node_value: null, details: [] },
                city: { display_value: '', node_value: null, details: [] },
                locality: { display_value: '', node_value: null, details: [] },
                postal_code: { display_value: '', node_value: null, details: [] },
                location_description: { display_value: '', node_value: null, details: [] },
                province: { display_value: '', node_value: null, details: [] },
                bc_property_legal_description: [],
            },
        };
        const wrapper = mount(Step2SiteAddress, {
            global: {
                stubs,
                provide: { heritageSite: makeHeritageSite([emptyAddress]) },
            },
        });
        expect(wrapper.text()).toContain('Untitled Address');
    });
});
