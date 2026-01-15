import { z } from 'zod';
import {
    SiteDocumentTileSchema,
    type SiteDocumentTileType,
} from '@/bcrhp/schemas/heritage_site/site_document.ts';
import {
    BordenNumberTileSchema,
    type BordenNumberTileType,
    getBordenNumber,
} from '@/bcrhp/schemas/heritage_site/borden_number.ts';
import {
    ChildSitesTileSchema,
    getChildSites,
    type ChildSitesTileType,
} from '@/bcrhp/schemas/heritage_site/child_sites.ts';
import {
    HeritageThemeTileSchema,
    type HeritageThemeTileType,
} from '@/bcrhp/schemas/heritage_site/heritage_theme.ts';
import {
    ExternalUrlTileSchema,
    type ExternalUrlTileType,
} from '@/bcrhp/schemas/heritage_site/external_url.ts';
import {
    SiteRecordAdminTileSchema,
    type SiteRecordAdminTileType,
} from '@/bcrhp/schemas/heritage_site/site_record_admin.ts';
import {
    InternalRemarkTileSchema,
    type InternalRemarkTileType,
} from '@/bcrhp/schemas/heritage_site/internal_remark.ts';
import {
    SiteImagesTileSchema,
    type SiteImagesTileType,
} from '@/bcrhp/schemas/heritage_site/site_images.ts';
import {
    getHeritageSiteLocation,
    HeritageSiteLocationTileSchema,
    type HeritageSiteLocationTileType,
} from '@/bcrhp/schemas/heritage_site/heritage_site_location.ts';
import {
    SiteNamesTileSchema,
    type SiteNamesTileType,
} from '@/bcrhp/schemas/heritage_site/site_names.ts';
import {
    ChronologyTileSchema,
    type ChronologyTileType,
} from '@/bcrhp/schemas/heritage_site/chronology.ts';
import {
    BcRightTileSchema,
    type BcRightTileType,
} from '@/bcrhp/schemas/heritage_site/bc_right.ts';
import {
    HeritageClassTileSchema,
    type HeritageClassTileType,
} from '@/bcrhp/schemas/heritage_site/heritage_class.ts';
import {
    BcStatementOfSignificanceTileSchema,
    type BcStatementOfSignificanceTileType,
    getStatementOfSignificance,
} from '@/bcrhp/schemas/heritage_site/bc_statement_of_significance.ts';
import {
    HeritageFunctionTileSchema,
    type HeritageFunctionTileType,
} from '@/bcrhp/schemas/heritage_site/heritage_function.ts';
import {
    ConstructionActorsTileSchema,
    type ConstructionActorsTileType,
} from '@/bcrhp/schemas/heritage_site/construction_actors.ts';
import { getSiteImages } from '@/bcrhp/schemas/heritage_site/site_images.ts';
import { blankResourceInstanceValue } from '@/bcrhp/utils.ts';
import { getBcRight } from '@/bcrhp/schemas/heritage_site2/heritage_site/bc_right.ts';
import { getSiteRecordAdmin } from '@/bcrhp/schemas/heritage_site2/heritage_site/site_record_admin.ts';

export const HeritageSiteSchema = z.object({
    resourceinstanceid: z.string().nullable(),
    graph: z.unknown().nullable(),
    aliased_data: z.object({
        site_names: z.array(SiteNamesTileSchema),
        site_document: z.array(SiteDocumentTileSchema),
        borden_number: BordenNumberTileSchema,
        child_sites: ChildSitesTileSchema,
        heritage_theme: HeritageThemeTileSchema,
        external_url: z.array(ExternalUrlTileSchema),
        site_record_admin: z.array(SiteRecordAdminTileSchema),
        internal_remark: z.array(InternalRemarkTileSchema),
        site_images: z.array(SiteImagesTileSchema),
        heritage_site_location: z.array(HeritageSiteLocationTileSchema),
        chronology: z.array(ChronologyTileSchema),
        bc_right: BcRightTileSchema,
        heritage_class: z.array(HeritageClassTileSchema),
        bc_statement_of_significance: z.array(
            BcStatementOfSignificanceTileSchema,
        ),
        heritage_function: z.array(HeritageFunctionTileSchema),
        construction_actors: z.array(ConstructionActorsTileSchema),
    }),
});

// @ts-ignore
export type HeritageSiteType = z.infer<typeof HeritageSiteSchema>;

export function getHeritageSite(): HeritageSiteType {
    return new HeritageSite();
}

export class HeritageSite implements HeritageSiteType {
    constructor() {
        this.aliased_data = {
            site_document: [],
            borden_number: getBordenNumber(),
            child_sites: getChildSites(),
            heritage_theme: [],
            external_url: [],
            site_record_admin: getSiteRecordAdmin(),
            internal_remark: blankResourceInstanceValue(),
            site_images: getSiteImages(),
            heritage_site_location: getHeritageSiteLocation(),
            site_names: [],
            chronology: [],
            bc_right: getBcRight(),
            heritage_class: [],
            bc_statement_of_significance: getStatementOfSignificance(),
            heritage_function: [],
            construction_actors: [],
        };
    }
    aliased_data: {
        site_document: SiteDocumentTileType[];
        borden_number: BordenNumberTileType;
        child_sites: ChildSitesTileType;
        heritage_theme: HeritageThemeTileType[];
        external_url: ExternalUrlTileType[];
        site_record_admin: SiteRecordAdminTileType;
        internal_remark: InternalRemarkTileType;
        site_images: SiteImagesTileType;
        heritage_site_location: HeritageSiteLocationTileType;
        site_names: SiteNamesTileType[];
        chronology: ChronologyTileType[];
        bc_right: BcRightTileType;
        heritage_class: HeritageClassTileType[];
        bc_statement_of_significance: BcStatementOfSignificanceTileType;
        heritage_function: HeritageFunctionTileType[];
        construction_actors: ConstructionActorsTileType[];
    };
}
