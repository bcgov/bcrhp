import { z } from 'zod';

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
    heritageCategory: z
        .string({
            invalid_type_error: 'Heritage Category is required.',
        })
        .min(1, { message: 'Heritage Category is required.' })
        .max(250),
    ownership: z
        .string({
            invalid_type_error: 'Ownership is required.',
        })
        .min(1, { message: 'Ownership is required.' })
        .max(250),
});
const HeritageFunctionSchema = z.object({
    functionCategory: z
        .string({
            invalid_type_error: 'Function Category is required.',
        })
        .min(1, { message: 'Function Category is required.' })
        .max(250),
    functionCategoryType: z.string(),
});
const HeritageThemeSchema = z.object({
    heritageTheme: z
        .string({
            invalid_type_error: 'Heritage Theme is required.',
        })
        .min(1, { message: 'Heritage Theme is required.' })
        .max(250),
});

const requiredSiteClassificationSchema = SiteClassificationSchema.partial({});
const requiredHeritageClassSchema = HeritageClassSchema.partial({});
const requiredHeritageFunctionSchema = HeritageFunctionSchema.partial({});
const requiredHeritageThemeSchema = HeritageThemeSchema.partial({});

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
        this.heritageCategory = '';
        this.ownership = '';
    }
    contributingResources: number;
    heritageCategory: string;
    ownership: string;
}

class HeritageFunction implements HeritageFunctionType {
    constructor() {
        this.functionCategory = '';
        this.functionCategoryType = '';
    }
    functionCategory: string;
    functionCategoryType: string;
}

class HeritageTheme implements HeritageThemeType {
    constructor() {
        this.heritageTheme = '';
    }
    heritageTheme: string;
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
