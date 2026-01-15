import { z } from 'zod';
import { TileSchema } from '@/bcgov_arches_common/datatypes/tile.ts';
import { getStringValueSchema } from '@/bcgov_arches_common/datatypes/string/validation/zod.ts';
import type { StringValue } from '@/arches_component_lab/datatypes/string/types.ts';
import { blankStringValue } from '@/bcrhp/utils.ts';
import type { GeoJSONFeatureCollectionValue } from '@/bcgov_arches_common/datatypes/geojson-feature-collection/types.ts';

// Auto-generated tile schema for alias: site_boundary

export const SiteBoundaryTileSchema = TileSchema.extend({
    aliased_data: z.object({
        accuracy_remarks: getStringValueSchema(),
        source_notes: getStringValueSchema(),
        site_boundary: z.array(z.lazy(() => SiteBoundaryTileSchema)),
    }),
});
// @ts-ignore
export type SiteBoundaryTileType = z.infer<typeof SiteBoundaryTileSchema>;

export function getSiteBoundary(): SiteBoundaryTileType {
    return new SiteBoundary();
}

export class SiteBoundary implements SiteBoundaryTileType {
    constructor() {
        this.aliased_data = {
            accuracy_remarks: blankStringValue(),
            source_notes: blankStringValue(),
            site_boundary: [],
        };
    }
    aliased_data: {
        accuracy_remarks: StringValue;
        source_notes: StringValue;
        site_boundary: GeoJSONFeatureCollectionValue[];
    };
}
