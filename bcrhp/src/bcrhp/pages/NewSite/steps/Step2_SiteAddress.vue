<script setup lang="ts">
import { useTemplateRef, inject, ref, computed } from 'vue';
import type { Ref } from 'vue';

import FieldSet from 'primevue/fieldset';
import Checkbox from 'primevue/checkbox';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Chip from 'primevue/chip';
import { Form, type FormInstance } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import LabelledCheckboxInput from '@/bcgov_arches_common/components/labelledinput/LabelledCheckbox.vue';
import GenericWidget from '@/arches_component_lab/generics/GenericWidget/GenericWidget.vue';
import type { AliasedNodeData } from '@/arches_component_lab/types.ts';
import { updateModelValue as baseUpdateModelValue } from '@/bcrhp/utils.ts';
import { type HeritageSiteType } from '@/bcrhp/schemas/heritage_site.ts';
import { getHeritageSiteLocation } from '@/bcrhp/schemas/heritage_site/heritage_site_location.ts';
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
import { EDIT } from '@/arches_component_lab/widgets/constants.ts';

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite')!;
const emit = defineEmits(['update:stepIsValid']);

//refs and state
let hasPropertyAddress = ref(true);
let currentPropertyAddress: Ref<BcPropertyAddressTileType> =
    ref(getPropertyAddress());

const propertyAddressList = computed(() => {
    return (
        heritageSite.value?.aliased_data?.heritage_site_location?.[0]
            ?.aliased_data?.bc_property_address ?? []
    );
});
const legalDescriptionList = computed(() => {
    return currentPropertyAddress.value?.aliased_data?.legal_description ?? [];
});

let currentLegalDescription: Ref<BcPropertyLegalDescriptionTileType> = ref(
    getLegalDescription(),
);
const isOverrideActive = ref(false);

//keys to force UI resets
const addressFormKey = ref(0);
const legalFormKey = ref('0_0');
const addingNewAddress = ref(true);
const addLegalDescriptionVisible = ref(false);
const pidField = ref<any>();
const legalDescriptionTargetAddress: Ref<BcPropertyAddressTileType | null> =
    ref(null);

const nextAddressKey = computed(() => propertyAddressList?.value?.length ?? 0);
const nextLegalDescriptionKey = computed(
    () => `${addressFormKey.value}_${legalDescriptionList.value.length}`,
);

const propertyAddressForm: Ref<FormInstance | null> = useTemplateRef(
    'propertyAddressForm',
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
        currentPropertyAddress.value.aliased_data,
        propertyAddressForm as Ref<FormInstance>,
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
    if (
        heritageSite.value &&
        !heritageSite.value.aliased_data.heritage_site_location?.[0]
    ) {
        heritageSite.value.aliased_data.heritage_site_location = [
            getHeritageSiteLocation(),
        ];
    }
    if (
        heritageSite.value &&
        !heritageSite.value.aliased_data.heritage_site_location[0].aliased_data
            .bc_property_address
    ) {
        heritageSite.value.aliased_data.heritage_site_location[0].aliased_data.bc_property_address =
            [];
    }

    if (addingNewAddress.value) {
        heritageSite.value.aliased_data.heritage_site_location[0].aliased_data.bc_property_address.push(
            currentPropertyAddress.value,
        );
    }

    currentPropertyAddress.value = getPropertyAddress();
    addingNewAddress.value = true;
    addressFormKey.value = nextAddressKey.value;

    propertyAddressForm.value?.reset();
};

const setCurrentPropertyAddress = function (index: number) {
    console.log(`Editing address at index ${index}`);
    currentPropertyAddress.value = propertyAddressList.value[index];
    addressFormKey.value = index;
    addingNewAddress.value = false;
};

function deleteAddress(index: number) {
    heritageSite.value.aliased_data.heritage_site_location[0].aliased_data.bc_property_address.splice(
        index,
        1,
    );
}

const hasAddressChanged = function () {
    hasPropertyAddress.value = !hasPropertyAddress.value;
};

const disableAddressSection = computed(() => !hasPropertyAddress.value);

//helper for chip list
const getAddressLabel = (addr: any) => {
    const data = addr?.aliased_data || {};

    const getString = (node: any) => {
        if (!node) return '';
        let val = '';
        if (node.display_value) val = node.display_value;
        else if (typeof node.node_value === 'string') val = node.node_value;
        else if (node.node_value?.en?.value) val = node.node_value.en.value;
        else if (typeof node === 'string') val = node;

        // Strip HTML tags
        return val.replace(/<[^>]*>?/gm, '');
    };

    const street = getString(data.street_address);
    const city = getString(data.city);
    const locality = getString(data.locality);
    const postal = getString(data.postal_code);

    return (
        [street, city, locality, postal]
            .filter((s) => s && s.trim().length > 0)
            .join(' - ') || 'Untitled Address'
    );
};

const getLegalsForAddress = (addr: any) => {
    return Array.isArray(addr?.aliased_data?.legal_description)
        ? addr.aliased_data.legal_description
        : [];
};

function openLegalDialog(addressIndex: number) {
    // Set separate target for dialog interaction
    legalDescriptionTargetAddress.value =
        propertyAddressList.value[addressIndex];

    currentLegalDescription.value = getLegalDescription();
    isOverrideActive.value = false;
    legalFormKey.value = nextLegalDescriptionKey.value;
    legalDescriptionForm.value?.reset();
    addLegalDescriptionVisible.value = true;
}

function saveLegalDescription() {
    if (legalDescriptionTargetAddress.value) {
        if (
            !legalDescriptionTargetAddress.value.aliased_data.legal_description
        ) {
            legalDescriptionTargetAddress.value.aliased_data.legal_description =
                [];
        }

        legalDescriptionTargetAddress.value.aliased_data.legal_description.push(
            currentLegalDescription.value,
        );
    }

    currentLegalDescription.value = getLegalDescription();
    isOverrideActive.value = false;
    addLegalDescriptionVisible.value = false;
    legalDescriptionTargetAddress.value = null;
}

function deleteLegalDescription(addressIndex: number, legalIndex: number) {
    const address = propertyAddressList.value[addressIndex];
    if (address && address.aliased_data.legal_description) {
        address.aliased_data.legal_description.splice(legalIndex, 1);
    }
}

const isValid = () => {
    return true;
};

defineExpose({ isValid });
</script>

<template>
    <Form
        ref="propertyAddressForm"
        v-slot="$form"
        name="propertyAddressForm"
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
            id="propertyAddressFieldset"
            :key="addressFormKey"
            legend="Civic Address"
            :disabled="disableAddressSection"
        >
            <div
                class="row"
                style="width: 100%"
            >
                <div style="flex: 2; margin-left: 0.75rem">
                    <LabelledInput
                        label="Street Address"
                        hint="Select the government with the jurisdiction over the site"
                        input-name="streetAddress"
                        :error-message="$form.streetAddress?.error?.message"
                        :required="true"
                    >
                        <GenericWidget
                            class="input-grow"
                            :mode="EDIT"
                            :should-show-label="false"
                            :aliased-node-data="
                                currentPropertyAddress?.aliased_data
                                    ?.street_address
                            "
                            graph-slug="heritage_site"
                            node-alias="street_address"
                            @update:value="
                                updateAddress($event, 'street_address')
                            "
                        />
                    </LabelledInput>
                </div>

                <div style="flex: 1; margin-left: 1.5rem">
                    <GenericWidget
                        class="input-grow"
                        :mode="EDIT"
                        :aliased-node-data="
                            currentPropertyAddress?.aliased_data?.city
                        "
                        graph-slug="heritage_site"
                        node-alias="city"
                        @update:value="updateAddress($event, 'city')"
                    />
                </div>
            </div>

            <div
                class="row"
                style="width: 100%"
            >
                <div
                    style="
                        flex: 0 0 15 rem;
                        margin-left: 0.75rem;
                        margin-bottom: 1rem;
                    "
                >
                    <GenericWidget
                        class="input-grow"
                        :mode="EDIT"
                        :aliased-node-data="
                            currentPropertyAddress?.aliased_data?.postal_code
                        "
                        graph-slug="heritage_site"
                        node-alias="postal_code"
                        @update:value="updateAddress($event, 'postal_code')"
                    />
                </div>
                <div style="flex: 1; margin-left: 1.5rem">
                    <GenericWidget
                        class="input-grow"
                        :mode="EDIT"
                        :aliased-node-data="
                            currentPropertyAddress?.aliased_data?.locality
                        "
                        graph-slug="heritage_site"
                        node-alias="locality"
                        @update:value="updateAddress($event, 'locality')"
                    />
                </div>
            </div>
            <GenericWidget
                style="margin-bottom: 1rem"
                :mode="EDIT"
                :aliased-node-data="
                    currentPropertyAddress?.aliased_data?.location_description
                "
                graph-slug="heritage_site"
                node-alias="location_description"
                @update:value="updateAddress($event, 'location_description')"
            />
        </FieldSet>
        <br />
        <div class="mt-4">
            <Button
                style="align-self: flex-start"
                class="w-fit mb-6"
                @click="saveAddress"
            >
                + Add Address
            </Button>
            <br />

            <div>
                <div
                    v-for="(address, index) in propertyAddressList"
                    :key="index"
                    class="chip-row"
                >
                    <Button
                        class="add-legal-button"
                        @click="openLegalDialog(index)"
                    >
                        + Add Legal Description
                    </Button>

                    <div class="flex flex-col flex-grow gap-2">
                        <div class="flex justify-between items-start">
                            <Chip>
                                <div class="flex items-center gap-3">
                                    <span class="font-medium text-gray-800">
                                        {{ getAddressLabel(address) }}
                                    </span>
                                    &nbsp; &nbsp;
                                    <Button
                                        icon="pi pi-pencil"
                                        text
                                        rounded
                                        size="small"
                                        style="width: 1.5rem; height: 1.5rem"
                                        aria-label="Edit"
                                        @click.stop="
                                            setCurrentPropertyAddress(index)
                                        "
                                    />
                                    <Button
                                        icon="pi pi-times"
                                        text
                                        rounded
                                        size="small"
                                        severity="danger"
                                        style="width: 1.5rem; height: 1.5rem"
                                        aria-label="Remove"
                                        @click.stop="deleteAddress(index)"
                                    />
                                </div>
                            </Chip>
                        </div>

                        <div class="w-full">
                            <ChipsList
                                :items="getLegalsForAddress(address)"
                                :display-keys="[
                                    'aliased_data.pid',
                                    'aliased_data.legal_description',
                                ]"
                                @remove="
                                    (legalIndex) =>
                                        deleteLegalDescription(
                                            index,
                                            legalIndex,
                                        )
                                "
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Form>
    <br /><br /><br /><br />

    <Dialog
        v-model:visible="addLegalDescriptionVisible"
        modal
        header="&nbsp;"
        :style="{ width: '32rem' }"
        :breakpoints="{ '960px': '90vw' }"
        :closable="true"
        :dismissableMask="false"
        @show="pidField"
    >
        <Form
            ref="legalDescriptionForm"
            v-slot="$form"
            name="legalDescriptionForm"
            :validateOnBlur="true"
            :validateOnValueUpdate="true"
            :resolver="legalAddressResolver"
        >
            <div class="flex flex-col gap-2">
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
                                :ref="pidField"
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
                                class="button-padding"
                            ></Button>
                        </div>
                    </div>
                </LabelledInput>

                <div
                    class="row"
                    style="
                        align-items: center;
                        margin-bottom: 0.25rem;
                        margin-top: 1rem;
                    "
                >
                    <label class="font-bold text-gray-700"
                        >Legal Description</label
                    >

                    <div
                        v-tooltip.top="
                            'Manually enter if not found or incorrect'
                        "
                        class="flex items-center gap-2"
                        style="margin-left: 1rem"
                    >
                        <Checkbox
                            id="overrideLegalDescription"
                            v-model="isOverrideActive"
                            binary
                            :pt="{ root: { class: 'w-4 h-4' } }"
                        />
                        <span
                            class="text-sm text-gray-600 cursor-pointer select-none"
                            >Override</span
                        >
                    </div>
                </div>

                <LabelledInput
                    input-name="legalAddress"
                    :error-message="$form.legalAddress?.error?.message"
                    :required="true"
                >
                    <fieldset
                        :disabled="!isOverrideActive"
                        style="
                            border: none;
                            padding: 0;
                            margin: 0;
                            min-width: 0;
                        "
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
                            @update:value="
                                updateLegal($event, 'legal_description')
                            "
                        />
                    </fieldset>
                </LabelledInput>
            </div>

            <div class="row mt-4">
                <Button
                    label="Save"
                    class="button-padding"
                    @click="saveLegalDescription"
                />
                <Button
                    label="Cancel"
                    severity="secondary"
                    @click="addLegalDescriptionVisible = false"
                />
            </div>
        </Form>
    </Dialog>
</template>

<style>
.row {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
}
.button-padding {
    margin-left: 1.5rem;
    margin-right: 1.5rem;
}
.chip-row {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    margin: 1.5rem;
}
.add-legal-button {
    display: flex;
    align-items: center;
    justify-content: center;
    align-self: center;
    margin-right: 3rem;
}
.input-grow {
    width: 100%;
}
</style>
