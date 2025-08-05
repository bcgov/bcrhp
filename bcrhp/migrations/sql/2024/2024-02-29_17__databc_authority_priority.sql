drop function if exists databc.authority_priority cascade;
create or replace function databc.authority_priority(authority_level text) returns numeric as
$$
begin
return
case when authority_level = 'Provincial' then 2
when authority_level = 'Municipal' then 1
else 0 end;
end
$$ language plpgsql;
ALTER FUNCTION databc.authority_priority(authority_level text) SECURITY DEFINER SET search_path = public;
-- select * from MV_HISTORIC_ENVIRO_ONEROW_SITE order by borden_number;
-- select * from MV_HISTORIC_ENVIRO_ONEROW_SITE where borden_number in ('DcRu-235', 'DcRu-234');
-- select * from V_HISTORIC_ENVIRO_ONEROW_SITE where borden_number in ('DcRu-235', 'DcRu-234');
-- drop materialized view if exists MV_HISTORIC_ENVIRO_ONEROW_SITE;
-- refresh materialized view MV_HISTORIC_ENVIRO_ONEROW_SITE;
