import arches from 'arches';
import type { HeritageSiteType } from '@/bcrhp/schemas/heritage_site.ts';
import { fetchConceptsTree } from '@/arches_component_lab/datatypes/concept/api.ts';
import { getToken } from '@/bcgov_arches_common/api.ts';
import type { FileReference } from '@/bcgov_arches_common/datatypes/file-list/types.ts';
import type {
    CollectionItem,
    ConceptValue,
} from '@/arches_component_lab/datatypes/concept/types.ts';
import { convertConceptOptionToFormValue } from '@/arches_component_lab/datatypes/concept/utils.ts';
import type { SiteImagesTileType } from '@/bcrhp/schemas/heritage_site/site_images.ts';
import type { SiteDocumentTileType } from '@/bcrhp/schemas/heritage_site/site_document.ts';

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

export async function submitHeritageSite(
    site: HeritageSiteType,
): Promise<HeritageSiteType> {
    const csrftoken = await getToken();
    const fd = new FormData();

    fd.append('json', JSON.stringify(site));
    // Push image files onto form data
    site.aliased_data.site_images.forEach((image_tile: SiteImagesTileType) => {
        const file: FileReference = image_tile.aliased_data.site_images
            .node_value[0].file as FileReference;
        fd.append(`file-list_${file.node_id}`, file.file as File, file.name);
    });
    // Push documents onto form data
    site.aliased_data.site_document.forEach(
        (document_tile: SiteDocumentTileType) => {
            const file =
                document_tile.aliased_data.site_document.node_value[0].file;
            fd.append(
                `file-list_${file.node_id}`,
                file.file as File,
                file.name,
            );
        },
    );

    const headers: Record<string, string> = {
        'X-CSRFToken': csrftoken,
        Accept: 'application/json',
        // DO NOT set Content-Type; the browser will add the correct multipart boundary.
    };
    const response = await fetch(arches.urls.submit_new_site, {
        method: 'POST',
        headers: headers,
        body: fd,
    });

    if (response.status !== 201) {
        console.log('error', response.statusText);
        throw Error(`Unable to save submission: ${response.statusText}`);
    } else {
        console.log(response);
        return response.json();
    }
}
