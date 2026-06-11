import { z } from 'zod';
import { TileSchema } from '@/bcgov_arches_common/datatypes/tile.ts';
import { ConceptValueSchema } from '@/bcgov_arches_common/datatypes/concept/validation/zod.ts';
import type { ConceptAliasedNodeData } from '@/arches_component_lab/datatypes/concept/types.ts';
import type { ConceptListAliasedNodeData } from '@/arches_component_lab/datatypes/concept-list/types.ts';
import { ConceptListValueRequiredSchema } from '@/bcgov_arches_common/datatypes/concept-list/validation/zod.ts';
import { buildConceptAliasedNodeData } from '@/arches_component_lab/datatypes/concept/utils.ts';
import { buildConceptListAliasedNodeData } from '@/arches_component_lab/datatypes/concept-list/utils.ts';

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
            functional_state: buildConceptListAliasedNodeData(null, []),
            functional_category: buildConceptAliasedNodeData(null, []),
        };
    }
    aliased_data: {
        functional_state: ConceptListAliasedNodeData;
        functional_category: ConceptAliasedNodeData;
    };
}
