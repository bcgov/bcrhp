import { z } from 'zod';

// Auto-generated tile schema for alias: protection_event

const ProtectionNotesNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const DesignationOrProtectionStartDateNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const DesignationOrProtectionEndDateNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const ResponsibleGovernmentNodeSchema = z.object({
    node_value: z.any().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const LegislativeActNodeSchema = z.object({
    node_value: z.any().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const ReferenceNumberNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

export const ProtectionEventTileSchema = z.object({
    tileid: z.string().nullable(),
    resourceinstance: z.string().nullable(),
    nodegroup: z.string().nullable(),
    parenttile: z.string().nullable(),
    aliased_data: z.object({
        protection_notes: ProtectionNotesNodeSchema,
        designation_or_protection_start_date:
            DesignationOrProtectionStartDateNodeSchema,
        designation_or_protection_end_date:
            DesignationOrProtectionEndDateNodeSchema,
        responsible_government: ResponsibleGovernmentNodeSchema,
        legislative_act: LegislativeActNodeSchema,
        reference_number: ReferenceNumberNodeSchema,
    }),
    sortorder: z.number().nullable(),
    provisionaledits: z.unknown().nullable(),
});

// @ts-ignore
export type ProtectionEventTileType = z.infer<typeof ProtectionEventTileSchema>;
