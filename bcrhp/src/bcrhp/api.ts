import arches from 'arches';
import type { HeritageSiteType } from '@/bcrhp/schemas/heritage_site.ts';

export async function getBlankHeritageSite(): Promise<HeritageSiteType> {
    const response = await fetch(
        arches.urls.api_resource_blank('project_assessment') + '?format=json',
        {},
    );
    return await response.json();
}
