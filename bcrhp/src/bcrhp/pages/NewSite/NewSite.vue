<script setup lang="ts">
import WorkflowStepper from '@/bcrhp/components/WorkflowStepper/WorkflowStepper.vue';
import {
    EditMode,
    type StepConfig,
} from '@/bcrhp/components/WorkflowStepper/components/types.ts';
import type { ErrorMessage } from '@/bcrhp/types.ts';
import NewSiteStep1 from '@/bcrhp/pages/NewSite/steps/Step1_About.vue';
import SiteAddress from '@/bcrhp/pages/NewSite/steps/Step2_SiteAddress.vue';
import SpatialLocation from '@/bcrhp/pages/NewSite/steps/Step3_SpatialLocation.vue';
import SiteNames from '@/bcrhp/pages/NewSite/steps/Step4_SiteNames.vue';
import RecognitionDetails from '@/bcrhp/pages/NewSite/steps/Step5_RecognitionDetails.vue';
import SOS from '@/bcrhp/pages/NewSite/steps/Step6_SOS.vue';
import SiteImages from '@/bcrhp/pages/NewSite/steps/Step7_SiteImages.vue';
import SiteClassification from '@/bcrhp/pages/NewSite/steps/Step8_SiteClassification.vue';
import SiteDetails from '@/bcrhp/pages/NewSite/steps/Step9_SiteDetails.vue';
import SupportingDocuments from '@/bcrhp/pages/NewSite/steps/Step10_SupportingDocuments.vue';
import ReviewSubmission from '@/bcrhp/pages/NewSite/steps/Step11_ReviewSubmission.vue';
import {
    getBlankHeritageSite,
    getHeritageSite,
    submitHeritageSite,
} from '@/bcrhp/api.ts';
import {
    getHeritageSite as getHeritageSiteStatic,
    type HeritageSiteType,
} from '@/bcrhp/schemas/heritage_site.ts';
import { ref, type Ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const OPTIONAL_STEP_DESCRIPTION =
    'Although this Step is not required to complete a submission, if you complete any portion of this Step, you must fully complete all required fields for this Step. Refer to the manual for detailed instructions and field definitions.';

const steps: StepConfig[] = [
    {
        value: 1,
        label: 'Submission Information',
        component: NewSiteStep1,
    },
    {
        value: 2,
        label: 'Site Location',
        heading: 'Site Location',
        required: true,
        component: SiteAddress,
    },
    {
        value: 3,
        label: 'Spatial Location',
        heading: 'Spatial Location',
        required: true,
        component: SpatialLocation,
    },
    {
        value: 4,
        label: 'Site Names',
        heading: 'Heritage Site Name(s)',
        required: true,
        component: SiteNames,
    },
    {
        value: 5,
        label: 'Official Recognition Details',
        heading: 'Official Recognition Details',
        required: true,
        component: RecognitionDetails,
    },
    {
        value: 6,
        label: 'Statement of Significance',
        heading: 'Statement of Significance',
        description: OPTIONAL_STEP_DESCRIPTION,
        component: SOS,
    },
    {
        value: 7,
        label: 'Images',
        heading: 'Images',
        description:
            'Upload 1-10 images for the historic site. Drag and drop 1 image at a time, filling the form out for each photo. Hit save after each completed entry. File types must be jpg/jpeg with a max file size of 2MB. Do not include illustrations, plans, etc. in this step, save them for Step 10: Supporting Documents section.',
        component: SiteImages,
    },
    {
        value: 8,
        label: 'Site Classification',
        heading: 'Site Classification',
        description: OPTIONAL_STEP_DESCRIPTION,
        component: SiteClassification,
    },
    {
        value: 9,
        label: 'Site Details',
        heading: 'Site Details',
        description: OPTIONAL_STEP_DESCRIPTION,
        component: SiteDetails,
    },
    {
        value: 10,
        label: 'Supporting Documents',
        heading: 'Supporting Documents',
        required: true,
        component: SupportingDocuments,
    },
    {
        value: 11,
        label: 'Review Submission',
        heading: 'Review Submission',
        component: ReviewSubmission,
    },
];

const parseError = (error: unknown): ErrorMessage[] => {
    const payload = (error as any)?.response?.data || error;
    const type = payload?.type || 'Validation Error';
    const messageStr = payload?.message || '';
    const errorMatches = [
        ...String(messageStr).matchAll(
            /'([^']+)'\s*:\s*\[ErrorDetail\(string=".*?\s*-\s*(.*?)",/g,
        ),
    ];

    if (errorMatches.length > 0) {
        return errorMatches.map((match) => ({
            type,
            error: match[1].replace('_', ' ').toUpperCase(),
            message: match[2],
        }));
    }

    return [
        {
            type,
            error: payload?.error || 'Submission Failed',
            message:
                typeof messageStr === 'string'
                    ? messageStr
                    : 'Please review your inputs.',
        },
    ];
};

const getExisting = async (id: string) => {
    return getHeritageSite(id) as Promise<HeritageSiteType>;
};

const getBlank = async () => {
    return getBlankHeritageSite() as Promise<HeritageSiteType>;
};

const submit = async (data: unknown) => {
    return submitHeritageSite(
        data as HeritageSiteType,
    ) as Promise<HeritageSiteType>;
};
const editMode: Ref<EditMode> = ref(
    route.name === 'updateSite' ? EditMode.Edit : EditMode.Add,
);

const heritageSite: Ref<HeritageSiteType> = ref(getHeritageSiteStatic());
</script>

<template>
    <WorkflowStepper
        v-model:data="heritageSite"
        title="Submit New Heritage Property"
        data-provide-key="heritageSite"
        :steps="steps"
        :edit-mode="editMode"
        :get-blank="getBlank"
        :get-existing="getExisting"
        :submit="submit"
        :parse-error="parseError"
    />
</template>
