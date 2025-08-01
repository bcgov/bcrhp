drop materialized view if exists mv_site_boundary cascade;
create materialized view mv_site_boundary as
select b.resourceinstanceid,
site_boundary,
st_area(site_boundary::geography) area_sqm,
st_y(st_centroid(site_boundary)) site_centroid_latitude,
st_x(st_centroid(site_boundary)) site_centroid_longitude,
bc_get_utm_zone(st_centroid(site_boundary)) utmzone,
bc_get_utm_northing(st_centroid(site_boundary)) utmnorthing,
bc_get_utm_easting(st_centroid(site_boundary)) utmeasting
from heritage_site.site_boundary b join heritage_site.borden_number bn on b.resourceinstanceid = bn.resourceinstanceid;
create index mv_sb_idx on mv_site_boundary(resourceinstanceid);
create or replace procedure refresh_materialized_views() as
$$
BEGIN
refresh materialized view mv_bc_right;
refresh materialized view mv_bc_statement_of_significance;
refresh materialized view mv_borden_number;
refresh materialized view mv_chronology;
refresh materialized view mv_construction_actors;
refresh materialized view mv_government;
refresh materialized view mv_heritage_function;
refresh materialized view mv_legal_description;
refresh materialized view mv_property_address;
refresh materialized view mv_protection_event;
refresh materialized view mv_geojson_geoms;
refresh materialized view mv_site_boundary;
refresh materialized view mv_site_names;
refresh materialized view mv_site_protection_event;
refresh materialized view mv_site_record_admin;
END
$$ language plpgsql;
create schema if not exists databc;
