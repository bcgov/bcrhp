import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref, nextTick } from 'vue';
import Step5RecognitionDetails from './Step5_RecognitionDetails.vue';
import { EditMode } from '@/bcrhp/pages/SiteSubmission/constants.ts';

// ---------------------------------------------------------------------------
// Stubs
// ---------------------------------------------------------------------------

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

const ChipsListStub = {
    props: [
        'items',
        'displayFunction',
        'displayKeys',
        'label',
        'disabledFunction',
    ],
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
    Step5_RecognitionDetailsView: {
        template: '<div class="recognition-details-view" />',
    },
    ToggleSwitch: ToggleSwitchStub,
};

// ---------------------------------------------------------------------------
// Test data helpers
// ---------------------------------------------------------------------------

function makeProtectionEvent(overrides: Record<string, any> = {}) {
    return {
        tileid: null,
        aliased_data: {
            designation_or_protection_start_date: {
                node_value: '2020-01-01',
                display_value: '2020-01-01',
            },
            legislative_act: {
                node_value: { en: { value: 'Heritage Conservation Act' } },
                display_value: 'Heritage Conservation Act',
            },
            reference_number: {
                node_value: 'REF-001',
                display_value: 'REF-001',
            },
        },
        ...overrides,
    };
}

function makeHeritageSite(protectionEvents: any[] = []) {
    return ref({
        aliased_data: {
            bc_right: {
                aliased_data: {
                    protection_event: protectionEvents,
                },
            },
        },
    });
}

function mountComponent(
    editMode: EditMode,
    heritageSite?: ReturnType<typeof makeHeritageSite>,
) {
    return mount(Step5RecognitionDetails, {
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

describe('Step5_RecognitionDetails — Add mode', () => {
    it('mounts without error', () => {
        expect(mountComponent(EditMode.Add).exists()).toBe(true);
    });

    it('shows the form immediately in Add mode', () => {
        const wrapper = mountComponent(EditMode.Add);
        expect(wrapper.find('form').exists()).toBe(true);
    });

    it('only has the showInactiveActs toggle in Add mode (no isEditing toggle)', () => {
        const wrapper = mountComponent(EditMode.Add);
        expect(wrapper.findAll('input[role="switch"]')).toHaveLength(1);
    });

    it('isValid returns false when no protection events exist', () => {
        expect(mountComponent(EditMode.Add).vm.isValid()).toBe(false);
    });

    it('isValid returns true when at least one protection event exists', () => {
        const hs = makeHeritageSite([makeProtectionEvent()]);
        expect(mountComponent(EditMode.Add, hs).vm.isValid()).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// Edit mode — rendering and lifecycle
// ---------------------------------------------------------------------------

describe('Step5_RecognitionDetails — Edit mode', () => {
    it('mounts without error in Edit mode', () => {
        expect(mountComponent(EditMode.Edit).exists()).toBe(true);
    });

    it('shows the isEditing toggle and hides the form before editing starts', () => {
        const wrapper = mountComponent(EditMode.Edit);
        expect(wrapper.find('input[role="switch"]').exists()).toBe(true);
        expect(wrapper.find('form').exists()).toBe(false);
    });

    it('shows the view component when not editing', () => {
        const wrapper = mountComponent(EditMode.Edit);
        expect(wrapper.find('.recognition-details-view').exists()).toBe(true);
    });

    it('hides the view component and shows the form after the isEditing toggle is switched on', async () => {
        const wrapper = mountComponent(EditMode.Edit);
        await wrapper.find('input[role="switch"]').setValue(true);
        await nextTick();
        expect(wrapper.find('form').exists()).toBe(true);
        expect(wrapper.find('.recognition-details-view').exists()).toBe(false);
    });

    it('hides the form again when editing is cancelled', async () => {
        const wrapper = mountComponent(EditMode.Edit);
        await wrapper.find('input[role="switch"]').setValue(true);
        await nextTick();
        expect(wrapper.find('form').exists()).toBe(true);

        await wrapper.find('input[role="switch"]').setValue(false);
        await nextTick();
        expect(wrapper.find('form').exists()).toBe(false);
    });

    it('isValid returns false in Edit mode when not editing and no protection events exist', () => {
        // Step5 has no isEditing guard — isValid always reflects whether
        // protection events exist, even when the edit form is closed.
        expect(mountComponent(EditMode.Edit).vm.isValid()).toBe(false);
    });

    it('isValid returns true in Edit mode when protection events exist', () => {
        const hs = makeHeritageSite([makeProtectionEvent()]);
        expect(mountComponent(EditMode.Edit, hs).vm.isValid()).toBe(true);
    });

    it('restores bc_right from snapshot when editing is cancelled', async () => {
        const hs = makeHeritageSite([makeProtectionEvent()]);
        const wrapper = mountComponent(EditMode.Edit, hs);

        await wrapper.find('input[role="switch"]').setValue(true);
        await nextTick();

        // Mutate protection events while editing
        hs.value.aliased_data.bc_right.aliased_data.protection_event.push(
            makeProtectionEvent({ tileid: 'new-event' }),
        );
        expect(
            hs.value.aliased_data.bc_right.aliased_data.protection_event,
        ).toHaveLength(2);

        // Cancel — snapshot should be restored
        await wrapper.find('input[role="switch"]').setValue(false);
        await nextTick();

        expect(
            hs.value.aliased_data.bc_right.aliased_data.protection_event,
        ).toHaveLength(1);
    });
});

// ---------------------------------------------------------------------------
// showInactiveActs toggle — node-alias switching
// ---------------------------------------------------------------------------

// GenericWidget stub that exposes node-alias as a prop so tests can assert
// which alias is currently active on the legislative act widget.
const GenericWidgetInteractiveStub = {
    inheritAttrs: false,
    props: { nodeAlias: String },
    emits: ['update:value'],
    template: '<div :data-node-alias="nodeAlias" />',
};

const stubsWithInteractiveWidget = {
    ...stubs,
    GenericWidget: GenericWidgetInteractiveStub,
};

function mountWithInteractiveWidget(
    editMode: EditMode,
    heritageSite?: ReturnType<typeof makeHeritageSite>,
) {
    return mount(Step5RecognitionDetails, {
        global: {
            stubs: stubsWithInteractiveWidget,
            provide: {
                heritageSite: heritageSite ?? makeHeritageSite(),
                editMode,
            },
        },
    });
}

describe('Step5_RecognitionDetails — showInactiveActs toggle', () => {
    it('defaults to showing active acts only (legislative_act_active alias)', () => {
        const wrapper = mountWithInteractiveWidget(EditMode.Add);
        const widget = wrapper
            .findAllComponents(GenericWidgetInteractiveStub)
            .find((w) => w.props('nodeAlias') === 'legislative_act_active');
        expect(widget).toBeDefined();
    });

    it('switches to the legislative_act alias when showInactiveActs is toggled on', async () => {
        const wrapper = mountWithInteractiveWidget(EditMode.Add);

        // In Add mode, the only toggle is showInactiveActs
        await wrapper.find('input[role="switch"]').setValue(true);
        await nextTick();

        const widget = wrapper
            .findAllComponents(GenericWidgetInteractiveStub)
            .find((w) => w.props('nodeAlias') === 'legislative_act');
        expect(widget).toBeDefined();
    });

    it('reverts to legislative_act_active when showInactiveActs is toggled off again', async () => {
        const wrapper = mountWithInteractiveWidget(EditMode.Add);
        const toggle = wrapper.find('input[role="switch"]');

        await toggle.setValue(true);
        await nextTick();
        await toggle.setValue(false);
        await nextTick();

        const widget = wrapper
            .findAllComponents(GenericWidgetInteractiveStub)
            .find((w) => w.props('nodeAlias') === 'legislative_act_active');
        expect(widget).toBeDefined();
    });
});

// ---------------------------------------------------------------------------
// Interactive stubs — Form with states to satisfy baseIsValid
// ---------------------------------------------------------------------------

const FormStubWithState = {
    template: '<form><slot v-bind="{}" /></form>',
    setup() {
        return {
            states: {},
            validate: vi.fn().mockResolvedValue({ errors: {} }),
            reset: vi.fn(),
            valid: true,
        };
    },
};

const stubsInteractive = {
    Form: FormStubWithState,
    FieldSet: { template: '<fieldset><slot /></fieldset>' },
    LabelledInput: { template: '<div><slot /></div>' },
    Button: {
        template:
            '<button :disabled="$attrs.disabled" @click="$emit(\'click\')"><slot /></button>',
        emits: ['click'],
    },
    GenericWidget: GenericWidgetInteractiveStub,
    ChipsList: ChipsListStub,
    Step5_RecognitionDetailsView: {
        template: '<div class="recognition-details-view" />',
    },
    ToggleSwitch: ToggleSwitchStub,
};

function mountInteractive(
    editMode: EditMode = EditMode.Add,
    heritageSite?: ReturnType<typeof makeHeritageSite>,
) {
    return mount(Step5RecognitionDetails, {
        global: {
            stubs: stubsInteractive,
            provide: {
                heritageSite: heritageSite ?? makeHeritageSite(),
                editMode,
            },
        },
    });
}

async function emitWidgetValue(
    wrapper: ReturnType<typeof mountInteractive>,
    nodeAlias: string,
    value: unknown,
) {
    const widget = wrapper
        .findAllComponents(GenericWidgetInteractiveStub)
        .find((w) => w.props('nodeAlias') === nodeAlias);
    expect(widget, `widget[node-alias="${nodeAlias}"] not found`).toBeDefined();
    await widget!.vm.$emit('update:value', value);
    await nextTick();
}

// ---------------------------------------------------------------------------
// addProtectionEventDisabled
// ---------------------------------------------------------------------------

describe('Step5_RecognitionDetails — addProtectionEventDisabled', () => {
    it('Add button is disabled when no fields are filled', () => {
        const wrapper = mountInteractive();
        expect(
            wrapper.find('#saveRecognitionDetails').attributes('disabled'),
        ).toBeDefined();
    });

    it('Add button is disabled when only start date is provided', async () => {
        const wrapper = mountInteractive();
        await emitWidgetValue(wrapper, 'designation_or_protection_start_date', {
            node_value: '2020-01-01',
            display_value: '2020-01-01',
        });
        expect(
            wrapper.find('#saveRecognitionDetails').attributes('disabled'),
        ).toBeDefined();
    });

    it('Add button is disabled when start date and act are set but reference number is missing', async () => {
        const wrapper = mountInteractive();
        await emitWidgetValue(wrapper, 'designation_or_protection_start_date', {
            node_value: '2020-01-01',
            display_value: '2020-01-01',
        });
        await emitWidgetValue(wrapper, 'legislative_act_active', {
            node_value: { en: { value: 'Heritage Act' } },
            display_value: 'Heritage Act',
        });
        expect(
            wrapper.find('#saveRecognitionDetails').attributes('disabled'),
        ).toBeDefined();
    });

    it('Add button is enabled when all required fields are filled', async () => {
        const wrapper = mountInteractive();
        await emitWidgetValue(wrapper, 'designation_or_protection_start_date', {
            node_value: '2020-01-01',
            display_value: '2020-01-01',
        });
        await emitWidgetValue(wrapper, 'legislative_act_active', {
            node_value: { en: { value: 'Heritage Act' } },
            display_value: 'Heritage Act',
        });
        await emitWidgetValue(wrapper, 'reference_number', {
            node_value: 'REF-001',
            display_value: 'REF-001',
        });
        expect(
            wrapper.find('#saveRecognitionDetails').attributes('disabled'),
        ).toBeUndefined();
    });

    it('Add button is disabled when 5 protection events already exist', () => {
        const events = Array.from({ length: 5 }, () => makeProtectionEvent());
        const hs = makeHeritageSite(events);
        const wrapper = mountInteractive(EditMode.Add, hs);
        expect(
            wrapper.find('#saveRecognitionDetails').attributes('disabled'),
        ).toBeDefined();
    });
});

// ---------------------------------------------------------------------------
// addProtectionEvent
// ---------------------------------------------------------------------------

describe('Step5_RecognitionDetails — addProtectionEvent', () => {
    async function fillAndSave(wrapper: ReturnType<typeof mountInteractive>) {
        await emitWidgetValue(wrapper, 'designation_or_protection_start_date', {
            node_value: '2020-01-01',
            display_value: '2020-01-01',
        });
        await emitWidgetValue(wrapper, 'legislative_act_active', {
            node_value: { en: { value: 'Heritage Act' } },
            display_value: 'Heritage Act',
        });
        await emitWidgetValue(wrapper, 'reference_number', {
            node_value: 'REF-001',
            display_value: 'REF-001',
        });
        await wrapper.find('#saveRecognitionDetails').trigger('click');
        await flushPromises();
    }

    it('pushes the new event to the protection_event list', async () => {
        const hs = makeHeritageSite();
        const wrapper = mountInteractive(EditMode.Add, hs);
        await fillAndSave(wrapper);
        expect(
            hs.value.aliased_data.bc_right.aliased_data.protection_event,
        ).toHaveLength(1);
    });

    it('emits update:stepIsValid with true after saving', async () => {
        const wrapper = mountInteractive();
        await fillAndSave(wrapper);
        const emitted = wrapper.emitted('update:stepIsValid');
        expect(emitted).toBeTruthy();
        expect(emitted![emitted!.length - 1]).toEqual([true]);
    });

    it('builds a customDisplay label from date and legislative act', async () => {
        const hs = makeHeritageSite();
        const wrapper = mountInteractive(EditMode.Add, hs);
        await fillAndSave(wrapper);
        const saved = hs.value.aliased_data.bc_right.aliased_data
            .protection_event[0] as any;
        expect(saved.customDisplay).toContain('2020-01-01');
        expect(saved.customDisplay).toContain('Heritage Act');
    });

    it('appends the reference number in parentheses to the label', async () => {
        const hs = makeHeritageSite();
        const wrapper = mountInteractive(EditMode.Add, hs);
        await fillAndSave(wrapper);
        const saved = hs.value.aliased_data.bc_right.aliased_data
            .protection_event[0] as any;
        expect(saved.customDisplay).toContain('(REF-001)');
    });

    it('resets the current form so the Add button is disabled after saving', async () => {
        const wrapper = mountInteractive();
        await fillAndSave(wrapper);
        expect(
            wrapper.find('#saveRecognitionDetails').attributes('disabled'),
        ).toBeDefined();
    });

    it('uses the display_value fallback for the legislative act when node_value has no en.value', async () => {
        const hs = makeHeritageSite();
        const wrapper = mountInteractive(EditMode.Add, hs);
        await emitWidgetValue(wrapper, 'designation_or_protection_start_date', {
            node_value: '2021-06-01',
            display_value: '2021-06-01',
        });
        // Emit an act whose node_value has no en.value — label falls back to display_value
        await emitWidgetValue(wrapper, 'legislative_act_active', {
            node_value: {},
            display_value: 'Via Display Value',
        });
        await emitWidgetValue(wrapper, 'reference_number', {
            node_value: 'REF-002',
            display_value: 'REF-002',
        });
        await wrapper.find('#saveRecognitionDetails').trigger('click');
        await flushPromises();
        const saved = hs.value.aliased_data.bc_right.aliased_data
            .protection_event[0] as any;
        expect(saved.customDisplay).toContain('Via Display Value');
    });
});

// ---------------------------------------------------------------------------
// deleteProtectionEvent
// ---------------------------------------------------------------------------

describe('Step5_RecognitionDetails — deleteProtectionEvent', () => {
    it('removes the event at the correct index', async () => {
        const events = [
            makeProtectionEvent({ tileid: null }),
            makeProtectionEvent({ tileid: null }),
        ];
        const hs = makeHeritageSite(events);
        const wrapper = mountInteractive(EditMode.Add, hs);

        const chipButtons = wrapper.findAll('.chip-remove');
        expect(chipButtons).toHaveLength(2);

        await chipButtons[0].trigger('click');
        await nextTick();

        expect(
            hs.value.aliased_data.bc_right.aliased_data.protection_event,
        ).toHaveLength(1);
    });

    it('emits update:stepIsValid with false after the last event is deleted', async () => {
        const hs = makeHeritageSite([makeProtectionEvent({ tileid: null })]);
        const wrapper = mountInteractive(EditMode.Add, hs);

        await wrapper.find('.chip-remove').trigger('click');
        await nextTick();

        const emitted = wrapper.emitted('update:stepIsValid');
        expect(emitted).toBeTruthy();
        expect(emitted![emitted!.length - 1]).toEqual([false]);
    });
});

// ---------------------------------------------------------------------------
// isExistingProtectionEvent
// ---------------------------------------------------------------------------

describe('Step5_RecognitionDetails — isExistingProtectionEvent', () => {
    it('returns false for a new event with no tileid', () => {
        const wrapper = mountComponent(EditMode.Add);
        expect(
            (wrapper.vm as any).isExistingProtectionEvent({ tileid: null }),
        ).toBe(false);
    });

    it('returns true for a persisted event that has a tileid', () => {
        const wrapper = mountComponent(EditMode.Add);
        expect(
            (wrapper.vm as any).isExistingProtectionEvent({
                tileid: 'some-uuid',
            }),
        ).toBe(true);
    });
});
