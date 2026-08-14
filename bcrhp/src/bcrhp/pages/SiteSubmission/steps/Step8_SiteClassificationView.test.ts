import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import Step8SiteClassificationView from './Step8_SiteClassificationView.vue';

// ---------------------------------------------------------------------------
// Test data helpers
// ---------------------------------------------------------------------------

function makeHeritageClass(
    category = '',
    ownership = '',
    contributingCount = '',
) {
    return {
        aliased_data: {
            heritage_category: { display_value: category },
            ownership: { display_value: ownership },
            contributing_resource_count: { display_value: contributingCount },
        },
    };
}

function makeHeritageFunction(category = '', state = '') {
    return {
        aliased_data: {
            functional_category: { display_value: category },
            functional_state: { display_value: state },
        },
    };
}

function makeHeritageSite(overrides: Record<string, any> = {}) {
    return ref({
        aliased_data: {
            heritage_class: [],
            heritage_function: [],
            heritage_theme: {
                aliased_data: {
                    heritage_theme: { display_value: '' },
                },
            },
            ...overrides,
        },
    });
}

function mountComponent(heritageSite?: ReturnType<typeof makeHeritageSite>) {
    return mount(Step8SiteClassificationView, {
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
// Step8_SiteClassificationView
// ---------------------------------------------------------------------------

describe('Step8_SiteClassificationView', () => {
    it('mounts without error', () => {
        expect(mountComponent().exists()).toBe(true);
    });

    it('renders the Heritage Class section label', () => {
        expect(mountComponent().text()).toContain('Heritage Class');
    });

    it('renders the Heritage Function section label', () => {
        expect(mountComponent().text()).toContain('Heritage Function');
    });

    it('renders the Heritage Theme section label', () => {
        expect(mountComponent().text()).toContain('Heritage Theme');
    });

    // -----------------------------------------------------------------------
    // Heritage Class
    // -----------------------------------------------------------------------

    it('renders heritage class category, ownership, and resource count', () => {
        const hs = makeHeritageSite({
            heritage_class: [makeHeritageClass('Commercial', 'Private', '3')],
        });
        const text = mountComponent(hs).text();
        expect(text).toContain('Commercial');
        expect(text).toContain('Private');
        expect(text).toContain('3');
    });

    it('renders multiple heritage classes', () => {
        const hs = makeHeritageSite({
            heritage_class: [
                makeHeritageClass('Commercial', 'Private', '3'),
                makeHeritageClass('Residential', 'Public', '10'),
            ],
        });
        const text = mountComponent(hs).text();
        expect(text).toContain('Commercial');
        expect(text).toContain('Residential');
        expect(text).toContain('Public');
    });

    it('renders no class list items when heritage_class is empty', () => {
        const hs = makeHeritageSite({ heritage_class: [] });
        const wrapper = mountComponent(hs);
        // The ordered list for classes should have no <li> elements
        const lists = wrapper.findAll('ol');
        expect(lists[0].findAll('li')).toHaveLength(0);
    });

    // -----------------------------------------------------------------------
    // Heritage Function
    // -----------------------------------------------------------------------

    it('renders heritage function category and state', () => {
        const hs = makeHeritageSite({
            heritage_function: [makeHeritageFunction('Residential', 'Current')],
        });
        const text = mountComponent(hs).text();
        expect(text).toContain('Residential');
        expect(text).toContain('Current');
    });

    it('renders multiple heritage functions', () => {
        const hs = makeHeritageSite({
            heritage_function: [
                makeHeritageFunction('Residential', 'Current'),
                makeHeritageFunction('Commercial', 'Historic'),
            ],
        });
        const text = mountComponent(hs).text();
        expect(text).toContain('Residential');
        expect(text).toContain('Commercial');
        expect(text).toContain('Historic');
    });

    it('renders no function list items when heritage_function is empty', () => {
        const hs = makeHeritageSite({ heritage_function: [] });
        const wrapper = mountComponent(hs);
        const lists = wrapper.findAll('ol');
        expect(lists[1].findAll('li')).toHaveLength(0);
    });

    // -----------------------------------------------------------------------
    // Heritage Theme
    // -----------------------------------------------------------------------

    it('renders heritage theme display value', () => {
        const hs = makeHeritageSite({
            heritage_theme: {
                aliased_data: {
                    heritage_theme: { display_value: 'Cultural Landscape' },
                },
            },
        });
        expect(mountComponent(hs).text()).toContain('Cultural Landscape');
    });

    it('renders nothing in theme section when display_value is empty', () => {
        const hs = makeHeritageSite({
            heritage_theme: {
                aliased_data: { heritage_theme: { display_value: '' } },
            },
        });
        const wrapper = mountComponent(hs);
        const dds = wrapper.findAll('dd');
        // Third dd is heritage theme — should be empty/blank
        expect(dds[2].text().trim()).toBe('');
    });
});
