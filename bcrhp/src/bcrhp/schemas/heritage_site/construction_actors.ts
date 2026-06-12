import { z } from 'zod';
import { TileSchema } from '@/arches_zod_validation/datatypes/tile.ts';
import { ConceptValueSchema } from '@/arches_zod_validation/datatypes/concept/validation/zod.ts';
import { getStringValueSchema } from '@/arches_zod_validation/datatypes/string/validation/zod.ts';
import type { ConceptValue } from '@/arches_component_lab/datatypes/concept/types.ts';
import type { StringValue } from '@/arches_component_lab/datatypes/string/types.ts';
import { blankConceptValue } from '@/arches_component_lab/datatypes/concept/utils.ts';
import { blankStringValue } from '@/arches_zod_validation/utils.ts';

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
            construction_actor_type: blankConceptValue(),
        };
    }
    aliased_data: {
        construction_actor_notes: StringValue;
        construction_actor: StringValue;
        construction_actor_type: ConceptValue;
    };
}
