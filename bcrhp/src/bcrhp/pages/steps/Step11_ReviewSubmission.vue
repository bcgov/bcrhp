<script setup lang="ts">
import { inject } from 'vue';
import type { HeritageSite } from '@/bcrhp/schema/HeritageSiteSchema.ts';

const heritageSite: typeof HeritageSite = inject(
    'heritageSite',
) as typeof HeritageSite;
</script>
<template>
    <div
        v-for="address in heritageSite.civicAddress"
        :key="address"
    >
        <p class="mb-2 underline font-bold">Address</p>
        <p>Street Address {{ address.streetAddress }}</p>
        <p>Detailed Location {{ address.streetAddress }}</p>
        <p>Legal Description {{ address.streetAddress }}</p>
    </div>
    <div>
        <p class="mb-2 underline font-bold">Site Names</p>
        <p>Common {{ heritageSite.commonName }}</p>
        <div
            v-for="name in heritageSite.otherNames"
            :key="name"
        >
            <p>Alternate {{ name }}</p>
        </div>
    </div>
    <div>
        <p class="mb-2 underline font-bold">Official Recognition Details</p>
        <div
            v-for="recognitionDetail in heritageSite.recognitionDetails
                .totalRecognitionDetails"
            :key="recognitionDetail"
        >
            <p>Start Date {{ recognitionDetail.designationDate }}</p>
            <p>Legislative Act {{ recognitionDetail.legislativeAct?.name }}</p>
            <p>Reference Number {{ recognitionDetail.referenceNumber }}</p>
        </div>
    </div>
    <div>
        <p class="mb-2 underline font-bold">Statement of Significance</p>
        <p>
            Description
            <span v-html="heritageSite.statementOfSignificance.description">
            </span>
        </p>
        <p>
            Heritage Value
            <span v-html="heritageSite.statementOfSignificance.heritageValue">
            </span>
        </p>
        <p>
            Character Defining Elements
            <span
                v-html="heritageSite.statementOfSignificance.definingElements"
            >
            </span>
        </p>
        <p>Document Location {{ heritageSite.documentLocation }}</p>
    </div>
    <div>
        <p class="mb-2 underline font-bold">Images</p>
        <div
            v-for="image in heritageSite.siteImages"
            :key="image"
        >
            <p>Type {{ image.imageType }}</p>
            <p>View {{ image.imageView }}</p>
            <p>Features {{ image.imageFeatures }}</p>
            <p>Date {{ image.imageDate }}</p>
            <p>Description {{ image.imageDescription }}</p>
            <p>Photographer {{ image.photographer }}</p>
            <p>Copyright {{ image.copyright }}</p>
        </div>
        <div>
            <p class="mb-2 underline font-bold">Site Details</p>
            <p>Heritage Class</p>
            <div
                v-for="heritageClass in heritageSite.siteClassification
                    .heritageClasses"
                :key="heritageClass"
            >
                <ol class="list-decimal ml-4">
                    <li>
                        {{ heritageClass.heritageCategory }},
                        {{ heritageClass.ownership }} ({{
                            heritageClass.contributingResources.name
                        }})
                    </li>
                </ol>
            </div>
            <p>Heritage Function</p>
            <div
                v-for="heritageFunction in heritageSite.siteClassification
                    .heritageFunctions"
                :key="heritageFunction"
            >
                <ol class="list-decimal ml-4">
                    <li>
                        {{ heritageFunction.functionCategory.name }} ({{
                            heritageFunction.functionCategoryType
                        }})
                    </li>
                </ol>
            </div>
            <p>Heritage Theme</p>
            <div
                v-for="heritageTheme in heritageSite.siteClassification
                    .heritageThemes"
                :key="heritageTheme"
            >
                <ol class="list-decimal ml-4">
                    <p>{{ heritageTheme.name }}</p>
                </ol>
            </div>
        </div>
        <div>
            <p class="mb-2 underline font-bold">Site Classification</p>
            <p>Chronology</p>
            <div
                v-for="chronology in heritageSite.siteDetails.chronologies"
                :key="chronology"
            >
                <ol class="list-decimal ml-4">
                    <li>
                        {{ chronology.eventType }}, {{ chronology.circa }}
                        {{ chronology.startYear }}-{{ chronology.endYear }}
                        <p>{{ chronology.chronologyNotes }}</p>
                    </li>
                </ol>
            </div>
            <p>Architects / Builders</p>
            <div
                v-for="architectOrBuilder in heritageSite.siteDetails
                    .architectsOrBuilders"
                :key="architectOrBuilder"
            >
                <ol class="list-decimal ml-4">
                    <li>
                        {{ architectOrBuilder.architectOrBuilderType.name }}
                        {{ architectOrBuilder.architectOrBuilderName }}
                    </li>
                    <p>{{ architectOrBuilder.architectOrBuilderNotes }}</p>
                </ol>
            </div>
            <p>URLs</p>
            <div
                v-for="url in heritageSite.siteDetails.urls"
                :key="url"
            >
                <ol class="list-decimal ml-4">
                    <li>
                        {{ url.urlType.name }}: {{ url.url }}
                        <p>Link Text: {{ url.linkText }}</p>
                    </li>
                </ol>
            </div>
        </div>
        <div>
            <p class="mb-2 underline font-bold">Supporting Documents</p>
            {{ heritageSite.documentDescription }}
            {{ heritageSite.submissionNotes }}
        </div>
    </div>
</template>
