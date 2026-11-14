
import { test, expect } from '@playwright/test';

async function loginAsBuyer(page) {
  await page.goto('/visitor/login');
  await page.locator('input[type="text"]').fill('buyer');
  await page.locator('input[type="password"]').fill('buyer');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/buyer\/home/);
}

test('Buyer can view their account page', async ({ page }) => {
  await loginAsBuyer(page);
  await page.goto('/buyer/account');

  await expect(page.getByRole('heading', { name: 'Account Management' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Change Username' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Change Password' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Purchase History' })).toBeVisible();
});

test('Buyer can change their username', async ({ page }) => {
  await loginAsBuyer(page);
  await page.goto('/buyer/account');

  await page.getByPlaceholder('Enter new username').fill('buyerTestUpdated');
  await page.getByRole('button', { name: 'Update Username' }).click();

  await expect(page.getByText('Username updated successfully!')).toBeVisible();
});

test('Buyer can change their password', async ({ page }) => {
  await loginAsBuyer(page);
  await page.goto('/buyer/account');

  await page.getByPlaceholder('Current password').fill('buyer');
  await page.getByPlaceholder('New password').fill('buyer');
  await page.getByRole('button', { name: 'Update Password' }).click();

  await expect(page.getByText('Password changed successfully!')).toBeVisible();
});


test('Buyer can view their purchase history', async ({ page }) => {
  await loginAsBuyer(page);
  await page.goto('/buyer/account');

  await page.getByRole('button', { name: 'View Purchase History' }).click();

  await expect(page.getByRole('heading', { name: 'Purchase History' })).toBeVisible();
  await expect(page.getByText('No purchase history yet.')).toBeVisible();
});

test('Buyer can request a refund', async ({ page }) => {
  await loginAsBuyer(page);
  await page.goto('/buyer/account');

  await page.getByRole('button', { name: 'View Purchase History' }).click();

  await page.getByRole('button', { name: 'Request Refund' }).first().click();

  await expect(page.locator('p').filter({ hasText: /refund/i })).toBeVisible();
});
