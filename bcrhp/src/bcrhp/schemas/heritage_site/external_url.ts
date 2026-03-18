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
        external_url_type: ConceptValueSchema.refine(
            (val: any) => !!(val?.display_value || val?.node_value),
            { message: 'URL Type is required' },
        ),

        external_url: z
            .any()
            .refine(
                (val: any) => {
                    const data = val?.node_value;
                    const url =
                        typeof data === 'string' ? data : data?.url || '';
                    return url.trim().length > 0;
                },
                { message: 'URL is required' },
            )

            .refine(
                (val: any) => {
                    const data = val?.node_value;
                    const url =
                        typeof data === 'string' ? data : data?.url || '';
                    if (url.trim().length === 0) return true;
                    return !url.includes(' ');
                },
                { message: 'URLs cannot contain spaces' },
            )

            .refine(
                (val: any) => {
                    const data = val?.node_value;
                    const url =
                        typeof data === 'string' ? data : data?.url || '';
                    if (url.trim().length === 0) return true;
                    return url.includes('.');
                },
                { message: 'Please enter a valid domain (e.g., website.ca)' },
            )

            .refine(
                (val: any) => {
                    const data = val?.node_value;
                    if (typeof data === 'string') return true;
                    const label = data?.url_label || '';
                    return label.trim().length > 0;
                },
                { message: 'URL Label is required' },
            ),
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
