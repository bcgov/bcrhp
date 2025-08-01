-- Schema databc and DataBC proxy object must be created prior to running this script
DO
$$
    declare
        databc_username text;
    begin
        databc_username := replace(current_database(), 'bcrhp', 'databc');
        EXECUTE format('execute grant execute on function databc.get_first_address(p_resourceinstanceid uuid) to %I;', databc_username);
        EXECUTE format('grant select on databc.V_HISTORIC_ENVIRO_ONEROW_SITE to %I;', databc_username);
    end
$$ language plpgsql;
