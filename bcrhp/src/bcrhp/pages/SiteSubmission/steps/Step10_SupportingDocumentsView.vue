<script setup lang="ts">
import { inject, computed } from 'vue';
import type { Ref } from 'vue';

import { type HeritageSiteType } from '@/bcrhp/schemas/heritage_site.ts';
import Fieldset from 'primevue/fieldset';

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite')!;

const siteDocuments = computed(() => {
    return heritageSite.value?.aliased_data?.site_document ?? [];
});
</script>

<template>
    <div class="step-container">
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
                <dd>
                    {{ doc.aliased_data.document_type?.display_value || '-' }}
                </dd>

                <dt>File Name</dt>
                <dd>
                    {{
                        doc.aliased_data.site_document?.node_value?.[0]?.name ||
                        '-'
                    }}
                </dd>

                <dt>Description</dt>
                <dd>
                    {{
                        doc.aliased_data.document_description?.display_value ||
                        '-'
                    }}
                </dd>
            </div>
        </Fieldset>
        <Fieldset
            v-if="
                heritageSite?.aliased_data?.internal_remark?.[0]?.aliased_data
                    ?.internal_remark?.display_value?.length ?? 0 > 0
            "
            legend="Submission Notes"
            class="review-fieldset"
        >
            <div
                v-html="
                    heritageSite?.aliased_data.internal_remark?.[0]
                        ?.aliased_data.internal_remark.display_value
                "
            ></div>
        </Fieldset>
    </div>
</template>
