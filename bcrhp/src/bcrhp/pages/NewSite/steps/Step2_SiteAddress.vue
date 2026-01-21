<script setup lang="ts">
import { useTemplateRef, inject, ref, onMounted, computed } from 'vue';
import type { Ref } from 'vue';

// PrimeVue Imports
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';
import InputText from 'primevue/inputtext';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import Divider from 'primevue/divider';
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
    getPropertyAddress,
} from '@/bcrhp/schemas/heritage_site/bc_property_address.ts';
import {
    BcPropertyLegalDescriptionTileSchema,
    getLegalDescription,
    type BcPropertyLegalDescriptionTileType,
} from '@/bcrhp/schemas/heritage_site/bc_property_legal_description.ts';
import { getFlattenResolver } from '@/bcgov_arches_common/validation-utils.ts';

type UIAddressBlock = ReturnType<typeof getPropertyAddress> & {
    _uiId: string;
    legalDescriptions: (BcPropertyLegalDescriptionTileType & {
        _uiId: string;
    })[];
};

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite');
const emit = defineEmits(['update:stepIsValid']);
const civicFormRefs = ref(new Map<string, FormInstance>());
const legalFormRefs = ref(new Map<string, FormInstance>());

const setCivicFormRef = (el: any, id: string) => {
    if (el) civicFormRefs.value.set(id, el);
};

const setLegalFormRef = (el: any, id: string) => {
    if (el) legalFormRefs.value.set(id, el);
};

const hasGlobalCivicAddress = ref(true);

//helper functions
function generateId() {
    return Math.random().toString(36).substring(2, 9);
}

function createEmptyLegal() {
    const data = getLegalDescription();
    return { ...data, _uiId: generateId() };
}

function createEmptyAddressBlock(): UIAddressBlock {
    const civic = getPropertyAddress();
    return {
        ...civic,
        _uiId: generateId(),
        legalDescriptions: [createEmptyLegal()],
    };
}

//state
const addressBlocks = ref<UIAddressBlock[]>([createEmptyAddressBlock()]);

//validation resolvers
const propertyAddressResolver = getFlattenResolver(
    zodResolver(BcPropertyAddressTileSchema.shape['aliased_data']),
);

const legalAddressResolver = getFlattenResolver(
    zodResolver(BcPropertyLegalDescriptionTileSchema.shape['aliased_data']),
);

//actions
const addCivicAddress = () => {
    addressBlocks.value.unshift(createEmptyAddressBlock());
};

const removeCivicAddress = (index: number) => {
    const id = addressBlocks.value[index]._uiId;
    civicFormRefs.value.delete(id);
    addressBlocks.value.splice(index, 1);
};

const addLegalDescription = (addressBlock: UIAddressBlock) => {
    addressBlock.legalDescriptions.push(createEmptyLegal());
};

const removeLegalDescription = (
    addressBlock: UIAddressBlock,
    legalIndex: number,
) => {
    const id = addressBlock.legalDescriptions[legalIndex]._uiId;
    legalFormRefs.value.delete(id);
    addressBlock.legalDescriptions.splice(legalIndex, 1);
};

const toggleGlobalAddress = () => {
    hasGlobalCivicAddress.value = !hasGlobalCivicAddress.value;
};

//update logic
const updateCivicValue = function (
    newValue: AliasedNodeData,
    attribute_name: string,
    block: UIAddressBlock,
) {
    const targetFormRef = computed(() => civicFormRefs.value.get(block._uiId));

    baseUpdateModelValue(
        newValue,
        attribute_name,
        block.aliased_data,
        targetFormRef as Ref<FormInstance>,
    );
    emit('update:stepIsValid', isValid());
};

const isValid = () => {
    return true;
};

const getData = () => {
    return {
        hasCivicAddress: hasGlobalCivicAddress.value,
        addresses: addressBlocks.value.map((block) => {
            const { _uiId, legalDescriptions, ...civicData } = block;
            return {
                ...civicData,
                legalDescriptions: legalDescriptions.map((l) => {
                    const { _uiId: lId, ...lData } = l;
                    return lData;
                }),
            };
        }),
    };
};

onMounted(() => {});

defineExpose({ isValid, getData });
</script>

<template>
    <div class="flex flex-col gap-6">
        <div
            class="bg-surface-0 dark:bg-surface-900 p-4 border border-surface-200 dark:border-surface-700 rounded-lg shadow-sm"
        >
            <LabelledCheckboxInput
                label="This site does not have a Street Address"
                hint="Check if the site doesn't have a Street Address"
                input-name="hasCivicAddress"
            >
                <Checkbox
                    id="hasGlobalCivicAddress"
                    :model-value="!hasGlobalCivicAddress"
                    binary
                    small
                    @change="toggleGlobalAddress"
                />
            </LabelledCheckboxInput>
        </div>

        <div class="flex justify-end border-b border-gray-200 pb-4">
            <Button
                label="Add Another Civic Address"
                icon="pi pi-plus"
                severity="primary"
                outlined
                :disabled="!hasGlobalCivicAddress"
                @click="addCivicAddress"
            />
        </div>

        <div
            v-for="(block, index) in addressBlocks"
            :key="block._uiId"
            class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg p-4 shadow-sm"
        >
            <Accordion value="0">
                <AccordionPanel value="0">
                    <AccordionHeader
                        class="custom-accordion-header"
                        :pt="{
                            toggleIcon: { style: 'color: white;' },
                        }"
                    >
                        <div
                            class="flex items-center justify-between w-full mr-4 pl-4"
                        >
                            <span class="font-bold text-lg"
                                >Civic Address {{ index + 1 }}</span
                            >
                            <Button
                                v-if="addressBlocks.length > 1"
                                class="delete-button"
                                icon="pi pi-trash"
                                text
                                severity="danger"
                                rounded
                                aria-label="Remove Address"
                                @click.stop="removeCivicAddress(index)"
                            />
                        </div>
                    </AccordionHeader>

                    <AccordionContent>
                        <Form
                            :ref="(el) => setCivicFormRef(el, block._uiId)"
                            :name="`civicAddressForm_${block._uiId}`"
                            :validateOnBlur="true"
                            :validateOnValueUpdate="true"
                            :resolver="propertyAddressResolver"
                            v-slot="$form"
                        >
                            <div
                                :inert="!hasGlobalCivicAddress"
                                :class="{
                                    'p-disabled opacity-50':
                                        !hasGlobalCivicAddress,
                                }"
                                class="flex flex-col gap-4 transition-opacity duration-200"
                            >
                                <LabelledInput
                                    label="Street Address"
                                    input-name="street_address"
                                    :error-message="
                                        $form.streetAddress?.error?.message
                                    "
                                    :required="true"
                                >
                                    <GenericWidget
                                        :mode="EDIT"
                                        :should-show-label="false"
                                        :aliased-node-data="
                                            block.aliased_data?.street_address
                                        "
                                        graph-slug="heritage_site"
                                        node-alias="street_address"
                                        @update:value="
                                            updateCivicValue(
                                                $event,
                                                'street_address',
                                                block,
                                            )
                                        "
                                    />
                                </LabelledInput>

                                <GenericWidget
                                    :mode="EDIT"
                                    :aliased-node-data="
                                        block.aliased_data?.city
                                    "
                                    graph-slug="heritage_site"
                                    node-alias="city"
                                    @update:value="
                                        updateCivicValue($event, 'city', block)
                                    "
                                />

                                <GenericWidget
                                    :mode="EDIT"
                                    :aliased-node-data="
                                        block.aliased_data?.postal_code
                                    "
                                    graph-slug="heritage_site"
                                    node-alias="postal_code"
                                    @update:value="
                                        updateCivicValue(
                                            $event,
                                            'postal_code',
                                            block,
                                        )
                                    "
                                />

                                <GenericWidget
                                    :mode="EDIT"
                                    :aliased-node-data="
                                        block.aliased_data?.location_description
                                    "
                                    graph-slug="heritage_site"
                                    node-alias="location_description"
                                    @update:value="
                                        updateCivicValue(
                                            $event,
                                            'location_description',
                                            block,
                                        )
                                    "
                                />

                                <GenericWidget
                                    :mode="EDIT"
                                    :aliased-node-data="
                                        block.aliased_data?.locality
                                    "
                                    graph-slug="heritage_site"
                                    node-alias="locality"
                                    @update:value="
                                        updateCivicValue(
                                            $event,
                                            'locality',
                                            block,
                                        )
                                    "
                                />
                            </div>

                            <Divider
                                align="left"
                                type="solid"
                                class="my-6"
                            >
                                <span
                                    class="text-sm font-semibold text-gray-500 uppercase tracking-wider"
                                    >Associated Legal Descriptions</span
                                >
                            </Divider>

                            <div
                                class="pl-4 border-l-4 border-surface-100 dark:border-surface-800"
                            >
                                <Accordion
                                    multiple
                                    :value="['0']"
                                >
                                    <AccordionPanel
                                        v-for="(
                                            legal, lIndex
                                        ) in block.legalDescriptions"
                                        :key="legal._uiId"
                                        :value="lIndex.toString()"
                                    >
                                        <AccordionHeader
                                            class="custom-accordion-header"
                                            :pt="{
                                                toggleIcon: {
                                                    style: 'color: white;',
                                                },
                                            }"
                                        >
                                            <div>
                                                <span>
                                                    Legal Description
                                                    {{ lIndex + 1 }}
                                                    <span v-if="legal.parcelId">
                                                        (PID:
                                                        {{ legal.parcelId }})
                                                    </span>
                                                </span>
                                                <Button
                                                    class="delete-button"
                                                    icon="pi pi-trash"
                                                    text
                                                    severity="danger"
                                                    rounded
                                                    size="small"
                                                    @click.stop="
                                                        removeLegalDescription(
                                                            block,
                                                            lIndex,
                                                        )
                                                    "
                                                />
                                            </div>
                                        </AccordionHeader>
                                        <AccordionContent>
                                            <Form
                                                :ref="
                                                    (el) =>
                                                        setLegalFormRef(
                                                            el,
                                                            legal._uiId,
                                                        )
                                                "
                                                :name="`legalForm_${legal._uiId}`"
                                                :resolver="legalAddressResolver"
                                                v-slot="$legalForm"
                                            >
                                                <div
                                                    :inert="
                                                        !hasGlobalCivicAddress
                                                    "
                                                    :class="{
                                                        'p-disabled opacity-50':
                                                            !hasGlobalCivicAddress,
                                                    }"
                                                    class="flex flex-col gap-4"
                                                >
                                                    <LabelledInput
                                                        label="Parcel Identifier (PID)"
                                                        hint="Click Validate to generate the legal description"
                                                        input-name="parcelId"
                                                        :error-message="
                                                            $legalForm.parcelId
                                                                ?.error?.message
                                                        "
                                                    >
                                                        <div
                                                            class="p-inputtext-fluid flex items-center gap-2"
                                                        >
                                                            <InputText
                                                                v-model="
                                                                    legal.parcelId
                                                                "
                                                                fluid
                                                                class="flex-grow"
                                                            />
                                                            <Button
                                                                label="Validate"
                                                                size="small"
                                                                outlined
                                                            />
                                                        </div>
                                                    </LabelledInput>

                                                    <LabelledCheckboxInput
                                                        label="Override Legal Description"
                                                        hint="Manually enter if not found or incorrect"
                                                        input-name="overrideLegalDescription"
                                                    >
                                                        <Checkbox
                                                            v-model="
                                                                legal.overrideLegalDescription
                                                            "
                                                            binary
                                                            small
                                                        />
                                                    </LabelledCheckboxInput>

                                                    <LabelledInput
                                                        label="Legal Address"
                                                        hint="If the Legal Address is not found or incorrect, enter it here"
                                                        input-name="legalAddress"
                                                        :error-message="
                                                            $legalForm
                                                                .legalAddress
                                                                ?.error?.message
                                                        "
                                                    >
                                                        <InputText
                                                            v-model="
                                                                legal.legalAddress
                                                            "
                                                            :disabled="
                                                                !legal.overrideLegalDescription
                                                            "
                                                            fluid
                                                        />
                                                    </LabelledInput>
                                                </div>
                                            </Form>
                                        </AccordionContent>
                                    </AccordionPanel>
                                </Accordion>

                                <div class="mt-4">
                                    <Button
                                        label="Add Legal Description"
                                        icon="pi pi-plus"
                                        size="small"
                                        severity="secondary"
                                        text
                                        :disabled="!hasGlobalCivicAddress"
                                        @click="addLegalDescription(block)"
                                    />
                                </div>
                            </div>
                        </Form>
                    </AccordionContent>
                </AccordionPanel>
            </Accordion>
        </div>
    </div>
</template>

<style>
.custom-accordion-header {
    background-color: #003366;
    border: none;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    color: #fff;
    font-size: 0.95rem;
}

.delete-button {
    margin-left: auto;
}
.delete-button:hover {
    background-color: rgba(242, 3, 3, 0.875) !important;
}
</style>
