import { z } from 'zod';
import { TileSchema } from '@/bcgov_arches_common/datatypes/tile.ts';
import { FileListValueSchema } from '@/bcgov_arches_common/datatypes/file-list/validation/zod.ts';
import { ConceptValueSchema } from '@/bcgov_arches_common/datatypes/concept/validation/zod.ts';
import { getStringValueSchema } from '@/bcgov_arches_common/datatypes/string/validation/zod.ts';
import type { FileListValue } from '@/arches_component_lab/datatypes/file-list/types.ts';
import type { ConceptValue } from '@/arches_component_lab/datatypes/concept/types.ts';
import type { StringValue } from '@/arches_component_lab/datatypes/string/types.ts';
import { blankConceptValue } from '@/arches_component_lab/datatypes/concept/utils.ts';
import { blankStringValue, blankFileListValue } from '@/bcrhp/utils.ts';

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

export function getSiteDocument(): SiteDocumentTileType {
    return new SiteDocument();
}

export class SiteDocument implements SiteDocumentTileType {
    constructor() {
        this.aliased_data = {
            site_document: blankFileListValue(),
            document_description: blankStringValue(),
            document_type: blankConceptValue(),
        };
    }
    aliased_data: {
        site_document: FileListValue;
        document_description: StringValue;
        document_type: ConceptValue;
    };
}
