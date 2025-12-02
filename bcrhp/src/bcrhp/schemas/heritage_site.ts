import { z } from 'zod';
import {
    SiteDocumentTileSchema,
    type SiteDocumentTileType,
} from '@/bcrhp/schemas/heritage_site/site_document.ts';
import {
    BordenNumberTileSchema,
    type BordenNumberTileType,
} from '@/bcrhp/schemas/heritage_site/borden_number.ts';
import {
    ChildSitesTileSchema,
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
    BcPropertyLegalDescriptionTileSchema,
    type BcPropertyLegalDescriptionTileType,
} from '@/bcrhp/schemas/heritage_site/bc_property_legal_description.ts';
import {
    BcPropertyAddressTileSchema,
    type BcPropertyAddressTileType,
} from '@/bcrhp/schemas/heritage_site/bc_property_address.ts';
import {
    SiteBoundaryTileSchema,
    type SiteBoundaryTileType,
} from '@/bcrhp/schemas/heritage_site/site_boundary.ts';
import {
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
    ProtectionEventTileSchema,
    type ProtectionEventTileType,
} from '@/bcrhp/schemas/heritage_site/protection_event.ts';
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
} from '@/bcrhp/schemas/heritage_site/bc_statement_of_significance.ts';
import {
    HeritageFunctionTileSchema,
    type HeritageFunctionTileType,
} from '@/bcrhp/schemas/heritage_site/heritage_function.ts';
import {
    ConstructionActorsTileSchema,
    type ConstructionActorsTileType,
} from '@/bcrhp/schemas/heritage_site/construction_actors.ts';

export const HeritageSiteSchema = z.object({
    resourceinstanceid: z.string().nullable(),
    graph: z.unknown().nullable(),
    aliased_data: z.object({
        site_document: z.array(SiteDocumentTileSchema),
        borden_number: BordenNumberTileSchema,
        child_sites: ChildSitesTileSchema,
        heritage_theme: HeritageThemeTileSchema,
        external_url: z.array(ExternalUrlTileSchema),
        site_record_admin: z.array(SiteRecordAdminTileSchema),
        internal_remark: z.array(InternalRemarkTileSchema),
        site_images: z.array(SiteImagesTileSchema),
        heritage_site_location: z.array(HeritageSiteLocationTileSchema),
        site_names: z.array(SiteNamesTileSchema),
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
