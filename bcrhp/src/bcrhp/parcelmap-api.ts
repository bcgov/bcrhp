import type { FeatureCollection } from 'geojson';

const PARCELMAP_URL =
    '/bcrhp/bctileserver/geo/pub/WHSE_CADASTRE.PMBC_PARCEL_FABRIC_POLY_SVW/ows?service=WFS&version=2.0.0&request=GetFeature&srsName=EPSG:4326&typeNames=WHSE_CADASTRE.PMBC_PARCEL_FABRIC_POLY_SVW&outputFormat=application/json&CQL_FILTER=OBJECTID=';
export const getFeatureForObjectId = async (objectid: number) => {
    const response = await fetch(PARCELMAP_URL + objectid);
    if (response.ok) {
        const featureCollection =
            (await response.json()) as unknown as FeatureCollection;
        if (featureCollection.features.length > 0) {
            return {
                type: 'Feature',
                geometry: featureCollection.features[0].geometry,
                properties: {},
            };
        }
    } else {
        console.error(response.statusText);
    }
    return null;
};
