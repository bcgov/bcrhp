drop materialized view if exists mv_protection_event cascade;
create materialized view mv_protection_event as
select pe.resourceinstanceid,
bc_right as bc_right_id,
(pe.legislative_act[0]->>'resourceId')::uuid as legislative_act_id,
(pe.responsible_government[0]->>'resourceId')::uuid as government_id,
designation_or_protection_start_date,
designation_or_protection_end_date,
reference_number->'en'->>'value' as reference_number,
protection_notes->'en'->>'value' as protection_notes
from heritage_site.protection_event pe;
create index pe_ri_fk_idx on mv_protection_event(resourceinstanceid, legislative_act_id, government_id);
