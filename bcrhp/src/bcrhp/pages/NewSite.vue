<script setup lang="ts">
import { computed, ref, provide, onMounted } from 'vue';
import Stepper from 'primevue/stepper';
import Step from 'primevue/step';
import StepPanel from 'primevue/steppanel';
import StepList from 'primevue/steplist';
import StepPanels from 'primevue/steppanels';
import StepperNavigation from '@/bcgov_arches_common/components/stepper/StepperNavigation.vue';

import Panel from 'primevue/panel';

import type { Ref } from 'vue';
import type { StepperProps } from 'primevue/stepper';
import type { StepperState } from 'primevue/stepper';

import NewSiteStep1 from './steps/Step1_About.vue';
import SiteAddress from './steps/Step2_SiteAddress.vue';
import SpatialLocation from './steps/Step3_SpatialLocation.vue';
import SiteNames from './steps/Step4_SiteNames.vue';
import RecognitionDetails from './steps/Step5_RecognitionDetails.vue';
import SOS from './steps/Step6_SOS.vue';
import SiteImages from './steps/Step7_SiteImages.vue';
import SiteClassification from './steps/Step8_SiteClassification.vue';
import SiteDetails from './steps/Step9_SiteDetails.vue';
import SupportingDocuments from './steps/Step10_SupportingDocuments.vue';
import ReviewSubmission from './steps/Step11_ReviewSubmission.vue';

import { getHeritageSite } from '@/bcrhp/schema/HeritageSiteSchema.ts';
import { HeritageSite } from '@/bcrhp/schema/HeritageSiteSchema.ts';

const activateNextStep = () => {
    myStepper.value.d_value++;
};

const activatePreviousStep = () => {
    myStepper.value.d_value--;
};

function activateStep(step: number) {
    if (step > lastStep && !isValid(lastStep)) {
        myStepper.value.d_value = lastStep;
    } else {
        lastStep = step;
    }
}

const isValid = (step: number) => {
    let stepValid = true;
    if (typeof steps[step - 1]?.value?.isValid === 'function') {
        stepValid = steps[step - 1]?.value?.isValid();
    }
    if (step === steps.length) {
        submitted.value = true;
    }
    return stepValid;
};

const printDetails = () => {
    console.log('printDetails');
};
const stepperProps: Ref<StepperProps | null> = ref(null);
const stepperState: Ref<StepperState | null> = ref(null);
const myStepper = ref();
const step1 = ref();
const step2 = ref();
const step3 = ref();
const step4 = ref();
const step5 = ref();
const step6 = ref();
const step7 = ref();
const step8 = ref();
const step9 = ref();
const step10 = ref();
const step11 = ref();
const step12 = ref();
const steps: Ref[] = [];
let lastStep = 1;
const currentStep = computed(() => {
    return myStepper.value?.d_value;
});
const submitted = ref(false);
const heritageSite: Ref<typeof HeritageSite> = ref(getHeritageSite());

provide('heritageSite', heritageSite);

onMounted(() => {
    steps.push(
        step1,
        step2,
        step3,
        step4,
        step5,
        step6,
        step7,
        step8,
        step9,
        step10,
        step11,
        step12,
    );
});

const nextLabel = computed(() => {
    if (currentStep.value === steps.length) return 'Print';
    return currentStep.value < steps.length - 1 ? 'Next' : 'Submit';
});

const showPrevious = computed(() => {
    return !(currentStep.value === steps.length || currentStep.value === 1);
});
const showDebug = ref(false);
</script>

<template>
    <div
        id="debug-div"
        :v-show="showDebug"
        class="debug-step"
        :class="{ 'show-debug': showDebug }"
    >
        {{ JSON.stringify(heritageSite) }}
    </div>
    <i
        style="margin-top: 30px"
        class="fa fa-eye-slash debug-toggle"
        @click="showDebug = !showDebug"
    ></i>
    <Panel class="full-height">
        <div style="display: none">Step: {{ currentStep }}</div>
        <Stepper
            ref="myStepper"
            :state="stepperState"
            :props="stepperProps"
            :value="1"
            linear
            @update:value="activateStep"
        >
            <div class="bcgov-stepper">
                <div class="bcgov-vertical-steps">
                    <StepList>
                        <Step :value="1">Submission Information</Step>
                        <Step :value="2">Site Location</Step>
                        <Step :value="3">Spatial Location</Step>
                        <Step :value="4">Site Names</Step>
                        <Step :value="5">Official Recognition Details</Step>
                        <Step :value="6">Statement of Significance</Step>
                        <Step :value="7">Images</Step>
                        <Step :value="8">Site Classification</Step>
                        <Step :value="9">Site Details</Step>
                        <Step :value="10">Supporting Documents</Step>
                        <Step :value="11">Review Submission</Step>
                        <Step :value="12">Submission Complete</Step>
                    </StepList>
                </div>
                <div class="bcgov-vertical-step-panels">
                    <h1>Submit New Heritage Property</h1>
                    <p v-if="currentStep === 1">
                        This form is for local governments and regional
                        districts to submit a notice of new heritage property to
                        the BC Register of Historic Places
                    </p>
                    <StepPanels>
                        <StepPanel :value="1">
                            <NewSiteStep1 ref="step1"></NewSiteStep1>
                            <StepperNavigation
                                :step-number="currentStep"
                                :show-previous="false"
                                :validate-fn="isValid"
                                @next-click="activateNextStep"
                            ></StepperNavigation>
                        </StepPanel>
                        <StepPanel :value="2">
                            <h3>Site Location</h3>
                            <StepperNavigation
                                :step-number="currentStep"
                                :validate-fn="isValid"
                                :show-previous="showPrevious"
                                :next-label="nextLabel"
                                @next-click="activateNextStep"
                                @previous-click="activatePreviousStep"
                            >
                            </StepperNavigation>
                            <SiteAddress ref="step2"></SiteAddress>
                            <StepperNavigation
                                :step-number="currentStep"
                                :validate-fn="isValid"
                                @next-click="activateNextStep"
                                @previous-click="activatePreviousStep"
                            ></StepperNavigation>
                        </StepPanel>
                        <StepPanel :value="3">
                            <h3 class="heading-margin-bottom">
                                Spatial Location
                            </h3>
                            <StepperNavigation
                                :step-number="currentStep"
                                :validate-fn="isValid"
                                :show-previous="showPrevious"
                                :next-label="nextLabel"
                                @next-click="activateNextStep"
                                @previous-click="activatePreviousStep"
                            >
                            </StepperNavigation>
                            <SpatialLocation ref="step3"></SpatialLocation>
                            <StepperNavigation
                                :step-number="currentStep"
                                :validate-fn="isValid"
                                @next-click="activateNextStep"
                                @previous-click="activatePreviousStep"
                            ></StepperNavigation>
                        </StepPanel>
                        <StepPanel :value="4">
                            <h3>Heritage Site Name(s)</h3>
                            <StepperNavigation
                                :step-number="currentStep"
                                :validate-fn="isValid"
                                :show-previous="showPrevious"
                                :next-label="nextLabel"
                                @next-click="activateNextStep"
                                @previous-click="activatePreviousStep"
                            ></StepperNavigation>
                            <SiteNames ref="step4"></SiteNames>
                            <StepperNavigation
                                :step-number="currentStep"
                                :validate-fn="isValid"
                                @next-click="activateNextStep"
                                @previous-click="activatePreviousStep"
                            >
                            </StepperNavigation>
                        </StepPanel>
                        <StepPanel :value="5">
                            <h3>Official Recognition Details</h3>
                            <StepperNavigation
                                :step-number="currentStep"
                                :validate-fn="isValid"
                                :show-previous="showPrevious"
                                :next-label="nextLabel"
                                @next-click="activateNextStep"
                                @previous-click="activatePreviousStep"
                            ></StepperNavigation>
                            <RecognitionDetails
                                ref="step5"
                            ></RecognitionDetails>
                            <StepperNavigation
                                :step-number="currentStep"
                                :validate-fn="isValid"
                                @next-click="activateNextStep"
                                @previous-click="activatePreviousStep"
                            >
                            </StepperNavigation>
                        </StepPanel>
                        <StepPanel :value="6">
                            <h3>Statement of Significance</h3>
                            <StepperNavigation
                                :step-number="currentStep"
                                :validate-fn="isValid"
                                :show-previous="showPrevious"
                                :next-label="nextLabel"
                                @next-click="activateNextStep"
                                @previous-click="activatePreviousStep"
                            ></StepperNavigation>
                            <SOS ref="step6"></SOS>
                            <StepperNavigation
                                :step-number="currentStep"
                                :validate-fn="isValid"
                                next-label="Next"
                                @next-click="activateNextStep"
                                @previous-click="activatePreviousStep"
                            >
                            </StepperNavigation>
                        </StepPanel>
                        <StepPanel :value="7">
                            <h3>Images</h3>
                            <StepperNavigation
                                :step-number="currentStep"
                                :validate-fn="isValid"
                                :show-previous="showPrevious"
                                :next-label="nextLabel"
                                @next-click="activateNextStep"
                                @previous-click="activatePreviousStep"
                            ></StepperNavigation>
                            <p>
                                Upload 1-10 images for the historic site. File
                                types must be jpg/jpeg with a max file size of
                                2MB. Include illustrations, plans, etc. in the
                                Supporting Documents section
                            </p>
                            <SiteImages ref="step7"></SiteImages>
                            <StepperNavigation
                                :step-number="currentStep"
                                :validate-fn="isValid"
                                next-label="Next"
                                @next-click="activateNextStep"
                                @previous-click="activatePreviousStep"
                            >
                            </StepperNavigation>
                        </StepPanel>
                        <StepPanel :value="8">
                            <h3>Site Classification</h3>
                            <StepperNavigation
                                :step-number="currentStep"
                                :validate-fn="isValid"
                                :show-previous="showPrevious"
                                :next-label="nextLabel"
                                @next-click="activateNextStep"
                                @previous-click="activatePreviousStep"
                            ></StepperNavigation>
                            <SiteClassification
                                ref="step8"
                            ></SiteClassification>
                            <StepperNavigation
                                :step-number="currentStep"
                                :validate-fn="isValid"
                                next-label="Next"
                                @next-click="activateNextStep"
                                @previous-click="activatePreviousStep"
                            >
                            </StepperNavigation>
                        </StepPanel>
                        <StepPanel :value="9">
                            <h3>Site Details</h3>
                            <StepperNavigation
                                :step-number="currentStep"
                                :validate-fn="isValid"
                                :show-previous="showPrevious"
                                :next-label="nextLabel"
                                @next-click="activateNextStep"
                                @previous-click="activatePreviousStep"
                            ></StepperNavigation>
                            <SiteDetails ref="step9"></SiteDetails>
                            <StepperNavigation
                                :step-number="currentStep"
                                :validate-fn="isValid"
                                next-label="Next"
                                @next-click="activateNextStep"
                                @previous-click="activatePreviousStep"
                            >
                            </StepperNavigation>
                        </StepPanel>
                        <StepPanel :value="10">
                            <h3>Supporting Documents</h3>
                            <StepperNavigation
                                :step-number="currentStep"
                                :validate-fn="isValid"
                                :show-previous="showPrevious"
                                :next-label="nextLabel"
                                @next-click="activateNextStep"
                                @previous-click="activatePreviousStep"
                            ></StepperNavigation>
                            <SupportingDocuments
                                ref="step10"
                            ></SupportingDocuments>
                            <StepperNavigation
                                :step-number="currentStep"
                                :validate-fn="isValid"
                                next-label="Next"
                                @next-click="activateNextStep"
                                @previous-click="activatePreviousStep"
                            >
                            </StepperNavigation>
                        </StepPanel>
                        <StepPanel :value="11">
                            <h3>Review Submission</h3>
                            <StepperNavigation
                                :step-number="currentStep"
                                :validate-fn="isValid"
                                :show-previous="showPrevious"
                                :next-label="nextLabel"
                                @next-click="activateNextStep"
                                @previous-click="activatePreviousStep"
                            ></StepperNavigation>
                            <ReviewSubmission ref="step11"></ReviewSubmission>
                            <StepperNavigation
                                :step-number="currentStep"
                                :validate-fn="isValid"
                                next-label="Submit"
                                @next-click="activateNextStep"
                                @previous-click="activatePreviousStep"
                            >
                            </StepperNavigation>
                        </StepPanel>
                        <StepPanel :value="12">
                            <h3>Submission Complete</h3>
                            <StepperNavigation
                                :step-number="currentStep"
                                :validate-fn="isValid"
                                :show-previous="false"
                                next-label="Print"
                                @next-click="printDetails"
                            ></StepperNavigation>
                        </StepPanel>
                    </StepPanels>
                </div>
            </div>
        </Stepper>
    </Panel>
</template>
<style>
@import url('@/bcgov_arches_common/css/arches_common.css');
</style>
<style scoped>
.dashboard-card {
    font-size: 1.1rem;
    margin: 1rem;
    max-width: 33%;
}

.p-card-content {
    font-size: 1rem;
}

li {
    color: var(--p-primary-color);
}

.step-title {
    margin-bottom: 1rem;
    font-size: 21px;
    font-weight: bold;
    line-height: inherit;
    color: #333;
}

.debug-step {
    max-width: 80%;
    margin-top: 100px;
    display: none;
    position: absolute;
    bottom: 10px;
    word-wrap: anywhere;
    color: darkgray;
}

.show-debug {
    display: inline-block !important;
}

.debug-toggle {
    position: absolute;
    top: 0;
    left: 0.5rem;
    color: white;
    z-index: 9000;
}
</style>
