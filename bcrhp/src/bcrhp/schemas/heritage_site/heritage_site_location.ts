import { z } from 'zod';
import { TileSchema } from '@/bcgov_arches_common/datatypes/tile.ts';
import { BcPropertyAddressTileSchema } from '@/bcrhp/schemas/heritage_site/bc_property_address.ts';
import { SiteBoundaryTileSchema } from '@/bcrhp/schemas/heritage_site/site_boundary.ts';

// Auto-generated tile schema for alias: heritage_site_location

export const HeritageSiteLocationTileSchema = TileSchema.extend({
    aliased_data: z.object({
        bc_property_address: z.array(BcPropertyAddressTileSchema),
        site_boundary: z.array(SiteBoundaryTileSchema),
    }),
});
// @ts-ignore
export type HeritageSiteLocationTileType = z.infer<
    typeof HeritageSiteLocationTileSchema
>;
