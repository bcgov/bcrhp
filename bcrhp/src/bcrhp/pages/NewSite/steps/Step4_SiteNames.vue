<script setup lang="ts">
import { useTemplateRef, inject, ref, onMounted, computed } from 'vue';
import type { Ref } from 'vue';
import Button from 'primevue/button';
import { Form, type FormInstance } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import {
    type HeritageSiteType,
    HeritageSiteSchema,
} from '@/bcrhp/schemas/heritage_site.ts';
import { getSiteName } from '@/bcrhp/schemas/heritage_site/site_names.ts';

import MultiValuePlaceholder from '@/bcgov_arches_common/components/multiValuePlaceholder/MultiValuePlaceholder.vue';
import { EDIT } from '@/arches_component_lab/widgets/constants.ts';
import GenericWidget from '@/arches_component_lab/generics/GenericWidget/GenericWidget.vue';
import type { AliasedNodeData } from '@/arches_component_lab/types.ts';
import { updateModelValue as baseUpdateModelValue } from '@/bcrhp/utils.ts';

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite');
const emit = defineEmits(['update:stepIsValid']);

const currentCommonName = ref(getSiteName());
const currentOtherName = ref(getSiteName());

const commonNameForm: Ref<FormInstance | null> = useTemplateRef(
    'commonNameForm',
) as Ref<FormInstance | null>;
const otherNameForm: Ref<FormInstance | null> = useTemplateRef(
    'otherNameForm',
) as Ref<FormInstance | null>;
const zodCommonNameResolver = zodResolver(
    HeritageSiteSchema.shape['aliased_data'],
);
const zodOtherNameResolver = zodResolver(
    HeritageSiteSchema.shape['aliased_data'],
);

const isValid = () => {
    return isCommonNameValid() && isOtherNameValid();
};
const isCommonNameValid = () => {
    return commonNameForm.value?.valid;
};
const isOtherNameValid = () => {
    return otherNameForm.value?.valid;
};

const updateCommonName = function (
    newValue: AliasedNodeData,
    attribute_name: string,
) {
    baseUpdateModelValue(
        newValue,
        attribute_name,
        heritageSite?.value.aliased_data?.site_names[0].aliased_data,
        commonNameForm as Ref<FormInstance>,
    );
    emit('update:stepIsValid', isValid());
};

const updateOtherName = function (
    newValue: AliasedNodeData,
    attribute_name: string,
) {
    baseUpdateModelValue(
        newValue,
        attribute_name,
        currentOtherName?.value?.aliased_data,
        otherNameForm as Ref<FormInstance>,
    );
};

const saveOtherName = function () {
    console.log('saveOtherName');
    heritageSite?.value?.aliased_data.site_names.push(currentOtherName.value);
    otherNameForm.value?.reset();
    emit('update:stepIsValid', isValid());
};

const addOtherNameDisabled = computed(() => false);

const deleteOtherNameCallback = function (index: number) {
    heritageSite?.value.otherNames.splice(index, 1);
};

defineExpose({ isOtherNameValid, isCommonNameValid });

onMounted(() => {
    heritageSite?.value?.aliased_data?.site_names.push(currentCommonName.value);
});
</script>
<template>
    <div class="flex flex-col">
        <Form
            ref="commonNameForm"
            v-slot="$form"
            name="commonNameForm"
            :validateOnBlur="true"
            :resolver="zodCommonNameResolver"
        >
            <LabelledInput
                label="Common Name"
                hint="The common name is the most recognizable name for the site"
                input-name="commonName"
                :error-message="$form.commonName?.error?.message"
                :required="true"
            >
                <div class="p-inputtext-fluid">
                    <GenericWidget
                        :mode="EDIT"
                        :should-show-label="true"
                        :aliasedNodeData="currentCommonName"
                        graph-slug="heritage_site"
                        node-alias="name"
                        @update:value="updateCommonName($event, 'name')"
                    />
                </div>
            </LabelledInput>
        </Form>
        <Form
            ref="otherNameForm"
            v-slot="$form"
            name="otherNameForm"
            :validateOnBlur="true"
            :resolver="zodOtherNameResolver"
        >
            <LabelledInput
                label="Other Names (Optional)"
                hint="Click Add to enter one or more additional names as applicable"
                input-name="otherName"
                :error-message="$form.otherName?.error?.message"
            >
                <GenericWidget
                    :mode="EDIT"
                    :should-show-label="true"
                    :aliasedNodeData="currentOtherName"
                    graph-slug="heritage_site"
                    node-alias="name"
                    @update:value="updateOtherName($event, 'name')"
                />
                <Button
                    id="addOtherName"
                    label="Add"
                    class="inline-block"
                    :aria-disabled="addOtherNameDisabled"
                    :disabled="addOtherNameDisabled"
                    @click="saveOtherName"
                ></Button>
            </LabelledInput>
            <MultiValuePlaceholder
                v-slot="slotProps"
                label="Other Name(s)"
                :showDeleteButton="true"
                :displayValues="
                    heritageSite?.value?.aliased_data?.site_names?.slice(1) ??
                    []
                "
                :deleteCallback="deleteOtherNameCallback"
            >
                <div class="parent value">{{ slotProps.value }}</div>
            </MultiValuePlaceholder>
        </Form>
    </div>
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
