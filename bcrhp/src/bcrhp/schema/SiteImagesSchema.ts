import { z } from 'zod';

const ConceptValue = z.object({
    display_value: z.string(),
    node_value: z.string().nullable(),
    details: z.array(z.any()),
});
const CollectionItemSchema = z.object({
    id: z.string(),
    text: z.string(),
    conceptId: z.string(),
    sortOrder: z.string(),
    children: z.array(z.any()),
});
const SiteImagesSchema = z.object({
    imageType: CollectionItemSchema,
    imageView: CollectionItemSchema,
    imageFeatures: z.string().max(250).nullable(),
    imageDate: ConceptValue,
    imageDescription: z
        .string({ invalid_type_error: 'Image Type is required.' })
        .min(1, { message: 'Image Description is required.' })
        .max(250),
    photographer: z.string().max(250).nullable(),
    copyright: z.string().max(250).nullable(),
});

const requiredSiteImagesSchema = SiteImagesSchema.partial({});

// @ts-ignore
type DateValueType = z.infer<typeof ConceptValue>;
// @ts-ignore
type CollectionItemType = z.infer<typeof CollectionItemSchema>;
// @ts-ignore
type SiteImagesType = z.infer<typeof SiteImagesSchema>;

function getSiteImages(): SiteImagesType {
    return new SiteImages();
}

// @todo - Figure out object state - New/Updated/Deleted
class SiteImages implements SiteImagesType {
    constructor() {
        this.id = crypto.randomUUID();
        this.imageType = null;
        this.imageView = null;
        this.imageFeatures = '';
        this.imageDate = null;
        this.imageDescription = '';
        this.photographer = '';
        this.copyright = '';
    }
    id: string;
    imageType: CollectionItemType;
    imageView: CollectionItemType;
    imageFeatures: string;
    imageDate: DateValueType | null;
    imageDescription: string;
    photographer: string;
    copyright: string;
}

export {
    SiteImages,
    SiteImagesSchema,
    getSiteImages,
    requiredSiteImagesSchema,
};
