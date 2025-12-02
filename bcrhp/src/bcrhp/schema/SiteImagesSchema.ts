import { z } from 'zod';
import type { StringValue } from '@/arches_component_lab/datatypes/string/types.ts';
import {
    currentDateValue,
    blankStringValue,
    blankFileListValue,
} from '@/bcrhp/utils.ts';
import { blankConceptValue } from '@/arches_component_lab/datatypes/concept/utils.ts';
import type { ConceptValue } from '@/arches_component_lab/datatypes/concept/types.ts';
import type { FileListValue } from '@/arches_component_lab/datatypes/file-list/types.ts';
import { FileListValueSchema } from '@/bcgov_arches_common/datatypes/file-list/validation/zod.ts';
import type { DateValue } from '@/arches_component_lab/datatypes/date/types.ts';
import {
    getStringValueSchema,
    getStringValueRequiredSchema,
} from '@/bcgov_arches_common/datatypes/string/validation/zod.ts';
import {
    ImageTypeNodeSchema,
    ImageDateNodeSchema,
    ImageViewNodeSchema,
} from '@bcrhp/schemas/heritage_site/site_images.ts';
const SiteImagesSchema = z.object({
    aliased_data: z.object({
        image_type: ImageTypeNodeSchema,
        site_images: z.array(FileListValueSchema),
        image_date: ImageDateNodeSchema,
        image_features: getStringValueSchema(250),
        image_description: getStringValueRequiredSchema(250),
        primary_image: z.boolean().default(true),
        image_view: ImageViewNodeSchema,
        photographer: getStringValueSchema(250),
        submit_to_crhp: z.boolean().default(false),
        copyright: getStringValueSchema(250),
    }),
});

const requiredSiteImagesSchema = SiteImagesSchema.partial({});

// @ts-ignore
type SiteImagesType = z.infer<typeof SiteImagesSchema>;

function getSiteImages(): SiteImagesType {
    return new SiteImages();
}

// @todo - Figure out object state - New/Updated/Deleted
class SiteImages implements SiteImagesType {
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

export {
    SiteImages,
    SiteImagesSchema,
    getSiteImages,
    requiredSiteImagesSchema,
    type SiteImagesType,
};
