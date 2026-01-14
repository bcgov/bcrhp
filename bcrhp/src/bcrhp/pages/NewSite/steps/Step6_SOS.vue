<script setup lang="ts">
import { useTemplateRef, inject } from 'vue';
import type { Ref } from 'vue';

import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import { Form, type FormInstance } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import type { HeritageSiteType } from '@/bcrhp/schemas/heritage_site.ts';
import { BcStatementOfSignificanceTileSchema } from '@/bcrhp/schemas/heritage_site/bc_statement_of_significance.ts';
import type { AliasedNodeData } from '@/arches_component_lab/types.ts';
import { updateModelValue as baseUpdateModelValue } from '@/bcrhp/utils.ts';
import { EDIT } from '@/arches_component_lab/widgets/constants.ts';
import GenericWidget from '@/arches_component_lab/generics/GenericWidget/GenericWidget.vue';

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite');
const emit = defineEmits(['update:stepIsValid']);

const statementOfSignificanceForm: Ref<FormInstance | null> = useTemplateRef(
    'statementOfSignificanceForm',
) as Ref<FormInstance | null>;
const sosResolver = zodResolver(
    BcStatementOfSignificanceTileSchema.shape['aliased_data'],
);

const isValid = () => {
    return statementOfSignificanceForm.value?.valid;
};
const updateModelValue = function (
    newValue: AliasedNodeData,
    attribute_name: string,
) {
    baseUpdateModelValue(
        newValue,
        attribute_name,
        heritageSite?.value.aliased_data.bc_statement_of_significance[0]
            .aliased_data,
        statementOfSignificanceForm as Ref<FormInstance>,
    );
    emit('update:stepIsValid', isValid());
};

defineExpose({ isValid });
</script>
<template>
    <Form
        ref="statementOfSignificanceForm"
        v-slot="$form"
        name="statementOfSignificanceForm"
        :validateOnBlur="true"
        :resolver="sosResolver"
    >
        <div>
            <LabelledInput
                label="Description"
                hint="Briefly describe the site as it exists today, where it is located (including province) and its physical extent and contributing resources"
                input-name="description"
                :error-message="$form.description?.error?.message"
                :required="true"
            >
                <div class="p-inputtext-fluid">
                    <GenericWidget
                        :mode="EDIT"
                        :should-show-label="false"
                        :aliasedNodeData="null"
                        graph-slug="heritage_site"
                        node-alias="physical_description"
                        @update:value="
                            updateModelValue($event, 'physical_description')
                        "
                    />
                </div>
            </LabelledInput>
            <LabelledInput
                label="Heritage Value"
                hint="Describe why the place is valued by the community and identify which heritage values the official recognition is based on"
                input-name="heritageValue"
                :error-message="$form.heritageValue?.error?.message"
                :required="true"
            >
                <div class="p-inputtext-fluid">
                    <GenericWidget
                        :mode="EDIT"
                        :should-show-label="false"
                        :aliasedNodeData="null"
                        graph-slug="heritage_site"
                        node-alias="heritage_value"
                        @update:value="
                            updateModelValue($event, 'heritage_value')
                        "
                    />
                </div>
            </LabelledInput>
            <LabelledInput
                label="Character-Defining Elements"
                hint="List the key features of the heritage site that contribute to its heritage value in bullet-point format"
                input-name="definingElements"
                :error-message="$form.definingElements?.error?.message"
                :required="true"
            >
                <div class="p-inputtext-fluid">
                    <GenericWidget
                        :mode="EDIT"
                        :should-show-label="false"
                        :aliasedNodeData="null"
                        graph-slug="heritage_site"
                        node-alias="defining_elements"
                        @update:value="
                            updateModelValue($event, 'defining_elements')
                        "
                    />
                </div>
            </LabelledInput>
            <LabelledInput
                label="Document Location"
                hint="Enter the government or department name where the original document was created"
                input-name="documentLocation"
                :error-message="$form.documentLocation?.error?.message"
                :required="true"
            >
                <div>
                    <GenericWidget
                        :mode="EDIT"
                        :should-show-label="false"
                        :aliasedNodeData="null"
                        graph-slug="heritage_site"
                        node-alias="document_location"
                        @update:value="
                            updateModelValue($event, 'document_location')
                        "
                    />
                </div>
            </LabelledInput>
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
