import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import Step4SiteNamesView from './Step4_SiteNamesView.vue';

// ---------------------------------------------------------------------------
// Test data helpers
// ---------------------------------------------------------------------------

function makeName(nameType: 'Common' | 'Other', displayValue = '') {
    return {
        aliased_data: {
            name: {
                display_value: displayValue,
                node_value: null,
                details: [],
            },
            name_type: {
                display_value: nameType,
                node_value: null,
                details: [],
            },
        },
    };
}

function makeHeritageSite(site_names: any[] = []) {
    return ref({ aliased_data: { site_names } });
}

function mountComponent(heritageSite?: ReturnType<typeof makeHeritageSite>) {
    return mount(Step4SiteNamesView, {
        global: {
            stubs: {
                Fieldset: { template: '<fieldset><slot /></fieldset>' },
            },
            provide: {
                heritageSite: heritageSite ?? makeHeritageSite(),
            },
        },
    });
}

// ---------------------------------------------------------------------------
// Step4_SiteNamesView
// ---------------------------------------------------------------------------

describe('Step4_SiteNamesView', () => {
    it('mounts without error', () => {
        expect(mountComponent().exists()).toBe(true);
    });

    it('shows the common name when a Common name exists', () => {
        const hs = makeHeritageSite([makeName('Common', 'Emily Carr House')]);
        expect(mountComponent(hs).text()).toContain('Emily Carr House');
    });

    it('shows "None provided" when there is no Common name', () => {
        expect(mountComponent(makeHeritageSite([])).text()).toContain(
            'None provided',
        );
    });

    it('shows "None provided" when only Other names exist (no Common)', () => {
        const hs = makeHeritageSite([makeName('Other', 'Alternate Name')]);
        expect(mountComponent(hs).text()).toContain('None provided');
    });

    it('shows "-" in the Alternate section when there are no Other names', () => {
        const hs = makeHeritageSite([makeName('Common', 'Primary Name')]);
        expect(mountComponent(hs).text()).toContain('-');
    });

    it('lists all Other names in the Alternate section', () => {
        const hs = makeHeritageSite([
            makeName('Common', 'Primary Name'),
            makeName('Other', 'First Alt'),
            makeName('Other', 'Second Alt'),
        ]);
        const text = mountComponent(hs).text();
        expect(text).toContain('First Alt');
        expect(text).toContain('Second Alt');
    });

    it('does not show Other names in the Common row', () => {
        const hs = makeHeritageSite([
            makeName('Common', 'Primary Name'),
            makeName('Other', 'Should Not Be Common'),
        ]);
        // The dt for Common shows only the first Common name
        const wrapper = mountComponent(hs);
        const dds = wrapper.findAll('dd');
        // First dd is the Common row — should not contain the Other name
        expect(dds[0].text()).not.toContain('Should Not Be Common');
    });

    it('shows "-" when Other names array is empty and Common name exists', () => {
        const hs = makeHeritageSite([makeName('Common', 'Only Name')]);
        const wrapper = mountComponent(hs);
        // Second dd is the Alternate row
        const dds = wrapper.findAll('dd');
        expect(dds[1].text()).toContain('-');
    });
});
