create or replace function bc_get_utm_srid(point geometry) returns int as
$$
DECLARE
BEGIN
    return 26900 + bc_get_utm_zone(point);
end;$$ language plpgsql;
