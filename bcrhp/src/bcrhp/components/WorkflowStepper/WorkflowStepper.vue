<script setup lang="ts">
import { computed, provide, ref } from 'vue';
import type { StepperProps, StepperState } from 'primevue/stepper';
import Stepper from 'primevue/stepper';
import Step from 'primevue/step';
import StepPanel from 'primevue/steppanel';
import StepList from 'primevue/steplist';
import StepPanels from 'primevue/steppanels';
import ProgressSpinner from 'primevue/progressspinner';
import Panel from 'primevue/panel';
import StepperNavigation from '@/bcgov_arches_common/components/Stepper/components/StepperNavigation/StepperNavigation.vue';
import type {
    ErrorMessage,
    StepConfig,
    WorkflowStep,
} from './components/types.ts';
import { EditMode } from './components/types.ts';

interface Props {
    /** Page title shown above the step panels. */
    title: string;
    subTitle?: string;
    /** Ordered step definitions. */
    steps: StepConfig[];
    /**
     * The provide/inject key under which the workflow data object is made
     * available to step components (e.g. 'heritageSite').
     */
    dataProvideKey: string;
    editMode: EditMode;
    /** Returns a blank data object for create mode. */
    getBlank: () => Promise<unknown>;
    /** Returns an existing data object by resource ID. */
    getExisting: (id: string) => Promise<unknown>;
    /**
     * Extracts the resource ID from the current data object.
     * Used when advancing from step 1 in edit mode to fetch the full record.
     * Defaults to reading `(data as any).resourceinstanceid`.
     */
    getIdFromData?: (data: unknown) => string;
    /** Submits the data; resolves with the updated record on success. */
    submit: (data: unknown) => Promise<unknown>;
    /**
     * Converts a caught submission error into a list of ErrorMessage objects.
     * Defaults to a simple generic extraction.
     */
    parseError?: (error: unknown) => ErrorMessage[];
    /**
     * Called when the user presses the action button on the final step after a
     * successful submission. Defaults to window.print().
     */
    onLastStepNext?: () => void;
}

const props = defineProps<Props>();

const defaultParseError = (error: unknown): ErrorMessage[] => {
    const payload = (error as any)?.response?.data || error;
    return [
        {
            type: payload?.type || 'Error',
            error: payload?.error || 'Submission Failed',
            message:
                typeof payload?.message === 'string'
                    ? payload.message
                    : 'Please review your inputs.',
        },
    ];
};

const parseError = props.parseError ?? defaultParseError;
const onLastStepNext = props.onLastStepNext ?? (() => window.print());

const working = ref(false);
const submitting = ref(false);
const submissionErrors = ref<ErrorMessage[]>([]);
const submissionComplete = ref(false);
const data = defineModel<unknown>('data', { required: true });
const showDebug = ref(false);

const editMode = props.editMode;

provide('editMode', editMode);
provide(props.dataProvideKey, data);
provide('workflowSubmissionErrors', submissionErrors);
provide('workflowSubmissionComplete', submissionComplete);
provide('working', working);

// ── Stepper internal state ──────────────────────────────────────────────────

const stepperProps = ref<StepperProps | null>(null);
const stepperState = ref<StepperState | null>(null);
const myStepper = ref();
const stepRefs = ref<(WorkflowStep | null)[]>([]);
const stepStatuses = ref<boolean[]>([]);
let lastStep = 1;

const currentStep = computed<number>(() => myStepper.value?.d_value ?? 1);

const registerStep = (stepValue: number, el: unknown) => {
    stepRefs.value[stepValue - 1] = (el as WorkflowStep | null) ?? null;
};

const getStepRef = (stepValue: number): WorkflowStep | null =>
    stepRefs.value[stepValue - 1] ?? null;

const checkStepValid = (stepValue: number): boolean => {
    const step = getStepRef(stepValue);
    return step && typeof step.isValid === 'function' ? step.isValid() : true;
};

const setCurrentStepValid = (isValid: boolean, stepValue: number) => {
    stepStatuses.value[stepValue - 1] = isValid;
};

const currentStepIsValid = computed(
    () => stepStatuses.value[currentStep.value - 1],
);

// ── Navigation ──────────────────────────────────────────────────────────────

function activateStep(step: number) {
    if (step > lastStep && !checkStepValid(lastStep)) {
        myStepper.value.d_value = lastStep;
    } else {
        lastStep = step;
        setCurrentStepValid(checkStepValid(step), step);
    }
}

const activatePreviousStep = () => {
    const prev = myStepper.value.d_value - 1;
    setCurrentStepValid(checkStepValid(prev), prev);
    myStepper.value.d_value = prev;
};

const doSubmit = async () => {
    submitting.value = true;
    submissionErrors.value = [];
    try {
        data.value = await props.submit(data.value);
        submissionComplete.value = true;
    } catch (error) {
        submissionErrors.value = parseError(error);
    } finally {
        submitting.value = false;
    }
};

const activateNextStep = async () => {
    const current = currentStep.value;
    const total = props.steps.length;

    if (current === total) {
        // Last step: submit (first press) or post-submit action (second press).
        if (submissionComplete.value) {
            onLastStepNext();
        } else {
            await doSubmit();
        }
    } else {
        myStepper.value.d_value++;
        const next = myStepper.value.d_value;
        setCurrentStepValid(checkStepValid(next), next);
    }
};

// ── Labels / visibility ─────────────────────────────────────────────────────

const nextLabel = computed(() => {
    const total = props.steps.length;
    if (currentStep.value === total) {
        return submissionComplete.value ? 'Print' : 'Submit';
    }
    return 'Next';
});

const showPrevious = computed(() => {
    if (currentStep.value === 1) return false;
    if (currentStep.value === props.steps.length && submissionComplete.value)
        return false;
    return true;
});
</script>

<template>
    <div>{{ working }}</div>
    <div>{{ submitting }}</div>
    <div
        v-if="submitting || working"
        class="submit-overlay"
    >
        <ProgressSpinner />
    </div>
    <div
        class="debug-step"
        :class="{ 'show-debug': showDebug }"
    >
        {{ JSON.stringify(data) }}
    </div>
    <i
        class="fa fa-eye-slash debug-toggle"
        @click="showDebug = !showDebug"
    ></i>
    <Panel class="full-height">
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
                        <Step
                            v-for="step in steps"
                            :key="step.value"
                            :value="step.value"
                        >
                            {{ step.label }}
                        </Step>
                    </StepList>
                </div>
                <div class="bcgov-vertical-step-panels">
                    <h1>{{ title }}</h1>
                    <h3 class="site-name">{{ subTitle }}</h3>
                    <StepPanels>
                        <StepperNavigation
                            :step-number="currentStep"
                            :is-valid="currentStepIsValid"
                            :show-previous="showPrevious"
                            :next-label="nextLabel"
                            @next-click="activateNextStep"
                            @previous-click="activatePreviousStep"
                        />
                        <StepPanel
                            v-for="step in steps"
                            :key="step.value"
                            :value="step.value"
                        >
                            <h3
                                v-if="step.heading"
                                class="heading-margin-bottom"
                            >
                                <span
                                    v-if="step.required"
                                    class="red"
                                    >*</span
                                >{{ step.heading }}
                            </h3>
                            <p
                                v-if="step.description"
                                class="step-description"
                            >
                                {{ step.description }}
                            </p>
                            <component
                                :is="step.component"
                                :ref="
                                    (el: unknown) =>
                                        registerStep(step.value, el)
                                "
                                v-bind="step.props ?? {}"
                                @update:step-is-valid="
                                    setCurrentStepValid($event, step.value)
                                "
                            />
                        </StepPanel>
                        <StepperNavigation
                            :step-number="currentStep"
                            :is-valid="currentStepIsValid"
                            :show-previous="showPrevious"
                            :next-label="nextLabel"
                            @next-click="activateNextStep"
                            @previous-click="activatePreviousStep"
                        />
                    </StepPanels>
                </div>
            </div>
        </Stepper>
    </Panel>
</template>

<style>
@import url('@/bcgov_arches_common/css/arches_common.css');
.language-selector {
    display: none;
}
@media print {
    aside,
    .bcgov-vertical-steps,
    .stepper-nav-panel,
    .sidenav,
    .debug-toggle {
        display: none !important;
    }

    html,
    body {
        height: auto !important;
        overflow: visible !important;
    }

    .main-content-area,
    .page-wrapper,
    main {
        position: static !important;
        overflow: visible !important;
        height: auto !important;
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        display: block !important;
    }

    .bcgov-stepper,
    .bcgov-vertical-step-panels {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        flex: none !important;
    }

    .p-panel,
    .p-panel-content,
    .p-panel-header {
        padding-top: 0 !important;
        margin-top: 0 !important;
        border: none !important;
    }

    .bcgov-vertical-step-panels h1 {
        margin-top: 0 !important;
        padding-top: 0 !important;
    }
}
.red {
    color: red;
}
</style>
<style scoped>
.submit-overlay {
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0.7;
    position: absolute;
    width: 100vw;
    height: 100vh;
    background: white;
    z-index: 500;
    left: 0;
    top: 0;
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

.step-description {
    margin-bottom: 1rem;
}
.site-name {
    margin-top: 0;
}
</style>
