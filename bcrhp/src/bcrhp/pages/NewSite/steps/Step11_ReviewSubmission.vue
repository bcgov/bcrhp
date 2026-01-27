<script setup lang="ts">
import { computed, inject, type Ref } from 'vue';
import type { HeritageSiteType } from '@/bcrhp/schemas/heritage_site.ts';
import type { SiteNamesTileType } from '@/bcrhp/schemas/heritage_site/site_names.ts';
import { VIEW } from '@/arches_component_lab/widgets/constants.ts';
import GenericWidget from '@/arches_component_lab/generics/GenericWidget/GenericWidget.vue';
import Fieldset from 'primevue/fieldset';

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite')!;

const commonName = computed(() => {
    const commonNames = heritageSite.value.aliased_data.site_names.filter(
        (name: SiteNamesTileType) =>
            name?.aliased_data.name_type.display_value === 'Common',
    );
    return commonNames.length > 0 ? commonNames[0].aliased_data : '';
});

const otherNames = computed(() => {
    return heritageSite.value?.aliased_data.site_names.filter(
        (name: SiteNamesTileType) =>
            name?.aliased_data.name_type.display_value === 'Other',
    );
});
const isValid = function () {
    return true;
};

// This needs to be removed - added because ESLint was complaining. Need to figure out
// configuration so API methods are not
defineExpose({ isValid });
</script>
<template>
    <div class="step-title">Submission Details</div>
    <p class="p-margin-top-bottom">
        Please review the entered information prior to submitting the
        application:
    </p>
    <p class="p-underline-bold">Address</p>
    <div
        v-for="property_address in heritageSite?.aliased_data
            .heritage_site_location?.[0].aliased_data.bc_property_address ?? []"
        :key="property_address"
        class="mb-6"
    >
        <div class="div-grid-cols">
            <div>Street Address</div>
            <div>
                {{
                    property_address.aliased_data.street_address.display_value
                }}, {{ property_address.aliased_data.city.display_value }},
                {{ property_address.aliased_data.postal_code.display_value }}
            </div>

            <div>Detailed Location</div>
            <div>
                {{
                    property_address.aliased_data.location_description
                        .display_value
                }}
            </div>

            <div>Legal Description(s)</div>
            <div>
                <div
                    v-for="legalDescription in property_address.aliased_data
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
    <Fieldset
        legend="Site Names"
        class="review-fieldset"
    >
        <div class="div-grid-cols">
            <dt>Common</dt>
            <dd>
                {{ commonName?.name?.display_value }}
            </dd>
        </div>
        <div class="div-grid-cols">
            <dt>Alternate</dt>
            <dd>
                <div
                    v-for="otherName in otherNames"
                    :key="otherName"
                >
                    {{ otherName.aliased_data.name.display_value }}
                </div>
            </dd>
        </div>
    </Fieldset>
    <Fieldset
        legend="Official Recognition Details"
        class="review-fieldset"
    >
        <div
            v-for="recognitionDetail in heritageSite?.aliased_data.bc_right
                .aliased_data.protection_event ?? []"
            :key="recognitionDetail"
            class="div-grid-cols"
        >
            <dt>Start Date</dt>
            <dd>
                {{
                    recognitionDetail.aliased_data
                        .designation_or_protection_start_date?.display_value
                }}
            </dd>
            <dt>Legislative Act</dt>
            <dd>
                {{
                    recognitionDetail.aliased_data.legislative_act
                        ?.display_value
                }}
            </dd>
            <dt>Reference Number</dt>
            <dd>
                {{
                    recognitionDetail.aliased_data.reference_number
                        ?.display_value
                }}
            </dd>
        </div>
    </Fieldset>
    <Fieldset
        legend="Statement of Significance"
        class="review-fieldset"
    >
        <div class="div-grid-cols">
            <dt>Description</dt>
            <dd
                v-html="
                    heritageSite?.aliased_data
                        ?.bc_statement_of_significance?.[0]?.aliased_data
                        ?.physical_description.display_value
                "
            ></dd>
        </div>
        <div class="div-grid-cols">
            <dt>Heritage Value</dt>
            <dd
                v-html="
                    heritageSite?.aliased_data
                        ?.bc_statement_of_significance?.[0]?.aliased_data
                        ?.heritage_value.display_value
                "
            ></dd>
        </div>
        <div class="div-grid-cols">
            <dt>Character Defining Elements</dt>
            <dd
                v-html="
                    heritageSite?.aliased_data
                        ?.bc_statement_of_significance?.[0]?.aliased_data
                        ?.defining_elements.display_value
                "
            ></dd>
        </div>
        <div class="div-grid-cols">
            <dt>Document Location</dt>
            <dd>
                {{
                    heritageSite?.aliased_data
                        ?.bc_statement_of_significance?.[0]?.aliased_data
                        ?.document_location.display_value
                }}
            </dd>
        </div>
    </Fieldset>
    <Fieldset
        legend="Images"
        class="review-fieldset"
    >
        <div
            v-for="image in heritageSite?.aliased_data.site_images ?? []"
            :key="image"
            class="div-grid-cols mb-4 image-section"
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
    <Fieldset
        legend="Site Classification"
        class="review-fieldset"
    >
        <div class="div-grid-cols">
            <dt>Heritage Class</dt>
            <dd>
                <ol class="list-decimal ml-4">
                    <li
                        v-for="heritageClass in heritageSite?.aliased_data
                            .heritage_class ?? []"
                        :key="heritageClass"
                    >
                        {{
                            heritageClass.aliased_data.heritage_category
                                .display_value
                        }},
                        {{ heritageClass.aliased_data.ownership.display_value }}
                        ({{
                            heritageClass.aliased_data
                                .contributing_resource_count.display_value
                        }})
                    </li>
                </ol>
            </dd>
            <dt>Heritage Function</dt>
            <dd>
                <ol class="list-decimal ml-4">
                    <li
                        v-for="heritageFunction in heritageSite?.aliased_data
                            .heritage_function ?? []"
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
            </dd>
            <dt>Heritage Theme</dt>
            <dd>
                {{
                    heritageSite?.aliased_data?.heritage_theme?.aliased_data
                        ?.heritage_theme.display_value
                }}
            </dd>
        </div>
    </Fieldset>
    <Fieldset
        legend="Site Details"
        class="review-fieldset"
    >
        <div class="div-grid-cols">
            <dt>Chronology</dt>
            <dd>
                <ol class="list-decimal ml-4">
                    <li
                        v-for="chronology in heritageSite?.aliased_data
                            .chronology ?? []"
                        :key="chronology"
                    >
                        {{ chronology.aliased_data.chronology.display_value }},
                        {{
                            chronology.aliased_data.dates_approximate.node_value
                                ? 'Circa'
                                : ''
                        }}
                        {{
                            chronology.aliased_data.start_year.display_value
                        }}–{{ chronology.aliased_data.end_year.display_value }}
                        <p>
                            {{
                                chronology.aliased_data.chronology_notes
                                    .display_value
                            }}
                        </p>
                    </li>
                </ol>
            </dd>
            <dt>Architects / Builders</dt>
            <dd>
                <ol class="list-decimal ml-4">
                    <li
                        v-for="constructionActor in heritageSite?.aliased_data
                            .construction_actors"
                        :key="constructionActor ?? []"
                    >
                        {{
                            constructionActor.construction_actor_type
                                .display_value
                        }}
                        {{ constructionActor.construction_actor.display_value }}
                        <div>
                            {{
                                constructionActor.construction_actor_notes
                                    .display_value
                            }}
                        </div>
                    </li>
                </ol>
            </dd>
            <dt>URLs</dt>
            <dd>
                <ol class="list-decimal ml-4">
                    <li
                        v-for="url in heritageSite?.aliased_data.external_url ??
                        []"
                        :key="url"
                    >
                        {{ url.aliased_data.external_url_type.display_value }}:
                        {{ url.aliased_data.external_url.display_value }}
                        <!--                            <div>-->
                        <!--                                <strong>Link Text:</strong> {{ url.linkText }}-->
                        <!--                            </div>-->
                    </li>
                </ol>
            </dd>
            <!--            <div class="div-grid-cols">-->
            <!--                <div>Supporting Documents</div>-->
            <!--                <div>-->
            <!--                    <p>{{ heritageSite.documentDescription }}</p>-->
            <!--                    <p>{{ heritageSite.submissionNotes }}</p>-->
            <!--                </div>-->
            <!--            </div>-->
        </div>
    </Fieldset>
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
.image-section:not(:first-child) {
    border-top: thin solid #ccc;
    padding-top: 0.25rem;
    margin-top: 0.5rem;
}
</style>
<style>
fieldset.review-fieldset > legend {
    margin-bottom: 0.5rem;
    font-size: 1rem;
}
fieldset.review-fieldset div[data-node-alias='site_images'] {
    max-height: 150px;
    max-width: 150px;
}
</style>
