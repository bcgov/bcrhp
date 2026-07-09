<script setup lang="ts">
import FieldSet from 'primevue/fieldset';
import Step1_AboutNew from '@/bcrhp/pages/NewSite/steps/Step1_AboutNew.vue';
import Step1_AboutUpdate from '@/bcrhp/pages/NewSite/steps/Step1_AboutUpdate.vue';
import { EditMode } from '@/bcrhp/pages/NewSite/constants.ts';
import { type Ref, inject } from 'vue';
import ResourceWidget from '@/arches_component_lab/widgets/ResourceInstanceSelectWidget/ResourceInstanceSelectWidget.vue';
import { EDIT } from '@/arches_component_lab/widgets/constants.ts';
import type { ResourceInstanceValue } from '@/arches_component_lab/datatypes/resource-instance/types.ts';
const isValid = () => {
    return true;
};
import type { ResourceInstanceCardXNodeXWidgetData } from '@/arches_component_lab/datatypes/resource-instance/types.ts';

import type { Card, Node } from '@/arches_component_lab/types.ts';
import type { HeritageSiteType } from '@/bcrhp/schemas/heritage_site.ts';
import { getHeritageSite } from '@/bcrhp/api.ts';
import { useWorkflowStep } from '@/bcrhp/components/WorkflowStepper/components/useWorkflowStep.ts';

const { editMode, working } = useWorkflowStep();
const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite');
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
const node_data: ResourceInstanceCardXNodeXWidgetData = {
    card: {
        name: '',
        sortorder: 0,
        cardid: '',
        nodegroup_id: '',
        nodes: [],
    },
    id: '',
    label: 'Site',
    sortorder: 0,
    visible: true,
    node: {
        alias: 'municipal_sites',
        config: {},
    } as Node,
    config: {
        placeholder: 'Select site to updated',
        defaultValue: '',
    },
    widget: {
        widgetid: '',
        component: '',
    },
};

const setResourceId = async (site: ResourceInstanceValue) => {
    if (site?.node_value && heritageSite?.value) {
        working.value = true;
        try {
            const siteUUID = site.node_value.resourceId;

            const response = await getHeritageSite(siteUUID);
            heritageSite.value = response as unknown as HeritageSiteType;
            working.value = false;
        } catch (e) {
            console.log(`Unable to get site: ${e}`);
        } finally {
            working.value = false;
        }
    }
};

defineExpose({ isValid });
</script>
<template>
    <Step1_AboutNew v-if="EditMode.Add === editMode" />
    <Step1_AboutUpdate v-else />
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
