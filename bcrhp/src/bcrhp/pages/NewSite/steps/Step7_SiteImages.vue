<script setup lang="ts">
import { ref, useTemplateRef, inject } from 'vue';
import type { Ref } from 'vue';

import { Form, type FormInstance } from '@primevue/forms';
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
import {
    updateModelValue as baseUpdateModelValue,
    isValid as baseIsValid,
} from '@/bcrhp/utils.ts';
import type { AliasedNodeData } from '@/arches_component_lab/types.ts';

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite');
const emit = defineEmits(['update:stepIsValid']);

const currentSiteImage: SiteImagesTileType = ref(getSiteImages());

const siteImageForm: Ref<FormInstance | null> = useTemplateRef(
    'siteImageForm',
) as Ref<FormInstance | null>;
const imageFormResolver = zodResolver(
    SiteImagesTileSchema.shape['aliased_data'],
);

const isValid = () => {
    return baseIsValid(
        siteImageForm as Ref<FormInstance>,
        SiteImagesTileSchema.shape['aliased_data'],
    );
};

const onImageUpload = function () {};

const updateModelValue = function (
    newValue: AliasedNodeData,
    attribute_name: string,
) {
    baseUpdateModelValue(
        newValue,
        attribute_name,
        currentSiteImage.value.aliased_data,
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
                        :aliasedNodeData="
                            currentSiteImage.aliased_data.image_type
                        "
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
                        node-alias="image_view"
                        :mode="EDIT"
                        :aliasedNodeData="
                            currentSiteImage.aliased_data.image_view
                        "
                        :should-show-label="false"
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
                <GenericWidget
                    graph-slug="heritage_site"
                    node-alias="image_features"
                    :mode="EDIT"
                    :aliasedNodeData="
                        currentSiteImage.aliased_data.image_features
                    "
                    :should-show-label="false"
                    placeholder="E.g. Stained Glass Window"
                    @update:value="updateModelValue($event, 'image_features')"
                />
            </div>
        </LabelledInput>
        <GenericWidget
            :mode="EDIT"
            :should-show-label="true"
            :aliasedNodeData="currentSiteImage.aliased_data.image_date"
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
                <GenericWidget
                    :mode="EDIT"
                    :should-show-label="false"
                    :aliasedNodeData="
                        currentSiteImage.aliased_data.image_description
                    "
                    graph-slug="heritage_site"
                    node-alias="image_description"
                    placeholder="E.g. 1234 Street, Humboldt Residence, Front View of entrance way in winter. Photographed on 2024-01-01."
                    @update:value="
                        updateModelValue($event, 'image_description')
                    "
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
                <GenericWidget
                    :mode="EDIT"
                    :should-show-label="false"
                    :aliasedNodeData="
                        currentSiteImage.aliased_data.photographer
                    "
                    graph-slug="heritage_site"
                    node-alias="photographer"
                    placeholder="First Name Last Name"
                    @update:value="updateModelValue($event, 'photographer')"
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
                <GenericWidget
                    :mode="EDIT"
                    :should-show-label="false"
                    :aliasedNodeData="currentSiteImage.aliased_data.copyright"
                    graph-slug="heritage_site"
                    node-alias="copyright"
                    placeholder="E.g. City of Nelson"
                    @update:value="updateModelValue($event, 'copyright')"
                />
            </div>
        </LabelledInput>
    </Form>
</template>
