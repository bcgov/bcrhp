<script setup lang="ts">
import {
    useTemplateRef,
    inject,
    ref,
    onMounted,
    computed,
    reactive,
} from 'vue';
import type { Ref } from 'vue';

import FieldSet from 'primevue/fieldset';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { Form, FormField, type FormInstance } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { camelCase } from 'lodash';
import GenericWidget from '@/arches_component_lab/generics/GenericWidget/GenericWidget.vue';
import MultiValuePlaceholder from '@/bcgov_arches_common/components/multiValuePlaceholder/MultiValuePlaceholder.vue';
import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import type { HeritageSite } from '@/bcrhp/schema/HeritageSiteSchema.ts';
import {
    ChronologySchema,
    ArchitectBuilderSchema,
    URLsSchema,
    Chronology,
    ArchitectOrBuilder,
    URLs,
    getArchitectOrBuilderSchema,
    getChronologySchema,
    getURLsSchema,
} from '@/bcrhp/schema/SiteDetailsSchema.ts';
import { EDIT } from '@/arches_component_lab/widgets/constants.ts';

const heritageSite: typeof HeritageSite = inject(
    'heritageSite',
) as typeof HeritageSite;
const heritageSiteRef: Ref<typeof HeritageSite> = ref(heritageSite);
const chronologies = ref([] as Array<string>);
const currentChronology: typeof Chronology = reactive(getChronologySchema());
const currentArchitectOrBuilder: typeof ArchitectOrBuilder = reactive(
    getArchitectOrBuilderSchema(),
);
const currentURL: typeof URLs = reactive(getURLsSchema());
const architectsOrBuilders = ref([] as Array<string>);
const urls = ref([] as Array<string>);

const chronologyForm: Ref<FormInstance | null> = useTemplateRef(
    'chronologyForm',
) as Ref<FormInstance | null>;
const architectOrBuilderForm: Ref<FormInstance | null> = useTemplateRef(
    'architectOrBuilderForm',
) as Ref<FormInstance | null>;
const relatedURLsForm: Ref<FormInstance | null> = useTemplateRef(
    'relatedURLsForm',
) as Ref<FormInstance | null>;
const zodCircaResolver = zodResolver(ChronologySchema.shape.circa);
const zodChronologyNotesResolver = zodResolver(
    ChronologySchema.shape.chronologyNotes,
);
const zodArchitectOrBuilderNameResolver = zodResolver(
    ArchitectBuilderSchema.shape.architectOrBuilderName,
);
const zodArchitectOrBuilderNotesResolver = zodResolver(
    ArchitectBuilderSchema.shape.architectOrBuilderNotes,
);
const zodLinkTextResolver = zodResolver(URLsSchema.shape.linkText);
const zodURLResolver = zodResolver(URLsSchema.shape.url);

const isValidChronology = () => {
    return chronologyForm.value?.valid;
};
const isValidArchitectOrBuilder = () => {
    return architectOrBuilderForm.value?.valid;
};
const isValidRelatedURLs = () => {
    return relatedURLsForm.value?.valid;
};

const addChronologyDisabled = computed(
    () =>
        chronologyForm.value?.states?.chronology?.pristine ||
        chronologyForm.value?.states?.start_year?.pristine ||
        chronologyForm.value?.states?.end_year?.pristine ||
        chronologyForm.value?.states?.chronology?.invalid ||
        chronologyForm.value?.states?.start_year?.invalid ||
        chronologyForm.value?.states?.end_year?.invalid ||
        heritageSiteRef.value.siteDetails?.chronologies?.length > 4,
);
const addArchitectOrBuilderDisabled = computed(
    () =>
        architectOrBuilderForm.value?.states?.architectOrBuilderName
            ?.pristine ||
        architectOrBuilderForm.value?.states?.construction_actor_type
            ?.pristine ||
        architectOrBuilderForm.value?.states?.architectOrBuilderName?.invalid ||
        architectOrBuilderForm.value?.states?.construction_actor_type
            ?.invalid ||
        heritageSiteRef.value.siteDetails?.architectsOrBuilders?.length > 4,
);
const addURLDisabled = computed(
    () =>
        relatedURLsForm.value?.states?.external_url_type?.pristine ||
        relatedURLsForm.value?.states?.linkText?.pristine ||
        relatedURLsForm.value?.states?.url?.pristine ||
        relatedURLsForm.value?.states?.external_url_type?.invalid ||
        relatedURLsForm.value?.states?.linkText?.invalid ||
        relatedURLsForm.value?.states?.url?.invalid ||
        heritageSiteRef.value.siteDetails?.urls?.length > 4,
);

const saveChronology = function () {
    console.log('saveChronology');
    heritageSiteRef.value.siteDetails.chronologies.push({
        eventType: chronologyForm.value?.states?.chronology.value,
        startYear: chronologyForm.value?.states?.start_year.value,
        endYear: chronologyForm.value?.states?.end_year.value,
        circa: currentChronology.circa?.toString(),
        chronologyNotes: currentChronology.chronologyNotes,
    });

    chronologyForm.value?.reset();
};

const saveArchitectOrBuilder = function () {
    console.log('saveArchitectOrBuilder');
    heritageSiteRef.value.siteDetails.architectsOrBuilders.push({
        architectOrBuilderName:
            currentArchitectOrBuilder.architectOrBuilderName,
        architectOrBuilderType:
            architectOrBuilderForm.value?.states?.construction_actor_type.value,
        architectOrBuilderNotes:
            currentArchitectOrBuilder.architectOrBuilderNotes,
    });

    architectOrBuilderForm.value?.reset();
};
const saveURL = function () {
    console.log('saveURL');
    heritageSiteRef.value.siteDetails.urls.push({
        urlType: relatedURLsForm.value?.states?.external_url_type.value,
        linkText: currentURL.linkText,
        url: currentURL.url,
    });

    relatedURLsForm.value?.reset();
};

const deleteChronologyCallback = function (index: number) {
    heritageSiteRef.value.siteDetails.chronologies.splice(index, 1);
};

const deleteArchitectBuilderCallback = function (index: number) {
    heritageSiteRef.value.siteDetails.architectsOrBuilders.splice(index, 1);
};

const deleteURLCallback = function (index: number) {
    heritageSiteRef.value.siteDetails.urls.splice(index, 1);
};

const updateChronologyModelValue = function (
    newValue: object,
    attribute_name: string,
) {
    console.log('updateChronologyModelValue', attribute_name, newValue);

    const validator = ChronologySchema.shape[camelCase(attribute_name)];
    const result = validator.safeParse(newValue);

    if (result.success) {
        currentChronology[attribute_name] = result.data;
    }
};

const updateArchitectOrBuilderTypeModelValue = function (
    newValue: object,
    attribute_name: string,
) {
    console.log('updateModelValue', attribute_name, newValue);

    const validator = ArchitectBuilderSchema.shape[camelCase(attribute_name)];
    const result = validator.safeParse(newValue);

    if (result.success) {
        currentArchitectOrBuilder[attribute_name] = result.data;
    }
};

const updateURLTypeModelValue = function (
    newValue: object,
    attribute_name: string,
) {
    console.log('updateModelValue', attribute_name, newValue);

    const validator = URLsSchema.shape[camelCase(attribute_name)];
    const result = validator.safeParse(newValue);

    if (result.success) {
        currentURL[attribute_name] = result.data;
    }
};

defineExpose({
    isValidChronology,
    isValidArchitectOrBuilder,
    isValidRelatedURLs,
});

onMounted(() => {
    heritageSiteRef.value.siteDetails.chronologies = chronologies;
    heritageSiteRef.value.siteDetails.architectsOrBuilders =
        architectsOrBuilders;
    heritageSiteRef.value.siteDetails.urls = urls;
});
</script>
<template>
    <Form
        ref="chronologyForm"
        v-slot="$form"
        name="chronologyForm"
        :validateOnBlur="true"
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
                    <FormField
                        :resolver="zodCircaResolver"
                        name="circa"
                    >
                        <Checkbox
                            v-model="currentChronology.circa"
                            inputId="circa"
                            value="Circa"
                        />
                    </FormField>
                    <label for="circa"> Circa </label>
                </div>
            </div>
            <div class="p-inputtext-fluid">
                <FormField
                    :resolver="zodChronologyNotesResolver"
                    name="chronologyNotes"
                >
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
                </FormField>
            </div>
            <MultiValuePlaceholder
                v-slot="slotProps"
                label="Chronologies"
                :showDeleteButton="true"
                :displayValues="chronologies"
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
        ref="architectOrBuilderForm"
        v-slot="$form"
        name="architectOrBuilderForm"
        :validateOnBlur="true"
    >
        <Fieldset
            id="architectsBuildersFieldset"
            class="p-fieldset p-component mt-2"
            legend="Architects / Builders"
        >
            <div class="p-inputtext-fluid flex">
                <FormField
                    :resolver="zodArchitectOrBuilderNameResolver"
                    name="architectOrBuilderName"
                >
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
                            <InputText
                                id="architectOrBuilderName"
                                ref="architectOrBuilderNameField"
                                v-model="
                                    currentArchitectOrBuilder.architectOrBuilderName
                                "
                                placeholder="First Name Last Name"
                                aria-describedby="architect-or-builder-help"
                                aria-required="true"
                                fluid
                            />
                        </div>
                    </LabelledInput>
                </FormField>
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
                        :aliasedNodeData="null"
                        graph-slug="heritage_site"
                        node-alias="construction_actor_type"
                        placeholder="Select an Architect / Builder Type"
                        group-direction="column"
                        @update:value="
                            updateArchitectOrBuilderTypeModelValue(
                                $event,
                                'construction_actor_type',
                            )
                        "
                    />
                </LabelledInput>
            </div>
            <div class="p-inputtext-fluid">
                <FormField
                    :resolver="zodArchitectOrBuilderNotesResolver"
                    name="architectOrBuilderNotes"
                >
                    <LabelledInput
                        label="Architect / Builder Name Notes (Optional)"
                        hint="Provide any additional comments about the architect/builder"
                        input-name="architectOrBuilderNotes"
                        :error-message="
                            $form.architectOrBuilderNotes?.error?.message
                        "
                        :required="false"
                    >
                        <InputText
                            id="architectOrBuilderNotes"
                            ref="architectOrBuilderNotesField"
                            v-model="
                                currentArchitectOrBuilder.architectOrBuilderNotes
                            "
                            placeholder="Enter relevant notes"
                            aria-describedby="architect-or-builder-notes-help"
                            aria-required="true"
                            fluid
                            class="inline-block"
                        />
                        <Button
                            id="addOtherName"
                            label="Add"
                            class="inline-block"
                            :disabled="addArchitectOrBuilderDisabled"
                            @click="saveArchitectOrBuilder"
                        ></Button>
                    </LabelledInput>
                </FormField>
            </div>
            <MultiValuePlaceholder
                v-slot="slotProps"
                label="Architect(s) / Builder(s)"
                :showDeleteButton="true"
                :displayValues="architectsOrBuilders"
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
        ref="relatedURLsForm"
        v-slot="$form"
        name="relatedURLsForm"
        :validateOnBlur="true"
    >
        <Fieldset
            id="relatedURLsFieldset"
            class="p-fieldset p-component mt-2"
            legend="Related URLs"
        >
            <div class="flex flex-row">
                <LabelledInput
                    label="URL Type"
                    hint="Acceptable URL Types"
                    input-name="urlType"
                    :error-message="$form.urlType?.error?.message"
                    :required="true"
                >
                    <GenericWidget
                        :mode="EDIT"
                        :should-show-label="false"
                        :aliasedNodeData="null"
                        graph-slug="heritage_site"
                        node-alias="external_url_type"
                        placeholder="Select a URL Type"
                        group-direction="column"
                        @update:value="
                            updateURLTypeModelValue($event, 'external_url_type')
                        "
                    />
                </LabelledInput>
                <FormField
                    :resolver="zodLinkTextResolver"
                    name="linkText"
                >
                    <LabelledInput
                        label="Link Text"
                        hint="Enter text that describes the link"
                        input-name="linkText"
                        :error-message="$form.linkText?.error?.message"
                        :required="true"
                    >
                        <div class="p-inputtext-fluid">
                            <InputText
                                id="linkText"
                                ref="linkTextField"
                                v-model="currentURL.linkText"
                                placeholder="E.g. Emily Carr House Website"
                                aria-describedby="link-text-help"
                                aria-required="true"
                                fluid
                            />
                        </div>
                    </LabelledInput>
                </FormField>
            </div>
            <div class="p-inputtext-fluid">
                <FormField
                    :resolver="zodURLResolver"
                    name="url"
                >
                    <LabelledInput
                        label="URL"
                        hint="URL must be stable and publicly accessible"
                        input-name="url"
                        :error-message="$form.url?.error?.message"
                        :required="true"
                    >
                        <div class="flex flex-row full-width">
                            <InputText
                                id="url"
                                ref="urlField"
                                v-model="currentURL.url"
                                placeholder="Enter public URL"
                                aria-describedby="url-help"
                                aria-required="true"
                                fluid
                                class="inline-block"
                            />
                            <Button
                                id="saveURL"
                                label="Add"
                                class="inline-block"
                                :disabled="addURLDisabled"
                                @click="saveURL"
                            ></Button>
                        </div>
                    </LabelledInput>
                </FormField>
                <MultiValuePlaceholder
                    v-slot="slotProps"
                    label="URL(s)"
                    :showDeleteButton="true"
                    :displayValues="urls"
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
            </div>
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
