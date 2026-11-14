import { test, expect } from '@playwright/test';

async function loginAsBuyer(page) {
  await page.goto('/visitor/login');
  await page.locator('input[type="text"]').fill('buyer');
  await page.locator('input[type="password"]').fill('buyer');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/buyer\/home/);
}

test('Buyer can view items in their cart', async ({ page }) => {
  await loginAsBuyer(page);

  const firstListing = page.locator('table tbody tr').first();
  const listingName = await firstListing.locator('td').first().innerText();

  await firstListing.getByRole('button', { name: 'Add to Cart' }).click();

  await page.getByRole('button', { name: 'See My Cart' }).click();

  await expect(page).toHaveURL(/\/buyer\/cart/);
  await expect(page.getByRole('heading', { name: 'My Cart' })).toBeVisible();
  await expect(page.locator('table tbody tr').first()).toBeVisible();
});


test('Buyer can increase item quantity in cart', async ({ page }) => {
  await loginAsBuyer(page);

  await page.getByRole('button', { name: 'See My Cart' }).click();

  const cartItems = page.locator('table tbody tr');
  await expect(cartItems.first()).toBeVisible();

  const plusButton = page.locator('table tbody tr button')
    .filter({ hasText: '+' });

  const enabledButtons = page.locator('table tbody tr button:not(:disabled)')
    .filter({ hasText: '+' });

  await expect(enabledButtons.first()).toBeVisible();

  const button = enabledButtons.first();
  const cartItem = button.locator('xpath=ancestor::tr');

  const quantity = cartItem.locator('td:nth-child(3) span');
  const startingQuantity = Number(await quantity.innerText());

  await button.click();

  await expect.poll(async () => {
    return Number(await quantity.innerText());
  }).toBe(startingQuantity + 1);
});

test('Buyer can decrease item quantity in cart', async ({ page }) => {
  await loginAsBuyer(page);

  const addToCartButton = page.getByRole('button', {
    name: 'Add to Cart'
  }).first();

  await expect(addToCartButton).toBeEnabled();
  await addToCartButton.click();

  await page.getByRole('button', { name: 'See My Cart' }).click();

  const cartItem = page.locator('table tbody tr').first();
  await expect(cartItem).toBeVisible();

  const minusButton = cartItem.locator('button:not(:disabled)')
    .filter({ hasText: '-' });

  const quantity = cartItem.locator('td:nth-child(3) span');
  const startingQuantity = Number(await quantity.innerText());

  await minusButton.click();

  await expect.poll(async () => {
    return Number(await quantity.innerText());
  }).toBe(startingQuantity - 1);
});

test('Buyer can remove an item from cart', async ({ page }) => {
  await loginAsBuyer(page);

  await page.getByRole('button', { name: 'See My Cart' }).click();

  const cartItem = page.locator('table tbody tr').first();
  await expect(cartItem).toBeVisible();

  await cartItem.getByRole('button', { name: 'Remove' }).click();

  await expect(page.locator('table tbody tr')).toHaveCount(0);
});


test('Buyer can checkout and empty their cart', async ({ page }) => {
  await loginAsBuyer(page);

  const addToCartButton = page.getByRole('button', {
    name: 'Add to Cart'
  }).first();

  await expect(addToCartButton).toBeEnabled();
  await addToCartButton.click();

  await page.getByRole('button', { name: 'See My Cart' }).click();

  await expect(page.locator('table tbody tr').first()).toBeVisible();

  await page.getByRole('button', { name: 'Proceed To Checkout' }).click();

  await page.getByRole('button', { name: 'Checkout', exact: true }).click();

  await expect(page.getByText('Your cart is empty.')).toBeVisible();
});
