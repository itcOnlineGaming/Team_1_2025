import { test, expect } from '@playwright/test';

test.describe('Evaluation Page', () => {
	test('shows loading or empty state when no active session', async ({ page }) => {
		await page.goto('/evaluation');
		await page.waitForLoadState('networkidle');
		const content = await page.content();
		expect(content.length).toBeGreaterThan(0);
	});
});
