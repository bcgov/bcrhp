import { z } from 'zod';

// Auto-generated tile schema for alias: construction_actors

const ConstructionActorNotesNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const ConstructionActorNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const ConstructionActorTypeNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

export const ConstructionActorsTileSchema = z.object({
    tileid: z.string().nullable(),
    resourceinstance: z.string().nullable(),
    nodegroup: z.string().nullable(),
    parenttile: z.string().nullable(),
    aliased_data: z.object({
        construction_actor_notes: ConstructionActorNotesNodeSchema,
        construction_actor: ConstructionActorNodeSchema,
        construction_actor_type: ConstructionActorTypeNodeSchema,
    }),
    sortorder: z.number().nullable(),
    provisionaledits: z.unknown().nullable(),
});
// @ts-ignore
export type ConstructionActorsTileType = z.infer<
    typeof ConstructionActorsTileSchema
>;
