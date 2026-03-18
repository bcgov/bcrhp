<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Panel from 'primevue/panel';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { useGettext } from 'vue3-gettext';

import { routeNames } from '@/bcrhp/routes.ts';

const { $gettext } = useGettext();
const router = useRouter();
const targetSiteId = ref('');

const goToEditForm = () => {
    if (targetSiteId.value.trim()) {
        router.push({
            name: routeNames.editSite,
            params: { id: targetSiteId.value.trim() },
        });
    }
};
</script>

<template>
    <Panel
        :header="$gettext('Test Workflow: Update Existing Site')"
        class="full-height"
    >
        <div style="margin-top: 2rem; max-width: 500px">
            <p>
                {{
                    $gettext(
                        'Paste a valid Heritage Site UUID to test the edit flow:',
                    )
                }}
            </p>

            <div style="display: flex; gap: 1rem; margin-top: 1rem">
                <InputText
                    v-model="targetSiteId"
                    style="flex-grow: 1"
                    @keyup.enter="goToEditForm"
                />
                <Button
                    :label="$gettext('Load Site')"
                    icon="pi pi-search"
                    @click="goToEditForm"
                    :disabled="!targetSiteId"
                />
            </div>
        </div>
    </Panel>
</template>

<style scoped>
.full-height {
    height: 100%;
}
</style>
