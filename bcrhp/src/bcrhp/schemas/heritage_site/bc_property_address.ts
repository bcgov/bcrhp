import { z } from 'zod';
import { TileSchema } from '@/arches_zod_validation/datatypes/tile.ts';
import { ConceptValueRequiredSchema } from '@/arches_zod_validation/datatypes/concept/validation/zod.ts';
import {
    getRichTextValueRequiredSchema,
    getStringValueSchema,
    getStringValueRequiredSchema,
    getBCPostalCodeSchema,
} from '@/arches_zod_validation/datatypes/string/validation/zod.ts';
import type { StringValue } from '@/arches_component_lab/datatypes/string/types.ts';
import type { ConceptValue } from '@/arches_component_lab/datatypes/concept/types.ts';
import {
    BcPropertyLegalDescriptionTileSchema,
    type BcPropertyLegalDescriptionTileType,
} from '@/bcrhp/schemas/heritage_site/bc_property_legal_description.ts';
import { blankConceptValue } from '@/arches_component_lab/datatypes/concept/utils.ts';
import { blankStringValue } from '@/arches_zod_validation/utils.ts';

export const BcPropertyAddressTileSchema = TileSchema.extend({
    aliased_data: z.object({
        street_address: getStringValueRequiredSchema(80),
        postal_code: getBCPostalCodeSchema(),
        location_description: getRichTextValueRequiredSchema(4000),
        city: getStringValueRequiredSchema(80),
        province: ConceptValueRequiredSchema,
        locality: getStringValueSchema(50),
        bc_property_legal_description: z.array(
            BcPropertyLegalDescriptionTileSchema,
        ),
    }),
});
// @ts-ignore
export type BcPropertyAddressTileType = z.infer<
    typeof BcPropertyAddressTileSchema
>;

export function getPropertyAddress(): BcPropertyAddressTileType {
    return new PropertyAddress();
}

export class PropertyAddress implements BcPropertyAddressTileType {
    constructor() {
        this.aliased_data = {
            street_address: blankStringValue(),
            postal_code: blankStringValue(),
            location_description: blankStringValue(),
            city: blankStringValue(),
            province: blankConceptValue(),
            locality: blankStringValue(),
            bc_property_legal_description: [],
        };
    }
    aliased_data: {
        street_address: StringValue;
        postal_code: StringValue;
        location_description: StringValue;
        city: StringValue;
        province: ConceptValue;
        locality: StringValue;
        bc_property_legal_description: BcPropertyLegalDescriptionTileType[];
    };
}
