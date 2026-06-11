<script setup lang="ts">
import { useTemplateRef, inject, ref, computed } from 'vue';
import type { Ref } from 'vue';

import FieldSet from 'primevue/fieldset';
import Button from 'primevue/button';
import { Form, type FormInstance } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { getFlattenResolver } from '@/bcgov_arches_common/validation-utils.ts';
import type {
    AliasedNodeData,
    CardXNodeXWidgetData,
} from '@/arches_component_lab/types.ts';
import GenericWidget from '@/arches_component_lab/generics/GenericWidget/GenericWidget.vue';
import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import ChipsList from '@/bcrhp/pages/NewSite/steps/ChipsList.vue';
import type { HeritageSiteType } from '@/bcrhp/schemas/heritage_site.ts';

import {
    ChronologyTileSchema,
    getChronology,
    type ChronologyTileType,
} from '@/bcrhp/schemas/heritage_site/chronology.ts';

import {
    ConstructionActorsTileSchema,
    getConstructionActor,
    type ConstructionActorsTileType,
} from '@/bcrhp/schemas/heritage_site/construction_actors.ts';

import {
    ExternalUrlTileSchema,
    getExternalUrl,
    type ExternalUrlTileType,
} from '@/bcrhp/schemas/heritage_site/external_url.ts';

import { EDIT } from '@/arches_component_lab/widgets/constants.ts';
import {
    isValid as baseIsValid,
    updateModelValue as baseUpdateModelValue,
} from '@/bcrhp/utils.ts';

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite')!;
const emit = defineEmits(['update:stepIsValid']);

//state
const currentChronology = ref<ChronologyTileType>(getChronology());
const currentConstructionActor = ref<ConstructionActorsTileType>(
    getConstructionActor(),
);
const currentExternalUrl = ref<ExternalUrlTileType>(getExternalUrl());

const checkboxOverrides = {
    widget: {
        widgetid: '',
        component:
            'bcgov_arches_common/widgets/BooleanCheckboxWidget/BooleanCheckboxWidget.vue',
    },
} satisfies Partial<CardXNodeXWidgetData>;

//update keys to reset forms
const chronologyKey = ref(0);
const actorKey = ref(0);
const urlKey = ref(0);

const chronologyForm = useTemplateRef(
    'chronologyForm',
) as Ref<FormInstance | null>;
const constructionActorForm = useTemplateRef(
    'constructionActorForm',
) as Ref<FormInstance | null>;
const externalUrlForm = useTemplateRef(
    'externalUrlForm',
) as Ref<FormInstance | null>;

const chronologyResolver = getFlattenResolver(
    zodResolver(ChronologyTileSchema.shape['aliased_data']),
);
const constructionActorResolver = getFlattenResolver(
    zodResolver(ConstructionActorsTileSchema.shape['aliased_data']),
);

const externalUrlResolver = getFlattenResolver(
    zodResolver(ExternalUrlTileSchema.shape['aliased_data']),
);

const getText = (node: any) => {
    if (!node) return '';
    if (node.display_value) return node.display_value;
    if (typeof node.node_value === 'string') return node.node_value;
    if (node.node_value?.en?.value) return node.node_value.en.value;
    if (node.url) return node.url;
    return '';
};

const chronologies = computed(() =>
    Array.isArray(heritageSite.value?.aliased_data?.chronology)
        ? heritageSite.value.aliased_data.chronology
        : [],
);
const constructionActors = computed(() =>
    Array.isArray(heritageSite.value?.aliased_data?.construction_actors)
        ? heritageSite.value.aliased_data.construction_actors
        : [],
);
const externalUrls = computed(() =>
    Array.isArray(heritageSite.value?.aliased_data?.external_url)
        ? heritageSite.value.aliased_data.external_url
        : [],
);

const isValid = () => true;

const isValidChronology = computed(() => {
    return baseIsValid(
        chronologyForm as Ref<FormInstance>,
        ChronologyTileSchema.shape['aliased_data'],
    );
});

const addChronologyDisabled = computed(
    () => !isValidChronology.value || (chronologies.value.length || 0) > 4,
);

const isValidConstructionActors = () =>
    baseIsValid(
        constructionActorForm as Ref<FormInstance>,
        ConstructionActorsTileSchema.shape['aliased_data'],
    );

const addConstructionActorDisabled = computed(() => {
    const data = currentConstructionActor.value.aliased_data;

    const hasName = getText(data.construction_actor).trim().length > 0;

    const hasType = !!(
        data.construction_actor_type?.display_value ||
        data.construction_actor_type?.node_value
    );

    return (
        !hasName ||
        !hasType ||
        !isValidConstructionActors() ||
        (constructionActors.value.length || 0) > 4
    );
});

const isValidExternalUrl = () =>
    baseIsValid(
        externalUrlForm as Ref<FormInstance>,
        ExternalUrlTileSchema.shape['aliased_data'],
    );

const addExternalUrlDisabled = computed(() => {
    const data = currentExternalUrl.value.aliased_data;

    const hasType = !!(
        data.external_url_type?.display_value ||
        data.external_url_type?.node_value
    );
    const hasUrl = getText(data.external_url).trim().length > 0;

    return (
        !hasType ||
        !hasUrl ||
        !isValidExternalUrl() ||
        (externalUrls.value.length || 0) > 4
    );
});

const saveChronology = function () {
    if (!Array.isArray(heritageSite.value.aliased_data.chronology)) {
        heritageSite.value.aliased_data.chronology = [];
    }

    const data = currentChronology.value.aliased_data;
    const start = getText(data.start_year);
    const end = getText(data.end_year);
    const type = getText(data.chronology);

    let label = type;
    if (start || end) label += ` (${start} - ${end})`;
    if (currentChronology.value.circa) label += ' [Circa]';
    if (currentChronology.value.chronologyNotes)
        label += ` - ${currentChronology.value.chronologyNotes}`;

    heritageSite.value.aliased_data.chronology.push({
        ...currentChronology.value,
        customDisplay: label || 'Untitled Chronology',
    });

    currentChronology.value = getChronology();
    chronologyKey.value++;
    chronologyForm.value?.reset();
    emit('update:stepIsValid', isValid());
};

const saveArchitectOrBuilder = function () {
    if (!Array.isArray(heritageSite.value.aliased_data.construction_actors)) {
        heritageSite.value.aliased_data.construction_actors = [];
    }

    const data = currentConstructionActor.value.aliased_data;
    const name = getText(data.construction_actor);
    const type = getText(data.construction_actor_type);
    const notes = getText(data.construction_actor_notes);

    let label = name;
    if (type) label += ` (${type})`;
    if (notes) label += ` - ${notes}`;

    heritageSite.value.aliased_data.construction_actors.push({
        ...currentConstructionActor.value,
        customDisplay: label || 'Untitled Actor',
    });

    currentConstructionActor.value = getConstructionActor();
    actorKey.value++;
    constructionActorForm.value?.reset();
    emit('update:stepIsValid', isValid());
};

const saveExternalUrl = function () {
    if (!Array.isArray(heritageSite.value.aliased_data.external_url)) {
        heritageSite.value.aliased_data.external_url = [];
    }

    const data = currentExternalUrl.value.aliased_data;

    const type = getText(data.external_url_type);
    const url = getText(data.external_url);

    let label = type;
    if (label && url) label += `: ${url}`;
    else if (url) label = url;

    heritageSite.value.aliased_data.external_url.push({
        ...currentExternalUrl.value,
        customDisplay: label || 'Untitled URL',
    });

    currentExternalUrl.value = getExternalUrl();
    urlKey.value++;
    externalUrlForm.value?.reset();
    emit('update:stepIsValid', isValid());
};

const deleteChronologyCallback = (index: number) => {
    heritageSite.value.aliased_data.chronology.splice(index, 1);
};
const deleteArchitectBuilderCallback = (index: number) => {
    heritageSite.value.aliased_data.construction_actors.splice(index, 1);
};
const deleteURLCallback = (index: number) => {
    heritageSite.value.aliased_data.external_url.splice(index, 1);
};

const updateChronologyModelValue = (
    newValue: AliasedNodeData,
    attribute_name: string,
) => {
    baseUpdateModelValue(
        newValue,
        attribute_name,
        currentChronology.value.aliased_data,
        chronologyForm as Ref<FormInstance>,
    );
    emit('update:stepIsValid', isValid());
};

const updateConstructionActorValue = (
    newValue: AliasedNodeData,
    attribute_name: string,
) => {
    baseUpdateModelValue(
        newValue,
        attribute_name,
        currentConstructionActor.value.aliased_data,
        constructionActorForm as Ref<FormInstance>,
    );
    emit('update:stepIsValid', isValid());
};

const updateExternalUrlModelValue = (
    newValue: AliasedNodeData,
    attribute_name: string,
) => {
    baseUpdateModelValue(
        newValue,
        attribute_name,
        currentExternalUrl.value.aliased_data,
        externalUrlForm as Ref<FormInstance>,
    );
    emit('update:stepIsValid', isValid());
};

defineExpose({ isValid });
</script>

<template>
    <!-- <div class="mt-4">Chronology Valid? {{ isValidChronology }}</div>
    <div class="mt-4">Disable Button? {{ addChronologyDisabled }}</div> -->
    <Form
        ref="chronologyForm"
        v-slot="$form"
        name="chronologyForm"
        :validateOnBlur="true"
        :resolver="chronologyResolver"
    >
        <FieldSet
            id="chronologyFieldset"
            :key="chronologyKey"
            legend="Chronology"
        >
            <div class="flex flex-row flex-wrap">
                <div class="flex-grow">
                    <div class="flex flex-col flex-grow nobold_label">
                        <GenericWidget
                            :mode="EDIT"
                            :should-show-label="true"
                            :aliasedNodeData="
                                currentChronology.aliased_data.chronology
                            "
                            graph-slug="heritage_site"
                            node-alias="chronology"
                            group-direction="column"
                            @update:aliasedNodeData="
                                updateChronologyModelValue($event, 'chronology')
                            "
                        />
                    </div>
                </div>
                <div class="flex flex-row flex-grow">
                    <LabelledInput
                        label="Start Year"
                        hint="Year the event started"
                        input-name="ChronologyStartYear"
                        :error-message="
                            $form.chronologyStartYear?.error?.message
                        "
                    >
                        <GenericWidget
                            :mode="EDIT"
                            :should-show-label="false"
                            :aliasedNodeData="
                                currentChronology.aliased_data.start_year
                            "
                            graph-slug="heritage_site"
                            node-alias="start_year"
                            placeholder="Select a Start Year"
                            group-direction="column"
                            class="flex-grow"
                            @update:aliasedNodeData="
                                updateChronologyModelValue($event, 'start_year')
                            "
                        />
                    </LabelledInput>
                    <LabelledInput
                        label="End Year"
                        hint="Year the event ended if applicable"
                        input-name="ChronologyEndYear"
                        :error-message="$form.chronologyEndYear?.error?.message"
                    >
                        <GenericWidget
                            :mode="EDIT"
                            :should-show-label="false"
                            :aliasedNodeData="
                                currentChronology.aliased_data.end_year
                            "
                            graph-slug="heritage_site"
                            node-alias="end_year"
                            placeholder="Select an End Year"
                            group-direction="column"
                            class="flex-grow"
                            @update:aliasedNodeData="
                                updateChronologyModelValue($event, 'end_year')
                            "
                        />
                    </LabelledInput>
                    <div class="align-checkbox">
                        <div class="flex flex-row flex-row-checkbox">
                            <GenericWidget
                                :mode="EDIT"
                                :should-show-label="false"
                                :aliasedNodeData="
                                    currentChronology.aliased_data
                                        .dates_approximate
                                "
                                graph-slug="heritage_site"
                                node-alias="dates_approximate"
                                :card-x-node-x-widget-data-overrides="
                                    checkboxOverrides
                                "
                                @update:aliasedNodeData="
                                    updateChronologyModelValue(
                                        $event,
                                        'dates_approximate',
                                    )
                                "
                            />
                            <div>Circa</div>
                        </div>
                    </div>
                </div>
            </div>
            <br />
            <div>
                <LabelledInput
                    label="Chronology Notes (Optional)"
                    hint="Enter details about the significant event"
                    input-name="chronologyNotes"
                    :error-message="$form.chronologyNotes?.error?.message"
                >
                    <GenericWidget
                        :mode="EDIT"
                        :should-show-label="false"
                        :aliasedNodeData="
                            currentChronology.aliased_data.chronology_notes
                        "
                        graph-slug="heritage_site"
                        node-alias="chronology_notes"
                        @update:aliasedNodeData="
                            updateChronologyModelValue(
                                $event,
                                'chronology_notes',
                            )
                        "
                    />
                </LabelledInput>
            </div>
        </FieldSet>
        <div class="row">
            <Button
                id="saveChronology"
                label="+ Add Chronology"
                class="button-padding"
                :aria-disabled="addChronologyDisabled"
                :disabled="addChronologyDisabled"
                @click="saveChronology"
            />
            <ChipsList
                label="Chronologies"
                :items="chronologies"
                display-key="customDisplay"
                @remove="deleteChronologyCallback"
            />
        </div>
    </Form>

    <Form
        ref="constructionActorForm"
        v-slot="$form"
        name="constructionActorForm"
        :validateOnBlur="true"
        :resolver="constructionActorResolver"
    >
        <FieldSet
            id="architectsBuildersFieldset"
            :key="actorKey"
            class="mt-2"
            legend="Architects / Builders"
        >
            <div>
                <LabelledInput
                    label="Architect / Builder Name"
                    hint="Enter the company or individual's name"
                    input-name="architectOrBuilderName"
                    class="flex-grow"
                    :error-message="
                        $form.architectOrBuilderName?.error?.message
                    "
                    :required="true"
                >
                    <GenericWidget
                        :mode="EDIT"
                        :should-show-label="false"
                        :aliased-node-data="
                            currentConstructionActor.aliased_data
                                .construction_actor
                        "
                        graph-slug="heritage_site"
                        node-alias="construction_actor"
                        placeholder="Select an Architect / Builder"
                        group-direction="column"
                        @update:aliasedNodeData="
                            updateConstructionActorValue(
                                $event,
                                'construction_actor',
                            )
                        "
                    />
                </LabelledInput>

                <LabelledInput
                    label="Type"
                    input-name="architectOrBuilderType"
                    class="flex-grow"
                    :error-message="
                        $form.architectOrBuilderType?.error?.message
                    "
                    :required="true"
                >
                    <GenericWidget
                        :mode="EDIT"
                        :should-show-label="false"
                        :aliased-node-data="
                            currentConstructionActor.aliased_data
                                .construction_actor_type
                        "
                        graph-slug="heritage_site"
                        node-alias="construction_actor_type"
                        placeholder="Select a Type"
                        group-direction="column"
                        @update:aliasedNodeData="
                            updateConstructionActorValue(
                                $event,
                                'construction_actor_type',
                            )
                        "
                    />
                </LabelledInput>
            </div>

            <div>
                <LabelledInput
                    label="Notes (Optional)"
                    hint="Provide any additional comments"
                    input-name="architectOrBuilderNotes"
                    :error-message="
                        $form.architectOrBuilderNotes?.error?.message
                    "
                >
                    <GenericWidget
                        :mode="EDIT"
                        :should-show-label="false"
                        :aliasedNodeData="
                            currentConstructionActor.aliased_data
                                .construction_actor_notes
                        "
                        graph-slug="heritage_site"
                        node-alias="construction_actor_notes"
                        group-direction="column"
                        @update:aliasedNodeData="
                            updateConstructionActorValue(
                                $event,
                                'construction_actor_notes',
                            )
                        "
                    />
                </LabelledInput>
            </div>
        </FieldSet>
        <div class="row">
            <Button
                id="addOtherName"
                label="+ Add Architect/Builder"
                class="button-padding"
                :disabled="addConstructionActorDisabled"
                @click="saveArchitectOrBuilder"
            />
            <ChipsList
                label="Architects / Builders"
                :items="constructionActors"
                display-key="customDisplay"
                @remove="deleteArchitectBuilderCallback"
            />
        </div>
    </Form>

    <Form
        ref="externalUrlForm"
        v-slot="$form"
        name="externalUrlForm"
        :validateOnBlur="true"
        :validateOnValueUpdate="true"
        :resolver="externalUrlResolver"
    >
        <FieldSet
            id="relatedURLsFieldset"
            :key="urlKey"
            legend="Related URLs"
        >
            <div>
                <LabelledInput
                    label="URL Type"
                    hint="Select the type of link"
                    input-name="external_url_type"
                    class="flex-grow"
                    :error-message="$form.external_url_type?.error?.message"
                    :required="true"
                >
                    <GenericWidget
                        :mode="EDIT"
                        :should-show-label="false"
                        :aliasedNodeData="
                            currentExternalUrl.aliased_data.external_url_type
                        "
                        graph-slug="heritage_site"
                        node-alias="external_url_type"
                        placeholder="Select a URL Type"
                        group-direction="column"
                        @update:aliasedNodeData="
                            updateExternalUrlModelValue(
                                $event,
                                'external_url_type',
                            )
                        "
                    />
                </LabelledInput>
                <LabelledInput
                    hint='Enter a description of the link in "URL Label", then provide the full, publicly accessible URL below'
                    input-name="external_url"
                    class="flex-grow"
                    :error-message="$form.external_url?.error?.message"
                >
                    <FieldSet>
                        <template #legend>
                            <span class="bold_url fieldset-subheader">
                                <span class="red">* </span>URL information
                            </span>
                        </template>
                        <GenericWidget
                            :required="true"
                            :mode="EDIT"
                            :should-show-label="false"
                            :aliasedNodeData="
                                currentExternalUrl.aliased_data.external_url
                            "
                            graph-slug="heritage_site"
                            node-alias="external_url"
                            group-direction="column"
                            @update:aliasedNodeData="
                                updateExternalUrlModelValue(
                                    $event,
                                    'external_url',
                                )
                            "
                        />
                    </FieldSet>
                </LabelledInput>
            </div>
        </FieldSet>
        <div class="row">
            <Button
                id="saveURL"
                label="+ Add URL"
                class="button-padding"
                :disabled="addExternalUrlDisabled"
                @click="saveExternalUrl"
            />
            <ChipsList
                label="Related URLs"
                :items="externalUrls"
                display-key="customDisplay"
                @remove="deleteURLCallback"
            />
        </div>
    </Form>
    <br /><br /><br />
</template>

<style scoped>
.flex-row {
    display: flex;
    flex-direction: row;
    gap: 1rem;
}

.flex-row-checkbox {
    gap: 0.25rem !important;
}

.flex-grow,
.flex-grow .widget {
    flex-grow: 1;
}

.align-checkbox {
    align-self: center;
}

.button-padding {
    margin-left: 1.5rem;
    margin-right: 1.5rem;
}

.row {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
}
div.bold_url,
span.bold_url {
    font-weight: bold;
}

.nobold_label label span {
    font-weight: normal;
}

.fieldset-subheader {
    font-size: 1.5rem;
}
</style>
