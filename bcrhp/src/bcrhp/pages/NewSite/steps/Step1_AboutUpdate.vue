<script setup lang="ts">
import FieldSet from 'primevue/fieldset';
import { EditMode } from '@/bcrhp/pages/NewSite/constants.ts';
import { type Ref, inject, computed, onMounted, ref } from 'vue';
import ResourceWidget from '@/arches_component_lab/widgets/ResourceInstanceSelectWidget/ResourceInstanceSelectWidget.vue';
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
        placeholder: 'Select site to updated',
        defaultValue: '',
    },
    widget: {
        widgetid: '',
        component: '',
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
        <ResourceWidget
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
            <p>
                This function is used to update or edit current site records.
                Current site record information is pre-filled in the system; to
                change this information you can either remove information or add
                to the current record.
            </p>
            <p>
                Before you begin, review the current site record on the BC
                Register of Historic Places by conducting the searches outlined
                below on the
                <a
                    href="/bcrhp/search"
                    target="bcrhp_search"
                    >Search Page on BCRHP</a
                >
                . Consult the Consult the
                <a
                    href="https://www2.gov.bc.ca/assets/gov/british-columbians-our-governments/our-history/historic-places/documents/20240719_how_to_search_bcrhp_final.pdf"
                    target="how_to_guide"
                    >How to Search PDF Guide</a
                >
                as needed.
            </p>
            <ul class="bullet-list ml-4">
                <li>Enter the site’s name in the Find a resource search bar</li>
                <li>
                    Enter the site’s address in the map Find an address search
                    bar
                </li>
            </ul>
        </div>

        <h3 class="mb-2 font-bold mt-4">Submission Requirements</h3>

        <ul class="bullet-list ml-4">
            <li>
                For updates to formal recognition information, ensure you have
                the following details:
                <ul>
                    <li>
                        Designation or Recognition Start Date-the date the site
                        was formally recognized by Bylaw, Council Resolution,
                        Order in Council, etc.
                    </li>
                    <li>
                        Legislative Act - legislation that the site is formally
                        recognized under.
                    </li>
                    <li>
                        Reference Number-Enter how the decision was enacted and
                        the corresponding reference number if applicable (e.g.
                        Bylaw 12-983)
                    </li>
                    <li>
                        Do not remove previous recognition (unless it is no
                        longer accurate), add new recognition or designation
                        statuses as necessary.
                    </li>
                </ul>
            </li>
            <li>
                Required documents for Step 10:
                <ul class="bullet-list ml-4 mt-2">
                    <li>Copy of Bylaw, Resolution, or Meeting Minutes</li>
                </ul>
            </li>
        </ul>
        <div class="mt-4">
            <span class="red">*</span>The system does not have a save for later
            or draft function, so it is important to have all information ready
            before starting.
        </div>
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
