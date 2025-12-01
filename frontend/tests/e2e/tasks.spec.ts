import { test, expect } from '@playwright/test';

test.describe('Tasks / Create flow', () => {
    test('can create a new task from the landing', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Open the create modal
        await page.getByRole('button', { name: /\+ Create New Task/i }).click();

        // Fill out the form
        const name = 'Test Task One';
        await expect(page.getByLabel('Name')).toBeVisible();
        await page.getByLabel('Name').fill(name);
        await page.getByLabel('Goal').fill('Study 30 min');
        await page.getByLabel('Description').fill('This is a test task created by e2e.');

        // Submit
        await page.getByRole('button', { name: /Create task/i }).click();

        // New task should be selected and visible in the details panel
        await expect(page.getByRole('heading', { name })).toBeVisible();
        await expect(page.getByText(/Study 30 min/)).toBeVisible();
    });
});
