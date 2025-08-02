create materialized view mv_bc_statement_of_significance as
select resourceinstanceid,
       defining_elements->'en'->>'value' as defining_elements,
       physical_description->'en'->>'value' as physical_description,
       document_location->'en'->>'value' as document_location,
       __arches_get_concept_label(significance_type) as significance_type,
       heritage_value->'en'->>'value' as heritage_value
from heritage_site.bc_statement_of_significance sos;
create index sos_ri_idx1 on mv_bc_statement_of_significance(resourceinstanceid);
