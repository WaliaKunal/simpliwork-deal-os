import { test, expect } from '@playwright/test';

const BASE = 'https://studio--studio-4203271579-182b5.us-central1.hosted.app';

test.describe('Live smoke checks', () => {
  test('homepage loads and shows app branding', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('body')).toContainText('Simpliwork');
  });

  test('homepage shows Google sign-in button', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.getByRole('button', { name: /sign in with google/i })).toBeVisible();
  });

  test('management route loads or redirects cleanly', async ({ page }) => {
    const response = await page.goto(`${BASE}/management`);
    expect(response).not.toBeNull();
    expect([200, 302, 307, 308]).toContain(response!.status());
  });

  test('admin import route loads or redirects cleanly', async ({ page }) => {
    const response = await page.goto(`${BASE}/admin/import`);
    expect(response).not.toBeNull();
    expect([200, 302, 307, 308]).toContain(response!.status());
  });

  test('published URL does not return a 404 page shell', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('body')).not.toContainText('404: This page could not be found.');
  });
});
