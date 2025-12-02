import { z } from 'zod';
import type { StringValue } from '@/arches_component_lab/datatypes/string/types.ts';
import { blankStringValue } from '@/bcrhp/utils.ts';
import { blankConceptValue } from '@/arches_component_lab/datatypes/concept/utils.ts';
import {
    PostalCodeNodeSchema,
    ProvinceNodeSchema,
} from '@bcrhp/schemas/heritage_site/bc_property_address.ts';
import type { ConceptValue } from '@/arches_component_lab/datatypes/concept/types.ts';
import {
    getStringValueSchema,
    getStringValueRequiredSchema,
} from '@/bcgov_arches_common/datatypes/string/validation/zod.ts';
// @todo - Need to make parts of the model required if hasCivicAddress == true
const CivicAddressSchema = z.object({
    aliased_data: z.object({
        //hasCivicAddress: z.boolean().default(true),
        //overrideAddress: z.boolean().default(false),
        street_address: getStringValueRequiredSchema(80),
        postal_code: PostalCodeNodeSchema,
        location_description: getStringValueRequiredSchema(50),
        city: getStringValueRequiredSchema(80),
        province: ProvinceNodeSchema,
        locality: getStringValueSchema(50),
        bc_property_legal_description: z.array(
            BcPropertyLegalDescriptionTileSchema,
        ),
    }),
});

const requiredCivicAddressSchema = CivicAddressSchema.partial({
    hasCivicAddress: true,
});
// @ts-ignore
type CivicAddressType = z.infer<typeof CivicAddressSchema>;

function getCivicAddress(): CivicAddressType {
    return new CivicAddress();
}
class CivicAddress implements CivicAddressType {
    constructor() {
        this.aliased_data = {
            civicAddressId: crypto.randomUUID(),
            street_address: blankStringValue(),
            postal_code: blankStringValue(),
            location_description: blankStringValue(),
            city: blankStringValue(),
            province: blankConceptValue(),
            locality: blankStringValue(),
            bc_property_legal_description: blankStringValue(),
            //legalDescriptions = <(typeof LegalDescription)[]>;
        };
    }
    aliased_data: {
        civicAddressId: StringValue;
        street_address: StringValue;
        postal_code: StringValue;
        location_description: StringValue;
        city: StringValue;
        province: ConceptValue;
        locality: StringValue;
        bc_property_legal_description: StringValue;
        //legalDescriptions: (typeof LegalDescription)[];
    };
}

console.log(requiredCivicAddressSchema);

export {
    CivicAddress,
    CivicAddressSchema,
    getCivicAddress,
    requiredCivicAddressSchema,
    type CivicAddressType,
};
