import { z } from 'zod';
import type { StringValue } from '@/arches_component_lab/datatypes/string/types.ts';
import type { NumberValue } from '@/arches_component_lab/datatypes/number/types.ts';
import { blankStringValue } from '@/bcrhp/utils.ts';
import {
    LegalAddressInternalNotesNodeSchema,
    PinNodeSchema,
    PidNodeSchema,
    LegalDescriptionNodeSchema,
} from '@bcrhp/schemas/heritage_site/bc_property_legal_description.ts';

const LegalDescriptionSchema = z.object({
    aliased_data: z.object({
        legal_address_internal_notes: LegalAddressInternalNotesNodeSchema,
        pin: PinNodeSchema,
        pid: PidNodeSchema,
        legal_description: LegalDescriptionNodeSchema,
    }),
});
// @ts-ignore
type LegalDescriptionType = z.infer<typeof LegalDescriptionSchema>;

const requiredLegalDescriptionSchema = LegalDescriptionSchema.partial({});

function getLegalDescription(): LegalDescriptionType {
    return new LegalDescription();
}

class LegalDescription implements LegalDescriptionType {
    constructor() {
        this.aliased_data = {
            legal_address_internal_notes: blankStringValue(),
            pin: blankStringValue(),
            pid: blankStringValue(),
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

export {
    LegalDescription,
    LegalDescriptionSchema,
    getLegalDescription,
    requiredLegalDescriptionSchema,
    type LegalDescriptionType,
};
