<script setup lang="ts">
import { inject, ref, onMounted, useTemplateRef, computed } from 'vue';
import type { Ref } from 'vue';

import FieldSet from 'primevue/fieldset';
import Checkbox from 'primevue/checkbox';

import { Form, type FormInstance } from '@primevue/forms';

import { EDIT } from '@/arches_component_lab/widgets/constants.ts';

import GenericWidget from '@/arches_component_lab/generics/GenericWidget/GenericWidget.vue';

import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import LabelledCheckboxInput from '@/bcgov_arches_common/components/labelledinput/LabelledCheckbox.vue';
import type { HeritageSiteType } from '@/bcrhp/schemas/heritage_site.ts';
import {
    PropertyAddress,
    getPropertyAddress,
} from '@/bcrhp/schemas/heritage_site/bc_property_address.ts';

import {
    getSiteBoundary,
    SiteBoundaryTileSchema,
} from '@/bcrhp/schemas/heritage_site/site_boundary.ts';

import {
    isValid as baseIsValid,
    updateModelValue as baseUpdateModelValue,
} from '@/bcrhp/utils.ts';

import type {
    AliasedNodeData,
    CardXNodeXWidgetData,
} from '@/arches_component_lab/types.ts';

import { zodResolver } from '@primevue/forms/resolvers/zod';
import { getFlattenResolver } from '@/bcgov_arches_common/validation-utils.ts';
import { getHeritageSiteLocation } from '@/bcrhp/schemas/heritage_site/heritage_site_location.ts';

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite')!;

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

let currentCivicAddress: typeof PropertyAddress = getPropertyAddress();

const emit = defineEmits(['update:stepIsValid']);

const siteBoundaryForm: Ref<FormInstance | null> = useTemplateRef(
    'siteBoundaryForm',
) as Ref<FormInstance | null>;

type FormErrors = Partial<Record<keyof typeof PropertyAddress, string[]>>;
const errors: Ref<FormErrors> = ref<FormErrors>({});

// These names need to match the Zog schema
const fields = {};

const mapOverrides = {
    widget: {
        widgetid: '',
        component:
            'bcgov_arches_common/widgets/MapDropZoneWidget/MapDropZoneWidget.vue',
    },
} satisfies Partial<CardXNodeXWidgetData>;

const isValid = () => {
    return true;
    // return baseIsValid(
    //     siteBoundaryForm as Ref<FormInstance>,
    //     SiteBoundaryTileSchema.shape['aliased_data'],
    // );
};

const siteBoundaryResolver = getFlattenResolver(
    zodResolver(SiteBoundaryTileSchema.shape['aliased_data']),
);

const updateModelValue = function (
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
    );
    emit('update:stepIsValid', isValid());
};

// This needs to be removed - added because ESLint was complaining. Need to figure out
// configuration so API methods are not
defineExpose({ isValid });
onMounted(() => {});
</script>
<template>
    <Form
        ref="siteBoundaryForm"
        name="siteBoundaryForm"
        :validateOnBlur="true"
        :validateOnValueUpdate="true"
        :resolver="siteBoundaryResolver"
    >
        <div class="flex flex-col container-width">
            <div style="display: none">Child {{ currentCivicAddress }}</div>
            <FieldSet
                id="siteBoundaryFieldSet"
                legend="Site Boundary"
                style="display: inline-block"
            >
                <div class="flex flex-row container-width">
                    <div>
                        <LabelledCheckboxInput
                            label="Site Boundary incorrect"
                            hint="If the geometry is incorrect, and you have the geometry in Shapefile, KML or GeoJason, check this box and drag it into the Site Boundary field."
                            input-name="hasCivicAddress"
                        >
                            <Checkbox
                                id="boundaryIncorrect"
                                ref="boundaryIncorrectField"
                                aria-describedby="has-civic-address-help"
                                aria-required="true"
                                fluid
                                binary
                                small
                            />
                        </LabelledCheckboxInput>
                        <LabelledInput
                            label="Site Boundary"
                            :required="true"
                        >
                            <div class="instructions">
                                <ol>
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
                                :mode="EDIT"
                                :aliased-node-data="
                                    heritageSite.value?.aliased_data
                                        ?.heritage_site_location.aliased_data
                                        ?.site_boundary.aliased_data
                                        .site_boundary
                                "
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
</style>
