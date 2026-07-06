<script setup lang="ts">
import { computed, inject, type Ref } from 'vue';
import Message from 'primevue/message';
import type { HeritageSiteType } from '@/bcrhp/schemas/heritage_site.ts';
import { currentDateValue } from '@/bcrhp/utils.ts';
import Step2_SiteAddressView from '@/bcrhp/pages/NewSite/steps/Step2_SiteAddressView.vue';
import Step4_SiteNamesView from '@/bcrhp/pages/NewSite/steps/Step4_SiteNamesView.vue';
import Step5_RecognitionDetailsView from '@/bcrhp/pages/NewSite/steps/Step5_RecognitionDetailsView.vue';
import Step6_SOSView from '@/bcrhp/pages/NewSite/steps/Step6_SOSView.vue';
import Step7_SiteImagesView from '@/bcrhp/pages/NewSite/steps/Step7_SiteImagesView.vue';
import Step8_SiteClassificationView from '@/bcrhp/pages/NewSite/steps/Step8_SiteClassificationView.vue';
import Step9_SiteDetailsView from '@/bcrhp/pages/NewSite/steps/Step9_SiteDetailsView.vue';
import Step10_SupportingDocumentsView from '@/bcrhp/pages/NewSite/steps/Step10_SupportingDocumentsView.vue';
import { useWorkflowStep } from '@/bcrhp/components/WorkflowStepper/components/useWorkflowStep.ts';
import Step3_SpatialLocationView from '@/bcrhp/pages/NewSite/steps/Step3_SpatialLocationView.vue';

const heritageSite = inject<Ref<HeritageSiteType>>('heritageSite')!;
const today = currentDateValue();
const { submissionErrors, submissionComplete } = useWorkflowStep();

const isValid = function () {
    //add the date to submission
    const adminList = heritageSite.value?.aliased_data?.site_record_admin;

    if (adminList && adminList.length === 0) {
        adminList.push({
            aliased_data: {
                date_submitted_to_crhp: {
                    ...today,
                    display_value: today.node_value,
                },
            },
        } as any);
    }

    return true;
};

const formSubmitted = computed(
    () =>
        !!heritageSite.value?.aliased_data.bc_right.aliased_data
            ?.registration_status?.node_value,
);

defineExpose({ isValid });
</script>

<template>
    <div class="step-title">Submission Details</div>

    <div
        v-if="!formSubmitted"
        class="submission-notice"
    >
        By clicking “Submit,” you are providing notice to the Heritage Minister
        as required under section 595 of the Local Government Act and section
        602(1) of the Vancouver Charter.
    </div>
    <div
        v-else
        class="submission-notice"
    >
        You have successfully provided notice to the Heritage Minister as
        required under section 595 of the Local Government Act and section
        602(1) of the Vancouver Charter. Please hit “Print” if you would like to
        save a copy of your submission.
    </div>
    <div
        v-if="formSubmitted"
        class="row"
    >
        <dt>Submission Date:&nbsp;</dt>
        <dd>
            {{
                heritageSite.aliased_data?.site_record_admin?.[0]?.aliased_data
                    ?.date_submitted_to_crhp?.display_value || today.node_value
            }}
        </dd>
    </div>

    <section
        v-if="submissionErrors && submissionErrors.length"
        class="mt-4 mb-6"
    >
        <h3 class="text-lg font-semibold text-red-600 mb-2">
            Submission Blocked: {{ submissionErrors.length }} Issue{{
                submissionErrors.length > 1 ? 's' : ''
            }}
            Found
        </h3>

        <p class="mb-4 text-red-600">Submission Error</p>

        <div class="flex flex-col gap-3">
            <Message
                v-for="(error, index) in submissionErrors"
                :key="index"
                severity="error"
                :closable="false"
            >
                <div class="font-bold mb-1">
                    {{ error.type }}
                </div>
                <div class="text-sm">
                    <span class="font-semibold">{{ error.error }}:</span>
                    {{ error.message }}
                </div>
            </Message>
        </div>
    </section>
    <p v-if="!submissionComplete">
        Please review the entered information prior to submitting the
        application:
    </p>

    <Step2_SiteAddressView />
    <div class="small-map">
        <Step3_SpatialLocationView />
    </div>
    <Step4_SiteNamesView />
    <Step5_RecognitionDetailsView />
    <Step6_SOSView />
    <Step7_SiteImagesView />
    <Step8_SiteClassificationView />
    <Step9_SiteDetailsView />
    <Step10_SupportingDocumentsView />
</template>

<style scoped>
.step-title {
    margin-bottom: 1rem;
    font-size: 21px;
    font-weight: bold;
    line-height: inherit;
    color: #333;
}
.p-margin-top-bottom {
    margin-top: 1.5rem;
    margin-bottom: 1rem;
}
.p-underline-bold {
    text-decoration: underline;
    font-weight: bold;
}
.div-grid-cols {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 0.75rem 1rem;
    align-items: start;
}
.div-grid-cols dt {
    font-weight: bold;
    color: #444;
}
.image-section:not(:first-child) {
    border-top: thin solid #ccc;
    padding-top: 0.25rem;
    margin-top: 0.5rem;
}
dt {
    margin-left: 0.75rem;
}
.submission-notice {
    background-color: white;
    padding: 1rem 4rem 1rem 4rem;
    font-size: 1.4rem;
    border: solid medium darkgray;
    margin: 0 6rem 1rem 6rem;
    border-radius: 1rem;
}
.small-map {
    --map-height: 300px;
    --map-max-height: 300px;
    --map-max-width: 500px;
}
</style>
<style>
fieldset.review-fieldset > legend {
    margin-bottom: 0.5rem;
    font-size: 1.6rem;
    font-weight: 700;
}
fieldset.review-fieldset div[data-node-alias='site_images'] {
    max-height: 150px;
    max-width: 150px;
}
@media screen {
    fieldset.review-fieldset {
        max-width: calc(100vw - 325px);
    }
}
</style>
