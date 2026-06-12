import { z } from 'zod';
import { TileSchema } from '@/arches_zod_validation/datatypes/tile.ts';
import { NumberValueSchema } from '@/arches_zod_validation/datatypes/numeric/validation/zod.ts';
import { ConceptValueSchema } from '@/arches_zod_validation/datatypes/concept/validation/zod.ts';
import type { ConceptValue } from '@/arches_component_lab/datatypes/concept/types.ts';
import type { NumberValue } from '@/arches_component_lab/datatypes/number/types.ts';
import { blankConceptValue } from '@/arches_component_lab/datatypes/concept/utils.ts';
import { blankNumberValue } from '@/arches_zod_validation/utils.ts';

// Auto-generated tile schema for alias: heritage_class

export const HeritageClassTileSchema = TileSchema.extend({
    aliased_data: z.object({
        contributing_resource_count: NumberValueSchema,
        ownership: ConceptValueSchema,
        heritage_category: ConceptValueSchema,
    }),
});
// @ts-ignore
export type HeritageClassTileType = z.infer<typeof HeritageClassTileSchema>;

export function getHeritageClass(): HeritageClassTileType {
    return new HeritageClass();
}

export class HeritageClass implements HeritageClassTileType {
    constructor() {
        this.aliased_data = {
            contributing_resource_count: blankNumberValue(),
            ownership: blankConceptValue(),
            heritage_category: blankConceptValue(),
        };
    }
    aliased_data: {
        contributing_resource_count: NumberValue;
        ownership: ConceptValue;
        heritage_category: ConceptValue;
    };
}
