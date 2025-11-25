import { z } from 'zod';

// Auto-generated tile schema for alias: site_document

const DocumentDescriptionNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

const DocumentTypeNodeSchema = z.object({
    node_value: z.string().nullable(),
    display_value: z.string(),
    details: z.array(z.unknown()),
});

export const SiteDocumentTileSchema = z.object({
    tileid: z.string().nullable(),
    resourceinstance: z.string().nullable(),
    nodegroup: z.string().nullable(),
    parenttile: z.string().nullable(),
    aliased_data: z.object({
        site_document: z.array(SiteDocumentTileSchema),
        document_description: DocumentDescriptionNodeSchema,
        document_type: DocumentTypeNodeSchema,
    }),
    sortorder: z.number().nullable(),
    provisionaledits: z.unknown().nullable(),
});

export type SiteDocumentTileType = z.infer<typeof SiteDocumentTileSchema>;