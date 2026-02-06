import { z } from 'zod';
import { TileSchema } from '@/bcgov_arches_common/datatypes/tile.ts';
import { NumberValueSchema } from '@/bcgov_arches_common/datatypes/numeric/validation/zod.ts';
import {
    getRichTextValueSchema,
    getStringValueSchema,
} from '@/bcgov_arches_common/datatypes/string/validation/zod.ts';

import type { StringValue } from '@/arches_component_lab/datatypes/string/types.ts';
import type { NumberValue } from '@/arches_component_lab/datatypes/number/types.ts';
import { blankNumberValue, blankStringValue } from '@/bcrhp/utils.ts';

// Auto-generated tile schema for alias: bc_property_legal_description

export const BcPropertyLegalDescriptionTileSchema = TileSchema.extend({
    aliased_data: z.object({
        legal_address_internal_notes: getRichTextValueSchema(),
        pin: NumberValueSchema,
        pid: NumberValueSchema,
        legal_description: getStringValueSchema(250),
    }),
});
// @ts-ignore
export type BcPropertyLegalDescriptionTileType = z.infer<
    typeof BcPropertyLegalDescriptionTileSchema
>;

export function getLegalDescription(): BcPropertyLegalDescriptionTileType {
    return new LegalDescription();
}

export class LegalDescription implements BcPropertyLegalDescriptionTileType {
    constructor() {
        this.aliased_data = {
            legal_address_internal_notes: blankStringValue(),
            pin: blankNumberValue(),
            pid: blankNumberValue(),
            legal_description: blankStringValue(),
        };
    }
    aliased_data: {
        legal_address_internal_notes: StringValue;
        pin: NumberValue;
        pid: NumberValue;
        legal_description: StringValue;
    };
}
