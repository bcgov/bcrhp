import type { Component } from 'vue';
import type { ErrorMessage } from '@/bcrhp/types.ts';

export enum EditMode {
    Add,
    Edit,
}

/** Exposed interface every step component must implement via defineExpose. */
export interface WorkflowStep {
    isValid(): boolean;
}

export interface StepConfig {
    value: number;
    /** Label shown in the step list sidebar. */
    label: string;
    /** Heading rendered above the step content. Omit if the component provides its own. */
    heading?: string;
    /** Shows a red asterisk on the heading when true. */
    required?: boolean;
    /** Descriptive text shown below the heading. */
    description?: string;
    /** The step component. */
    component: Component;
    /** Extra static props passed to the component. */
    props?: Record<string, unknown>;
}

export type { ErrorMessage };
