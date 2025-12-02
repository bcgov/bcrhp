import { z } from 'zod';
import type { StringValue } from '@/arches_component_lab/datatypes/string/types.ts';
import { blankStringValue, currentDateValue } from '@/bcrhp/utils.ts';
import type { DateValue } from '@/arches_component_lab/datatypes/date/types.ts';
import { getStringValueRequiredSchema } from '@/bcgov_arches_common/datatypes/string/validation/zod.ts';
import {
    ProtectionNotesNodeSchema,
    DesignationOrProtectionStartDateNodeSchema,
    DesignationOrProtectionEndDateNodeSchema,
    ResponsibleGovernmentNodeSchema,
    LegislativeActNodeSchema,
} from '@bcrhp/schemas/heritage_site/protection_event.ts';

const RecognitionDetailsSchema = z.object({
    aliased_data: z.object({
        protection_notes: ProtectionNotesNodeSchema,
        designation_or_protection_start_date:
            DesignationOrProtectionStartDateNodeSchema,
        designation_or_protection_end_date:
            DesignationOrProtectionEndDateNodeSchema,
        responsible_government: ResponsibleGovernmentNodeSchema,
        legislative_act: LegislativeActNodeSchema,
        reference_number: getStringValueRequiredSchema(12),
    }),
});

const requiredRecognitionDetailsSchema = RecognitionDetailsSchema.partial();

// @ts-ignore
type RecognitionDetailsType = z.infer<typeof RecognitionDetailsSchema>;

function getRecognitionDetails(): RecognitionDetailsType {
    return new RecognitionDetails();
}

// @todo - Figure out object state - New/Updated/Deleted
class RecognitionDetails implements RecognitionDetailsType {
    constructor() {
        this.aliased_data = {
            protection_notes: blankStringValue(),
            designation_or_protection_start_date: currentDateValue(),
            designation_or_protection_end_date: currentDateValue(),
            responsible_government: blankStringValue(),
            legislative_act: blankStringValue(),
            reference_number: blankStringValue(),
        };
    }
    aliased_data: {
        protection_notes: StringValue;
        designation_or_protection_start_date: DateValue;
        designation_or_protection_end_date: DateValue;
        responsible_government: StringValue;
        legislative_act: StringValue;
        reference_number: StringValue;
    };
}

export {
    RecognitionDetails,
    RecognitionDetailsSchema,
    getRecognitionDetails,
    requiredRecognitionDetailsSchema,
    type RecognitionDetailsType,
};
