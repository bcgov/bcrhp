<script setup lang="ts">
import { useTemplateRef, inject, ref } from 'vue';
import type { Ref } from 'vue';

import InputText from 'primevue/inputtext';
import Editor from 'primevue/editor';
import DatePickerWidget from '@/arches_component_lab/widgets/DatePickerWidget/DatePickerWidget.vue';
import { Form, FormField, type FormInstance } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import ConceptSelect from '@/bcgov_arches_common/components/ConceptSelect/ConceptSelect.vue';
import type { HeritageSite } from '@/bcrhp/schema/HeritageSiteSchema.ts';
import {
    SiteImagesSchema,
    getSiteImages,
} from '@/bcrhp/schema/SiteImagesSchema.ts';
import { EDIT } from '@/arches_component_lab/widgets/constants.ts';

const heritageSite: typeof HeritageSite = inject(
    'heritageSite',
) as typeof HeritageSite;

const currentSiteImage = ref(getSiteImages());
const imageDate = ref();
currentSiteImage.value.imageTypes = [];
heritageSite.value.siteImages[currentSiteImage.value.id] = currentSiteImage;

const siteImageForm: Ref<FormInstance | null> = useTemplateRef(
    'siteImageForm',
) as Ref<FormInstance | null>;
const zodImageTypeResolver = zodResolver(SiteImagesSchema.shape.imageType);
const zodImageViewResolver = zodResolver(SiteImagesSchema.shape.imageView);
const zodImageFeaturesResolver = zodResolver(
    SiteImagesSchema.shape.imageFeatures,
);
const zodImageDatesResolver = zodResolver(SiteImagesSchema.shape.imageDate);
const zodImageDescriptionsResolver = zodResolver(
    SiteImagesSchema.shape.imageDescription,
);
const zodPhotographerResolver = zodResolver(
    SiteImagesSchema.shape.photographer,
);
const zodCopyrightResolver = zodResolver(SiteImagesSchema.shape.copyright);

const isValid = () => {
    return siteImageForm.value?.valid;
};

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
</script>
<template>
    <Form
        ref="siteImageForm"
        v-slot="$form"
        name="siteImageForm"
        :validateOnBlur="true"
    >
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
            <FormField
                :resolver="zodImageTypeResolver"
                name="imageType"
            >
                <LabelledInput
                    label="Image Type"
                    hint="Select Historical or Contemporary image type"
                    input-name="imageType"
                    :error-message="$form.imageType?.error?.message"
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
            </FormField>
            <FormField
                :resolver="zodImageViewResolver"
                name="imageView"
            >
                <LabelledInput
                    label="Image View"
                    hint="Select the view that best describes the image"
                    input-name="imageView"
                    :error-message="$form.imageView?.error?.message"
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
            </FormField>
        </div>
        <FormField
            :resolver="zodImageFeaturesResolver"
            name="imageFeatures"
        >
            <LabelledInput
                label="Image Features (Optional)"
                hint="Enter the features or subjects depicted by the photograph"
                input-name="imageFeatures"
                :error-message="$form.imageFeatures?.error?.message"
            >
                <div>
                    <InputText
                        id="imageFeatures"
                        ref="imageFeaturesField"
                        v-model="currentSiteImage.imageFeatures"
                        placeholder="E.g. Stained Glass Window"
                        aria-describedby="image-features-help"
                        fluid
                        class="inline-block"
                    />
                </div>
            </LabelledInput>
        </FormField>
        <FormField
            :resolver="zodImageDatesResolver"
            name="imageDate"
        >
            <DatePickerWidget
                :mode="EDIT"
                :value="imageDate"
                graph-slug="heritage_site"
                node-alias="image_date"
                :show-label="true"
            />
        </FormField>
        <FormField
            :resolver="zodImageDescriptionsResolver"
            name="imageDescription"
        >
            <LabelledInput
                label="Image Description"
                hint="Summarize the image content including site address and site name. Include additional information that does not fit fields above"
                input-name="definingElements"
                :error-message="$form.imageDescription?.error?.message"
                :required="true"
            >
                <div class="p-inputtext-fluid">
                    <Editor
                        id="imageDescription"
                        ref="imageDescriptionField"
                        v-model="currentSiteImage.imageDescription"
                        placeholder="E.g. 1234 Street, Humboldt Residence, Front View of entrance way in winter. Photographed on 2024-01-01."
                        theme="snow"
                        aria-describedby="image-description-help"
                        aria-required="true"
                        fluid
                    />
                </div>
            </LabelledInput>
        </FormField>
        <FormField
            :resolver="zodPhotographerResolver"
            name="photographer"
        >
            <LabelledInput
                label="Photographer (Optional)"
                hint="Enter the name of the photographer"
                input-name="photographer"
                :error-message="$form.photographer?.error?.message"
            >
                <div>
                    <InputText
                        id="photographer"
                        ref="photographerField"
                        v-model="currentSiteImage.photographer"
                        placeholder="First Name Last Name"
                        aria-describedby="image-features-help"
                        aria-required="true"
                        fluid
                        class="inline-block"
                    />
                </div>
            </LabelledInput>
        </FormField>
        <FormField
            :resolver="zodCopyrightResolver"
            name="copyright"
        >
            <LabelledInput
                label="Copyright (Optional)"
                hint="Enter the name of the copyright holder for the image"
                input-name="copyright"
                :error-message="$form.copyright?.error?.message"
            >
                <div>
                    <InputText
                        id="copyright"
                        ref="copyrightField"
                        v-model="currentSiteImage.copyright"
                        placeholder="E.g. City of Nelson"
                        aria-describedby="copyright-help"
                        aria-required="true"
                        fluid
                        class="inline-block"
                    />
                </div>
            </LabelledInput>
        </FormField>
    </Form>
</template>
