import { z } from 'zod';

// Auto-generated tile schema for alias: site_boundary

const AccuracyRemarksNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const SourceNotesNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

export const SiteBoundaryTileSchema = z.object({
    tileid: z.string().nullable(),
    resourceinstance: z.string().nullable(),
    nodegroup: z.string().nullable(),
    parenttile: z.string().nullable(),
    aliased_data: z.object({
        accuracy_remarks: AccuracyRemarksNodeSchema,
        source_notes: SourceNotesNodeSchema,
        site_boundary: z.array(SiteBoundaryTileSchema),
    }),
    sortorder: z.number().nullable(),
    provisionaledits: z.unknown().nullable(),
});
// @ts-ignore
export type SiteBoundaryTileType = z.infer<typeof SiteBoundaryTileSchema>;
