<script setup lang="ts">
import { computed, inject, type Ref } from 'vue';
import type { HeritageSiteType } from '@/bcrhp/schemas/heritage_site.ts';
import type { SiteNamesTileType } from '@/bcrhp/schemas/heritage_site/site_names.ts';

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite')!;

const commonName = computed(() => {
    const commonNames = heritageSite.value.aliased_data.site_names.filter(
        (name: SiteNamesTileType) =>
            name?.aliased_data.name_type.display_value === 'Common',
    );
    return commonNames.length > 0 ? commonNames[0] : '';
});

const otherNames = computed(() => {
    return heritageSite.value?.aliased_data.site_names.filter(
        (name: SiteNamesTileType) =>
            name?.aliased_data.name_type.display_value === 'Other',
    );
});
</script>
<template>
    <div class="step-title">Submission Details</div>
    <p class="p-margin-top-bottom">
        Please review the entered information prior to submitting the
        application:
    </p>
    <p class="p-underline-bold">Address</p>
    <div
        v-for="location in heritageSite.value?.aliased_data
            .heritage_site_location ?? []"
        :key="location"
        class="mb-6"
    >
        <div class="div-grid-cols">
            <div>Street Address</div>
            <div>
                {{ location.aliased_data.street_address.display_value }},
                {{ location.aliased_data.city.display_value }},
                {{ location.aliased_data.postalCode.display_value }}
            </div>

            <div>Detailed Location</div>
            <div>
                {{ location.aliased_data.location_description.display_value }}
            </div>

            <div>Legal Description(s)</div>
            <div>
                <div
                    v-for="legalDescription in location.aliased_data
                        .bc_property_legal_description"
                    :key="legalDescription"
                    class="mb-1"
                >
                    PID: {{ legalDescription.aliased_data.pid.display_value }},
                    Legal Description:
                    {{
                        legalDescription.aliased_data.legal_description
                            .display_value
                    }}
                </div>
            </div>
        </div>
    </div>
    <div>
        <p class="p-underline-bold">Site Names</p>
        <div class="div-grid-cols">
            <div>Common</div>
            <div>{{ commonName }}</div>
        </div>
        <div class="div-grid-cols">
            <div>Alternate</div>
            <div>
                <div
                    v-for="name in otherNames"
                    :key="name"
                >
                    {{ name.display_value }}
                </div>
            </div>
        </div>
    </div>
    <div>
        <div class="p-underline-bold">Official Recognition Details</div>
        <div
            v-for="recognitionDetail in heritageSite.value?.aliased_data
                .bc_right.aliased_data.protection_event ?? []"
            :key="recognitionDetail"
            class="div-grid-cols"
        >
            <div>Start Date</div>
            <div>
                {{
                    recognitionDetail.aliased_data
                        .designation_or_protection_start_date.display_value
                }}
            </div>
            <div>Legislative Act</div>
            <div>{{ recognitionDetail.legislative_act?.display_value }}</div>
            <div>Reference Number</div>
            <div>{{ recognitionDetail.reference_number.display_value }}</div>
        </div>
    </div>
    <div>
        <div class="p-underline-bold">Statement of Significance</div>
        <div class="div-grid-cols">
            <div>Description</div>
            <span
                v-html="
                    heritageSite.value?.aliased_data
                        .bc_statement_of_significance.aliased_data.description
                        .display_value ?? []
                "
            >
            </span>
        </div>
        <div class="div-grid-cols">
            <div>Heritage Value</div>
            <span
                v-html="
                    heritageSite.value?.aliased_data
                        .bc_statement_of_significance.aliased_data
                        .heritage_value.display_value
                "
            >
            </span>
        </div>
        <div class="div-grid-cols">
            <div>Character Defining Elements</div>
            <span
                v-html="
                    heritageSite.value?.aliased_data
                        .bc_statement_of_significance.aliased_data
                        .defining_elements.display_value
                "
            >
            </span>
        </div>
        <div class="div-grid-cols">
            <p>Document Location</p>
            <div>
                {{
                    heritageSite.value?.aliased_data
                        .bc_statement_of_significance.aliased_data
                        .document_location.display_value
                }}
            </div>
        </div>
    </div>
    <div>
        <div class="mb-2">Images</div>
        <div>
            <div
                v-for="image in heritageSite.value?.aliased_data.site_images ??
                []"
                :key="image"
                class="div-grid-cols mb-4"
            >
                <div>Type</div>
                <div>{{ image.aliased_data.image_type.display_value }}</div>

                <div>View</div>
                <div>{{ image.aliased_data.image_view.display_value }}</div>

                <div>Features</div>
                <div>{{ image.aliased_data.image_features.display_value }}</div>

                <div>Date</div>
                <div>{{ image.aliased_data.image_date.display_value }}</div>

                <div>Description</div>
                <div>
                    {{ image.aliased_data.image_description.display_value }}
                </div>

                <div>Photographer</div>
                <div>{{ image.aliased_data.photographer.display_value }}</div>

                <div>Copyright</div>
                <div>{{ image.aliased_data.copyright.display_value }}</div>
            </div>
        </div>
        <div class="div-grid-cols">
            <div>Heritage Class</div>
            <div>
                <ol class="list-decimal ml-4">
                    <li
                        v-for="heritageClass in heritageSite.value?.aliased_data
                            .heritage_class ?? []"
                        :key="heritageClass"
                    >
                        {{
                            heritageClass.aliased_data.heritage_category
                                .display_value
                        }},
                        {{ heritageClass.aliased_data.ownership.display_value }}
                        (
                        {{
                            heritageClass.aliased_data
                                .contributing_resource_count.display_value
                        }}
                        )
                    </li>
                </ol>
            </div>
        </div>
        <div class="div-grid-cols">
            <div>Heritage Function</div>
            <div>
                <ol class="list-decimal ml-4">
                    <li
                        v-for="heritageFunction in heritageSite.value
                            ?.aliased_data.heritage_function ?? []"
                        :key="heritageFunction"
                    >
                        {{
                            heritageFunction.aliased_data.functional_category
                                .display_value
                        }}
                        ({{
                            heritageFunction.aliased_data.functional_state
                                .display_value
                        }})
                    </li>
                </ol>
            </div>
        </div>
        <div class="div-grid-cols">
            <div>Heritage Theme</div>
            <div>
                <ol class="list-decimal ml-4">
                    <li
                        v-for="heritageTheme in heritageSite.value?.aliased_data
                            .heritage_theme ?? []"
                        :key="heritageTheme"
                    >
                        {{
                            heritageTheme.aliased_data.heritage_theme
                                .display_value
                        }}
                    </li>
                </ol>
            </div>
        </div>
        <div>
            <div class="p-underline-bold">Site Classification</div>
            <div class="div-grid-cols">
                <div>Chronology</div>
                <div>
                    <ol class="list-decimal ml-4">
                        <li
                            v-for="chronology in heritageSite.value
                                ?.aliased_data.chronology ?? []"
                            :key="chronology"
                        >
                            {{ chronology.aliased_data.chronology }},
                            {{
                                chronology.aliased_data.dates_approximate
                                    .node_value
                                    ? 'Circa'
                                    : ''
                            }}
                            {{
                                chronology.aliased_data.start_year
                                    .display_value
                            }}–{{
                                chronology.aliased_data.end_year.display_value
                            }}
                            <p>
                                {{
                                    chronology.aliased_data.chronology_notes
                                        .display_value
                                }}
                            </p>
                        </li>
                    </ol>
                </div>
            </div>
            <div class="div-grid-cols">
                <div>Architects / Builders</div>
                <div>
                    <ol class="list-decimal ml-4">
                        <li
                            v-for="constructionActor in heritageSite.value
                                ?.aliased_data.construction_actors"
                            :key="constructionActor ?? []"
                        >
                            {{
                                constructionActor.construction_actor_type
                                    .display_value
                            }}
                            {{
                                constructionActor.construction_actor
                                    .display_value
                            }}
                            <div>
                                {{
                                    constructionActor.construction_actor_notes
                                        .display_value
                                }}
                            </div>
                        </li>
                    </ol>
                </div>
            </div>
            <div class="div-grid-cols">
                <div>URLs</div>
                <div>
                    <ol class="list-decimal ml-4">
                        <li
                            v-for="url in heritageSite.value?.aliased_data
                                .external_url ?? []"
                            :key="url"
                        >
                            {{
                                url.aliased_data.external_url_type
                                    .display_value
                            }}:
                            {{ url.aliased_data.external_url.display_value }}
                            <!--                            <div>-->
                            <!--                                <strong>Link Text:</strong> {{ url.linkText }}-->
                            <!--                            </div>-->
                        </li>
                    </ol>
                </div>
            </div>
            <!--            <div class="div-grid-cols">-->
            <!--                <div>Supporting Documents</div>-->
            <!--                <div>-->
            <!--                    <p>{{ heritageSite.documentDescription }}</p>-->
            <!--                    <p>{{ heritageSite.submissionNotes }}</p>-->
            <!--                </div>-->
            <!--            </div>-->
        </div>
    </div>
</template>
<style scoped>
.step-title {
    margin-bottom: 1rem;
    font-size: 21px;
    font-weight: bold;
    line-height: inherit;
    color: #333;
}
.p-margin-top-bottom {
    margin-top: 1.5rem;
    margin-bottom: 1rem;
}
.p-underline-bold {
    text-decoration: underline;
    font-weight: bold;
}
.div-grid-cols {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 0.75rem 1rem;
    align-items: start;
}
</style>
