import path from 'path';
import * as dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
import { test, expect } from '@playwright/test';

test.use({
    ignoreHTTPSErrors: true,
    headless: false,
});

test('test', async ({ page }) => {
    test.setTimeout(120000);
    const idir_username = process.env.IDIR_USERNAME;
    const idir_password = process.env.IDIR_PASSWORD;

    // Get the directory of the current file
    const __dirname = path.dirname(__filename);

    if (!idir_username || !idir_password)
        throw new Error('Missing TEST_USER/TEST_PASSWORD env vars');

    // --- LOGIN ---
    await page.goto('http://localhost/bcrhp/');
    await page.getByRole('link', { name: 'Search Sites' }).click();
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('link', { name: 'IDIR' }).click();
    await page.locator('#user').fill(idir_username);
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill(idir_password);
    await page.getByRole('button', { name: 'Continue' }).click();
    // await expect(
    //     page.getByRole('link', { name: 'Local Government Workflows' }),
    // ).toBeVisible({ timeout: 20000 });

    // --- 1 START SUBMISSION ---
    await page.goto('http://localhost/bcrhp/submissions/');
    await page
        .getByRole('link', { name: 'Submit a new Heritage Property' })
        .click();
    await page.getByRole('button', { name: 'Next' }).first().click();

    // --- 2 SITE LOCATION ---

    await page.locator('#street_address').isVisible({ timeout: 3000 });
    await page.locator('#street_address').click();
    await page.locator('#street_address').fill('street address');
    await page.getByRole('textbox', { name: 'City' }).click();
    await page.getByRole('textbox', { name: 'City' }).fill('city');
    await page.getByRole('textbox', { name: 'Postal Code' }).click();
    await page.getByRole('textbox', { name: 'Postal Code' }).fill('T5T 5T5');
    await page.getByRole('textbox', { name: 'Locality' }).click();
    await page.getByRole('textbox', { name: 'Locality' }).fill('locality');
    await page.locator('#location_description .ql-editor').first().click();
    await page
        .locator('#location_description .ql-editor')
        .first()
        .fill('location description');
    await page.getByRole('button', { name: '+ Add Address' }).click();
    await page.getByRole('button', { name: '+ Add PID' }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('textbox', { name: 'Enter number' }).click();
    await page.getByRole('textbox', { name: 'Enter number' }).fill('026488248');
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Get Boundary' }).click();
    await page.waitForTimeout(4000);
    await page.getByRole('button', { name: 'Save' }).click();
    await page.getByRole('button', { name: 'Next' }).first().click();

    // --- 3 SPATIAL LOCATION ---
    // await page.setInputFiles(
    //     'input[type="file"]',
    //     path.join(__dirname, 'polygon.shp'),
    // );
    // await page.waitForTimeout(2000);
    await page.getByRole('button', { name: 'Next' }).first().click();

    // --- 4 SITE NAMES ---
    await page.locator('form[name="commonNameForm"] #name').click();
    await page.locator('form[name="commonNameForm"] #name').fill('common name');
    await page.locator('form[name="otherNameForm"] #name').click();
    await page.locator('form[name="otherNameForm"] #name').fill('other names');
    await page.getByRole('button', { name: '+ Add' }).click();
    await page.getByRole('button', { name: 'Next' }).nth(1).click();

    // --- 5 OFFICIAL RECOGNITION DETAILS ---
    await page.locator('#designation_or_protection_start_date').click();
    await page.getByText('27', { exact: true }).click();
    await page.locator('#legislative_act').click();
    await page.getByText('Municipal, Community Charter').click();
    await page.locator('#reference_number').click();
    await page.locator('#reference_number').fill('bylaw 123');
    // await page.getByRole('textbox', { name: 'E.g. Bylaw' }).click();
    // await page.getByRole('textbox', { name: 'E.g. Bylaw' }).fill('bylaw 123');
    await page.getByRole('button', { name: '+ Add Protection Event' }).click();
    await page.getByRole('button', { name: 'Next' }).first().click();

    // --- 6 STATEMENT OF SIGNIFICANCE ---
    await page
        .locator(
            '#physical_description > .p-editor > .p-editor-content > .ql-editor',
        )
        .click();
    await page
        .locator(
            '#physical_description > .p-editor > .p-editor-content > .ql-editor',
        )
        .fill('statement of significance');
    await page
        .locator('#heritage_value > .p-editor > .p-editor-content > .ql-editor')
        .click();
    await page
        .locator('#heritage_value > .p-editor > .p-editor-content > .ql-editor')
        .fill('heritage value');
    await page
        .locator(
            '#defining_elements > .p-editor > .p-editor-content > .ql-editor',
        )
        .click();
    await page
        .locator(
            '#defining_elements > .p-editor > .p-editor-content > .ql-editor',
        )
        .fill('character defining elements');
    await page.locator('#document_location').click();
    await page.locator('#document_location').fill('Somewhere around here...');
    // await page.getByRole('textbox', { name: 'Enter text' }).click();
    // await page
    //     .getByRole('textbox', { name: 'Enter text' })
    //     .fill('document location');
    await page.getByRole('button', { name: 'Next' }).first().click();

    // --- 7 IMAGES ---
    await page.setInputFiles(
        'div[data-node-alias="site_images"] input[type="file"]',
        path.join(__dirname, 'house.jpg'),
    );
    const removeImageBtn = page.getByRole('button', {
        name: 'Remove / Change Image',
    });
    await expect(removeImageBtn).toBeVisible({ timeout: 15000 });
    await page.locator('#image_type').getByText('Select an option').click();
    await page
        .locator('div')
        .filter({ hasText: /^Contemporary$/ })
        .click();
    await page.locator('#image_view').getByText('Select an option').click();
    await page
        .locator('div')
        .filter({ hasText: /^Exterior$/ })
        .click();
    await page
        .locator(
            '#image_description > .p-editor > .p-editor-content > .ql-editor',
        )
        .click();
    await page
        .locator(
            '#image_description > .p-editor > .p-editor-content > .ql-editor',
        )
        .fill('image description');
    await page.getByRole('textbox', { name: 'E.g. Entrance' }).click();
    await page
        .getByRole('textbox', { name: 'E.g. Entrance' })
        .fill('image features');
    await page.getByRole('textbox', { name: 'Photographer' }).click();
    await page
        .getByRole('textbox', { name: 'Photographer' })
        .fill('photographer');
    await page.getByRole('textbox', { name: 'Copyright' }).click();
    await page.getByRole('textbox', { name: 'Copyright' }).fill('copyright');
    await page.getByRole('button', { name: ' Save' }).click();
    await page.waitForTimeout(2000);

    // --- image upload 2 ---
    // await page.setInputFiles('input[type="file"]', 'tests/house.jpg');
    await page.setInputFiles(
        'div[data-node-alias="site_images"] input[type="file"]',
        path.join(__dirname, 'east_side.jpg'),
    );
    await page.locator('#image_type').getByText('Select an option').click();
    await page
        .locator('div')
        .filter({ hasText: /^Historical$/ })
        .click();
    await page.locator('#image_view').getByText('Select an option').click();
    await page
        .locator('div')
        .filter({ hasText: /^Interior$/ })
        .click();
    await page
        .locator(
            '#image_description > .p-editor > .p-editor-content > .ql-editor',
        )
        .click();
    await page
        .locator(
            '#image_description > .p-editor > .p-editor-content > .ql-editor',
        )
        .fill('image description 2');
    await page.getByRole('textbox', { name: 'E.g. Entrance' }).click();
    await page
        .getByRole('textbox', { name: 'E.g. Entrance' })
        .fill('image features 2');
    await page.getByRole('textbox', { name: 'Photographer' }).click();
    await page
        .getByRole('textbox', { name: 'Photographer' })
        .fill('photographer 2');
    await page.getByRole('textbox', { name: 'Copyright' }).click();
    await page.getByRole('textbox', { name: 'Copyright' }).fill('copyright 2');
    await page.getByRole('button', { name: ' Save' }).click();
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: 'Next' }).first().click();

    // --- 8 SITE CLASSIFICATION ---
    page.locator('#contributing_resource_count').click();
    page.locator('#contributing_resource_count').fill('2');
    await page
        .locator('#heritage_category')
        .getByText('Select an option')
        .click();
    await page
        .locator('div')
        .filter({ hasText: /^Archaeological Site \/ Remains$/ })
        .click();
    await page.locator('#ownership').getByText('Select an option').click();
    await page
        .locator('div')
        .filter({ hasText: /^Not-for-profit$/ })
        .click();
    await page.getByRole('button', { name: '+ Add Heritage Class' }).click();
    await page
        .locator('#functional_category')
        .getByText('Select an option')
        .click();
    await page
        .locator('div')
        .filter({ hasText: /^Commerce \/ Commercial Services$/ })
        .click();
    await page.locator('#functional_state').getByRole('button').click();
    await page.getByText('Current').click();
    await page.getByRole('button', { name: '+ Add Function' }).click();
    // await page
    //     .locator('#functional_category')
    //     .getByText('Select an option')
    //     .click();
    // await page
    //     .locator('div')
    //     .filter({ hasText: /Bank or Stock Exchange/ })
    //     .click();
    // // await page.getByText('Bank or Stock Exchange').click();
    // await page.locator('#functional_state').getByRole('button').click();
    // await page.getByText('Current').click();
    // await page.getByRole('button', { name: '+ Add Function' }).click();
    await page
        .getByLabel('Heritage Theme')
        .getByText('Select an option')
        .click();
    await page.getByText('Building Social and Community').click();
    await page
        .getByLabel('Building Social and Community')
        .getByRole('button')
        .filter({ hasText: /^$/ })
        .click();
    await page
        .locator('div')
        .filter({ hasText: /^Education and Social Well-Being$/ })
        .click();
    await page.locator('.bcgov-vertical-steps').click();
    await page.getByRole('button', { name: 'Next' }).first().click();

    // --- 9 SITE DETAILS ---
    await page
        .getByRole('region', { name: 'Chronology' })
        .getByRole('button')
        .click();
    await page
        .locator('div')
        .filter({ hasText: /^Construction$/ })
        .click();
    await page.getByRole('combobox', { name: 'Start Year' }).click();
    await page.getByText('2020', { exact: true }).click();
    await page.getByRole('combobox', { name: 'End Year' }).click();
    await page.getByText('2025').click();
    await page.getByRole('textbox', { name: 'Provide explanation of' }).click();
    await page
        .getByRole('textbox', { name: 'Provide explanation of' })
        .fill('chronology notes');
    await page.getByRole('button', { name: '+ Add Chronology' }).click();
    await page.locator('#construction_actor').click();
    await page.locator('#construction_actor').fill('Bob');
    await page.getByText('Select the type', { exact: true }).click();
    await page.getByText('Builder', { exact: true }).click();
    await page.locator('#construction_actor_notes').click();
    await page.locator('#construction_actor_notes').fill('Builders Notes');
    await page.getByRole('button', { name: '+ Add Architect/Builder' }).click();
    await page
        .locator(
            '#external_url_type > .p-treeselect-label-container > .p-treeselect-label',
        )
        .click();
    await page.getByText('Other Website').click();
    await page.getByRole('textbox', { name: 'Enter URL Label...' }).click();
    await page
        .getByRole('textbox', { name: 'Enter URL Label...' })
        .fill('URL label');
    await page.getByPlaceholder('Enter URL...').click();
    await page.getByPlaceholder('Enter URL...').fill('www.google.com');
    await page.getByRole('button', { name: '+ Add URL' }).click();

    // --- 10 SUPPORTING DOCUMENTS ---
    await page.setInputFiles(
        'div[data-node-alias="site_document"] input[type="file"]',
        path.join(__dirname, 'test_doc.pdf'),
    );
    await page.waitForTimeout(2000);
    await page
        .locator('div')
        .filter({ hasText: /^Document$/ })
        .nth(1)
        .click();
    await page.getByRole('textbox', { name: 'Document Description' }).click();
    await page
        .getByRole('textbox', { name: 'Document Description' })
        .fill('document description');
    const addButton = page.getByRole('button', { name: '+ Add' });
    await addButton.click();
    await page
        .locator('#submissionNotes > .p-editor-content > .ql-editor')
        .click();
    await page
        .locator('#submissionNotes > .p-editor-content > .ql-editor')
        .fill('Submission Notes');
    await page.getByRole('button', { name: 'Next' }).first().click();

    await page.pause();
});
