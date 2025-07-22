<script setup lang="ts">
import { useTemplateRef, inject, ref, onMounted, computed } from 'vue';
import type { Ref } from 'vue';

import FieldSet from 'primevue/fieldset';
import InputText from 'primevue/inputtext';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import { Form, FormField, type FormInstance } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import MultiValuePlaceholder from '@/bcgov_arches_common/components/multiValuePlaceholder/MultiValuePlaceholder.vue';
import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import LabelledCheckboxInput from '@/bcgov_arches_common/components/labelledinput/LabelledCheckbox.vue';
import type { HeritageSite } from '@/bcrhp/schema/HeritageSiteSchema.ts';
import {
    CivicAddressSchema,
    CivicAddress,
    getCivicAddress,
} from '@/bcrhp/schema/CivicAddressSchema.ts';
import {
    LegalDescriptionSchema,
    LegalDescription,
    getLegalDescription,
} from '@/bcrhp/schema/LegalDescriptionSchema.ts';
//import { fetchConcepts } from '@/bcrhp/api.ts';

const heritageSite: typeof HeritageSite = inject(
    'heritageSite',
) as typeof HeritageSite;
const heritageSiteRef: Ref<typeof HeritageSite> = ref(heritageSite);

let currentCivicAddress: typeof CivicAddress = ref(getCivicAddress());
let currentLegalDescription: typeof LegalDescription = ref(
    getLegalDescription(),
);
const civicAddressForm: Ref<FormInstance | null> = useTemplateRef(
    'civicAddressForm',
) as Ref<FormInstance | null>;
const legalDescriptionForm: Ref<FormInstance | null> = useTemplateRef(
    'legalDescriptionForm',
) as Ref<FormInstance | null>;
const civicAddresses = ref([] as Array<string>);

const zodStreetAddressResolver = zodResolver(
    CivicAddressSchema.shape.streetAddress,
);
const zodCityResolver = zodResolver(CivicAddressSchema.shape.city);
const zodPostalCodeResolver = zodResolver(CivicAddressSchema.shape.postalCode);
const zodLocalityResolver = zodResolver(CivicAddressSchema.shape.locality);
const zodLocationDescriptionResolver = zodResolver(
    CivicAddressSchema.shape.locationDescription,
);
const zodParcelIdResolver = zodResolver(LegalDescriptionSchema.shape.parcelId);
const zodLegalAddressResolver = zodResolver(
    LegalDescriptionSchema.shape.legalAddress,
);

const isCivicAddressValid = () => {
    return civicAddressForm.value?.valid;
};
const isLegalDescriptionValid = () => {
    return legalDescriptionForm.value?.valid;
};

const addOtherCivicAddressDisabled = computed(
    () =>
        civicAddressForm.value?.states?.streetAddress?.pristine ||
        civicAddressForm.value?.states?.city?.pristine ||
        civicAddressForm.value?.states?.postalCode?.pristine ||
        civicAddressForm.value?.states?.locationDescription?.pristine ||
        civicAddressForm.value?.states?.streetAddress?.invalid ||
        civicAddressForm.value?.states?.city?.invalid ||
        civicAddressForm.value?.states?.postalCode?.invalid ||
        civicAddressForm.value?.states?.locationDescription?.invalid ||
        heritageSiteRef.value.civicAddresses?.length > 4,
);

const addLegalDescriptionDisabled = computed(
    () =>
        legalDescriptionForm.value?.states?.parcelId?.pristine ||
        legalDescriptionForm.value?.states?.legalAddress?.pristine ||
        legalDescriptionForm.value?.states?.parcelId?.invalid ||
        legalDescriptionForm.value?.states?.legalAddress?.invalid ||
        !addOtherCivicAddressDisabled.value ||
        heritageSiteRef.value.civicAddress?.legalDescriptions?.length > 4,
);

const saveAddress = function () {
    console.log('Save address');

    heritageSite.value.civicAddresses.push({
        streetAddress: currentCivicAddress.value.streetAddress,
        city: currentCivicAddress.value.city,
        postalCode: currentCivicAddress.value.postalCode,
        locality: currentCivicAddress.value.locality,
        locationDescription: currentCivicAddress.value.locationDescription,
    });

    civicAddressForm.value?.reset();
};

const saveLegalDescription = function () {
    console.log('Save legal description');

    heritageSite.value.civicAddress[
        currentCivicAddress.value.civicAddressId
    ].legalDescriptions.push({
        parcelId: currentLegalDescription.value.parcelId,
        legalAddress: currentLegalDescription.value.legalAddress,
    });

    legalDescriptionForm.value?.reset();
};

const deleteCivicAddressCallback = function (index: number) {
    heritageSiteRef.value.civicAddress.civicAddresses.splice(index, 1);
};

const deleteLegalDescriptionCallback = function (index: number) {
    heritageSiteRef.value.legalDescription.legalDescriptions.splice(index, 1);
};

const disableAddressSection = ref(false);

const hasAddressChanged = function () {
    currentCivicAddress.value.hasCivicAddress =
        !currentCivicAddress.value.hasCivicAddress;
    console.log(`Has address?: ${currentCivicAddress.value.hasCivicAddress}`);
    disableAddressSection.value = !currentCivicAddress.value.hasCivicAddress;
};

// This needs to be removed - added because ESLint was complaining. Need to figure out
// configuration so API methods are not
defineExpose({ isCivicAddressValid, isLegalDescriptionValid });

// fetchConcepts("6021f510-ec29-4cd5-a7c4-e971ac7d9cf8", concepts);
onMounted(() => {
    heritageSiteRef.value.civicAddresses = civicAddresses;
});
</script>
<template>
    <Form
        ref="civicAddressForm"
        v-slot="$form"
        name="civicAddressForm"
        :validateOnBlur="true"
    >
        <div style="display: none">Child {{ currentCivicAddress }}</div>
        <LabelledCheckboxInput
            label="This site does not have a Street Address"
            hint="Check if the site doesn't have a Street Address"
            input-name="hasCivicAddress"
        >
            <Checkbox
                id="hasCivicAddress"
                ref="hasCivicAddress"
                :model-value="!currentCivicAddress.hasCivicAddress"
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
            <FormField
                :resolver="zodStreetAddressResolver"
                name="streetAddress"
            >
                <LabelledInput
                    label="Street Address"
                    hint="Select the government with the jurisdiction over the site"
                    input-name="authorizingAgency"
                    :error-message="$form.streetAddress?.error?.message"
                    :required="true"
                >
                    <div class="p-inputtext-fluid">
                        <InputText
                            id="streetAddress"
                            ref="streetAddressField"
                            v-model="currentCivicAddress.streetAddress"
                            aria-describedby="street-address-help"
                            aria-required="true"
                            fluid
                            class="inline-block"
                        />
                        <Button
                            id="validateAddress"
                            label="Validate"
                            class="inline-block"
                        ></Button>
                    </div>
                </LabelledInput>
            </FormField>
            <FormField
                :resolver="zodCityResolver"
                name="city"
            >
                <LabelledInput
                    label="City"
                    hint="Enter a unique name for your project."
                    input-name="city"
                    :error-message="$form.city?.error?.message"
                    :required="true"
                >
                    <InputText
                        id="city"
                        ref="cityField"
                        v-model="currentCivicAddress.city"
                        aria-describedby="city-help"
                        aria-required="true"
                        fluid
                    />
                    <!--              @value-change="valueUpdated"-->
                </LabelledInput>
            </FormField>
            <FormField
                :resolver="zodPostalCodeResolver"
                name="postalCode"
            >
                <LabelledInput
                    label="Postal Code"
                    hint="Enter address postal code"
                    input-name="postalCode"
                    :error-message="$form.postalCode?.error?.message"
                    :required="true"
                >
                    <InputText
                        id="postalCode"
                        ref="postalCodeField"
                        v-model="currentCivicAddress.postalCode"
                        aria-describedby="postal-code-help"
                        fluid
                    />
                </LabelledInput>
            </FormField>
            <FormField
                :resolver="zodLocationDescriptionResolver"
                name="locationDescription"
            >
                <LabelledInput
                    label="Location Description"
                    hint="Location description of the site if there is no street address"
                    input-name="locationDescription"
                    :error-message="$form.locationDescription?.error?.message"
                    :required="true"
                >
                    <InputText
                        id="locationDescription"
                        ref="locationDescriptionField"
                        v-model="currentCivicAddress.locationDescription"
                        aria-describedby="postal-code-help"
                        fluid
                    />
                </LabelledInput>
            </FormField>
            <FormField
                :resolver="zodLocalityResolver"
                name="locality"
            >
                <LabelledInput
                    label="Locality (Optional)"
                    hint="Established area or neighborhood the site is located within"
                    input-name="locality"
                    :error-message="$form.locality?.error?.message"
                >
                    <InputText
                        id="locality"
                        ref="localityField"
                        v-model="currentCivicAddress.locality"
                        placeholder="Enter the Locality"
                        aria-describedby="locality-help"
                        fluid
                    />
                </LabelledInput>
            </FormField>
            <Button
                label="Add Address"
                :disabled="addOtherCivicAddressDisabled"
                :aria_disabled="addOtherCivicAddressDisabled"
                @click="saveAddress"
            />
            <MultiValuePlaceholder
                v-slot="slotProps"
                :showDeleteButton="true"
                :displayValues="civicAddresses"
                label="Civic Address(es)"
                :deleteCallback="deleteCivicAddressCallback"
            >
                <div class="flex">
                    <div
                        v-for="slot in slotProps"
                        :key="slot"
                        class="parent value mr-6"
                    >
                        {{ slot.streetAddress }} {{ slot.city }}
                        {{ slot.postalCode }}
                        {{ slot.locationDescription }} {{ slot.locality }}
                    </div>
                    <div class="flex flex-col">
                        <Button
                            label="Add Legal Description(s) +"
                            :disabled="addLegalDescriptionDisabled"
                            :aria_disabled="addLegalDescriptionDisabled"
                            @click="saveLegalDescription"
                        />
                        <MultiValuePlaceholder
                            :showDeleteButton="true"
                            :displayValues="civicAddresses"
                            label="Legal Description(s)"
                            :deleteCallback="deleteLegalDescriptionCallback"
                        >
                            <div
                                v-for="slot in slotProps"
                                :key="slot"
                                class="parent value"
                            >
                                {{ slot.parcelId }} {{ slot.legalAddress }}
                            </div>
                        </MultiValuePlaceholder>
                    </div>
                </div>
            </MultiValuePlaceholder>
        </FieldSet>
    </Form>
    <Form
        ref="legalDescriptionForm"
        v-slot="$form"
        name="legalDescriptionForm"
        :validateOnBlur="true"
    >
        <FieldSet
            id="legalAddressFieldset"
            :disabled="disableAddressSection"
            legend="Legal Description"
        >
            <FormField
                :resolver="zodParcelIdResolver"
                name="parcelId"
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
            </FormField>
            <FormField
                :resolver="zodLegalAddressResolver"
                name="legalAddress"
            >
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
                        :disabled="
                            currentLegalDescription.overrideLegalDescription
                        "
                        aria-describedby="legal-address-help"
                        fluid
                    />
                </LabelledInput>
            </FormField>
        </FieldSet>
    </Form>
</template>
<style scoped></style>
