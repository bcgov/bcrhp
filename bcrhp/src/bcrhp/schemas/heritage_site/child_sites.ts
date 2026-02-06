import { z } from 'zod';
import { TileSchema } from '@/bcgov_arches_common/datatypes/tile.ts';
import { ResourceInstanceListValueRequiredSchema } from '@/bcgov_arches_common/datatypes/resource-instance-list/validation/zod.ts';
import { blankResourceInstanceListValue } from '@/bcrhp/utils.ts';
import type { ResourceInstanceListValue } from '@/arches_component_lab/datatypes/resource-instance-list/types.ts';

// Auto-generated tile schema for alias: child_sites

export const ChildSitesTileSchema = TileSchema.extend({
    aliased_data: z.object({
        child_sites: ResourceInstanceListValueRequiredSchema,
    }),
});
// @ts-ignore
export type ChildSitesTileType = z.infer<typeof ChildSitesTileSchema>;

export function getChildSites(): ChildSitesTileType {
    return new ChildSites();
}

export class ChildSites implements ChildSitesTileType {
    constructor() {
        this.aliased_data = {
            child_sites: blankResourceInstanceListValue(),
        };
    }
    aliased_data: {
        child_sites: ResourceInstanceListValue;
    };
}
