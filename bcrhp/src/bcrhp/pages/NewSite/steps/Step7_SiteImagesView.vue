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
                class="image-section"
            >
                <GenericWidget
                    class="image-widget"
                    graph-slug="heritage_site"
                    node-alias="site_images"
                    :mode="VIEW"
                    :should-show-label="false"
                    :aliased-node-data="image.aliased_data.site_images"
                />

                <dl class="image-metadata">
                    <template
                        v-if="image.aliased_data.image_type.display_value"
                    >
                        <dt>Type</dt>
                        <dd>
                            {{ image.aliased_data.image_type.display_value }}
                        </dd>
                    </template>

                    <template
                        v-if="image.aliased_data.image_view.display_value"
                    >
                        <dt>View</dt>
                        <dd>
                            {{ image.aliased_data.image_view.display_value }}
                        </dd>
                    </template>

                    <template
                        v-if="image.aliased_data.image_features.display_value"
                    >
                        <dt>Features</dt>
                        <dd>
                            {{
                                image.aliased_data.image_features.display_value
                            }}
                        </dd>
                    </template>

                    <template
                        v-if="image.aliased_data.image_date.display_value"
                    >
                        <dt>Date</dt>
                        <dd>
                            {{ image.aliased_data.image_date.display_value }}
                        </dd>
                    </template>

                    <template
                        v-if="
                            image.aliased_data.image_description.display_value
                        "
                    >
                        <dt>Description</dt>
                        <dd
                            v-html="
                                image.aliased_data.image_description
                                    .display_value
                            "
                        ></dd>
                    </template>

                    <template
                        v-if="image.aliased_data.photographer.display_value"
                    >
                        <dt>Photographer</dt>
                        <dd>
                            {{ image.aliased_data.photographer.display_value }}
                        </dd>
                    </template>

                    <template v-if="image.aliased_data.copyright.display_value">
                        <dt>Copyright</dt>
                        <dd>
                            {{ image.aliased_data.copyright.display_value }}
                        </dd>
                    </template>
                </dl>
            </div>
        </Fieldset>
    </div>
</template>

<style scoped>
.image-section {
    display: flex;
    flex-direction: row;
    gap: 1.5rem;
    align-items: flex-start;
    padding: 0.75rem 0;
}

.image-section + .image-section {
    border-top: 1px solid #aaa;
}

.image-widget {
    flex: 0 0 auto;
    width: 240px;
}

.image-metadata {
    flex: 1 1 0;
    min-width: 0;
    display: grid;
    grid-template-columns: minmax(100px, auto) 1fr;
    align-content: start;
    gap: 0.25rem 0.75rem;
}
</style>
