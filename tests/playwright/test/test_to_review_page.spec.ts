import { test, expect } from '@playwright/test';

test.use({
    viewport: null,

    launchOptions: {
        args: ['--start-maximized'],
    },

    ignoreHTTPSErrors: true,
    headless: false,
});

test('test', async ({ page }) => {
    const idir_username = process.env.IDIR_USERNAME;
    const idir_password = process.env.IDIR_PASSWORD;

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

    // --- START SUBMISSION ---
    await page.goto('http://localhost/bcrhp/submissions/');
    await page
        .getByRole('link', { name: 'Submit a new Heritage Property' })
        .click();

    // --- LOCATION ---
    await page.getByRole('button', { name: 'Next' }).first().click();
    await page.locator('#street_address').click();
    await page.locator('#street_address').fill('street address');
    await page.getByRole('textbox', { name: 'City' }).click();
    await page.getByRole('textbox', { name: 'City' }).fill('city');
    await page.getByRole('textbox', { name: 'Postal Code' }).click();
    await page.getByRole('textbox', { name: 'Postal Code' }).fill('T5T5T5');
    await page.getByRole('textbox', { name: 'Locality' }).click();
    await page.getByRole('textbox', { name: 'Locality' }).fill('locality');
    await page.locator('.ql-editor').first().click();
    await page.locator('.ql-editor').first().fill('location description');
    await page.getByRole('button', { name: '+ Add Address' }).click();
    await page.getByRole('button', { name: '+ Add Legal Description' }).click();
    await page.getByRole('spinbutton', { name: 'Enter number' }).click();
    await page
        .getByRole('spinbutton', { name: 'Enter number' })
        .fill('123456789');
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: 'Next' }).first().click();

    // --- SPATIAL UPLOAD ---
    await page.setInputFiles(
        'input[type="file"]',
        'tests/playwright/test/area.shp',
    );
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: 'Next' }).first().click();

    // --- NAMES ---
    await page.locator('form[name="commonNameForm"] #name').click();
    await page.locator('form[name="commonNameForm"] #name').fill('common name');
    await page.locator('form[name="otherNameForm"] #name').click();
    await page.locator('form[name="otherNameForm"] #name').fill('other names');
    await page.getByRole('button', { name: '+ Add' }).click();
    await page.getByRole('button', { name: 'Next' }).nth(1).click();

    // --- PROTECTION ---
    await page.locator('#designation_or_protection_start_date').click();
    await page.getByText('27', { exact: true }).click();
    await page.locator('#legislative_act').click();
    await page.getByText('Municipal, Community Charter').click();
    await page.getByRole('textbox', { name: 'E.g. Bylaw' }).click();
    await page.getByRole('textbox', { name: 'E.g. Bylaw' }).fill('bylaw 123');
    await page.getByRole('button', { name: '+ Add Protection Event' }).click();
    await page.getByRole('button', { name: 'Next' }).first().click();

    // --- DESCRIPTION ---
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
    await page.getByRole('textbox', { name: 'Enter text' }).click();
    await page
        .getByRole('textbox', { name: 'Enter text' })
        .fill('document location');
    await page.getByRole('button', { name: 'Next' }).first().click();

    // --- IMAGE UPLOAD 1 ---
    await page.setInputFiles(
        'input[type="file"]',
        'tests/playwright/test/house.jpg',
    );
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

    // --- IMAGE UPLOAD 2 ---
    await page.setInputFiles(
        'input[type="file"]',
        'tests/playwright/test/house.jpg',
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

    // --- HERITAGE CLASSES ---
    await page.getByRole('spinbutton', { name: 'Enter number' }).click();
    await page
        .getByRole('radio', { name: 'Archaeological Site / Remains' })
        .check();
    await page.getByRole('radio', { name: 'Not-for-profit' }).check();
    await page.getByRole('button', { name: '+ Add Heritage Class' }).click();
    await page
        .locator('#functional_category')
        .getByText('Select an option')
        .click();
    await page
        .getByLabel('Commerce / Commercial Services')
        .getByRole('button')
        .filter({ hasText: /^$/ })
        .click();
    await page.getByText('Bank or Stock Exchange').click();
    await page.locator('#functional_state').getByRole('button').click();
    await page.getByText('Current').click();
    await page.getByRole('button', { name: '+ Add Function' }).click();
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

    // --- CHRONOLOGY ---
    await page
        .getByRole('region', { name: 'Chronology' })
        .getByRole('button')
        .click();
    await page
        .locator('div')
        .filter({ hasText: /^Construction$/ })
        .click();
    await page.getByRole('combobox', { name: 'Start Year' }).click();
    await page
        .getByLabel('Choose Date')
        .getByText('1', { exact: true })
        .click();
    await page.getByRole('combobox', { name: 'End Year' }).click();
    // await page
    //     .getByRole('textbox', { name: 'Chronology Notes (Optional)' })
    //     .click();
    // await page
    //     .getByRole('textbox', { name: 'Chronology Notes (Optional)' })
    //     .fill('chonology notes');
    await page.getByRole('button', { name: '+ Add Chronology' }).click();
    await page.locator('#construction_actor').click();
    await page.locator('#construction_actor').fill('bob');
    await page.getByText('Select the type').click();
    await page
        .locator('div')
        .filter({ hasText: /^Builder$/ })
        .click();
    await page.locator('#construction_actor_notes').click();
    await page.locator('#construction_actor_notes').fill('notes');
    await page.getByRole('button', { name: '+ Add Architect/Builder' }).click();
    await page.getByRole('button', { name: 'Next' }).first().click();

    // --- DOCUMENT UPLOAD ---
    await page.setInputFiles(
        'input[type="file"]',
        'tests/playwright/test/test_doc.pdf',
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
    // const addButton = page.getByRole('button', { name: '+ Add' });
    // await addButton.click();
    await page.getByRole('button', { name: 'Next' }).first().click();

    await page.pause();
});
