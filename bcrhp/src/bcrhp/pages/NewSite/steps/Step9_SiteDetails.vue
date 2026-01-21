<script setup lang="ts">
import { useTemplateRef, inject, onMounted, computed, reactive } from 'vue';
import type { Ref } from 'vue';

import FieldSet from 'primevue/fieldset';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { Form, type FormInstance } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import type { AliasedNodeData } from '@/arches_component_lab/types.ts';
import GenericWidget from '@/arches_component_lab/generics/GenericWidget/GenericWidget.vue';
import MultiValuePlaceholder from '@/bcgov_arches_common/components/multiValuePlaceholder/MultiValuePlaceholder.vue';
import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import type { HeritageSiteType } from '@/bcrhp/schemas/heritage_site.ts';

import {
    ChronologyTileSchema as ChronologySchema,
    getChronology,
    type ChronologyTileType,
    ChronologyTileSchema,
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

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite');

const currentConstructionActor: ConstructionActorsTileType = reactive(
    getConstructionActor(),
);
const currentChronology: ChronologyTileType = reactive(getChronology());
const currentExternalUrl: ExternalUrlTileType = reactive(getExternalUrl());

const chronologyForm: Ref<FormInstance | null> = useTemplateRef(
    'chronologyForm',
) as Ref<FormInstance | null>;
const constructionActorForm: Ref<FormInstance | null> = useTemplateRef(
    'constructionActorForm',
) as Ref<FormInstance | null>;
const externalUrlForm: Ref<FormInstance | null> = useTemplateRef(
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
const addChronologyDisabled = computed(
    () =>
        (!baseIsValid(
            ChronologySchema.shape['aliased_data'],
            currentChronology,
        ) ||
            heritageSite?.value.aliased_data.chronology?.length) ??
        0 > 4,
);
const addConstructionActorDisabled = computed(
    () =>
        (!baseIsValid(
            ConstructionActorsTileSchema.shape['aliased_data'],
            currentConstructionActor,
        ) ||
            heritageSite?.value.aliased_data.chronology?.length) ??
        0 > 4,
);

const addExternalUrlDisabled = computed(
    () => false,
    (!baseIsValid(
        ExternalUrlTileSchema.shape['aliased_data'],
        currentExternalUrl,
    ) ||
        heritageSite?.value.aliased_data.external_urls?.length) ??
        0 > 4,
);

const saveChronology = function () {
    heritageSite?.value.aliased_data.chronology.push(currentConstructionActor);
    chronologyForm.value?.reset();
};

const saveArchitectOrBuilder = function () {
    console.log('saveArchitectOrBuilder');
    heritageSite?.value.aliased_data.constuction_actors.push(
        currentConstructionActor,
    );

    constructionActorForm.value?.reset();
};

const saveExternalUrl = function () {
    console.log('saveURL');
    heritageSite?.value.aliased_data.external_urls.push(currentExternalUrl);

    externalUrlForm.value?.reset();
};

const deleteChronologyCallback = function (index: number) {
    heritageSite?.value.aliased_data.chronology.splice(index, 1);
};

const deleteArchitectBuilderCallback = function (index: number) {
    heritageSite?.value.aliased_data.construction_actors.splice(index, 1);
};

const deleteURLCallback = function (index: number) {
    heritageSite?.value.aliased_data.external_url.splice(index, 1);
};

const updateChronologyModelValue = function (
    newValue: AliasedNodeData,
    attribute_name: string,
) {
    console.log('updateChronologyModelValue', attribute_name, newValue);
    baseUpdateModelValue(
        newValue,
        attribute_name,
        currentChronology.value.aliased_data,
        chronologyForm as Ref<FormInstance>,
    );
};

const updateConstructionActorValue = function (
    newValue: AliasedNodeData,
    attribute_name: string,
) {
    baseUpdateModelValue(
        newValue,
        attribute_name,
        currentConstructionActor.value.aliased_data,
        constructionActorForm as Ref<FormInstance>,
    );
};

const updateExternalUrlModelValue = function (
    newValue: AliasedNodeData,
    attribute_name: string,
) {
    baseUpdateModelValue(
        newValue,
        attribute_name,
        currentConstructionActor.value.aliased_data,
        externalUrlForm as Ref<FormInstance>,
    );
};

// const isValid = () => {
//     return (
//         baseIsValid(
//             chronologyForm as Ref<FormInstance>,
//             ChronologySchema.shape['aliased_data'],
//         ) &&
//         baseIsValid(
//             constructionActorForm as Ref<FormInstance>,
//             ConstructionActorsTileSchema.shape['aliased_data'],
//         ) &&
//         baseIsValid(
//             externalUrlForm as Ref<FormInstance>,
//             ExternalUrlTileSchema.shape['aliased_data'],
//         )
//     );
// };
const isValid = () => {
    return true;
};

defineExpose({
    isValid,
});

onMounted(() => {});
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
        >
            <div class="flex flex-row flex-wrap gap-4">
                <div class="inline-block">
                    <div class="flex flex-col">
                        <GenericWidget
                            :mode="EDIT"
                            :should-show-label="true"
                            :aliasedNodeData="null"
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
                    :aliasedNodeData="null"
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
                    :aliasedNodeData="null"
                    graph-slug="heritage_site"
                    node-alias="end_year"
                    placeholder="Select an End Year"
                    group-direction="column"
                    @update:value="
                        updateChronologyModelValue($event, 'end_year')
                    "
                />

                <div class="inline-block">
                    <Checkbox
                        v-model="currentChronology.circa"
                        inputId="circa"
                        value="Circa"
                    />
                    <label for="circa"> Circa </label>
                </div>
            </div>
            <div class="p-inputtext-fluid">
                <LabelledInput
                    label="Chronology Notes (Optional)"
                    hint="Enter details about the significant event"
                    input-name="chronologyNotes"
                    :error-message="$form.chronologyNotes?.error?.message"
                >
                    <InputText
                        id="chronologyNotes"
                        ref="chronologyNotesField"
                        v-model="currentChronology.chronologyNotes"
                        placeholder="E.g. Date of major renovations"
                        theme="snow"
                        aria-describedby="chronology-help"
                        fluid
                        class="inline-block"
                    />
                    <Button
                        id="saveChronology"
                        label="Add"
                        class="inline-block"
                        :disabled="addChronologyDisabled"
                        @click="saveChronology"
                    ></Button>
                </LabelledInput>
            </div>
            <MultiValuePlaceholder
                v-slot="slotProps"
                label="Chronologies"
                :showDeleteButton="true"
                :displayValues="
                    heritageSite?.value?.aliased_data?.chronology ?? []
                "
                :deleteCallback="deleteChronologyCallback"
            >
                <div
                    v-for="slot in slotProps"
                    :key="slot"
                    class="parent value"
                >
                    {{ slot.eventType }} {{ slot.circa }} {{ slot.startYear }}
                    {{ slot.endYear }} {{ slot.chronologyNotes }}
                </div>
            </MultiValuePlaceholder>
        </FieldSet>
    </Form>
    <Form
        ref="constructionActorForm"
        v-slot="$form"
        name="constructionActorForm"
        :validateOnBlur="true"
        :resolver="constructionActorResolver"
    >
        <Fieldset
            id="architectsBuildersFieldset"
            class="p-fieldset p-component mt-2"
            legend="Architects / Builders"
        >
            <div class="p-inputtext-fluid flex">
                <LabelledInput
                    label="Architect / Builder Name"
                    hint="Enter the company or individual's name"
                    input-name="architectOrBuilderName"
                    class="inline-block"
                    :error-message="
                        $form.architectOrBuilderName?.error?.message
                    "
                    :required="true"
                >
                    <div class="p-inputtext-fluid">
                        <GenericWidget
                            :mode="EDIT"
                            :should-show-label="false"
                            :aliased-node-data="
                                currentConstructionActor.aliased_data
                                    .construction_actor
                            "
                            graph-slug="heritage_site"
                            node-alias="construction_actor"
                            placeholder="Select an Architect / Builder Type"
                            group-direction="column"
                            @update:value="
                                updateConstructionActorValue(
                                    $event,
                                    'construction_actor',
                                )
                            "
                        />
                    </div>
                </LabelledInput>
                <LabelledInput
                    label="Type"
                    input-name="architectOrBuilderType"
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
                        placeholder="Select an Architect / Builder Type"
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
            <div class="p-inputtext-fluid">
                <LabelledInput
                    label="Architect / Builder Name Notes (Optional)"
                    hint="Provide any additional comments about the architect/builder"
                    input-name="architectOrBuilderNotes"
                    :error-message="
                        $form.architectOrBuilderNotes?.error?.message
                    "
                    :required="false"
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
                    <Button
                        id="addOtherName"
                        label="Add"
                        class="inline-block"
                        :disabled="addConstructionActorDisabled"
                        @click="saveArchitectOrBuilder"
                    ></Button>
                </LabelledInput>
            </div>
            <MultiValuePlaceholder
                v-slot="slotProps"
                label="Architect(s) / Builder(s)"
                :showDeleteButton="true"
                :displayValues="
                    heritageSite?.value?.aliased_data?.construction_actors ?? []
                "
                :deleteCallback="deleteArchitectBuilderCallback"
            >
                <div
                    v-for="slot in slotProps"
                    :key="slot"
                    class="parent value"
                >
                    {{ slot.architectOrBuilderName }}
                    {{ slot.architectOrBuilderType }}
                    {{ slot.architectOrBuilderNotes }}
                </div>
            </MultiValuePlaceholder>
        </Fieldset>
    </Form>
    <Form
        ref="externalUrlForm"
        name="externalUrlForm"
        :validateOnBlur="true"
        :resolver="externalUrlResolver"
    >
        <Fieldset
            id="relatedURLsFieldset"
            class="p-fieldset p-component mt-2"
            legend="Related URLs"
        >
            <div class="flex flex-row">
                <GenericWidget
                    :mode="EDIT"
                    :should-show-label="false"
                    :aliasedNodeData="null"
                    graph-slug="heritage_site"
                    node-alias="external_url_type"
                    placeholder="Select a URL Type"
                    group-direction="column"
                    @update:value="
                        updateExternalUrlModelValue($event, 'external_url_type')
                    "
                />
                <div class="p-inputtext-fluid">
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
                    <Button
                        id="saveURL"
                        label="Add"
                        class="inline-block"
                        :disabled="addExternalUrlDisabled"
                        @click="saveExternalUrl"
                    ></Button>
                </div>
            </div>
            <MultiValuePlaceholder
                v-slot="slotProps"
                label="URL(s)"
                :showDeleteButton="true"
                :displayValues="
                    heritageSite?.value?.aliased_data?.external_urls ?? []
                "
                :deleteCallback="deleteURLCallback"
            >
                <div
                    v-for="slot in slotProps"
                    :key="slot"
                    class="parent value"
                >
                    {{ slot.urlType }} {{ slot.url }}
                    {{ slot.linkText }}
                </div>
            </MultiValuePlaceholder>
        </Fieldset>
    </Form>
</template>

<style>
.inline-block {
    display: inline-block;
    width: unset;
}

.p-inputtext-fluid.inline-block {
    width: calc(100% - 6.5rem);
    margin-right: 1rem;
}

.full-width {
    width: 100%;
}
</style>
