// vi.mock calls are hoisted by Vitest before any imports.
vi.mock('@/bcrhp/api.ts', () => ({
    getPidData: vi.fn(),
}));

import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref, nextTick } from 'vue';
import Step2SiteAddress from './Step2_SiteAddress.vue';
import { EditMode } from '../constants.ts';

afterEach(() => {
    vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Checkbox stub — supports binary v-model (boolean) and array v-model.
// Declaring binary/small as Boolean ensures Vue coerces bare attributes to true.
// ---------------------------------------------------------------------------

const CheckboxStub = {
    inheritAttrs: false,
    props: {
        modelValue: { default: undefined },
        binary: { type: Boolean, default: false },
        value: { default: undefined },
        small: { type: Boolean, default: false },
    },
    emits: ['update:modelValue', 'change'],
    template: `<input
        type="checkbox"
        v-bind="$attrs"
        :checked="binary ? modelValue : (Array.isArray(modelValue) && modelValue.includes(value))"
        @change="onChange"
    />`,
    methods: {
        onChange(e: Event) {
            const checked = (e.target as HTMLInputElement).checked;
            if ((this as any).binary) {
                (this as any).$emit('update:modelValue', checked);
            } else {
                const arr = Array.isArray((this as any).modelValue)
                    ? [...(this as any).modelValue]
                    : [];
                if (checked) arr.push((this as any).value);
                else {
                    const i = arr.indexOf((this as any).value);
                    if (i !== -1) arr.splice(i, 1);
                }
                (this as any).$emit('update:modelValue', arr);
            }
            (this as any).$emit('change', e);
        },
    },
};

const stubs = {
    Form: { template: '<form><slot v-bind="{}" /></form>' },
    FieldSet: { template: '<fieldset><slot /></fieldset>' },
    LabelledInput: { template: '<div><slot /></div>' },
    LabelledCheckboxInput: { template: '<div><slot /></div>' },
    Checkbox: CheckboxStub,
    Button: {
        template:
            '<button :disabled="$attrs.disabled" @click="$emit(\'click\')"><slot /></button>',
        emits: ['click'],
    },
    Chip: { template: '<span><slot /></span>' },
    Dialog: {
        props: { visible: { type: Boolean, default: false } },
        template: '<div v-if="visible"><slot /></div>',
    },
    GenericWidget: { template: '<div />' },
    ChipsList: { template: '<div />' },
    Step2_SiteAddressView: { template: '<div class="site-address-view" />' },
    TimesCircleIcon: { template: '<span />' },
};

// ---------------------------------------------------------------------------
// Test data helpers
// ---------------------------------------------------------------------------

function makeAddress(street = '123 Main St') {
    return {
        aliased_data: {
            street_address: {
                display_value: street,
                node_value: null,
                details: [],
            },
            city: { display_value: 'Victoria', node_value: null, details: [] },
            locality: {
                display_value: 'Capital',
                node_value: null,
                details: [],
            },
            postal_code: {
                display_value: 'V8W 1A1',
                node_value: null,
                details: [],
            },
            location_description: {
                display_value: '',
                node_value: null,
                details: [],
            },
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

function mountComponent(
    editMode: EditMode,
    heritageSite?: ReturnType<typeof makeHeritageSite>,
) {
    return mount(Step2SiteAddress, {
        global: {
            stubs,
            directives: { tooltip: {} },
            provide: {
                heritageSite: heritageSite ?? makeHeritageSite(),
                editMode,
            },
        },
    });
}

// ---------------------------------------------------------------------------
// Add mode — basic validity and address display
// ---------------------------------------------------------------------------

describe('Step2_SiteAddress — Add mode', () => {
    it('mounts without error', () => {
        expect(mountComponent(EditMode.Add).exists()).toBe(true);
    });

    it('isValid returns false when property address is required but none has been added', () => {
        expect(mountComponent(EditMode.Add).vm.isValid()).toBe(false);
    });

    it('isValid returns true when at least one property address has been added', () => {
        const hs = makeHeritageSite([makeAddress()]);
        expect(mountComponent(EditMode.Add, hs).vm.isValid()).toBe(true);
    });

    it('isValid returns true after "no street address" checkbox is toggled, regardless of address list', async () => {
        const wrapper = mountComponent(EditMode.Add);
        expect(wrapper.vm.isValid()).toBe(false);

        await wrapper.find('#hasCivicAddress').trigger('change');

        expect(wrapper.vm.isValid()).toBe(true);
    });

    it('emits update:stepIsValid with true after "no street address" is checked', async () => {
        const wrapper = mountComponent(EditMode.Add);

        await wrapper.find('#hasCivicAddress').trigger('change');

        const emitted = wrapper.emitted('update:stepIsValid');
        expect(emitted).toBeTruthy();
        expect(emitted![emitted!.length - 1]).toEqual([true]);
    });

    it('getAddressLabel uses " - " as separator between non-empty fields', () => {
        const wrapper = mountComponent(
            EditMode.Add,
            makeHeritageSite([makeAddress('456 Elm Ave')]),
        );
        const text = wrapper.text();
        expect(text).toContain('456 Elm Ave');
        expect(text).toContain('Victoria');
    });

    it('shows "Untitled Address" label when all address display fields are empty', () => {
        const emptyAddress = {
            aliased_data: {
                street_address: {
                    display_value: '',
                    node_value: null,
                    details: [],
                },
                city: { display_value: '', node_value: null, details: [] },
                locality: { display_value: '', node_value: null, details: [] },
                postal_code: {
                    display_value: '',
                    node_value: null,
                    details: [],
                },
                location_description: {
                    display_value: '',
                    node_value: null,
                    details: [],
                },
                province: { display_value: '', node_value: null, details: [] },
                bc_property_legal_description: [],
            },
        };
        const wrapper = mountComponent(
            EditMode.Add,
            makeHeritageSite([emptyAddress]),
        );
        expect(wrapper.text()).toContain('Untitled Address');
    });
});

// ---------------------------------------------------------------------------
// Edit mode — form lifecycle, isValid guard, snapshot restore
// ---------------------------------------------------------------------------

describe('Step2_SiteAddress — Edit mode', () => {
    it('mounts without error in Edit mode', () => {
        expect(mountComponent(EditMode.Edit).exists()).toBe(true);
    });

    it('isValid returns true in Edit mode when not editing (edit guard)', () => {
        // isEditing starts false → isValid short-circuits to true regardless of addresses.
        expect(mountComponent(EditMode.Edit).vm.isValid()).toBe(true);
    });

    it('does not show the address form before editing starts', () => {
        const wrapper = mountComponent(EditMode.Edit);
        expect(wrapper.find('form').exists()).toBe(false);
    });

    it('shows the address form after "Edit Site Addresses" is checked', async () => {
        const wrapper = mountComponent(EditMode.Edit);
        await wrapper.find('#editAddressCheckbox').setValue(true);
        await nextTick();
        expect(wrapper.find('form').exists()).toBe(true);
    });

    it('hides the address form again when editing is cancelled', async () => {
        const wrapper = mountComponent(EditMode.Edit);
        await wrapper.find('#editAddressCheckbox').setValue(true);
        await nextTick();
        expect(wrapper.find('form').exists()).toBe(true);

        await wrapper.find('#editAddressCheckbox').setValue(false);
        await nextTick();
        expect(wrapper.find('form').exists()).toBe(false);
    });

    it('restores heritage_site_location from snapshot when editing is cancelled', async () => {
        const hs = makeHeritageSite([makeAddress('123 Original St')]);
        const wrapper = mountComponent(EditMode.Edit, hs);

        await wrapper.find('#editAddressCheckbox').setValue(true);
        await nextTick();

        // Mutate the address list while editing
        hs.value.aliased_data.heritage_site_location[0].aliased_data.bc_property_address.push(
            makeAddress('999 Added St'),
        );
        expect(
            hs.value.aliased_data.heritage_site_location[0].aliased_data
                .bc_property_address,
        ).toHaveLength(2);

        // Cancel — snapshot should be restored
        await wrapper.find('#editAddressCheckbox').setValue(false);
        await nextTick();

        const addresses =
            hs.value.aliased_data.heritage_site_location[0].aliased_data
                .bc_property_address;
        expect(addresses).toHaveLength(1);
        expect(addresses[0].aliased_data.street_address.display_value).toBe(
            '123 Original St',
        );
    });

    it('isValid returns false while editing with no addresses', async () => {
        const wrapper = mountComponent(EditMode.Edit);
        await wrapper.find('#editAddressCheckbox').setValue(true);
        await nextTick();
        expect(wrapper.vm.isValid()).toBe(false);
    });

    it('isValid returns true while editing when an address exists', async () => {
        const hs = makeHeritageSite([makeAddress()]);
        const wrapper = mountComponent(EditMode.Edit, hs);
        await wrapper.find('#editAddressCheckbox').setValue(true);
        await nextTick();
        expect(wrapper.vm.isValid()).toBe(true);
    });
});
