import { z } from 'zod';
import { getRichTextValueSchema } from '@/bcgov_arches_common/datatypes/string/validation/zod.ts';
// Auto-generated tile schema for alias: internal_remark

const RemarkDateNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const RemarkTypeNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

export const InternalRemarkTileSchema = z.object({
    tileid: z.string().nullable(),
    resourceinstance: z.string().nullable(),
    nodegroup: z.string().nullable(),
    parenttile: z.string().nullable(),
    aliased_data: z.object({
        remark_date: RemarkDateNodeSchema,
        remark_type: RemarkTypeNodeSchema,
        internal_remark: z.array(getRichTextValueSchema(1000)),
    }),
    sortorder: z.number().nullable(),
    provisionaledits: z.unknown().nullable(),
});
// @ts-ignore
export type InternalRemarkTileType = z.infer<typeof InternalRemarkTileSchema>;
