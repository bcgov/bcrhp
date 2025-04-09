<script setup lang="ts">
import { useTemplateRef, inject, ref, onMounted } from 'vue';
import type { Ref } from 'vue';

import InputText from 'primevue/inputtext';
import Editor from 'primevue/editor';
import DatePicker from 'primevue/datepicker';

import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import ConceptSelect from '@/bcgov_arches_common/components/ConceptSelect/ConceptSelect.vue';
import type { HeritageSite } from '@/bcrhp/schema/HeritageSiteSchema.ts';
import {
    SiteImages,
    requiredSiteImagesSchema,
    getSiteImages,
} from '@/bcrhp/schema/SiteImagesSchema.ts';
import type { ZodError } from 'zod';

const heritageSite: typeof HeritageSite = inject(
    'heritageSite',
) as typeof HeritageSite;
type FormErrors = Partial<Record<keyof typeof HeritageSite, string[]>>;
const errors: Ref<FormErrors> = ref<FormErrors>({});

const currentSiteImage = ref(getSiteImages());
currentSiteImage.value.imageTypes = [];
heritageSite.value.siteImages[currentSiteImage.value.id] = currentSiteImage;

// These names need to match the Zog schema
const fields = {
    imageTypeField: useTemplateRef('imageTypeField'),
    imageViewField: useTemplateRef('imageViewField'),
    imageFeaturesField: useTemplateRef('imageFeaturesField'),
    imageDateField: useTemplateRef('imageDateField'),
    imageDescriptionField: useTemplateRef('imageDescriptionField'),
    photographerField: useTemplateRef('photographerField'),
    copyrightField: useTemplateRef('copyrightField'),
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

    const key: keyof typeof SiteImages = field.id as keyof typeof SiteImages;
    const fieldValidation = requiredSiteImagesSchema.shape[key].safeParse(
        currentSiteImage.value[key],
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

let validateFields = false;

const onImageUpload = function () {};

// This needs to be removed - added because ESLint was complaining. Need to figure out
// configuration so API methods are not
defineExpose({ isValid });

const updateImageType = function (
    newValue: string,
    selectField: typeof ConceptSelect,
) {
    console.log(`New value ${newValue}`);
    currentSiteImage.value[selectField.id] = newValue;
};

onMounted(() => {});
</script>
<template>
    <div class="flex flex-row">
        <FileUpload
            name="fileUpload"
            url="/api/upload"
            :multiple="true"
            accept="image/*"
            :maxFileSize="1000000"
            @upload="onImageUpload"
        >
            <template #empty>
                <span>Drag and drop files to here to upload.</span>
            </template>
        </FileUpload>
        <LabelledInput
            label="Image Type"
            hint="Select Historical or Contemporary image type"
            input-name="commonName"
            :error-message="errors.imageType?.join(',')"
            :required="true"
        >
            <div class="p-inputtext-fluid">
                <ConceptSelect
                    id="imageType"
                    ref="imageTypeField"
                    graph-slug="heritage_site"
                    node-alias="image_type"
                    model-value="currentSiteImage.imageType"
                    placeholder="Select an Image Type"
                    @value-updated="updateImageType"
                />
            </div>
        </LabelledInput>
        <LabelledInput
            label="Image View"
            hint="Select the view that best describes the image"
            input-name="imageView"
            :error-message="errors.imageView?.join(',')"
            :required="true"
        >
            <div class="p-inputtext-fluid">
                <ConceptSelect
                    id="imageView"
                    ref="imageViewField"
                    graph-slug="heritage_site"
                    node-alias="image_view"
                    model-value="currentSiteImage.imageView"
                    placeholder="Select an Image View"
                    @value-updated="updateImageType"
                />
            </div>
        </LabelledInput>
    </div>
    <LabelledInput
        label="Image Features (Optional)"
        hint="Enter the features or subjects depicted by the photograph"
        input-name="imageFeatures"
        :error-message="errors.imageFeatures?.join(',')"
    >
        <div>
            <InputText
                id="imageFeatures"
                ref="imageFeaturesField"
                v-model="heritageSite.siteImages.imageFeatures"
                aria-describedby="image-features-help"
                fluid
                class="inline-block"
                @change="valueChanged"
                @focus="onFocusHandler"
                @focusout="onFocusOutHandler"
                @update:model-value="valueUpdated"
            />
        </div>
    </LabelledInput>
    <LabelledInput
        label="Image Date"
        hint="Date the image was created"
        input-name="imageDate"
        :error-message="errors.imageDate?.join(',')"
        :required="true"
    >
        <DatePicker
            id="imageDate"
            ref="imageDateField"
            v-model="heritageSite.siteImages.imageDate"
            show-icon
            aria-describedby="image-date-help"
            aria-required="true"
        />
    </LabelledInput>
    <LabelledInput
        label="Image Description"
        hint="Summarize the image content including site address and site name. Include additional information that does not fit fields above"
        input-name="definingElements"
        :error-message="errors.imageDescription?.join(',')"
        :required="true"
    >
        <div class="p-inputtext-fluid">
            <Editor
                id="imageDescription"
                ref="imageDescriptionField"
                v-model="heritageSite.siteImages.imageDescription"
                theme="snow"
                aria-describedby="image-description-help"
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
        label="Photographer (Optional)"
        hint="Enter the name of the photographer"
        input-name="photographer"
        :error-message="errors.photographer?.join(',')"
    >
        <div>
            <InputText
                id="photographer"
                ref="photographerField"
                v-model="heritageSite.siteImages.photographer"
                aria-describedby="image-features-help"
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
    <LabelledInput
        label="Copyright (Optional)"
        hint="Enter the name of the copyright holder for the image"
        input-name="copyright"
        :error-message="errors.copyright?.join(',')"
    >
        <div>
            <InputText
                id="copyright"
                ref="copyrightField"
                v-model="heritageSite.siteImages.copyright"
                aria-describedby="copyright-help"
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
</template>
