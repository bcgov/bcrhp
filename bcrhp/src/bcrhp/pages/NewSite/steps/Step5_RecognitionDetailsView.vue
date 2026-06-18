<script setup lang="ts">
import { inject, ref, computed } from 'vue';
import type { Ref } from 'vue';

import { type HeritageSiteType } from '@/bcrhp/schemas/heritage_site.ts';
import Fieldset from 'primevue/fieldset';
import type { SiteNamesTileType } from '@/bcrhp/schemas/heritage_site/site_names.ts';

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite')!;
const emit = defineEmits(['update:stepIsValid']);
</script>

<template>
    <div class="step-container">
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
    </div>
</template>

<style>
.mb-4 {
    margin-bottom: 1rem;
}
</style>
