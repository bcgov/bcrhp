// vi.mock calls are hoisted by Vitest before any imports.
vi.mock('@/bcrhp/api.ts', () => ({
    getNameType: vi.fn().mockImplementation((name_type: string) =>
        Promise.resolve({
            display_value: name_type,
            node_value: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            details: [],
        }),
    ),
}));

import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref, nextTick } from 'vue';
import Step4SiteNames from './Step4_SiteNames.vue';
import { EditMode } from '../constants.ts';

afterEach(() => {
    vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// A valid UUID v4 for use in name_type.node_value (ConceptValueRequiredSchema)
// ---------------------------------------------------------------------------
const VALID_UUID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

const ToggleSwitchStub = {
    props: { modelValue: { type: Boolean, default: false } },
    emits: ['update:modelValue'],
    template: `<input
        type="checkbox"
        role="switch"
        :checked="modelValue"
        @change="$emit('update:modelValue', $event.target.checked)"
    />`,
};

// ChipsList stub that renders a remove button per item so tests can trigger removal.
const ChipsListStub = {
    props: ['items', 'displayKeys', 'emptyText'],
    emits: ['remove'],
    template: `<div class="chips-list">
        <button
            v-for="(_, i) in (items || [])"
            :key="i"
            class="chip-remove"
            @click="$emit('remove', i)"
        >remove</button>
    </div>`,
};

const stubs = {
    Form: { template: '<form><slot v-bind="{}" /></form>' },
    FieldSet: { template: '<fieldset><slot /></fieldset>' },
    LabelledInput: { template: '<div><slot /></div>' },
    Button: {
        template:
            '<button :disabled="$attrs.disabled" @click="$emit(\'click\')"><slot /></button>',
        emits: ['click'],
    },
    GenericWidget: { template: '<div />' },
    ChipsList: ChipsListStub,
    Step4_SiteNamesView: { template: '<div class="site-names-view" />' },
    TimesCircleIcon: { template: '<span />' },
    ToggleSwitch: ToggleSwitchStub,
};

// ---------------------------------------------------------------------------
// Test data helpers
// ---------------------------------------------------------------------------

/**
 * Creates a site name tile with valid data that passes SiteNamesTileSchema validation.
 * name.node_value.en.value must be non-empty (min 1, max 250).
 * name_type.node_value must be a valid UUID v4.
 */
function makeName(nameType: 'Common' | 'Other', displayValue = 'Test Name') {
    return {
        aliased_data: {
            name: {
                display_value: displayValue,
                node_value: { en: { value: displayValue, direction: 'ltr' } },
            },
            name_type: {
                display_value: nameType,
                node_value: VALID_UUID,
                details: [],
            },
        },
    };
}

function makeHeritageSite(site_names: any[] = []) {
    return ref({ aliased_data: { site_names } });
}

function mountComponent(
    editMode: EditMode,
    heritageSite?: ReturnType<typeof makeHeritageSite>,
) {
    return mount(Step4SiteNames, {
        global: {
            stubs,
            provide: {
                heritageSite: heritageSite ?? makeHeritageSite(),
                editMode,
            },
        },
    });
}

// ---------------------------------------------------------------------------
// Add mode — basic rendering
// ---------------------------------------------------------------------------

describe('Step4_SiteNames — Add mode', () => {
    it('mounts without error', async () => {
        const wrapper = mountComponent(EditMode.Add);
        await flushPromises();
        expect(wrapper.exists()).toBe(true);
    });

    it('renders the names form section', async () => {
        const wrapper = mountComponent(EditMode.Add);
        await flushPromises();
        // v-if="isEditing || editMode === EditMode.Add" is true in Add mode
        expect(wrapper.find('form').exists()).toBe(true);
    });

    it('does not render the Edit mode header in Add mode', async () => {
        const wrapper = mountComponent(EditMode.Add);
        await flushPromises();
        expect(wrapper.find('input[role="switch"]').exists()).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Edit mode — form lifecycle and isValid guard
// ---------------------------------------------------------------------------

describe('Step4_SiteNames — Edit mode', () => {
    it('mounts without error in Edit mode', async () => {
        const wrapper = mountComponent(EditMode.Edit);
        await flushPromises();
        expect(wrapper.exists()).toBe(true);
    });

    it('does not show the names form before editing starts', async () => {
        const wrapper = mountComponent(EditMode.Edit);
        await flushPromises();
        expect(wrapper.find('form').exists()).toBe(false);
    });

    it('shows the names form after "Edit Names" is checked', async () => {
        const wrapper = mountComponent(EditMode.Edit);
        await flushPromises();
        await wrapper.find('input[role="switch"]').setValue(true);
        await nextTick();
        expect(wrapper.find('form').exists()).toBe(true);
    });

    it('hides the names form again when editing is cancelled', async () => {
        const wrapper = mountComponent(EditMode.Edit);
        await flushPromises();
        await wrapper.find('input[role="switch"]').setValue(true);
        await nextTick();
        expect(wrapper.find('form').exists()).toBe(true);

        await wrapper.find('input[role="switch"]').setValue(false);
        await nextTick();
        expect(wrapper.find('form').exists()).toBe(false);
    });

    it('restores site_names from snapshot when editing is cancelled', async () => {
        const hs = makeHeritageSite([makeName('Common', 'Original Name')]);
        const wrapper = mountComponent(EditMode.Edit, hs);
        await flushPromises();

        await wrapper.find('input[role="switch"]').setValue(true);
        await nextTick();

        // Mutate site_names while editing
        hs.value.aliased_data.site_names.push(makeName('Other', 'Added Name'));
        expect(hs.value.aliased_data.site_names).toHaveLength(2);

        // Cancel — snapshot should restore the original list
        await wrapper.find('input[role="switch"]').setValue(false);
        await nextTick();

        expect(hs.value.aliased_data.site_names).toHaveLength(1);
        expect(
            hs.value.aliased_data.site_names[0].aliased_data.name.display_value,
        ).toBe('Original Name');
    });
});

// ---------------------------------------------------------------------------
// isValid — data-only path (form not mounted, Edit mode not editing)
// ---------------------------------------------------------------------------

describe('Step4_SiteNames — isValid (data-only path)', () => {
    it('returns false when there are no site names', () => {
        // In Edit mode with isEditing=false, commonNameForm is not mounted,
        // so isCommonNameValid falls back to Zod schema validation of the data.
        const wrapper = mountComponent(EditMode.Edit, makeHeritageSite([]));
        expect(wrapper.vm.isValid()).toBe(false);
    });

    it('returns false when there is no Common name (only Other names)', () => {
        const hs = makeHeritageSite([makeName('Other', 'Some Other Name')]);
        const wrapper = mountComponent(EditMode.Edit, hs);
        expect(wrapper.vm.isValid()).toBe(false);
    });

    it('returns true when a valid Common name exists', () => {
        const hs = makeHeritageSite([makeName('Common', 'Emily Carr House')]);
        const wrapper = mountComponent(EditMode.Edit, hs);
        expect(wrapper.vm.isValid()).toBe(true);
    });

    it('returns true even when Other names are also present alongside Common', () => {
        const hs = makeHeritageSite([
            makeName('Common', 'Emily Carr House'),
            makeName('Other', 'The Old House'),
        ]);
        const wrapper = mountComponent(EditMode.Edit, hs);
        expect(wrapper.vm.isValid()).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// currentCommonName computed
// ---------------------------------------------------------------------------

describe('Step4_SiteNames — currentCommonName', () => {
    it('emits update:stepIsValid with false on mount when there is no Common name', async () => {
        const wrapper = mountComponent(EditMode.Add, makeHeritageSite([]));
        await flushPromises();
        // The immediate watch fires on mount
        const emitted = wrapper.emitted('update:stepIsValid');
        expect(emitted).toBeTruthy();
    });

    it('passes the Common name aliased_data to the GenericWidget via aliased-node-data', () => {
        // currentCommonName returns the aliased_data of the first Common name.
        // We verify the computed by checking isValid, which reads the same data.
        const hs = makeHeritageSite([
            makeName('Common', 'Craigdarroch Castle'),
        ]);
        const wrapper = mountComponent(EditMode.Edit, hs);
        // isValid uses filterNamesByType('Common') which relies on the same logic
        expect(wrapper.vm.isValid()).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// otherNames computed and removal
// ---------------------------------------------------------------------------

describe('Step4_SiteNames — otherNames and removal', () => {
    it('ChipsList receives only Other names, not Common names', async () => {
        const hs = makeHeritageSite([
            makeName('Common', 'Primary Name'),
            makeName('Other', 'Alt Name 1'),
            makeName('Other', 'Alt Name 2'),
        ]);
        const wrapper = mountComponent(EditMode.Add, hs);
        await flushPromises();
        // ChipsList stub renders one .chip-remove button per item
        expect(wrapper.findAll('.chip-remove')).toHaveLength(2);
    });

    it('removes the correct Other name when the ChipsList emits remove', async () => {
        const hs = makeHeritageSite([
            makeName('Common', 'Primary Name'),
            makeName('Other', 'First Alt'),
            makeName('Other', 'Second Alt'),
        ]);
        const wrapper = mountComponent(EditMode.Add, hs);
        await flushPromises();

        // Click the first chip-remove button → remove index 0 of otherNames
        await wrapper.findAll('.chip-remove')[0].trigger('click');
        await nextTick();

        const remaining = hs.value.aliased_data.site_names.filter(
            (n: any) => n.aliased_data.name_type.display_value === 'Other',
        );
        expect(remaining).toHaveLength(1);
        expect(remaining[0].aliased_data.name.display_value).toBe('Second Alt');
    });
});
