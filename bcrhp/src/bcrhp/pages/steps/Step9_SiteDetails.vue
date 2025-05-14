<script setup lang="ts">
import { useTemplateRef, inject, ref, onMounted, computed } from 'vue';
import type { Ref } from 'vue';

import FieldSet from 'primevue/fieldset';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import DatePicker from 'primevue/datepicker';
import { Form, FormField, type FormInstance } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import ConceptSelect from '@/bcgov_arches_common/components/ConceptSelect/ConceptSelect.vue';
import ConceptRadioButtons from '@/bcgov_arches_common/components/ConceptSelect/ConceptRadioButtons.vue';
import MultiValuePlaceholder from '@/bcgov_arches_common/components/multiValuePlaceholder/MultiValuePlaceholder.vue';
import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import type { HeritageSite } from '@/bcrhp/schema/HeritageSiteSchema.ts';
import {
    ChronologySchema,
    ArchitectBuilderSchema,
    URLsSchema,
    getArchitectOrBuilderSchema,
    getChronologySchema,
    getURLsSchema,
} from '@/bcrhp/schema/SiteDetailsSchema.ts';

const heritageSite: typeof HeritageSite = inject(
    'heritageSite',
) as typeof HeritageSite;
const heritageSiteRef: Ref<typeof HeritageSite> = ref(heritageSite);
const chronologies = ref([] as Array<string>);

const currentChronology = ref(getChronologySchema());
const currentArchitectOrBuilder = ref(getArchitectOrBuilderSchema());
const currentURL = ref(getURLsSchema());

const architectsOrBuilders = ref([] as Array<string>);
const urls = ref([] as Array<string>);

const siteDetailsForm: Ref<FormInstance> = useTemplateRef('siteDetailsForm');
const zodEventTypeResolver = zodResolver(ChronologySchema.shape.eventType);
const zodStartYearResolver = zodResolver(ChronologySchema.shape.startYear);
const zodEndYearResolver = zodResolver(ChronologySchema.shape.endYear);
const zodCircaResolver = zodResolver(ChronologySchema.shape.circa);
const zodChronologyNotesResolver = zodResolver(
    ChronologySchema.shape.chronologyNotes,
);
const zodArchitectOrBuilderNameResolver = zodResolver(
    ArchitectBuilderSchema.shape.architectOrBuilderName,
);
const zodArchitectOrBuilderTypeResolver = zodResolver(
    ArchitectBuilderSchema.shape.architectOrBuilderNotes,
);
const zodArchitectOrBuilderNotesResolver = zodResolver(
    ArchitectBuilderSchema.shape.architectOrBuilderType,
);
const zodURLTypeResolver = zodResolver(URLsSchema.shape.urlType);
const zodLinkTextResolver = zodResolver(URLsSchema.shape.linkText);
const zodURLResolver = zodResolver(URLsSchema.shape.url);

const isValid = () => {
    return siteDetailsForm.value.valid;
};

const addChronologyDisabled = computed(
    () =>
        siteDetailsForm.value?.states?.eventType?.pristine ||
        siteDetailsForm.value?.states?.startYear?.pristine ||
        siteDetailsForm.value?.states?.endYear?.pristine ||
        siteDetailsForm.value?.states?.chronologyNotes?.pristine ||
        siteDetailsForm.value?.states?.eventType?.invalid ||
        siteDetailsForm.value?.states?.startYear?.invalid ||
        siteDetailsForm.value?.states?.endYear?.invalid ||
        siteDetailsForm.value?.states?.chronologyNotes?.invalid ||
        heritageSiteRef.value.siteDetails?.chronologies?.length > 4,
);
const addArchitectOrBuilderDisabled = computed(
    () =>
        siteDetailsForm.value?.states?.architectOrBuilderName?.pristine ||
        siteDetailsForm.value?.states?.architectOrBuilderNotes?.pristine ||
        siteDetailsForm.value?.states?.architectOrBuilderType?.pristine ||
        siteDetailsForm.value?.states?.architectOrBuilderName?.invalid ||
        siteDetailsForm.value?.states?.architectOrBuilderNotes?.invalid ||
        siteDetailsForm.value?.states?.architectOrBuilderType?.invalid ||
        heritageSiteRef.value.siteDetails?.architectsOrBuilders?.length > 4,
);
const addURLDisabled = computed(
    () =>
        siteDetailsForm.value?.states?.urlType?.pristine ||
        siteDetailsForm.value?.states?.linkText?.pristine ||
        siteDetailsForm.value?.states?.url?.pristine ||
        siteDetailsForm.value?.states?.urlType?.invalid ||
        siteDetailsForm.value?.states?.linkText?.invalid ||
        siteDetailsForm.value?.states?.url?.invalid ||
        heritageSiteRef.value.siteDetails?.urls?.length > 4,
);

const saveChronology = function () {
    console.log('saveChronology');
    heritageSiteRef.value.siteDetails.chronologies.push({
        eventType: currentChronology.value.eventType,
        startYear: currentChronology.value.startYear.toLocaleDateString(
            'en-CA',
            {
                year: 'numeric',
            },
        ),
        endYear: currentChronology.value.endYear.toLocaleDateString('en-CA', {
            year: 'numeric',
        }),
        circa: currentChronology.value.circa?.toString(),
        chronologyNotes: currentChronology.value.chronologyNotes,
    });

    currentChronology.value.eventType = '';
    currentChronology.value.startYear = null;
    currentChronology.value.endYear = null;
    currentChronology.value.circa = false;
    currentChronology.value.chronologyNotes = '';
};

const saveArchitectOrBuilder = function () {
    console.log('saveArchitectOrBuilder');
    heritageSiteRef.value.siteDetails.architectsOrBuilders.push({
        architectOrBuilderName:
            currentArchitectOrBuilder.value.architectOrBuilderName,
        architectOrBuilderType:
            currentArchitectOrBuilder.value.architectOrBuilderType,
        architectOrBuilderNotes:
            currentArchitectOrBuilder.value.architectOrBuilderNotes,
    });

    currentArchitectOrBuilder.value.architectOrBuilderName = '';
    currentArchitectOrBuilder.value.architectOrBuilderType = '';
    currentArchitectOrBuilder.value.architectOrBuilderNotes = '';
};
const saveURL = function () {
    console.log('saveURL');
    heritageSiteRef.value.siteDetails.urls.push({
        urlType: currentURL.value.urlType,
        linkText: currentURL.value.linkText,
        url: currentURL.value.url,
    });

    currentURL.value.urlType = '';
    currentURL.value.linkText = '';
    currentURL.value.url = '';
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

// This needs to be removed - added because ESLint was complaining. Need to figure out
// configuration so API methods are not
defineExpose({ isValid });

onMounted(() => {
    heritageSiteRef.value.siteDetails.chronologies = chronologies;
    heritageSiteRef.value.siteDetails.architectsOrBuilders =
        architectsOrBuilders;
    heritageSiteRef.value.siteDetails.urls = urls;
});
</script>
<template>
    <Form
        ref="siteDetailsForm"
        v-slot="$form"
        name="siteDetailsForm"
        :validateOnBlur="true"
    >
        <FieldSet
            id="chronologyFieldset"
            legend="Chronology"
        >
            <div class="flex flex-row flex-wrap gap-4">
                <div class="inline-block">
                    <div class="flex flex-col">
                        <FormField
                            :resolver="zodEventTypeResolver"
                            name="eventType"
                        >
                            <ConceptRadioButtons
                                id="eventType"
                                ref="eventTypeField"
                                v-model="currentChronology.eventType"
                                graph-slug="heritage_site"
                                node-alias="chronology"
                                group-direction="column"
                            />
                        </FormField>
                    </div>
                </div>
                <label for="startYear">Start Year</label>
                <FormField
                    :resolver="zodStartYearResolver"
                    name="startYear"
                >
                    <DatePicker
                        id="startYear"
                        ref="startYearField"
                        v-model="currentChronology.startYear"
                        class="flex-shrink"
                        dateFormat="yy"
                        view="year"
                        showIcon
                        aria-describedby="start-year-help"
                        aria-required="true"
                    />
                </FormField>
                <label for="endYear">End Year</label>
                <FormField
                    :resolver="zodEndYearResolver"
                    name="endYear"
                >
                    <DatePicker
                        id="endYear"
                        ref="endYearField"
                        v-model="currentChronology.endYear"
                        dateFormat="yy"
                        view="year"
                        showIcon
                        aria-describedby="end-year-help"
                        aria-required="true"
                    />
                </FormField>
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
                        <div class="">
                            <InputText
                                id="chronologyNotes"
                                ref="chronologyNotesField"
                                v-model="currentChronology.chronologyNotes"
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
                        </div>
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
                                aria-describedby="architect-or-builder-help"
                                aria-required="true"
                                fluid
                            />
                        </div>
                    </LabelledInput>
                </FormField>
                <FormField
                    :resolver="zodArchitectOrBuilderTypeResolver"
                    name="architectOrBuilderType"
                >
                    <LabelledInput
                        label="Type"
                        input-name="architectOrBuilderType"
                        :error-message="
                            $form.architectOrBuilderType?.error?.message
                        "
                        :required="true"
                    >
                        <ConceptSelect
                            id="architectOrBuilderType"
                            ref="architectOrBuilderTypeField"
                            v-model="
                                currentArchitectOrBuilder.architectOrBuilderType
                            "
                            graph-slug="heritage_site"
                            node-alias="construction_actor_type"
                        />
                    </LabelledInput>
                </FormField>
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
                        <div class="">
                            <InputText
                                id="architectOrBuilderNotes"
                                ref="architectOrBuilderNotesField"
                                v-model="
                                    currentArchitectOrBuilder.architectOrBuilderNotes
                                "
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
                        </div>
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
                    {{ slot.architectOrBuilderType }}
                    {{ slot.architectOrBuilderName }}
                    {{ slot.architectOrBuilderNotes }}
                </div>
            </MultiValuePlaceholder>
        </Fieldset>
        <Fieldset
            id="relatedURLsFieldset"
            class="p-fieldset p-component mt-2"
            legend="Related URLs"
        >
            <div class="flex flex-row">
                <FormField
                    :resolver="zodURLTypeResolver"
                    name="urlType"
                >
                    <LabelledInput
                        label="URL Type"
                        hint="Acceptable URL Types"
                        input-name="urlType"
                        :error-message="$form.urlType?.error?.message"
                        :required="true"
                    >
                        <ConceptSelect
                            id="urlType"
                            ref="urlTypeField"
                            v-model="currentURL.urlType"
                            graph-slug="heritage_site"
                            node-alias="external_url_type"
                            placeholder="Select URL Type"
                        />
                    </LabelledInput>
                </FormField>
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
                        {{ slot.urlType }} {{ slot.url }} {{ slot.linkText }}
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
