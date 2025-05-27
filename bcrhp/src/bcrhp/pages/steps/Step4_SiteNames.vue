<script setup lang="ts">
import { useTemplateRef, inject, ref, onMounted, computed } from 'vue';
import type { Ref } from 'vue';
import Button from 'primevue/button';
import { Form, FormField, type FormInstance } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import type { HeritageSite } from '@/bcrhp/schema/HeritageSiteSchema.ts';
import { HeritageSiteSchema } from '@/bcrhp/schema/HeritageSiteSchema.ts';

import MultiValuePlaceholder from '@/bcgov_arches_common/components/multiValuePlaceholder/MultiValuePlaceholder.vue';

const heritageSite: typeof HeritageSite = inject(
    'heritageSite',
) as typeof HeritageSite;
const heritageSiteRef: Ref<typeof HeritageSite> = ref(heritageSite);

const otherName = ref('');
const otherNames = ref([] as Array<string>);

const commonNameForm: Ref<FormInstance | null> = useTemplateRef(
    'commonNameForm',
) as Ref<FormInstance | null>;
const otherNameForm: Ref<FormInstance | null> = useTemplateRef(
    'otherNameForm',
) as Ref<FormInstance | null>;
const zodCommonNameResolver = zodResolver(HeritageSiteSchema.shape.commonName);
const zodOtherNameResolver = zodResolver(HeritageSiteSchema.shape.otherName);

const isCommonNameValid = () => {
    return commonNameForm.value?.valid;
};
const isOtherNameValid = () => {
    return otherNameForm.value?.valid;
};

const saveOtherName = function () {
    console.log('saveOtherName');
    heritageSiteRef.value.otherNames.push(otherName.value);

    otherNameForm.value?.reset();
};

const addOtherNameDisabled = computed(
    () =>
        otherNameForm.value?.states.otherName.invalid ||
        otherNameForm.value?.states.otherName.value == null ||
        otherNameForm.value?.states.otherName.value.length < 1 ||
        heritageSiteRef.value?.otherNames.length > 4,
);

const deleteOtherNameCallback = function (index: number) {
    heritageSiteRef.value.otherNames.splice(index, 1);
};

defineExpose({ isOtherNameValid, isCommonNameValid });

onMounted(() => {
    heritageSiteRef.value.otherNames = otherNames;
});
</script>
<template>
    <div class="flex flex-col">
        <Form
            ref="commonNameForm"
            v-slot="$form"
            name="commonNameForm"
            :validateOnBlur="true"
        >
            <FormField
                :resolver="zodCommonNameResolver"
                name="commonName"
            >
                <LabelledInput
                    label="Common Name"
                    hint="The common name is the most recognizable name for the site"
                    input-name="commonName"
                    :error-message="$form.commonName?.error?.message"
                    :required="true"
                >
                    <div class="p-inputtext-fluid">
                        <InputText
                            id="commonName"
                            v-model="heritageSite.commonName"
                            name="commonName"
                            aria-describedby="username-help"
                            aria-required="true"
                            fluid
                        />
                    </div>
                </LabelledInput>
            </FormField>
        </Form>
        <Form
            ref="otherNameForm"
            v-slot="$form"
            name="otherNameForm"
            :validateOnBlur="true"
        >
            <FormField
                :resolver="zodOtherNameResolver"
                name="otherName"
            >
                <LabelledInput
                    label="Other Names (Optional)"
                    hint="Click Add to enter one or more additional names as applicable"
                    input-name="otherName"
                    :error-message="$form.otherName?.error?.message"
                >
                    <InputText
                        id="otherName"
                        v-model="otherName"
                        name="otherName"
                        aria-describedby="other-name-help"
                        aria-required="true"
                        fluid
                        class="inline-block"
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
            </FormField>
            <MultiValuePlaceholder
                v-slot="slotProps"
                label="Other Name(s)"
                :showDeleteButton="true"
                :displayValues="otherNames"
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
