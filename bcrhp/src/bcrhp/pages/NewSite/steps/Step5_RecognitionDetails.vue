<script setup lang="ts">
import { useTemplateRef, inject, ref, onMounted, computed } from 'vue';
import type { Ref } from 'vue';

import FieldSet from 'primevue/fieldset';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import { Form, type FormInstance } from '@primevue/forms';
import GenericWidget from '@/arches_component_lab/generics/GenericWidget/GenericWidget.vue';
import { EDIT } from '@/arches_component_lab/widgets/constants.ts';
import LabelledInput from '@/bcgov_arches_common/components/labelledinput/LabelledInput.vue';
import LabelledCheckboxInput from '@/bcgov_arches_common/components/labelledinput/LabelledCheckbox.vue';
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

const recognitionDetailsForm: Ref<FormInstance | null> = useTemplateRef(
    'recognitionDetailsForm',
) as Ref<FormInstance | null>;

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite')!;
const emit = defineEmits(['update:stepIsValid']);

const currentProtectionEvent: Ref<ProtectionEventTileType> =
    ref(getProtectionEvent());
const showInactiveHistoricActs = ref(false);
const formKey = ref(0);

const protectionEventResolver = zodResolver(
    ProtectionEventTileSchema.shape['aliased_data'],
);

const protectionEvents = computed(() => {
    return (
        heritageSite.value?.aliased_data.bc_right.aliased_data
            .protection_event ?? []
    );
});

const addOtherReferenceNumberDisabled = computed(
    () =>
        recognitionDetailsForm.value?.states
            ?.designation_or_protection_start_date?.invalid ||
        recognitionDetailsForm.value?.states?.legislative_act?.invalid ||
        recognitionDetailsForm.value?.states?.referenceNumber?.invalid ||
        (heritageSite.value?.aliased_data?.bc_right?.aliased_data
            ?.protection_event?.length || 0) > 4,
);

const isValid = () => {
    return true;
};

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
    emit('update:stepIsValid', isValid());
};

const addProtectionEvent = function () {
    console.log('addProtectionEvent');

    // 1. Ensure Array Exists
    if (
        !heritageSite.value.aliased_data.bc_right.aliased_data.protection_event
    ) {
        heritageSite.value.aliased_data.bc_right.aliased_data.protection_event =
            [];
    }

    const data = currentProtectionEvent.value.aliased_data;

    // 2. Direct Extraction (Standard Arches path: node_value.en.value)
    // We assume the widget provides the standard object structure.
    const dateTxt = data.designation_or_protection_start_date?.node_value || '';
    const actTxt = data.legislative_act?.node_value?.en?.value || '';
    const refTxt = data.reference_number?.node_value?.en?.value || '';

    // 3. Construct Label
    let label = [dateTxt, actTxt].filter(Boolean).join(' - ');
    if (refTxt) label += ` (${refTxt})`;

    // 4. Attach Label & Push
    const eventToSave = {
        ...currentProtectionEvent.value,
        customDisplay: label || 'Untitled Protection Event',
    };

    heritageSite.value.aliased_data.bc_right.aliased_data.protection_event.push(
        eventToSave,
    );

    // 5. Reset
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
}

defineExpose({ isValid });
</script>

<template>
    <Form
        ref="recognitionDetailsForm"
        v-slot="$form"
        name="recognitionDetailsForm"
        :validateOnBlur="true"
        :resolver="protectionEventResolver"
    >
        <FieldSet
            id="recognitionDetailsFieldset"
            :key="formKey"
        >
            <LabelledInput
                label="Designation or Recognition Start Date"
                hint="The date the designation or recognition was brought into effect"
                input-name="designationDate"
                :error-message="$form.designationDate?.error?.message"
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
            <LabelledInput
                label="Legislative Act"
                hint="Designation or recognition type that applies to the site"
                input-name="legislativeAct"
                :error-message="$form.legislativeAct?.error?.message"
                :required="true"
            >
                <div class="p-inputtext-fluid flex">
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
                    <div class="inline-block">
                        <LabelledCheckboxInput
                            label="Historic Acts"
                            hint="Show inactive acts"
                            input-name="showInactiveHistoricActs"
                        >
                            <Checkbox
                                id="showInactiveHistoricActs"
                                ref="showInactiveHistoricActs"
                                :model-value="showInactiveHistoricActs"
                                aria-describedby="show-inactive-historic-acts-help"
                                aria-required="false"
                                class="inline-block"
                                fluid
                                binary
                                small
                            />
                        </LabelledCheckboxInput>
                    </div>
                </div>
            </LabelledInput>
            <LabelledInput
                label="Reference Number"
                hint="The bylaw or resolution number"
                input-name="referenceNumber"
                :error-message="$form.referenceNumber?.error?.message"
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
                class="button-padding"
                id="saveRecognitionDetails"
                label="+ Add Protection Event"
                :disabled="addOtherReferenceNumberDisabled"
                @click="addProtectionEvent"
            ></Button>
            <ChipsList
                label="Protection Events"
                :items="protectionEvents"
                display-key="customDisplay"
                @remove="deleteProtectionEvent"
            />
        </div>
    </Form>
</template>

<style></style>
