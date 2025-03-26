<script setup lang="ts">
import { useTemplateRef, ref, onMounted } from 'vue';
import type { Ref } from 'vue';

import InputText from 'primevue/inputtext';
import Editor from 'primevue/editor';
import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import type { UploadImage } from '@/bcrhp/schema/UploadImageSchema.ts';
import { getUploadImage } from '@/bcrhp/schema/UploadImageSchema.ts';
import { requiredUploadImageSchema } from '@/bcrhp/schema/UploadImageSchema.ts';
import type { ZodError } from 'zod';

const uploadImage: typeof UploadImage = getUploadImage();
const uploadImageRef: Ref<typeof UploadImage> = ref(uploadImage);
type FormErrors = Partial<Record<keyof typeof UploadImage, string[]>>;
const errors: Ref<FormErrors> = ref<FormErrors>({});

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
    const key: keyof typeof UploadImage = field.id as keyof typeof UploadImage;
    const fieldValidation = requiredUploadImageSchema.shape[key].safeParse(
        uploadImageRef.value[key],
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
                <InputText
                    id="imageType"
                    ref="imageTypeField"
                    v-model="uploadImage.imageType"
                    aria-describedby="image-type-help"
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
            label="Image View"
            hint="Select the view that best describes the image"
            input-name="imageView"
            :error-message="errors.imageView?.join(',')"
            :required="true"
        >
            <div class="p-inputtext-fluid">
                <InputText
                    id="imageView"
                    ref="imageViewField"
                    v-model="uploadImage.imageView"
                    aria-describedby="image-view-help"
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
                v-model="uploadImage.imageFeatures"
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
        label="Image Date"
        hint="Date the image was created"
        input-name="imageDate"
        :error-message="errors.imageDate?.join(',')"
        :required="true"
    >
        <div>
            <InputText
                id="imageDate"
                ref="imageDateField"
                v-model="uploadImage.imageDate"
                aria-describedby="image-date-help"
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
                v-model="uploadImage.imageDescription"
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
                v-model="uploadImage.photographer"
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
                v-model="uploadImage.copyright"
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
