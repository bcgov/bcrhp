create or replace function bc_get_utm_zone(point geometry) returns int as
$$
DECLARE
BEGIN
    return int4(ceil((st_x(st_centroid(point)) + 180.0) / 6));
end;$$ language plpgsql;


