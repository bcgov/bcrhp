import { z } from 'zod';
import { TileSchema } from '@/bcgov_arches_common/datatypes/tile.ts';
import { ConceptValueSchema } from '@/bcgov_arches_common/datatypes/concept/validation/zod.ts';
import { DateValueSchema } from '@/bcgov_arches_common/datatypes/date/validation/zod.ts';
import { getRichTextValueRequiredSchema } from '@/bcgov_arches_common/datatypes/string/validation/zod.ts';
import type { DateAliasedNodeData } from '@/arches_component_lab/datatypes/date/types.ts';
import type { ConceptAliasedNodeData } from '@/arches_component_lab/datatypes/concept/types.ts';
import type { StringAliasedNodeData } from '@/arches_component_lab/datatypes/string/types.ts';
import { buildConceptAliasedNodeData } from '@/arches_component_lab/datatypes/concept/utils.ts';
import { currentDateValue } from '@/bcrhp/utils.ts';

// Auto-generated tile schema for alias: internal_remark

export const InternalRemarkTileSchema = TileSchema.extend({
    aliased_data: z.object({
        remark_date: DateValueSchema,
        remark_type: ConceptValueSchema,
        internal_remark: z.array(getRichTextValueRequiredSchema(1000)),
    }),
});
// @ts-ignore
export type InternalRemarkTileType = z.infer<typeof InternalRemarkTileSchema>;

export function getInternalRemark(): InternalRemarkTileType {
    return new InternalRemark();
}

export class InternalRemark implements InternalRemarkTileType {
    constructor() {
        this.aliased_data = {
            remark_date: currentDateValue(),
            remark_type: buildConceptAliasedNodeData(null, []),
            internal_remark: [],
        };
    }
    aliased_data: {
        remark_date: DateAliasedNodeData;
        remark_type: ConceptAliasedNodeData;
        internal_remark: StringAliasedNodeData[];
    };
}
