import { z } from 'zod';
import { TileSchema } from '@/bcgov_arches_common/datatypes/tile.ts';
import { getStringValueRequiredSchema } from '@/bcgov_arches_common/datatypes/string/validation/zod.ts';

// Auto-generated tile schema for alias: borden_number

export const BordenNumberTileSchema = TileSchema.extend({
    aliased_data: z.object({
        borden_number: getStringValueRequiredSchema(9),
    }),
});
// @ts-ignore
export type BordenNumberTileType = z.infer<typeof BordenNumberTileSchema>;
