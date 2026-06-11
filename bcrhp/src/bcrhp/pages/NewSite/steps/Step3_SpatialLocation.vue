<script setup lang="ts">
import { computed, inject, useTemplateRef, ref } from 'vue';
import type { Ref } from 'vue';

import FieldSet from 'primevue/fieldset';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import { Form, type FormInstance } from '@primevue/forms';
import { EDIT, VIEW } from '@/arches_component_lab/widgets/constants.ts';
import GenericWidget from '@/arches_component_lab/generics/GenericWidget/GenericWidget.vue';
import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import LabelledCheckboxInput from '@/bcgov_arches_common/components/labelledinput/LabelledCheckbox.vue';
import {
    // getUniquePIDsFromHeritageSite,
    type HeritageSiteType,
} from '@/bcrhp/schemas/heritage_site.ts';

import {
    getSiteBoundary,
    SiteBoundaryTileSchema,
} from '@/bcrhp/schemas/heritage_site/site_boundary.ts';

import { updateModelValue as baseUpdateModelValue } from '@/bcrhp/utils.ts';

import type {
    AliasedNodeData,
    CardXNodeXWidgetData,
} from '@/arches_component_lab/types.ts';

import { zodResolver } from '@primevue/forms/resolvers/zod';
import { getFlattenResolver } from '@/bcgov_arches_common/validation-utils.ts';
import { getHeritageSiteLocation } from '@/bcrhp/schemas/heritage_site/heritage_site_location.ts';
//import { FeatureCollectionWithNonEmptyPolygonsSchema } from '@/bcgov_arches_common/datatypes/geojson-feature-collection/validation/zod.ts';

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite')!;

const isBoundaryBypassed = ref(false);
const overrideBoundary = ref(false);
const mapWidgetKey = ref(0); // Forces map re-render

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
    if (!hasBoundaryData.value) return EDIT;
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

const clearGeometry = () => {
    ensureSiteLocation();

    const boundaryTile =
        heritageSite.value.aliased_data.heritage_site_location[0].aliased_data
            .site_boundary[0];

    if (boundaryTile.aliased_data.site_boundary) {
        boundaryTile.aliased_data.site_boundary = {
            node_value: {
                type: 'FeatureCollection',
                features: [],
            },
            display_value: '',
            details: [],
        };
    }

    if (boundaryTile.aliased_data.mapped_area) {
        boundaryTile.aliased_data.mapped_area = {
            node_value: null,
            display_value: '',
            details: [],
        };
    }

    overrideBoundary.value = false;
    mapWidgetKey.value++;
    emit('update:stepIsValid', isValid());
};

defineExpose({ isValid });
</script>
<template>
    <Form
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
                            <div
                                v-if="hasBoundaryData"
                                class="controls-container mb-3"
                            >
                                <div class="flex items-center gap-4">
                                    <LabelledCheckboxInput
                                        label="Update / Replace existing boundary data"
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

                                    <Button
                                        label="Remove Geometry"
                                        icon="pi pi-trash"
                                        severity="danger"
                                        size="small"
                                        outlined
                                        @click="clearGeometry"
                                    />
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
                                        Supporting Documents step.”
                                    </li>
                                </ol>
                            </div>

                            <GenericWidget
                                :key="mapWidgetKey"
                                graph-slug="heritage_site"
                                node-alias="site_boundary"
                                :should-show-label="false"
                                :card-x-node-x-widget-data-overrides="
                                    mapOverrides
                                "
                                :mode="widgetMode"
                                :aliased-node-data="
                                    heritageSite?.aliased_data
                                        ?.heritage_site_location?.[0]
                                        ?.aliased_data?.site_boundary?.[0]
                                        ?.aliased_data?.site_boundary
                                "
                                @update:aliasedNodeData="
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

.area-data {
    display: inline-flex;
    align-items: center;
    background: #fff;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    border: 1px solid #dee2e6;
}
</style>
