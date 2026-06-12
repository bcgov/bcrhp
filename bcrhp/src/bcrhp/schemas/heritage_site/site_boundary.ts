import { z } from 'zod';
import { TileSchema } from '@/arches_zod_validation/datatypes/tile.ts';
import { getStringValueSchema } from '@/arches_zod_validation/datatypes/string/validation/zod.ts';
import type { StringValue } from '@/arches_component_lab/datatypes/string/types.ts';
import {
    blankGeoJSONValue,
    blankStringValue,
} from '@/arches_zod_validation/utils.ts';
import type { GeoJSONFeatureCollectionValue } from '@/arches_component_lab/datatypes/geojson-feature-collection/types.ts';
import { GeoJSONFeatureCollectionValueSchema } from '@/arches_zod_validation/datatypes/geojson-feature-collection/validation/zod.ts';

// Auto-generated tile schema for alias: site_boundary

export const SiteBoundaryTileSchema = TileSchema.extend({
    aliased_data: z.object({
        accuracy_remarks: getStringValueSchema(),
        source_notes: getStringValueSchema(),
        site_boundary: GeoJSONFeatureCollectionValueSchema,
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
            site_boundary: blankGeoJSONValue(),
        };
    }
    aliased_data: {
        accuracy_remarks: StringValue;
        source_notes: StringValue;
        site_boundary: GeoJSONFeatureCollectionValue;
    };
}
