import * as uuid from 'uuid';
import { z } from 'zod';
import { TileSchema } from '@/arches_zod_validation/datatypes/tile.ts';
import { BooleanValueSchema } from '@/arches_zod_validation/datatypes/boolean/validation/zod.ts';
import { FileListValueSchema } from '@/arches_zod_validation/datatypes/file-list/validation/zod.ts';
import { ConceptValueSchema } from '@/arches_zod_validation/datatypes/concept/validation/zod.ts';
import { YearValueSchema } from '@/arches_zod_validation/datatypes/date/validation/zod.ts';
import type { StringValue } from '@/arches_component_lab/datatypes/string/types.ts';
import type { ConceptValue } from '@/arches_component_lab/datatypes/concept/types.ts';
import type { FileListValue } from '@/arches_component_lab/datatypes/file-list/types.ts';
import type { DateValue } from '@/arches_component_lab/datatypes/date/types.ts';
import {
    getStringValueSchema,
    getRichTextValueSchema,
} from '@/arches_zod_validation/datatypes/string/validation/zod.ts';
import { blankConceptValue } from '@/arches_component_lab/datatypes/concept/utils.ts';
import {
    blankStringValue,
    blankFileListValue,
    blankBooleanValue,
    falseBooleanValue,
    blankDateValue,
} from '@/arches_zod_validation/utils.ts';
import type { BooleanValue } from '@/arches_component_lab/datatypes/boolean/types.ts';

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
            image_type: blankConceptValue(),
            site_images: blankFileListValue(),
            image_date: blankDateValue(),
            image_features: blankStringValue(),
            image_description: blankStringValue(),
            primary_image: falseBooleanValue(),
            image_view: blankConceptValue(),
            photographer: blankStringValue(),
            submit_to_crhp: blankBooleanValue(),
            copyright: blankStringValue(),
        };
    }
    tileid: string;
    aliased_data: {
        image_type: ConceptValue;
        site_images: FileListValue;
        image_date: DateValue;
        image_features: StringValue;
        image_description: StringValue;
        primary_image: BooleanValue;
        image_view: ConceptValue;
        photographer: StringValue;
        submit_to_crhp: BooleanValue;
        copyright: StringValue;
    };
}
