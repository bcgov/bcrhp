import { z } from 'zod';
import { TileSchema } from '@/bcgov_arches_common/datatypes/tile.ts';
import { getStringValueSchema } from '@/bcgov_arches_common/datatypes/string/validation/zod.ts';

// Auto-generated tile schema for alias: site_boundary

export const SiteBoundaryTileSchema = TileSchema.extend({
    aliased_data: z.object({
        accuracy_remarks: getStringValueSchema(),
        source_notes: getStringValueSchema(),
        site_boundary: z.array(z.lazy(() => SiteBoundaryTileSchema)),
    }),
});
// @ts-ignore
export type SiteBoundaryTileType = z.infer<typeof SiteBoundaryTileSchema>;
