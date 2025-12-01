import { test, expect } from '@playwright/test';

test.describe('Tasks / Create flow', () => {
    test('can create a new task from the tasks page', async ({ page }) => {
        // Start from home page to initialize the app
        await page.goto('/Team_1/');
        await page.waitForLoadState('networkidle');
        
        // Navigate to tasks page
        await page.goto('/Team_1/tasks');
        await page.waitForLoadState('networkidle');

        // Wait for the loading state to finish and the create button to appear
        await page.waitForSelector('button:has-text("+ Create New Task")', { timeout: 10000 });

        // Open the create modal
        await page.getByRole('button', { name: /\+ Create New Task/i }).click();

        // Fill out the form
        const name = 'Test Task One';
        const nameInput = page.getByRole('textbox', { name: 'Name' });
        await expect(nameInput).toBeVisible();
        await nameInput.fill(name);
        await page.getByLabel('Goal').fill('Study 30 min');

        // Submit
        await page.getByRole('button', { name: /Create task/i }).click();

        // Task should be created and visible in the task list
        await page.waitForTimeout(500);
        await expect(page.getByText(name)).toBeVisible();
    });
});
