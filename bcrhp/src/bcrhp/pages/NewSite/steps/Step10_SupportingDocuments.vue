<script setup lang="ts">
import { computed, useTemplateRef, inject, ref } from 'vue';
import type { Ref } from 'vue';
import FieldSet from 'primevue/fieldset';
import { Form, type FormInstance } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import type { StringValue } from '@/arches_component_lab/datatypes/string/types.ts';
import { convertNbspToSpaces } from '@/bcgov_arches_common/datatypes/string/validation/utils.ts';
import { type HeritageSiteType } from '@/bcrhp/schemas/heritage_site.ts';
import ChipsList from '@/bcrhp/pages/NewSite/steps/ChipsList.vue';
import {
    isValid as baseIsValid,
    updateModelValue as baseUpdateModelValue,
} from '@/bcrhp/utils.ts';
import type {
    AliasedNodeData,
    CardXNodeXWidgetData,
} from '@/arches_component_lab/types.ts';
import { EDIT } from '@/arches_component_lab/widgets/constants.ts';
import GenericWidget from '@/arches_component_lab/generics/GenericWidget/GenericWidget.vue';
import {
    getSiteDocument,
    SiteDocumentTileSchema,
} from '@/bcrhp/schemas/heritage_site/site_document.ts';
import { getInternalRemark } from '@/bcrhp/schemas/heritage_site/internal_remark.ts';

const siteDocument = ref(getSiteDocument());
const siteDocumentKey = ref(0);

const siteDocumentList = computed(() => {
    return heritageSite.value?.aliased_data?.site_document ?? [];
});

import { getFlattenResolver } from '@/bcgov_arches_common/validation-utils.ts';
import Button from 'primevue/button';

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite')!;
const emit = defineEmits(['update:stepIsValid']);
const internalRemark = computed(() => {
    return heritageSite.value.aliased_data.internal_remark[0];
});

const supportingDocumentsForm: Ref<FormInstance | null> = useTemplateRef(
    'supportingDocumentsForm',
) as Ref<FormInstance | null>;

const supportingDocumentsResolver = getFlattenResolver(
    zodResolver(SiteDocumentTileSchema.shape['aliased_data']),
);

const isValid = () => {
    return siteDocumentList.value.length > 0;
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
    if (attribute_name === 'internal_remark') {
        if (heritageSite?.value.aliased_data.internal_remark.length === 0) {
            heritageSite.value.aliased_data.internal_remark.push(
                getInternalRemark(),
            );
        }
        await baseUpdateModelValue(
            convertNbspToSpaces(newValue as StringValue),
            attribute_name,
            internalRemark?.value?.aliased_data,
            supportingDocumentsForm as Ref<FormInstance>,
        );
    } else {
        await baseUpdateModelValue(
            newValue,
            attribute_name,
            siteDocument.value?.aliased_data,
            supportingDocumentsForm as Ref<FormInstance>,
        );
    }
    emit('update:stepIsValid', isValid());
};

const addDocumentDisabled = computed(() => {
    return (
        !baseIsValid(
            supportingDocumentsForm as Ref<FormInstance>,
            SiteDocumentTileSchema.shape['aliased_data'],
        ) || siteDocumentList.value.length >= 10
    );
});

const saveDocument = async function () {
    const type =
        siteDocument.value.aliased_data.document_type?.display_value || '';
    const name =
        siteDocument.value.aliased_data.site_document?.node_value?.[0]?.name ||
        '';

    const eventToSave = {
        ...siteDocument.value,
        customDisplay: `${type} - ${name}`,
    };

    heritageSite.value.aliased_data.site_document.push(eventToSave);

    siteDocument.value = getSiteDocument();
    siteDocumentKey.value++;
    supportingDocumentsForm.value?.reset();

    emit('update:stepIsValid', isValid());
};

const deleteSiteDocument = function (index: number) {
    heritageSite.value.aliased_data.site_document.splice(index, 1);

    emit('update:stepIsValid', isValid());
};

defineExpose({ isValid });
</script>

<template>
    <Form
        ref="supportingDocumentsForm"
        v-slot="$form"
        name="supportingDocumentsForm"
        :validateOnBlur="true"
        :resolver="supportingDocumentsResolver"
    >
        <FieldSet
            id="documentsFieldset"
            legend="Required Documents"
        >
            <div class="flex flex-row gap-4">
                <div
                    class="instructions"
                    style="margin-bottom: 1rem"
                >
                    Upload supporting and required documents. Drag and drop 1
                    file at a time, filling out the form for each file. Hit +Add
                    after each completed entry. Required documents include:

                    <ul>
                        <li>Bylaw, Resolution, or Council Meeting Minutes</li>
                        <li>
                            GIS files or Site Map (if no geospatial data was
                            included in Step 3)
                        </li>
                    </ul>
                </div>
            </div>
            <LabelledInput
                label="Document"
                input-name="document"
                :error-message="$form.site_document?.error?.message"
                :required="true"
            >
                <GenericWidget
                    :key="siteDocumentKey"
                    :required="true"
                    graph-slug="heritage_site"
                    node-alias="site_document"
                    :should-show-label="false"
                    :mode="EDIT"
                    :aliased-node-data="
                        siteDocument.value?.aliased_data?.site_document
                    "
                    @update:value="updateModelValue($event, 'site_document')"
                ></GenericWidget>
            </LabelledInput>
            <LabelledInput
                label="Document Type"
                input-name="document"
                :error-message="$form.document_type?.error?.message"
                :required="true"
            >
                <GenericWidget
                    :key="siteDocumentKey"
                    :required="true"
                    graph-slug="heritage_site"
                    node-alias="document_type"
                    :should-show-label="false"
                    :mode="EDIT"
                    :card-x-node-x-widget-data-overrides="documentTypeOverrides"
                    :aliased-node-data="
                        siteDocument.value?.aliased_data?.document_type
                    "
                    @update:value="updateModelValue($event, 'document_type')"
                ></GenericWidget>
            </LabelledInput>
            <LabelledInput
                label="Document Description"
                input-name="document"
                :error-message="$form.document_description?.error?.message"
                :required="true"
                hint="Provide a short description of the document content"
            >
                <GenericWidget
                    :key="siteDocumentKey"
                    :required="true"
                    graph-slug="heritage_site"
                    node-alias="document_description"
                    :should-show-label="false"
                    :mode="EDIT"
                    :aliased-node-data="
                        siteDocument.value?.aliased_data?.document_description
                    "
                    @update:value="
                        updateModelValue($event, 'document_description')
                    "
                ></GenericWidget>
            </LabelledInput>
            <br />
        </FieldSet>
    </Form>
    <br />
    <div class="row">
        <Button
            id="addOtherName"
            label="+ Add"
            class="button-padding"
            :aria-disabled="addDocumentDisabled"
            :disabled="addDocumentDisabled"
            @click="saveDocument"
        ></Button>
        <ChipsList
            label="Site Documents"
            :items="siteDocumentList"
            :display-keys="['customDisplay']"
            @remove="deleteSiteDocument"
        />
    </div>
    <br /><br />
    <Form>
        <FieldSet
            id="submissionNotesFieldset"
            legend="Submission Notes (Optional)"
        >
            <LabelledInput
                input-name="submissionNotes"
                hint="Enter any additional remarks about the site submission"
            >
                <div class="p-inputtext-fluid">
                    <GenericWidget
                        :key="siteDocumentKey"
                        :required="true"
                        graph-slug="heritage_site"
                        node-alias="internal_remark"
                        :should-show-label="false"
                        :mode="EDIT"
                        :aliased-node-data="
                            internalRemark?.value?.aliased_data?.internal_remark
                        "
                        @update:value="
                            updateModelValue($event, 'internal_remark')
                        "
                    ></GenericWidget>
                </div>
            </LabelledInput>
        </FieldSet>
    </Form>
</template>

<style scoped>
.instructions > ul {
    margin-left: 2rem;
    list-style-type: disc;
}
</style>
