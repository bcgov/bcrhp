import * as uuid from 'uuid';
import { z } from 'zod';
import { TileSchema } from '@/bcgov_arches_common/datatypes/tile.ts';
import { FileListValueSchema } from '@/bcgov_arches_common/datatypes/file-list/validation/zod.ts';
import { ConceptValueSchema } from '@/bcgov_arches_common/datatypes/concept/validation/zod.ts';
import { getStringValueSchema } from '@/bcgov_arches_common/datatypes/string/validation/zod.ts';
import type { FileListAliasedNodeData } from '@/arches_component_lab/datatypes/file-list/types.ts';
import type { ConceptAliasedNodeData } from '@/arches_component_lab/datatypes/concept/types.ts';
import type { StringAliasedNodeData } from '@/arches_component_lab/datatypes/string/types.ts';
import { buildConceptAliasedNodeData } from '@/arches_component_lab/datatypes/concept/utils.ts';
import { blankStringValue, blankFileListValue } from '@/bcrhp/utils.ts';

// Auto-generated tile schema for alias: site_document

export const SiteDocumentTileSchema = TileSchema.extend({
    aliased_data: z.object({
        site_document: FileListValueSchema,
        document_description: getStringValueSchema(250),
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
        this.tileid = uuid.generate();
        this.aliased_data = {
            site_document: blankFileListValue(),
            document_description: blankStringValue(),
            document_type: buildConceptAliasedNodeData(),
        };
    }
    tileid: string;
    aliased_data: {
        site_document: FileListAliasedNodeData;
        document_description: StringAliasedNodeData;
        document_type: ConceptAliasedNodeData;
    };
}
