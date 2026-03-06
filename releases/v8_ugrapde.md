BCRHP
1. Need to rebuild docker container to fix dependencies
2. `Migration models.12008_alter_file_path is applied before its dependency models.11869_rename_resxres_fields on database 'default'.` - 
   1. Fix: `delete from django_migrations where app  = 'models' and name = '12008_alter_file_path';`
   2. change 0001_initial_pre_package.py dependency to: `dependencies = [("models", "11499_add_editlog_resourceinstance_idx")]`
3. In dev needed to run: `python manage.py validate --fix 1012`