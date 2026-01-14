<script setup lang="ts">
import { reactive, useTemplateRef, inject } from 'vue';
import type { Ref } from 'vue';

import InputText from 'primevue/inputtext';
import Editor from 'primevue/editor';
import { Form, FormField, type FormInstance } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import GenericWidget from '@/arches_component_lab/generics/GenericWidget/GenericWidget.vue';
import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import { EDIT, VIEW } from '@/arches_component_lab/widgets/constants.ts';
import {
    SiteImagesTileSchema,
    getSiteImages,
    type SiteImagesTileType,
} from '@/bcrhp/schemas/heritage_site/site_images.ts';
import type { HeritageSiteType } from '@/bcrhp/schemas/heritage_site.ts';
import { updateModelValue as baseUpdateModelValue } from '@/bcrhp/utils.ts';
import type { AliasedNodeData } from '@/arches_component_lab/types.ts';

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite');
const emit = defineEmits(['update:stepIsValid']);

const currentSiteImage: SiteImagesTileType = reactive(getSiteImages());
currentSiteImage.imageType = null;

const siteImageForm: Ref<FormInstance | null> = useTemplateRef(
    'siteImageForm',
) as Ref<FormInstance | null>;
const imageFormResolver = zodResolver(
    SiteImagesTileSchema.shape['aliased_data'],
);

const isValid = () => {
    return siteImageForm.value?.valid;
};

const onImageUpload = function () {};

const updateModelValue = function (
    newValue: AliasedNodeData,
    attribute_name: string,
) {
    baseUpdateModelValue(
        newValue,
        attribute_name,
        heritageSite?.value.aliased_data.site_images.aliased_data,
        siteImageForm as Ref<FormInstance>,
    );
    emit('update:stepIsValid', isValid());
};

defineExpose({ isValid });
</script>
<template>
    <Form
        ref="siteImageForm"
        v-slot="$form"
        name="siteImageForm"
        :validateOnBlur="true"
        :resolver="imageFormResolver"
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
            <LabelledInput
                label="Image Type"
                hint="Select Historical or Contemporary image type"
                input-name="imageType"
                :error-message="$form.imageType?.error?.message"
                :required="true"
            >
                <div class="p-inputtext-fluid">
                    <GenericWidget
                        :mode="EDIT"
                        :should-show-label="false"
                        :aliasedNodeData="null"
                        graph-slug="heritage_site"
                        node-alias="image_type"
                        placeholder="Select an Image Type"
                        group-direction="column"
                        @update:value="updateModelValue($event, 'image_type')"
                    />
                </div>
            </LabelledInput>
            <LabelledInput
                label="Image View"
                hint="Select the view that best describes the image"
                input-name="imageView"
                :error-message="$form.imageView?.error?.message"
                :required="true"
            >
                <div class="p-inputtext-fluid">
                    <GenericWidget
                        graph-slug="heritage_site"
                        :mode="EDIT"
                        :should-show-label="false"
                        node-alias="image_view"
                        model-value="currentSiteImage.imageView"
                        placeholder="Select an Image View"
                        @update:value="updateModelValue($event, 'image_view')"
                    />
                </div>
            </LabelledInput>
        </div>
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
        <GenericWidget
            :mode="EDIT"
            :should-show-label="true"
            :aliasedNodeData="null"
            graph-slug="heritage_site"
            node-alias="image_date"
            placeholder="Date the image was created"
            group-direction="column"
            @update:value="updateModelValue($event, 'image_date')"
        />
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
        <GenericWidget
            :value="currentSiteImage.imageType"
            :mode="VIEW"
            :should-show-label="true"
            graph-slug="heritage_site"
            node-alias="image_type"
        />
        <GenericWidget
            :value="currentSiteImage.imageView"
            :mode="VIEW"
            :should-show-label="true"
            graph-slug="heritage_site"
            node-alias="image_view"
        />
    </Form>
</template>
