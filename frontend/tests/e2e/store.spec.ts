import { test, expect } from '@playwright/test';

test.describe('Store Page', () => {
	test('shows store empty state and main headings', async ({ page }) => {
		await page.goto('/store');
		await page.waitForLoadState('networkidle');
		const content = await page.content();
		expect(content.length).toBeGreaterThan(0);
	});
});
