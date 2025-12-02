import { z } from 'zod';
import { getSiteImages } from '@/bcrhp/schema/SiteImagesSchema.ts';
import { getStatementOfSignificance } from '@/bcrhp/schema/StatementOfSignificanceSchema.ts';
import { blankResourceInstanceValue } from '@/bcrhp/utils.ts';
import { SiteDocumentTileSchema } from '@bcrhp/schemas/heritage_site/site_document.ts';
import { BordenNumberTileSchema } from '@bcrhp/schemas/heritage_site/borden_number.ts';
import { ChildSitesTileSchema } from '@bcrhp/schemas/heritage_site/child_sites.ts';
import { HeritageThemeTileSchema } from '@bcrhp/schemas/heritage_site/heritage_theme.ts';
import { ExternalUrlTileSchema } from '@bcrhp/schemas/heritage_site/external_url.ts';
import { SiteRecordAdminTileSchema } from '@bcrhp/schemas/heritage_site/site_record_admin.ts';
import { InternalRemarkTileSchema } from '@bcrhp/schemas/heritage_site/internal_remark.ts';
import { SiteImagesTileSchema } from '@bcrhp/schemas/heritage_site/site_images.ts';
import { HeritageSiteLocationTileSchema } from '@bcrhp/schemas/heritage_site/heritage_site_location.ts';
import { SiteNamesTileSchema } from '@bcrhp/schemas/heritage_site/site_names.ts';
import { ChronologyTileSchema } from '@bcrhp/schemas/heritage_site/chronology.ts';
import { BcRightTileSchema } from '@bcrhp/schemas/heritage_site/bc_right.ts';
import { HeritageClassTileSchema } from '@bcrhp/schemas/heritage_site/heritage_class.ts';
import { BcStatementOfSignificanceTileSchema } from '@bcrhp/schemas/heritage_site/bc_statement_of_significance.ts';
import { HeritageFunctionTileSchema } from '@bcrhp/schemas/heritage_site/heritage_function.ts';
import { ConstructionActorsTileSchema } from '@bcrhp/schemas/heritage_site/construction_actors.ts';

const HeritageSiteSchema = z.object({
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

const requiredHeritageSiteSchema = HeritageSiteSchema.partial({
    commonName: true,
});
// @ts-ignore
type HeritageSiteType = z.infer<typeof HeritageSiteSchema>;

function getHeritageSite(): HeritageSiteType {
    return new HeritageSite();
}

// @todo - Figure out object state - New/Updated/Deleted
class HeritageSite implements HeritageSiteType {
    constructor() {
        this.aliased_data = {
            site_document: blankResourceInstanceValue(),
            borden_number: blankResourceInstanceValue(),
            child_sites: blankResourceInstanceValue(),
            heritage_theme: blankResourceInstanceValue(),
            external_url: blankResourceInstanceValue(),
            site_record_admin: blankResourceInstanceValue(),
            internal_remark: blankResourceInstanceValue(),
            site_images: getSiteImages(),
            heritage_site_location: blankResourceInstanceValue(),
            site_names: blankResourceInstanceValue(),
            chronology: blankResourceInstanceValue(),
            bc_right: blankResourceInstanceValue(),
            heritage_class: blankResourceInstanceValue(),
            bc_statement_of_significance: getStatementOfSignificance(),
            heritage_function: blankResourceInstanceValue(),
            construction_actors: blankResourceInstanceValue(),
        };
    }
    aliased_data: {
        site_document: typeof SiteDocumentTileSchema;
        borden_number: typeof BordenNumberTileSchema;
        child_sites: typeof ChildSitesTileSchema;
        heritage_theme: typeof HeritageThemeTileSchema;
        external_url: typeof ExternalUrlTileSchema;
        site_record_admin: typeof SiteRecordAdminTileSchema;
        internal_remark: typeof InternalRemarkTileSchema;
        site_images: typeof SiteImagesTileSchema;
        heritage_site_location: typeof HeritageSiteLocationTileSchema;
        site_names: typeof SiteNamesTileSchema;
        chronology: typeof ChronologyTileSchema;
        bc_right: typeof BcRightTileSchema;
        heritage_class: typeof HeritageClassTileSchema;
        bc_statement_of_significance: typeof BcStatementOfSignificanceTileSchema;
        heritage_function: typeof HeritageFunctionTileSchema;
        construction_actors: typeof ConstructionActorsTileSchema;
    };
}

console.log(requiredHeritageSiteSchema);

export {
    HeritageSiteSchema,
    HeritageSite,
    getHeritageSite,
    requiredHeritageSiteSchema,
    type HeritageSiteType,
};
