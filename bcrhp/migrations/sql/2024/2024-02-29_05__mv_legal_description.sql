drop materialized view if exists mv_legal_description cascade;
create materialized view mv_legal_description as
select resourceinstanceid,
bc_property_address,
pid,
pin,
legal_description->'en'->>'value' legal_description
from heritage_site.bc_property_legal_description ld;
create index ld_ri_idx on mv_legal_description(resourceinstanceid, bc_property_address);
