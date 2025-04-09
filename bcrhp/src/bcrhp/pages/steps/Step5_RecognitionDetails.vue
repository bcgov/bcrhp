<script setup lang="ts">
import { useTemplateRef, inject, ref, onMounted } from 'vue';
import type { Ref } from 'vue';

import FieldSet from 'primevue/fieldset';
import InputText from 'primevue/inputtext';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import DatePicker from 'primevue/datepicker';
import Select from 'primevue/select';

import MultiValuePlaceholder from '@/bcgov_arches_common/components/multiValuePlaceholder/MultiValuePlaceholder.vue';
import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import LabelledCheckboxInput from '@/bcgov_arches_common/components/labelledinput/LabelledCheckbox.vue';
import type { HeritageSite } from '@/bcrhp/schema/HeritageSiteSchema.ts';
import {
    RecognitionDetails,
    requiredRecognitionDetailsSchema,
} from '@/bcrhp/schema/RecognitionDetailsSchema.ts';

import type { ZodError } from 'zod';

const heritageSite: typeof HeritageSite = inject(
    'heritageSite',
) as typeof HeritageSite;
const heritageSiteRef: Ref<typeof HeritageSite> = ref(heritageSite);

type FormErrors = Partial<Record<keyof typeof HeritageSite, string[]>>;

const errors: Ref<FormErrors> = ref<FormErrors>({});
const legislativeActOptions = ref([
    { name: 'Legislative Act 1', code: 'legislative_act_1' },
    { name: 'Legislative Act 2', code: 'legislative_act_2' },
]);
const designationDate = ref();
const legislativeAct = ref('');
const referenceNumber = ref('');
const totalRecognitionDetails = ref([] as Array<string>);
const addOtherReferenceNumberDisabled = ref(false);

// These names need to match the Zog schema
const fields = {
    designationDateField: useTemplateRef('designationDateField'),
    referenceNumberField: useTemplateRef('referenceNumberField'),
    legislativeActField: useTemplateRef('legislativeActField'),
};

const isValid = () => {
    // We don't want to validate fields the first time we show the step
    if (!validateFields) {
        validateFields = true;
        return true;
    }
    let valid = true;

    for (const field of Object.values(fields) as Array<Ref>) {
        valid = validateField(field?.value.$el as HTMLInputElement) && valid;
    }
    return valid;
};

const updateAddOtherRecognitionDetails = function () {
    addOtherReferenceNumberDisabled.value =
        totalRecognitionDetails.value.length < 1 ||
        heritageSiteRef.value.recognitionDetails.totalRecognitionDetails
            .length > 4;
};

const valueUpdated = function (value: string | undefined) {
    console.log(`valueUpdated: ${value}`);
};

const valueChanged = function (event: Event) {
    console.log(`valueChanged`);
    validateField(event.target as HTMLInputElement);
};

const onFocusHandler = function (event: Event) {
    console.log(`onFocusHandler ${event}`);
    // (event.target as HTMLInputElement).classList.remove("p-invalid");
};

const onFocusOutHandler = function (event: Event) {
    console.log(`onFocusOutHandler`);
    validateField(event.target as HTMLInputElement);
    // (event.target as HTMLInputElement).classList.remove("p-invalid");
};

const validateField = function (field: HTMLInputElement) {
    console.log(`ID: ${field.id}`);

    const key: keyof typeof RecognitionDetails =
        field.id as keyof typeof RecognitionDetails;
    const fieldValidation = requiredRecognitionDetailsSchema.shape[
        key
    ].safeParse(heritageSiteRef.value.recognitionDetails[key]);

    if (fieldValidation.success) {
        field.classList.remove('p-invalid');
        errors.value[key] = [];
    } else {
        field.classList.add('p-invalid');
        errors.value[key] = (
            fieldValidation.error as typeof ZodError
        ).flatten().formErrors;
    }

    return fieldValidation.success;
};

const saveRecognitionDetails = function () {
    console.log('saveRecognitionDetails');
    heritageSiteRef.value.recognitionDetails.totalRecognitionDetails.push({
        designationDate: designationDate.value,
        legislativeAct: legislativeAct.value,
        referenceNumber: referenceNumber.value,
    });

    updateAddOtherRecognitionDetails();
};

const deleteRecognitionDetailsCallback = function (index: number) {
    heritageSiteRef.value.recognitionDetails.totalRecognitionDetails.splice(
        index,
        1,
    );

    updateAddOtherRecognitionDetails();
};

let validateFields = false;

// This needs to be removed - added because ESLint was complaining. Need to figure out
// configuration so API methods are not
defineExpose({ isValid });

onMounted(() => {
    heritageSiteRef.value.recognitionDetails.totalRecognitionDetails =
        totalRecognitionDetails;

    updateAddOtherRecognitionDetails();
});
</script>
<template>
    <FieldSet id="recognitionDetailsFieldset">
        <LabelledInput
            label="Designation or Recognition Start Date"
            hint="The date the designation or recognition was brought into effect"
            input-name="designationDate"
            :error-message="errors.designationDate?.join(',')"
            :required="true"
        >
            <div class="p-inputtext-fluid">
                <DatePicker
                    id="designationDate"
                    ref="designationDateField"
                    v-model="designationDate"
                    dateFormat="dd/mm/yy"
                    aria-describedby="designation-date-help"
                    aria-required="true"
                />
            </div>
        </LabelledInput>
        <LabelledInput
            label="Legislative Act"
            hint="Designation or recognition type that applies to the site"
            input-name="legislativeAct"
            :error-message="errors.legislativeAct?.join(',')"
            :required="true"
        >
            <div class="p-inputtext-fluid flex">
                <Select
                    id="legislativeAct"
                    ref="legislativeActField"
                    v-model="legislativeAct"
                    optionLabel="name"
                    placeholder="Select Legislative Act"
                    :options="legislativeActOptions"
                    aria-describedby="legislative-act-help"
                    aria-required="true"
                    fluid
                    class="w-full md:w-14rem"
                    @update:model-value="valueUpdated"
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
                            :model-value="
                                !heritageSite.showInactiveHistoricActs
                            "
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
            :error-message="errors.totalRecognitionDetails?.join(',')"
            :required="true"
        >
            <div>
                <InputText
                    id="referenceNumber"
                    ref="referenceNumberField"
                    v-model="referenceNumber"
                    aria-describedby="reference-number-help"
                    aria-required="true"
                    fluid
                    class="inline-block"
                    @change="valueChanged"
                    @focus="onFocusHandler"
                    @focusout="onFocusOutHandler"
                    @update:model-value="valueUpdated"
                />
            </div>
            <Button
                id="saveRecognitionDetails"
                label="Add"
                class="inline-block"
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
                {{ slot.designationDate }} {{ slot.legislativeAct?.name }}
                {{ slot.referenceNumber }}
            </div>
        </MultiValuePlaceholder>
    </FieldSet>
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
