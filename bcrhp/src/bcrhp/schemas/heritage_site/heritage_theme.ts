import { z } from 'zod';
import { TileSchema } from '@/bcgov_arches_common/datatypes/tile.ts';
import type { ConceptListValue } from '@/arches_component_lab/datatypes/concept-list/types.ts';
import { ConceptListValueSchema } from '@/bcgov_arches_common/datatypes/concept-list/validation/zod.ts';
import { blankConceptListValue } from '@/arches_component_lab/datatypes/concept-list/utils.ts';

// Auto-generated tile schema for alias: heritage_theme

export const HeritageThemeTileSchema = TileSchema.extend({
    aliased_data: z.object({
        heritage_theme: ConceptListValueSchema,
    }),
});
// @ts-ignore
export type HeritageThemeTileType = z.infer<typeof HeritageThemeTileSchema>;

export function getHeritageTheme(): HeritageThemeTileType {
    return new HeritageTheme();
}

export class HeritageTheme implements HeritageThemeTileType {
    constructor() {
        this.aliased_data = {
            heritage_theme: blankConceptListValue(),
        };
    }
    aliased_data: {
        heritage_theme: ConceptListValue;
    };
}
