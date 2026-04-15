# Running in Docker

**These steps assume that the base directory is ~/root.**

1. Start Docker Desktop

2. Create the Arches Dependency Containers:
``` shell
cd ~/root
git clone https://github.com/bcgov/arches-dependency-containers
cd arches-dependency-containers/arches-7-5-2
docker compose up
```
This should result in a set of docker containers that have the base dependency software to run
Arches (Postgres, Elasticsearch, Redis, etc).

3. Clone BCGov Arches Core at the same level as this directory. Assuming that all dependencies
   are installed in ~/root/bcrhp/ by running `git clone  https://github.com/bcgov/bcrhp`.
``` shell
cd root/
git clone https://github.com/bcgov/arches
git clone https://github.com/bcgov/bcgov-arches-common
git clone https://github.com/archesproject/arches-component-lab
git clone https://github.com/archesproject/arches-querysets
cd arches && git checkout stable/7.6.12.bcgov_12008
# This should result in a directory structure like the below:
~/root/
     /root/arches/                # <- This is a clone of the arches bcgov/arches repo
     /root/arches-component-lab/  # <- This is a clone of the bcgov/bcgov-arches-common repo
     /root/arches-dependency-containers # <- This is a clone of bcgov/arches-dependency-containers repo
     /root/arches-querysets/      # <- This is a clone of the bcgov/bcgov-arches-common repo
     /root/bcgov-arches-common/   # <- This is a clone of the bcgov/bcgov-arches-common repo
     /root/bcrhp/                 # <- This directory
```

Change the branch of each of the repos you have just cloned to the following:
```
repo: bcrhp
branch: release/1.4.0
```

```
repo: arches
branch: stable/7.6.12_bcgov_12008
```

```
repo: arches-component-lab
branch: main
```

```
repo: arches-dependency-containers
branch: main
```

```
repo: arches-querysets
branch: dev/1.1.x
```

```
repo: bcgov-arches-common
branch: release/2.0.x
```

4. js-cookie fix
   1. Replace the following lines in `root/arches/package.json`
      ```json
      arches/arches/package.json  (should be "js-cookie": "node_modules/js-cookie/dist/js.cookie",)
      ```
   2. In bcrhp/package.json, line 60 make this change:
      ```json
      "arches": "github:bcgov/arches#v7.6.12.1_bcgov", -> "arches": "file:../arches",
      ```
   3. Run inside the `bcrhp7-6` docker container in the `Exec` tab
      ```bash
      docker exec -it bcrhp7-6 /bin/bash
      ```
   4. Then from within you should see this prompt `root@7728bccd9602:/web_root/bcrhp#` run this:
      ```bash
      rm -Rf node_modules/ && npm install &&  npm run build_development
      ```

5. Create the `root/bcrhp/.env` file using the dot.env.j2 as a template.
- The AUTH_BYPASS_HOSTS should include the webpack container name and IP address, `localhost` and the bcrhp container
name and IP address. This is typically not available until after creating the container in the next step, so the
webpack build will fail. After creating the container add the 2 IP addresses to the `AUTH_BYPASS_HOSTS` parameter and
restart the containers. The webpack build should work the second time around
- Fill in all .env variables with `{{ }}` values, substituting the appropriate values.

6. Change to the root/bcrhp/bcrhp directory and create the test user data file at
   `bcrhp/management/data/test_user_list.py`:

    1. the password is only a dummy password so it can be left as is. OIDC is used so when
       authenticating you will use your IDIR username and password.
    2. the `@idir` suffix is necessary
    3. tht `<idir username>` must be in lower case
      ``` python
      def get_user_list():
         return (
         {"name": "<idir username>@idir", "email": "<email>", "password": "Test12345!", "is_superuser": True,
         "is_staff": True, "first_name": "<first name>", "last_name": "<last name>",
         "groups": ["Resource Editor", "Resource Reviewer", "Heritage Branch", "Resource Exporter"]},
         )
      ```
   4. upload your user by running this command in the terminal on the `Exec` tab of the running `bcrhp7-6` container.
      ```shell
      python3.11 manage.py bc_test_users --refresh True
      ```

7. Create the BCRHP containers (this will fail the first time):
   ```shell
   cd root/bcrhp/
   docker compose up
   ```

You should now be able to access BCRHP at http://localhost/bcrhp

8. If you have been given a `<filename>.sql` database file use the following steps to upload the database.

   1. copy the file into your running docker container by using an outside terminal.
      ```shell
      docker cp <filename>.sql bcrhp7-6:/tmp/<filename>.sql
      ```
   2. Create the database inside the container but running these commands in the terminal in the `Exec` tab inside the `bcrhp7-6` container.
      ```shell
      createdb -U postgres -h postgres16-3_arches7-5-2 bcrhp
      psql -U postgres -h postgres16-3_arches7-5-2 -d bcrhp -c "CREATE EXTENSION IF NOT EXISTS postgis;"
      psql -U postgres -h postgres16-3_arches7-5-2 -d bcrhp -f /tmp/<filename>.sql
      python3.11 manage.py es index_database
      ```
   3. Link search inside the container.
      ```shell
      python3.11 manage.py es index_database
      ```
   4. Create your superuser inside the container.
      ```shell
      python3.11 manage.py createsuperuser
      ```
   5. You may need to upload your user from step 6 again inside the container.
      ```shell
      python3.11 manage.py bc_test_users --refresh True
      ```

9. After logging into [BCRHP](http://localhost/bcrhp) in the browser, the map will initially be blank, follow these steps to add your `MapBox API key`.
   1. Open the search site page from the [homepage](http://localhost/bcrhp).
   2. Login using the arrow on the top right of the page.
   3. After loggin in find the `"Manage system settings"` icon on the left side and click `"system settings"`.
   4. Double click the `"MapBox API Key (optional)"` field to enter your key.
