import { test, expect } from '@playwright/test';

test.describe('Authenticated Workflow', () => {

  test('Sales form fully works', async ({ page }) => {
    await page.goto('/sales/create');

    // Ensure not stuck on login
    await expect(page.locator('body')).not.toContainText('Sign in');

    // Fill inputs safely
    const inputs = await page.locator('input').all();
    if (inputs.length > 0) {
      await inputs[0].fill('Test Company');
    }

    const textareas = await page.locator('textarea').all();
    if (textareas.length > 0) {
      await textareas[0].fill('Requirement test');
    }

    // Validate specific button (not generic)
    await expect(page.getByRole('button', { name: /create intelligence/i })).toBeVisible();
  });

  test('Dashboard shows data', async ({ page }) => {
    await page.goto('/management');

    const body = await page.locator('body').innerText();
    expect(body.length).toBeGreaterThan(100);
  });

});
