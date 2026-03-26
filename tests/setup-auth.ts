import { chromium } from '@playwright/test';

const BASE = 'https://studio--studio-4203271579-182b5.us-central1.hosted.app';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Simulate logged-in session (local storage injection)
  await page.goto(BASE);

  await page.evaluate(() => {
    localStorage.setItem('mockUser', JSON.stringify({
      email: 'kunal@simpliwork.com',
      role: 'ADMIN',
      authenticated: true
    }));
  });

  await context.storageState({ path: 'auth.json' });
  await browser.close();
})();
