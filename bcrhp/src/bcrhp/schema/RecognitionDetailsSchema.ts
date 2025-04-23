import { z } from 'zod';

const RecognitionDetailsSchema = z.object({
    designationDate: z.date(),
    legislativeAct: z
        .string()
        .min(1, { message: 'Legislative Act is required.' })
        .max(250),
    referenceNumber: z
        .string()
        .min(1, { message: 'Reference Number is required.' })
        .max(12),
    totalRecognitionDetails: z.array(z.string()).max(12),
});

const requiredRecognitionDetailsSchema = RecognitionDetailsSchema.partial({});
// @ts-ignore
type RecognitionDetailsType = z.infer<typeof RecognitionDetailsSchema>;

function getRecognitionDetails(): RecognitionDetailsType {
    return new RecognitionDetails();
}

// @todo - Figure out object state - New/Updated/Deleted
class RecognitionDetails implements RecognitionDetailsType {
    constructor() {
        this.designationDate = null;
        this.legislativeAct = '';
        this.referenceNumber = '';
        this.totalRecognitionDetails = [];
    }
    designationDate: Date | null;
    legislativeAct: string;
    referenceNumber: string;
    totalRecognitionDetails: string[];
}

export {
    RecognitionDetails,
    RecognitionDetailsSchema,
    getRecognitionDetails,
    requiredRecognitionDetailsSchema,
};
