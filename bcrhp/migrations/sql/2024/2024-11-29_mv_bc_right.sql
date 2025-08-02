create materialized view mv_bc_right as
with unnested as (
    select resourceinstanceid,
           tileid as bc_right_id,
           officially_recognized_site,
           __arches_get_concept_label(registration_status) as registration_status,
           unnest(registry_types)  as registry_type
    from heritage_site.bc_right)
select resourceinstanceid,
       bc_right_id,
       officially_recognized_site,
       registration_status,
       array_agg(__arches_get_concept_label(registry_type)) as registry_types from unnested
group by resourceinstanceid,
         bc_right_id,
         officially_recognized_site,
         registration_status;
create index br_ri_idx on mv_bc_right(resourceinstanceid, bc_right_id);