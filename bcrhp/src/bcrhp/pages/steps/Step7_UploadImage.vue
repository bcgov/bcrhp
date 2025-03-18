<script setup lang="ts">
import { useTemplateRef, inject, ref, onMounted } from "vue";
import type { Ref } from "vue";

import InputText from 'primevue/inputtext';
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import LabelledInput from "./LabelledInput.vue";
import type { HeritageSite } from "@/bcrhp/schema/HeritageSiteSchema.ts";
import { requiredCivicAddressSchema } from "@/bcrhp/schema/CivicAddressSchema.ts";
import type { ZodError } from "zod";


const heritageSite: HeritageSite = inject('heritageSite') as HeritageSite;
// const civicAddress: { [id: string] : CivicAddress; } = heritageSite.value.civicAddress;
const heritageSiteRef: Ref<HeritageSite> = ref(heritageSite);
type FormErrors = Partial<Record<keyof HeritageSite, string[]>>;
const errors: Ref<FormErrors> = ref<FormErrors>({});
let imageType = ref('');
let imageView = ref('');
let imageFeatures = ref('');
let imageDate = ref('');
let imageDescription = ref('');
let photographer = ref('');
let copyright = ref('');

// These names need to match the Zog schema
const fields = {
    imageTypeField: useTemplateRef("imageTypeField"),
    imageViewField: useTemplateRef("imageViewField"),
    imageFeaturesField: useTemplateRef("imageFeaturesField"),
    imageDateField: useTemplateRef("imageDateField"),
    imageDescriptionField: useTemplateRef("imageDescriptionField"),
    photographerField: useTemplateRef("photographerField"),
    copyrightField: useTemplateRef("copyrightField"),
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
    const fieldValidation = requiredCivicAddressSchema.shape[key].safeParse(heritageSiteRef.value[key]);
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


let validateFields = false;


// This needs to be removed - added because ESLint was complaining. Need to figure out
// configuration so API methods are not
defineExpose({ isValid });

onMounted(() => {
});

</script>
<template>
    <div class="flex flex-row">
        <LabelledInput label="Image Type" hint="Select Historical or Contemporary image type" input-name="commonName"
            :error-message="errors.imageType?.join(',')" :required="true">
            <div class="p-inputtext-fluid">
                <InputText id="imageType" ref="imageTypeField" v-model="imageType" aria-describedby="image-type-help"
                    aria-required="true" fluid @change="valueChanged" @focus="onFocusHandler"
                    @focusout="onFocusOutHandler" @update:model-value="valueUpdated" />
            </div>
        </LabelledInput>
        <LabelledInput label="Image View" hint="Select the view that best describes the image" input-name="imageView"
            :error-message="errors.imageView?.join(',')" :required="true">
            <div class="p-inputtext-fluid">
                <InputText id="imageView" ref="imageViewField" v-model="imageView" aria-describedby="image-view-help"
                    aria-required="true" fluid class="inline-block" @change="valueChanged" @focus="onFocusHandler"
                    @focusout="onFocusOutHandler" @update:model-value="valueUpdated" />
            </div>
        </LabelledInput>
    </div>
    <LabelledInput label="Image Features (Optional)" hint="Enter the features or subjects depicted by the photograph"
        input-name="imageFeatures" :error-message="errors.imageFeatures?.join(',')">
        <div>
            <InputText id="imageFeatures" ref="imageFeaturesField" v-model="imageFeatures"
                aria-describedby="image-features-help" aria-required="true" fluid class="inline-block"
                @change="valueChanged" @focus="onFocusHandler" @focusout="onFocusOutHandler"
                @update:model-value="valueUpdated" />
        </div>
    </LabelledInput>
    <LabelledInput label="Image Date" hint="Date the image was created" input-name="imageDate"
        :error-message="errors.imageDate?.join(',')" :required="true">
        <div>
            <InputText id="imageDate" ref="imageDateField" v-model="imageDate" aria-describedby="image-date-help"
                aria-required="true" fluid class="inline-block" @change="valueChanged" @focus="onFocusHandler"
                @focusout="onFocusOutHandler" @update:model-value="valueUpdated" />
        </div>
    </LabelledInput>
    <LabelledInput label="Image Description"
        hint="Summarize the image content including site address and site name. Include additional information that does not fit fields above"
        input-name="definingElements" :error-message="errors.imageDescription?.join(',')" :required="true">
        <div class="p-inputtext-fluid">
            <QuillEditor id="imageDescription" ref="imageDescriptionField" v-model:content="imageDescription"
                theme="snow" aria-describedby="image-description-help" aria-required="true" fluid
                @editorChange="valueChanged" @focus="onFocusHandler" @blur="onFocusOutHandler"
                @update:content="valueUpdated" />
        </div>
    </LabelledInput>
    <LabelledInput label="Photographer (Optional)" hint="Enter the name of the photographer" input-name="photographer"
        :error-message="errors.photographer?.join(',')">
        <div>
            <InputText id="photographer" ref="photographerField" v-model="photographer"
                aria-describedby="image-features-help" aria-required="true" fluid class="inline-block"
                @change="valueChanged" @focus="onFocusHandler" @focusout="onFocusOutHandler"
                @update:model-value="valueUpdated" />
        </div>
    </LabelledInput>
    <LabelledInput label="Copyright (Optional)" hint="Enter the name of the copyright holder for the image"
        input-name="copyright" :error-message="errors.copyright?.join(',')">
        <div>
            <InputText id="copyright" ref="copyrightField" v-model="copyright" aria-describedby="copyright-help"
                aria-required="true" fluid class="inline-block" @change="valueChanged" @focus="onFocusHandler"
                @focusout="onFocusOutHandler" @update:model-value="valueUpdated" />
        </div>
    </LabelledInput>
</template>

<style scoped>
.inline-block {
    display: inline-block;
    width: unset;
}

.p-inputtext-fluid.inline-block {
    width: calc(100% - 6.5rem);
    margin-right: 1rem;
}
</style>