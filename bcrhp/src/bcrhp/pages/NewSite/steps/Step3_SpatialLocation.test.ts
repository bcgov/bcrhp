// Module-level side-effect mocks must be hoisted before any imports.
vi.mock('maplibre-gl', () => ({ default: {} }));
vi.mock('@/bcgov_arches_common/widgets/SimpleMap/api.ts', () => ({
    fetchSystemMapData: vi.fn(),
}));
vi.mock('@/bcrhp/api.ts', () => ({
    getPidData: vi.fn().mockResolvedValue({ boundary: null }),
}));

import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref, nextTick } from 'vue';
import Step3SpatialLocation from './Step3_SpatialLocation.vue';
import { EditMode } from '@/bcrhp/pages/NewSite/constants.ts';
import { getPidData } from '@/bcrhp/api.ts';

afterEach(() => {
    vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Test data helpers
// ---------------------------------------------------------------------------

const POLYGON_FEATURE = {
    type: 'Feature',
    id: 'test-feature-1',
    geometry: {
        type: 'Polygon',
        coordinates: [
            [
                [-123.36, 48.42],
                [-123.35, 48.42],
                [-123.35, 48.43],
                [-123.36, 48.43],
                [-123.36, 48.42],
            ],
        ],
    },
    properties: {},
};

function makeSiteBoundaryTile(features: any[] = []) {
    return {
        aliased_data: {
            site_boundary: {
                node_value: { type: 'FeatureCollection', features },
                display_value: '',
                details: [],
            },
            mapped_area: { node_value: null, display_value: '', details: [] },
        },
    };
}

function makeLegalDescription(pid: number | null) {
    return {
        aliased_data: {
            pid: { node_value: pid, display_value: '', details: [] },
        },
    };
}

function makeAddress(legalDescs: any[] = []) {
    return {
        aliased_data: {
            bc_property_legal_description: legalDescs,
        },
    };
}

function makeLocation({
    boundaryFeatures = [],
    addresses = [],
}: {
    boundaryFeatures?: any[];
    addresses?: any[];
} = {}) {
    return {
        aliased_data: {
            site_boundary: [makeSiteBoundaryTile(boundaryFeatures)],
            bc_property_address: addresses,
        },
    };
}

function makeHeritageSite(locations?: any[]) {
    return ref({
        aliased_data: {
            heritage_site_location: locations ?? [makeLocation()],
        },
    });
}

// ---------------------------------------------------------------------------
// ToggleSwitch stub — used for the edit-mode toggle.
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

// ---------------------------------------------------------------------------
// Checkbox stub — supports binary v-model (boolean) and array v-model (PIDs).
// Uses inheritAttrs: false + v-bind="$attrs" so that id and other attributes
// are forwarded to the rendered <input>.
// ---------------------------------------------------------------------------

const CheckboxStub = {
    inheritAttrs: false,
    props: {
        modelValue: { default: undefined },
        binary: { type: Boolean, default: false },
        value: { default: undefined },
        small: { type: Boolean, default: false },
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

const stubs = {
    Form: { template: '<form><slot v-bind="{}" /></form>' },
    FieldSet: { template: '<fieldset><slot /></fieldset>' },
    LabelledInput: { template: '<div><slot /></div>' },
    LabelledCheckboxInput: { template: '<label><slot /></label>' },
    GenericWidget: { template: '<div class="generic-widget" />' },
    Step3_SpatialLocationView: {
        template: '<div class="spatial-location-view" />',
    },
    ToggleSwitch: ToggleSwitchStub,
    Checkbox: CheckboxStub,
};

function mountComponent(
    editMode: EditMode,
    heritageSite?: ReturnType<typeof makeHeritageSite>,
) {
    return mount(Step3SpatialLocation, {
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
// Add mode — basic validity
// ---------------------------------------------------------------------------

describe('Step3_SpatialLocation — Add mode', () => {
    it('mounts without error', () => {
        expect(mountComponent(EditMode.Add).exists()).toBe(true);
    });

    it('isValid returns false when there are no boundary features', () => {
        expect(mountComponent(EditMode.Add).vm.isValid()).toBe(false);
    });

    it('isValid returns true when boundary features exist in heritageSite', () => {
        const hs = makeHeritageSite([
            makeLocation({ boundaryFeatures: [POLYGON_FEATURE] }),
        ]);
        expect(mountComponent(EditMode.Add, hs).vm.isValid()).toBe(true);
    });

    it('isValid returns true when bypass is checked regardless of boundary data', async () => {
        const wrapper = mountComponent(EditMode.Add);
        expect(wrapper.vm.isValid()).toBe(false);

        await wrapper.find('#boundaryIncorrect').setValue(true);
        await nextTick();

        expect(wrapper.vm.isValid()).toBe(true);
    });

    it('does not render the "Existing geometry" checkbox in Add mode', async () => {
        const hs = makeHeritageSite([
            makeLocation({ boundaryFeatures: [POLYGON_FEATURE] }),
        ]);
        const wrapper = mountComponent(EditMode.Add, hs);
        await nextTick();
        expect(wrapper.find('#existingGeometry').exists()).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// allPids — PID extraction and deduplication
// ---------------------------------------------------------------------------

describe('Step3_SpatialLocation — allPids', () => {
    it('renders no PID items when there are no addresses', async () => {
        const wrapper = mountComponent(EditMode.Add);
        await nextTick();
        expect(wrapper.findAll('.pid-geometries')).toHaveLength(0);
    });

    it('renders one item per unique PID', async () => {
        const hs = makeHeritageSite([
            makeLocation({
                addresses: [
                    makeAddress([makeLegalDescription(3456789)]),
                    makeAddress([makeLegalDescription(12345678)]),
                ],
            }),
        ]);
        const wrapper = mountComponent(EditMode.Add, hs);
        await nextTick();
        expect(wrapper.findAll('.pid-geometries')).toHaveLength(2);
    });

    it('deduplicates PIDs that appear in multiple legal descriptions', async () => {
        const hs = makeHeritageSite([
            makeLocation({
                addresses: [
                    makeAddress([makeLegalDescription(3456789)]),
                    makeAddress([makeLegalDescription(3456789)]),
                ],
            }),
        ]);
        const wrapper = mountComponent(EditMode.Add, hs);
        await nextTick();
        expect(wrapper.findAll('.pid-geometries')).toHaveLength(1);
    });

    it('renders PID items in ascending numeric order', async () => {
        const hs = makeHeritageSite([
            makeLocation({
                addresses: [
                    makeAddress([makeLegalDescription(12345678)]),
                    makeAddress([makeLegalDescription(1234567)]),
                ],
            }),
        ]);
        const wrapper = mountComponent(EditMode.Add, hs);
        await nextTick();
        const spans = wrapper.findAll('.pid-geometries span');
        // formatPid: 1234567 → '001-234-567', 12345678 → '012-345-678'
        // ascending sort: 1234567 < 12345678 → 001-234-567 appears first
        expect(spans[0].text()).toContain('001-234-567');
        expect(spans[1].text()).toContain('012-345-678');
    });
});

// ---------------------------------------------------------------------------
// PID grid visibility
// ---------------------------------------------------------------------------

describe('Step3_SpatialLocation — PID grid visibility', () => {
    it('shows the PID grid by default', async () => {
        const hs = makeHeritageSite([
            makeLocation({
                addresses: [makeAddress([makeLegalDescription(3456789)])],
            }),
        ]);
        const wrapper = mountComponent(EditMode.Add, hs);
        await nextTick();
        expect(wrapper.find('.pid-geometries-grid').exists()).toBe(true);
    });

    it('hides the PID grid when bypass is active', async () => {
        const hs = makeHeritageSite([
            makeLocation({
                addresses: [makeAddress([makeLegalDescription(3456789)])],
            }),
        ]);
        const wrapper = mountComponent(EditMode.Add, hs);
        await wrapper.find('#boundaryIncorrect').setValue(true);
        await nextTick();
        expect(wrapper.find('.pid-geometries-grid').exists()).toBe(false);
    });

    it('restores the PID grid when bypass is unchecked', async () => {
        const hs = makeHeritageSite([
            makeLocation({
                addresses: [makeAddress([makeLegalDescription(3456789)])],
            }),
        ]);
        const wrapper = mountComponent(EditMode.Add, hs);
        await wrapper.find('#boundaryIncorrect').setValue(true);
        await nextTick();
        expect(wrapper.find('.pid-geometries-grid').exists()).toBe(false);

        await wrapper.find('#boundaryIncorrect').setValue(false);
        await nextTick();
        expect(wrapper.find('.pid-geometries-grid').exists()).toBe(true);
    });

    it('hides the PID grid when override is active', async () => {
        const hs = makeHeritageSite([
            makeLocation({
                addresses: [makeAddress([makeLegalDescription(3456789)])],
            }),
        ]);
        const wrapper = mountComponent(EditMode.Add, hs);
        await nextTick();
        expect(wrapper.find('.pid-geometries-grid').exists()).toBe(true);

        await wrapper.find('#overrideBoundary').setValue(true);
        await nextTick();
        expect(wrapper.find('.pid-geometries-grid').exists()).toBe(false);
    });

    it('restores the PID grid when override is unchecked', async () => {
        const hs = makeHeritageSite([
            makeLocation({
                addresses: [makeAddress([makeLegalDescription(3456789)])],
            }),
        ]);
        const wrapper = mountComponent(EditMode.Add, hs);
        await wrapper.find('#overrideBoundary').setValue(true);
        await nextTick();
        expect(wrapper.find('.pid-geometries-grid').exists()).toBe(false);

        await wrapper.find('#overrideBoundary').setValue(false);
        await nextTick();
        expect(wrapper.find('.pid-geometries-grid').exists()).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// overrideBoundary checkbox is always visible; upload instructions follow it
// ---------------------------------------------------------------------------

describe('Step3_SpatialLocation — overrideBoundary checkbox visibility', () => {
    it('is visible even when there are no boundary features', async () => {
        // Controls container is unconditional — no geometry needed to reveal it.
        const wrapper = mountComponent(EditMode.Add);
        await nextTick();
        expect(wrapper.find('#overrideBoundary').exists()).toBe(true);
    });

    it('remains visible after override is checked', async () => {
        const wrapper = mountComponent(EditMode.Add);
        await nextTick();
        await wrapper.find('#overrideBoundary').setValue(true);
        await nextTick();
        expect(wrapper.find('#overrideBoundary').exists()).toBe(true);
    });

    it('does not show upload instructions when there is no geometry and override is off', async () => {
        // widgetMode stays VIEW when override is unchecked; instructions are gated on EDIT mode.
        const wrapper = mountComponent(EditMode.Add);
        await nextTick();
        expect(wrapper.find('.instructions').exists()).toBe(false);
    });

    it('shows upload instructions only when override is active', async () => {
        const wrapper = mountComponent(EditMode.Add);
        await wrapper.find('#overrideBoundary').setValue(true);
        await nextTick();
        expect(wrapper.find('.instructions').exists()).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// Edit mode — form visibility and editing lifecycle
// ---------------------------------------------------------------------------

describe('Step3_SpatialLocation — Edit mode', () => {
    it('mounts without error in Edit mode', () => {
        expect(mountComponent(EditMode.Edit).exists()).toBe(true);
    });

    it('does not show the form before editing starts', () => {
        const wrapper = mountComponent(EditMode.Edit);
        expect(wrapper.find('form').exists()).toBe(false);
    });

    it('shows the form after "Edit Spatial Location" is checked', async () => {
        const wrapper = mountComponent(EditMode.Edit);
        await wrapper.find('input[role="switch"]').setValue(true);
        await nextTick();
        expect(wrapper.find('form').exists()).toBe(true);
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

    it('shows "Existing geometry" checkbox when editing starts and snapshot has geometry', async () => {
        const hs = makeHeritageSite([
            makeLocation({ boundaryFeatures: [POLYGON_FEATURE] }),
        ]);
        const wrapper = mountComponent(EditMode.Edit, hs);
        await wrapper.find('input[role="switch"]').setValue(true);
        await nextTick();
        expect(wrapper.find('#existingGeometry').exists()).toBe(true);
    });

    it('does not show "Existing geometry" checkbox when snapshot has no boundary features', async () => {
        const hs = makeHeritageSite([makeLocation({ boundaryFeatures: [] })]);
        const wrapper = mountComponent(EditMode.Edit, hs);
        await wrapper.find('input[role="switch"]').setValue(true);
        await nextTick();
        expect(wrapper.find('#existingGeometry').exists()).toBe(false);
    });

    it('restores heritageSite.site_boundary from snapshot when editing is cancelled', async () => {
        const hs = makeHeritageSite([
            makeLocation({ boundaryFeatures: [POLYGON_FEATURE] }),
        ]);
        const wrapper = mountComponent(EditMode.Edit, hs);

        await wrapper.find('input[role="switch"]').setValue(true);
        await nextTick();

        await wrapper.find('input[role="switch"]').setValue(false);
        await nextTick();

        const features =
            hs.value.aliased_data.heritage_site_location[0].aliased_data
                .site_boundary[0].aliased_data.site_boundary.node_value
                .features;
        expect(features).toHaveLength(1);
        expect(features[0].id).toBe('test-feature-1');
    });
});

// ---------------------------------------------------------------------------
// matchingExistingPid — geometry comparison against PID boundaries
// ---------------------------------------------------------------------------

describe('Step3_SpatialLocation — matchingExistingPid', () => {
    it('does not suffix any PID label with "(Existing)" when getPidData returns no boundary', async () => {
        vi.mocked(getPidData).mockResolvedValue({ boundary: null });
        const hs = makeHeritageSite([
            makeLocation({
                boundaryFeatures: [POLYGON_FEATURE],
                addresses: [makeAddress([makeLegalDescription(3456789)])],
            }),
        ]);
        const wrapper = mountComponent(EditMode.Edit, hs);
        await flushPromises();

        await wrapper.find('input[role="switch"]').setValue(true);
        await nextTick();

        const spans = wrapper.findAll('.pid-geometries span');
        expect(spans.some((s) => s.text().includes('(Existing)'))).toBe(false);
    });

    it('suffixes the matching PID label with "(Existing)" when the PID geometry matches', async () => {
        vi.mocked(getPidData).mockResolvedValue({ boundary: POLYGON_FEATURE });
        const hs = makeHeritageSite([
            makeLocation({
                boundaryFeatures: [POLYGON_FEATURE],
                addresses: [makeAddress([makeLegalDescription(3456789)])],
            }),
        ]);
        const wrapper = mountComponent(EditMode.Edit, hs);
        await flushPromises();

        await wrapper.find('input[role="switch"]').setValue(true);
        await nextTick();

        const spans = wrapper.findAll('.pid-geometries span');
        expect(spans.some((s) => s.text().includes('(Existing)'))).toBe(true);
    });

    it('hides "Existing geometry" checkbox when a PID matches the existing boundary', async () => {
        vi.mocked(getPidData).mockResolvedValue({ boundary: POLYGON_FEATURE });
        const hs = makeHeritageSite([
            makeLocation({
                boundaryFeatures: [POLYGON_FEATURE],
                addresses: [makeAddress([makeLegalDescription(3456789)])],
            }),
        ]);
        const wrapper = mountComponent(EditMode.Edit, hs);
        await flushPromises();

        await wrapper.find('input[role="switch"]').setValue(true);
        await nextTick();

        expect(wrapper.find('#existingGeometry').exists()).toBe(false);
    });

    it('does not call getPidData in Add mode', async () => {
        const hs = makeHeritageSite([
            makeLocation({
                addresses: [makeAddress([makeLegalDescription(3456789)])],
            }),
        ]);
        mountComponent(EditMode.Add, hs);
        await flushPromises();
        expect(vi.mocked(getPidData)).not.toHaveBeenCalled();
    });
});

// ---------------------------------------------------------------------------
// heritageSite sync watch — bypass and override guards
// ---------------------------------------------------------------------------

describe('Step3_SpatialLocation — heritageSite.site_boundary sync', () => {
    it('does not clear heritageSite.site_boundary when bypass is active', async () => {
        const hs = makeHeritageSite([
            makeLocation({ boundaryFeatures: [POLYGON_FEATURE] }),
        ]);
        const wrapper = mountComponent(EditMode.Add, hs);
        await nextTick();

        await wrapper.find('#boundaryIncorrect').setValue(true);
        await nextTick();

        const features =
            hs.value.aliased_data.heritage_site_location[0].aliased_data
                .site_boundary[0].aliased_data.site_boundary.node_value
                .features;
        expect(features).toHaveLength(1);
    });

    it('does not clear heritageSite.site_boundary when override is active', async () => {
        const hs = makeHeritageSite([
            makeLocation({ boundaryFeatures: [POLYGON_FEATURE] }),
        ]);
        const wrapper = mountComponent(EditMode.Add, hs);
        await nextTick();

        await wrapper.find('#overrideBoundary').setValue(true);
        await nextTick();

        const features =
            hs.value.aliased_data.heritage_site_location[0].aliased_data
                .site_boundary[0].aliased_data.site_boundary.node_value
                .features;
        expect(features).toHaveLength(1);
    });
});
