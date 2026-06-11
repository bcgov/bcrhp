import * as uuid from 'uuid';
import { z } from 'zod';
import { TileSchema } from '@/bcgov_arches_common/datatypes/tile.ts';
import { BooleanValueSchema } from '@/bcgov_arches_common/datatypes/boolean/validation/zod.ts';
import { FileListValueSchema } from '@/bcgov_arches_common/datatypes/file-list/validation/zod.ts';
import { ConceptValueSchema } from '@/bcgov_arches_common/datatypes/concept/validation/zod.ts';
import { YearValueSchema } from '@/bcgov_arches_common/datatypes/date/validation/zod.ts';
import type { StringAliasedNodeData } from '@/arches_component_lab/datatypes/string/types.ts';
import type { ConceptAliasedNodeData } from '@/arches_component_lab/datatypes/concept/types.ts';
import type { FileListAliasedNodeData } from '@/arches_component_lab/datatypes/file-list/types.ts';
import type { DateAliasedNodeData } from '@/arches_component_lab/datatypes/date/types.ts';
import {
    getStringValueSchema,
    getRichTextValueSchema,
} from '@/bcgov_arches_common/datatypes/string/validation/zod.ts';
import { buildConceptAliasedNodeData } from '@/arches_component_lab/datatypes/concept/utils.ts';
import {
    blankStringValue,
    blankFileListValue,
    blankBooleanValue,
    falseBooleanValue,
    blankDateValue,
} from '@/bcrhp/utils.ts';
import type { BooleanAliasedNodeData } from '@/arches_component_lab/datatypes/boolean/types.ts';

// Auto-generated tile schema for alias: site_images

export const SiteImagesTileSchema = TileSchema.extend({
    aliased_data: z.object({
        image_type: ConceptValueSchema,
        site_images: FileListValueSchema,
        image_date: YearValueSchema,
        image_features: getStringValueSchema(),
        image_description: getRichTextValueSchema(),
        primary_image: BooleanValueSchema,
        image_view: ConceptValueSchema,
        photographer: getStringValueSchema(),
        submit_to_crhp: BooleanValueSchema,
        copyright: getStringValueSchema(),
    }),
});
// @ts-ignore
export type SiteImagesTileType = z.infer<typeof SiteImagesTileSchema>;

export function getSiteImages(): SiteImagesTileType {
    return new SiteImages();
}

// @todo - Figure out object state - New/Updated/Deleted
export class SiteImages implements SiteImagesTileType {
    constructor() {
        this.tileid = uuid.generate();
        this.aliased_data = {
            image_type: buildConceptAliasedNodeData(null, []),
            site_images: blankFileListValue(),
            image_date: blankDateValue(),
            image_features: blankStringValue(),
            image_description: blankStringValue(),
            primary_image: falseBooleanValue(),
            image_view: buildConceptAliasedNodeData(null, []),
            photographer: blankStringValue(),
            submit_to_crhp: blankBooleanValue(),
            copyright: blankStringValue(),
        };
    }
    tileid: string;
    aliased_data: {
        image_type: ConceptAliasedNodeData;
        site_images: FileListAliasedNodeData;
        image_date: DateAliasedNodeData;
        image_features: StringAliasedNodeData;
        image_description: StringAliasedNodeData;
        primary_image: BooleanAliasedNodeData;
        image_view: ConceptAliasedNodeData;
        photographer: StringAliasedNodeData;
        submit_to_crhp: BooleanAliasedNodeData;
        copyright: StringAliasedNodeData;
    };
}
