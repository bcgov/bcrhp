import { z } from 'zod';
import { TileSchema } from '@/bcgov_arches_common/datatypes/tile.ts';
import { ConceptValueRequiredSchema } from '@/bcgov_arches_common/datatypes/concept/validation/zod.ts';
import { BooleanValueSchema } from '@/bcgov_arches_common/datatypes/boolean/validation/zod.ts';
import { DateValueSchema } from '@/bcgov_arches_common/datatypes/date/validation/zod.ts';
import type { DateValue } from '@/arches_component_lab/datatypes/date/types.ts';
import type { ConceptValue } from '@/arches_component_lab/datatypes/concept/types.ts';
import type { StringValue } from '@/arches_component_lab/datatypes/string/types.ts';
import { getStringValueSchema } from '@/bcgov_arches_common/datatypes/string/validation/zod.ts';
import { blankConceptValue } from '@/arches_component_lab/datatypes/concept/utils.ts';
import { blankStringValue, currentDateValue } from '@/bcrhp/utils.ts';

// Auto-generated tile schema for alias: chronology

export const ChronologyTileSchema = TileSchema.extend({
    aliased_data: z.object({
        start_year: DateValueSchema,
        dates_approximate: BooleanValueSchema,
        information_source: getStringValueSchema(),
        chronology: z.array(ConceptValueRequiredSchema),
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
            start_year: currentDateValue(),
            dates_approximate: false,
            information_source: blankStringValue(),
            chronology: blankConceptValue(),
            chronology_notes: blankStringValue(),
            end_year: currentDateValue(),
        };
    }
    aliased_data: {
        start_year: DateValue;
        dates_approximate: boolean;
        information_source: StringValue;
        chronology: ConceptValue;
        chronology_notes: StringValue;
        end_year: DateValue;
    };
}
