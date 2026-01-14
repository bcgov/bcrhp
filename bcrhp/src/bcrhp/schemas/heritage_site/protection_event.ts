import { z } from 'zod';
import { TileSchema } from '@/bcgov_arches_common/datatypes/tile.ts';
import { DateValueSchema } from '@/bcgov_arches_common/datatypes/date/validation/zod.ts';
import { ResourceInstanceValueSchema } from '@/bcgov_arches_common/datatypes/resource-instance/validation/zod.ts';
import {
    getStringValueSchema,
    getRichTextValueSchema,
} from '@/bcgov_arches_common/datatypes/string/validation/zod.ts';

export const ProtectionEventTileSchema = TileSchema.extend({
    aliased_data: z.object({
        protection_notes: getRichTextValueSchema(),
        designation_or_protection_start_date: DateValueSchema,
        designation_or_protection_end_date: DateValueSchema,
        responsible_government: ResourceInstanceValueSchema,
        legislative_act: ResourceInstanceValueSchema,
        reference_number: getStringValueSchema(),
    }),
});
// @ts-ignore
export type ProtectionEventTileType = z.infer<typeof ProtectionEventTileSchema>;
