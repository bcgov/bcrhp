import { z } from 'zod';
import { CivicAddressSchema } from '@/bcrhp/schema/CivicAddressSchema.ts';
import { SiteImagesSchema } from '@/bcrhp/schema/SiteImagesSchema.ts';
import { RecognitionDetailsSchema } from '@/bcrhp/schema/RecognitionDetailsSchema.ts';
import { StatementOfSignificanceSchema } from '@/bcrhp/schema/StatementOfSignificanceSchema.ts';
import { SiteClassificationSchema } from '@/bcrhp/schema/SiteClassificationSchema.ts';
import { SiteDetailsSchema } from '@/bcrhp/schema/SiteDetailsSchema.ts';

const HeritageSiteSchema = z.object({
    siteId: z.string().uuid(),
    bordenNumber: z
        .string()
        .min(1, { message: 'Borden Number is required.' })
        .refine(
            (value: string) =>
                /^[A-Z][a-z][A-Z][a-z]-[0-9]{1-4}$/.test(value ?? ''),
            'Invalid Borden Number format.',
        ),
    commonName: z
        .string({
            invalid_type_error: 'Common Name is required.',
        })
        .min(1, { message: 'Common Name is required.' })
        .max(250),
    otherNames: z.array(z.string()).max(5),
    otherName: z.string().max(250).nullable(), // @todo - This shouldn't live here. Push names into own schema?
    civicAddress: z.array(CivicAddressSchema),
    civicAddresses: z.array(z.string()).max(5),
    siteImages: z.array(SiteImagesSchema),
    recognitionDetails: z.array(RecognitionDetailsSchema),
    statementOfSignificance: z.array(StatementOfSignificanceSchema),
    siteClassification: z.array(SiteClassificationSchema),
    siteDetails: z.array(SiteDetailsSchema),
    siteBoundary: z.object(), // This needs to map to a GeoJSON object
    siteBoundaryIncorrect: z.boolean().default(false), // If the geometry from the PID isn't right this flags it
    documentDescription: z.string().max(250),
    submissionNotes: z.string().max(250),
});

const requiredHeritageSiteSchema = HeritageSiteSchema.partial({
    commonName: true,
});
// @ts-ignore
type HeritageSiteType = z.infer<typeof HeritageSiteSchema>;

function getHeritageSite(): HeritageSiteType {
    return new HeritageSite();
}

// @todo - Figure out object state - New/Updated/Deleted
class HeritageSite implements HeritageSiteType {
    constructor() {
        this.siteId = crypto.randomUUID();
        this.bordenNumber = '';
        this.commonName = '';
        this.otherNames = [];
        this.hasCivicAddress = true;
        this.civicAddress = {}; // Object of UUID -> CivicAddress objects
        this.civicAddresses = [];
        this.siteImages = {};
        this.siteBoundary = {};
        this.recognitionDetails = {};
        this.statementOfSignificance = {};
        this.siteClassification = {};
        this.siteDetails = {};
        this.siteBoundaryIncorrect = false;
        this.otherName = '';
        this.documentDescription = '';
        this.submissionNotes = '';
    }
    siteId: string;
    bordenNumber: string;
    commonName: string;
    otherNames: string[];
    hasCivicAddress: boolean;
    civicAddress: typeof CivicAddressSchema;
    civicAddresses: string[];
    siteImages: typeof SiteImagesSchema;
    recognitionDetails: typeof RecognitionDetailsSchema;
    statementOfSignificance: typeof StatementOfSignificanceSchema;
    siteClassification: typeof SiteClassificationSchema;
    siteDetails: typeof SiteDetailsSchema;
    siteBoundary: object;
    siteBoundaryIncorrect: boolean;
    otherName: string;
    documentDescription: string;
    submissionNotes: string;
}

console.log(requiredHeritageSiteSchema);

export {
    HeritageSiteSchema,
    HeritageSite,
    getHeritageSite,
    requiredHeritageSiteSchema,
};
