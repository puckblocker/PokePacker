
import { test, expect } from '@playwright/test';

test('Buyer can browse active listings', async ({ page }) => {

  await page.goto('http://localhost:5173/visitor/login');

  await page.getByLabel(/username/i).fill('YOUR_BUYER_USERNAME');
  await page.getByLabel(/password/i).fill('YOUR_BUYER_PASSWORD');

  await page.getByRole('button', { name: /login/i }).click();

  await page.goto('http://localhost:5173/buyer/home');

  await expect(page.getByRole('heading', { name: 'Marketplace' }).first()).toBeVisible();

  await expect(page.getByRole('table')).toBeVisible();
});

test('Buyer sees message when no active listings are available', async ({ page }) => {

  await page.goto('http://localhost:5173/visitor/login');

  await page.getByLabel(/username/i).fill('YOUR_BUYER_USERNAME');
  await page.getByLabel(/password/i).fill('YOUR_BUYER_PASSWORD');

  await page.getByRole('button', { name: /login/i }).click();

  await page.goto('http://localhost:5173/buyer/home');

  await expect(
    page.getByText('No active listings currently available.')
  ).toBeVisible();
});
