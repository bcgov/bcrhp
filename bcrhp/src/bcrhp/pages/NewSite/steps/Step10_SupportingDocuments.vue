<script setup lang="ts">
import { computed, useTemplateRef, inject, ref } from 'vue';
import type { Ref } from 'vue';

import FieldSet from 'primevue/fieldset';
import Editor from 'primevue/editor';
import { Form, type FormInstance } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import { type HeritageSiteType } from '@/bcrhp/schemas/heritage_site.ts';
import MultiValuePlaceholder from '@/bcgov_arches_common/components/multiValuePlaceholder/MultiValuePlaceholder.vue';
import {
    isValid as baseIsValid,
    updateModelValue as baseUpdateModelValue,
} from '@/bcrhp/utils.ts';
import type {
    AliasedNodeData,
    CardXNodeXWidgetData,
} from '@/arches_component_lab/types.ts';
import { EDIT, VIEW } from '@/arches_component_lab/widgets/constants.ts';
import GenericWidget from '@/arches_component_lab/generics/GenericWidget/GenericWidget.vue';
import {
    getSiteDocument,
    SiteDocumentTileSchema,
} from '@/bcrhp/schemas/heritage_site/site_document.ts';

const siteDocument = ref(getSiteDocument());
const siteDocumentKey = ref(0);

const siteDocumentList = computed(() => {
    return heritageSite.value?.aliased_data?.site_document ?? [];
});

import { getFlattenResolver } from '@/bcgov_arches_common/validation-utils.ts';
import Button from 'primevue/button';

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite')!;
const emit = defineEmits(['update:stepIsValid']);

const supportingDocumentsForm: Ref<FormInstance | null> = useTemplateRef(
    'supportingDocumentsForm',
) as Ref<FormInstance | null>;

const supportingDocumentsResolver = getFlattenResolver(
    zodResolver(SiteDocumentTileSchema.shape['aliased_data']),
);

const isValid = () => {
    return true;
    // return baseIsValid(
    //     supportingDocumentsForm as Ref<FormInstance>,
    //     SiteDocumentTileSchema.shape['aliased_data'],
    // );
};

const documentTypeOverrides = {
    widget: {
        widgetid: '',
        component:
            'arches_component_lab/widgets/ConceptRadioWidget/ConceptRadioWidget.vue',
    },
} satisfies Partial<CardXNodeXWidgetData>;

const updateModelValue = async function (
    newValue: AliasedNodeData,
    attribute_name: string,
) {
    await baseUpdateModelValue(
        newValue,
        attribute_name,
        siteDocument.value?.aliased_data,
        supportingDocumentsForm as Ref<FormInstance>,
    );
    emit('update:stepIsValid', isValid());
};

const addDocumentDisabled = computed(() => false);

const saveDocument = async function () {
    heritageSite.value.aliased_data.site_document.push(siteDocument.value);

    siteDocument.value = getSiteDocument();

    // Increment the key to force the GenericWidget to re-render from scratch
    siteDocumentKey.value++;

    // Optional: Reset the form validation state to remove any "touched" or error states
    supportingDocumentsForm.value?.reset();
};

const deleteSiteDocument = function (index: number) {
    heritageSite.value.aliased_data.site_document.splice(index, 1);
};

// This needs to be removed - added because ESLint was complaining. Need to figure out
// configuration so API methods are not
defineExpose({ isValid });
</script>
<template>
    <Form
        ref="supportingDocumentsForm"
        name="supportingDocumentsForm"
        :validateOnBlur="true"
        :resolver="supportingDocumentsResolver"
    >
        <FieldSet id="documentsFieldset">
            <div class="flex flex-row gap-4">
                <div
                    class="instructions"
                    style="margin-bottom: 1rem"
                >
                    Upload supporting and required documents. Required documents
                    include:
                    <ul>
                        <li>Notification Letter</li>
                        <li>Bylaw, Resolution, or Council Meeting Minutes</li>
                        <li>
                            GIS files or Site Map (if no geospatial data was
                            included in Step 4)
                        </li>
                    </ul>
                </div>
                <div>
                    <Button
                        id="addOtherName"
                        label="+ Add"
                        class="inline-block"
                        :aria-disabled="addDocumentDisabled"
                        :disabled="addDocumentDisabled"
                        @click="saveDocument"
                    ></Button>
                </div>
            </div>
            <div class="flex flex-row gap-4">
                <div class="flex flex-col">
                    <GenericWidget
                        :key="siteDocumentKey"
                        graph-slug="heritage_site"
                        node-alias="site_document"
                        :should-show-label="true"
                        :mode="EDIT"
                        :aliased-node-data="
                            siteDocument.value?.aliased_data?.site_document
                        "
                        @update:value="
                            updateModelValue($event, 'site_document')
                        "
                    ></GenericWidget>
                </div>
                <div class="flex flex-col">
                    <GenericWidget
                        :key="siteDocumentKey"
                        graph-slug="heritage_site"
                        node-alias="document_type"
                        :should-show-label="true"
                        :mode="EDIT"
                        :card-x-node-x-widget-data-overrides="
                            documentTypeOverrides
                        "
                        :aliased-node-data="
                            siteDocument.value?.aliased_data?.document_type
                        "
                        @update:value="
                            updateModelValue($event, 'document_type')
                        "
                    ></GenericWidget>
                    <GenericWidget
                        :key="siteDocumentKey"
                        graph-slug="heritage_site"
                        node-alias="document_description"
                        :should-show-label="true"
                        :mode="EDIT"
                        :aliased-node-data="
                            siteDocument.value?.aliased_data
                                ?.document_description
                        "
                        @update:value="
                            updateModelValue($event, 'document_description')
                        "
                    ></GenericWidget>
                </div>
            </div>
            <MultiValuePlaceholder
                v-slot="slotProps"
                label="Site Documents"
                :showDeleteButton="true"
                :displayValues="siteDocumentList"
                :deleteCallback="deleteSiteDocument"
            >
                <div class="parent value">
                    <GenericWidget
                        graph-slug="heritage_site"
                        :mode="VIEW"
                        :should-show-label="false"
                        node-alias="site_document"
                        :aliased-node-data="
                            slotProps.value?.aliased_data.site_document
                        "
                    />
                    {{
                        slotProps.value?.aliased_data.document_type
                            .display_value
                    }}
                    -
                    {{
                        slotProps.value?.aliased_data.site_document
                            ?.node_value?.[0].name
                    }}
                    {{
                        slotProps.value?.aliased_data.document_description
                            .display_value
                    }}
                </div>
            </MultiValuePlaceholder>
        </FieldSet>
    </Form>
    <Form>
        <Fieldset
            id="submissionNotesFieldset"
            class="p-fieldset p-component mt-2"
            legend="Submission Notes (Optional)"
        >
            <LabelledInput
                input-name="submissionNotes"
                hint="Enter any additional remarks about the site submission"
            >
                <div class="p-inputtext-fluid">
                    <Editor
                        id="submissionNotes"
                        ref="submissionNotesField"
                        v-model="heritageSite.submissionNotes"
                        theme="snow"
                        aria-describedby="submission-notes-help"
                        fluid
                    />
                </div>
            </LabelledInput>
        </Fieldset>
    </Form>
</template>

<style scoped>
.instructions > ul {
    margin-left: 2rem;
    list-style-type: disc;
}
</style>
