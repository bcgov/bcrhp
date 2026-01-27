import { test, expect } from '@playwright/test';

test.use({
    ignoreHTTPSErrors: true,
    headless: false,
});

test('test', async ({ page }) => {
    test.setTimeout(120000);
    const idir_username = process.env.IDIR_USERNAME;
    const idir_password = process.env.IDIR_PASSWORD;

    if (!idir_username || !idir_password)
        throw new Error('Missing TEST_USER/TEST_PASSWORD env vars');

    // const context = await browser.newContext({
    //     httpCredentials: {
    //         username: idir_username,
    //         password: idir_password,
    //     },
    // });
    //
    // // Create a page in this authenticated context
    // const page = await context.newPage();

    await page.goto('http://localhost/bcrhp/');
    await page.getByRole('link', { name: 'Search Sites' }).click();
    await page.goto(
        'http://localhost/bcrhp/search?paging-filter=1&tiles=true&format=tilecsv&reportlink=false&precision=6&total=5757&exportsystemvalues=false&csrfmiddlewaretoken=SQa7L8TaTQ29VWaNdoMpmZVzI11LTw0F',
    );
    await page.getByRole('link', { name: 'Login' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('link', { name: 'IDIR' }).click();
    await page.locator('#user').click();
    await page.waitForTimeout(500);
    await page.locator('#user').fill(idir_username);
    await page.locator('#user').press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill(idir_password);
    await page.waitForTimeout(100);
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForTimeout(3000);
    await page.goto(
        'http://localhost/bcrhp/search?paging-filter=1&tiles=true&format=tilecsv&reportlink=false&precision=6&total=7276&exportsystemvalues=false&csrfmiddlewaretoken=7e2xsx5E0URtwDFi5XrRxQuE0tUbrIjL',
    );
    await page
        .getByRole('link', { name: 'Local Government Workflows' })
        .click();
    await page
        .getByRole('link', { name: 'Local Government submissions' })
        .click();
    // Bypass the above and start and uncomment the below if not authenticating
    // await page.goto('http://localhost/bcrhp/submissions/');
    await page
        .getByRole('link', { name: 'Submit a new Heritage Property' })
        .click();
    await page.getByRole('button', { name: 'Next' }).first().click();
    await page.getByRole('button', { name: 'Next' }).first().click();
    await page.setInputFiles(
        'input[type="file"]',
        '/Users/brett/Downloads/BCGov Fossils Management System_export(3)/Important Fossil Area_SHP_poly.shp',
    );
    await page.getByRole('button', { name: 'Next' }).first().click();
    // await page.getByRole('button', { name: 'Choose File' }).click();
    // await page
    //     .getByRole('button', { name: 'Choose File' })
    //     .setInputFiles('Important Fossil Area_SHP_poly.shp');
    // await page.pause();
    await page.locator('form[name="commonNameForm"] #name').click();
    await page.locator('form[name="commonNameForm"] #name').fill('Common Name');
    await page.locator('form[name="otherNameForm"] #name').click();
    await page.locator('form[name="otherNameForm"] #name').fill('Other name 1');
    await page.getByRole('button', { name: '+ Add' }).click();
    await page.locator('form[name="otherNameForm"] #name').click();
    await page.locator('form[name="otherNameForm"] #name').fill('Other name 2');
    await page.getByRole('button', { name: '+ Add' }).click();
    await page.getByRole('button', { name: 'Next' }).first().click();
    await page.locator('#designation_or_protection_start_date').click();
    await page.getByText('20', { exact: true }).click();
    await page.locator('#legislative_act').click();
    await page
        .getByText('Municipal, Local Government Act, s 611, Designation')
        .click();
    await page.getByRole('textbox', { name: 'E.g. Bylaw' }).click();
    await page.getByRole('textbox', { name: 'E.g. Bylaw' }).fill('Bylaw 12345');
    await page.getByRole('button', { name: '+ Add Protection Event' }).click();
    await page.getByRole('button', { name: 'Next' }).first().click();
    await page
        .locator(
            '#physical_description > .p-editor > .p-editor-content > .ql-editor',
        )
        .click();
    await page
        .locator(
            '#physical_description > .p-editor > .p-editor-content > .ql-editor',
        )
        .fill('Statement of Significance Description');
    // await page
    //     .locator(
    //         '#physical_description > .p-editor > .p-editor-content > .ql-editor',
    //     )
    //     .press('ControlOrMeta+Shift+ArrowLeft');
    // await page
    //     .locator('div')
    //     .filter({ hasText: /^Statement of Significance Description$/ })
    //     .nth(1)
    //     .press('ControlOrMeta+c');
    await page
        .locator('#heritage_value > .p-editor > .p-editor-content > .ql-editor')
        .click();
    await page
        .locator('#heritage_value > .p-editor > .p-editor-content > .ql-editor')
        .fill('Statement of Significance Value');
    // await page.locator('#heritage_value').getByRole('paragraph').click();
    // await page
    //     .locator('#heritage_value')
    //     .getByText('Statement of Significance')
    //     .dblclick();
    // await page
    //     .locator('div')
    //     .filter({ hasText: /^Statement of Significance Description$/ })
    //     .nth(3)
    //     .press('ArrowLeft');
    // await page
    //     .locator('div')
    //     .filter({ hasText: /^Statement of Significance Description$/ })
    //     .nth(3)
    //     .press('ArrowRight');
    // await page
    //     .locator('div')
    //     .filter({ hasText: /^Statement of Significance Description$/ })
    //     .nth(3)
    //     .press('ArrowRight');
    // await page
    //     .locator('div')
    //     .filter({ hasText: /^Statement of Significance Description$/ })
    //     .nth(3)
    //     .fill('Statement of Significance Value');
    await page
        .locator(
            '#defining_elements > .p-editor > .p-editor-content > .ql-editor',
        )
        .click();
    await page
        .locator(
            '#defining_elements > .p-editor > .p-editor-content > .ql-editor',
        )
        .fill('Statement of Significance Character-Defining Elements:');
    await page
        .locator(
            '#defining_elements > .p-editor > .p-editor-toolbar > span:nth-child(4) > button:nth-child(2)',
        )
        .click();
    await page
        .locator('div')
        .filter({
            hasText: /^Statement of Significance Character-Defining Elements:$/,
        })
        .nth(1)
        .fill(
            'Statement of Significance Character-Defining Elements:\n\nFirst point\nSecond point\nThird point',
        );
    await page.getByRole('textbox', { name: 'Enter text' }).click();
    await page
        .getByRole('textbox', { name: 'Enter text' })
        .fill('The document location');
    await page.getByRole('button', { name: 'Next' }).nth(1).click();
    // await page.getByRole('button', { name: 'Choose File' }).click();
    await page.setInputFiles(
        'div[data-node-alias="site_images"] input[type="file"]',
        '/Users/brett/Downloads/below.jpg',
    );
    // await page
    //     .getByRole('button', { name: 'Choose File' })
    //     .setInputFiles('below.jpg');
    await page.locator('#image_type').getByText('Select an option').click();
    await page
        .locator('div')
        .filter({ hasText: /^Contemporary$/ })
        .click();
    await page.locator('#image_view').getByText('Select an option').click();
    await page.locator('.p-tree-node-toggle-button').first().click();
    await page.getByText('Back view').click();
    await page
        .locator(
            '#image_description > .p-editor > .p-editor-content > .ql-editor',
        )
        .click();
    await page
        .locator(
            '#image_description > .p-editor > .p-editor-content > .ql-editor',
        )
        .fill('Looking up at house from below');
    await page.getByRole('textbox', { name: 'E.g. Entrance' }).click();
    await page
        .getByRole('textbox', { name: 'E.g. Entrance' })
        .fill('House, landscaping, other stuff.');
    await page.getByRole('combobox', { name: 'Image Date' }).click();
    await page.getByRole('textbox', { name: 'Photographer' }).click();
    await page.getByRole('textbox', { name: 'Photographer' }).click();
    await page
        .getByRole('textbox', { name: 'Photographer' })
        .fill('Ferguson, Brett');
    await page.getByRole('textbox', { name: 'Copyright' }).click();
    await page.getByRole('textbox', { name: 'Copyright' }).fill('Ferginzeys');
    await page.getByRole('button', { name: ' Save' }).click();
    // await page
    //     .getByRole('button', { name: 'Upload Files Drag & drop' })
    //     .click();
    // await page
    //     .getByRole('button', { name: 'Upload Files Drag & drop' })
    //     .setInputFiles('east_side.JPG');
    await page.setInputFiles(
        'div[data-node-alias="site_images"] input[type="file"]',
        '/Users/brett/Downloads/east_side.JPG',
    );
    await page.locator('#image_type').getByText('Select an option').click();
    await page
        .locator('div')
        .filter({ hasText: /^Historical$/ })
        .click();
    await page.locator('#image_view').getByText('Select an option').click();
    await page.locator('.p-tree-node-toggle-button').first().click();
    await page
        .locator('div')
        .filter({ hasText: /^Front view$/ })
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
        .fill('View of entrance from above.');
    await page.getByRole('textbox', { name: 'E.g. Entrance' }).click();
    await page.getByRole('textbox', { name: 'E.g. Entrance' }).fill('Entrance');
    await page.getByRole('textbox', { name: 'Photographer' }).click();
    await page.getByRole('textbox', { name: 'Photographer' }).fill('Linzey, J');
    await page.getByRole('button', { name: ' Save' }).click();
    await page.getByRole('button', { name: 'Next' }).nth(1).click();

    await page.getByRole('spinbutton', { name: 'Enter number' }).fill('1');
    await page.getByRole('radio', { name: 'Building' }).check();
    await page
        .locator('div')
        .filter({ hasText: /^Private$/ })
        .click();
    await page.getByRole('button', { name: '+ Add Heritage Class' }).click();
    await page.getByRole('spinbutton', { name: 'Enter number' }).fill('2');
    await page
        .getByRole('radio', { name: 'Landscape(s) or Landscape' })
        .check();
    await page
        .locator('div')
        .filter({ hasText: /^Private$/ })
        .click();
    // await page.getByRole('radio', { name: 'Private' }).check();
    // await page
    //     .locator(
    //         'div:nth-child(3) > .p-radiobutton-group > div > .p-radiobutton > .p-radiobutton-box',
    //     )
    //     .first()
    //     .click();
    await page.getByRole('button', { name: '+ Add Heritage Class' }).click();
    await page
        .locator('#functional_category')
        .getByText('Select an option')
        .click();
    await page
        .locator(
            'li:nth-child(12) > .p-tree-node-content > .p-tree-node-toggle-button',
        )
        .click();
    await page
        .locator('div')
        .filter({ hasText: /^Single Dwelling$/ })
        .click();
    await page
        .getByLabel('Heritage Function')
        .getByText('Select an option')
        .click();
    await page
        .locator('div')
        .filter({ hasText: /^Current$/ })
        .click();
    await page.getByText('Historic', { exact: true }).click();
    await page.getByRole('button', { name: '+ Add Function' }).click();
    await page
        .locator('#functional_category')
        .getByText('Select an option')
        .click();
    await page
        .locator(
            'li:nth-child(12) > .p-tree-node-content > .p-tree-node-toggle-button',
        )
        .click();
    await page.getByText('Outbuilding').click();
    await page
        .getByLabel('Heritage Function')
        .getByText('Select an option')
        .click();
    await page.getByText('Historic', { exact: true }).click();
    await page.getByRole('button', { name: '+ Add Function' }).click();
    await page
        .getByLabel('Heritage Theme')
        .getByText('Select an option')
        .click();
    await page
        .locator(
            'li:nth-child(5) > .p-tree-node-content > .p-tree-node-toggle-button',
        )
        .click();
    await page.getByText('Settlement').click();
    await page
        .locator(
            'li:nth-child(4) > .p-tree-node-content > .p-tree-node-toggle-button',
        )
        .first()
        .click();
    await page
        .locator('li:nth-child(4) > div > .p-tree-node-toggle-button')
        .first()
        .click();
    await page
        .getByLabel('Expressing Intellectual and')
        .getByRole('button')
        .filter({ hasText: /^$/ })
        .click();
    await page.getByText('Architecture and Design').click();
    await page
        .getByLabel('Building Social and Community')
        .getByRole('button')
        .filter({ hasText: /^$/ })
        .click();
    await page.getByText('Education and Social Well-').click();
    // await page.getByText('Site ClassificationHeritage').click();
    await page.getByRole('button', { name: 'Next' }).nth(1).click();
    await page
        .getByRole('region', { name: 'Chronology' })
        .getByRole('button')
        .click();
    await page.getByText('Construction', { exact: true }).click();
    await page
        .getByRole('combobox', { name: 'Start Year' })
        .and(page.locator('#start_year'))
        .click();
    await page.getByText('2025').click();
    await page
        .getByRole('combobox', { name: 'End Year' })
        .and(page.locator('#end_year'))
        .click();
    await page.waitForTimeout(500);
    await page.getByText('2027').click();
    await page.getByRole('checkbox', { name: 'Circa' }).check();
    await page
        .getByRole('textbox', { name: 'Chronology Notes (Optional)' })
        .click();
    await page
        .getByRole('textbox', { name: 'Chronology Notes (Optional)' })
        .fill('Should be 2016, widget is broken');
    await page.getByRole('button', { name: '+ Add Chronology' }).click();
    await page
        .getByLabel('Chronology', { exact: true })
        .getByText('Select an option')
        .click();
    await page
        .locator('div')
        .filter({ hasText: /^Significant$/ })
        .click();
    await page
        .getByRole('textbox', { name: 'Chronology Notes (Optional)' })
        .click();
    await page
        .getByRole('textbox', { name: 'Chronology Notes (Optional)' })
        .fill('Landscaping, interior completion');
    await page.getByRole('button', { name: '+ Add Chronology' }).click();
    await page.locator('#construction_actor').click();
    await page.locator('#construction_actor').fill('Ferguson, Brett');
    await page.getByText('Select the type').click();
    await page.getByText('Architect / Designer').click();
    await page.locator('#construction_actor_notes').click();
    await page
        .locator('#construction_actor_notes')
        .fill('Designed and built by owner');
    await page.getByRole('button', { name: '+ Add Architect/Builder' }).click();
    await page.locator('#construction_actor').click();
    await page.locator('#construction_actor').click();
    await page.locator('#construction_actor').fill('Ferguson, Brett');
    await page.getByText('Select the type').click();
    await page.getByText('Builder', { exact: true }).click();
    await page.locator('#construction_actor_notes').click();
    await page
        .locator('#construction_actor_notes')
        .fill('Built w/ help from friends.');
    await page.getByRole('button', { name: '+ Add Architect/Builder' }).click();
    await page.getByLabel('Related URLs').getByText('Select an option').click();
    await page
        .locator('div')
        .filter({ hasText: /^Federal Website$/ })
        .click();
    // await page
    //     .locator('div')
    //     .filter({ hasText: /^Federal Website$/ })
    //     .click();
    await page.getByRole('textbox', { name: 'Enter URL Label...' }).click();
    await page
        .getByRole('textbox', { name: 'Enter URL Label...' })
        .fill('My website');
    await page.getByRole('textbox', { name: 'External URL' }).click();
    await page
        .getByRole('textbox', { name: 'External URL' })
        .fill('https://qedsytems.ca');
    await page.getByRole('button', { name: '+ Add URL' }).click();
    await page.getByRole('button', { name: 'Next' }).nth(1).click();
    // await page.getByRole('button', { name: 'Choose File' }).click();
    // await page
    //     .getByRole('button', { name: 'Choose File' })
    //     .setInputFiles('Final Preparations Letter - Ladakh 24 June 2023.pdf');
    await page.setInputFiles(
        'div[data-node-alias="site_document"] input[type="file"]',
        '/Users/brett/Downloads/Final Preparations Letter - Ladakh 24 June 2023.pdf',
    );
    await page
        .locator('div')
        .filter({ hasText: /^Document$/ })
        .nth(1)
        .click();
    await page.getByRole('textbox', { name: 'Document Description' }).click();
    await page
        .getByRole('textbox', { name: 'Document Description' })
        .fill('Motorcycle prep document');
    await page.getByRole('button', { name: '+ Add' }).click();
    await page.getByRole('button', { name: 'Next' }).nth(1).click();
    await page.pause();
});
