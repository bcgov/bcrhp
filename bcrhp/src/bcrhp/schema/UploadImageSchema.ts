import { z } from 'zod';

const UploadImageSchema = z.object({
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

const requiredUploadImageSchema = UploadImageSchema.partial({});
// @ts-ignore
type UploadImageType = z.infer<typeof UploadImageSchema>;

function getUploadImage(): UploadImageType {
    return new UploadImage();
}

// @todo - Figure out object state - New/Updated/Deleted
class UploadImage implements UploadImageType {
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
    UploadImage,
    UploadImageSchema,
    getUploadImage,
    requiredUploadImageSchema,
};
