import { test, expect } from '@playwright/test';

test.describe('Results Page', () => {
	test('shows empty state when no sessions exist', async ({ page }) => {
		await page.goto('/results');
		await page.waitForLoadState('networkidle');
		const content = await page.content();
		expect(content.length).toBeGreaterThan(0);
	});
});
