import { z } from 'zod';

// Auto-generated tile schema for alias: heritage_function

const FunctionalStateNodeSchema = z.object({
    node_value: z.array(z.string()).nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const FunctionalCategoryNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

export const HeritageFunctionTileSchema = z.object({
    tileid: z.string().nullable(),
    resourceinstance: z.string().nullable(),
    nodegroup: z.string().nullable(),
    parenttile: z.string().nullable(),
    aliased_data: z.object({
        functional_state: FunctionalStateNodeSchema,
        functional_category: FunctionalCategoryNodeSchema,
    }),
    sortorder: z.number().nullable(),
    provisionaledits: z.unknown().nullable(),
});
// @ts-ignore
export type HeritageFunctionTileType = z.infer<
    typeof HeritageFunctionTileSchema
>;
