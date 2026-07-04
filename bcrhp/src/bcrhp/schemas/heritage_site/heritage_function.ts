import { z } from 'zod';
import { TileSchema } from '@/arches_zod_validation/datatypes/tile.ts';
import { ConceptValueSchema } from '@/arches_zod_validation/datatypes/concept/validation/zod.ts';
import type { ConceptValue } from '@/arches_component_lab/datatypes/concept/types.ts';
import type { ConceptListValue } from '@/arches_component_lab/datatypes/concept-list/types.ts';
import { ConceptListValueRequiredSchema } from '@/arches_zod_validation/datatypes/concept-list/validation/zod.ts';
import { blankConceptValue } from '@/arches_component_lab/datatypes/concept/utils.ts';
import { blankConceptListValue } from '@/arches_component_lab/datatypes/concept-list/utils.ts';

export const HeritageFunctionTileSchema = TileSchema.extend({
    aliased_data: z.object({
        functional_state: ConceptListValueRequiredSchema,
        functional_category: ConceptValueSchema,
    }),
});
// @ts-ignore
export type HeritageFunctionTileType = z.infer<
    typeof HeritageFunctionTileSchema
>;

export function getHeritageFunction(): HeritageFunctionTileType {
    return new HeritageFunction();
}

export class HeritageFunction implements HeritageFunctionTileType {
    constructor() {
        this.aliased_data = {
            functional_state: blankConceptListValue(),
            functional_category: blankConceptValue(),
        };
    }
    aliased_data: {
        functional_state: ConceptListValue;
        functional_category: ConceptValue;
    };
}
