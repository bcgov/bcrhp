import { z } from 'zod';
import type { StringValue } from '@/arches_component_lab/datatypes/string/types.ts';
import type { DateValue } from '@/arches_component_lab/datatypes/date/types.ts';
import { blankStringValue, currentDateValue } from '@/bcrhp/utils.ts';
import type { ConceptValue } from '@/arches_component_lab/datatypes/concept/types.ts';
import type { URLValue } from '@/arches_component_lab/datatypes/url/types.ts';
import { ConceptValueRequiredSchema } from '@/bcgov_arches_common/datatypes/concept/validation/zod.ts';
import { blankConceptValue } from '@/arches_component_lab/datatypes/concept/utils.ts';
import {
    StartYearNodeSchema,
    EndYearNodeSchema,
} from '@bcrhp/schemas/heritage_site/construction_actors.ts';
import { ConstructionActorTypeNodeSchema } from '@bcrhp/schemas/heritage_site/construction_actors.ts';
import {
    getStringValueSchema,
    getStringValueRequiredSchema,
} from '@/bcgov_arches_common/datatypes/string/validation/zod.ts';
import { ExternalUrlTypeNodeSchema } from '@bcrhp/schemas/heritage_site/external_url.ts';

const SiteDetailsSchema = z.object({
    chronologies: z.array(z.string()).max(5),
    architectsOrBuilders: z.array(z.string()).max(5),
    urls: z.array(z.string()).max(5),
});
const ChronologySchema = z.object({
    aliased_data: z.object({
        start_year: StartYearNodeSchema,
        dates_approximate: z.boolean().default(false),
        information_source: getStringValueSchema(250),
        chronology: z.array(ConceptValueRequiredSchema),
        chronology_notes: getStringValueSchema(250),
        end_year: EndYearNodeSchema,
    }),
});
const ConstructionActorsTileSchema = z.object({
    aliased_data: z.object({
        construction_actor_notes: getStringValueSchema(250),
        construction_actor: getStringValueRequiredSchema(250),
        construction_actor_type: ConstructionActorTypeNodeSchema,
    }),
});

const URLsSchema = z.object({
    aliased_data: z.object({
        external_url_type: ExternalUrlTypeNodeSchema,
        external_url: z.array(ExternalUrlTileSchema),
        //link_text ?
    }),
});

const requiredSiteDetailsSchema = SiteDetailsSchema.partial({});
const requiredChronologySchema = ChronologySchema.partial({});
const requiredConstructionActorsTileSchema =
    ConstructionActorsTileSchema.partial({});
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
        this.aliased_data = {
            start_year: currentDateValue(),
            dates_approximate: false,
            information_source: blankStringValue(),
            chronology: blankConceptValue(),
            chronology_notes: blankStringValue(),
            end_year: currentDateValue(),
        };
    }
    aliased_data: {
        start_year: DateValue;
        dates_approximate: boolean;
        information_source: StringValue;
        chronology: ConceptValue;
        chronology_notes: StringValue;
        end_year: DateValue;
    };
}
class ArchitectOrBuilder implements ArchitectOrBuilderType {
    constructor() {
        this.aliased_data = {
            construction_actor_notes: blankStringValue(),
            construction_actor: blankStringValue(),
            construction_actor_type: blankConceptValue(),
        };
    }
    aliased_data: {
        construction_actor_notes: StringValue;
        construction_actor: StringValue;
        construction_actor_type: ConceptValue;
    };
}
class URLs implements URLsType {
    constructor() {
        this.aliased_data = {
            external_url_type: blankConceptValue(),
            external_url: blankStringValue(),
        };
    }
    aliased_data: {
        external_url_type: ConceptValue;
        external_url: URLValue;
    };
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
    ConstructionActorsTileSchema,
    getArchitectOrBuilderSchema,
    requiredConstructionActorsTileSchema,
    URLs,
    URLsSchema,
    getURLsSchema,
    requiredURLsSchema,
    type SiteDetailsType,
    type ChronologyType,
    type ArchitectOrBuilderType,
    type URLsType,
};
