<script setup lang="ts">
import { useTemplateRef, inject, ref, onMounted } from "vue";
import type { Ref } from "vue";

import FieldSet from 'primevue/fieldset';
import InputText from 'primevue/inputtext';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';

import LabelledInput from "./LabelledInput.vue";
import LabelledCheckboxInput from "./LabelledCheckbox.vue";
import type { HeritageSite } from "@/bcrhp/schema/HeritageSiteSchema.ts";
import { requiredHeritageSiteSchema } from "@/bcrhp/schema/HeritageSiteSchema.ts";
import type { ZodError } from "zod";


const heritageSite: HeritageSite = inject('heritageSite') as HeritageSite;
const heritageSiteRef: Ref<HeritageSite> = ref(heritageSite);

type FormErrors = Partial<Record<keyof HeritageSite, string[]>>;
const errors: Ref<FormErrors> = ref<FormErrors>({});

let otherName = "";

// These names need to match the Zog schema
const fields = {
    designationDateField: useTemplateRef("designationDateField"),
    referenceNumberField: useTemplateRef("referenceNumberField"),
    legislativeActField: useTemplateRef("legislativeActField"),
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
    const key: keyof HeritageSite = field.id as keyof HeritageSite;
    const fieldValidation = requiredHeritageSiteSchema.shape[key].safeParse(heritageSiteRef.value[key]);
    if (fieldValidation.success) {
        field.classList.remove("p-invalid");
        errors.value[key] = [];
    }
    else {
        field.classList.add("p-invalid");
        errors.value[key] = (fieldValidation.error as ZodError).flatten().formErrors;
    }
    return fieldValidation.success;
};

const saveReferenceNumber = function () {
    console.log("saveReferenceNumber");
    heritageSite.otherNames.push(otherName);
    otherName = "";
};

let validateFields = false;


// This needs to be removed - added because ESLint was complaining. Need to figure out
// configuration so API methods are not
defineExpose({ isValid });

onMounted(() => {
});

</script>
<template>
    <FieldSet id="recognitionDetailsFieldset">
        <LabelledInput label="Designation or Recognition Start Date"
            hint="The date the designation or recognition was brought into effect" input-name="designationDate"
            :error-message="errors.designationDate?.join(',')" :required="true">
            <div class="p-inputtext-fluid">
                <InputText id="designationDate" ref="designationDateField" v-model="heritageSite.designationDate"
                    aria-describedby="designation-date-help" aria-required="true" fluid @change="valueChanged"
                    @focus="onFocusHandler" @focusout="onFocusOutHandler" @update:model-value="valueUpdated" />
            </div>
        </LabelledInput>
        <div class="flex flex-row">
            <LabelledInput label="Legislative Act" hint="Designation or recognition type that applies to the site"
                input-name="legislativeAct" :error-message="errors.legislativeAct?.join(',')" :required="true">
                <div class="p-inputtext-fluid">
                    <InputText id="legislativeAct" ref="legislativeActField" v-model="heritageSite.legislativeAct"
                        aria-describedby="legislative-act-help" aria-required="true" fluid @change="valueChanged"
                        @focus="onFocusHandler" @focusout="onFocusOutHandler" @update:model-value="valueUpdated" />
                </div>
            </LabelledInput>
            <div class="ml-3 mt-6">
                <LabelledCheckboxInput label="Historic Acts" hint="Show inactive acts"
                    input-name="showInactiveHistoricActs">
                    <Checkbox id="showInactiveHistoricActs" ref="showInactiveHistoricActs"
                        :model-value="!heritageSite.showInactiveHistoricActs"
                        aria-describedby="show-inactive-historic-acts-help" aria-required="false" fluid binary small />
                </LabelledCheckboxInput>
            </div>
        </div>
        <LabelledInput label="Reference Number" hint="The bylaw or resolution number" input-name="referenceNumber"
            :error-message="errors.referenceNumber?.join(',')" :required="true">
            <div>
                <InputText id="referenceNumber" ref="referenceNumberField" v-model="heritageSite.referenceNumber"
                    aria-describedby="reference-number-help" aria-required="true" fluid class="inline-block"
                    @change="valueChanged" @focus="onFocusHandler" @focusout="onFocusOutHandler"
                    @update:model-value="valueUpdated" />
                <Button id="saveReferenceNumber" label="Add" class="inline-block" @click="saveReferenceNumber"></Button>
            </div>
        </LabelledInput>
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