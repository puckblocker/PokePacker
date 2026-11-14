
import { test, expect } from '@playwright/test';

test('Visitor can create an account', async ({ page }) => {
  const username = `pw${Date.now().toString().slice(-8)}`;

  await page.goto('/visitor/register');

  await page.locator('input[type="text"]').fill(username);
  await page.locator('input[type="email"]').fill(`${username}@test.com`);
  await page.locator('input[type="password"]').fill('testpassword123');

  const responsePromise = page.waitForResponse(response =>
    response.url().includes('/api/createUser') &&
    response.request().method() === 'POST'
  );

  await page.getByRole('button', { name: 'Create Account' }).click();

  const response = await responsePromise;

  expect(response.status()).toBe(201);

  const data = await response.json();
  expect(data.message).toBe('User created');
});


test('Registration rejects an existing username', async ({ page }) => {
  await page.goto('/visitor/register');

  await page.locator('input[type="text"]').fill('buyer');
  await page.locator('input[type="email"]').fill(`duplicate${Date.now()}@test.com`);
  await page.locator('input[type="password"]').fill('testpassword123');

  const responsePromise = page.waitForResponse(response =>
    response.url().includes('/api/createUser') &&
    response.request().method() === 'POST'
  );

  await page.getByRole('button', { name: 'Create Account' }).click();

  const response = await responsePromise;

  expect(response.status()).toBe(409);

  const data = await response.json();
  expect(data.message).toBe('Username already in use.');
});