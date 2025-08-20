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
const RecognitionDetailsSchema = z.object({
    designationDate: ConceptValue,
    legislativeAct: CollectionItemSchema,
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
type DateValueType = z.infer<typeof ConceptValue>;
// @ts-ignore
type RecognitionDetailsType = z.infer<typeof RecognitionDetailsSchema>;
// @ts-ignore
type CollectionItemType = z.infer<typeof CollectionItemSchema>;

function getRecognitionDetails(): RecognitionDetailsType {
    return new RecognitionDetails();
}

// @todo - Figure out object state - New/Updated/Deleted
class RecognitionDetails implements RecognitionDetailsType {
    constructor() {
        this.designationDate = null;
        this.legislativeAct = null;
        this.referenceNumber = '';
        this.totalRecognitionDetails = [];
    }
    designationDate: DateValueType | null;
    legislativeAct: CollectionItemType;
    referenceNumber: string;
    totalRecognitionDetails: string[];
}

export {
    RecognitionDetails,
    RecognitionDetailsSchema,
    getRecognitionDetails,
    requiredRecognitionDetailsSchema,
};
