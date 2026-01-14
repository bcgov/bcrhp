import { z } from 'zod';
import { TileSchema } from '@/bcgov_arches_common/datatypes/tile.ts';
import type { ResourceInstanceValue } from '@/arches_component_lab/datatypes/resource-instance/types.ts';
import { blankResourceInstanceValue } from '@/bcrhp/utils.ts';

// Auto-generated tile schema for alias: heritage_theme

export const HeritageThemeTileSchema = TileSchema.extend({
    aliased_data: z.object({
        heritage_theme: z.array(z.lazy(() => HeritageThemeTileSchema)),
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
            heritage_theme: blankResourceInstanceValue(),
        };
    }
    aliased_data: {
        heritage_theme: ResourceInstanceValue;
    };
}
