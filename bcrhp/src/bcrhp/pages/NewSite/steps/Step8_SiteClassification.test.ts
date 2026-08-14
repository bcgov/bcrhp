import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref, nextTick } from 'vue';
import Step8SiteClassification from './Step8_SiteClassification.vue';
import { EditMode } from '@/bcrhp/pages/NewSite/constants.ts';

// ---------------------------------------------------------------------------
// Stubs
// ---------------------------------------------------------------------------

const CheckboxStub = {
    inheritAttrs: false,
    props: {
        modelValue: { default: undefined },
        binary: { type: Boolean, default: false },
        value: { default: undefined },
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

const ChipsListStub = {
    props: ['items', 'displayFunction', 'displayKeys', 'label', 'emptyText'],
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
    Step8_SiteClassificationView: {
        template: '<div class="site-classification-view" />',
    },
    TimesCircleIcon: { template: '<span />' },
    Checkbox: CheckboxStub,
};

// ---------------------------------------------------------------------------
// Test data helpers
// ---------------------------------------------------------------------------

function makeHeritageSite(overrides: Record<string, any> = {}) {
    return ref({
        aliased_data: {
            heritage_class: [],
            heritage_function: [],
            heritage_theme: {
                aliased_data: {
                    heritage_theme: {
                        display_value: '',
                        node_value: null,
                        details: [],
                    },
                },
            },
            ...overrides,
        },
    });
}

function mountComponent(
    editMode: EditMode,
    heritageSite?: ReturnType<typeof makeHeritageSite>,
) {
    return mount(Step8SiteClassification, {
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

describe('Step8_SiteClassification — Add mode', () => {
    it('mounts without error', () => {
        const wrapper = mountComponent(EditMode.Add);
        expect(wrapper.exists()).toBe(true);
    });

    it('shows the forms immediately in Add mode', () => {
        const wrapper = mountComponent(EditMode.Add);
        expect(wrapper.find('form').exists()).toBe(true);
    });

    it('does not render the Edit mode checkbox in Add mode', () => {
        const wrapper = mountComponent(EditMode.Add);
        expect(wrapper.find('#editClassificationCheckbox').exists()).toBe(
            false,
        );
    });
});

// ---------------------------------------------------------------------------
// Edit mode — basic rendering and lifecycle
// ---------------------------------------------------------------------------

describe('Step8_SiteClassification — Edit mode', () => {
    it('mounts without error in Edit mode', () => {
        const wrapper = mountComponent(EditMode.Edit);
        expect(wrapper.exists()).toBe(true);
    });

    it('shows the Edit checkbox and hides forms before editing starts', () => {
        const wrapper = mountComponent(EditMode.Edit);
        expect(wrapper.find('#editClassificationCheckbox').exists()).toBe(true);
        expect(wrapper.find('form').exists()).toBe(false);
    });

    it('shows the view component when not editing in Edit mode', () => {
        const wrapper = mountComponent(EditMode.Edit);
        expect(wrapper.find('.site-classification-view').exists()).toBe(true);
    });

    it('shows forms after Edit checkbox is toggled on', async () => {
        const wrapper = mountComponent(EditMode.Edit);
        await wrapper.find('#editClassificationCheckbox').setValue(true);
        await nextTick();
        expect(wrapper.find('form').exists()).toBe(true);
    });

    it('hides forms again when editing is cancelled', async () => {
        const wrapper = mountComponent(EditMode.Edit);
        await wrapper.find('#editClassificationCheckbox').setValue(true);
        await nextTick();
        expect(wrapper.find('form').exists()).toBe(true);

        await wrapper.find('#editClassificationCheckbox').setValue(false);
        await nextTick();
        expect(wrapper.find('form').exists()).toBe(false);
    });

    it('restores heritage_class from snapshot when editing is cancelled', async () => {
        const hs = makeHeritageSite({
            heritage_class: [
                {
                    aliased_data: {
                        heritage_category: {
                            display_value: 'Original Category',
                        },
                        ownership: { display_value: 'Public' },
                        contributing_resource_count: {
                            display_value: '5',
                            node_value: 5,
                        },
                    },
                },
            ],
        });
        const wrapper = mountComponent(EditMode.Edit, hs);

        await wrapper.find('#editClassificationCheckbox').setValue(true);
        await nextTick();

        // Mutate while editing
        hs.value.aliased_data.heritage_class.push({
            aliased_data: {
                heritage_category: { display_value: 'New Category' },
                ownership: { display_value: 'Private' },
                contributing_resource_count: {
                    display_value: '2',
                    node_value: 2,
                },
            },
        } as any);
        expect(hs.value.aliased_data.heritage_class).toHaveLength(2);

        // Cancel — snapshot should restore
        await wrapper.find('#editClassificationCheckbox').setValue(false);
        await nextTick();

        expect(hs.value.aliased_data.heritage_class).toHaveLength(1);
        expect(
            (hs.value.aliased_data.heritage_class[0] as any).aliased_data
                .heritage_category.display_value,
        ).toBe('Original Category');
    });

    it('restores heritage_function from snapshot when editing is cancelled', async () => {
        const hs = makeHeritageSite({
            heritage_function: [
                {
                    aliased_data: {
                        functional_category: { display_value: 'Residential' },
                        functional_state: { display_value: 'Current' },
                    },
                },
            ],
        });
        const wrapper = mountComponent(EditMode.Edit, hs);

        await wrapper.find('#editClassificationCheckbox').setValue(true);
        await nextTick();

        hs.value.aliased_data.heritage_function.push({
            aliased_data: {
                functional_category: { display_value: 'Commercial' },
                functional_state: { display_value: 'Historic' },
            },
        } as any);
        expect(hs.value.aliased_data.heritage_function).toHaveLength(2);

        await wrapper.find('#editClassificationCheckbox').setValue(false);
        await nextTick();

        expect(hs.value.aliased_data.heritage_function).toHaveLength(1);
    });

    it('restores heritage_theme from snapshot when editing is cancelled', async () => {
        const hs = makeHeritageSite({
            heritage_theme: {
                aliased_data: {
                    heritage_theme: {
                        display_value: 'Original Theme',
                        node_value: ['some-uuid'],
                        details: [],
                    },
                },
            },
        });
        const wrapper = mountComponent(EditMode.Edit, hs);

        await wrapper.find('#editClassificationCheckbox').setValue(true);
        await nextTick();

        // Mutate heritage_theme while editing
        hs.value.aliased_data.heritage_theme.aliased_data.heritage_theme.display_value =
            'Modified Theme';

        await wrapper.find('#editClassificationCheckbox').setValue(false);
        await nextTick();

        expect(
            hs.value.aliased_data.heritage_theme.aliased_data.heritage_theme
                .display_value,
        ).toBe('Original Theme');
    });
});

// ---------------------------------------------------------------------------
// isValid
// ---------------------------------------------------------------------------

describe('Step8_SiteClassification — isValid', () => {
    it('returns true in Edit mode when not editing (early-return guard)', () => {
        const wrapper = mountComponent(EditMode.Edit);
        expect(wrapper.vm.isValid()).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// ChipsList removal — heritage_class
// ---------------------------------------------------------------------------

describe('Step8_SiteClassification — heritage_class ChipsList removal', () => {
    it('removes the correct heritage_class when ChipsList emits remove', async () => {
        const hs = makeHeritageSite({
            heritage_class: [
                {
                    aliased_data: {
                        heritage_category: { display_value: 'Category A' },
                        ownership: { display_value: 'Public' },
                        contributing_resource_count: {
                            display_value: '1',
                            node_value: 1,
                        },
                    },
                },
                {
                    aliased_data: {
                        heritage_category: { display_value: 'Category B' },
                        ownership: { display_value: 'Private' },
                        contributing_resource_count: {
                            display_value: '2',
                            node_value: 2,
                        },
                    },
                },
            ],
        });
        const wrapper = mountComponent(EditMode.Add, hs);

        // Only heritage_class has items — 2 chip-remove buttons
        const chipButtons = wrapper.findAll('.chip-remove');
        expect(chipButtons).toHaveLength(2);

        await chipButtons[0].trigger('click');
        await nextTick();

        expect(hs.value.aliased_data.heritage_class).toHaveLength(1);
        expect(
            (hs.value.aliased_data.heritage_class[0] as any).aliased_data
                .heritage_category.display_value,
        ).toBe('Category B');
    });
});

// ---------------------------------------------------------------------------
// ChipsList removal — heritage_function
// ---------------------------------------------------------------------------

describe('Step8_SiteClassification — heritage_function ChipsList removal', () => {
    it('removes the correct heritage_function when ChipsList emits remove', async () => {
        const hs = makeHeritageSite({
            heritage_function: [
                {
                    aliased_data: {
                        functional_category: { display_value: 'Residential' },
                        functional_state: { display_value: 'Current' },
                    },
                },
                {
                    aliased_data: {
                        functional_category: { display_value: 'Commercial' },
                        functional_state: { display_value: 'Historic' },
                    },
                },
            ],
        });
        const wrapper = mountComponent(EditMode.Add, hs);

        const chipButtons = wrapper.findAll('.chip-remove');
        expect(chipButtons).toHaveLength(2);

        await chipButtons[0].trigger('click');
        await nextTick();

        expect(hs.value.aliased_data.heritage_function).toHaveLength(1);
        expect(
            (hs.value.aliased_data.heritage_function[0] as any).aliased_data
                .functional_category.display_value,
        ).toBe('Commercial');
    });
});

// ---------------------------------------------------------------------------
// Interactive stubs — Form with states, GenericWidget that emits, ChipsList
// that calls displayFunction so coverage reaches getText and display functions.
// ---------------------------------------------------------------------------

// FormStubWithState: states:{} makes baseIsValid return true (vacuously —
// Object.keys({}).every(...) === true), and exposes validate/reset on the
// component instance so useTemplateRef picks them up.
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

// GenericWidget stub that forwards node-alias as a data attribute so tests
// can locate the right widget and emit update:value from it.
const GenericWidgetInteractiveStub = {
    inheritAttrs: false,
    props: { nodeAlias: String },
    emits: ['update:value'],
    template: '<div :data-node-alias="nodeAlias" />',
};

// ChipsList stub that calls displayFunction per item so the display/getText
// paths are exercised.
const ChipsListWithDisplayStub = {
    props: ['items', 'displayFunction', 'label'],
    emits: ['remove'],
    template: `<div class="chips-list" :data-label="label">
        <span v-for="(item, i) in (items || [])" :key="i" class="chip-label">{{ displayFunction ? displayFunction(item) : '' }}</span>
        <button v-for="(_, i) in (items || [])" :key="'r'+i" class="chip-remove" @click="$emit('remove', i)">remove</button>
    </div>`,
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
    ChipsList: ChipsListWithDisplayStub,
    Step8_SiteClassificationView: {
        template: '<div class="site-classification-view" />',
    },
    TimesCircleIcon: { template: '<span />' },
    Checkbox: CheckboxStub,
};

function mountInteractive(
    editMode: EditMode = EditMode.Add,
    heritageSite?: ReturnType<typeof makeHeritageSite>,
) {
    return mount(Step8SiteClassification, {
        global: {
            stubs: stubsInteractive,
            provide: {
                heritageSite: heritageSite ?? makeHeritageSite(),
                editMode,
            },
        },
    });
}

// Helper: find the GenericWidget stub for a given node-alias and emit from it.
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
// Computed fallbacks — non-array heritage data
// ---------------------------------------------------------------------------

describe('Step8_SiteClassification — computed fallbacks', () => {
    it('heritageClasses falls back to [] when heritage_class is not an array', () => {
        const hs = ref({
            aliased_data: {
                heritage_class: null,
                heritage_function: [],
                heritage_theme: {
                    aliased_data: { heritage_theme: { display_value: '' } },
                },
            },
        });
        const wrapper = mount(Step8SiteClassification, {
            global: {
                stubs,
                provide: { heritageSite: hs as any, editMode: EditMode.Add },
            },
        });
        expect(wrapper.exists()).toBe(true);
        // No chip-remove buttons because list is empty
        expect(wrapper.findAll('.chip-remove')).toHaveLength(0);
    });

    it('heritageFunctions falls back to [] when heritage_function is not an array', () => {
        const hs = ref({
            aliased_data: {
                heritage_class: [],
                heritage_function: null,
                heritage_theme: {
                    aliased_data: { heritage_theme: { display_value: '' } },
                },
            },
        });
        const wrapper = mount(Step8SiteClassification, {
            global: {
                stubs,
                provide: { heritageSite: hs as any, editMode: EditMode.Add },
            },
        });
        expect(wrapper.exists()).toBe(true);
        expect(wrapper.findAll('.chip-remove')).toHaveLength(0);
    });
});

// ---------------------------------------------------------------------------
// Display functions — getText and heritageClass/Function display formatters
// ---------------------------------------------------------------------------

describe('Step8_SiteClassification — heritageClassDisplayFunction', () => {
    it('formats category, ownership, and resource count via getText', () => {
        const hs = makeHeritageSite({
            heritage_class: [
                {
                    aliased_data: {
                        heritage_category: {
                            display_value: 'Commercial',
                            node_value: null,
                        },
                        ownership: {
                            display_value: 'Public',
                            node_value: null,
                        },
                        contributing_resource_count: {
                            display_value: '5',
                            node_value: 5,
                        },
                    },
                },
            ],
        });
        const wrapper = mountInteractive(EditMode.Add, hs);
        const label = wrapper.find('.chip-label');
        expect(label.text()).toContain('Commercial');
        expect(label.text()).toContain('Public');
        expect(label.text()).toContain('5');
    });

    it('getText falls back to node_value.en.value when display_value is empty', () => {
        const hs = makeHeritageSite({
            heritage_class: [
                {
                    aliased_data: {
                        heritage_category: {
                            display_value: '',
                            node_value: { en: { value: 'Via node value' } },
                        },
                        ownership: {
                            display_value: 'Public',
                            node_value: null,
                        },
                        contributing_resource_count: {
                            display_value: '2',
                            node_value: 2,
                        },
                    },
                },
            ],
        });
        const wrapper = mountInteractive(EditMode.Add, hs);
        expect(wrapper.find('.chip-label').text()).toContain('Via node value');
    });

    it('getText falls back to string node_value when display_value is empty', () => {
        const hs = makeHeritageSite({
            heritage_class: [
                {
                    aliased_data: {
                        heritage_category: {
                            display_value: '',
                            node_value: 'string-uuid',
                        },
                        ownership: {
                            display_value: 'Public',
                            node_value: null,
                        },
                        contributing_resource_count: {
                            display_value: '1',
                            node_value: 1,
                        },
                    },
                },
            ],
        });
        const wrapper = mountInteractive(EditMode.Add, hs);
        expect(wrapper.find('.chip-label').text()).toContain('string-uuid');
    });
});

describe('Step8_SiteClassification — heritageFunctionDisplayFunction', () => {
    it('formats functional_category and functional_state', () => {
        const hs = makeHeritageSite({
            heritage_function: [
                {
                    aliased_data: {
                        functional_category: {
                            display_value: 'Residential',
                            node_value: null,
                        },
                        functional_state: {
                            display_value: 'Current',
                            node_value: null,
                        },
                    },
                },
            ],
        });
        const wrapper = mountInteractive(EditMode.Add, hs);
        // heritage_class is empty → first (only) chip-label belongs to function
        const label = wrapper.find('.chip-label');
        expect(label.text()).toContain('Residential');
        expect(label.text()).toContain('Current');
    });
});

// ---------------------------------------------------------------------------
// updateHeritageClassModelValue
// ---------------------------------------------------------------------------

describe('Step8_SiteClassification — updateHeritageClassModelValue', () => {
    it('fills currentHeritageClass and enables the save button when all fields are set', async () => {
        const wrapper = mountInteractive();

        await emitWidgetValue(wrapper, 'heritage_category', {
            display_value: 'Commercial',
            node_value: 'uuid-cat',
            details: [],
        });
        await emitWidgetValue(wrapper, 'ownership', {
            display_value: 'Public',
            node_value: 'uuid-own',
            details: [],
        });
        await emitWidgetValue(wrapper, 'contributing_resource_count', {
            display_value: '3',
            node_value: 3,
            details: [],
        });

        const saveButton = wrapper.find('#saveHeritageClass');
        expect(saveButton.attributes('disabled')).toBeUndefined();
    });
});

// ---------------------------------------------------------------------------
// saveHeritageClass
// ---------------------------------------------------------------------------

describe('Step8_SiteClassification — saveHeritageClass', () => {
    it('pushes a new entry to heritage_class and resets the form', async () => {
        const hs = makeHeritageSite();
        const wrapper = mountInteractive(EditMode.Add, hs);

        await emitWidgetValue(wrapper, 'heritage_category', {
            display_value: 'Commercial',
            node_value: 'uuid-cat',
            details: [],
        });
        await emitWidgetValue(wrapper, 'ownership', {
            display_value: 'Public',
            node_value: 'uuid-own',
            details: [],
        });
        await emitWidgetValue(wrapper, 'contributing_resource_count', {
            display_value: '3',
            node_value: 3,
            details: [],
        });

        await wrapper.find('#saveHeritageClass').trigger('click');
        await flushPromises();

        expect(hs.value.aliased_data.heritage_class).toHaveLength(1);
    });

    it('emits update:stepIsValid after saving', async () => {
        const wrapper = mountInteractive();

        await emitWidgetValue(wrapper, 'heritage_category', {
            display_value: 'Commercial',
            node_value: 'uuid-cat',
            details: [],
        });
        await emitWidgetValue(wrapper, 'ownership', {
            display_value: 'Public',
            node_value: 'uuid-own',
            details: [],
        });
        await emitWidgetValue(wrapper, 'contributing_resource_count', {
            display_value: '3',
            node_value: 3,
            details: [],
        });

        await wrapper.find('#saveHeritageClass').trigger('click');
        await flushPromises();

        expect(wrapper.emitted('update:stepIsValid')).toBeTruthy();
    });
});

// ---------------------------------------------------------------------------
// updateFunctionCategoryModelValue
// ---------------------------------------------------------------------------

describe('Step8_SiteClassification — updateFunctionCategoryModelValue', () => {
    it('fills currentHeritageFunction and enables the save button when both fields are set', async () => {
        const wrapper = mountInteractive();

        await emitWidgetValue(wrapper, 'functional_category', {
            display_value: 'Residential',
            node_value: 'uuid-fcat',
            details: [],
        });
        await emitWidgetValue(wrapper, 'functional_state', {
            display_value: 'Current',
            node_value: ['uuid-fst'],
            details: [],
        });

        const saveButton = wrapper.find('#saveFunctionCategory');
        expect(saveButton.attributes('disabled')).toBeUndefined();
    });
});

// ---------------------------------------------------------------------------
// saveHeritageFunction
// ---------------------------------------------------------------------------

describe('Step8_SiteClassification — saveHeritageFunction', () => {
    it('pushes a new entry to heritage_function and resets the form', async () => {
        const hs = makeHeritageSite();
        const wrapper = mountInteractive(EditMode.Add, hs);

        await emitWidgetValue(wrapper, 'functional_category', {
            display_value: 'Residential',
            node_value: 'uuid-fcat',
            details: [],
        });
        await emitWidgetValue(wrapper, 'functional_state', {
            display_value: 'Current',
            node_value: ['uuid-fst'],
            details: [],
        });

        await wrapper.find('#saveFunctionCategory').trigger('click');
        await flushPromises();

        expect(hs.value.aliased_data.heritage_function).toHaveLength(1);
    });
});

// ---------------------------------------------------------------------------
// updateHeritageThemeModelValue
// ---------------------------------------------------------------------------

describe('Step8_SiteClassification — updateHeritageThemeModelValue', () => {
    it('updates heritage_theme aliased_data when GenericWidget emits update:value', async () => {
        const hs = makeHeritageSite();
        const wrapper = mountInteractive(EditMode.Add, hs);

        await emitWidgetValue(wrapper, 'heritage_theme', {
            display_value: 'Cultural Landscape',
            node_value: ['uuid-theme'],
            details: [],
        });

        expect(
            hs.value.aliased_data.heritage_theme.aliased_data.heritage_theme
                .display_value,
        ).toBe('Cultural Landscape');
    });
});
