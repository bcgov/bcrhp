<script setup lang="ts">
import { useTemplateRef, inject, ref, computed } from 'vue';
import type { Ref } from 'vue';

import FieldSet from 'primevue/fieldset';
import InputText from 'primevue/inputtext';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import { Form, type FormInstance } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import type { AliasedNodeData } from '@/arches_component_lab/types.ts';
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

//state
const currentChronology = ref<ChronologyTileType>(getChronology());
const currentConstructionActor = ref<ConstructionActorsTileType>(
    getConstructionActor(),
);
const currentExternalUrl = ref<ExternalUrlTileType>(getExternalUrl());

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

const chronologyResolver = zodResolver(
    ChronologyTileSchema.shape['aliased_data'],
);
const constructionActorResolver = zodResolver(
    ConstructionActorsTileSchema.shape['aliased_data'],
);
const externalUrlResolver = zodResolver(
    ExternalUrlTileSchema.shape['aliased_data'],
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
    Array.isArray(heritageSite.value?.aliased_data?.external_urls)
        ? heritageSite.value.aliased_data.external_urls
        : [],
);

const isValid = () => true;

const addChronologyDisabled = computed(
    () => (chronologies.value.length || 0) > 4,
);
const addConstructionActorDisabled = computed(
    () => (constructionActors.value.length || 0) > 4,
);
const addExternalUrlDisabled = computed(
    () => (externalUrls.value.length || 0) > 4,
);

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
};

const saveExternalUrl = function () {
    if (!Array.isArray(heritageSite.value.aliased_data.external_urls)) {
        heritageSite.value.aliased_data.external_urls = [];
    }

    const data = currentExternalUrl.value.aliased_data;

    const type = getText(data.external_url_type);
    const url = getText(data.external_url);

    let label = type;
    if (label && url) label += `: ${url}`;
    else if (url) label = url;

    heritageSite.value.aliased_data.external_urls.push({
        ...currentExternalUrl.value,
        customDisplay: label || 'Untitled URL',
    });

    currentExternalUrl.value = getExternalUrl();
    urlKey.value++;
    externalUrlForm.value?.reset();
};

const deleteChronologyCallback = (index: number) => {
    heritageSite.value.aliased_data.chronology.splice(index, 1);
};
const deleteArchitectBuilderCallback = (index: number) => {
    heritageSite.value.aliased_data.construction_actors.splice(index, 1);
};
const deleteURLCallback = (index: number) => {
    heritageSite.value.aliased_data.external_urls.splice(index, 1);
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
};

defineExpose({ isValid });
</script>

<template>
    <Form
        ref="chronologyForm"
        v-slot="$form"
        name="chronologyForm"
        :validateOnBlur="true"
        :resolver="chronologyResolver"
    >
        <FieldSet
            id="chronologyFieldset"
            legend="Chronology"
            :key="chronologyKey"
        >
            <div class="flex flex-row flex-wrap gap-4">
                <div class="inline-block">
                    <div class="flex flex-col">
                        <GenericWidget
                            :mode="EDIT"
                            :should-show-label="true"
                            :aliasedNodeData="
                                currentChronology.aliased_data.chronology
                            "
                            graph-slug="heritage_site"
                            node-alias="chronology"
                            group-direction="column"
                            @update:value="
                                updateChronologyModelValue($event, 'chronology')
                            "
                        />
                    </div>
                </div>
                <GenericWidget
                    :mode="EDIT"
                    :should-show-label="true"
                    :aliasedNodeData="currentChronology.aliased_data.start_year"
                    graph-slug="heritage_site"
                    node-alias="start_year"
                    placeholder="Select a Start Year"
                    group-direction="column"
                    @update:value="
                        updateChronologyModelValue($event, 'start_year')
                    "
                />
                <GenericWidget
                    :mode="EDIT"
                    :should-show-label="true"
                    :aliasedNodeData="currentChronology.aliased_data.end_year"
                    graph-slug="heritage_site"
                    node-alias="end_year"
                    placeholder="Select an End Year"
                    group-direction="column"
                    @update:value="
                        updateChronologyModelValue($event, 'end_year')
                    "
                />

                <div class="inline-block flex items-center gap-2 mt-6">
                    <Checkbox
                        v-model="currentChronology.circa"
                        inputId="circa"
                        binary
                    />
                    <label for="circa">Circa</label>
                </div>
            </div>

            <div class="p-inputtext-fluid mt-4">
                <LabelledInput
                    label="Chronology Notes (Optional)"
                    hint="Enter details about the significant event"
                    input-name="chronologyNotes"
                    :error-message="$form.chronologyNotes?.error?.message"
                >
                    <InputText
                        id="chronologyNotes"
                        v-model="currentChronology.chronologyNotes"
                        placeholder="E.g. Date of major renovations"
                        fluid
                    />
                </LabelledInput>
            </div>
        </FieldSet>
        <div class="row">
            <Button
                id="saveChronology"
                label="+ Add Chronology"
                class="button-padding"
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
            class="mt-2"
            legend="Architects / Builders"
            :key="actorKey"
        >
            <div class="p-inputtext-fluid flex gap-4">
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
                        @update:value="
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
                        @update:value="
                            updateConstructionActorValue(
                                $event,
                                'construction_actor_type',
                            )
                        "
                    />
                </LabelledInput>
            </div>

            <div class="p-inputtext-fluid mt-4">
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
                        @update:value="
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
        name="externalUrlForm"
        :validateOnBlur="true"
        :resolver="externalUrlResolver"
    >
        <FieldSet
            id="relatedURLsFieldset"
            class="mt-2"
            legend="Related URLs"
            :key="urlKey"
        >
            <div class="flex flex-row gap-4">
                <GenericWidget
                    :mode="EDIT"
                    :should-show-label="true"
                    :aliasedNodeData="
                        currentExternalUrl.aliased_data.external_url_type
                    "
                    graph-slug="heritage_site"
                    node-alias="external_url_type"
                    placeholder="Select a URL Type"
                    group-direction="column"
                    @update:value="
                        updateExternalUrlModelValue($event, 'external_url_type')
                    "
                />

                <div class="p-inputtext-fluid flex-grow">
                    <GenericWidget
                        :mode="EDIT"
                        :should-show-label="true"
                        :aliasedNodeData="
                            currentExternalUrl.aliased_data.external_url
                        "
                        graph-slug="heritage_site"
                        node-alias="external_url"
                        group-direction="column"
                        @update:value="
                            updateExternalUrlModelValue($event, 'external_url')
                        "
                    />
                </div>
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
</template>

<style></style>
