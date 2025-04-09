<script setup lang="ts">
import { inject, ref, onMounted } from 'vue';
import type { Ref } from 'vue';

import FieldSet from 'primevue/fieldset';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import RadioButton from 'primevue/radiobutton';
import Select from 'primevue/select';
import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import MultiValuePlaceholder from '@/bcgov_arches_common/components/multiValuePlaceholder/MultiValuePlaceholder.vue';
import type { HeritageSite } from '@/bcrhp/schema/HeritageSiteSchema.ts';
import {
    SiteClassification,
    HeritageClass,
    HeritageFunction,
    HeritageTheme,
    requiredSiteClassificationSchema,
    requiredHeritageClassSchema,
    requiredHeritageFunctionSchema,
    requiredHeritageThemeSchema,
} from '@/bcrhp/schema/SiteClassificationSchema.ts';
import type { ZodError } from 'zod';

const heritageSite: typeof HeritageSite = inject(
    'heritageSite',
) as typeof HeritageSite;
const heritageSiteRef: Ref<typeof HeritageSite> = ref(heritageSite);

type FormErrors = Partial<Record<keyof typeof HeritageSite, string[]>>;
const errors: Ref<FormErrors> = ref<FormErrors>({});
const functionCategoryOptions = ref([
    { name: 'Market', code: 'market' },
    { name: 'Eating or Drinking Establishment', code: 'eating_or_drinking' },
]);
const functionThemeOptions = ref([
    { name: 'Learning and the Arts', code: 'learning_and_arts' },
    { name: 'Architecture and Design', code: 'architecture_and_design' },
]);
const contributingResources = ref('');
const heritageClasses = ref([] as Array<string>);
const functionCategory = ref({ name: '', code: '' });
const heritageFunctions = ref([] as Array<string>);
const heritageTheme = ref({ name: '', code: '' });
const heritageThemes = ref([] as Array<string>);
const addContributingResourcesDisabled = ref(false);
const addOtherFunctionCategoryDisabled = ref(false);
const addOtherHeritageSiteDisabled = ref(false);
const heritageCategory = ref();
const ownership = ref();
const functionCategoryType = ref();

const valueChanged = function (event: Event, schema: string) {
    console.log(event);

    if (schema === 'requiredSiteClassificationSchema') {
        validateSiteClassificationFields(event.target as HTMLInputElement);
    } else if (schema === 'requiredHeritageClassSchema') {
        validateHeritageClassField(event.target as HTMLInputElement);
    } else if (schema === 'requiredHeritageFunctionSchema') {
        validateHeritageFunctionField(event.target as HTMLInputElement);
    } else if (schema === 'requiredHeritageThemeSchema') {
        validateHeritageThemeField(event.target as HTMLInputElement);
    }
};

const updateAddHeritageClassCategory = function () {
    addContributingResourcesDisabled.value =
        heritageClasses.value.length < 1 ||
        heritageSiteRef.value.siteClassification.heritageClasses.length > 4;
};

const updateAddOtherFunctionCategory = function () {
    addOtherFunctionCategoryDisabled.value =
        heritageFunctions.value.length < 1 ||
        heritageSiteRef.value.siteClassification.heritageFunctions.length > 4;
};

const updateAddOtherHeritageSite = function () {
    addOtherHeritageSiteDisabled.value =
        heritageThemes.value.length < 1 ||
        heritageSiteRef.value.siteClassification.heritageThemes.length > 4;
};

const validateSiteClassificationFields = function (field: HTMLInputElement) {
    console.log(`ID: ${field.id}`);
    const key: keyof typeof SiteClassification =
        field.id as keyof typeof SiteClassification;
    const fieldValidation = requiredSiteClassificationSchema.shape[
        key
    ].safeParse(heritageSiteRef.value[key]);
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

const validateHeritageClassField = function (field: HTMLInputElement) {
    console.log(`ID: ${field.id}`);
    const key: keyof typeof HeritageClass =
        field.id as keyof typeof HeritageClass;
    const fieldValidation = requiredHeritageClassSchema.shape[key].safeParse(
        heritageSiteRef.value.siteClassification[key],
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

const validateHeritageFunctionField = function (field: HTMLInputElement) {
    console.log(`ID: ${field.id}`);
    const key: keyof typeof HeritageFunction =
        field.id as keyof typeof HeritageFunction;
    const fieldValidation = requiredHeritageFunctionSchema.shape[key].safeParse(
        heritageSiteRef.value.siteClassification[key],
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

const validateHeritageThemeField = function (field: HTMLInputElement) {
    console.log(`ID: ${field.id}`);
    const key: keyof typeof HeritageTheme =
        field.id as keyof typeof HeritageTheme;
    const fieldValidation = requiredHeritageThemeSchema.shape[key].safeParse(
        heritageSiteRef.value.siteClassification[key],
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

const saveHeritageClass = function () {
    console.log('saveHeritageClass');
    heritageSiteRef.value.siteClassification.heritageClasses.push({
        contributingResources: contributingResources.value,
        heritageCategory: heritageCategory.value?.toString(),
        ownership: ownership.value?.toString(),
    });

    updateAddHeritageClassCategory();
};

const saveFunctionCategory = function () {
    console.log('saveFunctionCategory');
    heritageSiteRef.value.siteClassification.heritageFunctions.push({
        functionCategory: functionCategory.value,
        functionCategoryType: functionCategoryType.value?.toString(),
    });

    updateAddOtherFunctionCategory();
};

const saveHeritageTheme = function () {
    console.log('saveHeritageThemes');
    heritageSiteRef.value.siteClassification.heritageThemes.push(
        heritageTheme.value,
    );

    updateAddOtherHeritageSite();
};

const deleteContributingResourcesCallback = function (index: number) {
    heritageSiteRef.value.siteClassification.heritageClasses.splice(index, 1);

    updateAddHeritageClassCategory();
};

const deleteFunctionCategoryCallback = function (index: number) {
    heritageSiteRef.value.siteClassification.heritageFunctions.splice(index, 1);

    updateAddOtherFunctionCategory();
};

const deleteHeritageThemeCallback = function (index: number) {
    heritageSiteRef.value.siteClassification.heritageThemes.splice(index, 1);

    updateAddOtherHeritageSite();
};

onMounted(() => {
    heritageSiteRef.value.siteClassification.heritageClasses = heritageClasses;
    heritageSiteRef.value.siteClassification.heritageFunctions =
        heritageFunctions;
    heritageSiteRef.value.siteClassification.heritageThemes = heritageThemes;

    updateAddHeritageClassCategory();
    updateAddOtherFunctionCategory();
    updateAddOtherHeritageSite();
});
</script>
<template>
    <FieldSet
        id="heritageDetailsFieldset"
        legend="Heritage Class"
    >
        <LabelledInput
            label="Number of Contributing Resources"
            input-name="contributingResources"
            :error-message="errors.contributingResources?.join(',')"
            :required="true"
        >
            <div>
                <InputText
                    id="contributingResources"
                    ref="numberOfResourcesField"
                    v-model="contributingResources"
                    aria-describedby="contributing-resources-help"
                    aria-required="true"
                    fluid
                    class="inline-block"
                    @change="
                        valueChanged($event, 'requiredHeritageClassSchema')
                    "
                />
                <Button
                    id="saveHeritageClass"
                    :disabled="addContributingResourcesDisabled"
                    :aria-disabled="addContributingResourcesDisabled"
                    label="Add"
                    class="inline-block"
                    @click="saveHeritageClass"
                ></Button>
            </div>
        </LabelledInput>
        <div class="flex flex-col">
            <p class="mb-1">Heritage Category</p>
            <div class="card flex flex-wrap gap-4">
                <div class="flex items-center gap-2">
                    <RadioButton
                        v-model="heritageCategory"
                        inputId="heritageCategory"
                        value="Archeological Site"
                        @change="
                            valueChanged($event, 'requiredHeritageClassSchema')
                        "
                    />
                    <label for="archeological_site">
                        Archaeological Site / Remains
                    </label>
                </div>
                <div class="flex items-center gap-2">
                    <RadioButton
                        v-model="heritageCategory"
                        inputId="heritageCategory"
                        value="Building"
                        @change="
                            valueChanged($event, 'requiredHeritageClassSchema')
                        "
                    />
                    <label for="building"> Building </label>
                </div>
                <div class="flex items-center gap-2">
                    <RadioButton
                        v-model="heritageCategory"
                        inputId="heritageCategory"
                        value="Collection"
                        @change="
                            valueChanged($event, 'requiredHeritageClassSchema')
                        "
                    />
                    <label for="collection"> Collection </label>
                </div>
                <div class="flex items-center gap-2">
                    <RadioButton
                        v-model="heritageCategory"
                        inputId="heritageCategory"
                        value="Landscape Features"
                        @change="
                            valueChanged($event, 'requiredHeritageClassSchema')
                        "
                    />
                    <label for="landscape_features">
                        Landscape(s) or Landscape Feature(s)
                    </label>
                </div>
                <div class="flex items-center gap-2">
                    <RadioButton
                        v-model="heritageCategory"
                        inputId="heritageCategory"
                        value="Structure"
                        @change="
                            valueChanged($event, 'requiredHeritageClassSchema')
                        "
                    />
                    <label for="structure"> Structure </label>
                </div>
            </div>
            <p class="mb-1">Ownership</p>
            <div class="card flex flex-wrap gap-4">
                <div class="flex items-center gap-2">
                    <RadioButton
                        v-model="ownership"
                        inputId="ownership"
                        value="Not-for-profit"
                        @change="
                            valueChanged($event, 'requiredHeritageClassSchema')
                        "
                    />
                    <label for="not_for_profit"> Not-for-profit </label>
                </div>
                <div class="flex items-center gap-2">
                    <RadioButton
                        v-model="ownership"
                        inputId="ownership"
                        value="Private"
                        @change="
                            valueChanged($event, 'requiredHeritageClassSchema')
                        "
                    />
                    <label for="private"> Private </label>
                </div>
                <div class="flex items-center gap-2">
                    <RadioButton
                        v-model="ownership"
                        inputId="ownership"
                        value="Public (federal)"
                        @change="
                            valueChanged($event, 'requiredHeritageClassSchema')
                        "
                    />
                    <label for="public_federal"> Public (federal) </label>
                </div>
                <div class="flex items-center gap-2">
                    <RadioButton
                        v-model="ownership"
                        inputId="ownership"
                        value="Public (local)"
                        @change="
                            valueChanged($event, 'requiredHeritageClassSchema')
                        "
                    />
                    <label for="public_local"> Public (local) </label>
                </div>
                <div class="flex items-center gap-2">
                    <RadioButton
                        v-model="ownership"
                        inputId="ownership"
                        value="Public (provincial)"
                        @change="
                            valueChanged($event, 'requiredHeritageClassSchema')
                        "
                    />
                    <label for="public_provincial"> Public (provincial) </label>
                </div>
            </div>
        </div>
        <MultiValuePlaceholder
            v-slot="slotProps"
            :showDeleteButton="true"
            :displayValues="heritageClasses"
            label="Heritage Class/Classes"
            :deleteCallback="deleteContributingResourcesCallback"
        >
            <div
                v-for="slot in slotProps"
                :key="slot"
                class="parent value"
            >
                {{ slot.heritageCategory }} {{ slot.ownership }}
                {{ slot.contributingResources }}
            </div>
        </MultiValuePlaceholder>
    </FieldSet>
    <Fieldset
        id="heritageFunctionFieldset"
        class="p-fieldset p-component mt-2"
        legend="Heritage Function"
    >
        <LabelledInput
            label="Function Category"
            input-name="heritageTheme"
            :error-message="errors.functionCategories?.join(',')"
            :required="true"
        >
            <div class="p-inputtext-fluid flex flex-row">
                <Select
                    id="functionCategory"
                    ref="functionCategoryField"
                    v-model="functionCategory"
                    inputId="functionCategory"
                    optionLabel="name"
                    placeholder="Select Function Category"
                    :options="functionCategoryOptions"
                    aria-describedby="function-category-help"
                    aria-required="true"
                    fluid
                    class="w-full md:w-14rem"
                    @blur="
                        valueChanged($event, 'requiredHeritageFunctionSchema')
                    "
                />
                <div class="inline-block">
                    <div class="inline-block">
                        <Checkbox
                            v-model="functionCategoryType"
                            inputId="functionCategoryType"
                            value="Current"
                            @change="
                                valueChanged(
                                    $event,
                                    'requiredHeritageFunctionSchema',
                                )
                            "
                        />
                        <label for="current">Current</label>
                    </div>
                    <div class="inline-block">
                        <Checkbox
                            v-model="functionCategoryType"
                            inputId="functionCategoryType"
                            value="Historic"
                            @change="
                                valueChanged(
                                    $event,
                                    'requiredHeritageFunctionSchema',
                                )
                            "
                        />
                        <label for="historic">Historic</label>
                    </div>
                </div>
            </div>
            <Button
                id="saveFunctionCategory"
                label="Add"
                class="inline-block"
                :disabled="addOtherFunctionCategoryDisabled"
                :aria-disabled="addOtherFunctionCategoryDisabled"
                @click="saveFunctionCategory"
            ></Button>
        </LabelledInput>
        <MultiValuePlaceholder
            v-slot="slotProps"
            :showDeleteButton="true"
            :displayValues="heritageFunctions"
            label="Category/Categories"
            :deleteCallback="deleteFunctionCategoryCallback"
        >
            <div
                v-for="slot in slotProps"
                :key="slot"
                class="parent value"
            >
                {{ slot.functionCategory?.name }}
                {{ slot.functionCategoryType }}
            </div>
        </MultiValuePlaceholder>
    </Fieldset>
    <Fieldset
        id="heritageThemeFieldset"
        class="p-fieldset p-component mt-2"
        legend="Heritage Theme"
    >
        <LabelledInput
            label="Heritage Theme"
            input-name="heritageTheme"
            :error-message="errors.heritageThemes?.join(',')"
            :required="true"
        >
            <div class="p-inputtext-fluid">
                <Select
                    id="heritageTheme"
                    ref="heritageThemeField"
                    v-model="heritageTheme"
                    optionLabel="name"
                    inputId="heritageTheme"
                    placeholder="Select Function Theme"
                    :options="functionThemeOptions"
                    aria-describedby="function-theme-help"
                    aria-required="true"
                    fluid
                    class="w-full md:w-14rem"
                    @blur="valueChanged($event, 'requiredHeritageThemeSchema')"
                />
            </div>
            <Button
                id="addHeritageTheme"
                label="Add"
                class="inline-block"
                :disabled="addOtherHeritageSiteDisabled"
                :aria_disabled="addOtherHeritageSiteDisabled"
                @click="saveHeritageTheme"
            ></Button>
        </LabelledInput>
        <MultiValuePlaceholder
            v-slot="slotProps"
            :showDeleteButton="true"
            :displayValues="heritageThemes"
            label="Theme(s)"
            :deleteCallback="deleteHeritageThemeCallback"
        >
            <div class="parent value">{{ slotProps.value?.name }}</div>
        </MultiValuePlaceholder>
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
</style>
