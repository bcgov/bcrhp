drop function if exists databc.get_first_address cascade;
create or replace function databc.get_first_address(p_resourceinstanceid uuid) returns
TABLE(resourceinstanceid uuid,
property_address_id uuid,
street_address text,
city text,
province text,
postal_code text,
locality text,
location_description text,
pid text,
pin text,
legal_description text) as
$$
BEGIN
return query select mpa.resourceinstanceid,
mpa.property_address_id,
mpa.street_address,
mpa.city,
mpa.province,
mpa.postal_code,
mpa.locality,
mpa.location_description,
case when mld.pid = 0 then null else lpad(mld.pid::text,9,'0') end pid,
case when mld.pin = 0 then null else lpad(mld.pin::text,9,'0') end pin,
mld.legal_description
from mv_property_address mpa
left join mv_legal_description mld
on mpa.property_address_id = mld.bc_property_address
where mpa.resourceinstanceid = p_resourceinstanceid
limit 1;
end
$$ language plpgsql;
ALTER FUNCTION databc.get_first_address(p_resourceinstanceid uuid) SECURITY DEFINER SET search_path = public;
