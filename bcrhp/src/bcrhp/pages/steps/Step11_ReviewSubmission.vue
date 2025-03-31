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
        <p>Start Date {{ heritageSite.commonName }}</p>
        <p>Legislative Act {{ heritageSite.commonName }}</p>
        <div
            v-for="number in heritageSite.referenceNumbers"
            :key="number"
        >
            <p>Reference Number {{ number }}</p>
        </div>
    </div>
    <div>
        <p class="mb-2 underline font-bold">Statement of Significance</p>
        <p>Description <span v-html="heritageSite.description"> </span></p>
        <p>Heritage Value <span v-html="heritageSite.heritageValue"> </span></p>
        <p>
            Character Defining Elements
            <span v-html="heritageSite.definingElements"> </span>
        </p>
        <p>Document Location {{ heritageSite.documentLocation }}</p>
    </div>
    <div>
        <p class="mb-2 underline font-bold">Images</p>
        <div
            v-for="image in heritageSite.uploadImage"
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
                v-for="contributingResource in heritageSite.totalContributingResources"
                :key="contributingResource"
            >
                <p>{{ contributingResource }}</p>
            </div>
            <p>Heritage Function</p>
            <div
                v-for="heritageTheme in heritageSite.heritageThemes"
                :key="heritageTheme"
            >
                <p>{{ heritageTheme }}</p>
            </div>
            <p>Heritage Theme</p>
            <div
                v-for="functionCategory in heritageSite.functionCategories"
                :key="functionCategory"
            >
                <p>{{ functionCategory }}</p>
            </div>
        </div>
        <div>
            <p class="mb-2 underline font-bold">Site Classification</p>
            <p>Chronology</p>
            <div
                v-for="chronology in heritageSite.chronologies"
                :key="chronology"
            >
                <p>{{ chronology }}</p>
            </div>
            <p>Architects / Builders</p>
            <div
                v-for="architectOrBuilder in heritageSite.architectsOrBuilders"
                :key="architectOrBuilder"
            >
                <p>{{ architectOrBuilder }}</p>
            </div>
            <p>URLs</p>
            <div
                v-for="url in heritageSite.urls"
                :key="url"
            >
                <p>{{ url }}</p>
            </div>
        </div>
        <div>
            <p class="mb-2 underline font-bold">Supporting Documents</p>
            {{ heritageSite.documentDescription }}
            {{ heritageSite.submissionNotes }}
        </div>
    </div>
</template>
