import { z } from 'zod';
import { CivicAddressSchema } from '@/bcrhp/schema/CivicAddressSchema.ts';
import { UploadImageSchema } from '@/bcrhp/schema/UploadImageSchema.ts';

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
    commonName: z.string().min(1, { message: 'Common Name is required.' }),
    otherNames: z.array(z.string()).max(5),
    civicAddress: z.array(CivicAddressSchema),
    uploadImage: z.array(UploadImageSchema),
    siteBoundary: z.object(), // This needs to map to a GeoJSON object
    siteBoundaryIncorrect: z.boolean().default(false), // If the geometry from the PID isn't right this flags it
    designationDate: z
        .string()
        .min(1, { message: 'Designation Date is required.' })
        .max(12),
    legislativeAct: z
        .string()
        .min(1, { message: 'Legislative Act is required.' })
        .max(250),
    referenceNumber: z
        .string()
        .min(1, { message: 'Reference Number is required.' })
        .max(12),
    referenceNumbers: z.array(z.string()).max(12),
    description: z
        .string()
        .min(1, { message: 'Description is required.' })
        .max(4000),
    heritageValue: z
        .string()
        .min(1, { message: 'Heritage Value is required.' })
        .max(4000),
    definingElements: z
        .string()
        .min(1, { message: 'Defining Elements is required.' })
        .max(4000),
    documentLocation: z
        .string()
        .min(1, { message: 'Document Location is required.' })
        .max(250),
    contributingResources: z
        .string()
        .min(1, { message: 'Number of Contributing Resources is required.' })
        .max(250),
    totalContributingResources: z.array(z.string()).max(5),
    functionCategory: z
        .string()
        .min(1, { message: 'Function Category is required.' })
        .max(250),
    functionCategories: z.array(z.string()).max(5),
    heritageTheme: z
        .string()
        .min(1, { message: 'Heritage Theme is required.' })
        .max(250),
    heritageThemes: z.array(z.string()).max(5),
    chronology: z
        .string()
        .min(1, { message: 'Chronology is required.' })
        .max(250),
    chronologies: z.array(z.string()).max(5),
    startYear: z.array(z.string()).max(4),
    endYear: z.array(z.string()).max(4),
    architectOrBuilderName: z
        .string()
        .min(1, { message: 'Architect or Builder Name is required.' })
        .max(250),
    architectOrBuilderNotes: z.string().max(4000),
    architectOrBuilderType: z
        .string()
        .min(1, { message: 'Architect or Builder Type is required.' })
        .max(250),
    architectsOrBuilders: z.array(z.string()).max(5),
    urlType: z.array(z.string()).max(250),
    urlText: z.string().min(1, { message: 'URL Type is required.' }).max(250),
    linkText: z.string().min(1, { message: 'URL Text is required.' }).max(250),
    url: z.string().min(1, { message: 'URL is required.' }).max(250),
    urls: z.array(z.string()).max(5),
    otherName: z.array(z.string()).max(12),
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
        this.uploadImage = {};
        this.siteBoundary = {};
        this.siteBoundaryIncorrect = false;
        this.designationDate = '';
        this.legislativeAct = '';
        this.showInactiveHistoricActs = false;
        this.referenceNumber = '';
        this.referenceNumbers = [];
        this.description = '';
        this.heritageValue = '';
        this.definingElements = '';
        this.documentLocation = '';
        this.contributingResources = '';
        this.totalContributingResources = [];
        this.functionCategory = '';
        this.functionCategories = [];
        this.heritageTheme = '';
        this.heritageThemes = [];
        this.chronology = '';
        this.chronologies = [];
        this.startYear = '';
        this.endYear = '';
        this.architectOrBuilderName = '';
        this.architectOrBuilderNotes = '';
        this.architectOrBuilderType = '';
        this.architectsOrBuilders = [];
        this.urlType = '';
        this.linkText = '';
        this.url = '';
        this.urls = [];
        this.otherName = '';
        this.documentDescription = '';
        this.submissionNotes = '';
    }
    siteId: string;
    bordenNumber: string;
    commonName: string;
    otherNames: string[];
    hasCivicAddress: boolean;
    civicAddress: object;
    uploadImage: object;
    siteBoundary: object;
    siteBoundaryIncorrect: boolean;
    designationDate: string;
    legislativeAct: string;
    showInactiveHistoricActs: boolean;
    referenceNumber: string;
    referenceNumbers: string[];
    description: string;
    heritageValue: string;
    definingElements: string;
    documentLocation: string;
    contributingResources: string;
    totalContributingResources: string[];
    functionCategory: string;
    functionCategories: string[];
    heritageTheme: string;
    heritageThemes: string[];
    chronology: string;
    chronologies: string[];
    startYear: string;
    endYear: string;
    architectOrBuilderName: string;
    architectOrBuilderNotes: string;
    architectOrBuilderType: string;
    architectsOrBuilders: string[];
    urlType: string;
    linkText: string;
    url: string;
    urls: string[];
    otherName: string;
    documentDescription: string;
    submissionNotes: string;
}

console.log(requiredHeritageSiteSchema);

export { HeritageSite, getHeritageSite, requiredHeritageSiteSchema };
