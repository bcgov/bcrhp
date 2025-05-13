<script setup lang="ts">
import { useTemplateRef, inject, ref, onMounted, computed } from 'vue';
import type { Ref } from 'vue';

import FieldSet from 'primevue/fieldset';
import InputText from 'primevue/inputtext';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import DatePicker from 'primevue/datepicker';
import Select from 'primevue/select';
import { Form, FormField, type FormInstance } from '@primevue/forms';
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
import { DATE_FORMAT } from '@/bcrhp/constants.ts';

const recognitionDetailsForm: Ref<FormInstance> = useTemplateRef(
    'recognitionDetailsRef',
);

const heritageSite: typeof HeritageSite = inject(
    'heritageSite',
) as typeof HeritageSite;
const heritageSiteRef: Ref<typeof HeritageSite> = ref(heritageSite);
const currentRecognitionDetails: typeof RecognitionDetails = ref(
    getRecognitionDetails(),
);
const showInactiveHistoricActs = ref(false);

const legislativeActOptions = ref([
    { name: 'Legislative Act 1', code: 'legislative_act_1' },
    { name: 'Legislative Act 2', code: 'legislative_act_2' },
]);

const designationDateResolver = zodResolver(
    RecognitionDetailsSchema.shape.designationDate,
);
const legislativeDateResolver = zodResolver(
    RecognitionDetailsSchema.shape.legislativeAct,
);
const referenceNumberResolver = zodResolver(
    RecognitionDetailsSchema.shape.referenceNumber,
);
const totalRecognitionDetails = ref([] as Array<string>);

const addOtherReferenceNumberDisabled = computed(
    () =>
        recognitionDetailsForm.value?.states?.designationDate?.pristine ||
        recognitionDetailsForm.value?.states?.legislativeAct?.pristine ||
        recognitionDetailsForm.value?.states?.referenceNumber?.pristine ||
        recognitionDetailsForm.value?.states?.designationDate?.invalid ||
        recognitionDetailsForm.value?.states?.legislativeAct?.invalid ||
        recognitionDetailsForm.value?.states?.referenceNumber?.invalid ||
        heritageSiteRef.value.recognitionDetails?.totalRecognitionDetails
            ?.length > 4,
);

const isValid = () => {
    return recognitionDetailsForm.value.valid;
};

const saveRecognitionDetails = function () {
    console.log('saveRecognitionDetails');
    heritageSiteRef.value.recognitionDetails.totalRecognitionDetails.push({
        designationDate:
            currentRecognitionDetails.value.designationDate.toLocaleDateString(
                'en-CA',
                {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                },
            ),
        legislativeAct: currentRecognitionDetails.value.legislativeAct,
        referenceNumber: currentRecognitionDetails.value.referenceNumber,
    });

    currentRecognitionDetails.value.designationDate = null;
    currentRecognitionDetails.value.legislativeAct = '';
    currentRecognitionDetails.value.referenceNumber = '';
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
        ref="recognitionDetailsRef"
        v-slot="$form"
        name="recognitionDetailsRef"
        :validateOnBlur="true"
    >
        <FieldSet id="recognitionDetailsFieldset">
            <FormField
                :resolver="designationDateResolver"
                name="designationDate"
            >
                <LabelledInput
                    label="Designation or Recognition Start Date"
                    hint="The date the designation or recognition was brought into effect"
                    input-name="designationDate"
                    :error-message="$form.designationDate?.error?.message"
                    :required="true"
                >
                    <div class="p-inputtext-fluid">
                        <DatePicker
                            id="designationDate"
                            ref="designationDateField"
                            v-model="currentRecognitionDetails.designationDate"
                            name="designationDate"
                            :dateFormat="DATE_FORMAT"
                            showIcon
                            aria-describedby="designation-date-help"
                            aria-required="true"
                        />
                    </div>
                </LabelledInput>
            </FormField>
            <FormField
                :resolver="legislativeDateResolver"
                name="legislativeAct"
            >
                <LabelledInput
                    label="Legislative Act"
                    hint="Designation or recognition type that applies to the site"
                    input-name="legislativeAct"
                    :error-message="$form.legislativeAct?.error?.message"
                    :required="true"
                >
                    <div class="p-inputtext-fluid flex">
                        <Select
                            id="legislativeAct"
                            ref="legislativeActField"
                            v-model="currentRecognitionDetails.legislativeAct"
                            name="legislativeAct"
                            optionValue="code"
                            optionLabel="name"
                            placeholder="Select Legislative Act"
                            :options="legislativeActOptions"
                            aria-describedby="legislative-act-help"
                            aria-required="true"
                            fluid
                            class="w-full md:w-14rem"
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
            </FormField>
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
