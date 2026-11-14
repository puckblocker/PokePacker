
import { test, expect } from '@playwright/test';

test('PokePacker homepage loads', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('client');
});
