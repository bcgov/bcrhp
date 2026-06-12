import { z } from 'zod';
import type { URLValue } from '@/arches_component_lab/datatypes/url/types.ts';
import { TileSchema } from '@/arches_zod_validation/datatypes/tile.ts';
import { ConceptValueSchema } from '@/arches_zod_validation/datatypes/concept/validation/zod.ts';
import { blankConceptValue } from '@/arches_component_lab/datatypes/concept/utils.ts';
import type { ConceptValue } from '@/arches_component_lab/datatypes/concept/types.ts';
import { blankURLValue } from '@/arches_zod_validation/utils.ts';
import { HttpUrlValueLabelRequiredSchema } from '@/arches_zod_validation/datatypes/url/validation/zod.ts';

// Auto-generated tile schema for alias: external_url

export const ExternalUrlTileSchema = TileSchema.extend({
    aliased_data: z.object({
        external_url_type: ConceptValueSchema.refine(
            (val: any) => !!(val?.display_value || val?.node_value),
            { message: 'URL Type is required' },
        ),

        external_url: HttpUrlValueLabelRequiredSchema,
    }),
});

// @ts-ignore
export type ExternalUrlTileType = z.infer<typeof ExternalUrlTileSchema>;

export function getExternalUrl(): ExternalUrlTileType {
    return new ExternalUrl();
}

export class ExternalUrl implements ExternalUrlTileType {
    constructor() {
        this.aliased_data = {
            external_url_type: blankConceptValue(),
            external_url: blankURLValue(),
        };
    }
    aliased_data: {
        external_url_type: ConceptValue;
        external_url: URLValue;
    };
}
