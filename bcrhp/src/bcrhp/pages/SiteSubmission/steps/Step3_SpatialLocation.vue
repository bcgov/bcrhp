<script setup lang="ts">
import { computed, inject, useTemplateRef, ref, watch } from 'vue';
import type { Ref } from 'vue';

import Checkbox from 'primevue/checkbox';
import FieldSet from 'primevue/fieldset';
import ToggleSwitch from 'primevue/toggleswitch';
import Step3_SpatialLocationView from '@/bcrhp/pages/SiteSubmission/steps/Step3_SpatialLocationView.vue';
import { EditMode } from '@/bcrhp/pages/SiteSubmission/constants.ts';
import { useWorkflowStep } from '@/bcrhp/components/WorkflowStepper/components/useWorkflowStep.ts';
import { Form, type FormInstance } from '@primevue/forms';
import { EDIT, VIEW } from '@/arches_component_lab/widgets/constants.ts';
import GenericWidget from '@/arches_component_lab/generics/GenericWidget/GenericWidget.vue';
import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import LabelledCheckboxInput from '@/bcgov_arches_common/components/labelledinput/LabelledCheckbox.vue';
import { type HeritageSiteType } from '@/bcrhp/schemas/heritage_site.ts';

import {
    getSiteBoundary,
    SiteBoundaryTileSchema,
} from '@/bcrhp/schemas/heritage_site/site_boundary.ts';

import {
    updateModelValue as baseUpdateModelValue,
    formatPid,
} from '@/bcrhp/utils.ts';

import type {
    AliasedNodeData,
    CardXNodeXWidgetData,
} from '@/arches_component_lab/types.ts';

import { zodResolver } from '@primevue/forms/resolvers/zod';
import { getFlattenResolver } from '@/bcgov_arches_common/validation-utils.ts';
import {
    getHeritageSiteLocation,
    type HeritageSiteLocationTileType,
} from '@/bcrhp/schemas/heritage_site/heritage_site_location.ts';
import type { BcPropertyAddressTileType } from '@/bcrhp/schemas/heritage_site/bc_property_address.ts';
import type { BcPropertyLegalDescriptionTileType } from '@/bcrhp/schemas/heritage_site/bc_property_legal_description.ts';
import type { FeatureCollection } from 'geojson';
import { getPidData } from '@/bcrhp/api.ts';
//import { FeatureCollectionWithNonEmptyPolygonsSchema } from '@/bcgov_arches_common/datatypes/geojson-feature-collection/validation/zod.ts';

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite')!;
const { editMode } = useWorkflowStep();

const isEditing = ref(false);
const matchingExistingPid = ref<number | null>(null);
const existingGeometrySnapshot = ref<any>(null);
const uploadedGeometry = ref<any>(null);
let snapshot: unknown = null;
watch(isEditing, async (editing) => {
    if (editing) {
        snapshot = JSON.parse(
            JSON.stringify(
                heritageSite.value.aliased_data.heritage_site_location,
            ),
        );
        existingGeometrySnapshot.value =
            (snapshot as any)?.[0]?.aliased_data?.site_boundary?.[0]
                ?.aliased_data?.site_boundary ?? null;
        if (matchingExistingPid.value !== null) {
            await getPidGeometry(String(matchingExistingPid.value));
            selectedPids.value = [matchingExistingPid.value];
        }
    } else if (snapshot !== null) {
        heritageSite.value.aliased_data.heritage_site_location =
            snapshot as any;
        snapshot = null;
        selectedPids.value = [];
        existingGeometrySnapshot.value = null;
        uploadedGeometry.value = null;
        overrideBoundary.value = false;
        emit('update:stepIsValid', isValid());
    }
});

const isBoundaryBypassed = ref(false);
const overrideBoundary = ref(false);

const ensureSiteLocation = () => {
    if (heritageSite.value?.aliased_data?.heritage_site_location.length === 0) {
        heritageSite.value?.aliased_data.heritage_site_location.push(
            getHeritageSiteLocation(),
        );
    }
    if (
        heritageSite.value?.aliased_data?.heritage_site_location[0].aliased_data
            .site_boundary.length === 0
    ) {
        heritageSite.value?.aliased_data?.heritage_site_location[0].aliased_data.site_boundary.push(
            getSiteBoundary(),
        );
    }
};

// const hasSinglePID = computed(() => {
//     return getUniquePIDsFromHeritageSite(heritageSite.value).length === 1;
// });

// Check if valid boundary data exists
const hasBoundaryData = computed(() => {
    const features =
        heritageSite.value?.aliased_data?.heritage_site_location?.[0]
            ?.aliased_data?.site_boundary?.[0]?.aliased_data?.site_boundary
            ?.node_value?.features;
    return Array.isArray(features) && features.length > 0;
});

// Retrieve the calculated area
const siteArea = computed(() => {
    const areaNode =
        heritageSite.value?.aliased_data?.heritage_site_location?.[0]
            ?.aliased_data?.site_boundary?.[0]?.aliased_data?.mapped_area;

    return areaNode?.display_value || areaNode?.node_value || null;
});

const widgetMode = computed(() => {
    if (overrideBoundary.value) return EDIT;
    return VIEW;
});

const emit = defineEmits(['update:stepIsValid']);

const siteBoundaryForm: Ref<FormInstance | null> = useTemplateRef(
    'siteBoundaryForm',
) as Ref<FormInstance | null>;

const mapOverrides = {
    widget: {
        widgetid: '',
        component:
            'bcgov_arches_common/widgets/MapDropZoneWidget/MapDropZoneWidget.vue',
    },
} satisfies Partial<CardXNodeXWidgetData>;

const isValid = () => {
    if (isBoundaryBypassed.value === true) return true;
    return hasBoundaryData.value;
};

const siteBoundaryResolver = getFlattenResolver(
    zodResolver(SiteBoundaryTileSchema.shape['aliased_data']),
);

const onBypassToggle = () => {
    emit('update:stepIsValid', isValid());
};

const updateModelValue = async function (
    newValue: AliasedNodeData,
    attribute_name: string,
) {
    uploadedGeometry.value = newValue;
    ensureSiteLocation();
    baseUpdateModelValue(
        newValue,
        attribute_name,
        heritageSite.value?.aliased_data?.heritage_site_location[0].aliased_data
            ?.site_boundary[0].aliased_data,
        siteBoundaryForm as Ref<FormInstance>,
    ).then(() => {
        emit('update:stepIsValid', isValid());
    });
};

watch(overrideBoundary, (isOverride) => {
    if (!isOverride) {
        uploadedGeometry.value = null;
    }
});

const pidGeometries = ref<Record<string, FeatureCollection>>({});
const selectedPids = ref<number[]>([]);
const showExistingGeometry = ref(true);

const allPids = computed<number[]>(() => {
    const pids = heritageSite.value.aliased_data.heritage_site_location.flatMap(
        (location: HeritageSiteLocationTileType) =>
            location.aliased_data.bc_property_address.flatMap(
                (address: BcPropertyAddressTileType) =>
                    address.aliased_data.bc_property_legal_description.flatMap(
                        (
                            legal: BcPropertyLegalDescriptionTileType,
                        ): number[] =>
                            legal.aliased_data.pid.node_value != null
                                ? [legal.aliased_data.pid.node_value]
                                : [],
                    ),
            ),
    );
    return [...new Set<number>(pids)].sort((a, b) => a - b);
});

const getPidGeometry = async (pid: string) => {
    const fullPid = pid.padStart(9, '0');
    if (fullPid in pidGeometries.value) {
        return pidGeometries.value[fullPid];
    }

    const data = await getPidData(fullPid);

    if (data.boundary) {
        const geojsonValue = {
            type: 'FeatureCollection',
            features: [data.boundary],
        } as FeatureCollection;
        pidGeometries.value[fullPid] = geojsonValue;
        return geojsonValue;
    }
};

const siteBoundaryValue = computed(() => {
    if (editMode === EditMode.Edit && !isEditing.value) {
        return heritageSite.value?.aliased_data?.heritage_site_location?.[0]
            ?.aliased_data?.site_boundary?.[0]?.aliased_data?.site_boundary;
    }
    if (isBoundaryBypassed.value) {
        return {
            node_value: { type: 'FeatureCollection' as const, features: [] },
            display_value: '',
            details: [],
        };
    }
    if (overrideBoundary.value) {
        return (
            uploadedGeometry.value ?? {
                node_value: {
                    type: 'FeatureCollection' as const,
                    features: [],
                },
                display_value: '',
                details: [],
            }
        );
    }
    const pidFeatures = selectedPids.value.flatMap((pid) => {
        const fullPid = String(pid).padStart(9, '0');
        return pidGeometries.value[fullPid]?.features ?? [];
    });
    const existingFeatures =
        showExistingGeometry.value &&
        existingGeometrySnapshot.value !== null &&
        matchingExistingPid.value === null
            ? (existingGeometrySnapshot.value?.node_value?.features ?? [])
            : [];
    return {
        node_value: {
            type: 'FeatureCollection' as const,
            features: [...existingFeatures, ...pidFeatures],
        },
        display_value: '',
        details: [],
    };
});

watch(
    siteBoundaryValue,
    (val) => {
        if (val === undefined) return;
        if (editMode === EditMode.Edit && !isEditing.value) return;
        if (isBoundaryBypassed.value) return;
        if (overrideBoundary.value) return;
        ensureSiteLocation();
        const boundary =
            heritageSite.value?.aliased_data?.heritage_site_location?.[0]
                ?.aliased_data?.site_boundary?.[0];
        if (boundary) {
            boundary.aliased_data.site_boundary = val as any;
        }
        emit('update:stepIsValid', isValid());
    },
    { deep: true },
);

const geometrySignature = (fc: FeatureCollection): string =>
    JSON.stringify(fc.features.map((f) => JSON.stringify(f.geometry)).sort());

const checkExistingGeometryMatchesPid = async () => {
    matchingExistingPid.value = null;
    if (editMode !== EditMode.Edit || !hasBoundaryData.value) return;

    const existingFeatures =
        heritageSite.value?.aliased_data?.heritage_site_location?.[0]
            ?.aliased_data?.site_boundary?.[0]?.aliased_data?.site_boundary
            ?.node_value?.features ?? [];
    if (existingFeatures.length === 0) return;

    const existingSig = geometrySignature({
        type: 'FeatureCollection',
        features: existingFeatures,
    });

    for (const pid of allPids.value) {
        const pidGeo = await getPidGeometry(String(pid));
        if (!pidGeo || pidGeo.features.length === 0) continue;
        if (geometrySignature(pidGeo) === existingSig) {
            matchingExistingPid.value = pid;
            return;
        } else {
            console.log('Dont match', geometrySignature(pidGeo), existingSig);
        }
    }
};

watch(allPids, checkExistingGeometryMatchesPid, { immediate: true });

const onSelectPid = async (pid: number) => {
    await getPidGeometry(String(pid));
};

defineExpose({ isValid });
</script>
<template>
    <div v-if="editMode === EditMode.Edit">
        <ToggleSwitch v-model="isEditing" />
        <label>Edit Spatial Location</label>
        <Step3_SpatialLocationView v-if="!isEditing" />
        <hr />
    </div>
    <Form
        v-if="isEditing || editMode === EditMode.Add"
        ref="siteBoundaryForm"
        name="siteBoundaryForm"
        :validateOnBlur="true"
        :validateOnValueUpdate="true"
        :resolver="siteBoundaryResolver"
    >
        <div>
            <div class="mb-4">
                <LabelledCheckboxInput
                    label="Bypass Site Boundary"
                    hint="Check this box if the geometry is incorrect or unavailable at this time."
                    input-name="bypassBoundary"
                >
                    <Checkbox
                        id="boundaryIncorrect"
                        v-model="isBoundaryBypassed"
                        :binary="true"
                        small
                        @change="onBypassToggle"
                    />
                </LabelledCheckboxInput>
            </div>

            <FieldSet
                id="siteBoundaryFieldSet"
                legend="Site Boundary"
                :disabled="isBoundaryBypassed"
            >
                <div>
                    <div>
                        <LabelledInput
                            label="Site Boundary"
                            :required="!isBoundaryBypassed"
                        >
                            <div class="controls-container mb-3">
                                <div class="flex items-center gap-4">
                                    <LabelledCheckboxInput
                                        label="Use Shapefile / KML / GeoJSON instead of Cadastral Features"
                                        hint="Check this box to upload a new file"
                                        input-name="overrideBoundary"
                                    >
                                        <Checkbox
                                            id="overrideBoundary"
                                            v-model="overrideBoundary"
                                            :binary="true"
                                            small
                                        />
                                    </LabelledCheckboxInput>
                                </div>

                                <div
                                    v-if="siteArea"
                                    class="area-data ml-6 mt-2 text-sm text-gray-600"
                                >
                                    <i class="pi pi-info-circle mr-1"></i>
                                    <strong>Mapped Area:</strong> {{ siteArea }}
                                </div>
                            </div>
                            <div
                                v-if="!isBoundaryBypassed && !overrideBoundary"
                                class="pid-geometries-grid"
                            >
                                <div
                                    v-if="
                                        editMode === EditMode.Edit &&
                                        existingGeometrySnapshot?.node_value
                                            ?.features?.length > 0 &&
                                        matchingExistingPid === null
                                    "
                                    class="pid-geometries"
                                >
                                    <Checkbox
                                        id="existingGeometry"
                                        v-model="showExistingGeometry"
                                        :binary="true"
                                    />
                                    <label for="existingGeometry"
                                        >Existing geometry</label
                                    >
                                </div>
                                <div
                                    v-for="pid in allPids"
                                    :key="pid"
                                    class="pid-geometries"
                                >
                                    <Checkbox
                                        :id="`bypassBoundary-${formatPid(pid)}`"
                                        v-model="selectedPids"
                                        :value="pid"
                                        @change="onSelectPid(pid)"
                                    />
                                    <span
                                        >{{ formatPid(pid)
                                        }}{{
                                            pid === matchingExistingPid
                                                ? ' (Existing)'
                                                : ''
                                        }}</span
                                    >
                                </div>
                            </div>

                            <div
                                v-if="widgetMode === EDIT"
                                class="instructions"
                            >
                                <ol>
                                    <li>
                                        If you entered and validated a PID in
                                        Step 2 you should see the site mapped on
                                        this page. If so, uploading a spatial
                                        file is not necessary.
                                    </li>
                                    <li>
                                        If there is no geospatial data/file add
                                        a Site Map under the Supporting
                                        Documents step.
                                    </li>
                                    <li>
                                        If the geospatial file does not import
                                        successfully, add files under the
                                        Supporting Documents step.
                                    </li>
                                </ol>
                            </div>

                            <GenericWidget
                                graph-slug="heritage_site"
                                node-alias="site_boundary"
                                :should-show-label="false"
                                :card-x-node-x-widget-data-overrides="
                                    mapOverrides
                                "
                                :mode="widgetMode"
                                :aliased-node-data="siteBoundaryValue"
                                @update:value="
                                    updateModelValue($event, 'site_boundary')
                                "
                            ></GenericWidget>
                        </LabelledInput>
                    </div>
                </div>
            </FieldSet>
        </div>
    </Form>
</template>

<style scoped>
.instructions {
    margin-left: 2rem;
}

.instructions > ol {
    list-style-type: decimal;
}

.inline-block {
    display: inline-block;
    width: unset;
}

.container-width {
    width: 1058px;
}

.controls-container {
    padding: 0.5rem;
    border: 1px dashed #ccc;
    border-radius: 4px;
    background-color: #fafafa;
}

/* Grid container: fills top-to-bottom first, then left-to-right, up to 5×5. */
.pid-geometries-grid {
    display: grid;
    grid-auto-flow: column;
    grid-template-rows: repeat(5, auto);
    grid-template-columns: repeat(5, auto);
    gap: 0.25rem 1.5rem;
    width: fit-content;
}

/* Individual pid item: checkbox + label as a horizontal pair. */
.pid-geometries {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.area-data {
    display: inline-flex;
    align-items: center;
    background: #fff;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    border: 1px solid #dee2e6;
}
</style>
