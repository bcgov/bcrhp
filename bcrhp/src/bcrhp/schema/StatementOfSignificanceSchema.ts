import { z } from 'zod';
import type { StringValue } from '@/arches_component_lab/datatypes/string/types.ts';
import type { ConceptValue } from '@/arches_component_lab/datatypes/concept/types.ts';
import { blankConceptValue } from '@/arches_component_lab/datatypes/concept/utils.ts';
import { blankStringValue } from '@/bcrhp/utils.ts';
import { getRichTextValueRequiredSchema } from '@/bcgov_arches_common/datatypes/string/validation/zod.ts';
import { getStringValueRequiredSchema } from '@/bcgov_arches_common/datatypes/string/validation/zod.ts';
import { SignificanceTypeNodeSchema } from '@bcrhp/schemas/heritage_site/bc_statement_of_significance.ts';

const StatementOfSignificanceSchema = z.object({
    aliased_data: z.object({
        heritage_value: getRichTextValueRequiredSchema(4000),
        defining_elements: getRichTextValueRequiredSchema(4000),
        physical_description: getRichTextValueRequiredSchema(4000),
        significance_type: SignificanceTypeNodeSchema,
        document_location: getStringValueRequiredSchema(250),
    }),
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
        this.aliased_data = {
            heritage_value: blankStringValue(),
            defining_elements: blankStringValue(),
            physical_description: blankStringValue(),
            significance_type: blankConceptValue(),
            document_location: blankStringValue(),
        };
    }
    aliased_data: {
        heritage_value: StringValue;
        defining_elements: StringValue;
        physical_description: StringValue;
        significance_type: ConceptValue;
        document_location: StringValue;
    };
}

export {
    StatementOfSignificance,
    StatementOfSignificanceSchema,
    getStatementOfSignificance,
    requiredStatementOfSignificanceSchema,
    type StatementOfSignificanceType,
};
