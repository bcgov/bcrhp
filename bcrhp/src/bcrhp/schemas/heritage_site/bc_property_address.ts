import { z } from 'zod';
import { TileSchema } from '@/bcgov_arches_common/datatypes/tile.ts';
import { ConceptValueRequiredSchema } from '@/bcgov_arches_common/datatypes/concept/validation/zod.ts';
import {
    getRichTextValueRequiredSchema,
    getStringValueSchema,
    getStringValueRequiredSchema,
    getBCPostalCodeSchema,
} from '@/bcgov_arches_common/datatypes/string/validation/zod.ts';
import type { StringAliasedNodeData } from '@/arches_component_lab/datatypes/string/types.ts';
import type { ConceptAliasedNodeData } from '@/arches_component_lab/datatypes/concept/types.ts';
import {
    BcPropertyLegalDescriptionTileSchema,
    type BcPropertyLegalDescriptionTileType,
} from '@/bcrhp/schemas/heritage_site/bc_property_legal_description.ts';
import { buildConceptAliasedNodeData } from '@/arches_component_lab/datatypes/concept/utils.ts';
import { blankStringValue } from '@/bcrhp/utils.ts';

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
            province: buildConceptAliasedNodeData(null, []),
            locality: blankStringValue(),
            bc_property_legal_description: [],
        };
    }
    aliased_data: {
        street_address: StringAliasedNodeData;
        postal_code: StringAliasedNodeData;
        location_description: StringAliasedNodeData;
        city: StringAliasedNodeData;
        province: ConceptAliasedNodeData;
        locality: StringAliasedNodeData;
        bc_property_legal_description: BcPropertyLegalDescriptionTileType[];
    };
}
