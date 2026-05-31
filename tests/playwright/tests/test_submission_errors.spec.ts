import path from 'path';
import * as dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
import { test, expect } from '@playwright/test';

test.use({
    ignoreHTTPSErrors: true,
    headless: false,
});

test.describe('Submission Error Scenarios', () => {
    test.beforeEach(async ({ page }) => {
        test.setTimeout(120000);

        const idir_username = process.env.IDIR_USERNAME;
        const idir_password = process.env.IDIR_PASSWORD;

        if (!idir_username || !idir_password)
            throw new Error('Missing TEST_USER/TEST_PASSWORD env vars');

        // login
        await page.goto('http://localhost/bcrhp/');
        await page.getByRole('link', { name: 'Search Sites' }).click();
        await page.getByRole('link', { name: 'Login' }).click();
        await page.getByRole('link', { name: 'IDIR' }).click();
        await page.locator('#user').fill(idir_username);
        await page.getByRole('textbox', { name: 'Password' }).click();
        await page
            .getByRole('textbox', { name: 'Password' })
            .fill(idir_password);
        await page.getByRole('button', { name: 'Continue' }).click();
        await page.waitForTimeout(1000);

        await page
            .getByRole('link', { name: 'Local Government Workflows' })
            .click();
        await page
            .getByRole('link', { name: 'Local Government submissions' })
            .click();
        await page
            .getByRole('link', { name: 'Submit a new Heritage Property' })
            .click();
        await page.goto('http://localhost/bcrhp/submissions/');
        await page
            .getByRole('link', { name: 'Submit a new Heritage Property' })
            .click();

        // start submission
        await page.getByRole('button', { name: 'Next' }).first().click();
        await page.getByRole('checkbox').check();
        await page.getByRole('button', { name: 'Next' }).first().click();
        await page.getByRole('checkbox').check();
        await page.getByRole('button', { name: 'Next' }).first().click();
        await page.locator('form[name="commonNameForm"] #name').click();
        await page.locator('form[name="commonNameForm"] #name').fill('name');
        await page.getByRole('button', { name: 'Next' }).first().click();
        await page
            .getByRole('combobox', { name: '*Designation or Recognition' })
            .click();
        await page.getByText('1', { exact: true }).nth(1).click();
        await page.locator('#legislative_act').click();
        await page.getByText('Municipal, Community Charter').click();
        await page.getByRole('textbox', { name: '*Reference Number' }).click();
        await page
            .getByRole('textbox', { name: '*Reference Number' })
            .fill('123');
        await page
            .getByRole('button', { name: '+ Add Protection Event' })
            .click();

        await page.getByRole('button', { name: 'Next' }).first().click();
        await page.getByRole('button', { name: 'Next' }).first().click();
        await page.getByRole('button', { name: 'Next' }).first().click();
        await page.getByRole('button', { name: 'Next' }).first().click();
        await page.getByRole('button', { name: 'Next' }).first().click();

        // file upload
        await page.setInputFiles(
            'div[data-node-alias="site_document"] input[type="file"]',
            path.join(__dirname, 'test_doc.pdf'),
        );
        await page
            .getByRole('radio', { name: 'Document' })
            .check({ force: true });
        await page.locator('#document_description').click();
        await page.locator('#document_description').fill('description');
        await page.locator('#document_description').press('Tab');
        const addBtn = page.getByRole('button', { name: '+ Add' });
        await expect(addBtn).toBeEnabled({ timeout: 15000 });
        await addBtn.click();
        await page.getByRole('button', { name: 'Next' }).first().click();
    });

    // Bad URL data
    test('Should show validation error for URL format', async ({ page }) => {
        await page.getByRole('button', { name: 'Previous' }).first().click();
        await page.getByRole('button', { name: 'Previous' }).first().click();
        await page.waitForTimeout(1000);

        const urlDropdown = page
            .locator('.p-treeselect')
            .filter({ has: page.locator('#external_url_type') })
            .first();
        await urlDropdown.click({ force: true });
        await page.getByText('Other Website').click();
        await page.getByRole('textbox', { name: 'Enter URL Label...' }).click();
        await page
            .getByRole('textbox', { name: 'Enter URL Label...' })
            .fill('URL label');
        await page.getByPlaceholder('Enter URL...').click();
        await page.getByPlaceholder('Enter URL...').fill('www.google.coooooom');
        await page.getByRole('button', { name: '+ Add URL' }).click();

        await page.getByRole('button', { name: 'Next' }).first().click();
        await page.getByRole('button', { name: 'Next' }).first().click();

        await page.getByRole('button', { name: 'Submit' }).first().click();
        await page.pause();
    });

    // 400 Bad Request
    test('Should handle 400 Bad Request error', async ({ page }) => {
        await page.route('**/*', async (route) => {
            if (route.request().method() === 'POST') {
                await route.fulfill({
                    status: 400,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        message:
                            'A property with this Reference Number already exists.',
                    }),
                });
            } else {
                await route.fallback();
            }
        });

        await page.getByRole('button', { name: 'Submit' }).first().click();
        await page.pause();
    });

    // 500 Internal Server Error
    test('Should handle 500 Internal Server error', async ({ page }) => {
        await page.route('**/*', async (route) => {
            if (route.request().method() === 'POST') {
                await route.fulfill({
                    status: 500,
                    body: JSON.stringify({
                        message: 'Simulated Server Error.',
                    }),
                });
            } else {
                await route.fallback();
            }
        });

        await page.getByRole('button', { name: 'Submit' }).first().click();
        await page.pause();
    });

    // Dropped Connection
    test('Should handle dropped connection', async ({ page }) => {
        await page.route('**/*', async (route) => {
            if (route.request().method() === 'POST') {
                await route.abort('internetdisconnected');
            } else {
                await route.fallback();
            }
        });

        await page.getByRole('button', { name: 'Submit' }).first().click();
        await page.pause();
    });
});
