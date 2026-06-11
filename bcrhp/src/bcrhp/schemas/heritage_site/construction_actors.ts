import { z } from 'zod';
import { TileSchema } from '@/bcgov_arches_common/datatypes/tile.ts';
import { ConceptValueSchema } from '@/bcgov_arches_common/datatypes/concept/validation/zod.ts';
import { getStringValueSchema } from '@/bcgov_arches_common/datatypes/string/validation/zod.ts';
import type { ConceptAliasedNodeData } from '@/arches_component_lab/datatypes/concept/types.ts';
import type { StringAliasedNodeData } from '@/arches_component_lab/datatypes/string/types.ts';
import { buildConceptAliasedNodeData } from '@/arches_component_lab/datatypes/concept/utils.ts';
import { blankStringValue } from '@/bcrhp/utils.ts';

// Auto-generated tile schema for alias: construction_actors

export const ConstructionActorsTileSchema = TileSchema.extend({
    aliased_data: z.object({
        construction_actor_notes: getStringValueSchema(),
        construction_actor: getStringValueSchema(),
        construction_actor_type: ConceptValueSchema,
    }),
});
// @ts-ignore
export type ConstructionActorsTileType = z.infer<
    typeof ConstructionActorsTileSchema
>;

export function getConstructionActor(): ConstructionActorsTileType {
    return new ConstructionActor();
}

export class ConstructionActor implements ConstructionActorsTileType {
    constructor() {
        this.aliased_data = {
            construction_actor_notes: blankStringValue(),
            construction_actor: blankStringValue(),
            construction_actor_type: buildConceptAliasedNodeData(),
        };
    }
    aliased_data: {
        construction_actor_notes: StringAliasedNodeData;
        construction_actor: StringAliasedNodeData;
        construction_actor_type: ConceptAliasedNodeData;
    };
}
