create or replace view databc.V_HISTORIC_ENVIRO_ONEROW_SITE as
select distinct
    resourceinstanceid site_id,
    borden_number borden_number,
    case when officially_recognized_site then 'Y' else 'N' end is_officially_recognized,
    registration_status registration_status,
    common_name,
    other_name,
    pid parcel_id,
    street_address,
    city,
    province,
    locality,
    location_description,
    authorities->>'government_name' as government_name,
    authorities->>'authority' as government_level,
    authorities->>'recognition_type' as protection_type,
    to_date(authorities->>'start_date', 'YYYY-MM-DD') as protection_start_date,
    authorities->>'reference_number' as reference_number,
    case when chronology is null then null else
        (select
             to_char(to_date(a->>'start_year', 'YYYY-MM-DD'), 'YYYY')::numeric(4,0)
         from jsonb_array_elements(chronology) a where a->>'event' = 'Construction' limit 1)
        end as construction_date,
    case when chronology is null then null else
        (select case when (a->>'dates_approximate')::boolean then 'Circa' end
         from jsonb_array_elements(chronology) a where a->>'event' = 'Construction' limit 1)
        end as construction_date_qualifier,
    case when significance_statement is null then null else (significance_statement->>'significance_type') end as significance_type,
    case when significance_statement is null then null else (significance_statement->>'physical_description') end as physical_description,
    case when significance_statement is null then null else (significance_statement->>'heritage_value') end as heritage_value,
    case when significance_statement is null then null else (significance_statement->>'defining_elements') end as defining_elements,
    case when significance_statement is null then null else (significance_statement->>'document_location') end as document_location,
    actors->'Architect / Designer'->>'actors' as architect_name,
    actors->'Builder'->>'actors'  as builder_name,
    functional_states->>'Current' as current_function,
    functional_states->>'Historic' as historic_function,
    dimensions_area_sqm,
    gis_latitude,
    gis_longitude,
    utm_zone,
    utm_northing,
    utm_easting,
    site_url,
    site_boundary
from V_HISTORIC_SITE
where bcrhp_submission_status in ('Approved - Basic Record','Approved - Full Record')
  and registration_status in ('Federal Jurisdiction', 'Recorded/Unprotected', 'Registered', 'Legacy')
  and not coalesce(restricted, false);
grant select on databc.v_historic_enviro_onerow_site to {db_databc_user};