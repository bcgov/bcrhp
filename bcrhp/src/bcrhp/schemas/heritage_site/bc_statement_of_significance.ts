import { z } from 'zod';

// Auto-generated tile schema for alias: bc_statement_of_significance

const HeritageValueNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const DefiningElementsNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const PhysicalDescriptionNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const SignificanceTypeNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const DocumentLocationNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

export const BcStatementOfSignificanceTileSchema = z.object({
    tileid: z.string().nullable(),
    resourceinstance: z.string().nullable(),
    nodegroup: z.string().nullable(),
    parenttile: z.string().nullable(),
    aliased_data: z.object({
        heritage_value: HeritageValueNodeSchema,
        defining_elements: DefiningElementsNodeSchema,
        physical_description: PhysicalDescriptionNodeSchema,
        significance_type: SignificanceTypeNodeSchema,
        document_location: DocumentLocationNodeSchema,
    }),
    sortorder: z.number().nullable(),
    provisionaledits: z.unknown().nullable(),
});
// @ts-ignore
export type BcStatementOfSignificanceTileType = z.infer<
    typeof BcStatementOfSignificanceTileSchema
>;
