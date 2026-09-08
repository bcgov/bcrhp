<script setup lang="ts">
import FieldSet from 'primevue/fieldset';
import { type Ref, inject, computed, onMounted } from 'vue';
import GenericWidget from '@/arches_component_lab/generics/GenericWidget/GenericWidget.vue';
import { EDIT } from '@/arches_component_lab/widgets/constants.ts';
import type { ResourceInstanceValue } from '@/arches_component_lab/datatypes/resource-instance/types.ts';
import type { ResourceInstanceCardXNodeXWidgetData } from '@/arches_component_lab/datatypes/resource-instance/types.ts';

import type { Card, Node } from '@/arches_component_lab/types.ts';
import type { HeritageSiteType } from '@/bcrhp/schemas/heritage_site.ts';
import { getHeritageSite } from '@/bcrhp/api.ts';
import { useWorkflowStep } from '@/bcrhp/components/WorkflowStepper/components/useWorkflowStep.ts';

const { working } = useWorkflowStep();
const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite');

const isValid = () => {
    return !!heritageSite?.value?.resourceinstanceid;
};

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
        placeholder: 'Search and select site to update',
        defaultValue: '',
    },
    widget: {
        widgetid: '',
        component:
            'arches_component_lab/widgets/ResourceInstanceSelectWidget/ResourceInstanceSelectWidget.vue',
    },
};

const setResourceId = async (site: ResourceInstanceValue) => {
    if (!site?.node_value && heritageSite?.value) {
        heritageSite.value = initialValue;
    } else if (site?.node_value && heritageSite?.value) {
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

const siteURL = computed(() => {
    const id = heritageSite?.value?.resourceinstanceid;
    return id ? `/bcrhp/search?id=${id}` : '';
});
let initialValue: HeritageSiteType = null;

onMounted(() => {
    initialValue = heritageSite?.value;
});

defineExpose({ isValid });
</script>
<template>
    <FieldSet legend="Before you begin">
        <GenericWidget
            :mode="EDIT"
            :aliased-node-data="null"
            graph-slug="heritage_site"
            node-alias="municipal_sites"
            :card-x-node-x-widget-data="node_data"
            @update:value="setResourceId($event)"
        />
        <FieldSet
            v-if="siteURL"
            legend="Selected Site"
        >
            <div style="margin: 1rem">
                <a
                    :href="siteURL"
                    target="_blank"
                    ><span v-html="heritageSite?.descriptors?.en?.name"></span>
                </a>
                <div v-html="heritageSite?.descriptors?.en?.description"></div>
            </div>
        </FieldSet>
        <div class="mb-2">
            <ul class="bullet-list ml-4">
                <li>
                    Have all required information ready to complete the form.
                    The form cannot be saved as a draft.
                </li>
                <li>
                    Don’t see the heritage site in the list? Go to the
                    <a
                        href="/bcrhp/search"
                        target="bcrhp_search"
                        >Search page</a
                    >
                    to verify the site name and/or Borden number on the existing
                    record.
                </li>
            </ul>
        </div>

        <h3 class="mb-2 font-bold mt-4">Submission Requirements</h3>
        Some updates have mandatory submission requirements. When a heritage
        site receives a new designation or recognition status, the submission
        must include:
        <ul class="bullet-list ml-4">
            <li>Designation and recognition information and dates</li>
            <li>Supporting bylaw, resolution, or meeting minutes</li>
        </ul>

        <h3 class="mb-2 font-bold mt-4">Documentation Standards</h3>

        The following are standard components of BC Register of Historic Places
        records:
        <ul class="bullet-list ml-4">
            <li>Statement of Significance</li>
            <li>Photographs</li>
        </ul>
        If these components are not available at the time of submission, they
        should be submitted in a future update to complete the record.

        <h3 class="mb-2 font-bold mt-4">Additional Information</h3>
        <strong
            >Completing optional information fields improves the discoverability
            and public understanding of historic places. More detailed records
            support research, heritage planning, and public access to
            comprehensive information.</strong
        >
    </FieldSet>
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

<style scoped>
h3 {
    font-size: 2rem;
}
</style>
