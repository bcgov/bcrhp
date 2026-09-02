<script setup lang="ts">
import Step1_AboutNew from '@/bcrhp/pages/SiteSubmission/steps/Step1_AboutNew.vue';
import Step1_AboutUpdate from '@/bcrhp/pages/SiteSubmission/steps/Step1_AboutUpdate.vue';
import { EditMode } from '@/bcrhp/pages/SiteSubmission/constants.ts';
import { onMounted, ref, watchEffect } from 'vue';

import type { Card, Node } from '@/arches_component_lab/types.ts';
import { useWorkflowStep } from '@/bcrhp/components/WorkflowStepper/components/useWorkflowStep.ts';

const emit = defineEmits(['update:stepIsValid']);
const { editMode } = useWorkflowStep();
export interface CardXNodeXWidgetData {
    card: Card;
    config: {
        defaultValue: unknown | null;
        placeholder?: string;
    };
    id: string;
    label: string;
    node: Node;
    sortorder: number;
    visible: boolean;
    widget: {
        widgetid: string;
        component: string;
    };
}
const isValid = () => {
    return EditMode.Add == editMode
        ? true
        : (step1_aboutUpdate.value?.isValid() ?? false);
};
const step1_aboutUpdate = ref<InstanceType<typeof Step1_AboutUpdate>>();

watchEffect(() => {
    emit('update:stepIsValid', isValid());
});
onMounted(() => {
    emit('update:stepIsValid', isValid());
});

defineExpose({ isValid });
</script>
<template>
    <Step1_AboutNew v-if="EditMode.Add === editMode" />
    <Step1_AboutUpdate
        v-else
        ref="step1_aboutUpdate"
    />
</template>

<style>
li {
    color: unset;
    font-size: unset;
}

.bullet-list {
    list-style-type: disc;
    padding-left: 1.5rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
}

.bullet-list-nested {
    list-style-type: circle;
    padding-left: 2rem;
    margin-top: 0.25rem;
}
</style>
