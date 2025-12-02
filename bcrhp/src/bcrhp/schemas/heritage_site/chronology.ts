import { z } from 'zod';
import { ConceptValueRequiredSchema } from '@/bcgov_arches_common/datatypes/concept/validation/zod.ts';

// Auto-generated tile schema for alias: chronology

const StartYearNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const DatesApproximateNodeSchema = z.object({
    node_value: z.boolean().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const InformationSourceNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const ChronologyNotesNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const EndYearNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

export const ChronologyTileSchema = z.object({
    tileid: z.string().nullable(),
    resourceinstance: z.string().nullable(),
    nodegroup: z.string().nullable(),
    parenttile: z.string().nullable(),
    aliased_data: z.object({
        start_year: StartYearNodeSchema,
        dates_approximate: DatesApproximateNodeSchema,
        information_source: InformationSourceNodeSchema,
        chronology: z.array(ConceptValueRequiredSchema),
        chronology_notes: ChronologyNotesNodeSchema,
        end_year: EndYearNodeSchema,
    }),
    sortorder: z.number().nullable(),
    provisionaledits: z.unknown().nullable(),
});
// @ts-ignore
export type ChronologyTileType = z.infer<typeof ChronologyTileSchema>;
