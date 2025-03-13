<script setup lang="ts">
import { useTemplateRef, inject, ref, onMounted } from 'vue';
import type { Ref } from 'vue';

import FieldSet from 'primevue/fieldset';
import InputText from 'primevue/inputtext';
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

let validateFields = false;

// This needs to be removed - added because ESLint was complaining. Need to figure out
// configuration so API methods are not
defineExpose({ isValid });

onMounted(() => {});
</script>
<template>
    <FieldSet
        id="chronologyFieldset"
        legend="Chronology"
    >
        <div class="p-inputtext-fluid">
            <div class="inline-block">
                <div class="flex flex-col">
                    <p class="mb-1">Event Type</p>
                    <div class="card flex flex-col">
                        <div class="flex items-center gap-2">
                            <Checkbox
                                v-model="eventType"
                                inputId="eventType1"
                                name="construction"
                                value="construction"
                            />
                            <label for="eventType1"> Construction </label>
                        </div>
                        <div class="flex items-center gap-2">
                            <Checkbox
                                v-model="eventType"
                                inputId="eventType2"
                                name="significant"
                                value="significant"
                            />
                            <label for="eventType2"> Significant </label>
                        </div>
                    </div>
                </div>
            </div>
            <LabelledInput
                label="Start Year"
                input-name="startYear"
                class="inline-block"
                :error-message="errors.startYear?.join(',')"
                :required="true"
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
            <LabelledInput
                label="End Year"
                input-name="endYear"
                class="inline-block"
                :error-message="errors.endYear?.join(',')"
                :required="true"
            >
                <div class="p-inputtext-fluid">
                    <InputText
                        id="endYear"
                        ref="endYearField"
                        v-model="heritageSite.endYear"
                        aria-describedby="end-year-help"
                        aria-required="true"
                        fluid
                        @change="valueChanged"
                        @focus="onFocusHandler"
                        @focusout="onFocusOutHandler"
                        @update:model-value="valueUpdated"
                    />
                </div>
            </LabelledInput>

            <div class="inline-block">
                <Checkbox
                    v-model="circa"
                    inputId="circa"
                    name="circa"
                    value="circa"
                />
                <label for="circa"> Circa </label>
            </div>
        </div>
        <div class="p-inputtext-fluid">
            <LabelledInput
                label="Chronology Notes (Optional)"
                hint="Enter details about the significant event"
                input-name="chronologyNotes"
                :error-message="errors.chronologyNotes?.join(',')"
            >
                <div class="">
                    <InputText
                        id="chronologyNotes"
                        ref="chronologyNotesField"
                        v-model:content="heritageSite.chronologyNotes"
                        theme="snow"
                        aria-describedby="chronology-notes-help"
                        aria-required="true"
                        fluid
                        class="inline-block"
                        @editorChange="valueChanged"
                        @focus="onFocusHandler"
                        @blur="onFocusOutHandler"
                        @update:content="valueUpdated"
                    />
                    <Button
                        id="saveChronologyNotes"
                        label="Add"
                        class="inline-block"
                        @click="addChronologyNotes"
                    ></Button>
                </div>
            </LabelledInput>
        </div>
    </FieldSet>
    <Fieldset
        id="architectsBuildersFieldset"
        class="p-fieldset p-component mt-2"
        legend="Architects / Builders"
    >
        <div class="p-inputtext-fluid">
            <LabelledInput
                label="Architect / Builder Name"
                hint="Enter the company or individual's name"
                input-name="architectOrBuilderName"
                class="inline-block"
                :error-message="errors.architectOrBuilderName?.join(',')"
                :required="true"
            >
                <div class="p-inputtext-fluid">
                    <InputText
                        id="architectOrBuilderName"
                        ref="architectOrBuilderNameField"
                        v-model="heritageSite.architectOrBuilderName"
                        aria-describedby="architect-or-builder-help"
                        aria-required="true"
                        fluid
                        @change="valueChanged"
                        @focus="onFocusHandler"
                        @focusout="onFocusOutHandler"
                        @update:model-value="valueUpdated"
                    />
                </div>
            </LabelledInput>
            <LabelledInput
                label="Type"
                input-name="architectOrBuilderType"
                :error-message="errors.architectOrBuilderType?.join(',')"
                :required="true"
            >
                <div class="p-inputtext-fluid">
                    <InputText
                        id="architectOrBuilderType"
                        ref="architectOrBuilderTypeField"
                        v-model="heritageSite.architectOrBuilderType"
                        aria-describedby="architect-or-builder-type-help"
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
        <div class="p-inputtext-fluid">
            <LabelledInput
                label="Architect / Builder Name Notes (Optional)"
                hint="Provide any additional comments about the architect/builder"
                input-name="architectOrBuilderNotes"
                :error-message="errors.architectOrBuilderNotes?.join(',')"
                :required="true"
            >
                <div class="">
                    <InputText
                        id="architectOrBuilderNotes"
                        ref="architectOrBuilderNotesField"
                        v-model="heritageSite.architectOrBuilderNotes"
                        aria-describedby="architect-or-builder-notes-help"
                        aria-required="true"
                        fluid
                        class="inline-block"
                        @change="valueChanged"
                        @focus="onFocusHandler"
                        @focusout="onFocusOutHandler"
                        @update:model-value="valueUpdated"
                    />
                    <Button
                        id="addOtherName"
                        label="Add"
                        class="inline-block"
                        @click="addArchitectOrBuilderNotes"
                    ></Button>
                </div>
            </LabelledInput>
        </div>
    </Fieldset>
    <Fieldset
        id="relatedURLsFieldset"
        class="p-fieldset p-component mt-2"
        legend="Related URLs"
    >
        <div class="flex flex-row">
            <LabelledInput
                label="URL Type"
                hint="Acceptable URL Types"
                input-name="urlType"
                :error-message="errors.urlType?.join(',')"
                :required="true"
            >
                <div class="p-inputtext-fluid">
                    <InputText
                        id="urlType"
                        ref="urlTypeField"
                        v-model="heritageSite.urlType"
                        aria-describedby="url-type-help"
                        aria-required="true"
                        fluid
                        @change="valueChanged"
                        @focus="onFocusHandler"
                        @focusout="onFocusOutHandler"
                        @update:model-value="valueUpdated"
                    />
                </div>
            </LabelledInput>
            <LabelledInput
                label="Link Text"
                hint="Enter text that describes the link"
                input-name="linkText"
                :error-message="errors.linkText?.join(',')"
                :required="true"
            >
                <div class="p-inputtext-fluid">
                    <InputText
                        id="linkText"
                        ref="linkTextField"
                        v-model="heritageSite.linkText"
                        aria-describedby="link-text-help"
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
        <div class="p-inputtext-fluid">
            <LabelledInput
                label="URL"
                hint="URL must be stable and publicly accessible"
                input-name="url"
                :error-message="errors.url?.join(',')"
                :required="true"
            >
                <div class="flex flex-row full-width">
                    <InputText
                        id="url"
                        ref="urlField"
                        v-model="heritageSite.url"
                        aria-describedby="architect-or-builder-notes-help"
                        aria-required="true"
                        fluid
                        class="inline-block"
                        @change="valueChanged"
                        @focus="onFocusHandler"
                        @focusout="onFocusOutHandler"
                        @update:model-value="valueUpdated"
                    />
                    <Button
                        id="addOtherName"
                        label="Add"
                        class="inline-block"
                        @click="addURL"
                    ></Button>
                </div>
            </LabelledInput>
        </div>
    </Fieldset>
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
.full-width {
    width: 100%;
}
</style>
