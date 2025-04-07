import { z } from 'zod';

const SiteImagesSchema = z.object({
    imageType: z
        .string()
        .min(1, { message: 'Image Type is required.' })
        .max(250),
    imageView: z
        .string()
        .min(1, { message: 'Image View is required.' })
        .max(250),
    imageFeatures: z.string().max(250),
    imageDate: z
        .string()
        .min(1, { message: 'Image Date is required.' })
        .max(250),
    imageDescription: z
        .string()
        .min(1, { message: 'Image Description is required.' })
        .max(250),
    photographer: z.string().max(250),
    copyright: z.string().max(250),
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
        this.imageType = '';
        this.imageView = '';
        this.imageFeatures = '';
        this.imageDate = '';
        this.imageDescription = '';
        this.photographer = '';
        this.copyright = '';
    }
    imageType: string;
    imageView: string;
    imageFeatures: string;
    imageDate: string;
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
