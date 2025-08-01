drop materialized view if exists mv_construction_actors cascade;
create materialized view mv_construction_actors as
select resourceinstanceid,
__arches_get_concept_label(construction_actor_type) actor_type,
array_agg(construction_actor->'en'->>'value') actors
from heritage_site.construction_actors
group by resourceinstanceid, __arches_get_concept_label(construction_actor_type);
create index mv_ca_idx on mv_construction_actors(resourceinstanceid);
create or replace function bc_get_utm_zone(point geometry) returns int as
$$
DECLARE
BEGIN
return int4(ceil((st_x(st_centroid(point)) + 180.0) / 6));
end;$$ language plpgsql;
create or replace function bc_get_utm_srid(point geometry) returns int as
$$
DECLARE
BEGIN
return 26900 + bc_get_utm_zone(point);
end;$$ language plpgsql;
create or replace function bc_get_utm_northing(point geometry) returns int as
$$
DECLARE
BEGIN
return trunc(st_y(st_transform(point, bc_get_utm_srid(point))));
EXCEPTION when others then
raise notice 'Unable to get northing for srid %', bc_get_utm_srid(point);
return null;
end;$$ language plpgsql;
create or replace function bc_get_utm_easting(point geometry) returns int as
$$
DECLARE
BEGIN
return trunc(st_x(st_transform(point, bc_get_utm_srid(point))));
EXCEPTION when others then
raise notice 'Unable to get easting for srid %', bc_get_utm_srid(point);
return null;
end;$$ language plpgsql;
