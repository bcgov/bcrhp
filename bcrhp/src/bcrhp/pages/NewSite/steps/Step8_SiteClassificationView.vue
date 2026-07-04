<script setup lang="ts">
import { inject } from 'vue';
import type { Ref } from 'vue';

import { type HeritageSiteType } from '@/bcrhp/schemas/heritage_site.ts';
import Fieldset from 'primevue/fieldset';

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite')!;
const emit = defineEmits(['update:stepIsValid']);
</script>

<template>
    <div class="step-container">
        <Fieldset
            legend="Site Classification"
            class="review-fieldset"
        >
            <div class="div-grid-cols">
                <dt>Heritage Class</dt>
                <dd>
                    <ol class="list-decimal ml-4">
                        <li
                            v-for="heritageClass in heritageSite?.aliased_data
                                .heritage_class ?? []"
                            :key="heritageClass"
                        >
                            {{
                                heritageClass.aliased_data.heritage_category
                                    .display_value
                            }}
                            {{
                                heritageClass.aliased_data.ownership
                                    .display_value
                            }}
                            {{
                                heritageClass.aliased_data
                                    .contributing_resource_count.display_value
                            }}
                        </li>
                    </ol>
                </dd>
                <dt>Heritage Function</dt>
                <dd>
                    <ol>
                        <li
                            v-for="heritageFunction in heritageSite
                                ?.aliased_data.heritage_function ?? []"
                            :key="heritageFunction"
                        >
                            {{
                                heritageFunction.aliased_data
                                    .functional_category.display_value
                            }}
                            ({{
                                heritageFunction.aliased_data.functional_state
                                    .display_value
                            }})
                        </li>
                    </ol>
                </dd>
                <dt>Heritage Theme</dt>
                <dd>
                    {{
                        heritageSite?.aliased_data?.heritage_theme?.aliased_data
                            ?.heritage_theme.display_value
                    }}
                </dd>
            </div>
        </Fieldset>
    </div>
</template>
