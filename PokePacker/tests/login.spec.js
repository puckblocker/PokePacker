import { test, expect } from '@playwright/test';

test('Buyer can log in successfully', async ({ page }) => {
page.on('console', message => {
    if (message.type() === 'error') {
     console.log('BROWSER ERROR:', message.text());
   }
  });

  page.on('pageerror', error => {
   console.log('PAGE ERROR:', error.message);
  });

  await page.goto('/visitor/login');

  await page.locator('input[type="text"]').fill('buyer');
  await page.locator('input[type="password"]').fill('buyer');

  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/\/buyer\/home/);
});


test('Invalid login shows an error', async ({ page }) => {
  await page.goto('/visitor/login');

  await page.locator('input[type="text"]').fill('wronguser');
  await page.locator('input[type="password"]').fill('wrongpassword');

  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.locator('p')).toContainText('Invalid Login');
  await expect(page).toHaveURL(/\/visitor\/login/);
});

test('Pending account cannot log in', async ({ page }) => {
   await page.goto('/visitor/login');

   await page.locator('input[type="text"]').fill('playwrightuser');
   await page.locator('input[type="password"]').fill('testpassword123');

  await page.getByRole('button', { name: 'Login' }).click();

   await expect(page).toHaveURL(/\/visitor\/login/);
});