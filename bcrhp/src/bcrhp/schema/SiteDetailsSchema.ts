import { z } from 'zod';

const SiteDetailsSchema = z.object({
    startYear: z.array(z.string()).max(4),
    endYear: z.array(z.string()).max(4),
    chronologyNotes: z.string().max(1000),
    chronologies: z.array(z.string()).max(5),
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
});

const requiredSiteDetailsSchema = SiteDetailsSchema.partial({});
// @ts-ignore
type SiteDetailsType = z.infer<typeof SiteDetailsSchema>;

function getSiteDetailsSchema(): SiteDetailsType {
    return new SiteDetails();
}

// @todo - Figure out object state - New/Updated/Deleted
class SiteDetails implements SiteDetailsType {
    constructor() {
        this.eventType = '';
        this.startYear = '';
        this.endYear = '';
        this.circa = '';
        this.chronologyNotes = '';
        this.chronologies = [];
        this.architectOrBuilderName = '';
        this.architectOrBuilderNotes = '';
        this.architectOrBuilderType = '';
        this.architectsOrBuilders = [];
        this.urlType = '';
        this.linkText = '';
        this.url = '';
        this.urls = [];
    }
    eventType: string;
    startYear: string;
    endYear: string;
    circa: string;
    chronologyNotes: string;
    chronologies: string[];
    architectOrBuilderName: string;
    architectOrBuilderNotes: string;
    architectOrBuilderType: string;
    architectsOrBuilders: string[];
    urlType: string;
    linkText: string;
    url: string;
    urls: string[];
}

export {
    SiteDetails,
    SiteDetailsSchema,
    getSiteDetailsSchema,
    requiredSiteDetailsSchema,
};
