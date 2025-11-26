import { test, expect } from '@playwright/test';

test('full user runthrough: start, evaluate, submit', async ({ page }) => {
	// Go to home page
	await page.goto('/');
	await page.waitForLoadState('networkidle');

	// Start a new session
	await expect(page.getByRole('button', { name: /start new session/i })).toBeVisible();
	await page.getByRole('button', { name: /start new session/i }).click();

	// Click through welcome popup (next, next, start session)
	await page.getByRole('button', { name: /next/i }).click();
	await page.getByRole('button', { name: /next/i }).click();
	await page.getByRole('button', { name: /start your first session/i }).click();

	// Wait for session to run for 2 seconds
	await page.waitForTimeout(2000);

	// End session by clicking the timer button
	await expect(page.getByText('Click to End')).toBeVisible();
	await page.getByText('Click to End').click();

	// Should be redirected to evaluation page
	await page.waitForLoadState('networkidle');
	await expect(page.getByRole('heading', { name: /session evaluation/i })).toBeVisible();

	// Add a custom question
	await page.fill('input[placeholder="Enter your custom question..."]', 'How did you feel?');
	await page.getByRole('button', { name: /add custom question/i }).click();

	// Answer the question
	await page.fill('input[placeholder="Your answer..."]', 'Great!');

	// Submit evaluation
	await page.getByRole('button', { name: /complete evaluation/i }).click();

	// Wait for post-test questionnaire popup
	await page.waitForSelector('text=User Study Feedback', { timeout: 5000 });
	await expect(page.locator('text=User Study Feedback')).toBeVisible();

	// Click to view results & analytics
	await page.getByRole('button', { name: /view results & analytics/i }).click();
	await page.waitForTimeout(2000);
	// Should see results page (any content)
	const content = await page.content();
	expect(content.length).toBeGreaterThan(0);
});
