<script setup lang="ts">
import { useTemplateRef, inject, ref, computed } from 'vue';
import type { Ref } from 'vue';

import FieldSet from 'primevue/fieldset';
import Button from 'primevue/button';
import { Form, type FormInstance } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { getFlattenResolver } from '@/bcgov_arches_common/validation-utils.ts';
import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import ChipsList from '@/bcrhp/pages/NewSite/steps/ChipsList.vue';
import type { AliasedNodeData } from '@/arches_component_lab/types.ts';
import GenericWidget from '@/arches_component_lab/generics/GenericWidget/GenericWidget.vue';
import { EDIT } from '@/arches_component_lab/widgets/constants.ts';
import type { HeritageSiteType } from '@/bcrhp/schemas/heritage_site.ts';
import { HeritageThemeTileSchema } from '@/bcrhp/schemas/heritage_site/heritage_theme.ts';
import {
    HeritageFunctionTileSchema,
    getHeritageFunction,
} from '@/bcrhp/schemas/heritage_site/heritage_function.ts';
import {
    HeritageClassTileSchema,
    getHeritageClass,
} from '@/bcrhp/schemas/heritage_site/heritage_class.ts';
import {
    updateModelValue as baseUpdateModelValue,
    isValid as baseIsValid,
} from '@/bcrhp/utils.ts';

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite')!;
const emit = defineEmits(['update:stepIsValid']);

const heritageClassForm = useTemplateRef(
    'heritageClassForm',
) as Ref<FormInstance | null>;
const heritageFunctionForm = useTemplateRef(
    'heritageFunctionForm',
) as Ref<FormInstance | null>;
const heritageThemeForm = useTemplateRef(
    'heritageThemeForm',
) as Ref<FormInstance | null>;

const heritageClassResolver = getFlattenResolver(
    zodResolver(HeritageClassTileSchema.shape['aliased_data']),
);
const heritageFunctionResolver = getFlattenResolver(
    zodResolver(HeritageFunctionTileSchema.shape['aliased_data']),
);
const heritageThemeResolver = getFlattenResolver(
    zodResolver(HeritageThemeTileSchema.shape['aliased_data']),
);

const conceptSelectOverride = {
    widget: {
        widgetid: '',
        component:
            'arches_component_lab/widgets/ConceptMultiselectWidget/ConceptMultiselectWidget.vue',
    },
};

const conceptSingleSelectOverride = {
    widget: {
        widgetid: '',
        component:
            'arches_component_lab/widgets/ConceptSelectWidget/ConceptSelectWidget.vue',
    },
};

const currentHeritageClass = ref(getHeritageClass());
const currentHeritageFunction = ref(getHeritageFunction());

const classKey = ref(0);
const funcKey = ref(0);
const themeKey = ref(0);

const heritageClasses = computed(() =>
    Array.isArray(heritageSite.value.aliased_data.heritage_class)
        ? heritageSite.value.aliased_data.heritage_class
        : [],
);
const heritageFunctions = computed(() =>
    Array.isArray(heritageSite.value.aliased_data.heritage_function)
        ? heritageSite.value.aliased_data.heritage_function
        : [],
);

const isValidHeritageClass = () =>
    baseIsValid(
        heritageClassForm as Ref<FormInstance>,
        HeritageClassTileSchema.shape['aliased_data'],
    );
const isValidHeritageFunction = () =>
    baseIsValid(
        heritageFunctionForm as Ref<FormInstance>,
        HeritageFunctionTileSchema.shape['aliased_data'],
    );

const isValid = () => {
    // 1. Must have at least one Heritage Class saved in the list
    const classValid = heritageClasses.value.length > 0;

    // 2. Must have at least one Heritage Function saved in the list
    const functionValid = heritageFunctions.value.length > 0;

    // 3. Heritage Theme must have a value selected
    const themeData =
        heritageSite.value?.aliased_data?.heritage_theme?.aliased_data
            ?.heritage_theme;
    const themeValid = !!(themeData?.display_value || themeData?.node_value);

    return true; //classValid && functionValid && themeValid;
};

const addHeritageClassDisabled = computed(() => {
    const data = currentHeritageClass.value.aliased_data;
    const hasResourceCount = !!(
        data.contributing_resource_count?.display_value ||
        data.contributing_resource_count?.node_value
    );

    return (
        !hasResourceCount ||
        !isValidHeritageClass() ||
        heritageClasses.value.length >= 5
    );
});

const addHeritageFunctionDisabled = computed(
    () => !isValidHeritageFunction() || heritageFunctions.value.length >= 5,
);

const getText = (node: any) => {
    if (!node) return '';
    return (
        node.display_value ||
        node.node_value?.en?.value ||
        (typeof node.node_value === 'string' ? node.node_value : '')
    );
};

const saveHeritageClass = function () {
    const data = currentHeritageClass.value.aliased_data;
    const label = `${getText(data.heritage_category)} ${getText(data.ownership)} (${getText(data.contributing_resource_count)})`;
    heritageSite.value.aliased_data.heritage_class.push({
        ...currentHeritageClass.value,
        customDisplay: label,
    });
    currentHeritageClass.value = getHeritageClass();
    classKey.value++;
    heritageClassForm.value?.reset();
    emit('update:stepIsValid', isValid());
};

const saveHeritageFunction = function () {
    const data = currentHeritageFunction.value.aliased_data;
    const label = `${getText(data.functional_category)} - ${getText(data.functional_state)}`;
    heritageSite.value.aliased_data.heritage_function.push({
        ...currentHeritageFunction.value,
        customDisplay: label,
    });
    currentHeritageFunction.value = getHeritageFunction();
    funcKey.value++;
    heritageFunctionForm.value?.reset();
    emit('update:stepIsValid', isValid());
};

const deleteHeritageClassCallback = (index: number) => {
    heritageSite.value.aliased_data.heritage_class.splice(index, 1);
    emit('update:stepIsValid', isValid());
};

const deleteHeritageFunctionCallback = (index: number) => {
    heritageSite.value.aliased_data.heritage_function.splice(index, 1);
    emit('update:stepIsValid', isValid());
};

const updateHeritageClassModelValue = (
    newValue: AliasedNodeData,
    attribute_name: string,
) => {
    baseUpdateModelValue(
        newValue,
        attribute_name,
        currentHeritageClass.value.aliased_data,
        heritageClassForm as Ref<FormInstance>,
    );
    emit('update:stepIsValid', isValid());
};

const updateFunctionCategoryModelValue = (
    newValue: AliasedNodeData,
    attribute_name: string,
) => {
    baseUpdateModelValue(
        newValue,
        attribute_name,
        currentHeritageFunction.value.aliased_data,
        heritageFunctionForm as Ref<FormInstance>,
    );
    setTimeout(() => emit('update:stepIsValid', isValid()), 0);
};

const updateHeritageThemeModelValue = (
    newValue: AliasedNodeData,
    attribute_name: string,
) => {
    baseUpdateModelValue(
        newValue,
        attribute_name,
        heritageSite.value.aliased_data.heritage_theme.aliased_data,
        heritageThemeForm as Ref<FormInstance>,
    );
    setTimeout(() => emit('update:stepIsValid', isValid()), 0);
};

defineExpose({ isValid });
</script>

<template>
    <Form
        ref="heritageClassForm"
        v-slot="$form"
        name="heritageClassForm"
        :validateOnBlur="true"
        :resolver="heritageClassResolver"
    >
        <FieldSet
            id="heritageDetailsFieldset"
            :key="classKey"
            legend="Heritage Class"
        >
            <LabelledInput
                label="Number of Contributing Resources"
                input-name="contributing_resource_count"
                :error-message="
                    $form.contributing_resource_count?.error?.message
                "
                :required="true"
            >
                <div class="p-inputtext-fluid">
                    <GenericWidget
                        :mode="EDIT"
                        :should-show-label="false"
                        :aliasedNodeData="
                            currentHeritageClass.aliased_data
                                .contributing_resource_count
                        "
                        graph-slug="heritage_site"
                        node-alias="contributing_resource_count"
                        @update:value="
                            updateHeritageClassModelValue(
                                $event,
                                'contributing_resource_count',
                            )
                        "
                    />
                </div>
            </LabelledInput>
            <div class="row">
                <LabelledInput
                    label="Heritage Category"
                    input-name="heritage_category"
                    class="grow"
                    :error-message="$form.heritage_category?.error?.message"
                    :required="true"
                >
                    <div class="p-inputtext-fluid">
                        <GenericWidget
                            :mode="EDIT"
                            :should-show-label="false"
                            :aliasedNodeData="
                                currentHeritageClass.aliased_data
                                    .heritage_category
                            "
                            :card-x-node-x-widget-data-overrides="
                                conceptSingleSelectOverride
                            "
                            graph-slug="heritage_site"
                            node-alias="heritage_category"
                            @update:value="
                                updateHeritageClassModelValue(
                                    $event,
                                    'heritage_category',
                                )
                            "
                        />
                    </div>
                </LabelledInput>

                <br />

                <LabelledInput
                    label="Ownership"
                    input-name="ownership"
                    class="grow"
                    :error-message="$form.ownership?.error?.message"
                    :required="true"
                >
                    <div class="p-inputtext-fluid">
                        <GenericWidget
                            :mode="EDIT"
                            :should-show-label="false"
                            :aliasedNodeData="
                                currentHeritageClass.aliased_data.ownership
                            "
                            :card-x-node-x-widget-data-overrides="
                                conceptSingleSelectOverride
                            "
                            graph-slug="heritage_site"
                            node-alias="ownership"
                            @update:value="
                                updateHeritageClassModelValue(
                                    $event,
                                    'ownership',
                                )
                            "
                        />
                    </div>
                </LabelledInput>
            </div>
        </FieldSet>

        <div class="row">
            <Button
                id="saveHeritageClass"
                :disabled="addHeritageClassDisabled"
                label="+ Add Heritage Class"
                class="button-padding"
                @click="saveHeritageClass"
            />
            <ChipsList
                label="Heritage Classes"
                :items="heritageClasses"
                display-key="customDisplay"
                @remove="deleteHeritageClassCallback"
            />
        </div>
    </Form>

    <br /><br />

    <Form
        ref="heritageFunctionForm"
        v-slot="$form"
        name="heritageFunctionForm"
        :validateOnBlur="true"
        :resolver="heritageFunctionResolver"
    >
        <FieldSet
            id="heritageFunctionFieldset"
            :key="funcKey"
            legend="Heritage Function"
        >
            <LabelledInput
                label="Function Category"
                input-name="functional_category"
                :error-message="$form.functional_category?.error?.message"
                :required="true"
            >
                <div class="p-inputtext-fluid">
                    <GenericWidget
                        :mode="EDIT"
                        :should-show-label="false"
                        :aliasedNodeData="
                            currentHeritageFunction.aliased_data
                                .functional_category
                        "
                        graph-slug="heritage_site"
                        node-alias="functional_category"
                        placeholder="Select a Function Category"
                        @update:value="
                            updateFunctionCategoryModelValue(
                                $event,
                                'functional_category',
                            )
                        "
                    />
                </div>
            </LabelledInput>

            <br />

            <LabelledInput
                label="Functional State"
                input-name="functional_state"
                :error-message="$form.functional_state?.error?.message"
                :required="true"
            >
                <div class="p-inputtext-fluid">
                    <GenericWidget
                        :mode="EDIT"
                        :should-show-label="false"
                        :aliasedNodeData="
                            currentHeritageFunction.aliased_data
                                .functional_state
                        "
                        :card-x-node-x-widget-data-overrides="
                            conceptSelectOverride
                        "
                        graph-slug="heritage_site"
                        node-alias="functional_state"
                        @update:value="
                            updateFunctionCategoryModelValue(
                                $event,
                                'functional_state',
                            )
                        "
                    />
                </div>
            </LabelledInput>
        </FieldSet>

        <div class="row">
            <Button
                id="saveFunctionCategory"
                label="+ Add Function"
                class="button-padding"
                :disabled="addHeritageFunctionDisabled"
                @click="saveHeritageFunction"
            />
            <ChipsList
                label="Functions"
                :items="heritageFunctions"
                display-key="customDisplay"
                @remove="deleteHeritageFunctionCallback"
            />
        </div>
    </Form>

    <br /><br />

    <Form
        ref="heritageThemeForm"
        v-slot="$form"
        name="heritageThemeForm"
        :validateOnBlur="true"
        :resolver="heritageThemeResolver"
    >
        <FieldSet
            id="heritageThemeFieldset"
            :key="themeKey"
            legend="Heritage Theme"
        >
            <LabelledInput
                label="Heritage Theme"
                input-name="heritage_theme"
                :error-message="$form.heritage_theme?.error?.message"
                :required="true"
            >
                <div class="p-inputtext-fluid">
                    <GenericWidget
                        :mode="EDIT"
                        :should-show-label="false"
                        :aliasedNodeData="
                            heritageSite?.aliased_data?.heritage_theme
                                ?.aliased_data.heritage_theme
                        "
                        graph-slug="heritage_site"
                        node-alias="heritage_theme"
                        placeholder="Select a Heritage Theme"
                        @update:value="
                            updateHeritageThemeModelValue(
                                $event,
                                'heritage_theme',
                            )
                        "
                    />
                </div>
            </LabelledInput>
        </FieldSet>
    </Form>
</template>

<style>
.grow {
    flex: 1;
    margin: 1rem;
}
</style>
