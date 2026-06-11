import { z } from 'zod';
import { TileSchema } from '@/bcgov_arches_common/datatypes/tile.ts';
import { BooleanValueSchema } from '@/bcgov_arches_common/datatypes/boolean/validation/zod.ts';
import { NumberValueSchema } from '@/bcgov_arches_common/datatypes/numeric/validation/zod.ts';
import { ConceptValueSchema } from '@/bcgov_arches_common/datatypes/concept/validation/zod.ts';
import { DateValueSchema } from '@/bcgov_arches_common/datatypes/date/validation/zod.ts';
import { blankNumberValue } from '@/bcrhp/utils.ts';
import { buildConceptAliasedNodeData } from '@/arches_component_lab/datatypes/concept/utils.ts';
import type { NumberAliasedNodeData } from '@/arches_component_lab/datatypes/number/types.ts';
import type { ConceptAliasedNodeData } from '@/arches_component_lab/datatypes/concept/types.ts';

import type { BooleanAliasedNodeData } from '@/arches_component_lab/datatypes/boolean/types.ts';
import { blankBooleanValue } from '@/bcrhp/utils.ts';
import type { DateAliasedNodeData } from '@/arches_component_lab/datatypes/date/types.ts';
import { blankDateValue } from '@/bcrhp/utils.ts';

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
            bcrhp_submission_status: buildConceptAliasedNodeData(null, []),
            federal_id_number: blankNumberValue(),
            date_submitted_to_crhp: blankDateValue(),
            restricted: blankBooleanValue(),
            crhp_submission_status: buildConceptAliasedNodeData(null, []),
        };
    }
    aliased_data: {
        bcrhp_submission_status: ConceptAliasedNodeData;
        federal_id_number: NumberAliasedNodeData;
        date_submitted_to_crhp: DateAliasedNodeData;
        restricted: BooleanAliasedNodeData;
        crhp_submission_status: ConceptAliasedNodeData;
    };
}
