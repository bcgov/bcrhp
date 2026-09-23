<script setup lang="ts">
import { inject, computed } from 'vue';
import type { Ref } from 'vue';

import { type HeritageSiteType } from '@/bcrhp/schemas/heritage_site.ts';
import Fieldset from 'primevue/fieldset';
import SimpleMap from '@/bcgov_arches_common/widgets/SimpleMap/SimpleMap.vue';
import { VIEW } from '@/arches_component_lab/widgets/constants.ts';

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite')!;

const siteBoundaryData = computed(() => {
    return (
        heritageSite.value?.aliased_data?.heritage_site_location?.[0]
            ?.aliased_data?.site_boundary?.[0]?.aliased_data?.site_boundary ??
        undefined
    );
});

const siteArea = computed(() => {
    const areaNode =
        heritageSite.value?.aliased_data?.heritage_site_location?.[0]
            ?.aliased_data?.site_boundary?.[0]?.aliased_data?.mapped_area;
    return areaNode?.display_value || areaNode?.node_value || null;
});
</script>

<template>
    <div class="step-container">
        <Fieldset
            legend="Site Boundary"
            class="review-fieldset"
        >
            <SimpleMap
                v-if="siteBoundaryData"
                graph-slug="heritage_site"
                node-alias="site_boundary"
                :mode="VIEW"
                :aliased-node-data="siteBoundaryData"
            />
            <p v-else>No boundary data uploaded.</p>
            <div
                v-if="siteArea"
                class="div-grid-cols mt-2"
            >
                <dt>Mapped Area</dt>
                <dd>{{ siteArea }}</dd>
            </div>
        </Fieldset>
    </div>
</template>
