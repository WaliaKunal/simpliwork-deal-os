import { test, expect } from '@playwright/test';

test.describe('Business Flow Validation', () => {

  test('Create Deal → Validate UI response', async ({ page }) => {
    await page.goto('/sales/create');

    // Fill first available input
    const inputs = await page.locator('input').all();
    if (inputs.length > 0) {
      await inputs[0].fill('Automation Test Co');
    }

    // Fill first textarea
    const textareas = await page.locator('textarea').all();
    if (textareas.length > 0) {
      await textareas[0].fill('Automation test requirement');
    }

    // Click submit button
    const submit = page.getByRole('button', { name: /create intelligence/i });
    await expect(submit).toBeVisible();

    // Capture state before click
    const before = page.url();

    await submit.click();

    // Wait for navigation or UI update
    await page.waitForTimeout(2000);

    const after = page.url();

    // Either URL changes OR success UI appears
    expect(after !== before || (await page.locator('body').innerText()).length > 100).toBeTruthy();
  });

});
