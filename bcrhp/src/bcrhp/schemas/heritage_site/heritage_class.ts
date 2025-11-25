import { z } from 'zod';

// Auto-generated tile schema for alias: heritage_class

const ContributingResourceCountNodeSchema = z.object({
    node_value: z.number().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const OwnershipNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const HeritageCategoryNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

export const HeritageClassTileSchema = z.object({
    tileid: z.string().nullable(),
    resourceinstance: z.string().nullable(),
    nodegroup: z.string().nullable(),
    parenttile: z.string().nullable(),
    aliased_data: z.object({
        contributing_resource_count: ContributingResourceCountNodeSchema,
        ownership: OwnershipNodeSchema,
        heritage_category: HeritageCategoryNodeSchema,
    }),
    sortorder: z.number().nullable(),
    provisionaledits: z.unknown().nullable(),
});

export type HeritageClassTileType = z.infer<typeof HeritageClassTileSchema>;