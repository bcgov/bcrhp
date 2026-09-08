import arches from 'arches';
import geojson from 'geojson';
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

export async function getHeritageSite(
    siteId: string,
): Promise<HeritageSiteType> {
    const response = await fetch(
        arches.urls.get_heritage_site(siteId) + '?format=json',
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

export type PidData = {
    success: boolean;
    pid: string;
    legalDescription: string;
    boundary: geojson.GeoJSON;
    errors: string[];
};

export async function getPidData(pid: string): Promise<Partial<PidData>> {
    const response = await fetch(arches.urls.pmbc_parcel_data(pid), {
        method: 'GET',
    });

    //bad response
    if (!response.ok) {
        return { success: false, errors: [response.statusText] };
    }

    const data = await response.json();
    const features = data?.data?.features || [];

    //no features
    if (features.length === 0) {
        return { success: false, errors: ['no features found'] };
    }

    const firstFeature = features[0];
    const result: Partial<PidData> = {
        success: true,
        pid: firstFeature.properties.PID,
        legalDescription: firstFeature.properties.LEGALDESCRIPTION,
        boundary: firstFeature,
    };

    //warning if more then 1 feature
    if (features.length > 1) {
        result.errors = ['warning: more than one feature found'];
    }

    return result;
}

async function buildHeritageSiteFormData(
    site: HeritageSiteType,
): Promise<FormData> {
    const fd = new FormData();

    // Collect new file binaries from the original site object before cloning, because
    // File instances are not JSON-serialisable and would be lost in the deep copy.
    site.aliased_data.site_images.forEach((image_tile: SiteImagesTileType) => {
        const file: FileReference = image_tile.aliased_data.site_images
            .node_value[0] as FileReference;
        if (file?.file instanceof File) {
            fd.append(
                `file-list_${image_tile.tileid}-${file.node_id}`,
                file.file,
                file.name,
            );
        }
    });

    site.aliased_data.site_document.forEach(
        (document_tile: SiteDocumentTileType) => {
            const file = document_tile.aliased_data.site_document.node_value[0];
            if (file?.file instanceof File) {
                fd.append(
                    `file-list_${document_tile.tileid}-${file.node_id}`,
                    file.file,
                    file.name,
                );
            }
        },
    );

    // Deep-clone the site for the JSON payload so we never mutate the reactive state.
    // The server identifies which FormData part belongs to a file-list node by matching
    // the "file-list_<tileid>-<nodeid>" key, so file_id in the JSON must use that same
    // format for new uploads — but only on the clone, not the live object.
    const siteForJson = JSON.parse(JSON.stringify(site)) as HeritageSiteType;

    siteForJson.aliased_data.site_images.forEach(
        (image_tile: SiteImagesTileType, index: number) => {
            const file: FileReference = site.aliased_data.site_images[index]
                ?.aliased_data?.site_images?.node_value?.[0] as FileReference;
            if (file?.file instanceof File) {
                siteForJson.aliased_data.site_images[
                    index
                ].aliased_data.site_images.node_value[0].file_id =
                    `file-list_${image_tile.tileid}-${file.node_id}`;
            }
        },
    );

    siteForJson.aliased_data.site_document.forEach(
        (document_tile: SiteDocumentTileType, index: number) => {
            const file =
                site.aliased_data.site_document[index]?.aliased_data
                    ?.site_document?.node_value?.[0];
            if (file?.file instanceof File) {
                siteForJson.aliased_data.site_document[
                    index
                ].aliased_data.site_document.node_value[0].file_id =
                    `file-list_${document_tile.tileid}-${file.node_id}`;
            }
        },
    );

    fd.append('json', JSON.stringify(siteForJson));
    return fd;
}

export async function submitHeritageSite(
    site: HeritageSiteType,
): Promise<HeritageSiteType> {
    const csrftoken = await getToken();
    const fd = await buildHeritageSiteFormData(site);

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
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            throw new Error(
                `Unable to save submission: ${response.statusText}`,
                { cause: e },
            );
        }
        throw errorData;
    }

    const responseData = await response.json();
    console.log('✅ RETURNED FROM BACKEND:', responseData);

    return responseData;
}

export async function updateHeritageSite(
    site: HeritageSiteType,
): Promise<HeritageSiteType> {
    const resourceinstanceid = site.resourceinstanceid;
    if (!resourceinstanceid) {
        throw new Error('Cannot update a site without a resourceinstanceid');
    }

    const csrftoken = await getToken();
    const fd = await buildHeritageSiteFormData(site);

    const headers: Record<string, string> = {
        'X-CSRFToken': csrftoken,
        Accept: 'application/json',
        // DO NOT set Content-Type; the browser will add the correct multipart boundary.
    };
    const response = await fetch(
        arches.urls.submit_update_site(resourceinstanceid),
        {
            method: 'PATCH',
            headers: headers,
            body: fd,
        },
    );

    if (response.status !== 200) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            throw new Error(
                `Unable to update submission: ${response.statusText}`,
                { cause: e },
            );
        }
        throw errorData;
    }

    const responseData = await response.json();
    console.log('✅ RETURNED FROM BACKEND:', responseData);

    return responseData;
}
