<script setup lang="ts">
import { useTemplateRef, inject, ref, computed } from 'vue';
import type { Ref } from 'vue';

import FieldSet from 'primevue/fieldset';
import Button from 'primevue/button';
import { Form, type FormInstance } from '@primevue/forms';
import GenericWidget from '@/arches_component_lab/generics/GenericWidget/GenericWidget.vue';
import { EDIT } from '@/arches_component_lab/widgets/constants.ts';
import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import ChipsList from '@/bcrhp/pages/NewSite/steps/ChipsList.vue';

import { type HeritageSiteType } from '@/bcrhp/schemas/heritage_site.ts';
import type { AliasedNodeData } from '@/arches_component_lab/types.ts';

import {
    isValid as baseIsValid,
    updateModelValue as baseUpdateModelValue,
} from '@/bcrhp/utils.ts';

import {
    ProtectionEventTileSchema,
    type ProtectionEventTileType,
    getProtectionEvent,
} from '@/bcrhp/schemas/heritage_site/protection_event.ts';

import { zodResolver } from '@primevue/forms/resolvers/zod';
import { getFlattenResolver } from '@/bcgov_arches_common/validation-utils.ts';
import Checkbox from 'primevue/checkbox';
import Step5_RecognitionDetailsView from '@/bcrhp/pages/NewSite/steps/Step5_RecognitionDetailsView.vue';

const recognitionDetailsForm: Ref<FormInstance | null> = useTemplateRef(
    'recognitionDetailsForm',
) as Ref<FormInstance | null>;

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite')!;
const emit = defineEmits(['update:stepIsValid']);

const currentProtectionEvent: Ref<ProtectionEventTileType> =
    ref(getProtectionEvent());
const formKey = ref(0);

const protectionEventResolver = getFlattenResolver(
    zodResolver(ProtectionEventTileSchema.shape['aliased_data']),
);

const isProtectionEventFormValid = () => {
    return baseIsValid(
        recognitionDetailsForm as Ref<FormInstance>,
        ProtectionEventTileSchema.shape['aliased_data'],
    );
};

const protectionEvents = computed(() => {
    return (
        heritageSite.value?.aliased_data.bc_right.aliased_data
            .protection_event ?? []
    );
});

const isValid = () => {
    return protectionEvents.value.length > 0;
};

const addProtectionEventDisabled = computed(() => {
    const data = currentProtectionEvent.value.aliased_data;

    const hasStartDate = !!(
        data.designation_or_protection_start_date?.node_value ||
        data.designation_or_protection_start_date?.display_value
    );

    const hasLegislativeAct = !!(
        data.legislative_act?.node_value || data.legislative_act?.display_value
    );

    const refNumValue = data.reference_number?.display_value || '';
    const hasReferenceNumber = refNumValue.trim().length > 0;

    return (
        !hasStartDate ||
        !hasLegislativeAct ||
        !hasReferenceNumber ||
        !isProtectionEventFormValid() ||
        protectionEvents.value.length >= 5
    );
});

const updateModelValue = function (
    newValue: AliasedNodeData,
    attribute_name: string,
) {
    baseUpdateModelValue(
        newValue,
        attribute_name,
        currentProtectionEvent.value?.aliased_data,
        recognitionDetailsForm as Ref<FormInstance>,
    );

    setTimeout(() => {
        emit('update:stepIsValid', isValid());
    }, 0);
};

const addProtectionEvent = function () {
    if (
        !heritageSite.value.aliased_data.bc_right.aliased_data.protection_event
    ) {
        heritageSite.value.aliased_data.bc_right.aliased_data.protection_event =
            [];
    }

    const data = currentProtectionEvent.value.aliased_data;
    const dateTxt = data.designation_or_protection_start_date?.node_value || '';
    const actTxt =
        data.legislative_act?.node_value?.en?.value ||
        data.legislative_act?.display_value ||
        '';
    const refTxt = data.reference_number?.node_value || '';

    let label = [dateTxt, actTxt].filter(Boolean).join(' - ');
    if (refTxt) label += ` (${refTxt})`;

    const eventToSave = {
        ...currentProtectionEvent.value,
        customDisplay: label || 'Untitled Protection Event',
    };

    heritageSite.value.aliased_data.bc_right.aliased_data.protection_event.push(
        eventToSave,
    );

    currentProtectionEvent.value = getProtectionEvent();
    formKey.value++;
    recognitionDetailsForm.value?.reset();

    emit('update:stepIsValid', isValid());
};

function deleteProtectionEvent(index: number) {
    heritageSite.value.aliased_data.bc_right.aliased_data.protection_event.splice(
        index,
        1,
    );
    emit('update:stepIsValid', isValid());
}

const isEditing = ref(false);
defineExpose({ isValid });
</script>

<template>
    <div>
        <Checkbox
            id="editAddressCheckbox"
            v-model="isEditing"
            binary
        ></Checkbox>
        <label for="editAddressCheckbox">Edit Recognition Details</label>
        <Step5_RecognitionDetailsView v-if="!isEditing" />
        <hr />
    </div>
    <Form
        v-if="isEditing"
        ref="recognitionDetailsForm"
        v-slot="$form"
        name="recognitionDetailsForm"
        :validateOnBlur="true"
        :resolver="protectionEventResolver"
    >
        <FieldSet
            id="recognitionDetailsFieldset"
            :key="formKey"
            legend="Protection Event"
        >
            <LabelledInput
                label="Designation or Recognition Start Date"
                hint="The date the designation or recognition was brought into effect"
                input-name="designation_or_protection_start_date"
                :error-message="
                    $form.designation_or_protection_start_date?.error?.message
                "
                :required="true"
            >
                <div class="p-inputtext-fluid">
                    <GenericWidget
                        :mode="EDIT"
                        :should-show-label="false"
                        :aliasedNodeData="
                            currentProtectionEvent.aliased_data
                                .designation_or_protection_start_date
                        "
                        graph-slug="heritage_site"
                        node-alias="designation_or_protection_start_date"
                        placeholder="Select a Designation Date"
                        group-direction="column"
                        @update:value="
                            updateModelValue(
                                $event,
                                'designation_or_protection_start_date',
                            )
                        "
                    />
                </div>
            </LabelledInput>
            <div class="row">
                <LabelledInput
                    class="grow"
                    label="Legislative Act"
                    hint="Designation or recognition type that applies to the site"
                    input-name="legislative_act"
                    :error-message="$form.legislative_act?.error?.message"
                    :required="true"
                >
                    <GenericWidget
                        :mode="EDIT"
                        :should-show-label="false"
                        :aliasedNodeData="
                            currentProtectionEvent.aliased_data.legislative_act
                        "
                        graph-slug="heritage_site"
                        node-alias="legislative_act"
                        placeholder="Select a Legislative Act"
                        group-direction="column"
                        @update:value="
                            updateModelValue($event, 'legislative_act')
                        "
                    />
                </LabelledInput>
            </div>
            <LabelledInput
                label="Reference Number"
                input-name="reference_number"
                hint="The bylaw or resolution number"
                :error-message="$form.reference_number?.error?.message"
                :required="true"
            >
                <GenericWidget
                    :mode="EDIT"
                    :should-show-label="false"
                    :aliasedNodeData="
                        currentProtectionEvent.aliased_data.reference_number
                    "
                    graph-slug="heritage_site"
                    node-alias="reference_number"
                    @update:value="updateModelValue($event, 'reference_number')"
                />
            </LabelledInput>
        </FieldSet>

        <div class="row">
            <Button
                id="saveRecognitionDetails"
                class="button-padding"
                label="+ Add Protection Event"
                :disabled="addProtectionEventDisabled"
                @click="addProtectionEvent"
            ></Button>

            <ChipsList
                label="Protection Events"
                :items="protectionEvents"
                :display-keys="[
                    'aliased_data.designation_or_protection_start_date',
                    'aliased_data.legislative_act',
                    'aliased_data.reference_number',
                ]"
                @remove="deleteProtectionEvent"
            />
        </div>
    </Form>
    <br /><br /><br />
</template>
<style>
#historicActsCheck {
    display: flex;
    align-self: center;
    flex-direction: column;
    margin-right: 1rem;
}
</style>
