<script setup lang="ts">
import { useTemplateRef, inject, ref, computed } from 'vue';
import type { Ref } from 'vue';
import {
    getBCPostalCodeSchema,
    formatBCPostalCode,
} from '@/bcgov_arches_common/datatypes/string/validation/zod.ts';

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
import { getPidData } from '@/bcrhp/api.ts';
import { type HeritageSiteType } from '@/bcrhp/schemas/heritage_site.ts';
import { getHeritageSiteLocation } from '@/bcrhp/schemas/heritage_site/heritage_site_location.ts';
import {
    BcPropertyAddressTileSchema,
    type BcPropertyAddressTileType,
    getPropertyAddress,
} from '@/bcrhp/schemas/heritage_site/bc_property_address.ts';
import {
    type BcPropertyLegalDescriptionTileType,
    getLegalDescription,
} from '@/bcrhp/schemas/heritage_site/bc_property_legal_description.ts';
import { getFlattenResolver } from '@/bcgov_arches_common/validation-utils.ts';
import ChipsList from '@/bcrhp/pages/NewSite/steps/ChipsList.vue';
import { EDIT } from '@/arches_component_lab/widgets/constants.ts';
import { getSiteBoundary } from '@/bcrhp/schemas/heritage_site/site_boundary.ts';

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite')!;
const emit = defineEmits(['update:stepIsValid']);
const isValidatingPid = ref(false);
const currentPidLength = ref(0);
const pidSuccess = ref(false);

// Refs and state
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
    return (
        currentPropertyAddress.value?.aliased_data
            ?.bc_property_legal_description ?? []
    );
});

let currentLegalDescription: Ref<BcPropertyLegalDescriptionTileType> = ref(
    getLegalDescription(),
);
const isOverrideActive = ref(false);
const legalWidgetRef = useTemplateRef('legalWidgetRef');
const tempBoundaryData = ref<any>(null);

// Keys to force UI resets
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
    zodResolver(
        BcPropertyAddressTileSchema.shape['aliased_data'].extend({
            postal_code: getBCPostalCodeSchema(),
        }),
    ),
);

const currentAddressHasStreet = computed(() => {
    const streetVal =
        currentPropertyAddress.value?.aliased_data?.street_address
            ?.display_value || '';
    return streetVal.trim().length > 0;
});

const updateAddress = (newValue: AliasedNodeData, attribute_name: string) => {
    let sanitizedValue = newValue;

    if (attribute_name === 'postal_code') {
        const formatted = formatBCPostalCode(newValue?.display_value || '');
        sanitizedValue = {
            ...newValue,
            display_value: formatted,
            node_value: formatted,
        };
    }

    baseUpdateModelValue(
        sanitizedValue,
        attribute_name,
        currentPropertyAddress.value.aliased_data,
        propertyAddressForm as Ref<FormInstance>,
    ).then(() => {
        emit('update:stepIsValid', isValid());
    });
};

const updateLegal = (newValue: AliasedNodeData, attribute_name: string) => {
    let sanitizedValue = newValue;

    if (attribute_name === 'pid') {
        const rawValue = String(newValue?.display_value || '');
        const numericOnly = rawValue.replace(/\D/g, '');
        const limitedValue = numericOnly.slice(0, 9);
        pidSuccess.value = false;

        sanitizedValue = {
            ...newValue,
            display_value: limitedValue,
            node_value: limitedValue,
            details: [],
        };

        currentPidLength.value = limitedValue.length;
    }

    baseUpdateModelValue(
        sanitizedValue,
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
    emit('update:stepIsValid', isValid());
};

const setCurrentPropertyAddress = function (index: number) {
    currentPropertyAddress.value = propertyAddressList.value[index];
    addressFormKey.value = index;
    addingNewAddress.value = false;
};

function deleteAddress(index: number) {
    heritageSite.value.aliased_data.heritage_site_location[0].aliased_data.bc_property_address.splice(
        index,
        1,
    );
    emit('update:stepIsValid', isValid());
}

const hasAddressChanged = function () {
    hasPropertyAddress.value = !hasPropertyAddress.value;
    emit('update:stepIsValid', isValid());
};

const disableAddressSection = computed(() => !hasPropertyAddress.value);

const getAddressLabel = (addr: any) => {
    const data = addr?.aliased_data || {};

    const getString = (node: any) => {
        if (!node) return '';
        let val = '';
        if (node.display_value) val = node.display_value;
        else if (typeof node.node_value === 'string') val = node.node_value;
        else if (node.node_value?.en?.value) val = node.node_value.en.value;
        else if (typeof node === 'string') val = node;
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
    return Array.isArray(addr?.aliased_data?.bc_property_legal_description)
        ? addr.aliased_data.bc_property_legal_description
        : [];
};

function openLegalDialog(addressIndex: number) {
    legalDescriptionTargetAddress.value =
        propertyAddressList.value[addressIndex];

    currentLegalDescription.value = getLegalDescription();
    isOverrideActive.value = false;
    legalFormKey.value = nextLegalDescriptionKey.value;
    legalDescriptionForm.value?.reset();

    currentPidLength.value = 0;
    pidSuccess.value = false;

    addLegalDescriptionVisible.value = true;
    tempBoundaryData.value = null;
}

function saveLegalDescription() {
    if (legalDescriptionTargetAddress.value) {
        if (
            !legalDescriptionTargetAddress.value.aliased_data
                .bc_property_legal_description
        ) {
            legalDescriptionTargetAddress.value.aliased_data.bc_property_legal_description =
                [];
        }

        const stringPid =
            currentLegalDescription.value.aliased_data.pid.node_value;
        if (stringPid) {
            const numericPid = parseInt(stringPid);
            currentLegalDescription.value.aliased_data.pid.node_value =
                numericPid;
        }
        legalDescriptionTargetAddress.value.aliased_data.bc_property_legal_description.push(
            currentLegalDescription.value,
        );
        if (tempBoundaryData.value) {
            ensureSiteLocation();
            heritageSite.value.aliased_data.heritage_site_location[0].aliased_data.site_boundary[0].aliased_data.site_boundary =
                tempBoundaryData.value;
        }
    }

    currentLegalDescription.value = getLegalDescription();
    isOverrideActive.value = false;
    addLegalDescriptionVisible.value = false;
    legalDescriptionTargetAddress.value = null;
    tempBoundaryData.value = null;
    emit('update:stepIsValid', isValid());
}

function deleteLegalDescription(addressIndex: number, legalIndex: number) {
    const address = propertyAddressList.value[addressIndex];
    if (address && address.aliased_data.bc_property_legal_description) {
        address.aliased_data.bc_property_legal_description.splice(
            legalIndex,
            1,
        );
    }
    emit('update:stepIsValid', isValid());
}

const isValid = () => {
    if (!hasPropertyAddress.value) return true;
    return propertyAddressList.value.length > 0;
};

const ensureSiteLocation = () => {
    if (!heritageSite.value.aliased_data.heritage_site_location) {
        heritageSite.value.aliased_data.heritage_site_location = [];
    }
    if (heritageSite.value.aliased_data.heritage_site_location.length === 0) {
        heritageSite.value.aliased_data.heritage_site_location.push(
            getHeritageSiteLocation(),
        );
    }

    const location = heritageSite.value.aliased_data.heritage_site_location[0];
    if (!location.aliased_data.site_boundary) {
        location.aliased_data.site_boundary = [];
    }
    if (location.aliased_data.site_boundary.length === 0) {
        location.aliased_data.site_boundary.push(getSiteBoundary());
    }
};

const validatePID = async () => {
    const pidVal =
        currentLegalDescription.value?.aliased_data?.pid?.display_value ||
        currentLegalDescription.value?.aliased_data?.pid?.node_value;
    const pid = String(pidVal || '').replace(/\D/g, '');

    if (!pid || pid.length < 9) return;
    isValidatingPid.value = true;
    pidSuccess.value = false;

    try {
        const data = await getPidData(pid);

        if (data.boundary) {
            const geojsonValue = {
                type: 'FeatureCollection',
                features: [data.boundary],
            };
            tempBoundaryData.value = {
                display_value: 'PID Boundary',
                node_value: geojsonValue,
                details: [],
            };

            pidSuccess.value = true;
        }
        if (data.legalDescription) {
            updateLegal(
                {
                    display_value: data.legalDescription,
                    node_value: data.legalDescription,
                    details: [],
                },
                'legal_description',
            );

            const inputLd = (legalWidgetRef.value as any)?.$el?.querySelector(
                'input, textarea',
            );
            if (inputLd) {
                inputLd.value = data.legalDescription;
                inputLd.dispatchEvent(new Event('input', { bubbles: true }));
                inputLd.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
    } finally {
        isValidatingPid.value = false;
    }
};

const stringWidgetOverride = {
    widget: {
        widgetid: '',
        component: 'arches_component_lab/widgets/TextWidget/TextWidget.vue',
    },
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
                        flex: 0 0 10rem;
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
                        :error-message="$form.postal_code?.error?.message"
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
                :disabled="!currentAddressHasStreet"
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
                        + Add PID
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
                                        icon="pi pi-times-circle"
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

                        <div style="margin-top: 0.3rem">
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
        class="dialogFonts"
    >
        <Form
            ref="legalDescriptionForm"
            v-slot="$form"
            name="legalDescriptionForm"
            :validateOnBlur="true"
            :validateOnValueUpdate="true"
        >
            <div>
                <LabelledInput
                    label="Parcel Identifier (PID)"
                    hint="Click to retrieve the geospatial boundary associated with the PID."
                    input-name="parcelId"
                    :error-message="$form.parcelId?.error?.message"
                    :required="true"
                >
                    <div>
                        <div class="row">
                            <GenericWidget
                                :ref="pidField"
                                style="flex-grow: 1; margin-left: 1rem"
                                :mode="EDIT"
                                :should-show-label="false"
                                :aliased-node-data="
                                    currentLegalDescription?.aliased_data?.pid
                                "
                                :card-x-node-x-widget-data-overrides="
                                    stringWidgetOverride
                                "
                                graph-slug="heritage_site"
                                node-alias="pid"
                                @update:value="updateLegal($event, 'pid')"
                            />

                            <Button
                                id="validateParcel"
                                :label="pidSuccess ? 'Success' : 'Get Boundary'"
                                :icon="pidSuccess ? 'pi pi-check' : ''"
                                :severity="pidSuccess ? 'success' : 'primary'"
                                class="button-padding"
                                :loading="isValidatingPid"
                                :disabled="currentPidLength !== 9"
                                @click="validatePID"
                            ></Button>
                        </div>
                    </div>
                </LabelledInput>
            </div>

            <LabelledInput
                class="hidden"
                label="Legal Description"
                input-name="legalAddress"
                :error-message="$form.legalAddress?.error?.message"
                :required="true"
            >
                <fieldset :disabled="!isOverrideActive">
                    <GenericWidget
                        ref="legalWidgetRef"
                        :mode="EDIT"
                        :disabled="!isOverrideActive"
                        :should-show-label="false"
                        :aliased-node-data="
                            currentLegalDescription.aliased_data
                                .legal_description
                        "
                        graph-slug="heritage_site"
                        node-alias="legal_description"
                        @update:value="updateLegal($event, 'legal_description')"
                    />
                </fieldset>
                <div
                    v-tooltip.top="'Manually enter if not found or incorrect'"
                    style="
                        margin-left: 1rem;
                        margin-top: 0.5em;
                        display: flex;
                        align-items: center;
                    "
                >
                    <Checkbox
                        id="overrideLegalDescription"
                        v-model="isOverrideActive"
                        binary
                        :pt="{ root: { class: 'w-4 h-4' } }"
                    />
                    <span style="font-size: 18px; align-self: center"
                        >Override</span
                    >
                </div>
            </LabelledInput>

            <div class="row mt-4">
                <Button
                    label="Save"
                    class="button-padding"
                    :disabled="currentPidLength !== 9"
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
.dialogFonts {
    font-size: 1rem;
}
.dialogFonts label {
    font-size: 0.875rem;
}
.hidden {
    display: none;
}
</style>
