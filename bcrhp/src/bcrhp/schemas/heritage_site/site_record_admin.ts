import { z } from 'zod';
import { TileSchema } from '@/bcgov_arches_common/datatypes/tile.ts';
import { BooleanValueSchema } from '@/bcgov_arches_common/datatypes/boolean/validation/zod.ts';
import { NumberValueSchema } from '@/bcgov_arches_common/datatypes/numeric/validation/zod.ts';
import { ConceptValueSchema } from '@/bcgov_arches_common/datatypes/concept/validation/zod.ts';
import { DateValueSchema } from '@/bcgov_arches_common/datatypes/date/validation/zod.ts';

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
