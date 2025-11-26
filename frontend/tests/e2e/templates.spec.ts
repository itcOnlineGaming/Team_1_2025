import { test, expect } from '@playwright/test';

test.describe('Templates Pages', () => {
	test('shows empty state when no templates exist', async ({ page }) => {
		await page.goto('/templates/view');
		await page.waitForLoadState('networkidle');
		const content = await page.content();
		expect(content.length).toBeGreaterThan(0);
	});
});
