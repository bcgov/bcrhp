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
import Button from 'primevue/button';
import { Form, FormField, type FormInstance } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import MultiValuePlaceholder from '@/bcgov_arches_common/components/multiValuePlaceholder/MultiValuePlaceholder.vue';
import { camelCase } from 'lodash';
import GenericWidget from '@/arches_component_lab/generics/GenericWidget/GenericWidget.vue';
import { EDIT } from '@/arches_component_lab/widgets/constants.ts';
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

const heritageClassForm: Ref<FormInstance | null> = useTemplateRef(
    'heritageClassForm',
) as Ref<FormInstance | null>;
const heritageFunctionForm: Ref<FormInstance | null> = useTemplateRef(
    'heritageFunctionForm',
) as Ref<FormInstance | null>;
const heritageThemeForm: Ref<FormInstance | null> = useTemplateRef(
    'heritageThemeForm',
) as Ref<FormInstance | null>;
const currentHeritageClass: typeof HeritageClass = reactive(
    getHeritageClassSchema(),
);
const currentHeritageFunction: typeof HeritageFunction = reactive(
    getHeritageFunctionSchema(),
);
const currentHeritageTheme: typeof HeritageTheme = reactive(
    getHeritageThemeSchema(),
);
const heritageClasses = ref([] as Array<string>);
const heritageFunctions = ref([] as Array<string>);
const heritageThemes = ref([] as Array<string>);

const zodContributingResourcesResolver = zodResolver(
    HeritageClassSchema.shape.contributingResources,
);
const isValidHeritageClass = () => {
    return heritageClassForm.value?.valid;
};
const isValidHeritageFunction = () => {
    return heritageFunctionForm.value?.valid;
};
const isValidHeritageTheme = () => {
    return heritageThemeForm.value?.valid;
};

const addOtherHeritageClassDisabled = computed(
    () =>
        heritageClassForm.value?.states?.contributingResources?.pristine ||
        heritageClassForm.value?.states?.heritage_category?.pristine ||
        heritageClassForm.value?.states?.ownership?.pristine ||
        heritageClassForm.value?.states?.contributingResources?.invalid ||
        heritageClassForm.value?.states?.heritage_category?.invalid ||
        heritageClassForm.value?.states?.ownership?.invalid ||
        heritageSiteRef.value.siteClassification?.heritageClasses?.length > 4,
);
const addOtherHeritageFunctionDisabled = computed(
    () =>
        !heritageFunctionForm.value?.states?.functional_category?.value ||
        !heritageFunctionForm.value?.states?.function_category_type?.value ||
        heritageFunctionForm.value?.states?.functional_category?.invalid ||
        heritageFunctionForm.value?.states?.function_category_type?.invalid ||
        heritageSiteRef.value.siteClassification?.heritageFunctions?.length > 4,
);
const addOtherHeritageThemeDisabled = computed(
    () =>
        !heritageThemeForm.value?.states?.heritage_theme?.value ||
        heritageThemeForm.value?.states?.heritage_theme?.invalid ||
        heritageSiteRef.value.siteClassification?.heritageThemes?.length > 4,
);

const saveHeritageClass = function () {
    console.log('saveHeritageClass');
    heritageSiteRef.value.siteClassification.heritageClasses.push({
        contributingResources:
            currentHeritageClass.value?.contributingResources,
        heritageCategory:
            heritageClassForm.value?.states?.heritage_category?.value,
        ownership: heritageClassForm.value?.states?.ownership?.value,
    });

    heritageClassForm.value?.reset();
};

const saveHeritageFunction = function () {
    console.log('saveHeritageFunction');
    heritageSiteRef.value.siteClassification.heritageFunctions.push({
        functionCategory: Object.keys(
            heritageFunctionForm.value?.states?.functional_category?.value,
        )[0],
        functionCategoryType:
            heritageFunctionForm.value?.states?.function_category_type?.value,
    });

    heritageFunctionForm.value?.reset();
};

const saveHeritageTheme = function () {
    console.log('saveHeritageTheme');
    heritageSiteRef.value.siteClassification.heritageThemes.push(
        heritageThemeForm.value?.states?.heritage_theme?.value,
    );

    heritageThemeForm.value?.reset();
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

const updateHeritageClassModelValue = function (
    newValue: object,
    attribute_name: string,
) {
    console.log('updateHeritageClassModelValue', attribute_name, newValue);

    const validator = HeritageClassSchema.shape[camelCase(attribute_name)];
    const result = validator.safeParse(newValue);

    if (result.success) {
        currentHeritageClass[attribute_name] = result.data;
    }
};

const updateFunctionCategoryModelValue = function (
    newValue: object,
    attribute_name: string,
) {
    console.log('updateFunctionCategoryModelValue', attribute_name, newValue);

    const validator = HeritageFunctionSchema.shape[camelCase(attribute_name)];
    const result = validator.safeParse(newValue);

    if (result.success) {
        currentHeritageFunction[attribute_name] = result.data;
    }
};

const updateHeritageThemeModelValue = function (
    newValue: object,
    attribute_name: string,
) {
    console.log('updateHeritageThemeModelValue', attribute_name, newValue);

    const validator = HeritageThemeSchema.shape[camelCase(attribute_name)];
    const result = validator.safeParse(newValue);

    if (result.success) {
        currentHeritageTheme[attribute_name] = result.data;
    }
};

defineExpose({
    isValidHeritageClass,
    isValidHeritageFunction,
    isValidHeritageTheme,
});

onMounted(() => {
    heritageSiteRef.value.siteClassification.heritageClasses = heritageClasses;
    heritageSiteRef.value.siteClassification.heritageFunctions =
        heritageFunctions;
    heritageSiteRef.value.siteClassification.heritageThemes = heritageThemes;
});
</script>
<template>
    <Form
        ref="heritageClassForm"
        v-slot="$form"
        name="heritageClassForm"
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
                            placeholder="1"
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
                <GenericWidget
                    :mode="EDIT"
                    :should-show-label="true"
                    :aliasedNodeData="null"
                    graph-slug="heritage_site"
                    node-alias="heritage_category"
                    group-direction="column"
                    @update:value="
                        updateHeritageClassModelValue(
                            $event,
                            'heritage_category',
                        )
                    "
                />
                <GenericWidget
                    :mode="EDIT"
                    :should-show-label="true"
                    :aliasedNodeData="null"
                    graph-slug="heritage_site"
                    node-alias="ownership"
                    group-direction="column"
                    @update:value="
                        updateHeritageClassModelValue($event, 'ownership')
                    "
                />
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
    </Form>
    <Form
        ref="heritageFunctionForm"
        v-slot="$form"
        name="heritageFunctionForm"
        :validateOnBlur="true"
    >
        <Fieldset
            id="heritageFunctionFieldset"
            class="p-fieldset p-component mt-2"
            legend="Heritage Function"
        >
            <LabelledInput
                label="Function Category"
                input-name="functionCategory"
                :error-message="$form.functionCategory?.error?.message"
                :required="true"
            >
                <div class="p-inputtext-fluid flex flex-row">
                    <GenericWidget
                        :mode="EDIT"
                        :should-show-label="false"
                        :aliasedNodeData="null"
                        graph-slug="heritage_site"
                        node-alias="functional_category"
                        placeholder="Select a Function Category"
                        group-direction="column"
                        @update:value="
                            updateFunctionCategoryModelValue(
                                $event,
                                'functional_category',
                            )
                        "
                    />
                    <div class="inline-block">
                        <GenericWidget
                            :mode="EDIT"
                            :should-show-label="false"
                            :value="null"
                            graph-slug="heritage_site"
                            node-alias="functional_state"
                            group-direction="column"
                            @update:value="
                                updateFunctionCategoryModelValue(
                                    $event,
                                    'functional_state',
                                )
                            "
                        />
                    </div>
                </div>
            </LabelledInput>
            <Button
                id="saveFunctionCategory"
                label="Add"
                class="inline-block"
                :disabled="addOtherHeritageFunctionDisabled"
                :aria-disabled="addOtherHeritageFunctionDisabled"
                @click="saveHeritageFunction"
            ></Button>
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
    </Form>
    <Form
        ref="heritageThemeForm"
        v-slot="$form"
        name="heritageThemeForm"
        :validateOnBlur="true"
    >
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
                    <GenericWidget
                        :mode="EDIT"
                        :should-show-label="false"
                        :aliasedNodeData="null"
                        graph-slug="heritage_site"
                        node-alias="heritage_theme"
                        placeholder="Select a Heritage Theme"
                        group-direction="column"
                        @update:value="
                            updateHeritageThemeModelValue(
                                $event,
                                'heritage_theme',
                            )
                        "
                    />
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
                <div class="parent value">{{ slotProps }}</div>
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
