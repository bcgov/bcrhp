import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';

vi.mock('uuid', () => ({
    generate: vi.fn(() => '00000000-0000-0000-0000-000000000000'),
    v4: vi.fn(() => '00000000-0000-0000-0000-000000000000'),
}));
import { ref, nextTick } from 'vue';
import Step7SiteImages from './Step7_SiteImages.vue';
import { EditMode } from '../constants.ts';

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
};

// v-tooltip is a PrimeVue directive; stub it so Vue doesn't warn about an
// unresolved directive in the test environment.
const directives = { tooltip: {} };

function makeHeritageSite(site_images: any[] = []) {
    return ref({
        aliased_data: {
            site_images,
        },
    });
}

function makeImage(index: number) {
    return {
        aliased_data: {
            site_images: {
                display_value: '',
                node_value: [{ name: `image${index}.jpg` }],
                details: [],
            },
            image_type: {
                display_value: 'Historical',
                node_value: null,
                details: [],
            },
            image_view: {
                display_value: 'Front',
                node_value: null,
                details: [],
            },
            image_description: {
                display_value: 'A description',
                node_value: null,
                details: [],
            },
            image_date: { display_value: '', node_value: null, details: [] },
            image_features: {
                display_value: '',
                node_value: null,
                details: [],
            },
            primary_image: {
                display_value: 'false',
                node_value: false,
                details: [],
            },
            photographer: { display_value: '', node_value: null, details: [] },
            submit_to_crhp: {
                display_value: '',
                node_value: null,
                details: [],
            },
            copyright: { display_value: '', node_value: null, details: [] },
        },
    };
}

describe('Step7_SiteImages', () => {
    it('mounts without error', () => {
        const wrapper = mount(Step7SiteImages, {
            global: {
                stubs,
                directives,
                provide: {
                    heritageSite: makeHeritageSite([]),
                    editMode: EditMode.Add,
                },
            },
        });
        expect(wrapper.exists()).toBe(true);
    });

    it('isValid returns true initially (addingNewImage=true, no pending file)', () => {
        const wrapper = mount(Step7SiteImages, {
            global: {
                stubs,
                directives,
                provide: {
                    heritageSite: makeHeritageSite([]),
                    editMode: EditMode.Add,
                },
            },
        });
        expect(wrapper.vm.isValid()).toBe(true);
    });

    it('isValid returns true even with images present', () => {
        const wrapper = mount(Step7SiteImages, {
            global: {
                stubs,
                directives,
                provide: {
                    heritageSite: makeHeritageSite([
                        makeImage(0),
                        makeImage(1),
                    ]),
                    editMode: EditMode.Add,
                },
            },
        });
        expect(wrapper.vm.isValid()).toBe(true);
    });

    it('shows max-limit message when 10 images are present', () => {
        const images = Array.from({ length: 10 }, (_, i) => makeImage(i));
        const wrapper = mount(Step7SiteImages, {
            global: {
                stubs,
                directives,
                // EditMode.Add is required so the Form renders. Without it the
                // v-if="isEditing || editMode === EditMode.Add" guard hides the
                // entire form and .max-limit-message is never in the DOM.
                provide: {
                    heritageSite: makeHeritageSite(images),
                    editMode: EditMode.Add,
                },
            },
        });
        expect(wrapper.find('.max-limit-message').exists()).toBe(true);
    });

    it('does not show max-limit message when fewer than 10 images are present', () => {
        const images = Array.from({ length: 9 }, (_, i) => makeImage(i));
        const wrapper = mount(Step7SiteImages, {
            global: {
                stubs,
                directives,
                provide: {
                    heritageSite: makeHeritageSite(images),
                    editMode: EditMode.Add,
                },
            },
        });
        expect(wrapper.find('.max-limit-message').exists()).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Interactive stubs — GenericWidget that emits, FormStubWithState with empty
// states so baseIsValid returns true vacuously.
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
    Step7_SiteImagesView: { template: '<div />' },
    ToggleSwitch: {
        props: { modelValue: { type: Boolean, default: false } },
        emits: ['update:modelValue'],
        template: `<input type="checkbox" role="switch" :checked="modelValue" @change="$emit('update:modelValue', $event.target.checked)" />`,
    },
};

function mountInteractive(site_images: any[] = []) {
    return mount(Step7SiteImages, {
        global: {
            stubs: stubsInteractive,
            directives,
            provide: {
                heritageSite: makeHeritageSite(site_images),
                editMode: EditMode.Add,
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
// isValid — addingNewImage / hasUnsavedImage logic
// ---------------------------------------------------------------------------

describe('Step7_SiteImages — isValid (pending image detection)', () => {
    it('returns false when site_images widget emits a non-empty node_value', async () => {
        const wrapper = mountInteractive();
        await emitWidgetValue(wrapper, 'site_images', {
            display_value: '',
            node_value: [{ name: 'photo.jpg' }],
            details: [],
        });
        expect(wrapper.vm.isValid()).toBe(false);
    });

    it('returns true after clearPendingImage resets the pending file', async () => {
        const wrapper = mountInteractive();
        await emitWidgetValue(wrapper, 'site_images', {
            display_value: '',
            node_value: [{ name: 'photo.jpg' }],
            details: [],
        });
        expect(wrapper.vm.isValid()).toBe(false);

        // "Remove / Change Image" button triggers clearPendingImage
        const clearButton = wrapper
            .findAll('button')
            .find((b) => b.text().includes('Remove'));
        expect(clearButton).toBeDefined();
        await clearButton!.trigger('click');

        expect(wrapper.vm.isValid()).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// deleteSiteImage — resets to add mode
// ---------------------------------------------------------------------------

describe('Step7_SiteImages — deleteSiteImage', () => {
    it('removes the image from site_images and emits update:stepIsValid', async () => {
        const hs = makeHeritageSite([makeImage(0), makeImage(1)]);
        const wrapper = mount(Step7SiteImages, {
            global: {
                stubs: stubsInteractive,
                directives,
                provide: { heritageSite: hs, editMode: EditMode.Add },
            },
        });

        const deleteIcons = wrapper.findAll('.image-delete-icon');
        expect(deleteIcons).toHaveLength(2);

        await deleteIcons[0].trigger('click');
        await nextTick();

        expect(hs.value.aliased_data.site_images).toHaveLength(1);
        expect(wrapper.emitted('update:stepIsValid')).toBeTruthy();
    });

    it('isValid returns true after deleting an image (resets to add mode)', async () => {
        const hs = makeHeritageSite([makeImage(0)]);
        const wrapper = mount(Step7SiteImages, {
            global: {
                stubs: stubsInteractive,
                directives,
                provide: { heritageSite: hs, editMode: EditMode.Add },
            },
        });

        await wrapper.find('.image-delete-icon').trigger('click');
        await nextTick();

        expect(wrapper.vm.isValid()).toBe(true);
    });
});
