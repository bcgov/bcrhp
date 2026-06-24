<script setup lang="ts">
import { inject, computed } from 'vue';
import type { Ref } from 'vue';

import { formatPid } from '@/bcrhp/utils.ts';
import { type HeritageSiteType } from '@/bcrhp/schemas/heritage_site.ts';
import Fieldset from 'primevue/fieldset';

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite')!;
const emit = defineEmits(['update:stepIsValid']);

const propertyAddresses = computed(() => {
    return (
        heritageSite.value?.aliased_data?.heritage_site_location?.[0]
            ?.aliased_data?.bc_property_address ?? []
    );
});

const locations = computed(() => {
    return heritageSite?.value?.aliased_data.heritage_site_location ?? [];
});
</script>

<template>
    <div class="step-container">
        <div
            v-for="location in locations"
            :key="location.tileid"
        >
            <Fieldset
                legend="Address Information"
                class="review-fieldset"
            >
                <div v-if="propertyAddresses.length === 0">
                    No address provided.
                </div>

                <div
                    v-for="(property_address, index) in location.aliased_data
                        .bc_property_address"
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
                            {{
                                property_address.aliased_data.locality
                                    .display_value
                            }},
                            {{
                                property_address.aliased_data.city
                                    .display_value
                            }},
                            {{
                                property_address.aliased_data.postal_code
                                    .display_value
                            }}
                        </dd>

                        <dt>Detailed Location</dt>
                        <dd
                            v-html="
                                property_address.aliased_data
                                    .location_description.display_value || '-'
                            "
                        ></dd>

                        <dt>PID(s)</dt>
                        <dd>
                            <div
                                v-for="legalDescription in property_address
                                    .aliased_data
                                    .bc_property_legal_description || []"
                                :key="legalDescription"
                            >
                                <div>
                                    {{
                                        formatPid(
                                            legalDescription.aliased_data?.pid
                                                ?.node_value,
                                        ) || 'N/A'
                                    }}
                                </div>
                            </div>

                            <div
                                v-if="
                                    !property_address.aliased_data
                                        .bc_property_legal_description?.length
                                "
                            >
                                No PID(s) recorded.
                            </div>
                        </dd>
                    </div>
                </div>
            </Fieldset>
        </div>
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
