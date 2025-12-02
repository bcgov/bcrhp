import { z } from 'zod';
import type { StringValue } from '@/arches_component_lab/datatypes/string/types.ts';
import type { NumberValue } from '@/arches_component_lab/datatypes/number/types.ts';
import { blankResourceInstanceValue, blankStringValue } from '@/bcrhp/utils.ts';
import { blankConceptValue } from '@/arches_component_lab/datatypes/concept/utils.ts';
import type { ConceptValue } from '@/arches_component_lab/datatypes/concept/types.ts';
import type { ResourceInstanceValue } from '@/arches_component_lab/datatypes/resource-instance/types.ts';
import {
    ContributingResourceCountNodeSchema,
    OwnershipNodeSchema,
    HeritageCategoryNodeSchema,
} from '@bcrhp/schemas/heritage_site/heritage_class.ts';
import {
    FunctionalStateNodeSchema,
    FunctionalCategoryNodeSchema,
} from '@bcrhp/schemas/heritage_site/heritage_function.ts';
import { HeritageThemeTileSchema } from '@bcrhp/schemas/heritage_site/heritage_theme.ts';

const SiteClassificationSchema = z.object({
    heritageClasses: z.array(z.string()).max(5),
    heritageFunctions: z.array(z.string()).max(5),
    heritageThemes: z.array(z.string()).max(5),
});
const HeritageClassSchema = z.object({
    aliased_data: z.object({
        contributing_resource_count: ContributingResourceCountNodeSchema,
        ownership: OwnershipNodeSchema,
        heritage_category: HeritageCategoryNodeSchema,
    }),
});
const HeritageFunctionSchema = z.object({
    aliased_data: z.object({
        functional_state: FunctionalStateNodeSchema,
        functional_category: FunctionalCategoryNodeSchema,
    }),
});
const HeritageThemeSchema = z.object({
    aliased_data: z.object({
        heritage_theme: z.array(HeritageThemeTileSchema),
    }),
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
        this.aliased_data = {
            contributing_resource_count: blankStringValue(),
            ownership: blankConceptValue(),
            heritage_category: blankConceptValue(),
        };
    }
    aliased_data: {
        contributing_resource_count: NumberValue;
        ownership: ConceptValue;
        heritage_category: ConceptValue;
    };
}

class HeritageFunction implements HeritageFunctionType {
    constructor() {
        this.aliased_data = {
            functional_state: blankConceptValue(),
            functional_category: blankStringValue(),
        };
    }
    aliased_data: {
        functional_state: ConceptValue;
        functional_category: StringValue;
    };
}

class HeritageTheme implements HeritageThemeType {
    constructor() {
        this.aliased_data = {
            heritage_theme: blankResourceInstanceValue(),
        };
    }
    aliased_data: {
        heritage_theme: ResourceInstanceValue;
    };
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
    type HeritageClassType,
    type HeritageFunctionType,
    type HeritageThemeType,
};
