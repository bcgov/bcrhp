<script setup lang="ts">
import { useTemplateRef, inject, computed } from 'vue';
import type { Ref } from 'vue';

import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import { Form, type FormInstance } from '@primevue/forms';
import FieldSet from 'primevue/fieldset'; // Added import
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { getFlattenResolver } from '@/bcgov_arches_common/validation-utils.ts';
import { convertNbspToSpaces } from '@/bcgov_arches_common/datatypes/string/validation/utils.ts';
import type { HeritageSiteType } from '@/bcrhp/schemas/heritage_site.ts';
import {
    BcStatementOfSignificanceTileSchema,
    getStatementOfSignificance,
} from '@/bcrhp/schemas/heritage_site/bc_statement_of_significance.ts';
import type { AliasedNodeData } from '@/arches_component_lab/types.ts';
import type { StringValue } from '@/arches_component_lab/datatypes/string/types.ts';
import {
    updateModelValue as baseUpdateModelValue,
    isValid as baseIsValid,
} from '@/bcrhp/utils.ts';
import { EDIT } from '@/arches_component_lab/widgets/constants.ts';
import GenericWidget from '@/arches_component_lab/generics/GenericWidget/GenericWidget.vue';

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite')!;
const emit = defineEmits(['update:stepIsValid']);

const statementOfSignificanceForm: Ref<FormInstance | null> = useTemplateRef(
    'statementOfSignificanceForm',
) as Ref<FormInstance | null>;

const sosResolver = getFlattenResolver(
    zodResolver(BcStatementOfSignificanceTileSchema.shape['aliased_data']),
);

const sosTile = computed(() => {
    return heritageSite.value.aliased_data.bc_statement_of_significance[0];
});

const isValid = () => true;

const isTextValid = () => {
    const formValid = baseIsValid(
        statementOfSignificanceForm as Ref<FormInstance>,
        BcStatementOfSignificanceTileSchema.shape['aliased_data'],
    );

    return formValid;
};

const updateModelValue = function (
    newValue: AliasedNodeData,
    attribute_name: string,
) {
    if (
        heritageSite.value?.aliased_data.bc_statement_of_significance.length ===
        0
    ) {
        heritageSite.value?.aliased_data.bc_statement_of_significance.push(
            getStatementOfSignificance(),
        );
    }
    baseUpdateModelValue(
        convertNbspToSpaces(newValue as StringValue),
        attribute_name,
        heritageSite.value.aliased_data.bc_statement_of_significance[0]
            .aliased_data,
        statementOfSignificanceForm as Ref<FormInstance>,
    );

    setTimeout(() => {
        emit('update:stepIsValid', isTextValid());
    }, 0);
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
        <FieldSet legend="Statement of Significance">
            <div class="flex flex-column gap-4">
                <LabelledInput
                    label="Description"
                    hint="Briefly describe the site as it exists today, where it is located (including province) and its physical extent and contributing resources"
                    input-name="physical_description"
                    :error-message="$form.physical_description?.error?.message"
                    :required="true"
                >
                    <div class="p-inputtext-fluid">
                        <GenericWidget
                            :mode="EDIT"
                            :should-show-label="false"
                            :aliasedNodeData="
                                sosTile?.aliased_data?.physical_description
                            "
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
                    input-name="heritage_value"
                    :error-message="$form.heritage_value?.error?.message"
                    :required="true"
                >
                    <div class="p-inputtext-fluid">
                        <GenericWidget
                            :mode="EDIT"
                            :should-show-label="false"
                            :aliasedNodeData="
                                sosTile?.aliased_data?.heritage_value
                            "
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
                    input-name="defining_elements"
                    :error-message="$form.defining_elements?.error?.message"
                    :required="true"
                >
                    <div class="p-inputtext-fluid">
                        <GenericWidget
                            :mode="EDIT"
                            :should-show-label="false"
                            :aliasedNodeData="
                                sosTile?.aliased_data?.defining_elements
                            "
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
                    hint="Enter the government or agency name where the original document was created."
                    input-name="document_location"
                    :error-message="$form.document_location?.error?.message"
                    :required="true"
                >
                    <div class="p-inputtext-fluid">
                        <GenericWidget
                            :mode="EDIT"
                            :should-show-label="false"
                            :aliasedNodeData="
                                sosTile?.aliased_data?.document_location
                            "
                            graph-slug="heritage_site"
                            node-alias="document_location"
                            @update:value="
                                updateModelValue($event, 'document_location')
                            "
                        />
                    </div>
                </LabelledInput>
            </div>
        </FieldSet>
    </Form>
    <br /><br /><br /><br />
</template>

<style scoped>
.ql-editor {
    min-height: 200px;
}
.flex-column {
    flex-direction: column;
}
</style>
