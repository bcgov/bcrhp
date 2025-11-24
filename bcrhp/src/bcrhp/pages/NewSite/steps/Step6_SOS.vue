<script setup lang="ts">
import { useTemplateRef, inject } from 'vue';
import type { Ref } from 'vue';

import InputText from 'primevue/inputtext';
import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import Editor from 'primevue/editor';
import { Form, FormField, type FormInstance } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import type { HeritageSite } from '@/bcrhp/schema/HeritageSiteSchema.ts';
import { StatementOfSignificanceSchema } from '@/bcrhp/schema/StatementOfSignificanceSchema.ts';

const heritageSite: typeof HeritageSite = inject(
    'heritageSite',
) as typeof HeritageSite;

const statementOfSignificanceForm: Ref<FormInstance | null> = useTemplateRef(
    'statementOfSignificanceForm',
) as Ref<FormInstance | null>;
const zodDescriptionResolver = zodResolver(
    StatementOfSignificanceSchema.shape.description,
);
const zodHeritageValueResolver = zodResolver(
    StatementOfSignificanceSchema.shape.heritageValue,
);
const zodDefiningElementsResolver = zodResolver(
    StatementOfSignificanceSchema.shape.definingElements,
);
const zodDocumentLocationResolver = zodResolver(
    StatementOfSignificanceSchema.shape.documentLocation,
);

const isValid = () => {
    return statementOfSignificanceForm.value?.valid;
};

defineExpose({ isValid });
</script>
<template>
    <Form
        ref="statementOfSignificanceForm"
        v-slot="$form"
        name="statementOfSignificanceForm"
        :validateOnBlur="true"
    >
        <div>
            <FormField
                :resolver="zodDescriptionResolver"
                name="description"
            >
                <LabelledInput
                    label="Description"
                    hint="Briefly describe the site as it exists today, where it is located (including province) and its physical extent and contributing resources"
                    input-name="description"
                    :error-message="$form.description?.error?.message"
                    :required="true"
                >
                    <div class="p-inputtext-fluid">
                        <Editor
                            id="description"
                            ref="descriptionField"
                            v-model="
                                heritageSite.statementOfSignificance.description
                            "
                            placeholder="E.g. The historic place is located at..."
                            theme="snow"
                            aria-describedby="description-help"
                            aria-required="true"
                            fluid
                        />
                    </div>
                </LabelledInput>
            </FormField>
            <FormField
                :resolver="zodHeritageValueResolver"
                name="heritageValue"
            >
                <LabelledInput
                    label="Heritage Value"
                    hint="Describe why the place is valued by the community and identify which heritage values the official recognition is based on"
                    input-name="heritageValue"
                    :error-message="$form.heritageValue?.error?.message"
                    :required="true"
                >
                    <div class="p-inputtext-fluid">
                        <Editor
                            id="heritageValue"
                            ref="heritageValueField"
                            v-model="
                                heritageSite.statementOfSignificance
                                    .heritageValue
                            "
                            placeholder="E.g. The historic place ha aesthetic, cultural and social value for its..."
                            theme="snow"
                            aria-describedby="heritage-value-help"
                            aria-required="true"
                            fluid
                        />
                    </div>
                </LabelledInput>
            </FormField>
            <FormField
                :resolver="zodDefiningElementsResolver"
                name="definingElements"
            >
                <LabelledInput
                    label="Character-Defining Elements"
                    hint="List the key features of the heritage site that contribute to its heritage value in bullet-point format"
                    input-name="definingElements"
                    :error-message="$form.definingElements?.error?.message"
                    :required="true"
                >
                    <div class="p-inputtext-fluid">
                        <Editor
                            id="definingElements"
                            ref="definingElementsField"
                            v-model="
                                heritageSite.statementOfSignificance
                                    .definingElements
                            "
                            placeholder="E.g The elements that define the heritage character of the historic place include: ..."
                            theme="snow"
                            aria-describedby="defining-elements-help"
                            aria-required="true"
                            fluid
                        />
                    </div>
                </LabelledInput>
            </FormField>
            <FormField
                :resolver="zodDocumentLocationResolver"
                name="documentLocation"
            >
                <LabelledInput
                    label="Document Location"
                    hint="Enter the government or department name where the original document was created"
                    input-name="documentLocation"
                    :error-message="$form.documentLocation?.error?.message"
                    :required="true"
                >
                    <div>
                        <InputText
                            id="documentLocation"
                            ref="documentLocationField"
                            v-model="
                                heritageSite.statementOfSignificance
                                    .documentLocation
                            "
                            placeholder="E.g. City of Courtenay, PLanning Department"
                            aria-describedby="document-location-help"
                            aria-required="true"
                            fluid
                            class="inline-block"
                        />
                    </div>
                </LabelledInput>
            </FormField>
        </div>
    </Form>
</template>

<style>
.inline-block {
    display: inline-block;
    width: unset;
}

.ql-editor {
    min-height: 200px;
}
</style>
