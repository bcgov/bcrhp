import { z } from 'zod';

const SiteDetailsSchema = z.object({
    chronologies: z.array(z.string()).max(5),
    architectsOrBuilders: z.array(z.string()).max(5),
    urls: z.array(z.string()).max(5),
});
const ChronologySchema = z.object({
    eventType: z
        .string({
            invalid_type_error: 'Event Type is required.',
        })
        .min(1, { message: 'Event Type is required.' })
        .max(250),
    startYear: z.date(),
    endYear: z.date(),
    circa: z.string().max(20).nullable(),
    chronologyNotes: z.string().max(1000).nullable(),
});

const ArchitectBuilderSchema = z.object({
    architectOrBuilderName: z
        .string({
            invalid_type_error: 'Architect or Builder Name is required.',
        })
        .min(1, { message: 'Architect or Builder Name is required.' })
        .max(250),
    architectOrBuilderNotes: z.string().max(4000).nullable(),
    architectOrBuilderType: z
        .string({
            invalid_type_error: 'Architect or Builder Type is required.',
        })
        .min(1, { message: 'Architect or Builder Type is required.' })
        .max(250),
});

const URLsSchema = z.object({
    urlType: z
        .string({ invalid_type_error: 'URL Type is required.' })
        .min(1, { message: 'URL Type is required.' })
        .max(250),
    linkText: z
        .string({ invalid_type_error: 'Link Text is required.' })
        .min(1, { message: 'Link Text is required.' })
        .max(250),
    url: z
        .string({ invalid_type_error: 'URL is required.' })
        .min(1, { message: 'URL is required.' })
        .max(250),
});

const requiredSiteDetailsSchema = SiteDetailsSchema.partial({});
const requiredChronologySchema = ChronologySchema.partial({});
const requiredArchitectBuilderSchema = ArchitectBuilderSchema.partial({});
const requiredURLsSchema = URLsSchema.partial({});

// @ts-ignore
type SiteDetailsType = z.infer<typeof SiteDetailsSchema>;
// @ts-ignore
type ChronologyType = z.infer<typeof ChronologySchema>;
// @ts-ignore
type ArchitectOrBuilderType = z.infer<typeof ArchitectOrBuilderSchema>;
// @ts-ignore
type URLsType = z.infer<typeof URLsSchema>;

function getSiteDetailsSchema(): SiteDetailsType {
    return new SiteDetails();
}
function getChronologySchema(): ChronologyType {
    return new Chronology();
}
function getArchitectOrBuilderSchema(): ArchitectOrBuilderType {
    return new ArchitectOrBuilder();
}
function getURLsSchema(): URLsType {
    return new URLs();
}

// @todo - Figure out object state - New/Updated/Deleted
class SiteDetails implements SiteDetailsType {
    constructor() {
        this.chronologies = [];
        this.architectsOrBuilders = [];
        this.urls = [];
    }
    chronologies: string[];
    architectsOrBuilders: string[];
    urls: string[];
}
class Chronology implements ChronologyType {
    constructor() {
        this.eventType = '';
        this.startYear = null;
        this.endYear = null;
        this.circa = false;
        this.chronologyNotes = '';
    }
    eventType: string;
    startYear: Date | null;
    endYear: Date | null;
    circa: boolean;
    chronologyNotes: string;
}
class ArchitectOrBuilder implements ArchitectOrBuilderType {
    constructor() {
        this.architectOrBuilderName = '';
        this.architectOrBuilderNotes = '';
        this.architectOrBuilderType = '';
    }
    architectOrBuilderName: string;
    architectOrBuilderNotes: string;
    architectOrBuilderType: string;
}
class URLs implements URLsType {
    constructor() {
        this.urlType = '';
        this.linkText = '';
        this.url = '';
    }
    urlType: string;
    linkText: string;
    url: string;
}

export {
    SiteDetails,
    SiteDetailsSchema,
    getSiteDetailsSchema,
    requiredSiteDetailsSchema,
    Chronology,
    ChronologySchema,
    getChronologySchema,
    requiredChronologySchema,
    ArchitectOrBuilder,
    ArchitectBuilderSchema,
    getArchitectOrBuilderSchema,
    requiredArchitectBuilderSchema,
    URLs,
    URLsSchema,
    getURLsSchema,
    requiredURLsSchema,
};
