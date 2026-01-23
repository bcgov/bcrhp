<script setup lang="ts">
import { ref, useTemplateRef, inject, computed } from 'vue';
import type { Ref } from 'vue';

import { Form, type FormInstance } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import GenericWidget from '@/arches_component_lab/generics/GenericWidget/GenericWidget.vue';
import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import RadioButton from 'primevue/radiobutton';
import RadioButtonGroup from 'primevue/radiobuttongroup';
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
import type {
    AliasedNodeData,
    CardXNodeXWidgetData,
} from '@/arches_component_lab/types.ts';
import Button from 'primevue/button';

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite')!;
const emit = defineEmits(['update:stepIsValid']);

const currentSiteImage: SiteImagesTileType = ref(getSiteImages());
const siteImageKey = ref(0);
const primaryImage = ref(0);

const siteImageList = computed(() => {
    return heritageSite.value?.aliased_data?.site_images ?? [];
});

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

const imageViewOverrides = {
    widget: {
        widgetid: '',
        component:
            'arches_component_lab/widgets/ConceptSelectWidget/ConceptSelectWidget.vue',
    },
} satisfies Partial<CardXNodeXWidgetData>;

const addImageDisabled = computed(() => false);

const saveImage = async function () {
    heritageSite.value.aliased_data.site_images.push(currentSiteImage.value);

    currentSiteImage.value = getSiteImages();

    // Increment the key to force the GenericWidget to re-render from scratch
    siteImageKey.value++;

    // Optional: Reset the form validation state to remove any "touched" or error states
    siteImageForm.value?.reset();
};

const deleteSiteImage = function (index: number) {
    heritageSite.value.aliased_data.site_images.splice(index, 1);
};

const setCurrentImage = function (index: number) {
    currentSiteImage.value = heritageSite.value.aliased_data.site_images[index];
    siteImageKey.value = index;
};

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
            <div>
                <GenericWidget
                    :key="siteImageKey"
                    graph-slug="heritage_site"
                    node-alias="site_images"
                    :should-show-label="true"
                    :mode="EDIT"
                    :aliased-node-data="
                        currentSiteImage.aliased_data?.site_images
                    "
                    @update:value="updateModelValue($event, 'site_images')"
                ></GenericWidget>
            </div>

            <div class="placeholders">
                <div>
                    <Button
                        id="addOtherName"
                        label="+ Add"
                        class="inline-block"
                        :aria-disabled="addImageDisabled"
                        :disabled="addImageDisabled"
                        @click="saveImage"
                    ></Button>
                </div>
                <div class="flex flex-row image-placeholders">
                    <RadioButtonGroup v-model="primaryImage">
                        <div
                            v-for="(image, index) in siteImageList"
                            :key="index"
                            class="image-placeholder"
                            @click="setCurrentImage(index)"
                        >
                            <div
                                class="fa fa-trash image-delete-icon"
                                @click="deleteSiteImage(index)"
                            ></div>
                            <div class="primary-image-select">
                                <RadioButton :value="index"> </RadioButton>
                            </div>
                            <GenericWidget
                                graph-slug="heritage_site"
                                :mode="VIEW"
                                :should-show-label="false"
                                node-alias="site_document"
                                :aliased-node-data="
                                    image.aliased_data.site_images
                                "
                            />
                        </div>
                    </RadioButtonGroup>
                </div>
            </div>
        </div>
        <div class="flex flex-row">
            <div style="flex-grow: 1">
                <GenericWidget
                    :key="siteImageKey"
                    graph-slug="heritage_site"
                    node-alias="image_type"
                    :should-show-label="true"
                    :mode="EDIT"
                    :aliased-node-data="
                        currentSiteImage.aliased_data?.image_type
                    "
                    @update:value="updateModelValue($event, 'image_type')"
                ></GenericWidget>
            </div>

            <div style="flex-grow: 1">
                <LabelledInput
                    label="Image View"
                    hint="Select the view that best describes the image"
                    input-name="imageView"
                    :required="true"
                >
                    <div class="p-inputtext-fluid">
                        <GenericWidget
                            :key="siteImageKey"
                            graph-slug="heritage_site"
                            node-alias="image_view"
                            :mode="EDIT"
                            :card-x-node-x-widget-data-overrides="
                                imageViewOverrides
                            "
                            :aliased-node-data="
                                currentSiteImage.aliased_data?.image_view
                            "
                            :should-show-label="false"
                            placeholder="Select an Image View"
                            @update:value="
                                updateModelValue($event, 'image_view')
                            "
                        />
                    </div>
                </LabelledInput>
            </div>
        </div>
        <LabelledInput
            label="Image Features (Optional)"
            hint="Enter the features or subjects depicted by the photograph"
            input-name="imageFeatures"
            :error-message="$form.imageFeatures?.error?.message"
        >
            <div>
                <GenericWidget
                    :key="siteImageKey"
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
            :key="siteImageKey"
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
                    :key="siteImageKey"
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
                    :key="siteImageKey"
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
                    :key="siteImageKey"
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

<style scoped>
.flex {
    display: flex;
    gap: 1.5rem;
}
.flex-column {
    flex-direction: column;
}
.flex-row {
    flex-direction: row;
    align-items: start;
}
.placeholders {
    margin-top: 1.5rem;
}

.image-placeholder {
    max-width: 150px;
    max-height: 150px;
    position: relative;
}

.image-delete-icon {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    cursor: pointer;
    width: 1rem;
    height: 1rem;
    z-index: 1000;
    color: orange;
    background: black;
    align-content: center;
    padding: 2px;
    border-radius: 3px;
}

.primary-image-select {
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
    cursor: pointer;
    width: 1rem;
    height: 1rem;
    z-index: 1000;
}
</style>
<style>
.image-placeholders .item-index {
    display: none;
}
</style>
