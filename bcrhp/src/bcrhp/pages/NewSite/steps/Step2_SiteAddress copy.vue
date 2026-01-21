<script setup lang="ts">
import { useTemplateRef, inject, ref, onMounted, computed } from 'vue';
import type { Ref } from 'vue';

import FieldSet from 'primevue/fieldset';
import InputText from 'primevue/inputtext';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import { Form, type FormInstance } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import LabelledCheckboxInput from '@/bcgov_arches_common/components/labelledinput/LabelledCheckbox.vue';
import GenericWidget from '@/arches_component_lab/generics/GenericWidget/GenericWidget.vue';
import { EDIT } from '@/arches_component_lab/widgets/constants.ts';
import type { AliasedNodeData } from '@/arches_component_lab/types.ts';
import {
    isValid as baseIsValid,
    updateModelValue as baseUpdateModelValue,
} from '@/bcrhp/utils.ts';
import { type HeritageSiteType } from '@/bcrhp/schemas/heritage_site.ts';
import {
    BcPropertyAddressTileSchema,
    type BcPropertyAddressTileType,
    getPropertyAddress,
} from '@/bcrhp/schemas/heritage_site/bc_property_address.ts';
import {
    type BcPropertyLegalDescriptionTileType,
    BcPropertyLegalDescriptionTileSchema,
    getLegalDescription,
} from '@/bcrhp/schemas/heritage_site/bc_property_legal_description.ts';
import { getFlattenResolver } from '@/bcgov_arches_common/validation-utils.ts';

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite');
const emit = defineEmits(['update:stepIsValid']);

let hasPropertyAddress = ref(true);
let currentCivicAddress: BcPropertyAddressTileType = ref(getPropertyAddress());
let currentLegalDescription: BcPropertyLegalDescriptionTileType = ref(
    getLegalDescription(),
);
const civicAddressForm: Ref<FormInstance | null> = useTemplateRef(
    'civicAddressForm',
) as Ref<FormInstance | null>;
const legalDescriptionForm: Ref<FormInstance | null> = useTemplateRef(
    'legalDescriptionForm',
) as Ref<FormInstance | null>;

const propertyAddressResolver = getFlattenResolver(
    zodResolver(BcPropertyAddressTileSchema.shape['aliased_data']),
);

const legalAddressResolver = getFlattenResolver(
    zodResolver(BcPropertyLegalDescriptionTileSchema.shape['aliased_data']),
);

const updateModelValue = function (
    newValue: AliasedNodeData,
    attribute_name: string,
) {
    baseUpdateModelValue(
        newValue,
        attribute_name,
        heritageSite?.value.aliased_data?.heritage_site_location.aliased_data
            .bc_property_address.aliased_data,
        civicAddressForm as Ref<FormInstance>,
    );
    emit('update:stepIsValid', isValid());
};

const saveAddress = function () {
    console.log('Save address');

    heritageSite?.value.civicAddresses.push({
        streetAddress: currentCivicAddress.value.streetAddress,
        city: currentCivicAddress.value.city,
        postalCode: currentCivicAddress.value.postalCode,
        locality: currentCivicAddress.value.locality,
        locationDescription: currentCivicAddress.value.locationDescription,
    });

    civicAddressForm.value?.reset();
};

const hasAddressChanged = function () {
    hasPropertyAddress.value = !hasPropertyAddress.value;
    console.log(`Has address?: ${currentCivicAddress.value.hasCivicAddress}`);
};

const disableAddressSection = computed(() => !hasPropertyAddress.value);

const isValid = () => {
    // Just to get through this step for now
    return true;
    // return baseIsValid(
    //     civicAddressForm as Ref<FormInstance>,
    //     BcPropertyAddressTileSchema.shape['aliased_data'],
    // );
};

onMounted(() => {});
// This needs to be removed - added because ESLint was complaining. Need to figure out
// configuration so API methods are not
defineExpose({ isValid });
</script>
<template>
    <Form
        ref="civicAddressForm"
        v-slot="$form"
        name="civicAddressForm"
        :validateOnBlur="true"
        :validateOnValueUpdate="true"
        :resolver="propertyAddressResolver"
    >
        <LabelledCheckboxInput
            label="This site does not have a Street Address"
            hint="Check if the site doesn't have a Street Address"
            input-name="hasCivicAddress"
        >
            <Checkbox
                id="hasCivicAddress"
                ref="hasCivicAddress"
                :model-value="!hasPropertyAddress"
                aria-describedby="has-civic-address-help"
                aria-required="true"
                fluid
                binary
                small
                @change="hasAddressChanged"
            />
        </LabelledCheckboxInput>
        <FieldSet
            id="civicAddressFieldset"
            legend="Civic Address"
            :disabled="disableAddressSection"
        >
            <LabelledInput
                label="Street Address"
                hint="Select the government with the jurisdiction over the site"
                input-name="authorizingAgency"
                :error-message="$form.streetAddress?.error?.message"
                :required="true"
            >
                <GenericWidget
                    :mode="EDIT"
                    :should-show-label="false"
                    :aliased-node-data="
                        currentCivicAddress?.aliased_data?.street_address
                    "
                    graph-slug="heritage_site"
                    node-alias="street_address"
                    @update:value="updateModelValue($event, 'street_address')"
                />
            </LabelledInput>
            <GenericWidget
                :mode="EDIT"
                :aliased-node-data="currentCivicAddress?.aliased_data?.city"
                graph-slug="heritage_site"
                node-alias="city"
                @update:value="updateModelValue($event, 'city')"
            />
            <GenericWidget
                :mode="EDIT"
                :aliased-node-data="
                    currentCivicAddress?.aliased_data?.postal_code
                "
                graph-slug="heritage_site"
                node-alias="postal_code"
                @update:value="updateModelValue($event, 'postal_code')"
            />
            <GenericWidget
                :mode="EDIT"
                :aliased-node-data="
                    currentCivicAddress?.aliased_data?.location_description
                "
                graph-slug="heritage_site"
                node-alias="location_description"
                @update:value="updateModelValue($event, 'location_description')"
            />
            <GenericWidget
                :mode="EDIT"
                :aliased-node-data="currentCivicAddress?.aliased_data?.locality"
                graph-slug="heritage_site"
                node-alias="locality"
                @update:value="updateModelValue($event, 'locality')"
            />
            <Button
                label="Add Address"
                @click="saveAddress"
            />
        </FieldSet>
    </Form>
    <Form
        ref="legalDescriptionForm"
        v-slot="$form"
        name="legalDescriptionForm"
        :validateOnBlur="true"
        :validateOnValueUpdate="true"
        :resolver="legalAddressResolver"
    >
        <FieldSet
            id="legalAddressFieldset"
            :disabled="disableAddressSection"
            legend="Legal Description"
        >
            <LabelledInput
                label="Parcel Identifier (PID)"
                hint="Click Validate to generate the legal description"
                input-name="parcelId"
                :error-message="$form.parcelId?.error?.message"
                :required="true"
            >
                <div class="p-inputtext-fluid">
                    <InputText
                        id="parcelId"
                        ref="parcelIdField"
                        v-model="currentLegalDescription.parcelId"
                        aria-describedby="parcel-help"
                        aria-required="true"
                        fluid
                        class="inline-block"
                    />
                    <Button
                        id="validateParcel"
                        label="Validate"
                        class="inline-block"
                    ></Button>
                    <LabelledCheckboxInput
                        label="Override Legal Description"
                        hint="Manually enter if not found or incorrect"
                        input-name="overrideLegalDescription"
                        class="inline-block"
                    >
                        <Checkbox
                            id="overrideLegalDescription"
                            ref="overrideLegalDescription"
                            :model-value="
                                currentLegalDescription.overrideLegalDescription
                            "
                            aria-describedby="override-legal-description-help"
                            aria-required="false"
                            fluid
                            binary
                            small
                        />
                    </LabelledCheckboxInput>
                </div>
            </LabelledInput>
            <LabelledInput
                label="Legal Address"
                hint="If the Legal Address is not found or incorrect, enter it here"
                input-name="legalAddress"
                :error-message="$form.legalAddress?.error?.message"
                :required="true"
            >
                <InputText
                    id="legalAddress"
                    ref="legalAddressField"
                    v-model="currentLegalDescription.legalAddress"
                    :disabled="currentLegalDescription.overrideLegalDescription"
                    aria-describedby="legal-address-help"
                    fluid
                />
            </LabelledInput>
        </FieldSet>
    </Form>
</template>

<style scoped>
:deep(.p-accordion-header) {
    background-color: #333;
    color:  #f8f9fa;      /* Text color */
    border-radius: 8px;        /* Rounded corners */
    font-weight: 600;
}

/* Target the action/link area specifically (the clickable part) */
:deep(.p-accordion-header-action) {
    padding: 1rem 1.25rem;     /* Adjust padding */
    background-color: #333;
    color:  #f8f9fa;  
}
</style>