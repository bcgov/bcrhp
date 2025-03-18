import { z } from 'zod';

const LegalDescriptionSchema = z.object({
    pid: z.number().int().min(0).max(999999999),
    pin: z.number().int().min(0).max(99999999),
    legalDescription: z.string()
        .max(250),
    internalNotes: z.string(),
    overrideAddress: z.boolean().default(false),
    parcelId: z.string()
        .min(1, { message: "Parcel Identifier is required." })
        .max(32)
});

type LegalDescriptionType = z.infer<typeof LegalDescriptionSchema>;

const requiredLegalDescriptionSchema = LegalDescriptionSchema.partial({
});

function getLegalDescription(): LegalDescriptionType {
    return new LegalDescription();
}

class LegalDescription implements LegalDescriptionType {

    constructor() {
        this.legalDescription = "";
        this.internalNotes = "";
        this.pid = 0;
        this.pin = 0;
        this.parcelId = '';
        this.overrideLegalDescription = false;
        this.legalAddress = '';
    }

    legalDescription: string;
    internalNotes: string;
    pid: number;
    pin: number;
    parcelId: string;
    overrideLegalDescription: boolean;
    legalAddress: string;
}


export { LegalDescription, LegalDescriptionSchema, getLegalDescription, requiredLegalDescriptionSchema };
