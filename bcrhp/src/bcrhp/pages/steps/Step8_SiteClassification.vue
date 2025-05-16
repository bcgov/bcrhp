<script setup lang="ts">
import { useTemplateRef, inject, ref, onMounted, computed } from 'vue';
import type { Ref } from 'vue';

import FieldSet from 'primevue/fieldset';
import Button from 'primevue/button';
import { Form, FormField, type FormInstance } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import MultiValuePlaceholder from '@/bcgov_arches_common/components/multiValuePlaceholder/MultiValuePlaceholder.vue';
import ConceptSelect from '@/bcgov_arches_common/components/ConceptSelect/ConceptSelect.vue';
import ConceptRadioButtons from '@/bcgov_arches_common/components/ConceptSelect/ConceptRadioButtons.vue';
import type { HeritageSite } from '@/bcrhp/schema/HeritageSiteSchema.ts';
import {
    HeritageClassSchema,
    HeritageFunctionSchema,
    HeritageThemeSchema,
    HeritageClass,
    HeritageFunction,
    HeritageTheme,
    getHeritageClassSchema,
    getHeritageFunctionSchema,
    getHeritageThemeSchema,
} from '@/bcrhp/schema/SiteClassificationSchema.ts';

const heritageSite: typeof HeritageSite = inject(
    'heritageSite',
) as typeof HeritageSite;
const heritageSiteRef: Ref<typeof HeritageSite> = ref(heritageSite);

const siteClassificationForm: Ref<FormInstance | null> = useTemplateRef(
    'siteClassificationForm',
) as Ref<FormInstance | null>;
const currentHeritageClass: typeof HeritageClass = ref(
    getHeritageClassSchema(),
);
const currentHeritageFunction: typeof HeritageFunction = ref(
    getHeritageFunctionSchema(),
);
const currentHeritageTheme: typeof HeritageTheme = ref(
    getHeritageThemeSchema(),
);
const heritageClasses = ref([] as Array<string>);
const heritageFunctions = ref([] as Array<string>);
const heritageThemes = ref([] as Array<string>);

const zodContributingResourcesResolver = zodResolver(
    HeritageClassSchema.shape.contributingResources,
);
const zodHeritageCategoryResolver = zodResolver(
    HeritageClassSchema.shape.heritageCategory,
);
const zodOwnershipResolver = zodResolver(HeritageClassSchema.shape.ownership);
const zodFunctionCategoryResolver = zodResolver(
    HeritageFunctionSchema.shape.functionCategory,
);
const zodFunctionCategoryTypeResolver = zodResolver(
    HeritageFunctionSchema.shape.functionCategoryType,
);
const zodHeritageThemeResolver = zodResolver(
    HeritageThemeSchema.shape.heritageTheme,
);

const isValid = () => {
    return siteClassificationForm.value.valid;
};

const addOtherHeritageClassDisabled = computed(
    () =>
        siteClassificationForm.value?.states?.contributingResources?.pristine ||
        siteClassificationForm.value?.states?.heritageCategory?.pristine ||
        siteClassificationForm.value?.states?.ownership?.pristine ||
        siteClassificationForm.value?.states?.contributingResources?.invalid ||
        siteClassificationForm.value?.states?.heritageCategory?.invalid ||
        siteClassificationForm.value?.states?.ownership?.invalid ||
        heritageSiteRef.value.siteClassification?.heritageClasses?.length > 4,
);
const addOtherHeritageFunctionDisabled = computed(
    () =>
        siteClassificationForm.value?.states?.functionCategory?.pristine ||
        siteClassificationForm.value?.states?.functionCategoryType?.pristine ||
        siteClassificationForm.value?.states?.heritageCategory?.invalid ||
        siteClassificationForm.value?.states?.functionCategoryType?.invalid ||
        heritageSiteRef.value.siteClassification?.heritageFunctions?.length > 4,
);
const addOtherHeritageThemeDisabled = computed(
    () =>
        siteClassificationForm.value?.states?.heritageTheme?.pristine ||
        siteClassificationForm.value?.states?.heritageTheme?.invalid ||
        heritageSiteRef.value.siteClassification?.heritageThemes?.length > 4,
);

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
};

const saveHeritageFunction = function () {
    console.log('saveHeritageFunction');
    heritageSiteRef.value.siteClassification.heritageFunctions.push({
        functionCategory: currentHeritageFunction.value.functionCategory,
        functionCategoryType:
            currentHeritageFunction.value.functionCategoryType,
    });

    currentHeritageFunction.value.functionCategory = '';
    currentHeritageFunction.value.functionCategoryType = '';
};

const saveHeritageTheme = function () {
    console.log('saveHeritageTheme');
    heritageSiteRef.value.siteClassification.heritageThemes.push(
        currentHeritageTheme.value.heritageTheme,
    );

    currentHeritageTheme.value.heritageTheme = '';
};

const deleteHeritageClassCallback = function (index: number) {
    heritageSiteRef.value.siteClassification.heritageClasses.splice(index, 1);
};

const deleteHeritageFunctionCallback = function (index: number) {
    heritageSiteRef.value.siteClassification.heritageFunctions.splice(index, 1);
};

const deleteHeritageThemeCallback = function (index: number) {
    heritageSiteRef.value.siteClassification.heritageThemes.splice(index, 1);
};

// This needs to be removed - added because ESLint was complaining. Need to figure out
// configuration so API methods are not
defineExpose({ isValid });

onMounted(() => {
    heritageSiteRef.value.siteClassification.heritageClasses = heritageClasses;
    heritageSiteRef.value.siteClassification.heritageFunctions =
        heritageFunctions;
    heritageSiteRef.value.siteClassification.heritageThemes = heritageThemes;
});
</script>
<template>
    <Form
        ref="siteClassificationForm"
        v-slot="$form"
        name="siteClassificationForm"
        :validateOnBlur="true"
    >
        <FieldSet
            id="heritageDetailsFieldset"
            legend="Heritage Class"
        >
            <FormField
                :resolver="zodContributingResourcesResolver"
                name="contributingResources"
            >
                <LabelledInput
                    label="Number of Contributing Resources"
                    input-name="contributingResources"
                    :error-message="$form.contributingResources?.error?.message"
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
                            :disabled="addOtherHeritageClassDisabled"
                            :aria-disabled="addOtherHeritageClassDisabled"
                            label="Add"
                            class="inline-block"
                            @click="saveHeritageClass"
                        ></Button>
                    </div>
                </LabelledInput>
            </FormField>
            <div class="flex flex-col">
                <p class="mb-1">Heritage Category</p>
                <div class="flex flex-col">
                    <FormField
                        :resolver="zodHeritageCategoryResolver"
                        name="heritageCategory"
                    >
                        <ConceptRadioButtons
                            id="heritageCategory"
                            ref="heritageCategoryField"
                            v-model="currentHeritageClass.heritageCategory"
                            graph-slug="heritage_site"
                            node-alias="heritage_category"
                            group-direction="column"
                        />
                    </FormField>
                </div>
                <p class="mb-1">Ownership</p>
                <div class="flex flex-col">
                    <FormField
                        :resolver="zodOwnershipResolver"
                        name="ownership"
                    >
                        <ConceptRadioButtons
                            id="ownership"
                            ref="ownershipField"
                            v-model="currentHeritageClass.ownership"
                            graph-slug="heritage_site"
                            node-alias="ownership"
                            group-direction="column"
                        />
                    </FormField>
                </div>
            </div>
            <MultiValuePlaceholder
                v-slot="slotProps"
                :showDeleteButton="true"
                :displayValues="heritageClasses"
                label="Heritage Class/Classes"
                :deleteCallback="deleteHeritageClassCallback"
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
                :error-message="$form.functionCategory?.error?.message"
                :required="true"
            >
                <div class="p-inputtext-fluid flex flex-row">
                    <FormField
                        :resolver="zodFunctionCategoryResolver"
                        name="functionCategory"
                    >
                        <ConceptSelect
                            id="functionCategory"
                            ref="functionCategoryField"
                            v-model="currentHeritageFunction.functionCategory"
                            graph-slug="heritage_site"
                            node-alias="functional_category"
                        />
                    </FormField>
                    <div class="inline-block">
                        <FormField
                            :resolver="zodFunctionCategoryTypeResolver"
                            name="functionCategoryType"
                        >
                            <ConceptRadioButtons
                                id="functionCategoryType"
                                ref="functionCategoryTypeRef"
                                v-model="
                                    currentHeritageFunction.functionCategoryType
                                "
                                graph-slug="heritage_site"
                                node-alias="functional_state"
                                group-direction="column"
                            />
                        </FormField>
                    </div>
                </div>
                <Button
                    id="saveFunctionCategory"
                    label="Add"
                    class="inline-block"
                    :disabled="addOtherHeritageFunctionDisabled"
                    :aria-disabled="addOtherHeritageFunctionDisabled"
                    @click="saveHeritageFunction"
                ></Button>
            </LabelledInput>
            <MultiValuePlaceholder
                v-slot="slotProps"
                :showDeleteButton="true"
                :displayValues="heritageFunctions"
                label="Category/Categories"
                :deleteCallback="deleteHeritageFunctionCallback"
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
                :error-message="$form.heritageTheme?.error?.message"
                :required="true"
            >
                <div class="p-inputtext-fluid">
                    <FormField
                        :resolver="zodHeritageThemeResolver"
                        name="heritageTheme"
                    >
                        <ConceptSelect
                            id="heritageTheme"
                            ref="heritageThemeField"
                            v-model="currentHeritageTheme.heritageTheme"
                            graph-slug="heritage_site"
                            node-alias="heritage_theme"
                        />
                    </FormField>
                </div>
                <Button
                    id="addHeritageTheme"
                    label="Add"
                    class="inline-block"
                    :disabled="addOtherHeritageThemeDisabled"
                    :aria_disabled="addOtherHeritageThemeDisabled"
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
</style>
