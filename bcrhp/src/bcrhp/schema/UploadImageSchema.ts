import { z } from 'zod';

const UploadImageSchema = z.object({
    imageType: z.array(z.string()).max(250),
    imageView: z.array(z.string()).max(250),
    imageFeatures: z.array(z.string()).max(250),
    imageDate: z.array(z.string()).max(250),
    imageDescription: z.array(z.string()).max(250),
    photographer: z.array(z.string()).max(250),
    copyright: z.array(z.string()).max(250),
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
