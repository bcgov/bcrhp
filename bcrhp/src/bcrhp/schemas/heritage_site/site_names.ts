import { z } from 'zod';
import { TileSchema } from '@/bcgov_arches_common/datatypes/tile.ts';
import { ConceptValueRequiredSchema } from '@/bcgov_arches_common/datatypes/concept/validation/zod.ts';
import { getStringValueRequiredSchema } from '@/bcgov_arches_common/datatypes/string/validation/zod.ts';
import { blankStringValue } from '@/bcrhp/utils.ts';
import { buildConceptAliasedNodeData } from '@/arches_component_lab/datatypes/concept/utils.ts';
import type { StringAliasedNodeData } from '@/arches_component_lab/datatypes/string/types.ts';
import type { ConceptAliasedNodeData } from '@/arches_component_lab/datatypes/concept/types.ts';
import { getNameType } from '@/bcrhp/api.ts';

export const SiteNamesTileSchema = TileSchema.extend({
    aliased_data: z.object({
        name: getStringValueRequiredSchema(250),
        name_type: ConceptValueRequiredSchema,
    }),
});
// @ts-ignore
export type SiteNamesTileType = z.infer<typeof SiteNamesTileSchema>;

export function getSiteName(): SiteNamesTileType {
    return new SiteName();
}

export async function getBlankCommonName(): Promise<SiteNamesTileType> {
    const siteName = new SiteName();
    siteName.aliased_data.name_type = await getNameType('Common');
    return siteName;
}

export async function getBlankOtherName(): Promise<SiteNamesTileType> {
    const siteName = new SiteName();
    siteName.aliased_data.name_type = await getNameType('Other');
    return siteName;
}

export class SiteName implements SiteNamesTileType {
    constructor() {
        this.aliased_data = {
            name: blankStringValue(),
            name_type: buildConceptAliasedNodeData(),
        };
    }
    aliased_data: {
        name: StringAliasedNodeData;
        name_type: ConceptAliasedNodeData;
    };
}
