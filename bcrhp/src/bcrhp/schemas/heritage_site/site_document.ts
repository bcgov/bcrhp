import { z } from 'zod';
import { TileSchema } from '@/bcgov_arches_common/datatypes/tile.ts';
import { FileListValueSchema } from '@/bcgov_arches_common/datatypes/file-list/validation/zod.ts';
import { ConceptValueSchema } from '@/bcgov_arches_common/datatypes/concept/validation/zod.ts';
import { getStringValueSchema } from '@/bcgov_arches_common/datatypes/string/validation/zod.ts';

// Auto-generated tile schema for alias: site_document

export const SiteDocumentTileSchema = TileSchema.extend({
    aliased_data: z.object({
        site_document: z.array(FileListValueSchema),
        document_description: getStringValueSchema(),
        document_type: ConceptValueSchema,
    }),
});
// @ts-ignore
export type SiteDocumentTileType = z.infer<typeof SiteDocumentTileSchema>;
