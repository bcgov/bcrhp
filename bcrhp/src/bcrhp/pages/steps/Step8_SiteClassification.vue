<script setup lang="ts">
import { useTemplateRef, inject, ref, onMounted } from 'vue';
import type { Ref } from 'vue';

import FieldSet from 'primevue/fieldset';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Dropdown from 'primevue/dropdown';
import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import MultiValuePlaceholder from '@/bcgov_arches_common/components/multiValuePlaceholder/MultiValuePlaceholder.vue';
import type { HeritageSite } from '@/bcrhp/schema/HeritageSiteSchema.ts';
import { requiredHeritageSiteSchema } from '@/bcrhp/schema/HeritageSiteSchema.ts';
import type { ZodError } from 'zod';

const heritageSite: typeof HeritageSite = inject(
    'heritageSite',
) as typeof HeritageSite;
const heritageSiteRef: Ref<typeof HeritageSite> = ref(heritageSite);

type FormErrors = Partial<Record<keyof typeof HeritageSite, string[]>>;
const errors: Ref<FormErrors> = ref<FormErrors>({});
const contributingResourcesOptions = ref([
    { name: '1', code: 1 },
    { name: '2', code: 2 },
    { name: '3', code: 3 },
    { name: '4', code: 4 },
    { name: '5', code: 5 },
]);
const functionCategoryOptions = ref([
    { name: 'Market', code: 'market' },
    { name: 'Eating or Drinking Establishment', code: 'eating_or_drinking' },
]);
const functionThemeOptions = ref([
    { name: 'Learning and the Arts', code: 'learning_and_arts' },
    { name: 'Architecture and Design', code: 'architecture_and_design' },
]);
const contributingResources = ref({ name: '', code: 0 });
const totalContributingResources = ref([] as Array<string>);
const functionCategory = ref({ name: '', code: '' });
const functionCategories = ref([] as Array<string>);
const heritageTheme = ref({ name: '', code: '' });
const heritageThemes = ref([] as Array<string>);
const addContributingResourcesDisabled = ref(false);
const addOtherFunctionCategoryDisabled = ref(false);
const addOtherHeritageSiteDisabled = ref(false);
// const otherNames = ref(string[]);

// These names need to match the Zog schema
const fields = {
    numberOfResourcesField: useTemplateRef('numberOfResourcesField'),
    heritageThemeField: useTemplateRef('heritageThemeField'),
};
const heritageCategory = ref();
const ownership = ref();
const functionCategoryCurrent = ref();
const functionCategoryHistoric = ref();

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

const updateAddContributingResourceCategory = function () {
    addContributingResourcesDisabled.value =
        contributingResources.value.code < 1 ||
        heritageSiteRef.value.totalContributingResources.length > 4;
};

const updateAddOtherFunctionCategory = function () {
    addOtherFunctionCategoryDisabled.value =
        functionCategory.value.name !== '' ||
        heritageSiteRef.value.functionCategories.length > 4;
};

const updateAddOtherHeritageSite = function () {
    addOtherHeritageSiteDisabled.value =
        heritageSiteRef.value.heritageThemes.length > 4;
};

const valueUpdated = function (value: string | undefined) {
    console.log(contributingResources.value.code);
    console.log(functionCategory.value.code);

    console.log(`valueUpdated: ${value}`);
};

const validateField = function (field: HTMLInputElement) {
    console.log(`ID: ${field.id}`);
    const key: keyof typeof HeritageSite =
        field.id as keyof typeof HeritageSite;
    const fieldValidation = requiredHeritageSiteSchema.shape[key].safeParse(
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

const saveContributingResource = function () {
    console.log('saveContributingResource');
    heritageSiteRef.value.totalContributingResources.push(
        contributingResources.value,
    );

    updateAddContributingResourceCategory();
};

const saveFunctionCategory = function () {
    console.log('saveFunctionCategory');
    heritageSiteRef.value.functionCategories.push(functionCategory.value);

    updateAddOtherFunctionCategory();
};

const saveHeritageTheme = function () {
    console.log('saveHeritageThemes');
    heritageSiteRef.value.heritageThemes.push(heritageTheme.value);

    updateAddOtherHeritageSite();
};

const deleteContributingResourcesCallback = function (index: number) {
    heritageSiteRef.value.totalContributingResources.splice(index, 1);

    updateAddContributingResourceCategory();
};

const deleteFunctionCategoryCallback = function (index: number) {
    heritageSiteRef.value.functionCategories.splice(index, 1);

    updateAddOtherFunctionCategory();
};

const deleteHeritageThemeCallback = function (index: number) {
    heritageSiteRef.value.heritageThemes.splice(index, 1);

    updateAddOtherHeritageSite();
};

let validateFields = false;

// This needs to be removed - added because ESLint was complaining. Need to figure out
// configuration so API methods are not
defineExpose({ isValid });

onMounted(() => {
    heritageSiteRef.value.totalContributingResources =
        totalContributingResources;
    heritageSiteRef.value.functionCategories = functionCategories;
    heritageSiteRef.value.heritageThemes = heritageThemes;

    updateAddContributingResourceCategory();
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
                <Dropdown
                    id="contributingResources"
                    ref="numberOfResourcesField"
                    v-model="contributingResources"
                    placeholder="0"
                    optionLabel="name"
                    :options="contributingResourcesOptions"
                    aria-describedby="reference-number-help"
                    aria-required="true"
                    fluid
                    class="w-full md:w-14rem"
                    @update:model-value="valueUpdated"
                />
                <Button
                    id="saveContributingResources"
                    :disabled="addContributingResourcesDisabled"
                    :aria-disabled="addContributingResourcesDisabled"
                    label="Add"
                    class="inline-block"
                    @click="saveContributingResource"
                ></Button>
            </div>
        </LabelledInput>
        <div class="flex flex-col">
            <p class="mb-1">Heritage Category</p>
            <div class="card flex flex-wrap gap-4">
                <div class="flex items-center gap-2">
                    <Checkbox
                        v-model="heritageCategory"
                        inputId="category1"
                        name="archaeologicalSite"
                        value="archaeologicalSite"
                    />
                    <label for="category1">
                        Archaeological Site / Remains
                    </label>
                </div>
                <div class="flex items-center gap-2">
                    <Checkbox
                        v-model="heritageCategory"
                        inputId="category2"
                        name="building"
                        value="building"
                    />
                    <label for="category2"> Building </label>
                </div>
                <div class="flex items-center gap-2">
                    <Checkbox
                        v-model="heritageCategory"
                        inputId="category3"
                        name="collection"
                        value="collection"
                    />
                    <label for="category3"> Collection </label>
                </div>
                <div class="flex items-center gap-2">
                    <Checkbox
                        v-model="heritageCategory"
                        inputId="category4"
                        name="landscapeFeatures"
                        value="landscapeFeatures"
                    />
                    <label for="category4">
                        Landscape(s) or Landscape Feature(s)
                    </label>
                </div>
                <div class="flex items-center gap-2">
                    <Checkbox
                        v-model="heritageCategory"
                        inputId="category5"
                        name="structure"
                        value="structure"
                    />
                    <label for="category5"> Structure </label>
                </div>
            </div>
            <p class="mb-1">Ownership</p>
            <div class="card flex flex-wrap gap-4">
                <div class="flex items-center gap-2">
                    <Checkbox
                        v-model="ownership"
                        inputId="ownership1"
                        name="Not-for-profit"
                        value="notForProfit"
                    />
                    <label for="ownership1"> Not-for-profit </label>
                </div>
                <div class="flex items-center gap-2">
                    <Checkbox
                        v-model="ownership"
                        inputId="ownership2"
                        name="private"
                        value="private"
                    />
                    <label for="ownership2"> Private </label>
                </div>
                <div class="flex items-center gap-2">
                    <Checkbox
                        v-model="ownership"
                        inputId="ownership3"
                        name="publicFederal"
                        value="publicFederal"
                    />
                    <label for="ownership3"> Public (federal) </label>
                </div>
                <div class="flex items-center gap-2">
                    <Checkbox
                        v-model="ownership"
                        inputId="ownership4"
                        name="publicLocal"
                        value="publicLocal"
                    />
                    <label for="ownership4"> Public (local) </label>
                </div>
                <div class="flex items-center gap-2">
                    <Checkbox
                        v-model="ownership"
                        inputId="ownership5"
                        name="publicProvincial"
                        value="publicProvincial"
                    />
                    <label for="category5"> Public (provincial) </label>
                </div>
            </div>
        </div>
        <MultiValuePlaceholder
            v-slot="slotProps"
            :showDeleteButton="true"
            :displayValues="totalContributingResources"
            label="Contributing Resource(s)"
            :deleteCallback="deleteContributingResourcesCallback"
        >
            <div class="parent value">{{ slotProps.value.name }}</div>
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
                <Dropdown
                    id="functionCategory"
                    ref="functionCategoryField"
                    v-model="functionCategory"
                    optionLabel="name"
                    placeholder="Select Function Category"
                    :options="functionCategoryOptions"
                    aria-describedby="function-category-help"
                    aria-required="true"
                    fluid
                    class="w-full md:w-14rem"
                    @update:model-value="valueUpdated"
                />
                <div class="inline-block">
                    <div class="inline-block">
                        <Checkbox
                            v-model="functionCategoryCurrent"
                            inputId="current"
                            name="functionCategoryCurrent"
                            value="functionCategoryCurrent"
                        />
                        <label for="current">Current</label>
                    </div>
                    <div class="inline-block">
                        <Checkbox
                            v-model="functionCategoryHistoric"
                            inputId="historic"
                            name="functionCategoryCHistoric"
                            value="functionCategoryCHistoric"
                        />
                        <label for="historic">Historic</label>
                    </div>
                </div>
            </div>
            <Button
                id="addOtherName"
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
            :displayValues="functionCategories"
            label="Category/Categories"
            :deleteCallback="deleteFunctionCategoryCallback"
        >
            <div class="parent value">{{ slotProps.value.name }}</div>
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
                <Dropdown
                    id="heritageTheme"
                    ref="heritageThemeField"
                    v-model="heritageTheme"
                    optionLabel="name"
                    placeholder="Select Function Theme"
                    :options="functionThemeOptions"
                    aria-describedby="function-theme-help"
                    aria-required="true"
                    fluid
                    class="w-full md:w-14rem"
                    @update:model-value="valueUpdated"
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
            <div class="parent value">{{ slotProps.value.name }}</div>
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
