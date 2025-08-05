create or replace function bc_get_utm_easting(point geometry) returns int as
$$
DECLARE
BEGIN
    return trunc(st_x(st_transform(point, bc_get_utm_srid(point))));
EXCEPTION when others then
    raise notice 'Unable to get easting for srid %', bc_get_utm_srid(point);
    return null;
end;$$ language plpgsql;
