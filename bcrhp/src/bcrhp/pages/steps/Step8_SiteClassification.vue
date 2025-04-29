<script setup lang="ts">
import { inject, ref, onMounted } from 'vue';
import type { Ref } from 'vue';

import FieldSet from 'primevue/fieldset';
import Button from 'primevue/button';
import RadioButton from 'primevue/radiobutton';
import Select from 'primevue/select';
import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import MultiValuePlaceholder from '@/bcgov_arches_common/components/multiValuePlaceholder/MultiValuePlaceholder.vue';
import ConceptSelect from '@/bcgov_arches_common/components/ConceptSelect/ConceptSelect.vue';
import ConceptRadioButtons from '@/bcgov_arches_common/components/ConceptSelect/ConceptRadioButtons.vue';
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
    getHeritageClassSchema,
    getHeritageFunctionSchema,
    getHeritageThemeSchema,
} from '@/bcrhp/schema/SiteClassificationSchema.ts';
import type { ZodError } from 'zod';

const heritageSite: typeof HeritageSite = inject(
    'heritageSite',
) as typeof HeritageSite;
const heritageSiteRef: Ref<typeof HeritageSite> = ref(heritageSite);

type FormErrors = Partial<Record<keyof typeof HeritageSite, string[]>>;
const errors: Ref<FormErrors> = ref<FormErrors>({});
const currentHeritageClass = ref(getHeritageClassSchema());
const currentHeritageFunction = ref(getHeritageFunctionSchema());
const currentHeritageTheme = ref(getHeritageThemeSchema());
const heritageClasses = ref([] as Array<string>);
const heritageFunctions = ref([] as Array<string>);
const heritageThemes = ref([] as Array<string>);
const addContributingResourcesDisabled = ref(false);
const addOtherFunctionCategoryDisabled = ref(false);
const addOtherHeritageSiteDisabled = ref(false);

const updateSelectValue = function (
    newValue: string,
    selectField: typeof RadioButton | typeof ConceptSelect,
) {
    console.log(`New value ${newValue}`);
    validateField(selectField);
};

const validateField = function (
    inputField: typeof Select | typeof RadioButton,
) {
    if (Object.hasOwn(currentHeritageClass, inputField?.inputId)) {
        validateHeritageClassField(inputField as HTMLInputElement);
    } else if (Object.hasOwn(currentHeritageFunction, inputField?.inputId)) {
        validateHeritageFunctionField(inputField as HTMLInputElement);
    } else if (Object.hasOwn(currentHeritageTheme, inputField?.inputId)) {
        validateHeritageThemeField(inputField as HTMLInputElement);
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
        currentHeritageClass.value[field.id],
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
        currentHeritageFunction.value[field.id],
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
        currentHeritageTheme.value[field.id],
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
        contributingResources: currentHeritageClass.value.contributingResources,
        heritageCategory: currentHeritageClass.value.heritageCategory,
        ownership: currentHeritageClass.value.ownership,
    });

    currentHeritageClass.value.contributingResources = 0;
    currentHeritageClass.value.heritageCategory = '';
    currentHeritageClass.value.ownership = '';

    updateAddHeritageClassCategory();
};

const saveFunctionCategory = function () {
    console.log('saveFunctionCategory');
    heritageSiteRef.value.siteClassification.heritageFunctions.push({
        functionCategory: currentHeritageFunction.value.functionCategory,
        functionCategoryType:
            currentHeritageFunction.value.functionCategoryType,
    });

    currentHeritageFunction.value.functionCategory = '';
    currentHeritageFunction.value.functionCategoryType = '';

    updateAddOtherFunctionCategory();
};

const saveHeritageTheme = function () {
    console.log('saveHeritageThemes');
    heritageSiteRef.value.siteClassification.heritageThemes.push(
        currentHeritageTheme.value.heritageTheme,
    );

    currentHeritageTheme.value.heritageTheme = '';

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
                    v-model="currentHeritageClass.contributingResources"
                    aria-describedby="contributing-resources-help"
                    aria-required="true"
                    fluid
                    class="inline-block"
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
            <div class="flex flex-col">
                <ConceptRadioButtons
                    id="heritageCategory"
                    ref="heritageCategoryField"
                    v-model="currentHeritageClass.heritageCategory"
                    graph-slug="heritage_site"
                    node-alias="heritage_category"
                    group-direction="column"
                    @value-updated="updateSelectValue"
                />
            </div>
            <p class="mb-1">Ownership</p>
            <div class="flex flex-col">
                <ConceptRadioButtons
                    id="ownership"
                    ref="ownershipField"
                    v-model="currentHeritageClass.ownership"
                    graph-slug="heritage_site"
                    node-alias="ownership"
                    group-direction="column"
                    @value-updated="updateSelectValue"
                />
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
                <ConceptSelect
                    id="functionCategory"
                    ref="functionCategoryField"
                    v-model="currentHeritageFunction.functionCategory"
                    graph-slug="heritage_site"
                    node-alias="function_category"
                    @value-updated="updateSelectValue"
                />
                <div class="inline-block">
                    <ConceptRadioButtons
                        id="functionCategoryType"
                        ref="functionCategoryTypeRef"
                        v-model="currentHeritageFunction.functionCategoryType"
                        graph-slug="heritage_site"
                        node-alias="functional_category"
                        group-direction="column"
                        @value-updated="updateSelectValue"
                    />
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
                {{ slot.functionCategory }}
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
                <ConceptSelect
                    id="heritageTheme"
                    ref="heritageThemeField"
                    v-model="currentHeritageTheme.heritageTheme"
                    graph-slug="heritage_site"
                    node-alias="heritage_theme"
                    @value-updated="updateSelectValue"
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
            <div class="parent value">{{ slotProps.value }}</div>
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
