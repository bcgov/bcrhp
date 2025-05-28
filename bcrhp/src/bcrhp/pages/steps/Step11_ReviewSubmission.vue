<script setup lang="ts">
import { inject } from 'vue';
import type { HeritageSite } from '@/bcrhp/schema/HeritageSiteSchema.ts';

const heritageSite: typeof HeritageSite = inject(
    'heritageSite',
) as typeof HeritageSite;
</script>
<template>
    <p class="mb-2 underline font-bold">Address</p>
    <div
        v-for="address in heritageSite.civicAddresses"
        :key="address"
    >
        <div display="flex flex-col">
            <div>Street Address</div>
            <div class="justify-self-center">
                {{ address.streetAddress }}, {{ address.city }},
                {{ address.postalCode }}
            </div>
            <div>Detailed Location</div>
            <div class="justify-self-center">
                {{ address.locationDescription }}
            </div>
            <div>Legal Description</div>
            <div
                v-for="legalDescription in heritageSite.civicAddress
                    .legalDescriptions"
                :key="legalDescription"
                class="justify-self-center"
            >
                <div>PID:</div>
                {{ legalDescription.parcelId }}
                <div>Legal Address</div>
                {{ legalDescription.legalAddress }}
            </div>
        </div>
    </div>
    <div>
        <p class="underline font-bold">Site Names</p>
        <div display="flex flex-col">
            <div>Common</div>
            <div class="justify-self-center">{{ heritageSite.commonName }}</div>
        </div>
        <div class="flex flex-col">
            <div
                v-for="name in heritageSite.otherNames"
                :key="name"
            >
                <div>Alternate</div>
                <div class="justify-self-center">{{ name }}</div>
            </div>
        </div>
    </div>
    <div>
        <div class="mb-2 underline font-bold mt-2">
            Official Recognition Details
        </div>
        <div class="flex flex-col">
            <div
                v-for="recognitionDetail in heritageSite.recognitionDetails
                    .totalRecognitionDetails"
                :key="recognitionDetail"
            >
                <div>Start Date</div>
                <div class="justify-self-center">
                    {{ recognitionDetail.designationDate }}
                </div>
                <div>Legislative Act</div>
                <div class="justify-self-center">
                    {{ recognitionDetail.legislativeAct?.name }}
                </div>
                <div>Reference Number</div>
                <div class="justify-self-center">
                    {{ recognitionDetail.referenceNumber }}
                </div>
            </div>
        </div>
    </div>
    <div>
        <div class="mb-2 underline font-bold mt-2">
            Statement of Significance
        </div>
        <div class="grid grid-cols-2">
            <div>Description</div>
            <span v-html="heritageSite.statementOfSignificance.description">
            </span>
            <div>Heritage Value</div>
            <span v-html="heritageSite.statementOfSignificance.heritageValue">
            </span>
            <div>Character Defining Elements</div>
            <span
                v-html="heritageSite.statementOfSignificance.definingElements"
            >
            </span>
            <p>Document Location</p>
            <div>{{ heritageSite.documentLocation }}</div>
        </div>
    </div>
    <div>
        <div class="mb-2 underline font-bold mt-2">Images</div>
        <div
            v-for="image in heritageSite.siteImages"
            :key="image"
        >
            <div display="flex flex-col">
                <div>Type</div>
                <div class="justify-self-center">{{ image?.imageType }}</div>
                <div>View</div>
                <div class="justify-self-center">{{ image?.imageView }}</div>
                <div>Features</div>
                <div class="justify-self-center">
                    {{ image?.imageFeatures }}
                </div>
                <div>Date</div>
                <div class="justify-self-center">{{ image?.imageDate }}</div>
                <div>Description</div>
                <div class="justify-self-center">
                    {{ image?.imageDescription }}
                </div>
                <div>Photographer</div>
                <div class="justify-self-center">{{ image?.photographer }}</div>
                <div>Copyright</div>
                <div class="justify-self-center">{{ image?.copyright }}</div>
            </div>
        </div>
        <div>
            <div class="mb-2 mt-2 underline font-bold">Site Details</div>
            <div display="flex flex-col">
                <div>Heritage Class</div>
                <div
                    v-for="heritageClass in heritageSite.siteClassification
                        .heritageClasses"
                    :key="heritageClass"
                >
                    <ol class="list-decimal ml-4 justify-self-center">
                        <li>
                            {{ heritageClass.heritageCategory }},
                            {{ heritageClass.ownership }} ({{
                                heritageClass.contributingResources.name
                            }})
                        </li>
                    </ol>
                </div>
            </div>
            <div display="flex flex-col">
                <div>Heritage Function</div>
                <div
                    v-for="heritageFunction in heritageSite.siteClassification
                        .heritageFunctions"
                    :key="heritageFunction"
                >
                    <ol class="list-decimal ml-4 justify-self-center">
                        <li>
                            {{ heritageFunction.functionCategory.name }} ({{
                                heritageFunction.functionCategoryType
                            }})
                        </li>
                    </ol>
                </div>
            </div>
            <div display="flex flex-col">
                <div>Heritage Theme</div>
                <div
                    v-for="heritageTheme in heritageSite.siteClassification
                        .heritageThemes"
                    :key="heritageTheme"
                >
                    <ol class="list-decimal ml-4 justify-self-center">
                        <p>{{ heritageTheme.name }}</p>
                    </ol>
                </div>
            </div>
        </div>
        <div>
            <div class="mb-2 underline font-bold mt-2">Site Classification</div>
            <div class="flex flex-col">
                <div>Chronology</div>
                <div
                    v-for="chronology in heritageSite.siteDetails.chronologies"
                    :key="chronology"
                >
                    <ol class="list-decimal ml-4 justify-self-center">
                        <li>
                            {{ chronology.eventType }}, {{ chronology.circa }}
                            {{ chronology.startYear }}-{{ chronology.endYear }}
                            <p>{{ chronology.chronologyNotes }}</p>
                        </li>
                    </ol>
                </div>
            </div>
            <div class="flex flex-col">
                <div>Architects / Builders</div>
                <div
                    v-for="architectOrBuilder in heritageSite.siteDetails
                        .architectsOrBuilders"
                    :key="architectOrBuilder"
                >
                    <ol class="list-decimal ml-4 justify-self-center">
                        <li>
                            {{ architectOrBuilder.architectOrBuilderType.name }}
                            {{ architectOrBuilder.architectOrBuilderName }}
                        </li>
                        <div>
                            {{ architectOrBuilder.architectOrBuilderNotes }}
                        </div>
                    </ol>
                </div>
            </div>
            <div class="flex flex-col">
                <div>URLs</div>
                <div
                    v-for="url in heritageSite.siteDetails.urls"
                    :key="url"
                >
                    <ol class="list-decimal ml-4 justify-self-center">
                        <li>
                            {{ url.urlType.name }}: {{ url.url }}
                            <div>Link Text:</div>
                            {{ url.linkText }}
                        </li>
                    </ol>
                </div>
            </div>
            <div>
                <div class="mb-2 underline font-bold mt-2">
                    Supporting Documents
                </div>
                <div display="flex flex-col">
                    {{ heritageSite.documentDescription }}
                    {{ heritageSite.submissionNotes }}
                </div>
            </div>
        </div>
    </div>
</template>
