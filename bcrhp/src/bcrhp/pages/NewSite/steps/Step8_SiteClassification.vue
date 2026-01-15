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
import { updateModelValue as baseUpdateModelValue } from '@/bcrhp/utils.ts';

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite');

const heritageClassForm: Ref<FormInstance | null> = useTemplateRef(
    'heritageClassForm',
) as Ref<FormInstance | null>;
const heritageFunctionForm: Ref<FormInstance | null> = useTemplateRef(
    'heritageFunctionForm',
) as Ref<FormInstance | null>;
const heritageThemeForm: Ref<FormInstance | null> = useTemplateRef(
    'heritageThemeForm',
) as Ref<FormInstance | null>;
const currentHeritageClass: HeritageClassTileType =
    reactive(getHeritageClass());
const currentHeritageFunction: HeritageFunctionTileType = reactive(
    getHeritageFunction(),
);
const currentHeritageTheme: HeritageThemeTileType =
    reactive(getHeritageTheme());
const heritageClasses = ref([] as Array<string>);
const heritageFunctions = ref([] as Array<string>);
const heritageThemes = ref([] as Array<string>);

const heritageThemeResolver = zodResolver(
    HeritageThemeTileSchema.shape['aliased_data'],
);
const heritageFunctionResolver = zodResolver(
    HeritageFunctionTileSchema.shape['aliased_data'],
);
const heritageClassResolver = zodResolver(
    HeritageClassTileSchema.shape['aliased_data'],
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
        heritageSite?.value.aliased_data.heritage_classes?.length > 4,
);
const addOtherHeritageFunctionDisabled = computed(
    () =>
        !heritageFunctionForm.value?.states?.functional_category?.value ||
        !heritageFunctionForm.value?.states?.function_category_type?.value ||
        heritageFunctionForm.value?.states?.functional_category?.invalid ||
        heritageFunctionForm.value?.states?.function_category_type?.invalid ||
        heritageSite?.value.aliased_data?.heritage_functions?.length > 4,
);
const addOtherHeritageThemeDisabled = computed(
    () =>
        !heritageThemeForm.value?.states?.heritage_theme?.value ||
        heritageThemeForm.value?.states?.heritage_theme?.invalid ||
        heritageSite?.value.aliased_data?.heritage_themes?.length > 4,
);

const saveHeritageClass = function () {
    console.log('saveHeritageClass');
    heritageSite?.value.aliased_data.heritage_class.push({
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
    heritageSite?.value.aliased_data.heritage_function.push(
        currentHeritageFunction,
    );

    heritageFunctionForm.value?.reset();
};

const saveHeritageTheme = function () {
    console.log('saveHeritageTheme');

    heritageThemeForm.value?.reset();
};

const deleteHeritageClassCallback = function (index: number) {
    heritageSite?.value.aliased_data.heritage_class.splice(index, 1);
};

const deleteHeritageFunctionCallback = function (index: number) {
    heritageSite?.value.aliased_data.heritage_function.splice(index, 1);
};

const deleteHeritageThemeCallback = function (index: number) {
    heritageSite?.value.aliased_data.heritage_themes.splice(index, 1);
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
    isValidHeritageClass,
    isValidHeritageFunction,
    isValidHeritageTheme,
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
