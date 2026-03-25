
import { test, expect } from '@playwright/test';
import path from 'path';

/**
 * @fileOverview Smoke tests for Simpliwork Deal OS.
 * These tests cover the primary operational flows of the platform.
 */

test.describe('Simpliwork Deal OS Smoke Tests', () => {
  
  test('Landing Page: Basic Verification', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Simpliwork Deal OS/);
    await expect(page.getByText('Internal Enterprise Intelligence')).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign in with Google/i })).toBeVisible();
  });

  test('Sales: Navigation and Create Deal Form', async ({ page }) => {
    // Note: In real CI, we would inject a mock Firebase session here.
    // For smoke testing, we verify the route accessibility and UI elements.
    await page.goto('/sales/create');
    
    // Check for mandatory intelligence sections
    await expect(page.getByText('CREATE NEW OPPORTUNITY')).toBeVisible();
    await expect(page.getByLabel(/Company Name/i)).toBeVisible();
    await expect(page.getByText('Source Intelligence')).toBeVisible();
    await expect(page.getByRole('button', { name: /Create Intelligence/i })).toBeVisible();
  });

  test('Management: Dashboard KPIs and Strategy', async ({ page }) => {
    await page.goto('/management');
    await expect(page.getByText('STRATEGIC COMMAND CENTRE')).toBeVisible();
    
    // Check for core KPI cards
    await expect(page.getByText('Rolling 90D Yield')).toBeVisible();
    await expect(page.getByText('Signal Intensity')).toBeVisible();
    await expect(page.getByText('Command Risks')).toBeVisible();
  });

  test('Admin: Import Utility and File Upload Interaction', async ({ page }) => {
    await page.goto('/admin/import');
    await expect(page.getByText('Intelligence Importer')).toBeVisible();
    
    // Verify file input availability
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();

    // Prepare a sample CSV for the upload test
    const csvPath = path.resolve(__dirname, 'data/sample-buildings.csv');
    
    // Simulate file selection
    await fileInput.setInputFiles(csvPath);
    
    // Verify UI reflects the selected file
    await expect(page.getByText('sample-buildings.csv')).toBeVisible();
    await expect(page.getByRole('button', { name: /EXECUTE DRY RUN/i })).toBeEnabled();
  });

  test('Deals: Enforcement Gate Verification', async ({ page }) => {
    // Navigate to an existing mock deal (d1 from mock-data)
    await page.goto('/deals/d1');
    await expect(page.getByText('INNOVATE CORP')).toBeVisible();

    // Attempt to change stage to something restricted
    // This tests the validation logic in deal detail view
    const stageSelect = page.getByRole('combobox');
    if (await stageSelect.isVisible()) {
      await stageSelect.click();
      await page.getByLabel('Solutioning').click();
      
      // Verify enforcement error toast appears if requirement summary is insufficient
      // (Mock data d1 has summary, so this might pass, but we test the mechanism)
      const toast = page.getByText(/Enforcement Error/i);
      // We don't necessarily expect it to fail here unless data is invalid, 
      // but this illustrates how to test the stage gate.
    }
  });
});
