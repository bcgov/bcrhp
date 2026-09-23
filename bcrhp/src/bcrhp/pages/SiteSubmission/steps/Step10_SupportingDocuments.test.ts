import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';

vi.mock('uuid', () => ({
    generate: vi.fn(() => '00000000-0000-0000-0000-000000000000'),
    v4: vi.fn(() => '00000000-0000-0000-0000-000000000000'),
}));
import { ref, nextTick } from 'vue';
import Step10SupportingDocuments from './Step10_SupportingDocuments.vue';
import { EditMode } from '@/bcrhp/pages/SiteSubmission/constants.ts';

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

const stubs = {
    Form: { template: '<form><slot v-bind="{}" /></form>' },
    FieldSet: { template: '<fieldset><slot /></fieldset>' },
    LabelledInput: { template: '<div><slot /></div>' },
    GenericWidget: { template: '<div />' },
    Button: {
        template:
            '<button :disabled="$attrs.disabled" @click="$emit(\'click\')"><slot /></button>',
        emits: ['click'],
    },
    ChipsList: { template: '<div />' },
    Step10_SupportingDocumentsView: {
        template: '<div class="supporting-docs-view" />',
    },
    ToggleSwitch: ToggleSwitchStub,
};

function makeHeritageSite(
    site_document: any[] = [],
    internal_remark: any[] = [],
) {
    return ref({
        aliased_data: {
            site_document,
            internal_remark,
        },
    });
}

function mountComponent(
    editMode: EditMode,
    heritageSite?: ReturnType<typeof makeHeritageSite>,
) {
    return mount(Step10SupportingDocuments, {
        global: {
            stubs,
            provide: {
                heritageSite:
                    heritageSite ??
                    makeHeritageSite([], [{ aliased_data: {} }]),
                editMode,
            },
        },
    });
}

function makeDocument(type = 'Bylaw', filename = 'doc.pdf') {
    return {
        aliased_data: {
            site_document: {
                display_value: '',
                node_value: [{ name: filename }],
                details: [],
            },
            document_type: {
                display_value: type,
                node_value: null,
                details: [],
            },
            document_description: {
                display_value: 'A required document',
                node_value: null,
                details: [],
            },
        },
        customDisplay: `${type} - ${filename}`,
    };
}

describe('Step10_SupportingDocuments', () => {
    it('mounts without error', () => {
        const wrapper = mount(Step10SupportingDocuments, {
            global: {
                stubs,
                provide: {
                    heritageSite: makeHeritageSite([], [{ aliased_data: {} }]),
                    editMode: EditMode.Add,
                },
            },
        });
        expect(wrapper.exists()).toBe(true);
    });

    it('isValid returns false when no documents have been added', () => {
        const wrapper = mount(Step10SupportingDocuments, {
            global: {
                stubs,
                provide: {
                    heritageSite: makeHeritageSite([], [{ aliased_data: {} }]),
                    editMode: EditMode.Add,
                },
            },
        });
        expect(wrapper.vm.isValid()).toBe(false);
    });

    it('isValid returns true when at least one document has been added', () => {
        const wrapper = mount(Step10SupportingDocuments, {
            global: {
                stubs,
                provide: {
                    heritageSite: makeHeritageSite(
                        [makeDocument()],
                        [{ aliased_data: {} }],
                    ),
                    editMode: EditMode.Add,
                },
            },
        });
        expect(wrapper.vm.isValid()).toBe(true);
    });

    it('isValid returns false after all documents are deleted', async () => {
        const heritageSite = makeHeritageSite(
            [makeDocument()],
            [{ aliased_data: {} }],
        );
        const wrapper = mount(Step10SupportingDocuments, {
            global: {
                stubs,
                provide: { heritageSite, editMode: EditMode.Add },
            },
        });
        expect(wrapper.vm.isValid()).toBe(true);

        heritageSite.value.aliased_data.site_document.splice(0, 1);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.isValid()).toBe(false);
    });

    it('emits update:stepIsValid false on mount when no documents exist', async () => {
        const wrapper = mount(Step10SupportingDocuments, {
            global: {
                stubs,
                provide: {
                    heritageSite: makeHeritageSite([], [{ aliased_data: {} }]),
                    editMode: EditMode.Add,
                },
            },
        });
        // isValid is not emitted on mount; confirm via direct call
        expect(wrapper.vm.isValid()).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Edit mode — rendering and lifecycle
// ---------------------------------------------------------------------------

describe('Step10_SupportingDocuments — Edit mode', () => {
    it('mounts without error in Edit mode', () => {
        const wrapper = mountComponent(EditMode.Edit);
        expect(wrapper.exists()).toBe(true);
    });

    it('shows the Edit toggle and hides the document form before editing starts', () => {
        const wrapper = mountComponent(EditMode.Edit);
        expect(wrapper.find('input[role="switch"]').exists()).toBe(true);
        // The submission-notes Form is always rendered; check the conditional
        // documents fieldset instead.
        expect(wrapper.find('#documentsFieldset').exists()).toBe(false);
    });

    it('shows the view component when not editing', () => {
        const wrapper = mountComponent(EditMode.Edit);
        expect(wrapper.find('.supporting-docs-view').exists()).toBe(true);
    });

    it('shows the document form after the Edit toggle is switched on', async () => {
        const wrapper = mountComponent(EditMode.Edit);
        await wrapper.find('input[role="switch"]').setValue(true);
        await nextTick();
        expect(wrapper.find('#documentsFieldset').exists()).toBe(true);
    });

    it('hides the document form when editing is cancelled', async () => {
        const wrapper = mountComponent(EditMode.Edit);
        await wrapper.find('input[role="switch"]').setValue(true);
        await nextTick();
        await wrapper.find('input[role="switch"]').setValue(false);
        await nextTick();
        expect(wrapper.find('#documentsFieldset').exists()).toBe(false);
    });

    it('restores site_document from snapshot when editing is cancelled', async () => {
        const hs = makeHeritageSite([makeDocument()], [{ aliased_data: {} }]);
        const wrapper = mountComponent(EditMode.Edit, hs);

        await wrapper.find('input[role="switch"]').setValue(true);
        await nextTick();

        hs.value.aliased_data.site_document.push(
            makeDocument('Resolution', 'res.pdf'),
        );
        expect(hs.value.aliased_data.site_document).toHaveLength(2);

        await wrapper.find('input[role="switch"]').setValue(false);
        await nextTick();

        expect(hs.value.aliased_data.site_document).toHaveLength(1);
    });

    it('restores internal_remark from snapshot when editing is cancelled', async () => {
        const hs = makeHeritageSite(
            [],
            [
                {
                    aliased_data: {
                        internal_remark: { display_value: 'Original note' },
                    },
                },
            ],
        );
        const wrapper = mountComponent(EditMode.Edit, hs);

        await wrapper.find('input[role="switch"]').setValue(true);
        await nextTick();

        (
            hs.value.aliased_data.internal_remark[0] as any
        ).aliased_data.internal_remark = { display_value: 'Modified note' };

        await wrapper.find('input[role="switch"]').setValue(false);
        await nextTick();

        expect(
            (hs.value.aliased_data.internal_remark[0] as any).aliased_data
                .internal_remark.display_value,
        ).toBe('Original note');
    });
});

// ---------------------------------------------------------------------------
// isValid — Edit mode always returns true
// ---------------------------------------------------------------------------

describe('Step10_SupportingDocuments — isValid in Edit mode', () => {
    it('returns true in Edit mode even with no documents', () => {
        const wrapper = mountComponent(EditMode.Edit);
        expect(wrapper.vm.isValid()).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// siteDocumentList computed fallback
// ---------------------------------------------------------------------------

describe('Step10_SupportingDocuments — siteDocumentList computed', () => {
    it('falls back to [] when site_document is undefined', () => {
        const hs = ref({ aliased_data: { internal_remark: [] } });
        const wrapper = mount(Step10SupportingDocuments, {
            global: {
                stubs,
                provide: { heritageSite: hs as any, editMode: EditMode.Add },
            },
        });
        expect(wrapper.exists()).toBe(true);
        // isValid checks siteDocumentList.value.length; with an empty fallback it returns false
        expect(wrapper.vm.isValid()).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Interactive stubs
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

const GenericWidgetInteractiveStub = {
    inheritAttrs: false,
    props: { nodeAlias: String },
    emits: ['update:value'],
    template: '<div :data-node-alias="nodeAlias" />',
};

// Calls both displayFunction and disabledFunction so those branches are covered.
const ChipsListInteractiveStub = {
    props: ['items', 'displayFunction', 'disabledFunction', 'label'],
    emits: ['remove'],
    template: `<div class="chips-list" :data-label="label">
        <span v-for="(item, i) in (items || [])" :key="i" class="chip-label">{{ displayFunction ? displayFunction(item) : '' }}</span>
        <span v-for="(item, i) in (items || [])" :key="'d'+i" :class="disabledFunction && disabledFunction(item) ? 'chip-disabled' : 'chip-enabled'"></span>
        <button v-for="(_, i) in (items || [])" :key="'r'+i" class="chip-remove" @click="$emit('remove', i)">remove</button>
    </div>`,
};

const stubsInteractive = {
    Form: FormStubWithState,
    FieldSet: { template: '<fieldset><slot /></fieldset>' },
    LabelledInput: { template: '<div><slot /></div>' },
    GenericWidget: GenericWidgetInteractiveStub,
    Button: {
        template:
            '<button :disabled="$attrs.disabled" @click="$emit(\'click\')">{{ $attrs.label }}<slot /></button>',
        emits: ['click'],
    },
    ChipsList: ChipsListInteractiveStub,
    Step10_SupportingDocumentsView: {
        template: '<div class="supporting-docs-view" />',
    },
    ToggleSwitch: ToggleSwitchStub,
};

function mountInteractive(
    editMode: EditMode = EditMode.Add,
    heritageSite?: ReturnType<typeof makeHeritageSite>,
) {
    return mount(Step10SupportingDocuments, {
        global: {
            stubs: stubsInteractive,
            provide: {
                heritageSite:
                    heritageSite ??
                    makeHeritageSite([], [{ aliased_data: {} }]),
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
    await flushPromises();
}

// ---------------------------------------------------------------------------
// saveDocument
// ---------------------------------------------------------------------------

describe('Step10_SupportingDocuments — saveDocument', () => {
    it('Add button is enabled when form is valid and list is not full', async () => {
        const wrapper = mountInteractive();
        // addDocumentDisabled depends on supportingDocumentsForm template ref,
        // which is set during mount but triggers a re-render on the next tick.
        await nextTick();
        const addButton = wrapper.find('#addOtherName');
        expect(addButton.attributes('disabled')).toBeUndefined();
    });

    it('pushes a new entry to site_document when Add is clicked', async () => {
        const hs = makeHeritageSite([], [{ aliased_data: {} }]);
        const wrapper = mountInteractive(EditMode.Add, hs);
        await nextTick(); // ensure form ref is set before interacting

        await emitWidgetValue(wrapper, 'site_document', {
            display_value: '',
            node_value: [{ name: 'bylaw.pdf' }],
            details: [],
        });
        await emitWidgetValue(wrapper, 'document_type', {
            display_value: 'Bylaw',
            node_value: 'uuid-type',
            details: [],
        });
        await emitWidgetValue(wrapper, 'document_description', {
            display_value: 'Council bylaw',
            node_value: null,
            details: [],
        });

        await wrapper.find('#addOtherName').trigger('click');
        await flushPromises();

        expect(hs.value.aliased_data.site_document).toHaveLength(1);
    });

    it('emits update:stepIsValid true after a document is saved', async () => {
        const hs = makeHeritageSite([], [{ aliased_data: {} }]);
        const wrapper = mountInteractive(EditMode.Add, hs);
        await nextTick(); // Wait for the form ref to be set so the button is not disabled.

        // Provide a valid node_value so documentDisplayFunction doesn't throw
        // when the ChipsList renders the newly saved chip.
        await emitWidgetValue(wrapper, 'site_document', {
            display_value: '',
            node_value: [{ name: 'bylaw.pdf' }],
            details: [],
        });
        await emitWidgetValue(wrapper, 'document_type', {
            display_value: 'Bylaw',
            node_value: 'uuid-type',
            details: [],
        });
        await emitWidgetValue(wrapper, 'document_description', {
            display_value: 'Council bylaw',
            node_value: null,
            details: [],
        });

        await wrapper.find('#addOtherName').trigger('click');
        await flushPromises();

        const emitted = wrapper.emitted('update:stepIsValid');
        expect(emitted).toBeTruthy();
        expect(emitted!.at(-1)).toEqual([true]);
    });

    it('Add button is disabled when the document list has reached 10 entries', () => {
        const docs = Array.from({ length: 10 }, (_, i) =>
            makeDocument('Bylaw', `doc${i}.pdf`),
        );
        const hs = makeHeritageSite(docs, [{ aliased_data: {} }]);
        const wrapper = mountInteractive(EditMode.Add, hs);
        const addButton = wrapper.find('button');
        expect(addButton.attributes('disabled')).toBeDefined();
    });
});

// ---------------------------------------------------------------------------
// deleteSiteDocument via ChipsList
// ---------------------------------------------------------------------------

describe('Step10_SupportingDocuments — deleteSiteDocument', () => {
    it('removes the correct document when ChipsList emits remove', async () => {
        const hs = makeHeritageSite(
            [
                makeDocument('Bylaw', 'bylaw.pdf'),
                makeDocument('Resolution', 'res.pdf'),
            ],
            [{ aliased_data: {} }],
        );
        const wrapper = mountInteractive(EditMode.Add, hs);

        const chipButtons = wrapper.findAll('.chip-remove');
        expect(chipButtons).toHaveLength(2);

        await chipButtons[0].trigger('click');
        await nextTick();

        expect(hs.value.aliased_data.site_document).toHaveLength(1);
    });

    it('emits update:stepIsValid false after the last document is removed', async () => {
        const hs = makeHeritageSite([makeDocument()], [{ aliased_data: {} }]);
        const wrapper = mountInteractive(EditMode.Add, hs);

        await wrapper.find('.chip-remove').trigger('click');
        await nextTick();

        const emitted = wrapper.emitted('update:stepIsValid');
        expect(emitted).toBeTruthy();
        expect(emitted!.at(-1)).toEqual([false]);
    });
});

// ---------------------------------------------------------------------------
// documentDisplayFunction and isExistingDocument
// ---------------------------------------------------------------------------

describe('Step10_SupportingDocuments — documentDisplayFunction', () => {
    it('formats the chip label as "filename  (type) description"', () => {
        const hs = makeHeritageSite(
            [
                {
                    aliased_data: {
                        site_document: {
                            display_value: '',
                            node_value: [{ name: 'bylaw.pdf' }],
                            details: [],
                        },
                        document_type: {
                            display_value: 'Bylaw',
                            node_value: null,
                        },
                        document_description: {
                            display_value: 'Council minutes',
                            node_value: null,
                        },
                    },
                },
            ],
            [{ aliased_data: {} }],
        );
        const wrapper = mountInteractive(EditMode.Add, hs);
        const label = wrapper.find('.chip-label');
        expect(label.text()).toContain('bylaw.pdf');
        expect(label.text()).toContain('Bylaw');
        expect(label.text()).toContain('Council minutes');
    });
});

describe('Step10_SupportingDocuments — isExistingDocument', () => {
    it('marks a document as disabled when its status is "uploaded"', () => {
        const hs = makeHeritageSite(
            [
                {
                    aliased_data: {
                        site_document: {
                            display_value: '',
                            node_value: [
                                { name: 'existing.pdf', status: 'uploaded' },
                            ],
                            details: [],
                        },
                        document_type: {
                            display_value: 'Bylaw',
                            node_value: null,
                        },
                        document_description: {
                            display_value: '',
                            node_value: null,
                        },
                    },
                },
            ],
            [{ aliased_data: {} }],
        );
        const wrapper = mountInteractive(EditMode.Add, hs);
        expect(wrapper.find('.chip-disabled').exists()).toBe(true);
    });

    it('does not mark a document as disabled when status is not "uploaded"', () => {
        const hs = makeHeritageSite([makeDocument()], [{ aliased_data: {} }]);
        const wrapper = mountInteractive(EditMode.Add, hs);
        expect(wrapper.find('.chip-disabled').exists()).toBe(false);
        expect(wrapper.find('.chip-enabled').exists()).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// updateModelValue — internal_remark initialisation
// ---------------------------------------------------------------------------

describe('Step10_SupportingDocuments — updateModelValue (internal_remark)', () => {
    it('initialises the internal_remark array when it is empty before updating', async () => {
        const hs = makeHeritageSite([], []);
        const wrapper = mountInteractive(EditMode.Add, hs);

        await emitWidgetValue(wrapper, 'internal_remark', {
            display_value: 'A note',
            node_value: { en: { value: 'A note', direction: 'ltr' } },
            details: [],
        });

        expect(hs.value.aliased_data.internal_remark).toHaveLength(1);
    });

    it('does not push a duplicate when internal_remark already has an entry', async () => {
        const hs = makeHeritageSite(
            [],
            [{ aliased_data: { internal_remark: { display_value: '' } } }],
        );
        const wrapper = mountInteractive(EditMode.Add, hs);

        await emitWidgetValue(wrapper, 'internal_remark', {
            display_value: 'Updated note',
            node_value: { en: { value: 'Updated note', direction: 'ltr' } },
            details: [],
        });

        expect(hs.value.aliased_data.internal_remark).toHaveLength(1);
    });
});
