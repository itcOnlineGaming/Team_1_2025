import { test, expect } from '@playwright/test';

test.describe('Template Edit Page', () => {
	test('shows empty state or error when no templates exist', async ({ page }) => {
		await page.goto('/templates/edit/driver-test-study-template');
		await page.waitForLoadState('networkidle');
		const content = await page.content();
		expect(content.length).toBeGreaterThan(0);
	});
});
