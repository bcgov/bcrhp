<script setup lang="ts">
import { useTemplateRef, inject, ref } from 'vue';
import type { Ref } from 'vue';

import FieldSet from 'primevue/fieldset';
import InputText from 'primevue/inputtext';
import FileUpload from 'primevue/fileupload';
import RadioButton from 'primevue/radiobutton';
import Editor from 'primevue/editor';
import { Form, FormField, type FormInstance } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import type { HeritageSite } from '@/bcrhp/schema/HeritageSiteSchema.ts';
import { HeritageSiteSchema } from '@/bcrhp/schema/HeritageSiteSchema.ts';

const heritageSite: typeof HeritageSite = inject(
    'heritageSite',
) as typeof HeritageSite;
const ingredient = ref();

const supportingDocumentsForm: Ref<FormInstance | null> = useTemplateRef(
    'supportingDocumentsForm',
) as Ref<FormInstance | null>;
const zodDocumentDescriptionResolver = zodResolver(
    HeritageSiteSchema.shape.documentDescription,
);
const zodSubmissionNotesResolver = zodResolver(
    HeritageSiteSchema.shape.submissionNotes,
);

const isValid = () => {
    return supportingDocumentsForm.value?.valid;
};

const onAdvancedUpload = function () {};

// This needs to be removed - added because ESLint was complaining. Need to figure out
// configuration so API methods are not
defineExpose({ isValid });
</script>
<template>
    <Form
        ref="supportingDocumentsForm"
        v-slot="$form"
        name="supportingDocumentsForm"
        :validateOnBlur="true"
    >
        <FieldSet
            id="documentsFieldset"
            legend="Supporting Documents"
        >
            <div class="flex flex-row gap-4">
                <FileUpload
                    name="demo[]"
                    url="/api/upload"
                    :multiple="true"
                    accept="image/*"
                    :maxFileSize="1000000"
                    @upload="onAdvancedUpload()"
                >
                    <template #empty>
                        <span>Drag and drop files to here to upload.</span>
                    </template>
                </FileUpload>
                <div class="flex gap-4">
                    <div class="flex flex-col gap-2">
                        <div class="flex items-center gap-2">Type</div>
                        <div class="flex items-center">
                            <RadioButton
                                v-model="ingredient"
                                inputId="documentType1"
                                name="documentType"
                                value="notificationLetter"
                            />
                            <label for="ingredient2">Notification Letter</label>
                        </div>
                        <div class="flex items-center">
                            <RadioButton
                                v-model="ingredient"
                                inputId="documentType2"
                                name="documentType"
                                value="pdfMap"
                            />
                            <label for="ingredient3">PDF Map</label>
                        </div>
                        <div class="flex items-center">
                            <RadioButton
                                v-model="ingredient"
                                inputId="documentType3"
                                name="documentType"
                                value="meetingMinutes"
                            />
                            <label for="ingredient4"
                                >Bylaw / council meeting minutes</label
                            >
                        </div>
                        <div class="flex items-center">
                            <FormField
                                :resolver="zodDocumentDescriptionResolver"
                                name="documentDescription"
                            >
                                <LabelledInput
                                    label="Document Description"
                                    hint="Provide short description of document content"
                                    input-name="documentDescription"
                                    :error-message="
                                        $form.documentDescription?.error
                                            ?.message
                                    "
                                >
                                    <div class="p-inputtext-fluid">
                                        <InputText
                                            id="documentDescription"
                                            ref="documentDescriptionField"
                                            v-model="
                                                heritageSite.documentDescription
                                            "
                                            placeholder="E.g. 1234 Street Bylaw # 24-01-01"
                                            aria-describedby="document-description-help"
                                            aria-required="true"
                                            fluid
                                        />
                                    </div>
                                </LabelledInput>
                            </FormField>
                        </div>
                    </div>
                </div>
            </div>
        </FieldSet>
        <Fieldset
            id="submissionNotesFieldset"
            class="p-fieldset p-component mt-2"
            legend="Submission Notes (Optional)"
        >
            <FormField
                :resolver="zodSubmissionNotesResolver"
                name="submissionNotes"
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
            </FormField>
        </Fieldset>
    </Form>
</template>
