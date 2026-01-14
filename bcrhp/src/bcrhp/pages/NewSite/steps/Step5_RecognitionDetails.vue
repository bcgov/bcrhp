<script setup lang="ts">
import { useTemplateRef, inject, ref, onMounted, computed } from 'vue';
import type { Ref } from 'vue';

import FieldSet from 'primevue/fieldset';
import InputText from 'primevue/inputtext';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import { Form, type FormInstance } from '@primevue/forms';
import GenericWidget from '@/arches_component_lab/generics/GenericWidget/GenericWidget.vue';
import { EDIT } from '@/arches_component_lab/widgets/constants.ts';
import MultiValuePlaceholder from '@/bcgov_arches_common/components/multiValuePlaceholder/MultiValuePlaceholder.vue';
import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import LabelledCheckboxInput from '@/bcgov_arches_common/components/labelledinput/LabelledCheckbox.vue';
import {
    HeritageSite,
    type HeritageSiteType,
} from '@/bcrhp/schemas/heritage_site.ts';
import type { AliasedNodeData } from '@/arches_component_lab/types.ts';

import {
    isValid as baseIsValid,
    updateModelValue as baseUpdateModelValue,
} from '@/bcrhp/utils.ts';

import {
    ProtectionEventTileSchema,
    type ProtectionEventTileType,
} from '@/bcrhp/schemas/protection_event.ts';

import { zodResolver } from '@primevue/forms/resolvers/zod';

const recognitionDetailsForm: Ref<FormInstance | null> = useTemplateRef(
    'recognitionDetailsForm',
) as Ref<FormInstance | null>;

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite');
const emit = defineEmits(['update:stepIsValid']);

const currentRecognitionDetails: typeof ProtectionEventTileType = ref(
    heritageSite?.value.aliased_data.bc_right.aliased_data.protection_event ??
        {},
);
const showInactiveHistoricActs = ref(false);

const protectionEventResolver = zodResolver(
    ProtectionEventTileSchema.shape['aliased_data'],
);
const totalRecognitionDetails = ref([] as Array<string>);

const addOtherReferenceNumberDisabled = computed(
    () =>
        recognitionDetailsForm.value?.states
            ?.designation_or_protection_start_date?.pristine ||
        recognitionDetailsForm.value?.states?.legislative_act?.pristine ||
        recognitionDetailsForm.value?.states?.referenceNumber?.pristine ||
        recognitionDetailsForm.value?.states
            ?.designation_or_protection_start_date?.invalid ||
        recognitionDetailsForm.value?.states?.legislative_act?.invalid ||
        recognitionDetailsForm.value?.states?.referenceNumber?.invalid ||
        heritageSite?.value.recognitionDetails?.totalRecognitionDetails
            ?.length > 4,
);

const isValid = () => {
    return recognitionDetailsForm.value?.valid;
};

const updateModelValue = function (
    newValue: AliasedNodeData,
    attribute_name: string,
) {
    baseUpdateModelValue(
        newValue,
        attribute_name,
        heritageSite?.value.aliased_data.bc_right.aliased_data.protection_event
            .aliased_data,
        recognitionDetailsForm as Ref<FormInstance>,
    );
    emit('update:stepIsValid', isValid());
};
defineExpose({ isValid });

onMounted(() => {});
</script>
<template>
    <Form
        ref="recognitionDetailsForm"
        v-slot="$form"
        name="recognitionDetailsForm"
        :validateOnBlur="true"
        :resolver="protectionEventResolver"
    >
        <FieldSet id="recognitionDetailsFieldset">
            <LabelledInput
                label="Designation or Recognition Start Date"
                hint="The date the designation or recognition was brought into effect"
                input-name="designationDate"
                :error-message="$form.designationDate?.error?.message"
                :required="true"
            >
                <div class="p-inputtext-fluid">
                    <GenericWidget
                        :mode="EDIT"
                        :should-show-label="false"
                        :aliasedNodeData="null"
                        graph-slug="heritage_site"
                        node-alias="designation_or_protection_start_date"
                        placeholder="Select a Designation Date"
                        group-direction="column"
                        @update:value="
                            updateModelValue(
                                $event,
                                'designation_or_protection_start_date',
                            )
                        "
                    />
                </div>
            </LabelledInput>
            <LabelledInput
                label="Legislative Act"
                hint="Designation or recognition type that applies to the site"
                input-name="legislativeAct"
                :error-message="$form.legislativeAct?.error?.message"
                :required="true"
            >
                <div class="p-inputtext-fluid flex">
                    <GenericWidget
                        :mode="EDIT"
                        :should-show-label="false"
                        :aliasedNodeData="null"
                        graph-slug="heritage_site"
                        node-alias="legislative_act"
                        placeholder="Select a Legislative Act"
                        group-direction="column"
                        @update:value="
                            updateModelValue($event, 'legislative_act')
                        "
                    />
                    <div class="inline-block">
                        <LabelledCheckboxInput
                            label="Historic Acts"
                            hint="Show inactive acts"
                            input-name="showInactiveHistoricActs"
                        >
                            <Checkbox
                                id="showInactiveHistoricActs"
                                ref="showInactiveHistoricActs"
                                :model-value="showInactiveHistoricActs"
                                aria-describedby="show-inactive-historic-acts-help"
                                aria-required="false"
                                class="inline-block"
                                fluid
                                binary
                                small
                            />
                        </LabelledCheckboxInput>
                    </div>
                </div>
            </LabelledInput>
            <LabelledInput
                label="Reference Number"
                hint="The bylaw or resolution number"
                input-name="referenceNumber"
                :error-message="$form.referenceNumber?.error?.message"
                :required="true"
            >
                <InputText
                    id="referenceNumber"
                    ref="referenceNumberField"
                    v-model="currentRecognitionDetails.referenceNumber"
                    placeholder="Enter Reference Number"
                    aria-describedby="reference-number-help"
                    name="referenceNumber"
                    aria-required="true"
                    fluid
                    class="inline-block"
                />
                <Button
                    id="saveRecognitionDetails"
                    label="Add"
                    class="inline-block"
                    :disabled="addOtherReferenceNumberDisabled"
                    :aria-disabled="addOtherReferenceNumberDisabled"
                    @click="saveRecognitionDetails"
                ></Button>
            </LabelledInput>
            <MultiValuePlaceholder
                v-slot="slotProps"
                label="Reference Number"
                :showDeleteButton="true"
                :displayValues="totalRecognitionDetails"
                :deleteCallback="deleteRecognitionDetailsCallback"
            >
                <div
                    v-for="slot in slotProps"
                    :key="slot"
                    class="parent value"
                >
                    {{ slot.designationDate }} {{ slot.legislativeAct }}
                    {{ slot.referenceNumber }}
                </div>
            </MultiValuePlaceholder>
        </FieldSet>
    </Form>
</template>

<style>
.inline-block {
    display: inline-block;
    width: unset;
}

.p-inputtext-fluid.inline-block {
    width: calc(100% - 6.5rem);
    margin-right: 1rem;
}
</style>
