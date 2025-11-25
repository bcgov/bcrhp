import { z } from 'zod';

// Auto-generated tile schema for alias: heritage_theme

export const HeritageThemeTileSchema = z.object({
    tileid: z.string().nullable(),
    resourceinstance: z.string().nullable(),
    nodegroup: z.string().nullable(),
    parenttile: z.string().nullable(),
    aliased_data: z.object({
        heritage_theme: z.array(HeritageThemeTileSchema),
    }),
    sortorder: z.number().nullable(),
    provisionaledits: z.unknown().nullable(),
});

export type HeritageThemeTileType = z.infer<typeof HeritageThemeTileSchema>;