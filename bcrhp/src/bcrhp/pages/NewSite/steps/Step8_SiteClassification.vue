<script setup lang="ts">
import { useTemplateRef, inject, ref, onMounted, computed } from 'vue';
import type { Ref } from 'vue';

import FieldSet from 'primevue/fieldset';
import Button from 'primevue/button';
import { Form, type FormInstance } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import ChipsList from '@/bcrhp/pages/NewSite/steps/ChipsList.vue';
import type { AliasedNodeData } from '@/arches_component_lab/types.ts';
import GenericWidget from '@/arches_component_lab/generics/GenericWidget/GenericWidget.vue';
import { EDIT } from '@/arches_component_lab/widgets/constants.ts';
import type { HeritageSiteType } from '@/bcrhp/schemas/heritage_site.ts';
import {
    HeritageThemeTileSchema,
    getHeritageTheme,
    type HeritageThemeTileType,
} from '@/bcrhp/schemas/heritage_site/heritage_theme.ts';
import {
    HeritageFunctionTileSchema,
    getHeritageFunction,
    type HeritageFunctionTileType,
} from '@/bcrhp/schemas/heritage_site/heritage_function.ts';
import {
    HeritageClassTileSchema,
    getHeritageClass,
    type HeritageClassTileType,
} from '@/bcrhp/schemas/heritage_site/heritage_class.ts';
import {
    updateModelValue as baseUpdateModelValue,
    isValid as baseIsValid,
} from '@/bcrhp/utils.ts';

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite')!;

const heritageClassForm: Ref<FormInstance | null> = useTemplateRef(
    'heritageClassForm',
) as Ref<FormInstance | null>;
const heritageClassResolver = zodResolver(
    HeritageClassTileSchema.shape['aliased_data'],
);

const heritageFunctionForm: Ref<FormInstance | null> = useTemplateRef(
    'heritageFunctionForm',
) as Ref<FormInstance | null>;
const heritageFunctionResolver = zodResolver(
    HeritageFunctionTileSchema.shape['aliased_data'],
);

const heritageThemeForm: Ref<FormInstance | null> = useTemplateRef(
    'heritageThemeForm',
) as Ref<FormInstance | null>;
const heritageThemeResolver = zodResolver(
    HeritageThemeTileSchema.shape['aliased_data'],
);

//state
const currentHeritageClass: Ref<HeritageClassTileType> =
    ref(getHeritageClass());
const currentHeritageFunction: Ref<HeritageFunctionTileType> = ref(
    getHeritageFunction(),
);
const currentHeritageTheme: Ref<HeritageThemeTileType> =
    ref(getHeritageTheme());

//keys for resetting
const classKey = ref(0);
const funcKey = ref(0);
const themeKey = ref(0);

//computed lists
const heritageClasses = computed(() => {
    const list = heritageSite?.value.aliased_data.heritage_class;
    return Array.isArray(list) ? list : [];
});
const heritageFunctions = computed(() => {
    const list = heritageSite?.value.aliased_data.heritage_function;
    return Array.isArray(list) ? list : [];
});
const heritageTheme = computed(() => {
    const list = heritageSite?.value.aliased_data.heritage_theme;
    return Array.isArray(list) ? list : [];
});

const isValid = () => true;

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
const isValidHeritageTheme = () =>
    baseIsValid(
        heritageThemeForm as Ref<FormInstance>,
        HeritageThemeTileSchema.shape['aliased_data'],
    );

const addHeritageClassDisabled = computed(
    () => !isValidHeritageClass() || (heritageClasses.value.length || 0) > 4,
);
const addHeritageFunctionDisabled = computed(
    () =>
        !isValidHeritageFunction() || (heritageFunctions.value.length || 0) > 4,
);
const addHeritageThemeDisabled = computed(
    () => !isValidHeritageTheme() || (heritageTheme.value.length || 0) > 4,
);

const getText = (node: any) => {
    if (!node) return '';
    if (node.display_value) return node.display_value;
    if (typeof node.node_value === 'string') return node.node_value;
    if (node.node_value?.en?.value) return node.node_value.en.value;
    return '';
};

const saveHeritageClass = function () {
    //if an object/null force []
    if (!Array.isArray(heritageSite.value.aliased_data.heritage_class)) {
        heritageSite.value.aliased_data.heritage_class = [];
    }

    const data = currentHeritageClass.value.aliased_data;

    //format label
    const cat = getText(data.heritage_category);
    const own = getText(data.ownership);
    const count = getText(data.contributing_resource_count);
    let label = [cat, own].filter(Boolean).join(' ');
    if (count) label += ` (${count})`;

    heritageSite.value?.aliased_data.heritage_class.push({
        ...currentHeritageClass.value,
        customDisplay: label || 'Untitled Class',
    });

    //reset
    currentHeritageClass.value = getHeritageClass();
    classKey.value++;
    heritageClassForm.value?.reset();
};

const saveHeritageFunction = function () {
    if (!Array.isArray(heritageSite.value.aliased_data.heritage_function)) {
        heritageSite.value.aliased_data.heritage_function = [];
    }

    const data = currentHeritageFunction.value.aliased_data;
    const cat = getText(data.functional_category);
    const state = getText(data.functional_state);
    const label = [cat, state].filter(Boolean).join(' - ');

    heritageSite.value?.aliased_data.heritage_function.push({
        ...currentHeritageFunction.value,
        customDisplay: label || 'Untitled Function',
    });

    currentHeritageFunction.value = getHeritageFunction();
    funcKey.value++;
    heritageFunctionForm.value?.reset();
};

const saveHeritageTheme = function () {
    if (!Array.isArray(heritageSite.value.aliased_data.heritage_theme)) {
        heritageSite.value.aliased_data.heritage_theme = [];
    }

    const data = currentHeritageTheme.value.aliased_data;
    const theme = getText(data.heritage_theme);

    heritageSite.value?.aliased_data.heritage_theme.push({
        ...currentHeritageTheme.value,
        customDisplay: theme || 'Untitled Theme',
    });

    currentHeritageTheme.value = getHeritageTheme();
    themeKey.value++;
    heritageThemeForm.value?.reset();
};

const deleteHeritageThemeCallback = (index: number) => {
    if (Array.isArray(heritageSite.value.aliased_data.heritage_theme)) {
        heritageSite.value.aliased_data.heritage_theme.splice(index, 1);
    }
};
const deleteHeritageClassCallback = (index: number) => {
    if (Array.isArray(heritageSite.value.aliased_data.heritage_class)) {
        heritageSite.value.aliased_data.heritage_class.splice(index, 1);
    }
};
const deleteHeritageFunctionCallback = (index: number) => {
    if (Array.isArray(heritageSite.value.aliased_data.heritage_function)) {
        heritageSite.value.aliased_data.heritage_function.splice(index, 1);
    }
};

//updates
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
};
const updateHeritageThemeModelValue = (
    newValue: AliasedNodeData,
    attribute_name: string,
) => {
    baseUpdateModelValue(
        newValue,
        attribute_name,
        currentHeritageTheme.value.aliased_data,
        heritageThemeForm as Ref<FormInstance>,
    );
};

defineExpose({ isValid });
onMounted(() => {});
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
            legend="Heritage Class"
            :key="classKey"
        >
            <LabelledInput
                label="Number of Contributing Resources"
                input-name="contributingResources"
                :error-message="$form.contributingResources?.error?.message"
                :required="true"
            >
                <div>
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

            <div>
                <GenericWidget
                    :mode="EDIT"
                    :should-show-label="true"
                    :aliasedNodeData="
                        currentHeritageClass.aliased_data.heritage_category
                    "
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
                <br />
                <GenericWidget
                    :mode="EDIT"
                    :should-show-label="true"
                    :aliasedNodeData="
                        currentHeritageClass.aliased_data.ownership
                    "
                    graph-slug="heritage_site"
                    node-alias="ownership"
                    group-direction="column"
                    @update:value="
                        updateHeritageClassModelValue($event, 'ownership')
                    "
                />
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
            class="mt-2"
            legend="Heritage Function"
            :key="funcKey"
        >
            <LabelledInput
                label="Function Category"
                input-name="functionCategory"
                :error-message="$form.functionCategory?.error?.message"
                :required="true"
            >
                <div class="p-inputtext-fluid flex flex-row gap-2 items-start">
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
                        group-direction="column"
                        @update:value="
                            updateFunctionCategoryModelValue(
                                $event,
                                'functional_category',
                            )
                        "
                    />
                    <br />
                    <div class="inline-block flex-grow">
                        <GenericWidget
                            :mode="EDIT"
                            :should-show-label="false"
                            :aliasedNodeData="
                                currentHeritageFunction.aliased_data
                                    .functional_state
                            "
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
            class="mt-2"
            legend="Heritage Theme"
            :key="themeKey"
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
                        :aliasedNodeData="
                            currentHeritageTheme.aliased_data.heritage_theme
                        "
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
            </LabelledInput>
        </FieldSet>
        <div class="row">
            <Button
                id="addHeritageTheme"
                label="+ Add Theme"
                class="button-padding"
                :disabled="addHeritageThemeDisabled"
                @click="saveHeritageTheme"
            />
            <ChipsList
                label="Themes"
                :items="heritageTheme"
                display-key="customDisplay"
                @remove="deleteHeritageThemeCallback"
            />
        </div>
    </Form>
    <br /><br /><br />
</template>

<style></style>
