<script setup lang="ts">
import { inject, ref, computed } from 'vue';
import type { Ref } from 'vue';

import { type HeritageSiteType } from '@/bcrhp/schemas/heritage_site.ts';
import Fieldset from 'primevue/fieldset';
import type { SiteNamesTileType } from '@/bcrhp/schemas/heritage_site/site_names.ts';

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite')!;
const emit = defineEmits(['update:stepIsValid']);
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
</script>

<template>
    <div class="step-container">
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
    </div>
</template>

<style>
.row {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
}
.button-padding {
    margin-left: 1.5rem;
    margin-right: 1.5rem;
}
.chip-row {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    margin: 1.5rem;
}
.add-legal-button {
    display: flex;
    align-items: center;
    justify-content: center;
    align-self: center;
    margin-right: 3rem;
}
.input-grow {
    width: 100%;
}
.dialogFonts {
    //font-size: 1rem;
}
.dialogFonts label {
    //font-size: 0.875rem;
}
.hidden {
    display: none;
}
</style>
