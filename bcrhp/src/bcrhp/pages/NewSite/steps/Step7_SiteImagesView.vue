<script setup lang="ts">
import { inject } from 'vue';
import type { Ref } from 'vue';

import { type HeritageSiteType } from '@/bcrhp/schemas/heritage_site.ts';
import Fieldset from 'primevue/fieldset';
import GenericWidget from '@/arches_component_lab/generics/GenericWidget/GenericWidget.vue';
import { VIEW } from '@/arches_component_lab/widgets/constants.ts';

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite')!;
const emit = defineEmits(['update:stepIsValid']);
</script>

<template>
    <div class="step-container">
        <Fieldset
            legend="Images"
            class="review-fieldset"
        >
            <div
                v-for="image in heritageSite?.aliased_data.site_images ?? []"
                :key="image"
                class="div-grid-cols image-section"
            >
                <dt>Image</dt>
                <GenericWidget
                    graph-slug="heritage_site"
                    node-alias="site_images"
                    :mode="VIEW"
                    :should-show-label="false"
                    :aliased-node-data="image.aliased_data.site_images"
                />

                <dt>Type</dt>
                <dd>{{ image.aliased_data.image_type.display_value }}</dd>

                <dt>View</dt>
                <dd>{{ image.aliased_data.image_view.display_value }}</dd>

                <dt>Features</dt>
                <dd>{{ image.aliased_data.image_features.display_value }}</dd>

                <dt>Date</dt>
                <dd>{{ image.aliased_data.image_date.display_value }}</dd>

                <dt>Description</dt>
                <dd
                    v-html="image.aliased_data.image_description.display_value"
                ></dd>

                <dt>Photographer</dt>
                <dd>{{ image.aliased_data.photographer.display_value }}</dd>

                <dt>Copyright</dt>
                <dd>{{ image.aliased_data.copyright.display_value }}</dd>
            </div>
        </Fieldset>
    </div>
</template>
