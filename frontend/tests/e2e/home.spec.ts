import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
	test('shows main content and empty state', async ({ page }) => {
		await page.goto('/Team_1/');
		await page.waitForLoadState('networkidle');
		await expect(page.getByText(/Activity Tracker/i)).toBeVisible();
		await expect(
			page.getByRole('button', { name: /Create Your First Task/i })
		).toBeVisible();
	});
});
