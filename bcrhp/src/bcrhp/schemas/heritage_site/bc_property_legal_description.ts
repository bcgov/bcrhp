import { z } from 'zod';

// Auto-generated tile schema for alias: bc_property_legal_description

const LegalAddressInternalNotesNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const PinNodeSchema = z.object({
    node_value: z.number().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const PidNodeSchema = z.object({
    node_value: z.number().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const LegalDescriptionNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

export const BcPropertyLegalDescriptionTileSchema = z.object({
    tileid: z.string().nullable(),
    resourceinstance: z.string().nullable(),
    nodegroup: z.string().nullable(),
    parenttile: z.string().nullable(),
    aliased_data: z.object({
        legal_address_internal_notes: LegalAddressInternalNotesNodeSchema,
        pin: PinNodeSchema,
        pid: PidNodeSchema,
        legal_description: LegalDescriptionNodeSchema,
    }),
    sortorder: z.number().nullable(),
    provisionaledits: z.unknown().nullable(),
});
// @ts-ignore
export type BcPropertyLegalDescriptionTileType = z.infer<
    typeof BcPropertyLegalDescriptionTileSchema
>;
