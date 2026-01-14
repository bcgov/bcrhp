import { z } from 'zod';
import { TileSchema } from '@/bcgov_arches_common/datatypes/tile.ts';

// Auto-generated tile schema for alias: child_sites

export const ChildSitesTileSchema = TileSchema.extend({
    aliased_data: z.object({
        child_sites: z.array(z.lazy(() => ChildSitesTileSchema)),
    }),
});
// @ts-ignore
export type ChildSitesTileType = z.infer<typeof ChildSitesTileSchema>;
