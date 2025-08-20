import { z } from 'zod';

const CollectionItemSchema = z.object({
    id: z.string(),
    text: z.string(),
    conceptId: z.string(),
    sortOrder: z.string(),
    children: z.array(z.any()),
});
const ConceptOptionSchema = z.object({
    id: z.string(),
    conceptid: z.string(),
    depth: z.number(),
    language: z.string(),
    text: z.string(),
    type: z.string(),
});
const SiteClassificationSchema = z.object({
    heritageClasses: z.array(z.string()).max(5),
    heritageFunctions: z.array(z.string()).max(5),
    heritageThemes: z.array(z.string()).max(5),
});
const HeritageClassSchema = z.object({
    contributingResources: z
        .string()
        .transform((val: string, ctx: any) => {
            const parsed = parseInt(val, 10);

            if (isNaN(parsed)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Contributing Resources must be a valid number.',
                });
                return z.NEVER;
            }

            return parsed;
        })
        .refine((val: number) => val >= 1, {
            message: 'Number of Contributing Resources is required.',
        })
        .refine((val: number) => val <= 250, {
            message: 'Number of Contributing Resources must be 250 or less.',
        }),
    heritageCategory: ConceptOptionSchema,
    ownership: ConceptOptionSchema,
});
const HeritageFunctionSchema = z.object({
    functionCategory: CollectionItemSchema,
    functionCategoryType: z
        .string({
            invalid_type_error: 'Heritage Category Type is required.',
        })
        .min(1, { message: 'Heritage Category Type is required.' })
        .max(250),
});
const HeritageThemeSchema = z.object({
    heritageTheme: CollectionItemSchema,
});

const requiredSiteClassificationSchema = SiteClassificationSchema.partial({});
const requiredHeritageClassSchema = HeritageClassSchema.partial({});
const requiredHeritageFunctionSchema = HeritageFunctionSchema.partial({});
const requiredHeritageThemeSchema = HeritageThemeSchema.partial({});

// @ts-ignore
type CollectionItemType = z.infer<typeof CollectionItemSchema>;
// @ts-ignore
type ConceptOptionType = z.infer<typeof ConceptOptionSchema>;
// @ts-ignore
type SiteClassificationType = z.infer<typeof SiteClassificationSchema>;
// @ts-ignore
type HeritageClassType = z.infer<typeof HeritageClassSchema>;
// @ts-ignore
type HeritageFunctionType = z.infer<typeof HeritageFunctionSchema>;
// @ts-ignore
type HeritageThemeType = z.infer<typeof HeritageThemeSchema>;

function getSiteClassificationSchema(): SiteClassificationType {
    return new SiteClassification();
}
function getHeritageClassSchema(): HeritageClassType {
    return new HeritageClass();
}
function getHeritageFunctionSchema(): HeritageFunctionType {
    return new HeritageFunction();
}

function getHeritageThemeSchema(): HeritageThemeType {
    return new HeritageTheme();
}

// @todo - Figure out object state - New/Updated/Deleted
class SiteClassification implements SiteClassificationType {
    constructor() {
        this.heritageClasses = [];
        this.heritageFunctions = [];
        this.heritageThemes = [];
    }
    heritageClasses: string[];
    heritageFunctions: string[];
    heritageThemes: string[];
}

class HeritageClass implements HeritageClassType {
    constructor() {
        this.contributingResources = 0;
        this.heritageCategory = null;
        this.ownership = null;
    }
    contributingResources: number;
    heritageCategory: ConceptOptionType;
    ownership: ConceptOptionType;
}

class HeritageFunction implements HeritageFunctionType {
    constructor() {
        this.functionCategory = null;
        this.functionCategoryType = '';
    }
    functionCategory: CollectionItemType;
    functionCategoryType: string;
}

class HeritageTheme implements HeritageThemeType {
    constructor() {
        this.heritageTheme = null;
    }
    heritageTheme: CollectionItemType;
}

export {
    SiteClassification,
    SiteClassificationSchema,
    getSiteClassificationSchema,
    requiredSiteClassificationSchema,
    HeritageClass,
    HeritageClassSchema,
    getHeritageClassSchema,
    requiredHeritageClassSchema,
    HeritageFunction,
    HeritageFunctionSchema,
    getHeritageFunctionSchema,
    requiredHeritageFunctionSchema,
    HeritageTheme,
    HeritageThemeSchema,
    getHeritageThemeSchema,
    requiredHeritageThemeSchema,
};
