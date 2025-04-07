<script setup lang="ts">
import { useTemplateRef, inject, ref, onMounted } from 'vue';
import type { Ref } from 'vue';

import InputText from 'primevue/inputtext';
import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import Editor from 'primevue/editor';
import type { HeritageSite } from '@/bcrhp/schema/HeritageSiteSchema.ts';
import {
    StatementOfSignificance,
    requiredStatementOfSignificanceSchema,
} from '@/bcrhp/schema/StatementOfSignificanceSchema.ts';
import type { ZodError } from 'zod';

const heritageSite: typeof HeritageSite = inject(
    'heritageSite',
) as typeof HeritageSite;
const heritageSiteRef: Ref<typeof HeritageSite> = ref(heritageSite);

type FormErrors = Partial<Record<keyof typeof HeritageSite, string[]>>;
const errors: Ref<FormErrors> = ref<FormErrors>({});

// These names need to match the Zog schema
const fields = {
    descriptionField: useTemplateRef('descriptionField'),
    heritageValueField: useTemplateRef('heritageValueField'),
    definingElementsField: useTemplateRef('definingElementsField'),
    documentLocationField: useTemplateRef('documentLocationField'),
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
    console.log(`ID: ${field}`);

    const key: keyof typeof StatementOfSignificance =
        field.id as keyof typeof StatementOfSignificance;
    const fieldValidation = requiredStatementOfSignificanceSchema.shape[
        key
    ].safeParse(heritageSiteRef.value[key]);

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

let validateFields = false;

// This needs to be removed - added because ESLint was complaining. Need to figure out
// configuration so API methods are not
defineExpose({ isValid });

onMounted(() => {});
</script>
<template>
    <div>
        <LabelledInput
            label="Description"
            hint="Briefly describe the site as it exists today, where it is located (including province) and its physical extent and contributing resources"
            input-name="description"
            :error-message="errors.description?.join(',')"
            :required="true"
        >
            <div class="p-inputtext-fluid">
                <Editor
                    id="description"
                    ref="descriptionField"
                    v-model="heritageSite.statementOfSignificance.description"
                    theme="snow"
                    aria-describedby="description-help"
                    aria-required="true"
                    fluid
                    @editorChange="valueChanged"
                    @focus="onFocusHandler"
                    @blur="onFocusOutHandler"
                    @update:content="valueUpdated"
                />
            </div>
        </LabelledInput>
        <LabelledInput
            label="Heritage Value"
            hint="Describe why the place is valued by the community and identify which heritage values the official recognition is based on"
            input-name="heritageValue"
            :error-message="errors.heritageValue?.join(',')"
            :required="true"
        >
            <div class="p-inputtext-fluid">
                <Editor
                    id="heritageValue"
                    ref="heritageValueField"
                    v-model="heritageSite.statementOfSignificance.heritageValue"
                    theme="snow"
                    aria-describedby="heritage-value-help"
                    aria-required="true"
                    fluid
                    @editorChange="valueChanged"
                    @focus="onFocusHandler"
                    @blur="onFocusOutHandler"
                    @update:content="valueUpdated"
                />
            </div>
        </LabelledInput>
        <LabelledInput
            label="Character-Defining Elements"
            hint="List the key features of the heritage site that contribute to its heritage value in bullet-point format"
            input-name="definingElements"
            :error-message="errors.definingElements?.join(',')"
            :required="true"
        >
            <div class="p-inputtext-fluid">
                <Editor
                    id="definingElements"
                    ref="definingElementsField"
                    v-model="
                        heritageSite.statementOfSignificance.definingElements
                    "
                    theme="snow"
                    aria-describedby="defining-elements-help"
                    aria-required="true"
                    fluid
                    @editorChange="valueChanged"
                    @focus="onFocusHandler"
                    @blur="onFocusOutHandler"
                    @update:content="valueUpdated"
                />
            </div>
        </LabelledInput>
        <LabelledInput
            label="Document Location"
            hint="Enter the government or department name where the original document was created"
            input-name="documentLocation"
            :error-message="errors.documentLocation?.join(',')"
            :required="true"
        >
            <div>
                <InputText
                    id="documentLocation"
                    ref="documentLocationField"
                    v-model="
                        heritageSite.statementOfSignificance.documentLocation
                    "
                    aria-describedby="document-location-help"
                    aria-required="true"
                    fluid
                    class="inline-block"
                    @change="valueChanged"
                    @focus="onFocusHandler"
                    @focusout="onFocusOutHandler"
                    @update:model-value="valueUpdated"
                />
            </div>
        </LabelledInput>
    </div>
</template>

<style>
.inline-block {
    display: inline-block;
    width: unset;
}

.ql-editor {
    min-height: 200px;
}
</style>
