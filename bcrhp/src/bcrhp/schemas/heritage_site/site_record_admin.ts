import { z } from 'zod';

// Auto-generated tile schema for alias: site_record_admin

const BcrhpSubmissionStatusNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const FederalIdNumberNodeSchema = z.object({
    node_value: z.number().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const DateSubmittedToCrhpNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const RestrictedNodeSchema = z.object({
    node_value: z.boolean().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const CrhpSubmissionStatusNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

export const SiteRecordAdminTileSchema = z.object({
    tileid: z.string().nullable(),
    resourceinstance: z.string().nullable(),
    nodegroup: z.string().nullable(),
    parenttile: z.string().nullable(),
    aliased_data: z.object({
        bcrhp_submission_status: BcrhpSubmissionStatusNodeSchema,
        federal_id_number: FederalIdNumberNodeSchema,
        date_submitted_to_crhp: DateSubmittedToCrhpNodeSchema,
        restricted: RestrictedNodeSchema,
        crhp_submission_status: CrhpSubmissionStatusNodeSchema,
    }),
    sortorder: z.number().nullable(),
    provisionaledits: z.unknown().nullable(),
});

export type SiteRecordAdminTileType = z.infer<typeof SiteRecordAdminTileSchema>;