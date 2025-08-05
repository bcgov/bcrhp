drop materialized view if exists mv_site_boundary cascade;
create materialized view mv_site_boundary as
select b.resourceinstanceid,
site_boundary,
st_area(site_boundary::geography) as area_sqm,
st_y(st_centroid(site_boundary)) as site_centroid_latitude,
st_x(st_centroid(site_boundary)) as site_centroid_longitude,
bc_get_utm_zone(st_centroid(site_boundary)) as utmzone,
bc_get_utm_northing(st_centroid(site_boundary)) as utmnorthing,
bc_get_utm_easting(st_centroid(site_boundary)) as utmeasting
from heritage_site.site_boundary b join heritage_site.borden_number bn on b.resourceinstanceid = bn.resourceinstanceid;
create index mv_sb_idx on mv_site_boundary(resourceinstanceid);
