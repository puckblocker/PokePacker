
import { test, expect } from '@playwright/test';

async function loginAsBuyer(page) {
  await page.goto('/visitor/login');

  await page.locator('input[type="text"]').fill('buyer');
  await page.locator('input[type="password"]').fill('buyer');

  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/buyer\/home/);
}

test('Buyer can increase listing quantity', async ({ page }) => {
  await loginAsBuyer(page);

  const listing = page.locator('tbody tr').first();
  const quantity = listing.locator('td').nth(3);
  const increaseButton = listing.getByRole('button', { name: '+' });

  const initialQuantity = Number(await quantity.locator('span').innerText());

  await increaseButton.click();

  await expect(quantity.locator('span')).toHaveText(
    String(initialQuantity + 1)
  );
});

test('Buyer can decrease listing quantity', async ({ page }) => {
  await loginAsBuyer(page);

  const listing = page.locator('tbody tr').first();
  const quantity = listing.locator('td').nth(3);
  const increaseButton = listing.getByRole('button', { name: '+' });
  const decreaseButton = listing.getByRole('button', { name: '-' });

  await increaseButton.click();

  const currentQuantity = Number(await quantity.locator('span').innerText());

  await decreaseButton.click();

  await expect(quantity.locator('span')).toHaveText(
    String(currentQuantity - 1)
  );
});

test('Buyer cannot decrease quantity below one', async ({ page }) => {
  await loginAsBuyer(page);

  const listing = page.locator('tbody tr').first();
  const quantity = listing.locator('td').nth(3);
  const decreaseButton = listing.getByRole('button', { name: '-' });

  await expect(quantity.locator('span')).toHaveText('1');
  await expect(decreaseButton).toBeDisabled();
});

test('Buyer cannot increase quantity beyond available stock', async ({ page }) => {
  await loginAsBuyer(page);

  const listing = page.locator('tbody tr').first();
  const available = Number(await listing.locator('td').nth(2).innerText());
  const quantity = listing.locator('td').nth(3);
  const increaseButton = listing.getByRole('button', { name: '+' });

  for (let i = 1; i < available; i++) {
    await increaseButton.click();
  }

  await expect(quantity.locator('span')).toHaveText(String(available));
  await expect(increaseButton).toBeDisabled();
});

test('Buyer can add listing with selected quantity to cart', async ({ page }) => {
  await loginAsBuyer(page);

  const listing = page.locator('tbody tr').first();
  const listingName = await listing.locator('strong').innerText();
  const listingId = await listing.getAttribute('data-listing-id');

  if (!listingId) {
    const response = await page.request.get(
      'http://localhost:5000/api/cart',
      {
        headers: {
          Authorization: `Bearer ${await page.evaluate(() =>
            localStorage.getItem('packer_token')
          )}`
        }
      }
    );

    const cartItems = await response.json();

    const existingItem = cartItems.find(
      item => item.listing_name === listingName
    );

    if (existingItem) {
      await page.request.delete(
        `http://localhost:5000/api/cart/${existingItem.listing_id}`,
        {
          headers: {
            Authorization: `Bearer ${await page.evaluate(() =>
              localStorage.getItem('packer_token')
            )}`
          }
        }
      );
    }
  }

  const quantity = listing.locator('td').nth(3);
  const increaseButton = listing.getByRole('button', { name: '+' });

  const available = Number(await listing.locator('td').nth(2).innerText());

  test.skip(available < 2, 'Listing does not have enough stock');

  await increaseButton.click();

  const selectedQuantity = await quantity.locator('span').innerText();

  await listing.getByRole('button', { name: 'Add to Cart' }).click();

  await page.getByRole('link', { name: 'See My Cart' }).click();

  const cartItem = page.locator('tbody tr').filter({
    hasText: listingName
  });

  await expect(cartItem).toBeVisible();
  await expect(cartItem.locator('td').nth(2)).toContainText(selectedQuantity);
});