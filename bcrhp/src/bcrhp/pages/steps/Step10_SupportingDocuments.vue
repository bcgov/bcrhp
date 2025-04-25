<script setup lang="ts">
import { useTemplateRef, inject, ref } from 'vue';
import type { Ref } from 'vue';

import FieldSet from 'primevue/fieldset';
import InputText from 'primevue/inputtext';
import FileUpload from 'primevue/fileupload';
import RadioButton from 'primevue/radiobutton';
import Editor from 'primevue/editor';
import { Form, FormField } from '@primevue/forms';
import type { FormFieldResolverOptions } from '@primevue/forms';
import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import type { HeritageSite } from '@/bcrhp/schema/HeritageSiteSchema.ts';
import { requiredHeritageSiteSchema } from '@/bcrhp/schema/HeritageSiteSchema.ts';
import type { ZodError } from 'zod';

const heritageSite: typeof HeritageSite = inject(
    'heritageSite',
) as typeof HeritageSite;
const heritageSiteRef: Ref<typeof HeritageSite> = ref(heritageSite);

type FormErrors = Partial<Record<keyof typeof HeritageSite, string[]>>;
const errors: Ref<FormErrors> = ref<FormErrors>({});
const ingredient = ref();

const fields = {
    documentDescriptionField: useTemplateRef('documentDescriptionField'),
    submissionNotesField: useTemplateRef('submissionNotesField'),
};
const isValid = () => {
    // We don't want to validate fields the first time we show the step
    if (!validateFields) {
        validateFields = true;
        return true;
    }
    let valid = true;

    for (const field of Object.values(fields) as Array<Ref>) {
        valid = validateField(field?.value.$el as HTMLInputElement) && valid;
    }
    return valid;
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

const onAdvancedUpload = function () {};

let validateFields = false;

// This needs to be removed - added because ESLint was complaining. Need to figure out
// configuration so API methods are not
defineExpose({ isValid });
</script>
<template>
    <Form
        ref="supportingDocumentsRef"
        name="supportingDocumentsRef"
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
                                :resolver="resolver"
                                name="documentDescription"
                            >
                                <LabelledInput
                                    label="Document Description"
                                    hint="Provide short description of document content"
                                    input-name="documentDescription"
                                    :error-message="
                                        errors.documentDescription?.join(',')
                                    "
                                >
                                    <div class="p-inputtext-fluid">
                                        <InputText
                                            id="documentDescription"
                                            ref="documentDescriptionField"
                                            v-model="
                                                heritageSite.documentDescription
                                            "
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
                :resolver="resolver"
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

<style></style>
