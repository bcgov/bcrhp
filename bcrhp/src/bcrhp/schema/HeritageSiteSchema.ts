import { z } from 'zod';
import { CivicAddress, CivicAddressSchema } from "@/bcrhp/schema/CivicAddressSchema.ts";
import { boolean } from 'zod';

const HeritageSiteSchema = z.object({
    siteId: z.string().uuid(),
    bordenNumber: z.string()
        .min(1, { message: "Borden Number is required." })
        .refine((value: string) => /^[A-Z][a-z][A-Z][a-z]-[0-9]{1-4}$/.test(value ?? ""), "Invalid Borden Number format."),
    commonName: z.string().min(1, { message: "Common Name is required." }),
    otherNames: z.array(z.string()).max(5),
    civicAddress: z.array(CivicAddressSchema),
    siteBoundary: z.object(), // This needs to map to a GeoJSON object
    siteBoundaryIncorrect: z.boolean().default(false), // If the geometry from the PID isn't right this flags it
    designationDate: z.array(z.string()).max(12),
    legislativeAct: z.array(z.string()).max(32),
    referenceNumber: z.array(z.string()).max(80),
    heritageValue: z.array(z.string()).max(4000),
    definingElements: z.array(z.string()).max(4000),
    documentLocation: z.array(z.string()).max(350),
    numberOfResources: z.array(z.string()).max(12),
    functionCategory: z.array(z.string()).max(12),
    heritageTheme: z.array(z.string()).max(12),
    chronologyNotes: z.array(z.string()).max(250),
    startYear: z.array(z.string()).max(4),
    endYear: z.array(z.string()).max(4),
    architectOrBuilderName: z.array(z.string()).max(250),
    architectOrBuilderNotes: z.array(z.string()).max(250),
    architectOrBuilderType: z.array(z.string()).max(32),
    urlType: z.array(z.string()).max(250),
    urlText: z.array(z.string()).max(250),
    url: z.array(z.string()).max(250)
});

const requiredHeritageSiteSchema = HeritageSiteSchema.partial({
    commonName: true
});

type HeritageSiteType = z.infer<typeof HeritageSiteSchema>;

function getHeritageSite(): HeritageSiteType {
    return new HeritageSite();
}

// @todo - Figure out object state - New/Updated/Deleted
class HeritageSite implements HeritageSiteType {

    constructor() {
        this.siteId = crypto.randomUUID();
        this.bordenNumber = "";
        this.commonName = "";
        this.otherNames = [];
        this.hasCivicAddress = true;
        this.civicAddress = {}; // Object of UUID -> CivicAddress objects
        this.siteBoundary = {};
        this.siteBoundaryIncorrect = false;
        this.designationDate = ''
        this.legislativeAct = '';
        this.showInactiveHistoricActs = false;
        this.referenceNumber = '';
        this.heritageValue = '';
        this.definingElements = '';
        this.documentLocation = '';
        this.numberOfResources = '';
        this.functionCategory = '';
        this.heritageTheme = '';
        this.chronologyNotes = '';
        this.startYear = '';
        this.endYear = '';
        this.architectOrBuilderName = '';
        this.architectOrBuilderNotes = '';
        this.architectOrBuilderType = '';
        this.urlType = '';
        this.linkText = '';
        this.url = '';
    }
    siteId: string;
    bordenNumber: string;
    commonName: string;
    otherNames: string[];
    hasCivicAddress: boolean;
    civicAddress: object;
    siteBoundary: object;
    siteBoundaryIncorrect: boolean;
    designationDate: string;
    legislativeAct: string
    showInactiveHistoricActs: boolean;
    referenceNumber: string;
    heritageValue: string;
    definingElements: string;
    documentLocation: string;
    numberOfResources: string;
    functionCategory: string;
    heritageTheme: string;
    chronologyNotes: string;
    startYear: string;
    endYear: string;
    architectOrBuilderName: string;
    architectOrBuilderNotes: string;
    architectOrBuilderType: string;
    urlType: string;
    linkText: string;
    url: string;
}


console.log(requiredHeritageSiteSchema);

export { HeritageSite, getHeritageSite, requiredHeritageSiteSchema };
