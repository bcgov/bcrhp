<script setup lang="ts">
import FieldSet from 'primevue/fieldset';
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
    <FieldSet legend="Before you begin">
        <div v-if="EditMode.Edit === editMode">
            <ResourceWidget
                :mode="EDIT"
                :aliased-node-data="null"
                graph-slug="heritage_site"
                node-alias="municipal_sites"
                :card-x-node-x-widget-data="node_data"
                @update:value="setResourceId($event)"
            />
        </div>
        <div v-else>Adding</div>
        <div class="mb-2">
            <p>
                Confirm the site does not already exist on the BC Register of
                Historic Places by conducting the searches outlined below on the
                <a href="https://apps.nrs.gov.bc.ca/bcrhp/index.htm"
                    >Search Page on BCRHP.</a
                >
                Consult the
                <a
                    href="https://www2.gov.bc.ca/assets/gov/british-columbians-our-governments/our-history/historic-places/documents/20240719_how_to_search_bcrhp_final.pdf"
                    >How to Search PDF Guide</a
                >
                as needed.
            </p>
        </div>

        <ul class="bullet-list ml-4">
            <li>
                Enter the site’s name in the <i>Find a resource</i> search bar
            </li>
            <li>
                Enter the site’s address in the map
                <i>Find an address</i> search bar
            </li>
            <li>
                Zoom into map location of proposed site and verify there is no
                site
            </li>
        </ul>

        <h3 class="mb-2 font-bold mt-4">Submission Requirements</h3>

        <ul class="bullet-list ml-4">
            <li>
                Steps 2-5 and 10 are mandatory to complete the basic data
                requirements for a notification.
            </li>
            <li>
                Information required for Steps 2-5:
                <ul class="bullet-list ml-4 mt-2">
                    <li>Site name (use address if no name has been given)</li>
                    <li>Street address of site</li>
                    <li>
                        Mapping information, you must have one of the following:
                        <ul class="bullet-list-nested ml-4 mt-1">
                            <li>PID</li>
                            <li>Shapefile or KML</li>
                        </ul>
                    </li>
                    <li>
                        Formal recognition information, which includes the
                        following:
                        <ul class="bullet-list-nested ml-4 mt-1">
                            <li>
                                Designation or Recognition Start Date-the date
                                the site was formally recognized by Bylaw,
                                Council Resolution, Order in Council, etc.
                            </li>
                            <li>
                                Legislative Act- legislation that the site is
                                formally recognized under.
                            </li>
                            <li>
                                Reference Number-Enter how the decision was
                                enacted and the corresponding reference number
                                if applicable (e.g. Bylaw 12-983)
                            </li>
                        </ul>
                    </li>
                    <li>
                        Required documents for Step 10:
                        <ul class="bullet-list-nested ml-4 mt-1">
                            <li>
                                Copy of Bylaw, Resolution, or Meeting Minutes
                            </li>
                            <li>
                                GIS files or Site Map if no PID or Shapefile/KML
                                is provided in Step 3
                            </li>
                        </ul>
                    </li>
                </ul>
            </li>
        </ul>
        <div class="mt-4">
            <span class="red">*</span>The system does not have a save for later
            or draft function, so it is important to have all information ready
            before starting. It is highly recommended to complete the remaining
            steps if information is available to improve the historic site’s
            search ability on the register.
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
