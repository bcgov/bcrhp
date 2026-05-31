import { z } from 'zod';
import { TileSchema } from '@/bcgov_arches_common/datatypes/tile.ts';
import { DateValueSchema } from '@/bcgov_arches_common/datatypes/date/validation/zod.ts';
import { ResourceInstanceValueSchema } from '@/bcgov_arches_common/datatypes/resource-instance/validation/zod.ts';
import {
    getStringValueSchema,
    getRichTextValueSchema,
} from '@/bcgov_arches_common/datatypes/string/validation/zod.ts';
import type { DateValue } from '@/arches_component_lab/datatypes/date/types.ts';
import type { ResourceInstanceValue } from '@/arches_component_lab/datatypes/resource-instance/types.ts';
import type { StringValue } from '@/arches_component_lab/datatypes/string/types.ts';
import {
    blankStringValue,
    blankResourceInstanceValue,
    blankDateValue,
} from '@/bcrhp/utils.ts';

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

export function getProtectionEvent(): ProtectionEventTileType {
    return new ProtectionEvent();
}

export class ProtectionEvent implements ProtectionEventTileType {
    constructor() {
        this.aliased_data = {
            protection_notes: blankStringValue(),
            designation_or_protection_start_date: blankDateValue(),
            designation_or_protection_end_date: blankDateValue(),
            responsible_government: blankResourceInstanceValue(),
            legislative_act: blankResourceInstanceValue(),
            reference_number: blankStringValue(),
        };
    }
    aliased_data: {
        protection_notes: StringValue;
        designation_or_protection_start_date: DateValue;
        designation_or_protection_end_date: DateValue;
        responsible_government: ResourceInstanceValue;
        legislative_act: ResourceInstanceValue;
        reference_number: StringValue;
    };
}
