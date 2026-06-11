import { z } from 'zod';
import { TileSchema } from '@/bcgov_arches_common/datatypes/tile.ts';
import { NumberValueSchema } from '@/bcgov_arches_common/datatypes/numeric/validation/zod.ts';
import { ConceptValueSchema } from '@/bcgov_arches_common/datatypes/concept/validation/zod.ts';
import type { ConceptAliasedNodeData } from '@/arches_component_lab/datatypes/concept/types.ts';
import type { NumberValue } from '@/arches_component_lab/datatypes/number/types.ts';
import { buildConceptAliasedNodeData } from '@/arches_component_lab/datatypes/concept/utils.ts';
import { blankNumberValue } from '@/bcrhp/utils.ts';

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
            ownership: buildConceptAliasedNodeData(),
            heritage_category: buildConceptAliasedNodeData(),
        };
    }
    aliased_data: {
        contributing_resource_count: NumberValue;
        ownership: ConceptAliasedNodeData;
        heritage_category: ConceptAliasedNodeData;
    };
}
