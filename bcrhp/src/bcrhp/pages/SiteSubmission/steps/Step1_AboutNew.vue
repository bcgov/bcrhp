<script setup lang="ts">
import FieldSet from 'primevue/fieldset';
const isValid = () => {
    return true;
};

import type { Card, Node } from '@/arches_component_lab/types.ts';

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

defineExpose({ isValid });
</script>
<template>
    <FieldSet legend="Before you begin">
        <div class="mb-2">
            <ul class="bullet-list ml-4">
                <li>
                    Have you confirmed that the proposed site is not listed on
                    the BC Register of Historic Places? Use the Search page to
                    check the map.
                </li>
                <li>
                    Do you have
                    <strong>all required information ready</strong> to complete
                    the form? The form cannot be saved as a draft.
                </li>
            </ul>
        </div>

        <h3 class="mb-2 font-bold mt-4">Submission Requirements</h3>

        <ul class="bullet-list ml-4">
            <li>Site name (use address if no name has been given)</li>
            <li>Civic address or location description</li>
            <li>Site boundary (PID, Shapefile, KML, or site map)</li>
            <li>Designation and recognition information and dates</li>
            <li>
                Supporting bylaw, resolution, meeting minutes, or other relevant
                documentation
            </li>
        </ul>

        <h3 class="mb-2 font-bold mt-4">Documentation Standards</h3>

        <ul class="bullet-list ml-4">
            <li>Statement of Significance</li>
            <li>Photographs</li>
        </ul>
        Statements of Significance and photographs are standard components of BC
        Register of Historic Places records. If these components are not
        available at the time of submission, they may be added to the record in
        a future update to complete the record.

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
h3 {
    font-size: 2rem;
}
</style>
