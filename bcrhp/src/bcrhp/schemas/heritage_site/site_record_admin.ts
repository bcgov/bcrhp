import { z } from 'zod';
import { TileSchema } from '@/arches_zod_validation/datatypes/tile.ts';
import { BooleanValueSchema } from '@/arches_zod_validation/datatypes/boolean/validation/zod.ts';
import { NumberValueSchema } from '@/arches_zod_validation/datatypes/numeric/validation/zod.ts';
import { ConceptValueSchema } from '@/arches_zod_validation/datatypes/concept/validation/zod.ts';
import { DateValueSchema } from '@/arches_zod_validation/datatypes/date/validation/zod.ts';
import { blankNumberValue } from '@/arches_zod_validation/utils.ts';
import { blankConceptValue } from '@/arches_component_lab/datatypes/concept/utils.ts';
import type { NumberValue } from '@/arches_component_lab/datatypes/number/types.ts';
import type { ConceptValue } from '@/arches_component_lab/datatypes/concept/types.ts';

import type { BooleanValue } from '@/arches_component_lab/datatypes/boolean/types.ts';
import { blankBooleanValue } from '@/arches_zod_validation/utils.ts';
import type { DateValue } from '@/arches_component_lab/datatypes/date/types.ts';
import { blankDateValue } from '@/arches_zod_validation/utils.ts';

// Auto-generated tile schema for alias: site_record_admin

export const SiteRecordAdminTileSchema = TileSchema.extend({
    aliased_data: z.object({
        bcrhp_submission_status: ConceptValueSchema,
        federal_id_number: NumberValueSchema,
        date_submitted_to_crhp: DateValueSchema,
        restricted: BooleanValueSchema,
        crhp_submission_status: ConceptValueSchema,
    }),
});
// @ts-ignore
export type SiteRecordAdminTileType = z.infer<typeof SiteRecordAdminTileSchema>;

export function getSiteRecordAdmin(): SiteRecordAdminTileType {
    return new SiteRecordAdmin();
}

export class SiteRecordAdmin implements SiteRecordAdminTileType {
    constructor() {
        this.aliased_data = {
            bcrhp_submission_status: blankConceptValue(),
            federal_id_number: blankNumberValue(),
            date_submitted_to_crhp: blankDateValue(),
            restricted: blankBooleanValue(),
            crhp_submission_status: blankConceptValue(),
        };
    }
    aliased_data: {
        bcrhp_submission_status: ConceptValue;
        federal_id_number: NumberValue;
        date_submitted_to_crhp: DateValue;
        restricted: BooleanValue;
        crhp_submission_status: ConceptValue;
    };
}
