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
import { requiredSiteClassificationSchema } from '@/bcrhp/schema/SiteClassificationSchema.ts';
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
const heritageClasses = ref([] as Array<string>);
const functionCategory = ref({ name: '', code: '' });
const heritageFunctions = ref([] as Array<string>);
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
const functionCategoryType = ref();

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

const updateAddHeritageClassCategory = function () {
    addContributingResourcesDisabled.value =
        contributingResources.value.code < 0 ||
        heritageSiteRef.value.siteClassification.heritageClasses.length > 4;
};

const updateAddOtherFunctionCategory = function () {
    addOtherFunctionCategoryDisabled.value =
        functionCategory.value.name !== '' ||
        heritageSiteRef.value.siteClassification.heritageFunctions.length > 4;
};

const updateAddOtherHeritageSite = function () {
    addOtherHeritageSiteDisabled.value =
        heritageSiteRef.value.siteClassification.heritageThemes.length > 4;
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

let validateFields = false;

// This needs to be removed - added because ESLint was complaining. Need to figure out
// configuration so API methods are not
defineExpose({ isValid });

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
                    id="saveHeritageClasss"
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
                    <Checkbox
                        v-model="heritageCategory"
                        inputId="archeological_site"
                        value="Archeological Site"
                    />
                    <label for="archeological_site">
                        Archaeological Site / Remains
                    </label>
                </div>
                <div class="flex items-center gap-2">
                    <Checkbox
                        v-model="heritageCategory"
                        inputId="building"
                        value="Building"
                    />
                    <label for="building"> Building </label>
                </div>
                <div class="flex items-center gap-2">
                    <Checkbox
                        v-model="heritageCategory"
                        inputId="collection"
                        value="Collection"
                    />
                    <label for="collection"> Collection </label>
                </div>
                <div class="flex items-center gap-2">
                    <Checkbox
                        v-model="heritageCategory"
                        inputId="landscape_features"
                        value="Landscape Features"
                    />
                    <label for="landscape_features">
                        Landscape(s) or Landscape Feature(s)
                    </label>
                </div>
                <div class="flex items-center gap-2">
                    <Checkbox
                        v-model="heritageCategory"
                        inputId="structure"
                        value="Structure"
                    />
                    <label for="structure"> Structure </label>
                </div>
            </div>
            <p class="mb-1">Ownership</p>
            <div class="card flex flex-wrap gap-4">
                <div class="flex items-center gap-2">
                    <Checkbox
                        v-model="ownership"
                        inputId="not_for_profit"
                        value="Not-for-profit"
                    />
                    <label for="not_for_profit"> Not-for-profit </label>
                </div>
                <div class="flex items-center gap-2">
                    <Checkbox
                        v-model="ownership"
                        inputId="private"
                        value="Private"
                    />
                    <label for="private"> Private </label>
                </div>
                <div class="flex items-center gap-2">
                    <Checkbox
                        v-model="ownership"
                        inputId="public_federal"
                        value="Public (federal)"
                    />
                    <label for="public_federal"> Public (federal) </label>
                </div>
                <div class="flex items-center gap-2">
                    <Checkbox
                        v-model="ownership"
                        inputId="public_local"
                        value="Public (local)"
                    />
                    <label for="public_local"> Public (local) </label>
                </div>
                <div class="flex items-center gap-2">
                    <Checkbox
                        v-model="ownership"
                        inputId="ownership5"
                        value="Public (provincial)"
                    />
                    <label for="public_provincial"> Public (provincial) </label>
                </div>
            </div>
        </div>
        <MultiValuePlaceholder
            v-slot="slotProps"
            :showDeleteButton="true"
            :displayValues="heritageClasses"
            label="Contributing Resource(s)"
            :deleteCallback="deleteContributingResourcesCallback"
        >
            <div
                v-for="slot in slotProps"
                :key="slot"
                class="parent value"
            >
                {{ slot.heritageCategory }} {{ slot.ownership }}
                {{ slot.contributingResources?.name }}
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
                            v-model="functionCategoryType"
                            inputId="current"
                            value="Current"
                        />
                        <label for="current">Current</label>
                    </div>
                    <div class="inline-block">
                        <Checkbox
                            v-model="functionCategoryType"
                            inputId="historic"
                            value="Historic"
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
