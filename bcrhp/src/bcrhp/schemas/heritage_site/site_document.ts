import * as uuid from 'uuid';
import { z } from 'zod';
import { TileSchema } from '@/arches_zod_validation/datatypes/tile.ts';
import { FileListValueSchema } from '@/arches_zod_validation/datatypes/file-list/validation/zod.ts';
import { ConceptValueSchema } from '@/arches_zod_validation/datatypes/concept/validation/zod.ts';
import { getStringValueSchema } from '@/arches_zod_validation/datatypes/string/validation/zod.ts';
import type { FileListValue } from '@/arches_component_lab/datatypes/file-list/types.ts';
import type { ConceptValue } from '@/arches_component_lab/datatypes/concept/types.ts';
import type { StringValue } from '@/arches_component_lab/datatypes/string/types.ts';
import { blankConceptValue } from '@/arches_component_lab/datatypes/concept/utils.ts';
import {
    blankStringValue,
    blankFileListValue,
} from '@/arches_zod_validation/utils.ts';

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
            document_type: blankConceptValue(),
        };
    }
    tileid: string;
    aliased_data: {
        site_document: FileListValue;
        document_description: StringValue;
        document_type: ConceptValue;
    };
}
