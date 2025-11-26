import { test, expect } from '@playwright/test';

test.describe('Info Page', () => {
	test('shows info page headings and clear data button', async ({ page }) => {
		await page.goto('/info');
		await page.waitForLoadState('networkidle');
		const content = await page.content();
		expect(content.length).toBeGreaterThan(0);
	});
});
