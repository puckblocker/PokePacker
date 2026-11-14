
import { test, expect } from '@playwright/test';

async function createPendingAccount(page, username) {
  const response = await page.request.post(
    'http://localhost:5000/api/createUser',
    {
      data: {
        userName: username,
        email: `${username}@test.com`,
        password: 'testpassword123'
      }
    }
  );

  expect(response.status()).toBe(201);
}

test('Admin can approve a pending account', async ({ page }) => {
  const username = `approve${Date.now().toString().slice(-8)}`;

  await createPendingAccount(page, username);

  await page.goto('/visitor/login');

  await page.locator('input[type="text"]').fill('admin');
  await page.locator('input[type="password"]').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/\/admin\/home/);

  const userRow = page.locator('tr').filter({ hasText: username });
  await expect(userRow).toBeVisible();

  await userRow.getByRole('button', { name: 'Approve' }).click();

  await expect(userRow).not.toBeVisible();
});

test('Admin can reject a pending account', async ({ page }) => {
  const username = `reject${Date.now().toString().slice(-8)}`;

  await createPendingAccount(page, username);

  await page.goto('/visitor/login');

  await page.locator('input[type="text"]').fill('admin');
  await page.locator('input[type="password"]').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/\/admin\/home/);

  const userRow = page.locator('tr').filter({ hasText: username });
  await expect(userRow).toBeVisible();

  await userRow.getByRole('button', { name: 'Reject' }).click();

  await page.getByPlaceholder('Enter reason').fill('Test rejection reason');
  await page.getByRole('button', { name: 'Confirm Rejection' }).click();

  await expect(userRow).not.toBeVisible();
});
