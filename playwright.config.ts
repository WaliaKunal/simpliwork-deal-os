import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    baseURL: 'https://studio--studio-4203271579-182b5.us-central1.hosted.app',
    storageState: 'auth.json',
    headless: true,
  },
});
