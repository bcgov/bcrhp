import { z } from 'zod';

const StatementOfSignificanceSchema = z.object({
    description: z
        .string()
        .min(1, { message: 'Description is required.' })
        .max(4000),
    heritageValue: z
        .string()
        .min(1, { message: 'Heritage Value is required.' })
        .max(4000),
    definingElements: z
        .string()
        .min(1, { message: 'Defining Elements is required.' })
        .max(4000),
    documentLocation: z
        .string()
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
