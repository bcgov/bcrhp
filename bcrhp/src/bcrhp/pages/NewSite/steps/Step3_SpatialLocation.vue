<script setup lang="ts">
import { inject, ref, onMounted } from 'vue';
import type { Ref } from 'vue';

import FieldSet from 'primevue/fieldset';
import Checkbox from 'primevue/checkbox';

import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import LabelledCheckboxInput from '@/bcgov_arches_common/components/labelledinput/LabelledCheckbox.vue';
import type { HeritageSite } from '@/bcrhp/schemas/heritage_site.ts';
import {
    PropertyAddress,
    getPropertyAddress,
} from '@/bcrhp/schemas/heritage_site/bc_property_address.ts';
import type { ZodError } from 'zod';

const heritageSite: typeof HeritageSite = inject(
    'heritageSite',
) as typeof HeritageSite;
// const civicAddress: { [id: string] : CivicAddress; } = heritageSite.value.civicAddress;
let currentCivicAddress: typeof PropertyAddress = getPropertyAddress();
// civicAddress[currentCivicAddress.civicAddressId] = currentCivicAddress;

type FormErrors = Partial<Record<keyof typeof PropertyAddress, string[]>>;
const errors: Ref<FormErrors> = ref<FormErrors>({});

// These names need to match the Zog schema
const fields = {};

const isValid = () => {
    // We don't want to validate fields the first time we show the step
    // if (!validateFields) {
    //     validateFields = true;
    //     return true;
    // }
    // if (!currentCivicAddress.hasCivicAddress) {
    //     return true;
    // }
    let valid = true;

    // for (const field of Object.values(fields) as Array<Ref>) {
    //     valid = validateField(field?.value.$el as HTMLInputElement) && valid;
    // }
    return valid;
};

// This needs to be removed - added because ESLint was complaining. Need to figure out
// configuration so API methods are not
defineExpose({ isValid });

onMounted(() => {});
</script>
<template>
    <div class="flex flex-col container-width">
        <div style="display: none">Child {{ currentCivicAddress }}</div>
        <FieldSet
            id="siteBoundaryFieldSet"
            legend="Site Boundary"
            style="width: 55%; display: inline-block"
        >
            <div class="flex flex-row container-width">
                <div>
                    <LabelledCheckboxInput
                        label="Site Boundary incorrect"
                        hint="Update the geometry"
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
                        hint="Drag KML, GeoJSON or Shapefile here"
                        input-name="authorizingAgency"
                        :required="true"
                    >
                        <div>
                            Need geometry upload component for Geometry upload
                        </div>
                        <div>Need map display component</div>
                        <div class="instructions">
                            <div>
                                If there is no geospatial data/file add a Site
                                Map under the Supporting Documents step.
                            </div>
                            <div>
                                If the geospatial file does not import
                                successfully, add files under the Supporting
                                Documents step.
                            </div>
                        </div>
                    </LabelledInput>
                </div>
                <div
                    style="
                        width: 45%;
                        display: inline-block;
                        background-color: darkgoldenrod;
                        height: 400px;
                        margin-left: 6rem;
                    "
                ></div>
            </div>
        </FieldSet>
    </div>
</template>

<style>
.inline-block {
    display: inline-block;
    width: unset;
}

.container-width {
    width: 1058px;
}
</style>
