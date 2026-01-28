import { z } from 'zod';
import { TileSchema } from '@/bcgov_arches_common/datatypes/tile.ts';
import { ConceptValueSchema } from '@/bcgov_arches_common/datatypes/concept/validation/zod.ts';
import {
    getStringValueSchema,
    getRichTextValueSchema,
} from '@/bcgov_arches_common/datatypes/string/validation/zod.ts';

import { blankConceptValue } from '@/arches_component_lab/datatypes/concept/utils.ts';
import { blankStringValue } from '@/bcrhp/utils.ts';
import type { StringValue } from '@/arches_component_lab/datatypes/string/types.ts';
import type { ConceptValue } from '@/arches_component_lab/datatypes/concept/types.ts';

// Auto-generated tile schema for alias: bc_statement_of_significance

export const BcStatementOfSignificanceTileSchema = TileSchema.extend({
    aliased_data: z.object({
        heritage_value: getRichTextValueSchema(),
        defining_elements: getRichTextValueSchema(),
        physical_description: getRichTextValueSchema(),
        significance_type: ConceptValueSchema,
        document_location: getStringValueSchema(),
    }),
});
// @ts-ignore
export type BcStatementOfSignificanceTileType = z.infer<
    typeof BcStatementOfSignificanceTileSchema
>;

export function getStatementOfSignificance(): BcStatementOfSignificanceTileType {
    return new StatementOfSignificance();
}

// @todo - Figure out object state - New/Updated/Deleted
export class StatementOfSignificance implements BcStatementOfSignificanceTileType {
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
