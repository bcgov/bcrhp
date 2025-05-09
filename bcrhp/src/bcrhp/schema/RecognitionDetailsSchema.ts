import { z } from 'zod';

const RecognitionDetailsSchema = z.object({
    designationDate: z.date({
        // This handles null values -> null !== typeof Date
        invalid_type_error: 'Designation date is required.',
    }),
    legislativeAct: z
        .string({
            // This handles null values -> null !== typeof Date
            invalid_type_error: 'Legislative Act is required.',
        })
        // .min(1, { message: 'Legislative Act is required.' })
        .max(250),
    referenceNumber: z
        .string({
            // This handles null values -> null !== typeof Date
            invalid_type_error: 'Reference number is required.',
        })
        .min(1, { message: 'Reference Number is required.' })
        .max(12),
    totalRecognitionDetails: z.array(z.string()).max(12),
});

const requiredRecognitionDetailsSchema = RecognitionDetailsSchema.partial({
    designationDate: true,
    legislativeAct: true,
    referenceNumber: true,
});
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
