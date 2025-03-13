<script setup lang="ts">
import { useTemplateRef, inject, ref, onMounted } from 'vue';
import type { Ref } from 'vue';

import FieldSet from 'primevue/fieldset';
import InputText from 'primevue/inputtext';
import FileUpload from 'primevue/fileupload';
import RadioButton from 'primevue/radiobutton';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import LabelledInput from './LabelledInput.vue';
import type { HeritageSite } from '@/bcrhp/schema/HeritageSiteSchema.ts';
import { requiredCivicAddressSchema } from '@/bcrhp/schema/CivicAddressSchema.ts';
import type { ZodError } from 'zod';

const heritageSite: HeritageSite = inject('heritageSite') as HeritageSite;
const heritageSiteRef: Ref<HeritageSite> = ref(heritageSite);

type FormErrors = Partial<Record<keyof HeritageSite, string[]>>;
const errors: Ref<FormErrors> = ref<FormErrors>({});
let otherName = '';
// const otherNames = ref(string[]);

// These names need to match the Zog schema
const eventType = ref();
const circa = ref();

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
    const fieldValidation = requiredCivicAddressSchema.shape[key].safeParse(
        heritageSiteRef.value[key],
    );
    if (fieldValidation.success) {
        field.classList.remove('p-invalid');
        errors.value[key] = [];
    } else {
        field.classList.add('p-invalid');
        errors.value[key] = (
            fieldValidation.error as ZodError
        ).flatten().formErrors;
    }
    return fieldValidation.success;
};

const addChronologyNotes = function () {
    console.log('saveOtherName');
    heritageSite.otherNames.push(otherName);
    otherName = '';
};

const addArchitectOrBuilderNotes = function () {
    console.log('saveOtherName');
    heritageSite.otherNames.push(otherName);
    otherName = '';
};
const addURL = function () {
    console.log('saveOtherName');
    heritageSite.otherNames.push(otherName);
    otherName = '';
};
const onAdvancedUpload = function (event) {};

let validateFields = false;

// This needs to be removed - added because ESLint was complaining. Need to figure out
// configuration so API methods are not
defineExpose({ isValid });

onMounted(() => {});
</script>
<template>
    <FieldSet
        id="documentsFieldset"
        legend="Supporting Documents"
    >
        <div class="flex flex-row gap-4">
            <FileUpload
                name="demo[]"
                url="/api/upload"
                :multiple="true"
                accept="image/*"
                :maxFileSize="1000000"
                @upload="onAdvancedUpload($event)"
            >
                <template #empty>
                    <span>Drag and drop files to here to upload.</span>
                </template>
            </FileUpload>
            <div class="flex gap-4">
                <div class="flex flex-col gap-2">
                    <div class="flex items-center gap-2">Type</div>
                    <div class="flex items-center">
                        <RadioButton
                            v-model="ingredient"
                            inputId="documentType1"
                            name="documentType"
                            value="notificationLetter"
                        />
                        <label for="ingredient2">Notification Letter</label>
                    </div>
                    <div class="flex items-center">
                        <RadioButton
                            v-model="ingredient"
                            inputId="documentType2"
                            name="documentType"
                            value="pdfMap"
                        />
                        <label for="ingredient3">PDF Map</label>
                    </div>
                    <div class="flex items-center">
                        <RadioButton
                            v-model="ingredient"
                            inputId="documentType3"
                            name="documentType"
                            value="meetingMinutes"
                        />
                        <label for="ingredient4"
                            >Bylaw / council meeting minutes</label
                        >
                    </div>
                    <div class="flex items-center">
                        <LabelledInput
                            label="Document Description"
                            hint="Provide short description of document content"
                            input-name="documentDescription"
                            :error-message="
                                errors.documentDescription?.join(',')
                            "
                        >
                            <div class="p-inputtext-fluid">
                                <InputText
                                    id="startYear"
                                    ref="startYearField"
                                    v-model="heritageSite.startYear"
                                    aria-describedby="start-year-help"
                                    aria-required="true"
                                    fluid
                                    @change="valueChanged"
                                    @focus="onFocusHandler"
                                    @focusout="onFocusOutHandler"
                                    @update:model-value="valueUpdated"
                                />
                            </div>
                        </LabelledInput>
                    </div>
                </div>
            </div>
        </div>
    </FieldSet>
    <Fieldset
        id="submissionNotesFieldset"
        class="p-fieldset p-component mt-2"
        legend="Submission Notes (Optional)"
    >
        <LabelledInput
            input-name="submissionNotes"
            hint="Enter any additional remarks about the site submission"
        >
            <div class="p-inputtext-fluid">
                <QuillEditor
                    id="submissionNotes"
                    ref="submissionNotesField"
                    v-model:content="heritageSite.heritageValue"
                    theme="snow"
                    aria-describedby="submission-notes-help"
                    fluid
                    @editorChange="valueChanged"
                    @focus="onFocusHandler"
                    @blur="onFocusOutHandler"
                    @update:content="valueUpdated"
                />
            </div>
        </LabelledInput>
    </Fieldset>
</template>

<style></style>
