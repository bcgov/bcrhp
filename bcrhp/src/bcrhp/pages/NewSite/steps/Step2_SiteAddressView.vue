<script setup lang="ts">
import { inject, ref, computed } from 'vue';
import type { Ref } from 'vue';

import Checkbox from 'primevue/checkbox';
import { Form, type FormInstance } from '@primevue/forms';
import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import { convertNbspToSpaces } from '@/bcgov_arches_common/datatypes/string/validation/utils.ts';
import LabelledCheckboxInput from '@/bcgov_arches_common/components/labelledinput/LabelledCheckbox.vue';
import GenericWidget from '@/arches_component_lab/generics/GenericWidget/GenericWidget.vue';
import type { AliasedNodeData } from '@/arches_component_lab/types.ts';
import type { StringValue } from '@/arches_component_lab/datatypes/string/types.ts';
import {
    formatPid,
    updateModelValue as baseUpdateModelValue,
} from '@/bcrhp/utils.ts';
import { getPidData } from '@/bcrhp/api.ts';
import { type HeritageSiteType } from '@/bcrhp/schemas/heritage_site.ts';
import { getHeritageSiteLocation } from '@/bcrhp/schemas/heritage_site/heritage_site_location.ts';
import {
    BcPropertyAddressTileSchema,
    type BcPropertyAddressTileType,
    getPropertyAddress,
} from '@/bcrhp/schemas/heritage_site/bc_property_address.ts';
import {
    type BcPropertyLegalDescriptionTileType,
    getLegalDescription,
} from '@/bcrhp/schemas/heritage_site/bc_property_legal_description.ts';
import { VIEW } from '@/arches_component_lab/widgets/constants.ts';
import FieldSet from 'primevue/fieldset';
import Fieldset from 'primevue/fieldset';

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite')!;
const emit = defineEmits(['update:stepIsValid']);
const isValidatingPid = ref(false);
const currentPidLength = ref(0);
const pidSuccess = ref(false);

// Refs and state
let hasPropertyAddress = ref(true);
let currentPropertyAddress: Ref<BcPropertyAddressTileType> =
    ref(getPropertyAddress());

const propertyAddressList = computed(() => {
    return (
        heritageSite.value?.aliased_data?.heritage_site_location?.[0]
            ?.aliased_data?.bc_property_address ?? []
    );
});
const legalDescriptionList = computed(() => {
    return (
        currentPropertyAddress.value?.aliased_data
            ?.bc_property_legal_description ?? []
    );
});

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
