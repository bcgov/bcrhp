import { z } from 'zod';
import { TileSchema } from '@/bcgov_arches_common/datatypes/tile.ts';
import { ConceptValueRequiredSchema } from '@/bcgov_arches_common/datatypes/concept/validation/zod.ts';
import { getStringValueRequiredSchema } from '@/bcgov_arches_common/datatypes/string/validation/zod.ts';

export const SiteNamesTileSchema = TileSchema.extend({
    aliased_data: z.object({
        name: getStringValueRequiredSchema(250),
        name_type: ConceptValueRequiredSchema,
    }),
});
// @ts-ignore
export type SiteNamesTileType = z.infer<typeof SiteNamesTileSchema>;
