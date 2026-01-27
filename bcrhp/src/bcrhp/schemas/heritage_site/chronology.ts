import { z } from 'zod';
import { TileSchema } from '@/bcgov_arches_common/datatypes/tile.ts';
import { ConceptValueRequiredSchema } from '@/bcgov_arches_common/datatypes/concept/validation/zod.ts';
import { BooleanValueSchema } from '@/bcgov_arches_common/datatypes/boolean/validation/zod.ts';
import { DateValueSchema } from '@/bcgov_arches_common/datatypes/date/validation/zod.ts';
import type { DateValue } from '@/arches_component_lab/datatypes/date/types.ts';
import type { ConceptValue } from '@/arches_component_lab/datatypes/concept/types.ts';
import type { StringValue } from '@/arches_component_lab/datatypes/string/types.ts';
import type { BooleanValue } from '@/arches_component_lab/datatypes/boolean/types.ts';
import { getStringValueSchema } from '@/bcgov_arches_common/datatypes/string/validation/zod.ts';
import { blankConceptValue } from '@/arches_component_lab/datatypes/concept/utils.ts';
import {
    blankStringValue,
    blankDateValue,
    blankBooleanValue,
} from '@/bcrhp/utils.ts';

// Auto-generated tile schema for alias: chronology

export const ChronologyTileSchema = TileSchema.extend({
    aliased_data: z.object({
        start_year: DateValueSchema,
        dates_approximate: BooleanValueSchema,
        information_source: getStringValueSchema(),
        chronology: ConceptValueRequiredSchema,
        chronology_notes: getStringValueSchema(),
        end_year: DateValueSchema,
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
            chronology: blankConceptValue(),
            chronology_notes: blankStringValue(),
            end_year: blankDateValue(),
        };
    }
    aliased_data: {
        start_year: DateValue;
        dates_approximate: BooleanValue;
        information_source: StringValue;
        chronology: ConceptValue;
        chronology_notes: StringValue;
        end_year: DateValue;
    };
}
