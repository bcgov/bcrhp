import sanitizeHtml from 'sanitize-html';
import { z } from 'zod';

function normalizeEditorContent(value: string | null): string {
    if (!value) return '';

    return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} })
        .replace(/&nbsp;/g, ' ')
        .trim();
}

const SiteImagesSchema = z.object({
    imageType: z
        .string({ invalid_type_error: 'Image Type is required.' })
        .min(1, { message: 'Image Type is required.' })
        .max(250),
    imageView: z
        .string({ invalid_type_error: 'Image Type is required.' })
        .min(1, { message: 'Image View is required.' })
        .max(250),
    imageFeatures: z.string().max(250).nullable(),
    imageDate: z.date(),
    imageDescription: z
        .string()
        .transform(normalizeEditorContent)
        .refine((value: string) => value !== '', {
            message: 'Image Description is required.',
        })
        .refine((value: string) => value.length <= 250, {
            message: 'Image Description must be 250 characters or less.',
        })
        .nullable(),
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
        this.imageType = '';
        this.imageView = '';
        this.imageFeatures = '';
        this.imageDate = null;
        this.imageDescription = '';
        this.photographer = '';
        this.copyright = '';
    }
    id: string;
    imageType: string;
    imageView: string;
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
