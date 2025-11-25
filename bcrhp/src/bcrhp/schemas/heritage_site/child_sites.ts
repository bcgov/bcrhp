import { z } from 'zod';

// Auto-generated tile schema for alias: child_sites

export const ChildSitesTileSchema = z.object({
    tileid: z.string().nullable(),
    resourceinstance: z.string().nullable(),
    nodegroup: z.string().nullable(),
    parenttile: z.string().nullable(),
    aliased_data: z.object({
        child_sites: z.array(ChildSitesTileSchema),
    }),
    sortorder: z.number().nullable(),
    provisionaledits: z.unknown().nullable(),
});

export type ChildSitesTileType = z.infer<typeof ChildSitesTileSchema>;