<script setup lang="ts">
import { useTemplateRef, inject, ref, onMounted, watch } from 'vue';
import type { Ref } from 'vue';

import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { Form, FormField } from '@primevue/forms';
import type { FormFieldResolverOptions } from '@primevue/forms';
import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import type { HeritageSite } from '@/bcrhp/schema/HeritageSiteSchema.ts';
import type { ZodError } from 'zod';

import MultiValuePlaceholder from '@/bcgov_arches_common/components/multiValuePlaceholder/MultiValuePlaceholder.vue';

import { requiredHeritageSiteSchema } from '@/bcrhp/schema/HeritageSiteSchema.ts';

const heritageSite: typeof HeritageSite = inject(
    'heritageSite',
) as typeof HeritageSite;
const heritageSiteRef: Ref<typeof HeritageSite> = ref(heritageSite);

type FormErrors = Partial<Record<keyof typeof HeritageSite, string[]>>;
const errors: Ref<FormErrors> = ref<FormErrors>({});

const otherName = ref('');
const otherNames = ref([] as Array<string>);

// These names need to match the Zog schema
const fields = {
    commonNameField: useTemplateRef('commonNameField'),
    otherNameField: useTemplateRef('otherNameField'),
};

watch(otherName, () => {
    updateAddOtherState();
});

const isValid = () => {
    // We don't want to validate fields the first time we show the step
    if (!validateFields) {
        validateFields = true;
        return true;
    }
    let valid = true;

    for (const field of Object.values(fields) as Array<Ref>) {
        valid =
            validateField({
                name: field?.value.$el.id,
            } as FormFieldResolverOptions) && valid;
    }
    return valid;
};

const updateAddOtherState = function () {
    addOtherNameDisabled.value =
        otherName.value.length < 1 ||
        heritageSiteRef.value.otherNames.length > 4;
};

const resolver = function (e: FormFieldResolverOptions): Record<string, any> {
    return validateField(e as FormFieldResolverOptions);
};

const validateField = function (
    event: FormFieldResolverOptions,
): Record<string, any> {
    const key: keyof typeof HeritageSite =
        event.name as keyof typeof HeritageSite;
    const fieldValidation = requiredHeritageSiteSchema.shape[key].safeParse(
        heritageSiteRef.value[key],
    );

    if (fieldValidation.success) {
        errors.value[key] = [];
    } else {
        errors.value[key] = (
            fieldValidation.error as typeof ZodError
        ).flatten().formErrors;
    }

    return fieldValidation.success;
};

const saveOtherName = function () {
    console.log('saveOtherName');
    heritageSiteRef.value.otherNames.push(otherName.value);
    otherName.value = '';
    updateAddOtherState();
};

const addOtherNameDisabled = ref(false);

let validateFields = false;

const deleteOtherNameCallback = function (index: number) {
    heritageSiteRef.value.otherNames.splice(index, 1);
    updateAddOtherState();
};

defineExpose({ isValid });

onMounted(() => {
    heritageSiteRef.value.otherNames = otherNames;
    updateAddOtherState();
});
</script>
<template>
    <Form
        ref="siteNamesRef"
        name="siteNamesRef"
    >
        <div class="flex flex-col">
            <FormField
                :resolver="resolver"
                name="commonName"
            >
                <LabelledInput
                    label="Common Name"
                    hint="The common name is the most recognizable name for the site"
                    input-name="commonName"
                    :error-message="errors.commonName?.join(',')"
                    :required="true"
                >
                    <div class="p-inputtext-fluid">
                        <InputText
                            id="commonName"
                            ref="commonNameField"
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
                v-slot="$field"
                :resolver="resolver"
                name="otherName"
            >
                <LabelledInput
                    label="Other Names (Optional)"
                    hint="Click Add to enter one or more additional names as applicable"
                    input-name="otherName"
                    :error-message="$field.error?.message"
                >
                    <InputText
                        id="otherName"
                        ref="otherNameField"
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
