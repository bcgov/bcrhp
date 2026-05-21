<script setup lang="ts">
import { ref, useTemplateRef, inject, computed } from 'vue';
import type { Ref } from 'vue';

import { Form, type FormInstance } from '@primevue/forms';
import FieldSet from 'primevue/fieldset';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { getFlattenResolver } from '@/bcgov_arches_common/validation-utils.ts';
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
    trueBooleanValue,
    falseBooleanValue,
} from '@/bcrhp/utils.ts';
import type {
    AliasedNodeData,
    CardXNodeXWidgetData,
} from '@/arches_component_lab/types.ts';
import Button from 'primevue/button';
import { convertNbspToSpaces } from '@/bcgov_arches_common/datatypes/string/validation/utils.ts';
import type { StringValue } from '@/arches_component_lab/datatypes/string/types.ts';

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite')!;
const emit = defineEmits(['update:stepIsValid']);

// Returns a new empty site image. Primary image defaults to true if it's the first,
// otherwise it is set to false
const getBlankSiteImage = () => {
    let siteImage = getSiteImages();
    siteImage.aliased_data.primary_image =
        (heritageSite.value?.aliased_data?.site_images?.length ?? 0 > 0)
            ? falseBooleanValue
            : trueBooleanValue;
    return siteImage;
};

const currentSiteImage: Ref<SiteImagesTileType> = ref(getBlankSiteImage());
const siteImageKey = ref<number>(0);
const addingNewImage = ref<boolean>(true);

const siteImageList = computed(() => {
    return heritageSite.value?.aliased_data?.site_images ?? [];
});

const siteImagesCount = computed(() => {
    return siteImageList.value.length;
});

const hasUnsavedImage = computed(() => {
    const nodes = currentSiteImage.value?.aliased_data?.site_images?.node_value;
    return Array.isArray(nodes) && nodes.length > 0;
});

const siteImageForm: Ref<FormInstance | null> = useTemplateRef(
    'siteImageForm',
) as Ref<FormInstance | null>;
const imageFormResolver = getFlattenResolver(
    zodResolver(SiteImagesTileSchema.shape['aliased_data']),
);

const isValid = () => true;

const isImageFormValid = () => {
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

const addImageDisabled = computed(() => {
    if (siteImagesCount.value >= 10) return true;
    if (!hasUnsavedImage.value) return true;

    const data = currentSiteImage.value?.aliased_data;
    const hasImageType = !!data?.image_type?.display_value;
    const hasImageView = !!data?.image_view?.display_value;
    const hasImageDesc = data?.image_description?.display_value?.length > 0;

    return (
        !(hasImageType && hasImageView && hasImageDesc) || !isImageFormValid()
    );
});

const nextImageKey = computed(() => {
    return siteImageList.value.length;
});

const addNewImage = function () {
    currentSiteImage.value = getBlankSiteImage();
    addingNewImage.value = true;
    siteImageKey.value = nextImageKey.value;
};

const clearPendingImage = () => {
    currentSiteImage.value = getBlankSiteImage();
    siteImageKey.value++;
};

const saveImage = async function () {
    heritageSite.value.aliased_data.site_images.push(currentSiteImage.value);

    currentSiteImage.value = getBlankSiteImage();

    // Increment the key to force the GenericWidget to re-render from scratch
    siteImageKey.value = nextImageKey.value;

    // Optional: Reset the form validation state to remove any "touched" or error states
    siteImageForm.value?.reset();
};

const deleteSiteImage = function (index: number) {
    console.log(`Deleting site image at index ${index}`);
    heritageSite.value.aliased_data.site_images.splice(index, 1);
};

const setCurrentImage = function (index: number) {
    console.log(`Setting current index to ${index}`);
    currentSiteImage.value = heritageSite.value.aliased_data.site_images[index];
    siteImageKey.value = index;
    addingNewImage.value = false;
};

const setPrimaryImage = function (index: number) {
    if (index !== 0) {
        const primaryImage = heritageSite.value.aliased_data.site_images[index];
        heritageSite.value.aliased_data.site_images.splice(index, 1);
        heritageSite.value.aliased_data.site_images = [
            primaryImage,
            ...heritageSite.value.aliased_data.site_images,
        ];
    }
    heritageSite.value.aliased_data.site_images.forEach(
        (image: SiteImagesTileType, idx: number) => {
            image.aliased_data.primary_image =
                idx === 0 ? trueBooleanValue : falseBooleanValue;
        },
    );
};

const updateModelValue = function (
    newValue: AliasedNodeData,
    attribute_name: string,
) {
    if (attribute_name === 'image_description') {
        newValue = convertNbspToSpaces(newValue as StringValue);
    }
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
        <FieldSet legend="Site Images">
            <div class="flex flex-row flex-nowrap">
                <div class="uploader-container">
                    <div
                        v-if="
                            siteImagesCount >= 10 &&
                            !hasUnsavedImage &&
                            addingNewImage
                        "
                        class="max-limit-message"
                    >
                        <i class="fa fa-ban limit-icon"></i>
                        <div>Maximum of 10 images reached.</div>
                        <div class="limit-subtext">
                            Please delete an image to add more.
                        </div>
                    </div>

                    <GenericWidget
                        v-else-if="!hasUnsavedImage && addingNewImage"
                        :key="siteImageKey"
                        graph-slug="heritage_site"
                        node-alias="site_images"
                        :should-show-label="false"
                        :mode="EDIT"
                        :aliased-node-data="
                            currentSiteImage?.aliased_data?.site_images
                        "
                        @update:value="updateModelValue($event, 'site_images')"
                    ></GenericWidget>

                    <div
                        v-else
                        class="pending-image-preview"
                    >
                        <GenericWidget
                            :key="`view-${siteImageKey}`"
                            graph-slug="heritage_site"
                            node-alias="site_images"
                            :should-show-label="false"
                            :mode="VIEW"
                            :aliased-node-data="
                                currentSiteImage?.aliased_data?.site_images
                            "
                        ></GenericWidget>

                        <Button
                            v-if="addingNewImage"
                            label="Remove / Change Image"
                            icon="fa fa-times"
                            @click="clearPendingImage"
                        />
                    </div>
                </div>

                <div class="placeholders">
                    <div>
                        <Button
                            v-if="!addingNewImage && siteImagesCount < 10"
                            id="addImage"
                            label="+ Add"
                            class="inline-block"
                            :aria-disabled="addImageDisabled"
                            :disabled="addImageDisabled"
                            @click="addNewImage"
                        ></Button>
                        <Button
                            v-if="addingNewImage && siteImagesCount < 10"
                            id="addOtherName"
                            class="inline-block"
                            :aria-disabled="addImageDisabled"
                            :disabled="addImageDisabled"
                            tooltip="Save the new image before adding another"
                            @click="saveImage"
                            ><i class="fa fa-save mr-2"></i>
                            Save
                        </Button>
                    </div>
                    <div class="flex flex-row image-placeholders">
                        <div
                            v-for="(image, index) in siteImageList"
                            :key="index"
                            :data-selected="index === siteImageKey"
                            class="image-placeholder"
                            @click="setCurrentImage(index)"
                        >
                            <div
                                class="fa fa-remove image-icons image-delete-icon"
                                tooltip="Remove Image"
                                @click.stop="deleteSiteImage(index)"
                            ></div>
                            <div
                                v-if="index !== 0"
                                class="fa fa-flag image-icons image-primary-icon"
                                tooltip="Set as Primary Image"
                                @click.stop="setPrimaryImage(index)"
                            ></div>
                            <GenericWidget
                                graph-slug="heritage_site"
                                :mode="VIEW"
                                :should-show-label="false"
                                node-alias="site_images"
                                :aliased-node-data="
                                    image.aliased_data.site_images
                                "
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex flex-row">
                <div class="flex-grow">
                    <LabelledInput
                        label="Image Type"
                        hint="Select Historical or Contemporary image type"
                        input-name="imageType"
                        :required="true"
                    >
                        <GenericWidget
                            :key="siteImageKey"
                            graph-slug="heritage_site"
                            node-alias="image_type"
                            :should-show-label="false"
                            :mode="EDIT"
                            :aliased-node-data="
                                currentSiteImage?.aliased_data?.image_type
                            "
                            @update:value="
                                updateModelValue($event, 'image_type')
                            "
                        ></GenericWidget>
                    </LabelledInput>
                </div>

                <div class="flex-grow">
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
                                    currentSiteImage?.aliased_data?.image_view
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
                            currentSiteImage?.aliased_data?.image_description
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
                label="Image Features"
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
                            currentSiteImage?.aliased_data?.image_features
                        "
                        :should-show-label="false"
                        placeholder="E.g. Stained Glass Window"
                        @update:value="
                            updateModelValue($event, 'image_features')
                        "
                    />
                </div>
            </LabelledInput>
            <GenericWidget
                :key="siteImageKey"
                :mode="EDIT"
                :should-show-label="true"
                :aliasedNodeData="currentSiteImage?.aliased_data?.image_date"
                graph-slug="heritage_site"
                node-alias="image_date"
                placeholder="Date the image was created"
                group-direction="column"
                @update:value="updateModelValue($event, 'image_date')"
            />

            <LabelledInput
                label="Photographer"
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
                            currentSiteImage?.aliased_data?.photographer
                        "
                        graph-slug="heritage_site"
                        node-alias="photographer"
                        placeholder="First Name Last Name"
                        @update:value="updateModelValue($event, 'photographer')"
                    />
                </div>
            </LabelledInput>
            <LabelledInput
                label="Copyright"
                hint="Enter the name of the copyright holder for the image"
                input-name="copyright"
                :error-message="$form.copyright?.error?.message"
            >
                <div>
                    <GenericWidget
                        :key="siteImageKey"
                        :mode="EDIT"
                        :should-show-label="false"
                        :aliasedNodeData="
                            currentSiteImage?.aliased_data.copyright
                        "
                        graph-slug="heritage_site"
                        node-alias="copyright"
                        placeholder="E.g. City of Nelson"
                        @update:value="updateModelValue($event, 'copyright')"
                    />
                </div>
            </LabelledInput>
        </FieldSet>
    </Form>
    <br /><br />
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
.flex-nowrap {
    flex-wrap: nowrap;
}
.flex-grow {
    flex-grow: 1;
}

.uploader-container {
    width: 300px;
    min-height: 200px;
}

.max-limit-message {
    width: 100%;
    height: 100%;
    min-height: 200px;
    background: #f8f9fa;
    border: 2px dashed #dee2e6;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #495057;
    font-weight: 600;
}

.limit-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    color: #aaa;
}

.limit-subtext {
    font-size: 0.8em;
    color: #666;
}

.pending-image-preview {
    border: 1px solid #ddd;
    padding: 10px;
    border-radius: 4px;
    text-align: center;
}

.image-placeholders {
    flex-flow: wrap;
    gap: 0.25rem;
}

.image-placeholder {
    max-width: 125px;
    min-width: 125px;
    max-height: 125px;
    position: relative;
    overflow: hidden;
}

.image-icons {
    position: absolute;
    right: 0.5rem;
    cursor: pointer;
    width: 1.25rem;
    height: 1.25rem;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
    border-radius: 3px;
}

.image-delete-icon {
    top: 0.5rem;
    color: red;
}

.image-primary-icon {
    top: 2rem;
    color: darkorange;
}
</style>
<style>
.image-placeholder[data-selected='false'] {
    opacity: 0.7;
}
</style>
