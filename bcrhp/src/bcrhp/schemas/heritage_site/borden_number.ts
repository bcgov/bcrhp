import { z } from 'zod';
import { TileSchema } from '@/arches_zod_validation/datatypes/tile.ts';
import { getStringValueRequiredSchema } from '@/arches_zod_validation/datatypes/string/validation/zod.ts';
import type { StringValue } from '@/arches_component_lab/datatypes/string/types.ts';
import { blankStringValue } from '@/arches_zod_validation/utils.ts';

// Auto-generated tile schema for alias: borden_number

export const BordenNumberTileSchema = TileSchema.extend({
    aliased_data: z.object({
        borden_number: getStringValueRequiredSchema(9),
    }),
});
// @ts-ignore
export type BordenNumberTileType = z.infer<typeof BordenNumberTileSchema>;

export function getBordenNumber(): BordenNumberTileType {
    return new BordenNumber();
}

export class BordenNumber implements BordenNumberTileType {
    constructor() {
        this.aliased_data = {
            borden_number: blankStringValue(),
        };
    }
    aliased_data: {
        borden_number: StringValue;
    };
}
