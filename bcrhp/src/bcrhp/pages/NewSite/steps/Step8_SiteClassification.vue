<script setup lang="ts">
import { useTemplateRef, inject, ref, onMounted, computed } from 'vue';
import type { Ref } from 'vue';

import FieldSet from 'primevue/fieldset';
import Button from 'primevue/button';
import { Form, type FormInstance } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import MultiValuePlaceholder from '@/bcgov_arches_common/components/multiValuePlaceholder/MultiValuePlaceholder.vue';
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

const currentHeritageClass: HeritageClassTileType = ref(getHeritageClass());
const currentHeritageFunction: HeritageFunctionTileType = ref(
    getHeritageFunction(),
);
const currentHeritageTheme: HeritageThemeTileType = ref(getHeritageTheme());

const heritageClasses = computed(() => {
    return heritageSite?.value.aliased_data.heritage_class ?? [];
});
const heritageFunctions = computed(() => {
    return heritageSite?.value.aliased_data.heritage_function ?? [];
});

const isValid = () => {
    return true;
};

const isValidHeritageClass = () => {
    return baseIsValid(
        heritageClassForm as Ref<FormInstance>,
        HeritageClassTileSchema.shape['aliased_data'],
    );
};
const isValidHeritageFunction = () => {
    return baseIsValid(
        heritageFunctionForm as Ref<FormInstance>,
        HeritageFunctionTileSchema.shape['aliased_data'],
    );
};
const isValidHeritageTheme = () => {
    return baseIsValid(
        heritageThemeForm as Ref<FormInstance>,
        HeritageThemeTileSchema.shape['aliased_data'],
    );
};

const addHeritageClassDisabled = computed(
    () =>
        !isValidHeritageClass() ||
        heritageSite?.value.aliased_data.heritage_classes?.length > 4,
);
const addHeritageFunctionDisabled = computed(
    () =>
        !isValidHeritageFunction() ||
        heritageSite?.value.aliased_data?.heritage_functions?.length > 4,
);
const addHeritageThemeDisabled = computed(
    () =>
        !isValidHeritageTheme() ||
        heritageSite?.value.aliased_data?.heritage_themes?.length > 4,
);

const saveHeritageClass = function () {
    console.log('saveHeritageClass');
    heritageSite.value?.aliased_data.heritage_class.push(
        currentHeritageClass.value,
    );

    heritageClassForm.value?.reset();
};

const saveHeritageFunction = function () {
    console.log('saveHeritageFunction');
    heritageSite.value?.aliased_data.heritage_function.push(
        currentHeritageFunction.value,
    );

    heritageFunctionForm.value?.reset();
};

const saveHeritageTheme = function () {
    console.log('saveHeritageTheme');
    heritageSite.value?.aliased_data.heritage_theme.push(
        currentHeritageTheme.value,
    );

    heritageThemeForm.value?.reset();
};

const deleteHeritageClassCallback = function (index: number) {
    heritageSite?.value.aliased_data.heritage_class.splice(index, 1);
};

const deleteHeritageFunctionCallback = function (index: number) {
    heritageSite?.value.aliased_data.heritage_function.splice(index, 1);
};

const updateHeritageClassModelValue = function (
    newValue: AliasedNodeData,
    attribute_name: string,
) {
    baseUpdateModelValue(
        newValue,
        attribute_name,
        currentHeritageClass.value.aliased_data,
        heritageClassForm as Ref<FormInstance>,
    );
};

const updateFunctionCategoryModelValue = function (
    newValue: AliasedNodeData,
    attribute_name: string,
) {
    baseUpdateModelValue(
        newValue,
        attribute_name,
        currentHeritageFunction.value.aliased_data,
        heritageFunctionForm as Ref<FormInstance>,
    );
};

const updateHeritageThemeModelValue = function (
    newValue: AliasedNodeData,
    attribute_name: string,
) {
    baseUpdateModelValue(
        newValue,
        attribute_name,
        currentHeritageTheme.value.aliased_data,
        heritageThemeForm as Ref<FormInstance>,
    );
};

defineExpose({
    isValid,
});

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
                    <Button
                        id="saveHeritageClass"
                        :disabled="addHeritageClassDisabled"
                        :aria-disabled="addHeritageClassDisabled"
                        label="Add"
                        class="inline-block"
                        @click="saveHeritageClass"
                    ></Button>
                </div>
            </LabelledInput>
            <div class="flex flex-col">
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
            <MultiValuePlaceholder
                v-slot="slotProps"
                :showDeleteButton="true"
                :displayValues="heritageClasses"
                label="Heritage Class/Classes"
                :deleteCallback="deleteHeritageClassCallback"
            >
                {{
                    slotProps.value.aliased_data.heritage_category.display_value
                }}
                {{ slotProps.value.aliased_data.ownership.display_value }} ({{
                    slotProps.value.aliased_data.contributing_resource_count
                        .display_value
                }})
            </MultiValuePlaceholder>
        </FieldSet>
    </Form>
    <Form
        ref="heritageFunctionForm"
        v-slot="$form"
        name="heritageFunctionForm"
        :validateOnBlur="true"
        :resolver="heritageFunctionResolver"
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
                    <div class="inline-block">
                        <GenericWidget
                            :mode="EDIT"
                            :should-show-label="false"
                            :value="
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
            <Button
                id="saveFunctionCategory"
                label="Add"
                class="inline-block"
                :disabled="addHeritageFunctionDisabled"
                :aria-disabled="addHeritageFunctionDisabled"
                @click="saveHeritageFunction"
            ></Button>
            <MultiValuePlaceholder
                v-slot="slotProps"
                :showDeleteButton="true"
                :displayValues="heritageFunctions"
                label="Category/Categories"
                :deleteCallback="deleteHeritageFunctionCallback"
            >
                {{
                    slotProps.value.aliased_data.functional_category
                        .display_value
                }}
                {{
                    slotProps.value.aliased_data.functional_state.display_value
                }}
            </MultiValuePlaceholder>
        </Fieldset>
    </Form>
    <Form
        ref="heritageThemeForm"
        v-slot="$form"
        name="heritageThemeForm"
        :validateOnBlur="true"
        :resolver="heritageThemeResolver"
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
                        :aliasedNodeData="
                            heritageSite.value?.alised_data.heritage_theme
                                .aliased_data.heritage_theme
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
                <Button
                    id="addHeritageTheme"
                    label="Add"
                    class="inline-block"
                    :disabled="addHeritageThemeDisabled"
                    :aria_disabled="addHeritageThemeDisabled"
                    @click="saveHeritageTheme"
                ></Button>
            </LabelledInput>
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
