<script setup lang="ts">
import { useTemplateRef, inject, ref, computed } from 'vue';
import type { Ref } from 'vue';

import FieldSet from 'primevue/fieldset';
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
import ChipsList from '@/bcrhp/pages/NewSite/steps/ChipsList.vue';

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite');
const emit = defineEmits(['update:stepIsValid']);

//refs and state
let hasPropertyAddress = ref(true);
let currentCivicAddress: BcPropertyAddressTileType = ref(getPropertyAddress());
let currentLegalDescription: BcPropertyLegalDescriptionTileType = ref(
    getLegalDescription(),
);
const isOverrideActive = ref(false);

//keys to force UI resets
const addressFormKey = ref(0);
const legalFormKey = ref(0);

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

const updateAddress = (newValue: AliasedNodeData, attribute_name: string) => {
    baseUpdateModelValue(
        newValue,
        attribute_name,
        currentCivicAddress.value.aliased_data,
        civicAddressForm as Ref<FormInstance>,
    );
    emit('update:stepIsValid', isValid());
};

const updateLegal = (newValue: AliasedNodeData, attribute_name: string) => {
    baseUpdateModelValue(
        newValue,
        attribute_name,
        currentLegalDescription.value.aliased_data,
        legalDescriptionForm as Ref<FormInstance>,
    );
    emit('update:stepIsValid', isValid());
};

const saveAddress = function () {
    if (heritageSite?.value && !heritageSite.value.civicAddresses) {
        heritageSite.value.civicAddresses = [];
    }

    const data = currentCivicAddress.value.aliased_data;
    const streetNode = data.street_address;

    let txt = '';
    const nv = streetNode?.node_value;
    if (typeof nv === 'string') txt = nv;
    else if (nv?.en?.value) txt = nv.en.value;

    if (streetNode && txt) {
        streetNode.display_value = txt;
    }

    heritageSite?.value.civicAddresses.push({
        streetAddress: streetNode,
        city: data.city,
        postalCode: data.postal_code,
        locality: data.locality,
        locationDescription: data.location_description,
    });

    //reset
    currentCivicAddress.value = JSON.parse(
        JSON.stringify(getPropertyAddress()),
    );
    addressFormKey.value++;
    civicAddressForm.value?.reset();
};

function deleteAddress(index: number) {
    heritageSite?.value.civicAddresses.splice(index, 1);
}

const hasAddressChanged = function () {
    hasPropertyAddress.value = !hasPropertyAddress.value;
};

const disableAddressSection = computed(() => !hasPropertyAddress.value);

function saveLegalDescription() {
    if (heritageSite?.value && !heritageSite.value.legalDescriptions) {
        heritageSite.value.legalDescriptions = [];
    }

    const data = currentLegalDescription.value.aliased_data;
    const rawPid = data.pid;
    const rawLegal = data.legal_description;

    const getText = (node: any) => {
        const nv = node?.node_value;
        if (!nv && nv !== 0) return '';

        if (typeof nv === 'string' || typeof nv === 'number') return String(nv);
        return nv?.en?.value || '';
    };

    let pidText = getText(rawPid);
    const legalText = getText(rawLegal);

    const cleanPid = rawPid ? JSON.parse(JSON.stringify(rawPid)) : {};
    cleanPid.display_value = pidText;

    const cleanLegal = rawLegal ? JSON.parse(JSON.stringify(rawLegal)) : {};
    cleanLegal.display_value = legalText;

    //push
    heritageSite?.value.legalDescriptions.push({
        parcelId: cleanPid,
        legalAddress: cleanLegal,
        overrideLegalDescription: isOverrideActive.value,
    });

    //reset
    currentLegalDescription.value = JSON.parse(
        JSON.stringify(getLegalDescription()),
    );
    isOverrideActive.value = false;
    legalFormKey.value++;
    legalDescriptionForm.value?.reset();
}

function deleteLegalDescription(index: number) {
    heritageSite?.value.legalDescriptions.splice(index, 1);
}

const isValid = () => {
    return true;
};

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
            :key="addressFormKey"
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
                    @update:value="updateAddress($event, 'street_address')"
                />
            </LabelledInput>
            <GenericWidget
                :mode="EDIT"
                :aliased-node-data="currentCivicAddress?.aliased_data?.city"
                graph-slug="heritage_site"
                node-alias="city"
                @update:value="updateAddress($event, 'city')"
            />
            <GenericWidget
                :mode="EDIT"
                :aliased-node-data="
                    currentCivicAddress?.aliased_data?.postal_code
                "
                graph-slug="heritage_site"
                node-alias="postal_code"
                @update:value="updateAddress($event, 'postal_code')"
            />
            <GenericWidget
                :mode="EDIT"
                :aliased-node-data="
                    currentCivicAddress?.aliased_data?.location_description
                "
                graph-slug="heritage_site"
                node-alias="location_description"
                @update:value="updateAddress($event, 'location_description')"
            />
            <GenericWidget
                :mode="EDIT"
                :aliased-node-data="currentCivicAddress?.aliased_data?.locality"
                graph-slug="heritage_site"
                node-alias="locality"
                @update:value="updateAddress($event, 'locality')"
            />

            <div class="flex flex-col gap-4 mt-4">
                <Button
                    label="+ Add Address"
                    @click="saveAddress"
                    class="w-fit"
                />
                <ChipsList
                    label="Addresses"
                    :items="heritageSite?.civicAddresses"
                    display-key="streetAddress.display_value"
                    @remove="deleteAddress"
                />
            </div>
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
            :key="legalFormKey"
        >
            <LabelledInput
                label="Parcel Identifier (PID)"
                hint="Click Validate to generate the legal description"
                input-name="parcelId"
                :error-message="$form.parcelId?.error?.message"
                :required="true"
            >
                <div class="p-inputtext-fluid">
                    <div class="row">
                        <GenericWidget
                            style="flex-grow: 1"
                            :mode="EDIT"
                            :should-show-label="false"
                            :aliased-node-data="
                                currentLegalDescription?.aliased_data?.pid
                            "
                            graph-slug="heritage_site"
                            node-alias="pid"
                            @update:value="updateLegal($event, 'pid')"
                        />
                        <Button
                            id="validateParcel"
                            label="Validate"
                            class="inline-block"
                        ></Button>
                    </div>
                    <br />
                    <LabelledCheckboxInput
                        label="Override Legal Description"
                        hint="Manually enter if not found or incorrect"
                        input-name="overrideLegalDescription"
                        class="inline-block"
                    >
                        <Checkbox
                            id="overrideLegalDescription"
                            v-model="isOverrideActive"
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
                <fieldset
                    :disabled="!isOverrideActive"
                    style="border: none; padding: 0; margin: 0; min-width: 0"
                >
                    <GenericWidget
                        :mode="EDIT"
                        :should-show-label="false"
                        :aliased-node-data="
                            currentLegalDescription?.aliased_data
                                ?.legal_description
                        "
                        graph-slug="heritage_site"
                        node-alias="legal_description"
                        @update:value="updateLegal($event, 'legal_description')"
                    />
                </fieldset>
            </LabelledInput>

            <div class="flex flex-col gap-4 mt-4">
                <Button
                    label="+ Add Legal Description"
                    @click="saveLegalDescription"
                    class="w-fit"
                />
                <ChipsList
                    label="Legal Descriptions"
                    :items="heritageSite?.legalDescriptions"
                    display-key="parcelId.display_value"
                    @remove="deleteLegalDescription"
                />
            </div>
        </FieldSet>
    </Form>
</template>

<style>
.row {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
}
</style>
