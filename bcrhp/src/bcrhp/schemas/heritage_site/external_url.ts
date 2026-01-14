import { z } from 'zod';
import type { URLValue } from '@/arches_component_lab/datatypes/url/types.ts';
import { TileSchema } from '@/bcgov_arches_common/datatypes/tile.ts';
import { ConceptValueSchema } from '@/bcgov_arches_common/datatypes/concept/validation/zod.ts';
import { blankConceptValue } from '@/arches_component_lab/datatypes/concept/utils.ts';
import type { ConceptValue } from '@/arches_component_lab/datatypes/concept/types.ts';
import { blankURLValue } from '@/bcrhp/utils.ts';

// Auto-generated tile schema for alias: external_url

export const ExternalUrlTileSchema = TileSchema.extend({
    aliased_data: z.object({
        external_url_type: ConceptValueSchema,
        external_url: z.array(z.lazy(() => ExternalUrlTileSchema)),
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
