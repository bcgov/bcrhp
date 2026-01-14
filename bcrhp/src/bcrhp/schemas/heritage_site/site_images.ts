import { z } from 'zod';
import { TileSchema } from '@/bcgov_arches_common/datatypes/tile.ts';
import { BooleanValueSchema } from '@/bcgov_arches_common/datatypes/boolean/validation/zod.ts';
import { FileListValueSchema } from '@/bcgov_arches_common/datatypes/file-list/validation/zod.ts';
import { ConceptValueSchema } from '@/bcgov_arches_common/datatypes/concept/validation/zod.ts';
import { DateValueSchema } from '@/bcgov_arches_common/datatypes/date/validation/zod.ts';
import type { StringValue } from '@/arches_component_lab/datatypes/string/types.ts';
import type { ConceptValue } from '@/arches_component_lab/datatypes/concept/types.ts';
import type { FileListValue } from '@/arches_component_lab/datatypes/file-list/types.ts';
import type { DateValue } from '@/arches_component_lab/datatypes/date/types.ts';
import {
    getStringValueSchema,
    getRichTextValueSchema,
} from '@/bcgov_arches_common/datatypes/string/validation/zod.ts';
import { blankConceptValue } from '@/arches_component_lab/datatypes/concept/utils.ts';
import { blankStringValue, blankFileListValue } from '@/bcrhp/utils.ts';
import { currentDateValue } from '@/bcrhp/utils.ts';

// Auto-generated tile schema for alias: site_images

export const SiteImagesTileSchema = TileSchema.extend({
    aliased_data: z.object({
        image_type: ConceptValueSchema,
        site_images: z.array(FileListValueSchema),
        image_date: DateValueSchema,
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
        this.aliased_data = {
            image_type: blankConceptValue(),
            site_images: blankFileListValue(),
            image_date: currentDateValue(),
            image_features: blankStringValue(),
            image_description: blankStringValue(),
            primary_image: true,
            image_view: blankConceptValue(),
            photographer: blankStringValue(),
            submit_to_crhp: false,
            copyright: blankStringValue(),
        };
    }
    aliased_data: {
        image_type: ConceptValue;
        site_images: FileListValue;
        image_date: DateValue;
        image_features: StringValue;
        image_description: StringValue;
        primary_image: boolean;
        image_view: ConceptValue;
        photographer: StringValue;
        submit_to_crhp: boolean;
        copyright: StringValue;
    };
}
