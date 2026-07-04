<script setup lang="ts">
import { inject, computed } from 'vue';
import type { Ref } from 'vue';

import { type HeritageSiteType } from '@/bcrhp/schemas/heritage_site.ts';
import Fieldset from 'primevue/fieldset';

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite')!;
const emit = defineEmits(['update:stepIsValid']);

const sos = computed(() => {
    return (
        heritageSite.value?.aliased_data?.bc_statement_of_significance?.[0]
            ?.aliased_data ?? null
    );
});
</script>

<template>
    <div class="step-container">
        <Fieldset
            legend="Statement of Significance"
            class="review-fieldset"
        >
            <div class="div-grid-cols">
                <dt>Description</dt>
                <dd
                    v-html="sos?.physical_description.display_value || '-'"
                ></dd>
            </div>
            <div class="div-grid-cols">
                <dt>Heritage Value</dt>
                <dd v-html="sos?.heritage_value.display_value || '-'"></dd>
            </div>
            <div class="div-grid-cols">
                <dt>Character Defining Elements</dt>
                <dd v-html="sos?.defining_elements.display_value || '-'"></dd>
            </div>
            <div class="div-grid-cols">
                <dt>Document Location</dt>
                <dd>{{ sos?.document_location.display_value || '-' }}</dd>
            </div>
        </Fieldset>
    </div>
</template>
