import { z } from 'zod';
import DOMPurify from 'dompurify';

const StatementOfSignificanceSchema = z.object({
    description: z
        .string()
        .transform((value: string) => {
            return DOMPurify.sanitize(value, {
                ALLOWED_TAGS: [],
            });
        })
        .refine((value: string) => value !== '', {
            message: 'Description is required.',
        })
        .refine((value: string) => value.length <= 4000, {
            message: 'Description must be 4000 characters or less.',
        })
        .nullable(),
    heritageValue: z
        .string()
        .transform((value: string) => {
            return DOMPurify.sanitize(value, {
                ALLOWED_TAGS: [],
            });
        })
        .refine((value: string) => value !== '', {
            message: 'Heritage Value is required.',
        })
        .refine((value: string) => value.length <= 4000, {
            message: 'Heritage Value must be 4000 characters or less.',
        })
        .nullable(),
    definingElements: z
        .string()
        .transform((value: string) => {
            return DOMPurify.sanitize(value, {
                ALLOWED_TAGS: [],
            });
        })
        .refine((value: string) => value !== '', {
            message: 'Defining Elements are required.',
        })
        .refine((value: string) => value.length <= 4000, {
            message: 'Defining Elements must be 4000 characters or less.',
        })
        .nullable(),
    documentLocation: z
        .string({
            invalid_type_error: 'Document Location is required.',
        })
        .min(1, { message: 'Document Location is required.' })
        .max(250),
});

const requiredStatementOfSignificanceSchema =
    StatementOfSignificanceSchema.partial({});
// @ts-ignore
type StatementOfSignificanceType = z.infer<
    typeof StatementOfSignificanceSchema
>;

function getStatementOfSignificance(): StatementOfSignificanceType {
    return new StatementOfSignificance();
}

// @todo - Figure out object state - New/Updated/Deleted
class StatementOfSignificance implements StatementOfSignificanceType {
    constructor() {
        this.description = '';
        this.heritageValue = '';
        this.definingElements = '';
        this.documentLocation = '';
    }
    description: string;
    heritageValue: string;
    definingElements: string;
    documentLocation: string;
}

export {
    StatementOfSignificance,
    StatementOfSignificanceSchema,
    getStatementOfSignificance,
    requiredStatementOfSignificanceSchema,
};
