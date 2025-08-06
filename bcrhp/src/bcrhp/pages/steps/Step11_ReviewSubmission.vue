<script setup lang="ts">
import { inject } from 'vue';
import type { HeritageSite } from '@/bcrhp/schema/HeritageSiteSchema.ts';

const heritageSite: typeof HeritageSite = inject(
    'heritageSite',
) as typeof HeritageSite;
</script>
<template>
    <div class="step-title">Submission Details</div>
    <p class="p-margin-top-bottom">
        Please review the entered information prior to submitting the
        application:
    </p>
    <p class="p-underline-bold">Address</p>
    <div
        v-for="address in heritageSite.civicAddresses"
        :key="address"
        class="mb-6"
    >
        <div class="div-grid-cols">
            <div>Street Address</div>
            <div>
                {{ address.streetAddress }}, {{ address.city }},
                {{ address.postalCode }}
            </div>

            <div>Detailed Location</div>
            <div>{{ address.locationDescription }}</div>

            <div>Legal Description(s)</div>
            <div>
                <div
                    v-for="legalDescription in address.legalDescriptions"
                    :key="legalDescription"
                    class="mb-1"
                >
                    PID: {{ legalDescription.parcelId }}, Legal Description:
                    {{ legalDescription.legalAddress }}
                </div>
            </div>
        </div>
    </div>
    <div>
        <p class="p-underline-bold">Site Names</p>
        <div class="div-grid-cols">
            <div>Common</div>
            <div>{{ heritageSite.commonName }}</div>
        </div>
        <div class="div-grid-cols">
            <div>Alternate</div>
            <div>
                <div
                    v-for="name in heritageSite.otherNames"
                    :key="name"
                >
                    {{ name }}
                </div>
            </div>
        </div>
    </div>
    <div>
        <div class="p-underline-bold">Official Recognition Details</div>
        <div
            v-for="recognitionDetail in heritageSite.recognitionDetails
                .totalRecognitionDetails"
            :key="recognitionDetail"
            class="div-grid-cols"
        >
            <div>Start Date</div>
            <div>{{ recognitionDetail.designationDate }}</div>
            <div>Legislative Act</div>
            <div>{{ recognitionDetail.legislativeAct?.name }}</div>
            <div>Reference Number</div>
            <div>{{ recognitionDetail.referenceNumber }}</div>
        </div>
    </div>
    <div>
        <div class="p-underline-bold">Statement of Significance</div>
        <div class="div-grid-cols">
            <div>Description</div>
            <span v-html="heritageSite.statementOfSignificance.description">
            </span>
        </div>
        <div class="div-grid-cols">
            <div>Heritage Value</div>
            <span v-html="heritageSite.statementOfSignificance.heritageValue">
            </span>
        </div>
        <div class="div-grid-cols">
            <div>Character Defining Elements</div>
            <span
                v-html="heritageSite.statementOfSignificance.definingElements"
            >
            </span>
        </div>
        <div class="div-grid-cols">
            <p>Document Location</p>
            <div>{{ heritageSite.documentLocation }}</div>
        </div>
    </div>
    <div>
        <div class="mb-2">Images</div>
        <div>
            <div
                v-for="image in heritageSite.siteImages"
                :key="image"
                class="div-grid-cols mb-4"
            >
                <div>Type</div>
                <div>{{ image?.imageType }}</div>

                <div>View</div>
                <div>{{ image?.imageView }}</div>

                <div>Features</div>
                <div>{{ image?.imageFeatures }}</div>

                <div>Date</div>
                <div>{{ image?.imageDate }}</div>

                <div>Description</div>
                <div>{{ image?.imageDescription }}</div>

                <div>Photographer</div>
                <div>{{ image?.photographer }}</div>

                <div>Copyright</div>
                <div>{{ image?.copyright }}</div>
            </div>
        </div>
        <div class="div-grid-cols">
            <div>Heritage Class</div>
            <div>
                <ol class="list-decimal ml-4">
                    <li
                        v-for="heritageClass in heritageSite.siteClassification
                            .heritageClasses"
                        :key="heritageClass"
                    >
                        {{ heritageClass.heritageCategory }},
                        {{ heritageClass.ownership }} (
                        {{ heritageClass.contributingResources }} )
                    </li>
                </ol>
            </div>
        </div>
        <div class="div-grid-cols">
            <div>Heritage Function</div>
            <div>
                <ol class="list-decimal ml-4">
                    <li
                        v-for="heritageFunction in heritageSite
                            .siteClassification.heritageFunctions"
                        :key="heritageFunction"
                    >
                        {{ heritageFunction.functionCategory }} ({{
                            heritageFunction.functionCategoryType
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
                        v-for="heritageTheme in heritageSite.siteClassification
                            .heritageThemes"
                        :key="heritageTheme"
                    >
                        {{ heritageTheme }}
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
                            v-for="chronology in heritageSite.siteDetails
                                .chronologies"
                            :key="chronology"
                        >
                            {{ chronology.eventType }}, {{ chronology.circa }}
                            {{ chronology.startYear }}–{{ chronology.endYear }}
                            <p>{{ chronology.chronologyNotes }}</p>
                        </li>
                    </ol>
                </div>
            </div>
            <div class="div-grid-cols">
                <div>Architects / Builders</div>
                <div>
                    <ol class="list-decimal ml-4">
                        <li
                            v-for="architectOrBuilder in heritageSite
                                .siteDetails.architectsOrBuilders"
                            :key="architectOrBuilder"
                        >
                            {{ architectOrBuilder.architectOrBuilderType.name }}
                            {{ architectOrBuilder.architectOrBuilderName }}
                            <div>
                                {{ architectOrBuilder.architectOrBuilderNotes }}
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
                            v-for="url in heritageSite.siteDetails.urls"
                            :key="url"
                        >
                            {{ url.urlType }}: {{ url.url }}
                            <div>
                                <strong>Link Text:</strong> {{ url.linkText }}
                            </div>
                        </li>
                    </ol>
                </div>
            </div>
            <div class="div-grid-cols">
                <div>Supporting Documents</div>
                <div>
                    <p>{{ heritageSite.documentDescription }}</p>
                    <p>{{ heritageSite.submissionNotes }}</p>
                </div>
            </div>
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
