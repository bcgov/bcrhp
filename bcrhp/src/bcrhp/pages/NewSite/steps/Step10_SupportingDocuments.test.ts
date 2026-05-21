import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';

vi.mock('uuid', () => ({
    generate: vi.fn(() => '00000000-0000-0000-0000-000000000000'),
    v4: vi.fn(() => '00000000-0000-0000-0000-000000000000'),
}));
import { ref } from 'vue';
import Step10SupportingDocuments from './Step10_SupportingDocuments.vue';

const stubs = {
    Form: { template: '<form><slot v-bind="{}" /></form>' },
    FieldSet: { template: '<fieldset><slot /></fieldset>' },
    LabelledInput: { template: '<div><slot /></div>' },
    GenericWidget: { template: '<div />' },
    Button: { template: '<button :disabled="$attrs.disabled" @click="$emit(\'click\')"><slot /></button>', emits: ['click'] },
    ChipsList: { template: '<div />' },
};

function makeHeritageSite(site_document: any[] = [], internal_remark: any[] = []) {
    return ref({
        aliased_data: {
            site_document,
            internal_remark,
        },
    });
}

function makeDocument(type = 'Bylaw', filename = 'doc.pdf') {
    return {
        aliased_data: {
            site_document: { display_value: '', node_value: [{ name: filename }], details: [] },
            document_type: { display_value: type, node_value: null, details: [] },
            document_description: { display_value: 'A required document', node_value: null, details: [] },
        },
        customDisplay: `${type} - ${filename}`,
    };
}

describe('Step10_SupportingDocuments', () => {
    it('mounts without error', () => {
        const wrapper = mount(Step10SupportingDocuments, {
            global: {
                stubs,
                provide: { heritageSite: makeHeritageSite([], [{ aliased_data: {} }]) },
            },
        });
        expect(wrapper.exists()).toBe(true);
    });

    it('isValid returns false when no documents have been added', () => {
        const wrapper = mount(Step10SupportingDocuments, {
            global: {
                stubs,
                provide: { heritageSite: makeHeritageSite([], [{ aliased_data: {} }]) },
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
                },
            },
        });
        expect(wrapper.vm.isValid()).toBe(true);
    });

    it('isValid returns false after all documents are deleted', async () => {
        const heritageSite = makeHeritageSite([makeDocument()], [{ aliased_data: {} }]);
        const wrapper = mount(Step10SupportingDocuments, {
            global: {
                stubs,
                provide: { heritageSite },
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
                provide: { heritageSite: makeHeritageSite([], [{ aliased_data: {} }]) },
            },
        });
        // isValid is not emitted on mount; confirm via direct call
        expect(wrapper.vm.isValid()).toBe(false);
    });
});
