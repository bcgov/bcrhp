import { z } from 'zod';

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

const RegistrationStatusNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

export const BcRightTileSchema = z.object({
    tileid: z.string().nullable(),
    resourceinstance: z.string().nullable(),
    nodegroup: z.string().nullable(),
    parenttile: z.string().nullable(),
    aliased_data: z.object({
        registry_types: RegistryTypesNodeSchema,
        officially_recognized_site: OfficiallyRecognizedSiteNodeSchema,
        registration_status: RegistrationStatusNodeSchema,
        protection_event: z.array(ProtectionEventTileSchema),
    }),
    sortorder: z.number().nullable(),
    provisionaledits: z.unknown().nullable(),
});

export type BcRightTileType = z.infer<typeof BcRightTileSchema>;