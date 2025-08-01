drop materialized view if exists mv_borden_number cascade;
create materialized view mv_borden_number as
select resourceinstanceid, borden_number->'en'->>'value' borden_number from heritage_site.borden_number;
create index bn_idx on mv_borden_number (resourceinstanceid);
