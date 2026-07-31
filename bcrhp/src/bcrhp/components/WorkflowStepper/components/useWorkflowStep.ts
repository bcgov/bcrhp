import { inject } from 'vue';
import type { Ref } from 'vue';
import type { EditMode, ErrorMessage } from './types.ts';

/**
 * Composable for step components.
 * Injects the common stepper context that WorkflowStepper provides.
 */
export function useWorkflowStep() {
    const editMode = inject<EditMode>('editMode')!;
    const submissionErrors = inject<Ref<ErrorMessage[]>>(
        'workflowSubmissionErrors',
    )!;
    const submissionComplete = inject<Ref<boolean>>(
        'workflowSubmissionComplete',
    )!;
    const working = inject<Ref<boolean>>('working')!;
    return { editMode, submissionErrors, submissionComplete, working };
}
