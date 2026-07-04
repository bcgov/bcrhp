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
        description: $gettext('Submit a new Heritage Property'),
        icon: 'fa fa-square-plus',
        class: 'dashboard-card ipa',
        routeName: routeNames.newSite,
    },
    // {
    //     label: $gettext('Update Heritage Property'),
    //     description: $gettext('Update an existing heritage property'),
    //     icon: 'fa fa-pencil',
    //     class: 'dashboard-card ipa',
    //     routeName: routeNames.updateSite,
    // },
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
    <Panel
        header="Workflows"
        class="full-height"
    >
        <Fluid>
            <div class="dashboard-div-flex">
                <Card
                    v-for="item in workflowItems"
                    :key="item.routeName"
                    :label="$gettext(item.label)"
                    :description="$gettext(item.description)"
                    :subtitle="$gettext(item.description)"
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
</style>
