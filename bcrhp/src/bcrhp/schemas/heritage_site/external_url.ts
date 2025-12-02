import { z } from 'zod';

// Auto-generated tile schema for alias: external_url

const ExternalUrlTypeNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

export const ExternalUrlTileSchema = z.object({
    tileid: z.string().nullable(),
    resourceinstance: z.string().nullable(),
    nodegroup: z.string().nullable(),
    parenttile: z.string().nullable(),
    aliased_data: z.object({
        external_url_type: ExternalUrlTypeNodeSchema,
        external_url: z.array(ExternalUrlTileSchema),
    }),
    sortorder: z.number().nullable(),
    provisionaledits: z.unknown().nullable(),
});
// @ts-ignore
export type ExternalUrlTileType = z.infer<typeof ExternalUrlTileSchema>;
