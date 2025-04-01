import { z } from 'zod';

const SiteClassificationSchema = z.object({
    contributingResources: z
        .string()
        .min(1, { message: 'Number of Contributing Resources is required.' })
        .max(250),
    heritageClasses: z.array(z.string()).max(5),
    functionCategory: z
        .string()
        .min(1, { message: 'Function Category is required.' })
        .max(250),
    heritageFunctions: z.array(z.string()).max(5),
    heritageTheme: z
        .string()
        .min(1, { message: 'Heritage Theme is required.' })
        .max(250),
    heritageThemes: z.array(z.string()).max(5),
});

const requiredSiteClassificationSchema = SiteClassificationSchema.partial({});
// @ts-ignore
type SiteClassificationType = z.infer<typeof SiteClassificationSchema>;

function getSiteClassificationSchema(): SiteClassificationType {
    return new SiteClassification();
}

// @todo - Figure out object state - New/Updated/Deleted
class SiteClassification implements SiteClassificationType {
    constructor() {
        this.contributingResources = '';
        this.heritageClasses = [];
        this.heritageCategory = '';
        this.ownership = '';
        this.functionCategory = '';
        this.functionCategoryType = '';
        this.heritageFunctions = [];
        this.heritageTheme = '';
        this.heritageThemes = [];
    }
    contributingResources: string;
    heritageClasses: string[];
    heritageCategory: string;
    ownership: string;
    functionCategory: string;
    functionCategoryType: string;
    heritageFunctions: string[];
    heritageTheme: string;
    heritageThemes: string[];
}

export {
    SiteClassification,
    SiteClassificationSchema,
    getSiteClassificationSchema,
    requiredSiteClassificationSchema,
};
