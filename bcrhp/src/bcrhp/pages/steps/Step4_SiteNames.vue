<script setup lang="ts">
import { useTemplateRef, inject, ref, onMounted } from 'vue';
import type { Ref } from 'vue';

import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import type { HeritageSite } from '@/bcrhp/schema/HeritageSiteSchema.ts';
import type { ZodError } from 'zod';

import { requiredHeritageSiteSchema } from '@/bcrhp/schema/HeritageSiteSchema.ts';

const heritageSite: typeof HeritageSite = inject(
    'heritageSite',
) as typeof HeritageSite;
const heritageSiteRef: Ref<typeof HeritageSite> = ref(heritageSite);

type FormErrors = Partial<Record<keyof typeof HeritageSite, string[]>>;
const errors: Ref<FormErrors> = ref<FormErrors>({});

let otherName = '';
// const otherNames = ref(string[]);

// These names need to match the Zog schema
const fields = {
    streetAddressField: useTemplateRef('commonNameField'),
    otherNameField: useTemplateRef('otherNameField'),
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
    const key: keyof typeof HeritageSite =
        field.id as keyof typeof HeritageSite;
    const fieldValidation = requiredHeritageSiteSchema.shape[key].safeParse(
        heritageSiteRef.value[key],
    );

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

const saveOtherName = function () {
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
    <div class="flex flex-col">
        <LabelledInput
            label="Common Name"
            hint="The common name is the most recognizable name for the site"
            input-name="commonName"
            :error-message="errors.commonName?.join(',')"
            :required="true"
        >
            <div class="p-inputtext-fluid">
                <InputText
                    id="commonName"
                    ref="commonNameField"
                    v-model="heritageSite.commonName"
                    aria-describedby="username-help"
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
            label="Other Names (Optional)"
            hint="Click Add to enter one or more additional names as applicable"
            input-name="otherName"
            :error-message="errors.otherNames?.join(',')"
        >
            <div>
                <InputText
                    id="otherName"
                    ref="otherNameField"
                    v-model="otherName"
                    aria-describedby="other-name-help"
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
                    @click="saveOtherName"
                ></Button>
            </div>
        </LabelledInput>
    </div>
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
