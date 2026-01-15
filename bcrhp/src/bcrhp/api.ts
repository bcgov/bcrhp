import arches from 'arches';
import type { HeritageSiteType } from '@/bcrhp/schemas/heritage_site.ts';
import { fetchConceptsTree } from '@/arches_component_lab/datatypes/concept/api.ts';
import type {
    CollectionItem,
    ConceptValue,
} from '@/arches_component_lab/datatypes/concept/types.ts';
import { convertConceptOptionToFormValue } from '@/arches_component_lab/datatypes/concept/utils.ts';

const siteNameTypes: Record<string, ConceptValue> = {};

export async function getBlankHeritageSite(): Promise<HeritageSiteType> {
    const response = await fetch(
        arches.urls.api_resource_blank('heritage_site') + '?format=json',
        {},
    );
    return await response.json();
}
export async function getNameType(name_type: string): Promise<ConceptValue> {
    if (Object.keys(siteNameTypes).length === 0) {
        const siteNameList = await fetchConceptsTree(
            'heritage_site',
            'name_type',
        );
        siteNameList.results.forEach((result: CollectionItem) => {
            const label = result.label;
            siteNameTypes[label] = convertConceptOptionToFormValue(
                result.key,
                siteNameList.results,
            );
        });
    }
    return siteNameTypes[name_type];
}
