import { z } from 'zod';
import { ConceptValueSchema } from '@/bcgov_arches_common/datatypes/concept/validation/zod.ts';
import { TileSchema } from '@/bcgov_arches_common/datatypes/tile.ts';
import { ProtectionEventTileSchema } from '@/bcrhp/schemas/heritage_site/protection_event.ts';

// Auto-generated tile schema for alias: bc_right

const RegistryTypesNodeSchema = z.object({
    node_value: z.array(z.string()).nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const OfficiallyRecognizedSiteNodeSchema = z.object({
    node_value: z.boolean().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

export const BcRightTileSchema = TileSchema.extend({
    aliased_data: z.object({
        registry_types: RegistryTypesNodeSchema,
        officially_recognized_site: OfficiallyRecognizedSiteNodeSchema,
        registration_status: ConceptValueSchema,
        protection_event: z.array(ProtectionEventTileSchema),
    }),
});
// @ts-ignore
export type BcRightTileType = z.infer<typeof BcRightTileSchema>;
