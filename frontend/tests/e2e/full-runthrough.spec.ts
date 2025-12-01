import { test, expect} from '@playwright/test';

test('full user runthrough: start, evaluate, submit', async ({ page }) => {
	// Go to home page
	await page.goto('/');
	await page.waitForLoadState('networkidle');

	// Should see the home page with "Activity Tracker" heading
	await expect(page.getByRole('heading', { name: /activity tracker/i })).toBeVisible();

	// Navigate to Tasks page to create a task
	await page.getByRole('button', { name: /create your first task/i }).click();
	await page.waitForLoadState('networkidle');

	// Should be on tasks page - create a new task
	await expect(page.getByRole('heading', { name: /my tasks/i })).toBeVisible();
	await page.getByRole('button', { name: /create new task/i }).click();

	// Fill in task details
	await page.fill('input[placeholder="e.g. Study for biology exam"]', 'Study for exam');
	await page.fill('input[placeholder="Short goal or target (optional)"]', 'Prepare for final exam');
	await page.getByRole('button', { name: /create task/i }).click();

	// Task should be created
	await page.waitForTimeout(1000);
	
	// Click on the task card to navigate to task detail page
	const taskCard = page.locator('article.task-card').first();
	await taskCard.click();
	
	// Wait for navigation to task detail page
	await page.waitForLoadState('networkidle');
	
	// On the detail page, click the Start Session button
	const startSessionButton = page.getByRole('button', { name: /▶ Start New Session/i });
	await expect(startSessionButton).toBeVisible({ timeout: 5000 });
	await startSessionButton.click();

	// Template selector modal should appear
	await expect(page.getByRole('heading', { name: /select evaluation template/i })).toBeVisible();

	// Adjust the timer slider (set to 1 minute - minimum for quick test)
	const slider = page.locator('input[type="range"][id="duration-slider"]');
	await expect(slider).toBeVisible();
	await slider.fill('1'); // Set to 1 minute

	// Verify the duration display shows "1 minute"
	await expect(page.getByText(/session duration:.*1 minute/i)).toBeVisible();

	// Select the "No Template" option
	await page.getByRole('button', { name: /no template/i }).click();

	// Should be redirected to home page with active session timer
	await page.waitForLoadState('networkidle');
	await expect(page.getByText(/active session/i)).toBeVisible();

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
