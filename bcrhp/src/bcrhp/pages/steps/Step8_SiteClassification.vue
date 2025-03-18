<script setup lang="ts">
import { useTemplateRef, inject, ref, onMounted } from 'vue';
import type { Ref } from 'vue';

import FieldSet from 'primevue/fieldset';
import InputText from 'primevue/inputtext';
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
const fields = {
    numberOfResourcesField: useTemplateRef('numberOfResourcesField'),
    heritageThemeField: useTemplateRef('heritageThemeField'),
};
const heritageCategory = ref();
const ownership = ref();
const functionCategoryCurrent = ref();
const functionCategoryHistoric = ref();

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

const addContributingSource = function () {
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
        id="heritageDetailsFieldset"
        legend="Heritage Class"
    >
        <LabelledInput
            label="Number of Contributing Resources"
            input-name="referenceNumber"
            :error-message="errors.referenceNumber?.join(',')"
            :required="true"
        >
            <div>
                <InputText
                    id="numberOfResources"
                    ref="numberOfResourcesField"
                    v-model="heritageSite.numberOfResources"
                    aria-describedby="reference-number-help"
                    aria-required="true"
                    fluid
                    class="inline-block"
                    @change="valueChanged"
                    @focus="onFocusHandler"
                    @focusout="onFocusOutHandler"
                    @update:model-value="valueUpdated"
                />
                <Button
                    id="saveReferenceNumber"
                    label="Add"
                    class="inline-block"
                    @click="addContributingSource"
                ></Button>
            </div>
        </LabelledInput>
        <div class="flex flex-col">
            <p class="mb-1">Heritage Category</p>
            <div class="card flex flex-wrap gap-4">
                <div class="flex items-center gap-2">
                    <Checkbox
                        v-model="heritageCategory"
                        inputId="category1"
                        name="archaeologicalSite"
                        value="archaeologicalSite"
                    />
                    <label for="category1">
                        Archaeological Site / Remains
                    </label>
                </div>
                <div class="flex items-center gap-2">
                    <Checkbox
                        v-model="heritageCategory"
                        inputId="category2"
                        name="building"
                        value="building"
                    />
                    <label for="category2"> Building </label>
                </div>
                <div class="flex items-center gap-2">
                    <Checkbox
                        v-model="heritageCategory"
                        inputId="category3"
                        name="collection"
                        value="collection"
                    />
                    <label for="category3"> Collection </label>
                </div>
                <div class="flex items-center gap-2">
                    <Checkbox
                        v-model="heritageCategory"
                        inputId="category4"
                        name="landscapeFeatures"
                        value="landscapeFeatures"
                    />
                    <label for="category4">
                        Landscape(s) or Landscape Feature(s)
                    </label>
                </div>
                <div class="flex items-center gap-2">
                    <Checkbox
                        v-model="heritageCategory"
                        inputId="category5"
                        name="structure"
                        value="structure"
                    />
                    <label for="category5"> Structure </label>
                </div>
            </div>
            <p class="mb-1">Ownership</p>
            <div class="card flex flex-wrap gap-4">
                <div class="flex items-center gap-2">
                    <Checkbox
                        v-model="ownership"
                        inputId="ownership1"
                        name="Not-for-profit"
                        value="notForProfit"
                    />
                    <label for="ownership1"> Not-for-profit </label>
                </div>
                <div class="flex items-center gap-2">
                    <Checkbox
                        v-model="ownership"
                        inputId="ownership2"
                        name="private"
                        value="private"
                    />
                    <label for="ownership2"> Private </label>
                </div>
                <div class="flex items-center gap-2">
                    <Checkbox
                        v-model="ownership"
                        inputId="ownership3"
                        name="publicFederal"
                        value="publicFederal"
                    />
                    <label for="ownership3"> Public (federal) </label>
                </div>
                <div class="flex items-center gap-2">
                    <Checkbox
                        v-model="ownership"
                        inputId="ownership4"
                        name="publicLocal"
                        value="publicLocal"
                    />
                    <label for="ownership4"> Public (local) </label>
                </div>
                <div class="flex items-center gap-2">
                    <Checkbox
                        v-model="ownership"
                        inputId="ownership5"
                        name="publicProvincial"
                        value="publicProvincial"
                    />
                    <label for="category5"> Public (provincial) </label>
                </div>
            </div>
        </div>
    </FieldSet>
    <Fieldset
        id="heritageFunctionFieldset"
        class="p-fieldset p-component mt-2"
        legend="Heritage Function"
    >
        <LabelledInput
            label="Function Category"
            input-name="heritageTheme"
            :error-message="errors.functionCategory?.join(',')"
            :required="true"
        >
            <div class="p-inputtext-fluid flex flex-row">
                <InputText
                    id="functionCategory"
                    ref="functionCategoryField"
                    v-model="heritageSite.functionCategory"
                    aria-describedby="function-category-help"
                    aria-required="true"
                    fluid
                    class="inline-block"
                    @change="valueChanged"
                    @focus="onFocusHandler"
                    @focusout="onFocusOutHandler"
                    @update:model-value="valueUpdated"
                />
                <div class="inline-block">
                    <div class="inline-block">
                        <Checkbox
                            v-model="functionCategoryCurrent"
                            inputId="current"
                            name="functionCategoryCurrent"
                            value="functionCategoryCurrent"
                        />
                        <label for="current">Current</label>
                    </div>
                    <div class="inline-block">
                        <Checkbox
                            v-model="functionCategoryHistoric"
                            inputId="historic"
                            name="functionCategoryCHistoric"
                            value="functionCategoryCHistoric"
                        />
                        <label for="historic">Historic</label>
                    </div>
                </div>
            </div>
        </LabelledInput>
        <Button
            id="addOtherName"
            label="Add"
            class="inline-block"
            @click="saveOtherName"
        ></Button>
    </Fieldset>
    <Fieldset
        id="heritageThemeFieldset"
        class="p-fieldset p-component mt-2"
        legend="Heritage Theme"
    >
        <LabelledInput
            label="Heritage Theme"
            input-name="heritageTheme"
            :error-message="errors.heritageTheme?.join(',')"
            :required="true"
        >
            <div class="p-inputtext-fluid">
                <InputText
                    id="heritageTheme"
                    ref="heritageThemeField"
                    v-model="heritageSite.heritageTheme"
                    aria-describedby="heritage-theme-help"
                    aria-required="true"
                    fluid
                    @change="valueChanged"
                    @focus="onFocusHandler"
                    @focusout="onFocusOutHandler"
                    @update:model-value="valueUpdated"
                />
            </div>
        </LabelledInput>
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
</style>
