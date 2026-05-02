Instructions for using Playwright scripts:

## TypeScript (original)

1. Install node packages:
   `npm install`
2. Create a `.env` with your IDIR credentials:

    ```
    IDIR_USERNAME="<IDIR Username>"
    IDIR_PASSWORD="<IDIR Password>"
    ```

    Alternatively pass them inline:

    ```
    IDIR_USERNAME=<user> IDIR_PASSWORD=<pass> npx playwright test <test_filename.spec.ts>
    ```

3. Run your script:
   `./run_test.sh <spec filename> [--project=<chromium|firefox|webkit>]`

4. Generate tests using the Playwright recorder:
   `npx playwright codegen http://localhost/bcrhp/`

---

## Python

Tests live in `python/tests/`. They mirror the TypeScript tests 1-for-1 using
`pytest-playwright` (synchronous API).

### Setup

```bash
cd python
pip install -r requirements.txt
playwright install          # download browsers (first time only)
```

### Credentials

The same `../.env` file is used automatically (`IDIR_USERNAME` / `IDIR_PASSWORD`).
You can also pass them inline:

```bash
IDIR_USERNAME=<user> IDIR_PASSWORD=<pass> pytest tests/test_to_review_page.py
```

### Run tests

```bash
cd python

# All tests (headed, chromium — defaults set in conftest.py)
pytest

# Specific test file
pytest tests/test_to_review_page.py
pytest tests/test_submission_errors.py
pytest tests/test_to_spatial.py

# Choose a browser
pytest --browser firefox
pytest --browser webkit

# Run headless (overrides conftest default)
pytest --headless

# Verbose output
pytest -v
```
