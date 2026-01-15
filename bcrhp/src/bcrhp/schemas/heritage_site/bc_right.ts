import { z } from 'zod';
import { ConceptValueSchema } from '@/bcgov_arches_common/datatypes/concept/validation/zod.ts';
import { TileSchema } from '@/bcgov_arches_common/datatypes/tile.ts';
import {
    ProtectionEventTileSchema,
    type ProtectionEventTileType,
} from '@/bcrhp/schemas/heritage_site/protection_event.ts';
import type { BooleanValue } from '@/arches_component_lab/datatypes/boolean/types.ts';
import { BooleanValueSchema } from '@/bcgov_arches_common/datatypes/boolean/validation/zod.ts';
import type { ConceptListValue } from '@/arches_component_lab/datatypes/concept-list/types.ts';
import type { ConceptValue } from '@/arches_component_lab/datatypes/concept/types.ts';
import { blankConceptValue } from '@/arches_component_lab/datatypes/concept/utils.ts';
import { blankConceptListValue } from '@/arches_component_lab/datatypes/concept-list/utils.ts';
import { blankBooleanValue } from '@/bcrhp/utils.ts';

// Auto-generated tile schema for alias: bc_right

const RegistryTypesNodeSchema = z.object({
    node_value: z.array(z.string()).nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

export const BcRightTileSchema = TileSchema.extend({
    aliased_data: z.object({
        registry_types: RegistryTypesNodeSchema,
        officially_recognized_site: BooleanValueSchema,
        registration_status: ConceptValueSchema,
        protection_event: z.array(ProtectionEventTileSchema),
    }),
});
// @ts-ignore
export type BcRightTileType = z.infer<typeof BcRightTileSchema>;

export function getBcRight(): BcRightTileType {
    return new BcRight();
}

export class BcRight implements BcRightTileType {
    constructor() {
        this.aliased_data = {
            registry_types: blankConceptListValue(),
            officially_recognized_site: blankBooleanValue(),
            registration_status: blankConceptValue(),
            protection_event: [],
        };
    }
    aliased_data: {
        registry_types: ConceptListValue;
        officially_recognized_site: BooleanValue;
        registration_status: ConceptValue;
        protection_event: ProtectionEventTileType[];
    };
}
