import { z } from 'zod';
import { TileSchema } from '@/bcgov_arches_common/datatypes/tile.ts';
import { ConceptValueRequiredSchema } from '@/bcgov_arches_common/datatypes/concept/validation/zod.ts';
import {
    getRichTextValueRequiredSchema,
    getStringValueSchema,
    getStringValueRequiredSchema,
    StringNodeValueRequiredSchema,
    StringValueRequiredSchema,
    LanguageValueSchema,
} from '@/bcgov_arches_common/datatypes/string/validation/zod.ts';
import type { StringValue } from '@/arches_component_lab/datatypes/string/types.ts';
import type { ConceptValue } from '@/arches_component_lab/datatypes/concept/types.ts';
import {
    BcPropertyLegalDescriptionTileSchema,
    type BcPropertyLegalDescriptionTileType,
} from '@/bcrhp/schemas/heritage_site/bc_property_legal_description.ts';
import { blankConceptValue } from '@/arches_component_lab/datatypes/concept/utils.ts';
import { blankStringValue } from '@/bcrhp/utils.ts';

const postalCodeNodeSchema = StringNodeValueRequiredSchema.extend({
    en: LanguageValueSchema.safeExtend({
        value: z
            .string()
            .trim()
            .min(1, { message: 'Value is required.' })
            .max(7, {
                message: `Maximum length is 7 characters`,
            })
            .regex(/^[A-Z]\d[A-Z] \d[A-Z]\d$/, {
                message: 'Invalid format. Please use A9A 9A9.',
            }),
    }),
});

const PostalCodeValueSchema = StringValueRequiredSchema.extend({
    node_value: postalCodeNodeSchema,
});

export const BcPropertyAddressTileSchema = TileSchema.extend({
    aliased_data: z.object({
        street_address: getStringValueRequiredSchema(80),
        postal_code: PostalCodeValueSchema,
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
