<script setup lang="ts">
import { inject } from 'vue';
import type { Ref } from 'vue';

import { type HeritageSiteType } from '@/bcrhp/schemas/heritage_site.ts';
import Fieldset from 'primevue/fieldset';

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite')!;
</script>

<template>
    <div class="step-container">
        <Fieldset
            legend="Site Details"
            class="review-fieldset"
        >
            <div class="div-grid-cols">
                <dt>Chronology</dt>
                <dd>
                    <ol class="list-decimal">
                        <li
                            v-for="chronology in heritageSite?.aliased_data
                                .chronology ?? []"
                            :key="chronology"
                        >
                            {{
                                chronology.aliased_data.chronology
                                    .display_value
                            }},
                            {{
                                chronology.aliased_data.dates_approximate
                                    .node_value
                                    ? 'Circa'
                                    : ''
                            }}
                            {{
                                chronology.aliased_data.start_year
                                    .display_value
                            }}–{{
                                chronology.aliased_data.end_year.display_value
                            }}
                            <p>
                                {{
                                    chronology.aliased_data.chronology_notes
                                        .display_value
                                }}
                            </p>
                        </li>
                    </ol>
                </dd>
                <dt>Architects / Builders</dt>
                <dd>
                    <ol class="list-decimal">
                        <li
                            v-for="constructionActor in heritageSite
                                ?.aliased_data.construction_actors"
                            :key="constructionActor ?? []"
                        >
                            {{
                                constructionActor.aliased_data
                                    .construction_actor_type.display_value
                            }}
                            {{
                                constructionActor.aliased_data
                                    .construction_actor_type.display_value
                            }}
                            {{
                                constructionActor.aliased_data
                                    .construction_actor.display_value
                            }}
                            <div>
                                {{
                                    constructionActor.aliased_data
                                        .construction_actor_notes.display_value
                                }}
                            </div>
                        </li>
                    </ol>
                </dd>
                <dt>URLs</dt>
                <dd>
                    <ol>
                        <li
                            v-for="url in heritageSite?.aliased_data
                                .external_url ?? []"
                            :key="url"
                        >
                            {{
                                url.aliased_data.external_url_type
                                    .display_value
                            }}:
                            {{ url.aliased_data.external_url.display_value }}
                        </li>
                    </ol>
                </dd>
            </div>
        </Fieldset>
    </div>
</template>
