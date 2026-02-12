<script setup lang="ts">
import { computed, inject, type Ref } from 'vue';
import Message from 'primevue/message';
import type { HeritageSiteType } from '@/bcrhp/schemas/heritage_site.ts';
import type { SiteNamesTileType } from '@/bcrhp/schemas/heritage_site/site_names.ts';
import { currentDateValue } from '@/bcrhp/utils.ts';
import { VIEW } from '@/arches_component_lab/widgets/constants.ts';
import GenericWidget from '@/arches_component_lab/generics/GenericWidget/GenericWidget.vue';
import Fieldset from 'primevue/fieldset';
import type { ErrorMessage } from '@/bcrhp/types.ts';

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite')!;
const today = currentDateValue();

defineProps<{
    submissionErrors: ErrorMessage[];
}>();

// Helper to safely get the addresses
const propertyAddresses = computed(() => {
    return (
        heritageSite.value?.aliased_data?.heritage_site_location?.[0]
            ?.aliased_data?.bc_property_address ?? []
    );
});

const commonName = computed(() => {
    const commonNames = heritageSite.value?.aliased_data?.site_names.filter(
        (name: SiteNamesTileType) =>
            name?.aliased_data.name_type.display_value === 'Common',
    );
    return commonNames?.length > 0 ? commonNames[0].aliased_data : null;
});

const otherNames = computed(() => {
    return (
        heritageSite.value?.aliased_data?.site_names.filter(
            (name: SiteNamesTileType) =>
                name?.aliased_data.name_type.display_value === 'Other',
        ) ?? []
    );
});

// NEW: Helper to get site documents
const siteDocuments = computed(() => {
    return heritageSite.value?.aliased_data?.site_document ?? [];
});

const isValid = function () {
    //add the date to submission
    const adminList = heritageSite.value?.aliased_data?.site_record_admin;

    if (adminList && adminList.length === 0) {
        adminList.push({
            aliased_data: {
                date_submitted_to_crhp: {
                    ...today,
                    display_value: today.node_value,
                },
            },
        } as any);
    }

    return true;
};

defineExpose({ isValid });
</script>

<template>
    <div class="step-title">Submission Details</div>

    <div class="row">
        <dt>Submission Date:&nbsp;</dt>
        <dd>
            {{
                heritageSite.aliased_data?.site_record_admin?.[0]?.aliased_data
                    ?.date_submitted_to_crhp?.display_value || today.node_value
            }}
        </dd>
    </div>

    <section
        v-if="submissionErrors && submissionErrors.length"
        class="mt-4"
    >
        <h3 class="text-lg font-semibold mb-2 text-red-600">
            Submission Errors
        </h3>

        <div class="flex flex-col gap-2">
            <Message
                v-for="(error, index) in submissionErrors"
                :key="index"
                severity="error"
                :closable="false"
            >
                <div class="flex flex-col sm:flex-row sm:items-center gap-1">
                    <span class="font-medium">{{ error.error }}</span>
                    <span class="text-sm text-gray-600"
                        >({{ error.type }})</span
                    >
                </div>
                <div class="text-sm">
                    {{ error.message }}
                </div>
            </Message>
        </div>
    </section>
    <p>
        Please review the entered information prior to submitting the
        application:
    </p>

    <Fieldset legend="Address Information">
        <div v-if="propertyAddresses.length === 0">No address provided.</div>

        <div
            v-for="(property_address, index) in propertyAddresses"
            :key="property_address"
            :class="{ 'border-t pt-4 mt-4': index > 0 }"
        >
            <div class="div-grid-cols">
                <dt>Street Address</dt>
                <dd>
                    {{
                        property_address.aliased_data.street_address
                            .display_value
                    }},
                    {{ property_address.aliased_data.locality.display_value }},
                    {{ property_address.aliased_data.city.display_value }},
                    {{
                        property_address.aliased_data.postal_code.display_value
                    }}
                </dd>

                <dt>Detailed Location</dt>
                <dd>
                    {{
                        property_address.aliased_data.location_description
                            .display_value || '-'
                    }}
                </dd>

                <dt>Legal Description(s)</dt>
                <dd>
                    <div
                        v-for="legalDescription in property_address.aliased_data
                            .bc_property_legal_description || []"
                        :key="legalDescription"
                    >
                        <div>
                            <span>PID:</span>
                            {{
                                legalDescription.aliased_data.pid
                                    ?.display_value || 'N/A'
                            }}
                        </div>
                        <div>
                            <span>Description:</span>
                            {{
                                legalDescription.aliased_data.legal_description
                                    ?.display_value || 'N/A'
                            }}
                        </div>
                    </div>

                    <div
                        v-if="
                            !property_address.aliased_data
                                .bc_property_legal_description?.length
                        "
                    >
                        No legal descriptions recorded.
                    </div>
                </dd>
            </div>
        </div>
    </Fieldset>

    <Fieldset
        legend="Site Names"
        class="review-fieldset"
    >
        <div class="div-grid-cols">
            <dt>Common</dt>
            <dd>
                {{ commonName?.name?.display_value || 'None provided' }}
            </dd>
        </div>
        <div class="div-grid-cols">
            <dt>Alternate</dt>
            <dd>
                <div v-if="otherNames.length === 0">-</div>
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
            class="div-grid-cols mb-4"
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
                        ?.physical_description.display_value || '-'
                "
            ></dd>
        </div>
        <div class="div-grid-cols">
            <dt>Heritage Value</dt>
            <dd
                v-html="
                    heritageSite?.aliased_data
                        ?.bc_statement_of_significance?.[0]?.aliased_data
                        ?.heritage_value.display_value || '-'
                "
            ></dd>
        </div>
        <div class="div-grid-cols">
            <dt>Character Defining Elements</dt>
            <dd
                v-html="
                    heritageSite?.aliased_data
                        ?.bc_statement_of_significance?.[0]?.aliased_data
                        ?.defining_elements.display_value || '-'
                "
            ></dd>
        </div>
        <div class="div-grid-cols">
            <dt>Document Location</dt>
            <dd>
                {{
                    heritageSite?.aliased_data
                        ?.bc_statement_of_significance?.[0]?.aliased_data
                        ?.document_location.display_value || '-'
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
                        }}
                        {{ heritageClass.aliased_data.ownership.display_value }}
                        {{
                            heritageClass.aliased_data
                                .contributing_resource_count.display_value
                        }}
                    </li>
                </ol>
            </dd>
            <dt>Heritage Function</dt>
            <dd>
                <ol>
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
                <ol class="list-decimal">
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
                <ol class="list-decimal">
                    <li
                        v-for="constructionActor in heritageSite?.aliased_data
                            .construction_actors"
                        :key="constructionActor ?? []"
                    >
                        {{
                            constructionActor.aliased_data
                                .construction_actor_type.display_value
                        }}
                        {{
                            constructionActor.aliased_data
                                .construction_actor_type.display_value
                        }}
                        {{
                            constructionActor.aliased_data.construction_actor
                                .display_value
                        }}
                        <div>
                            {{
                                constructionActor.aliased_data
                                    .construction_actor_notes.display_value
                            }}
                        </div>
                    </li>
                </ol>
            </dd>
            <dt>URLs</dt>
            <dd>
                <ol>
                    <li
                        v-for="url in heritageSite?.aliased_data.external_url ??
                        []"
                        :key="url"
                    >
                        {{ url.aliased_data.external_url_type.display_value }}:
                        {{ url.aliased_data.external_url.display_value }}
                    </li>
                </ol>
            </dd>
        </div>
    </Fieldset>

    <Fieldset
        legend="Supporting Documents"
        class="review-fieldset"
    >
        <div v-if="siteDocuments.length === 0">No documents uploaded.</div>
        <div
            v-for="(doc, index) in siteDocuments"
            :key="doc"
            :class="{ 'border-t pt-4 mt-4': index > 0 }"
            class="div-grid-cols mb-2"
        >
            <dt>Document Type</dt>
            <dd>{{ doc.aliased_data.document_type?.display_value || '-' }}</dd>

            <dt>File Name</dt>
            <dd>
                {{
                    doc.aliased_data.site_document?.node_value?.[0]?.name || '-'
                }}
            </dd>

            <dt>Description</dt>
            <dd>
                {{
                    doc.aliased_data.document_description?.display_value || '-'
                }}
            </dd>
        </div>
    </Fieldset>

    <Fieldset
        v-if="
            heritageSite.submissionNotes &&
            heritageSite.submissionNotes !== '<p><br></p>'
        "
        legend="Submission Notes"
        class="review-fieldset"
    >
        <div v-html="heritageSite.submissionNotes"></div>
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
.div-grid-cols dt {
    font-weight: bold;
    color: #444;
}
.image-section:not(:first-child) {
    border-top: thin solid #ccc;
    padding-top: 0.25rem;
    margin-top: 0.5rem;
}
dt {
    margin-left: 0.75rem;
}
</style>
<style>
fieldset.review-fieldset > legend {
    margin-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: 700;
}
fieldset.review-fieldset div[data-node-alias='site_images'] {
    max-height: 150px;
    max-width: 150px;
}
</style>
