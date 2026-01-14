import { z } from 'zod';
import { TileSchema } from '@/bcgov_arches_common/datatypes/tile.ts';
import { ConceptValueSchema } from '@/bcgov_arches_common/datatypes/concept/validation/zod.ts';
import { DateValueSchema } from '@/bcgov_arches_common/datatypes/date/validation/zod.ts';
import { getRichTextValueRequiredSchema } from '@/bcgov_arches_common/datatypes/string/validation/zod.ts';

// Auto-generated tile schema for alias: internal_remark

export const InternalRemarkTileSchema = TileSchema.extend({
    aliased_data: z.object({
        remark_date: DateValueSchema,
        remark_type: ConceptValueSchema,
        internal_remark: z.array(getRichTextValueRequiredSchema(1000)),
    }),
});
// @ts-ignore
export type InternalRemarkTileType = z.infer<typeof InternalRemarkTileSchema>;
