Instructions for using Playwright scripts:

1. Install node packages:
   `npm install`
2. Create a .env that with your IDIR username and password:

    ```
    IDIR_USERNAME="<IDIR Username>"
    IDIR_PASSWORD="<IDIR Password>"
    ```

    alternativly run

    ```
    IDIR_USERNAME=<IDIR Username> IDIR_PASSWORD=<IDIR Password> npx playwright test <test_filename.spec.ts>
    ```

3. Run your script:
   `./run_test.sh <spec filename> [--project=<chromium|firefox|webkit>]`

4. Generate tests:
5.
