import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
	test('shows main content and empty state', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');
		await expect(page.getByText(/Session Tracker/i)).toBeVisible();
		await expect(
			page.getByText(/Start New Session|No sessions yet|Start your first session/i)
		).toBeVisible();
	});
});
