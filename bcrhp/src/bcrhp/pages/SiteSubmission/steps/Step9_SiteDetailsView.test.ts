import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import Step9SiteDetailsView from './Step9_SiteDetailsView.vue';

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

function mountComponent(heritageSite?: ReturnType<typeof makeHeritageSite>) {
    return mount(Step9SiteDetailsView, {
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
// Step9_SiteDetailsView
// ---------------------------------------------------------------------------

describe('Step9_SiteDetailsView', () => {
    it('mounts without error', () => {
        expect(mountComponent().exists()).toBe(true);
    });

    it('renders the Chronology section label', () => {
        expect(mountComponent().text()).toContain('Chronology');
    });

    it('renders the Architects / Builders section label', () => {
        expect(mountComponent().text()).toContain('Architects / Builders');
    });

    it('renders the URLs section label', () => {
        expect(mountComponent().text()).toContain('URLs');
    });

    // -----------------------------------------------------------------------
    // Chronology
    // -----------------------------------------------------------------------

    it('renders chronology type and year range', () => {
        const hs = makeHeritageSite({
            chronology: [makeChronology('Construction', '1920', '1925')],
        });
        const text = mountComponent(hs).text();
        expect(text).toContain('Construction');
        expect(text).toContain('1920');
        expect(text).toContain('1925');
    });

    it('renders "Circa" when dates_approximate is true', () => {
        const hs = makeHeritageSite({
            chronology: [makeChronology('Construction', '1920', '', true)],
        });
        expect(mountComponent(hs).text()).toContain('Circa');
    });

    it('does not render "Circa" when dates_approximate is false', () => {
        const hs = makeHeritageSite({
            chronology: [makeChronology('Construction', '1920', '', false)],
        });
        expect(mountComponent(hs).text()).not.toContain('Circa');
    });

    it('renders chronology notes', () => {
        const hs = makeHeritageSite({
            chronology: [
                makeChronology(
                    'Construction',
                    '1920',
                    '',
                    false,
                    'Original structure built',
                ),
            ],
        });
        expect(mountComponent(hs).text()).toContain('Original structure built');
    });

    it('renders multiple chronology entries', () => {
        const hs = makeHeritageSite({
            chronology: [
                makeChronology('Construction', '1920', '1922'),
                makeChronology('Renovation', '1985', '1987'),
            ],
        });
        const text = mountComponent(hs).text();
        expect(text).toContain('Construction');
        expect(text).toContain('Renovation');
        expect(text).toContain('1985');
    });

    it('renders no chronology list items when chronology is empty', () => {
        const wrapper = mountComponent(makeHeritageSite({ chronology: [] }));
        const lists = wrapper.findAll('ol');
        expect(lists[0].findAll('li')).toHaveLength(0);
    });

    // -----------------------------------------------------------------------
    // Construction Actors
    // -----------------------------------------------------------------------

    it('renders construction actor name and type', () => {
        const hs = makeHeritageSite({
            construction_actors: [
                makeConstructionActor('Smith & Sons', 'Builder'),
            ],
        });
        const text = mountComponent(hs).text();
        expect(text).toContain('Smith & Sons');
        expect(text).toContain('Builder');
    });

    it('renders construction actor notes', () => {
        const hs = makeHeritageSite({
            construction_actors: [
                makeConstructionActor(
                    'Jones Ltd',
                    'Architect',
                    'Lead designer',
                ),
            ],
        });
        expect(mountComponent(hs).text()).toContain('Lead designer');
    });

    it('renders multiple construction actors', () => {
        const hs = makeHeritageSite({
            construction_actors: [
                makeConstructionActor('Smith & Sons', 'Builder'),
                makeConstructionActor('Jones Ltd', 'Architect'),
            ],
        });
        const text = mountComponent(hs).text();
        expect(text).toContain('Smith & Sons');
        expect(text).toContain('Jones Ltd');
    });

    it('renders no actor list items when construction_actors is empty', () => {
        const wrapper = mountComponent(
            makeHeritageSite({ construction_actors: [] }),
        );
        const lists = wrapper.findAll('ol');
        expect(lists[1].findAll('li')).toHaveLength(0);
    });

    // -----------------------------------------------------------------------
    // External URLs
    // -----------------------------------------------------------------------

    it('renders URL type and display value', () => {
        const hs = makeHeritageSite({
            external_url: [makeExternalUrl('Website', 'BC Heritage Register')],
        });
        const text = mountComponent(hs).text();
        expect(text).toContain('Website');
        expect(text).toContain('BC Heritage Register');
    });

    it('renders multiple external URLs', () => {
        const hs = makeHeritageSite({
            external_url: [
                makeExternalUrl('Website', 'Heritage BC'),
                makeExternalUrl('Reference', 'City Archives'),
            ],
        });
        const text = mountComponent(hs).text();
        expect(text).toContain('Heritage BC');
        expect(text).toContain('City Archives');
    });

    it('renders no URL list items when external_url is empty', () => {
        const wrapper = mountComponent(makeHeritageSite({ external_url: [] }));
        const lists = wrapper.findAll('ol');
        expect(lists[2].findAll('li')).toHaveLength(0);
    });
});
