<script setup lang="ts">
import { useTemplateRef, inject, ref, onMounted } from 'vue';
import type { Ref } from 'vue';

import FieldSet from 'primevue/fieldset';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import DatePicker from 'primevue/datepicker';
import Dropdown from 'primevue/dropdown';

import MultiValuePlaceholder from '@/bcgov_arches_common/components/multiValuePlaceholder/MultiValuePlaceholder.vue';
import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import type { HeritageSite } from '@/bcrhp/schema/HeritageSiteSchema.ts';
import { requiredSiteDetailsSchema } from '@/bcrhp/schema/SiteDetailsSchema.ts';
import type { ZodError } from 'zod';

const heritageSite: typeof HeritageSite = inject(
    'heritageSite',
) as typeof HeritageSite;
const heritageSiteRef: Ref<typeof HeritageSite> = ref(heritageSite);
const startYear = ref();
const endYear = ref();
const chronologyNotes = ref();
const chronologies = ref([] as Array<string>);
const architectOrBuilderName = ref();
const architectOrBuilderNotes = ref();
const architectOrBuilderType = ref();
const architectOrBuilderTypeOptions = ref([
    { name: 'Architect', code: 'architect' },
    { name: 'Builder', code: 'builder' },
]);
const architectsOrBuilders = ref([] as Array<string>);
const urlType = ref();
const linkText = ref();
const url = ref('');
const urls = ref([] as Array<string>);
const urlTypeOptions = ref([
    { name: 'Historic Place Website', code: 'historic_place_website' },
    { name: 'Provincial Website', code: 'provincial_website' },
]);
const addURLDisabled = ref(false);

type FormErrors = Partial<Record<keyof typeof HeritageSite, string[]>>;
const errors: Ref<FormErrors> = ref<FormErrors>({});

// These names need to match the Zog schema
const eventType = ref();
const circa = ref('Exact');

const fields = {
    startYearField: useTemplateRef('startYearField'),
    endYearField: useTemplateRef('endYearField'),
    chronologyNotesField: useTemplateRef('chronologyNotesField'),
    architectOrBuilderNameField: useTemplateRef('architectOrBuilderNameField'),
    architectOrBuilderTypeField: useTemplateRef('architectOrBuilderTypeField'),
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
        valid = validateField(field?.value.$el as HTMLInputElement) && valid;
    }
    return valid;
};

const valueUpdated = function (value: string | undefined) {
    console.log(`valueUpdated: ${value}`);
};

const valueChanged = function (event: Event) {
    console.log(`valueChanged`);
    validateField(event.target as HTMLInputElement);
};

const onFocusHandler = function (event: Event) {
    console.log(`onFocusHandler ${event}`);
    // (event.target as HTMLInputElement).classList.remove("p-invalid");
};

const onFocusOutHandler = function (event: Event) {
    console.log(`onFocusOutHandler`);
    validateField(event.target as HTMLInputElement);
    // (event.target as HTMLInputElement).classList.remove("p-invalid");
};

const validateField = function (field: HTMLInputElement) {
    console.log(`ID: ${field.id}`);
    const key: keyof typeof HeritageSite =
        field.id as keyof typeof HeritageSite;
    const fieldValidation = requiredSiteDetailsSchema.shape[key].safeParse(
        heritageSiteRef.value[key],
    );
    if (fieldValidation.success) {
        field.classList.remove('p-invalid');
        errors.value[key] = [];
    } else {
        field.classList.add('p-invalid');
        errors.value[key] = (
            fieldValidation.error as typeof ZodError
        ).flatten().formErrors;
    }
    return fieldValidation.success;
};

const updateAddChronology = function () {
    addURLDisabled.value =
        chronologies.value.length < 1 ||
        heritageSiteRef.value.siteDetails.chronologies.length > 4;
};
const updateAddOtherArchitectOrBuilder = function () {
    addURLDisabled.value =
        architectsOrBuilders.value.length < 1 ||
        heritageSiteRef.value.siteDetails.architectsOrBuilders.length > 4;
};

const updateAddOtherURL = function () {
    addURLDisabled.value =
        urls.value.length < 1 ||
        heritageSiteRef.value.siteDetails.urls.length > 4;
};

const saveChronology = function () {
    console.log('saveChronology');
    heritageSiteRef.value.siteDetails.chronologies.push({
        eventType: eventType.value.toString(),
        startYear: startYear.value,
        endYear: endYear.value,
        circa: circa.value,
        chronologyNotes: chronologyNotes.value,
    });

    updateAddChronology();
};

const saveArchitectOrBuilder = function () {
    console.log('saveArchitectOrBuilder');
    heritageSiteRef.value.siteDetails.architectsOrBuilders.push({
        architectOrBuilderName: architectOrBuilderName.value,
        architectOrBuilderType: architectOrBuilderType.value,
        architectOrBuilderNotes: architectOrBuilderNotes.value,
    });

    updateAddOtherArchitectOrBuilder();
};
const saveURL = function () {
    console.log('saveURL');
    heritageSiteRef.value.siteDetails.urls.push({
        urlType: urlType.value,
        linkText: linkText.value,
        url: url.value,
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
    <FieldSet
        id="chronologyFieldset"
        legend="Chronology"
    >
        <div class="p-inputtext-fluid">
            <div class="inline-block">
                <div class="flex flex-col">
                    <p class="mb-1">Event Type</p>
                    <div class="card flex flex-col">
                        <div class="flex items-center gap-2">
                            <Checkbox
                                v-model="eventType"
                                inputId="construction"
                                value="Construction"
                            />
                            <label for="construction"> Construction </label>
                        </div>
                        <div class="flex items-center gap-2">
                            <Checkbox
                                v-model="eventType"
                                inputId="significant"
                                value="Significant"
                            />
                            <label for="significant"> Significant </label>
                        </div>
                    </div>
                </div>
            </div>
            <p>Start Year</p>
            <DatePicker
                id="startYear"
                ref="startYearField"
                v-model="startYear"
                dateFormat="yy"
                view="year"
                aria-describedby="start-year-help"
                aria-required="true"
            />
            <p>End Year</p>
            <DatePicker
                id="endYear"
                ref="endYearField"
                v-model="endYear"
                dateFormat="yy"
                view="year"
                aria-describedby="end-year-help"
                aria-required="true"
            />
            <div class="inline-block">
                <Checkbox
                    v-model="circa"
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
                :error-message="errors.chronologyNotes?.join(',')"
            >
                <div class="">
                    <InputText
                        id="chronologyNotes"
                        ref="chronologyNotesField"
                        v-model="chronologyNotes"
                        theme="snow"
                        aria-describedby="chronology-help"
                        fluid
                        class="inline-block"
                        @editorChange="valueChanged"
                        @focus="onFocusHandler"
                        @blur="onFocusOutHandler"
                        @update:model-value="valueUpdated"
                    />
                    <Button
                        id="saveChronology"
                        label="Add"
                        class="inline-block"
                        @click="saveChronology"
                    ></Button>
                </div>
            </LabelledInput>
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
            <LabelledInput
                label="Architect / Builder Name"
                hint="Enter the company or individual's name"
                input-name="architectOrBuilderName"
                class="inline-block"
                :error-message="errors.architectOrBuilderName?.join(',')"
                :required="true"
            >
                <div class="p-inputtext-fluid">
                    <InputText
                        id="architectOrBuilderName"
                        ref="architectOrBuilderNameField"
                        v-model="architectOrBuilderName"
                        aria-describedby="architect-or-builder-help"
                        aria-required="true"
                        fluid
                        @change="valueChanged"
                        @focus="onFocusHandler"
                        @focusout="onFocusOutHandler"
                        @update:model-value="valueUpdated"
                    />
                </div>
            </LabelledInput>
            <LabelledInput
                label="Type"
                input-name="architectOrBuilderType"
                :error-message="errors.architectOrBuilderType?.join(',')"
                :required="true"
            >
                <Dropdown
                    id="architectOrBuilderType"
                    ref="architectOrBuilderTypeField"
                    v-model="architectOrBuilderType"
                    optionLabel="name"
                    placeholder="Select Type"
                    :options="architectOrBuilderTypeOptions"
                    aria-describedby="architect-or-builder-type-help"
                    aria-required="true"
                    fluid
                    class="w-full md:w-14rem"
                    @update:model-value="valueUpdated"
                />
            </LabelledInput>
        </div>
        <div class="p-inputtext-fluid">
            <LabelledInput
                label="Architect / Builder Name Notes (Optional)"
                hint="Provide any additional comments about the architect/builder"
                input-name="architectOrBuilderNotes"
                :error-message="errors.architectOrBuilderNotes?.join(',')"
                :required="false"
            >
                <div class="">
                    <InputText
                        id="architectOrBuilderNotes"
                        ref="architectOrBuilderNotesField"
                        v-model="architectOrBuilderNotes"
                        aria-describedby="architect-or-builder-notes-help"
                        aria-required="true"
                        fluid
                        class="inline-block"
                        @change="valueChanged"
                        @focus="onFocusHandler"
                        @focusout="onFocusOutHandler"
                        @update:model-value="valueUpdated"
                    />
                    <Button
                        id="addOtherName"
                        label="Add"
                        class="inline-block"
                        @click="saveArchitectOrBuilder"
                    ></Button>
                </div>
            </LabelledInput>
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
                {{ slot.architectOrBuilderType?.name }}
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
            <LabelledInput
                label="URL Type"
                hint="Acceptable URL Types"
                input-name="urlType"
                :error-message="errors.urlType?.join(',')"
                :required="true"
            >
                <Dropdown
                    id="urlType"
                    ref="urlTypeField"
                    v-model="urlType"
                    placeholder="Select Type"
                    optionLabel="name"
                    :options="urlTypeOptions"
                    aria-describedby="url-type-help"
                    aria-required="true"
                    fluid
                    class="w-full md:w-14rem"
                    @update:model-value="valueUpdated"
                />
            </LabelledInput>
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
                        v-model="linkText"
                        aria-describedby="link-text-help"
                        aria-required="true"
                        fluid
                        @change="valueChanged"
                        @focus="onFocusHandler"
                        @focusout="onFocusOutHandler"
                        @update:model-value="valueUpdated"
                    />
                </div>
            </LabelledInput>
        </div>
        <div class="p-inputtext-fluid">
            <LabelledInput
                label="URL"
                hint="URL must be stable and publicly accessible"
                input-name="url"
                :error-message="errors.urls?.join(',')"
                :required="true"
            >
                <div class="flex flex-row full-width">
                    <InputText
                        id="url"
                        ref="urlField"
                        v-model="url"
                        aria-describedby="url-help"
                        aria-required="true"
                        fluid
                        class="inline-block"
                        @change="valueChanged"
                        @focus="onFocusHandler"
                        @focusout="onFocusOutHandler"
                        @update:model-value="valueUpdated"
                    />
                    <Button
                        id="saveURL"
                        label="Add"
                        class="inline-block"
                        @click="saveURL"
                    ></Button>
                </div>
            </LabelledInput>
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
                    {{ slot.urlType?.name }} {{ slot.url }} {{ slot.linkText }}
                </div>
            </MultiValuePlaceholder>
        </div>
    </Fieldset>
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
