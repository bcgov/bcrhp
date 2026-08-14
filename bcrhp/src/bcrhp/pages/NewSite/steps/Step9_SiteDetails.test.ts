import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref, nextTick } from 'vue';
import Step9SiteDetails from './Step9_SiteDetails.vue';
import { EditMode } from '@/bcrhp/pages/NewSite/constants.ts';

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
    props: ['items', 'displayFunction', 'displayKeys', 'label', 'emptyText'],
    emits: ['remove'],
    template: `<div class="chips-list" :data-label="label">
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
    Step9_SiteDetailsView: { template: '<div class="site-details-view" />' },
    TimesCircleIcon: { template: '<span />' },
    ToggleSwitch: ToggleSwitchStub,
};

// ---------------------------------------------------------------------------
// Test data helpers
// ---------------------------------------------------------------------------

function makeChronology(
    chronology = '',
    startYear = '',
    endYear = '',
    circa = false,
    notes = '',
) {
    return {
        aliased_data: {
            chronology: { display_value: chronology },
            start_year: { display_value: startYear },
            end_year: { display_value: endYear },
            dates_approximate: { node_value: circa },
            chronology_notes: { display_value: notes },
        },
    };
}

function makeConstructionActor(name = '', type = '', notes = '') {
    return {
        aliased_data: {
            construction_actor: { display_value: name },
            construction_actor_type: { display_value: type },
            construction_actor_notes: { display_value: notes },
        },
    };
}

function makeExternalUrl(urlType = '', displayValue = '') {
    return {
        aliased_data: {
            external_url_type: { display_value: urlType },
            external_url: { display_value: displayValue },
        },
    };
}

function makeHeritageSite(overrides: Record<string, any> = {}) {
    return ref({
        aliased_data: {
            chronology: [],
            construction_actors: [],
            external_url: [],
            ...overrides,
        },
    });
}

function mountComponent(
    editMode: EditMode,
    heritageSite?: ReturnType<typeof makeHeritageSite>,
) {
    return mount(Step9SiteDetails, {
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

describe('Step9_SiteDetails — Add mode', () => {
    it('mounts without error', () => {
        const wrapper = mountComponent(EditMode.Add);
        expect(wrapper.exists()).toBe(true);
    });

    it('shows forms immediately in Add mode', () => {
        const wrapper = mountComponent(EditMode.Add);
        expect(wrapper.find('form').exists()).toBe(true);
    });

    it('does not render the Edit mode checkbox in Add mode', () => {
        const wrapper = mountComponent(EditMode.Add);
        expect(wrapper.find('input[role="switch"]').exists()).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Edit mode — basic rendering and lifecycle
// ---------------------------------------------------------------------------

describe('Step9_SiteDetails — Edit mode', () => {
    it('mounts without error in Edit mode', () => {
        const wrapper = mountComponent(EditMode.Edit);
        expect(wrapper.exists()).toBe(true);
    });

    it('shows the Edit toggle and hides forms before editing starts', () => {
        const wrapper = mountComponent(EditMode.Edit);
        expect(wrapper.find('input[role="switch"]').exists()).toBe(true);
        expect(wrapper.find('form').exists()).toBe(false);
    });

    it('shows the view component when not editing in Edit mode', () => {
        const wrapper = mountComponent(EditMode.Edit);
        expect(wrapper.find('.site-details-view').exists()).toBe(true);
    });

    it('shows forms after Edit toggle is switched on', async () => {
        const wrapper = mountComponent(EditMode.Edit);
        await wrapper.find('input[role="switch"]').setValue(true);
        await nextTick();
        expect(wrapper.find('form').exists()).toBe(true);
    });

    it('hides forms again when editing is cancelled', async () => {
        const wrapper = mountComponent(EditMode.Edit);
        await wrapper.find('input[role="switch"]').setValue(true);
        await nextTick();
        expect(wrapper.find('form').exists()).toBe(true);

        await wrapper.find('input[role="switch"]').setValue(false);
        await nextTick();
        expect(wrapper.find('form').exists()).toBe(false);
    });

    it('restores chronology from snapshot when editing is cancelled', async () => {
        const hs = makeHeritageSite({
            chronology: [
                {
                    aliased_data: {
                        chronology: { display_value: 'Construction' },
                        start_year: {
                            display_value: '1920',
                            node_value: '1920',
                        },
                        end_year: { display_value: '', node_value: null },
                    },
                },
            ],
        });
        const wrapper = mountComponent(EditMode.Edit, hs);

        await wrapper.find('input[role="switch"]').setValue(true);
        await nextTick();

        // Mutate while editing
        hs.value.aliased_data.chronology.push({
            aliased_data: {
                chronology: { display_value: 'Renovation' },
                start_year: { display_value: '1950', node_value: '1950' },
                end_year: { display_value: '', node_value: null },
            },
        } as any);
        expect(hs.value.aliased_data.chronology).toHaveLength(2);

        // Cancel — snapshot should restore
        await wrapper.find('input[role="switch"]').setValue(false);
        await nextTick();

        expect(hs.value.aliased_data.chronology).toHaveLength(1);
    });

    it('restores construction_actors from snapshot when editing is cancelled', async () => {
        const hs = makeHeritageSite({
            construction_actors: [
                {
                    aliased_data: {
                        construction_actor: {
                            display_value: 'Smith & Sons',
                            node_value: {
                                en: { value: 'Smith & Sons', direction: 'ltr' },
                            },
                        },
                        construction_actor_type: { display_value: 'Builder' },
                        construction_actor_notes: { display_value: '' },
                    },
                },
            ],
        });
        const wrapper = mountComponent(EditMode.Edit, hs);

        await wrapper.find('input[role="switch"]').setValue(true);
        await nextTick();

        hs.value.aliased_data.construction_actors.push({
            aliased_data: {
                construction_actor: {
                    display_value: 'Jones Architects',
                    node_value: {
                        en: { value: 'Jones Architects', direction: 'ltr' },
                    },
                },
                construction_actor_type: { display_value: 'Architect' },
            },
        } as any);
        expect(hs.value.aliased_data.construction_actors).toHaveLength(2);

        await wrapper.find('input[role="switch"]').setValue(false);
        await nextTick();

        expect(hs.value.aliased_data.construction_actors).toHaveLength(1);
    });

    it('restores external_url from snapshot when editing is cancelled', async () => {
        const hs = makeHeritageSite({
            external_url: [
                {
                    aliased_data: {
                        external_url_type: { display_value: 'Website' },
                        external_url: {
                            display_value: 'Example Site',
                            node_value: {
                                url: 'https://example.com',
                                url_label: 'Example Site',
                            },
                        },
                    },
                },
            ],
        });
        const wrapper = mountComponent(EditMode.Edit, hs);

        await wrapper.find('input[role="switch"]').setValue(true);
        await nextTick();

        hs.value.aliased_data.external_url.push({
            aliased_data: {
                external_url_type: { display_value: 'Reference' },
                external_url: {
                    node_value: {
                        url: 'https://other.com',
                        url_label: 'Other',
                    },
                },
            },
        } as any);
        expect(hs.value.aliased_data.external_url).toHaveLength(2);

        await wrapper.find('input[role="switch"]').setValue(false);
        await nextTick();

        expect(hs.value.aliased_data.external_url).toHaveLength(1);
    });
});

// ---------------------------------------------------------------------------
// isValid — always returns true
// ---------------------------------------------------------------------------

describe('Step9_SiteDetails — isValid', () => {
    it('returns true in Add mode', () => {
        const wrapper = mountComponent(EditMode.Add);
        expect(wrapper.vm.isValid()).toBe(true);
    });

    it('returns true in Edit mode when not editing', () => {
        const wrapper = mountComponent(EditMode.Edit);
        expect(wrapper.vm.isValid()).toBe(true);
    });

    it('returns true in Edit mode when editing', async () => {
        const wrapper = mountComponent(EditMode.Edit);
        await wrapper.find('input[role="switch"]').setValue(true);
        await nextTick();
        expect(wrapper.vm.isValid()).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// ChipsList removal — chronology
// ---------------------------------------------------------------------------

describe('Step9_SiteDetails — chronology ChipsList removal', () => {
    it('removes the correct chronology entry when ChipsList emits remove', async () => {
        const hs = makeHeritageSite({
            chronology: [
                {
                    aliased_data: {
                        chronology: { display_value: 'Construction' },
                        start_year: {
                            display_value: '1900',
                            node_value: '1900',
                        },
                    },
                },
                {
                    aliased_data: {
                        chronology: { display_value: 'Renovation' },
                        start_year: {
                            display_value: '1950',
                            node_value: '1950',
                        },
                    },
                },
            ],
        });
        const wrapper = mountComponent(EditMode.Add, hs);

        // Find the Chronologies ChipsList by its data-label attribute
        const chronologyChipsList = wrapper
            .findAll('.chips-list')
            .find((el) => el.attributes('data-label') === 'Chronologies');
        expect(chronologyChipsList).toBeDefined();

        const chipButtons = chronologyChipsList!.findAll('.chip-remove');
        expect(chipButtons).toHaveLength(2);

        await chipButtons[0].trigger('click');
        await nextTick();

        expect(hs.value.aliased_data.chronology).toHaveLength(1);
        expect(
            (hs.value.aliased_data.chronology[0] as any).aliased_data.chronology
                .display_value,
        ).toBe('Renovation');
    });
});

// ---------------------------------------------------------------------------
// ChipsList removal — construction_actors
// ---------------------------------------------------------------------------

describe('Step9_SiteDetails — construction_actors ChipsList removal', () => {
    it('removes the correct actor when ChipsList emits remove', async () => {
        const hs = makeHeritageSite({
            construction_actors: [
                {
                    aliased_data: {
                        construction_actor: {
                            display_value: 'First Builder',
                            node_value: {
                                en: {
                                    value: 'First Builder',
                                    direction: 'ltr',
                                },
                            },
                        },
                        construction_actor_type: { display_value: 'Builder' },
                        construction_actor_notes: { display_value: '' },
                    },
                },
                {
                    aliased_data: {
                        construction_actor: {
                            display_value: 'Second Builder',
                            node_value: {
                                en: {
                                    value: 'Second Builder',
                                    direction: 'ltr',
                                },
                            },
                        },
                        construction_actor_type: { display_value: 'Builder' },
                        construction_actor_notes: { display_value: '' },
                    },
                },
            ],
        });
        const wrapper = mountComponent(EditMode.Add, hs);

        const actorChipsList = wrapper
            .findAll('.chips-list')
            .find(
                (el) => el.attributes('data-label') === 'Architects / Builders',
            );
        expect(actorChipsList).toBeDefined();

        const chipButtons = actorChipsList!.findAll('.chip-remove');
        expect(chipButtons).toHaveLength(2);

        await chipButtons[0].trigger('click');
        await nextTick();

        expect(hs.value.aliased_data.construction_actors).toHaveLength(1);
        expect(
            (hs.value.aliased_data.construction_actors[0] as any).aliased_data
                .construction_actor.display_value,
        ).toBe('Second Builder');
    });
});

// ---------------------------------------------------------------------------
// ChipsList removal — external_url
// ---------------------------------------------------------------------------

describe('Step9_SiteDetails — external_url ChipsList removal', () => {
    it('removes the correct URL entry when ChipsList emits remove', async () => {
        const hs = makeHeritageSite({
            external_url: [
                {
                    aliased_data: {
                        external_url_type: { display_value: 'Website' },
                        external_url: {
                            node_value: {
                                url: 'https://first.com',
                                url_label: 'First',
                            },
                        },
                    },
                },
                {
                    aliased_data: {
                        external_url_type: { display_value: 'Reference' },
                        external_url: {
                            node_value: {
                                url: 'https://second.com',
                                url_label: 'Second',
                            },
                        },
                    },
                },
            ],
        });
        const wrapper = mountComponent(EditMode.Add, hs);

        const urlChipsList = wrapper
            .findAll('.chips-list')
            .find((el) => el.attributes('data-label') === 'Related URLs');
        expect(urlChipsList).toBeDefined();

        const chipButtons = urlChipsList!.findAll('.chip-remove');
        expect(chipButtons).toHaveLength(2);

        await chipButtons[0].trigger('click');
        await nextTick();

        expect(hs.value.aliased_data.external_url).toHaveLength(1);
        expect(
            (hs.value.aliased_data.external_url[0] as any).aliased_data
                .external_url_type.display_value,
        ).toBe('Reference');
    });
});

// ---------------------------------------------------------------------------
// Interactive stubs — Form with states, GenericWidget that emits, ChipsList
// that calls displayFunction to reach getText and display function branches.
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
    Step9_SiteDetailsView: { template: '<div class="site-details-view" />' },
    TimesCircleIcon: { template: '<span />' },
    ToggleSwitch: ToggleSwitchStub,
};

function mountInteractive(
    editMode: EditMode = EditMode.Add,
    heritageSite?: ReturnType<typeof makeHeritageSite>,
) {
    return mount(Step9SiteDetails, {
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
// Computed fallbacks — non-array data
// ---------------------------------------------------------------------------

describe('Step9_SiteDetails — computed fallbacks', () => {
    it('chronologies falls back to [] when chronology is not an array', () => {
        const hs = ref({
            aliased_data: {
                chronology: null,
                construction_actors: [],
                external_url: [],
            },
        });
        const wrapper = mount(Step9SiteDetails, {
            global: {
                stubs,
                provide: { heritageSite: hs as any, editMode: EditMode.Add },
            },
        });
        expect(wrapper.exists()).toBe(true);
    });

    it('constructionActors falls back to [] when construction_actors is not an array', () => {
        const hs = ref({
            aliased_data: {
                chronology: [],
                construction_actors: null,
                external_url: [],
            },
        });
        const wrapper = mount(Step9SiteDetails, {
            global: {
                stubs,
                provide: { heritageSite: hs as any, editMode: EditMode.Add },
            },
        });
        expect(wrapper.exists()).toBe(true);
    });

    it('externalUrls falls back to [] when external_url is not an array', () => {
        const hs = ref({
            aliased_data: {
                chronology: [],
                construction_actors: [],
                external_url: null,
            },
        });
        const wrapper = mount(Step9SiteDetails, {
            global: {
                stubs,
                provide: { heritageSite: hs as any, editMode: EditMode.Add },
            },
        });
        expect(wrapper.exists()).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// saveChronology — button enabled immediately (only isValidChronology needed)
// ---------------------------------------------------------------------------

describe('Step9_SiteDetails — saveChronology', () => {
    it('Add Chronology button is enabled when form is valid', async () => {
        // With FormStubWithState, isValidChronology (computed) returns true.
        // However, isValidChronology depends on the chronologyForm template ref
        // which is set during mount but triggers a DOM re-render asynchronously.
        // A nextTick is required for the button's disabled state to update.
        const wrapper = mountInteractive();
        await nextTick();
        const saveButton = wrapper.find('#saveChronology');
        expect(saveButton.attributes('disabled')).toBeUndefined();
    });

    it('pushes a new entry to chronology when save button is clicked', async () => {
        const hs = makeHeritageSite();
        const wrapper = mountInteractive(EditMode.Add, hs);
        await nextTick(); // Let the isValidChronology computed re-render the button

        await wrapper.find('#saveChronology').trigger('click');
        await flushPromises();

        expect(hs.value.aliased_data.chronology).toHaveLength(1);
    });
});

// ---------------------------------------------------------------------------
// chronologyDisplayFunction and getText
// ---------------------------------------------------------------------------

describe('Step9_SiteDetails — chronologyDisplayFunction', () => {
    it('formats chronology type and year range', () => {
        const hs = makeHeritageSite({
            chronology: [makeChronology('Construction', '1920', '1925')],
        });
        const wrapper = mountInteractive(EditMode.Add, hs);
        const label = wrapper.find('.chip-label');
        expect(label.text()).toContain('Construction');
        expect(label.text()).toContain('1920');
        expect(label.text()).toContain('1925');
    });

    it('getText falls back to node_value string when display_value is empty', () => {
        const hs = makeHeritageSite({
            chronology: [
                {
                    aliased_data: {
                        chronology: {
                            display_value: '',
                            node_value: 'string-val',
                        },
                        start_year: {
                            display_value: '1900',
                            node_value: '1900',
                        },
                        end_year: { display_value: '', node_value: null },
                        dates_approximate: { node_value: false },
                        chronology_notes: { display_value: '' },
                    },
                },
            ],
        });
        const wrapper = mountInteractive(EditMode.Add, hs);
        expect(wrapper.find('.chip-label').text()).toContain('string-val');
    });

    it('getText falls back to node_value.en.value when display_value is empty', () => {
        const hs = makeHeritageSite({
            chronology: [
                {
                    aliased_data: {
                        chronology: {
                            display_value: '',
                            node_value: { en: { value: 'Via en value' } },
                        },
                        start_year: { display_value: '', node_value: null },
                        end_year: { display_value: '', node_value: null },
                        dates_approximate: { node_value: false },
                        chronology_notes: { display_value: '' },
                    },
                },
            ],
        });
        const wrapper = mountInteractive(EditMode.Add, hs);
        expect(wrapper.find('.chip-label').text()).toContain('Via en value');
    });
});

// ---------------------------------------------------------------------------
// updateChronologyModelValue
// ---------------------------------------------------------------------------

describe('Step9_SiteDetails — updateChronologyModelValue', () => {
    it('updates currentChronology data when GenericWidget emits update:value', async () => {
        const hs = makeHeritageSite();
        const wrapper = mountInteractive(EditMode.Add, hs);

        await emitWidgetValue(wrapper, 'chronology', {
            display_value: 'Renovation',
            node_value: 'uuid-chron',
            details: [],
        });

        // Save — the pushed entry should carry the updated chronology data
        await wrapper.find('#saveChronology').trigger('click');
        await flushPromises();

        expect(hs.value.aliased_data.chronology).toHaveLength(1);
    });
});

// ---------------------------------------------------------------------------
// saveArchitectOrBuilder
// ---------------------------------------------------------------------------

describe('Step9_SiteDetails — saveArchitectOrBuilder', () => {
    it('pushes a new entry to construction_actors when save button is clicked with valid data', async () => {
        const hs = makeHeritageSite();
        const wrapper = mountInteractive(EditMode.Add, hs);

        await emitWidgetValue(wrapper, 'construction_actor', {
            display_value: 'Smith & Sons',
            node_value: { en: { value: 'Smith & Sons', direction: 'ltr' } },
            details: [],
        });
        await emitWidgetValue(wrapper, 'construction_actor_type', {
            display_value: 'Builder',
            node_value: 'uuid-type',
            details: [],
        });

        const saveButton = wrapper.find('#addOtherName');
        expect(saveButton.attributes('disabled')).toBeUndefined();

        await saveButton.trigger('click');
        await flushPromises();

        expect(hs.value.aliased_data.construction_actors).toHaveLength(1);
    });
});

// ---------------------------------------------------------------------------
// actorDisplayFunction
// ---------------------------------------------------------------------------

describe('Step9_SiteDetails — actorDisplayFunction', () => {
    it('formats actor name and type', () => {
        const hs = makeHeritageSite({
            construction_actors: [
                makeConstructionActor(
                    'Jones Ltd',
                    'Architect',
                    'Lead designer',
                ),
            ],
        });
        const wrapper = mountInteractive(EditMode.Add, hs);
        const labels = wrapper.findAll('.chip-label');
        // chronology ChipsList is empty, actor ChipsList has one label
        const actorLabel = labels.find((l) => l.text().includes('Jones'));
        expect(actorLabel).toBeDefined();
        expect(actorLabel!.text()).toContain('Architect');
    });

    it('returns "Untitled Actor" when name and type are both empty', () => {
        const hs = makeHeritageSite({
            construction_actors: [makeConstructionActor('', '')],
        });
        const wrapper = mountInteractive(EditMode.Add, hs);
        const actorLabel = wrapper
            .findAll('.chip-label')
            .find((l) => l.text().includes('Untitled'));
        expect(actorLabel).toBeDefined();
    });
});

// ---------------------------------------------------------------------------
// updateConstructionActorValue
// ---------------------------------------------------------------------------

describe('Step9_SiteDetails — updateConstructionActorValue', () => {
    it('updates currentConstructionActor data when GenericWidget emits', async () => {
        const hs = makeHeritageSite();
        const wrapper = mountInteractive(EditMode.Add, hs);

        await emitWidgetValue(wrapper, 'construction_actor', {
            display_value: 'Jones Ltd',
            node_value: { en: { value: 'Jones Ltd', direction: 'ltr' } },
            details: [],
        });
        await emitWidgetValue(wrapper, 'construction_actor_type', {
            display_value: 'Architect',
            node_value: 'uuid-type',
            details: [],
        });

        expect(
            wrapper.find('#addOtherName').attributes('disabled'),
        ).toBeUndefined();
    });
});

// ---------------------------------------------------------------------------
// saveExternalUrl
// ---------------------------------------------------------------------------

describe('Step9_SiteDetails — saveExternalUrl', () => {
    it('pushes a new entry to external_url when save button is clicked with valid data', async () => {
        const hs = makeHeritageSite();
        const wrapper = mountInteractive(EditMode.Add, hs);

        await emitWidgetValue(wrapper, 'external_url_type', {
            display_value: 'Website',
            node_value: 'uuid-url-type',
            details: [],
        });
        await emitWidgetValue(wrapper, 'external_url', {
            display_value: 'Heritage BC',
            node_value: {
                url: 'https://example.com',
                url_label: 'Heritage BC',
            },
            details: [],
        });

        const saveButton = wrapper.find('#saveURL');
        expect(saveButton.attributes('disabled')).toBeUndefined();

        await saveButton.trigger('click');
        await flushPromises();

        expect(hs.value.aliased_data.external_url).toHaveLength(1);
    });
});

// ---------------------------------------------------------------------------
// externalUrlDisplayFunction
// ---------------------------------------------------------------------------

describe('Step9_SiteDetails — externalUrlDisplayFunction', () => {
    it('formats URL type and display value', () => {
        const hs = makeHeritageSite({
            external_url: [makeExternalUrl('Website', 'Heritage BC')],
        });
        const wrapper = mountInteractive(EditMode.Add, hs);
        const urlLabel = wrapper
            .findAll('.chip-label')
            .find((l) => l.text().includes('Website'));
        expect(urlLabel).toBeDefined();
        expect(urlLabel!.text()).toContain('Heritage BC');
    });
});

// ---------------------------------------------------------------------------
// updateExternalUrlModelValue
// ---------------------------------------------------------------------------

describe('Step9_SiteDetails — updateExternalUrlModelValue', () => {
    it('updates currentExternalUrl data when GenericWidget emits', async () => {
        const hs = makeHeritageSite();
        const wrapper = mountInteractive(EditMode.Add, hs);

        await emitWidgetValue(wrapper, 'external_url_type', {
            display_value: 'Reference',
            node_value: 'uuid-ref',
            details: [],
        });
        await emitWidgetValue(wrapper, 'external_url', {
            display_value: 'City Archives',
            node_value: {
                url: 'https://archives.example.com',
                url_label: 'City Archives',
            },
            details: [],
        });

        expect(wrapper.find('#saveURL').attributes('disabled')).toBeUndefined();
    });
});
