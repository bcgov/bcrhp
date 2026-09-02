<script setup lang="ts">
import { ref } from 'vue';
import Panel from 'primevue/panel';
import Fluid from 'primevue/fluid';
import { useGettext } from 'vue3-gettext';
import Card from '@/bcgov_arches_common/components/card/CenterCard.vue';

import { routeNames } from '@/bcrhp/routes.ts';

const { $gettext } = useGettext();
const workflowItems = ref([
    {
        label: $gettext('Submit Heritage Property'),
        description: $gettext('Submit a new heritage property'),
        subtitle: $gettext('Add a site not yet listed'),
        icon: 'fa fa-square-plus',
        class: 'dashboard-card ipa',
        routeName: routeNames.newSite,
    },
    {
        label: $gettext('Update Heritage Property'),
        description: $gettext('Update an existing heritage property'),
        subtitle: $gettext('Revise information for a listed site'),
        icon: 'fa fa-pencil',
        class: 'dashboard-card ipa',
        routeName: routeNames.updateSite,
    },
    // {
    //     label: $gettext('Legacy Heritage Property'),
    //     description: $gettext('Deregister a Site'),
    //     icon: 'fa fa-rectangle-xmark',
    //     class: 'dashboard-card ipa',
    //     routeName: routeNames.updateSite,
    // },
]);
</script>
<template>
    <Panel class="full-height">
        <div>
            Submit a notice of heritage property for inclusion on the BC
            Register of Historic Places by selecting one of the options below.
        </div>
        <div>
            For help completing a submission, refer to the
            <a
                class="manual-link"
                href="https://www2.gov.bc.ca/assets/gov/british-columbians-our-governments/our-history/historic-places/documents/lg_submission_guide.pdf"
                target="manual"
                >Local Government Submission Manual</a
            >
            or contact the Heritage Branch.
        </div>
        <Fluid>
            <div class="dashboard-div-flex">
                <Card
                    v-for="item in workflowItems"
                    :key="item.routeName"
                    :label="$gettext(item.label)"
                    :description="$gettext(item.description)"
                    :subtitle="$gettext(item.subtitle)"
                    :icon="item.icon"
                    :class="item.class"
                    :route="{ name: item.routeName }"
                />
            </div>
        </Fluid>
    </Panel>
</template>

<style scoped>
.dashboard-div-flex {
    display: flex;
    flex-wrap: wrap;
}
a.manual-link {
    color: #337ab7;
}
</style>
