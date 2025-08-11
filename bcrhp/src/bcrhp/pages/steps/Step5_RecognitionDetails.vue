<script setup lang="ts">
import { useTemplateRef, inject, ref, onMounted, computed } from 'vue';
import type { Ref } from 'vue';

import FieldSet from 'primevue/fieldset';
import InputText from 'primevue/inputtext';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import DatePickerWidget from '@/arches_component_lab/widgets/DatePickerWidget/DatePickerWidget.vue';
import { Form, FormField, type FormInstance } from '@primevue/forms';
import ResourceInstanceSelectWidget from '@/arches_component_lab/widgets/ResourceInstanceSelectWidget/ResourceInstanceSelectWidget.vue';
import { EDIT } from '@/arches_component_lab/widgets/constants.ts';
import MultiValuePlaceholder from '@/bcgov_arches_common/components/multiValuePlaceholder/MultiValuePlaceholder.vue';
import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import LabelledCheckboxInput from '@/bcgov_arches_common/components/labelledinput/LabelledCheckbox.vue';
import type { HeritageSite } from '@/bcrhp/schema/HeritageSiteSchema.ts';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import {
    RecognitionDetailsSchema,
    RecognitionDetails,
    getRecognitionDetails,
} from '@/bcrhp/schema/RecognitionDetailsSchema.ts';

const recognitionDetailsForm: Ref<FormInstance | null> = useTemplateRef(
    'recognitionDetailsForm',
) as Ref<FormInstance | null>;

const heritageSite: typeof HeritageSite = inject(
    'heritageSite',
) as typeof HeritageSite;
const heritageSiteRef: Ref<typeof HeritageSite> = ref(heritageSite);
const currentRecognitionDetails: typeof RecognitionDetails = ref(
    getRecognitionDetails(),
);
const showInactiveHistoricActs = ref(false);

const designationDateResolver = zodResolver(
    RecognitionDetailsSchema.shape.designationDate,
);
const legislativeActResolver = zodResolver(
    RecognitionDetailsSchema.shape.legislativeAct,
);
const referenceNumberResolver = zodResolver(
    RecognitionDetailsSchema.shape.referenceNumber,
);
const totalRecognitionDetails = ref([] as Array<string>);

const addOtherReferenceNumberDisabled = computed(
    () =>
        recognitionDetailsForm.value?.states?.designation_date?.pristine ||
        recognitionDetailsForm.value?.states?.legislative_act?.pristine ||
        recognitionDetailsForm.value?.states?.referenceNumber?.pristine ||
        recognitionDetailsForm.value?.states?.designation_date?.invalid ||
        recognitionDetailsForm.value?.states?.legislative_act?.invalid ||
        recognitionDetailsForm.value?.states?.referenceNumber?.invalid ||
        heritageSiteRef.value.recognitionDetails?.totalRecognitionDetails
            ?.length > 4,
);

const isValid = () => {
    return recognitionDetailsForm.value?.valid;
};

const saveRecognitionDetails = function () {
    console.log('saveRecognitionDetails');
    heritageSiteRef.value.recognitionDetails.totalRecognitionDetails.push({
        designationDate: currentRecognitionDetails.value.designationDate,
        legislativeAct:
            recognitionDetailsForm?.value?.states.legislative_act.value,
        referenceNumber: currentRecognitionDetails.value.referenceNumber,
    });

    recognitionDetailsForm?.value?.reset();
};

const deleteRecognitionDetailsCallback = function (index: number) {
    heritageSiteRef.value.recognitionDetails.totalRecognitionDetails.splice(
        index,
        1,
    );
};

// This needs to be removed - added because ESLint was complaining. Need to figure out
// configuration so API methods are not
defineExpose({ isValid });

onMounted(() => {
    heritageSiteRef.value.recognitionDetails = currentRecognitionDetails;
    heritageSiteRef.value.recognitionDetails.totalRecognitionDetails =
        totalRecognitionDetails;
});
</script>
<template>
    <Form
        ref="recognitionDetailsForm"
        v-slot="$form"
        name="recognitionDetailsForm"
        :validateOnBlur="true"
    >
        <FieldSet id="recognitionDetailsFieldset">
            <FormField
                :resolver="designationDateResolver"
                name="designationDate"
            >
                <DatePickerWidget
                    :mode="EDIT"
                    :value="currentRecognitionDetails.designationDate"
                    graph-slug="heritage_site"
                    node-alias="designation_or_protection_start_date"
                    :show-label="true"
                />
            </FormField>
            <LabelledInput
                label="Legislative Act"
                hint="Designation or recognition type that applies to the site"
                input-name="legislativeAct"
                :error-message="$form.legislativeAct?.error?.message"
                :required="true"
            >
                <div class="p-inputtext-fluid flex">
                    <ResourceInstanceSelectWidget
                        :show-label="false"
                        :mode="EDIT"
                        :initial-value="null"
                        graph-slug="heritage_site"
                        node-alias="legislative_act"
                        :business-validator="legislativeActResolver"
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
            <FormField
                :resolver="referenceNumberResolver"
                name="referenceNumber"
            >
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
            </FormField>
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
