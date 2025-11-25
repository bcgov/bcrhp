import { z } from 'zod';

// Auto-generated tile schema for alias: heritage_site_location

export const HeritageSiteLocationTileSchema = z.object({
    tileid: z.string().nullable(),
    resourceinstance: z.string().nullable(),
    nodegroup: z.string().nullable(),
    parenttile: z.string().nullable(),
    aliased_data: z.object({
        bc_property_address: z.array(BcPropertyAddressTileSchema),
        site_boundary: z.array(SiteBoundaryTileSchema),
    }),
    sortorder: z.number().nullable(),
    provisionaledits: z.unknown().nullable(),
});

export type HeritageSiteLocationTileType = z.infer<typeof HeritageSiteLocationTileSchema>;