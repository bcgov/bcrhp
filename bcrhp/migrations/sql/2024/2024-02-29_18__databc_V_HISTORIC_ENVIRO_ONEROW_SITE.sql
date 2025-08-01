drop view if exists databc.V_HISTORIC_ENVIRO_ONEROW_SITE;
-- create materialized view MV_HISTORIC_ENVIRO_ONEROW_SITE as
create or replace view databc.V_HISTORIC_ENVIRO_ONEROW_SITE as
select distinct bn.resourceinstanceid site_id,
bn.borden_number borden_number,
case when br.officially_recognized_site then 'Y' else 'N' end is_officially_recognized,
br.registration_status registration_status,
cn.name                                 common_name,
array_to_string(other_name.names, '; ') other_name,
prop.pid         parcel_id,
prop.street_address street_address,
prop.city,
prop.province,
prop.locality,
prop.location_description,
br.authorities->>'government_name' government_name,
br.authorities->>'authority' government_level,
br.authorities->>'recognition_type' protection_type,
to_date(br.authorities->>'start_date', 'YYYY-MM-DD') protection_start_date,
br.authorities->>'reference_number' reference_number,
case when mc.chronology is null then null else to_char(to_date(chronology[0]->>'start_year', 'YYYY-MM-DD'), 'YYYY')::numeric(4,0) end construction_date,
case when mc.chronology is not null and (chronology[0]->>'dates_approximate')::boolean then 'Circa' end construction_date_qualifier,
--                 case when mc.chronology is null then null else chronology[0]->>'event' end event_type,
--                 case when msra.crhp_submission_status = 'Approved' then 'Y' else 'N' end is_accepted_by_feds,
case when significance_statement is null then null else (significance_statement->>'significance_type') end significance_type,
case when significance_statement is null then null else (significance_statement->>'physical_description') end physical_description,
case when significance_statement is null then null else (significance_statement->>'heritage_value') end heritage_value,
case when significance_statement is null then null else (significance_statement->>'defining_elements') end defining_elements,
case when significance_statement is null then null else (significance_statement->>'document_location') end document_location,
ca.actors->>'Architect / Designer' architect_name,
ca.actors->>'Builder' builder_name,
hf.functional_states->>'Current' current_function,
hf.functional_states->>'Historic' historic_function,
msb.area_sqm::numeric(19,2) dimensions_area_sqm,
msb.site_centroid_latitude::numeric(10,6) gis_latitude,
msb.site_centroid_longitude::numeric(10,6) gis_longitude,
msb.utmzone::numeric(2,0) utm_zone,
msb.utmnorthing::numeric(10,0) utm_northing,
msb.utmeasting::numeric(10,0) utm_easting,
'https://apps.nrs.gov.bc.ca/int/bcrhp/report/'||bn.resourceinstanceid site_url,
msb.site_boundary
--                 prop.location_description,
--                 prop.pin,
--                 prop.legal_description,
--                 msra.restricted,
--                ,msra.bcrhp_submission_status
--                 msra.date_submitted_to_crhp,
--                 msra.federal_id_number
from mv_borden_number bn
left join (select resourceinstanceid, name from mv_site_names where name_type = 'Common') cn on cn.resourceinstanceid = bn.resourceinstanceid
left join (select resourceinstanceid, array_agg(name) names from mv_site_names where name_type = 'Other' group by resourceinstanceid) other_name on other_name.resourceinstanceid = bn.resourceinstanceid
join (select distinct r.resourceinstanceid,
r.officially_recognized_site,
r.registration_status,
jsonb_agg(
case when pe.authority is null then null else
jsonb_build_object(
'authority', pe.authority,
'auth_order', databc.authority_priority(pe.authority),
'start_date', pe.designation_or_protection_start_date,
'government_name', pe.government_name,
'recognition_type', pe.recognition_type,
'reference_number', pe.reference_number
) end order by databc.authority_priority(pe.authority) desc,
designation_or_protection_start_date desc )->0 authorities
--                        pe.designation_or_protection_end_date, registry_types, pe.reference_number, pe.protection_notes, pe.legal_instrument, pe.act_section, pe.recognition_type, pe.government_type
from mv_bc_right r
left join mv_site_protection_event pe on r.bc_right_id = pe.bc_right_id
group by r.resourceinstanceid, r.officially_recognized_site, r.registration_status) br
on bn.resourceinstanceid = br.resourceinstanceid
join mv_site_record_admin msra on bn.resourceinstanceid = msra.resourceinstanceid
left join (select resourceinstanceid, jsonb_agg(
jsonb_build_object(
'start_year', start_year,
'end_year', end_year,
'dates_approximate', dates_approximate,
'event', event,
'source', source,
'event_notes', event_notes) order by start_year
) chronology from mv_chronology where event = 'Construction' group by resourceinstanceid ) mc on bn.resourceinstanceid = mc.resourceinstanceid
left join (select resourceinstanceid,
jsonb_object_agg(state_period, array_to_string(functional_states, '; ') ) functional_states
from mv_heritage_function
group by resourceinstanceid) hf on bn.resourceinstanceid = hf.resourceinstanceid
left join (select resourceinstanceid,
jsonb_object_agg(actor_type, array_to_string(actors, '; ')) actors
from mv_construction_actors
group by resourceinstanceid) ca on bn.resourceinstanceid = ca.resourceinstanceid
left join mv_site_boundary msb on bn.resourceinstanceid = msb.resourceinstanceid
left join (select resourceinstanceid,
jsonb_agg(
jsonb_build_object(
'significance_type', databc.html_to_plain_string(significance_type),
'significance_level', databc.authority_priority(significance_type),
'physical_description', databc.html_to_plain_string(physical_description),
'defining_elements', databc.html_to_plain_string(defining_elements),
'heritage_value', databc.html_to_plain_string(heritage_value),
'document_location', databc.html_to_plain_string(document_location)
)
order by databc.authority_priority(significance_type) desc
)->0 significance_statement
from mv_bc_statement_of_significance group by resourceinstanceid) sos on bn.resourceinstanceid = sos.resourceinstanceid,
databc.get_first_address(bn.resourceinstanceid) prop
where msra.bcrhp_submission_status in ('Approved - Basic Record','Approved - Full Record')
and registration_status in ('Federal Jurisdiction', 'Recorded/Unprotected', 'Registered', 'Legacy')
and not coalesce(msra.restricted, false);
