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

const siteNamesForm: Ref<FormInstance | null> = useTemplateRef(
    'siteNamesForm',
) as Ref<FormInstance | null>;
const zodCommonNameResolver = zodResolver(HeritageSiteSchema.shape.commonName);
const zodOtherNameResolver = zodResolver(HeritageSiteSchema.shape.otherName);

const isValid = () => {
    return siteNamesForm.value?.valid;
};

const saveOtherName = function () {
    console.log('saveOtherName');
    heritageSiteRef.value.otherNames.push(otherName.value);
    otherName.value = '';
};

const addOtherNameDisabled = computed(
    () =>
        siteNamesForm.value?.states.otherName.invalid ||
        siteNamesForm.value?.states.otherName.value == null ||
        siteNamesForm.value?.states.otherName.value.length < 1 ||
        heritageSiteRef.value?.otherNames.length > 4,
);

const deleteOtherNameCallback = function (index: number) {
    heritageSiteRef.value.otherNames.splice(index, 1);
};

defineExpose({ isValid });

onMounted(() => {
    heritageSiteRef.value.otherNames = otherNames;
});
</script>
<template>
    <Form
        ref="siteNamesForm"
        v-slot="$form"
        name="siteNamesForm"
        :validateOnBlur="true"
    >
        <div class="flex flex-col">
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
        </div>
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
