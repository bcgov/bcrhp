import { z } from 'zod';

const FormValueSchema = z.object({
    display_value: z.string(),
    node_value: z.array(z.any()),
    details: z.array(z.any()),
});
type FormValueType = z.infer<typeof FormValueSchema>;

const ConceptOptionSchema = z.object({
    id: z.string(),
    conceptid: z.string(),
    depth: z.number(),
    language: z.string(),
    text: z.string(),
    type: z.string(),
});
type ConceptOptionType = z.infer<typeof ConceptOptionSchema>;

const SiteImagesSchema = z.object({
    imageType: FormValueSchema,
    imageView: FormValueSchema,
    imageFeatures: z.string().max(250).nullable(),
    imageDate: z.date(),
    imageDescription: z
        .string({ invalid_type_error: 'Image Type is required.' })
        .min(1, { message: 'Image Description is required.' })
        .max(250),
    photographer: z.string().max(250).nullable(),
    copyright: z.string().max(250).nullable(),
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
        this.id = crypto.randomUUID();
        this.imageType = null;
        this.imageView = '';
        this.imageFeatures = '';
        this.imageDate = null;
        this.imageDescription = '';
        this.photographer = '';
        this.copyright = '';
    }
    id: string;
    imageType: FormValueType;
    imageView: FormValueType;
    imageFeatures: string;
    imageDate: Date | null;
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
