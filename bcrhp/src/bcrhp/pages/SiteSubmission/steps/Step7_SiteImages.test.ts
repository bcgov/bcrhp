import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';

vi.mock('uuid', () => ({
    generate: vi.fn(() => '00000000-0000-0000-0000-000000000000'),
    v4: vi.fn(() => '00000000-0000-0000-0000-000000000000'),
}));
import { ref } from 'vue';
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

    it('isValid always returns true', () => {
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
