import { z } from 'zod';
import { TileSchema } from '@/arches_zod_validation/datatypes/tile.ts';
import { ConceptValueSchema } from '@/arches_zod_validation/datatypes/concept/validation/zod.ts';
import { DateValueSchema } from '@/arches_zod_validation/datatypes/date/validation/zod.ts';
import { getRichTextValueRequiredSchema } from '@/arches_zod_validation/datatypes/string/validation/zod.ts';
import type { DateValue } from '@/arches_component_lab/datatypes/date/types.ts';
import type { ConceptValue } from '@/arches_component_lab/datatypes/concept/types.ts';
import type { StringValue } from '@/arches_component_lab/datatypes/string/types.ts';
import { blankConceptValue } from '@/arches_component_lab/datatypes/concept/utils.ts';
import { currentDateValue } from '@/arches_zod_validation/utils.ts';

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
            remark_type: blankConceptValue(),
            internal_remark: [],
        };
    }
    aliased_data: {
        remark_date: DateValue;
        remark_type: ConceptValue;
        internal_remark: StringValue[];
    };
}
