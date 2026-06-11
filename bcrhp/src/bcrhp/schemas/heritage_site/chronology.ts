import { z } from 'zod';
import { TileSchema } from '@/bcgov_arches_common/datatypes/tile.ts';
import { ConceptValueRequiredSchema } from '@/bcgov_arches_common/datatypes/concept/validation/zod.ts';
import { BooleanValueSchema } from '@/bcgov_arches_common/datatypes/boolean/validation/zod.ts';
import { YearValueSchema } from '@/bcgov_arches_common/datatypes/date/validation/zod.ts';
import type { DateAliasedNodeData } from '@/arches_component_lab/datatypes/date/types.ts';
import type { ConceptAliasedNodeData } from '@/arches_component_lab/datatypes/concept/types.ts';
import type { StringAliasedNodeData } from '@/arches_component_lab/datatypes/string/types.ts';
import type { BooleanAliasedNodeData } from '@/arches_component_lab/datatypes/boolean/types.ts';
import { getStringValueSchema } from '@/bcgov_arches_common/datatypes/string/validation/zod.ts';
import { buildConceptAliasedNodeData } from '@/arches_component_lab/datatypes/concept/utils.ts';
import {
    blankStringValue,
    blankDateValue,
    blankBooleanValue,
} from '@/bcrhp/utils.ts';

// Auto-generated tile schema for alias: chronology

export const ChronologyTileSchema = TileSchema.extend({
    aliased_data: z.object({
        start_year: YearValueSchema,
        dates_approximate: BooleanValueSchema,
        information_source: getStringValueSchema(),
        chronology: ConceptValueRequiredSchema,
        chronology_notes: getStringValueSchema(),
        end_year: YearValueSchema,
    }),
});
// @ts-ignore
export type ChronologyTileType = z.infer<typeof ChronologyTileSchema>;

export function getChronology(): ChronologyTileType {
    return new Chronology();
}

export class Chronology implements ChronologyTileType {
    constructor() {
        this.aliased_data = {
            start_year: blankDateValue(),
            dates_approximate: blankBooleanValue(),
            information_source: blankStringValue(),
            chronology: buildConceptAliasedNodeData(null, []),
            chronology_notes: blankStringValue(),
            end_year: blankDateValue(),
        };
    }
    aliased_data: {
        start_year: DateAliasedNodeData;
        dates_approximate: BooleanAliasedNodeData;
        information_source: StringAliasedNodeData;
        chronology: ConceptAliasedNodeData;
        chronology_notes: StringAliasedNodeData;
        end_year: DateAliasedNodeData;
    };
}
