<script setup lang="ts">
import { useTemplateRef, inject, ref, onMounted, watch } from 'vue';
import type { Ref } from 'vue';

import FieldSet from 'primevue/fieldset';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import DatePicker from 'primevue/datepicker';
import { Form, FormField } from '@primevue/forms';
import type { FormFieldResolverOptions } from '@primevue/forms';
import ConceptSelect from '@/bcgov_arches_common/components/ConceptSelect/ConceptSelect.vue';
import ConceptRadioButtons from '@/bcgov_arches_common/components/ConceptSelect/ConceptRadioButtons.vue';
import MultiValuePlaceholder from '@/bcgov_arches_common/components/multiValuePlaceholder/MultiValuePlaceholder.vue';
import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import type { HeritageSite } from '@/bcrhp/schema/HeritageSiteSchema.ts';
import {
    SiteDetails,
    Chronology,
    ArchitectOrBuilder,
    RequiredURLs,
    requiredSiteDetailsSchema,
    requiredChronologySchema,
    requiredArchitectBuilderSchema,
    requiredRequiredURLsSchema,
    getArchitectOrBuilderSchema,
    getChronologySchema,
    getRequiredURLsSchema,
} from '@/bcrhp/schema/SiteDetailsSchema.ts';
import type { ZodError } from 'zod';

const heritageSite: typeof HeritageSite = inject(
    'heritageSite',
) as typeof HeritageSite;
const heritageSiteRef: Ref<typeof HeritageSite> = ref(heritageSite);
const chronologies = ref([] as Array<string>);

const currentChronology = ref(getChronologySchema());
const currentArchitectOrBuilder = ref(getArchitectOrBuilderSchema());
const currentURL = ref(getRequiredURLsSchema());

// const updateSelectValue = function (
//     newValue: string,
//     selectField: typeof RadioButton | typeof ConceptSelect,
// ) {
//     console.log(`New value ${newValue}`);
//     // validateField(selectField);
// };

watch(currentChronology.value, () => {
    updateAddChronology();
});
watch(currentArchitectOrBuilder.value, () => {
    updateAddOtherArchitectOrBuilder();
});
watch(currentURL.value, () => {
    updateAddOtherURL();
});

const architectsOrBuilders = ref([] as Array<string>);
const urls = ref([] as Array<string>);
const addChronologyDisabled = ref(false);
const addArchitectOrBuilderDisabled = ref(false);
const addURLDisabled = ref(false);

type FormErrors = Partial<Record<keyof typeof HeritageSite, string[]>>;
const errors: Ref<FormErrors> = ref<FormErrors>({});

const fields = {
    eventTypeField: useTemplateRef('eventTypeField'),
    startYearField: useTemplateRef('startYearField'),
    endYearField: useTemplateRef('endYearField'),
    chronologyNotesField: useTemplateRef('chronologyNotesField'),
    architectOrBuilderNameField: useTemplateRef('architectOrBuilderNameField'),
    architectOrBuilderTypeField: useTemplateRef('architectOrBuilderTypeField'),
    architectOrBuilderNotesField: useTemplateRef(
        'architectOrBuilderNotesField',
    ),
    urlTypeField: useTemplateRef('urlTypeField'),
    linkTextField: useTemplateRef('linkTextField'),
    urlField: useTemplateRef('urlField'),
};
const isValid = () => {
    // We don't want to validate fields the first time we show the step
    if (!validateFields) {
        validateFields = true;
        return true;
    }
    let valid = true;

    for (const field of Object.values(fields) as Array<Ref>) {
        valid =
            resolver({
                name: field?.value.$el.id,
            } as FormFieldResolverOptions) && valid;
    }
    return valid;
};

const resolver = function (e: FormFieldResolverOptions): Record<string, any> {
    if (Object.hasOwn(currentChronology.value, e.name ?? '')) {
        return validateChronologyField(e as FormFieldResolverOptions);
    } else if (Object.hasOwn(currentArchitectOrBuilder.value, e.name ?? '')) {
        return validateArchitectOrBuilderField(e as FormFieldResolverOptions);
    } else if (Object.hasOwn(currentURL.value, e.name ?? '')) {
        return validateURLField(e as FormFieldResolverOptions);
    }

    return {};
};
const validateSiteDetailsFields = function (
    event: FormFieldResolverOptions,
): Record<string, any> {
    const key: keyof typeof SiteDetails =
        event.name as keyof typeof SiteDetails;
    const fieldValidation = requiredSiteDetailsSchema.shape[key].safeParse(
        heritageSiteRef.value[key],
    );
    if (fieldValidation.success) {
        errors.value[key] = [];
    } else {
        errors.value[key] = (
            fieldValidation.error as typeof ZodError
        ).flatten().formErrors;
    }
    return fieldValidation.success;
};

const validateChronologyField = function (
    event: FormFieldResolverOptions,
): Record<string, any> {
    const key: keyof typeof Chronology = event.name as keyof typeof Chronology;
    const fieldValidation = requiredChronologySchema.shape[key].safeParse(
        currentChronology.value[key],
    );
    if (fieldValidation.success) {
        errors.value[key] = [];
    } else {
        errors.value[key] = (
            fieldValidation.error as typeof ZodError
        ).flatten().formErrors;
    }
    return fieldValidation.success;
};

const validateArchitectOrBuilderField = function (
    event: FormFieldResolverOptions,
): Record<string, any> {
    const key: keyof typeof ArchitectOrBuilder =
        event.name as keyof typeof ArchitectOrBuilder;
    const fieldValidation = requiredArchitectBuilderSchema.shape[key].safeParse(
        currentArchitectOrBuilder.value[key],
    );
    if (fieldValidation.success) {
        errors.value[key] = [];
    } else {
        errors.value[key] = (
            fieldValidation.error as typeof ZodError
        ).flatten().formErrors;
    }
    return fieldValidation.success;
};

const validateURLField = function (
    event: FormFieldResolverOptions,
): Record<string, any> {
    const key: keyof typeof RequiredURLs =
        event.name as keyof typeof RequiredURLs;
    const fieldValidation = requiredRequiredURLsSchema.shape[key].safeParse(
        currentURL.value[key],
    );
    if (fieldValidation.success) {
        errors.value[key] = [];
    } else {
        errors.value[key] = (
            fieldValidation.error as typeof ZodError
        ).flatten().formErrors;
    }
    return fieldValidation.success;
};

const updateAddChronology = function () {
    addChronologyDisabled.value =
        !(
            currentChronology.value.eventType &&
            currentChronology.value.startYear &&
            currentChronology.value.endYear
        ) || heritageSiteRef.value.siteDetails.chronologies.length > 4;
};
const updateAddOtherArchitectOrBuilder = function () {
    addArchitectOrBuilderDisabled.value =
        !(
            currentArchitectOrBuilder.value.architectOrBuilderName &&
            currentArchitectOrBuilder.value.architectOrBuilderType
        ) || heritageSiteRef.value.siteDetails.architectsOrBuilders.length > 4;
};
const updateAddOtherURL = function () {
    addURLDisabled.value =
        !(
            currentURL.value.urlType &&
            currentURL.value.linkText &&
            currentURL.value.url
        ) || heritageSiteRef.value.siteDetails.urls.length > 4;
};

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

    updateAddChronology();
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

    updateAddOtherArchitectOrBuilder();
};
const saveURL = function () {
    console.log('saveURL');
    heritageSiteRef.value.siteDetails.urls.push({
        urlType: currentURL.value.urlType,
        linkText: currentURL.value.linkText,
        url: currentURL.value.url,
    });

    updateAddOtherURL();
};

const deleteChronologyCallback = function (index: number) {
    heritageSiteRef.value.siteDetails.chronologies.splice(index, 1);

    updateAddOtherArchitectOrBuilder();
};

const deleteArchitectBuilderCallback = function (index: number) {
    heritageSiteRef.value.siteDetails.architectsOrBuilders.splice(index, 1);

    updateAddOtherArchitectOrBuilder();
};

const deleteURLCallback = function (index: number) {
    heritageSiteRef.value.siteDetails.urls.splice(index, 1);

    updateAddOtherURL();
};

let validateFields = false;

// This needs to be removed - added because ESLint was complaining. Need to figure out
// configuration so API methods are not
defineExpose({ isValid });

onMounted(() => {
    heritageSiteRef.value.siteDetails.chronologies = chronologies;
    heritageSiteRef.value.siteDetails.architectsOrBuilders =
        architectsOrBuilders;
    heritageSiteRef.value.siteDetails.urls = urls;

    updateAddChronology();
    updateAddOtherArchitectOrBuilder();
    updateAddOtherURL();
});
</script>
<template>
    <Form
        ref="siteDetailsRef"
        name="siteDetailsRef"
    >
        <FieldSet
            id="chronologyFieldset"
            legend="Chronology"
        >
            <div class="flex flex-row flex-wrap gap-4">
                <div class="inline-block">
                    <div class="flex flex-col">
                        <FormField
                            :resolver="resolver"
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
                    :resolver="resolver"
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
                    :resolver="resolver"
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
                        :resolver="resolver"
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
                    :resolver="resolver"
                    name="chronologyNotes"
                >
                    <LabelledInput
                        label="Chronology Notes (Optional)"
                        hint="Enter details about the significant event"
                        input-name="chronologyNotes"
                        :error-message="errors.chronologyNotes?.join(',')"
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
                    :resolver="resolver"
                    name="architectOrBuilderName"
                >
                    <LabelledInput
                        label="Architect / Builder Name"
                        hint="Enter the company or individual's name"
                        input-name="architectOrBuilderName"
                        class="inline-block"
                        :error-message="
                            errors.architectOrBuilderName?.join(',')
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
                    :resolver="resolver"
                    name="architectOrBuilderType"
                >
                    <LabelledInput
                        label="Type"
                        input-name="architectOrBuilderType"
                        :error-message="
                            errors.architectOrBuilderType?.join(',')
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
                    :resolver="resolver"
                    name="architectOrBuilderNotes"
                >
                    <LabelledInput
                        label="Architect / Builder Name Notes (Optional)"
                        hint="Provide any additional comments about the architect/builder"
                        input-name="architectOrBuilderNotes"
                        :error-message="
                            errors.architectOrBuilderNotes?.join(',')
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
                    :resolver="resolver"
                    name="urlType"
                >
                    <LabelledInput
                        label="URL Type"
                        hint="Acceptable URL Types"
                        input-name="urlType"
                        :error-message="errors.urlType?.join(',')"
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
                    :resolver="resolver"
                    name="linkText"
                >
                    <LabelledInput
                        label="Link Text"
                        hint="Enter text that describes the link"
                        input-name="linkText"
                        :error-message="errors.linkText?.join(',')"
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
                    :resolver="resolver"
                    name="url"
                >
                    <LabelledInput
                        label="URL"
                        hint="URL must be stable and publicly accessible"
                        input-name="url"
                        :error-message="errors.url?.join(',')"
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
