
import { test, expect } from '@playwright/test';

async function loginAsBuyer(page) {
  await page.goto('/visitor/login');
  await page.locator('input[type="text"]').fill('testbuyer');
  await page.locator('input[type="password"]').fill('buyer123');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/\/buyer\/home/);
}

async function loginAsAdmin(page) {
  await page.goto('/visitor/login');
  await page.locator('input[type="text"]').fill('testadmin');
  await page.locator('input[type="password"]').fill('admin123');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/\/admin\/home/);
}

async function createTicket(page, subject) {
  await loginAsBuyer(page);
  await page.goto('/buyer/create-ticket');

  await page.locator('input[name="subject"]').fill(subject);
  await page.locator('textarea[name="description"]').fill(
    'Playwright support ticket test.'
  );

  page.once('dialog', async dialog => {
    console.log('Ticket alert:', dialog.message());
    await dialog.accept();
  });

  const responsePromise = page.waitForResponse(
    response => response.url().includes('/api/createTicket')
  );

  await page.getByRole('button', { name: 'Create Ticket' }).click();

  const response = await responsePromise;

  console.log('Create ticket status:', response.status());
  console.log('Create ticket response:', await response.text());

  expect(response.status()).toBe(201);
}

test('Buyer can create a support ticket successfully', async ({ page }) => {
  await loginAsBuyer(page);
  await page.goto('/buyer/create-ticket');

  await page.locator('input[name="subject"]').fill('Successful Test Ticket');
  await page.locator('textarea[name="description"]').fill(
    'Testing ticket submission.'
  );

  page.once('dialog', async dialog => {
    expect(dialog.message()).toBe('Ticket created successfully!');
    await dialog.accept();
  });

  const responsePromise = page.waitForResponse(
    response => response.url().includes('/api/createTicket')
  );

  await page.getByRole('button', { name: 'Create Ticket' }).click();

  const response = await responsePromise;

  console.log('Create ticket status:', response.status());
  console.log('Create ticket response:', await response.text());

  expect(response.status()).toBe(201);
});

test('Buyer sees an error when ticket submission fails', async ({ page }) => {
  await loginAsBuyer(page);
  await page.goto('/buyer/create-ticket');

  await page.route('**/api/createTicket', route =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Failed to create ticket' })
    })
  );

  await page.locator('input[name="subject"]').fill('Failed Test Ticket');
  await page.locator('textarea[name="description"]').fill(
    'Testing failed submission.'
  );

  await page.getByRole('button', { name: 'Create Ticket' }).click();

  await expect(page.getByText('Failed to create ticket')).toBeVisible();
});

test('Admin can view submitted support tickets', async ({ page }) => {
  const subject = `Admin View Test ${Date.now()}`;

  await createTicket(page, subject);
  await loginAsAdmin(page);

  await page.getByRole('button', { name: 'View Support Tickets' }).click();

  await expect(page).toHaveURL(/\/admin\/support-tickets/);
  await expect(
    page.getByRole('heading', { name: 'Support Tickets' })
  ).toBeVisible();
  await expect(page.getByText(subject)).toBeVisible();
});

test('Admin can view active and closed support tickets', async ({ page }) => {
  const activeSubject = `Active Ticket ${Date.now()}`;
  const closedSubject = `Closed Ticket ${Date.now()}`;

  await createTicket(page, activeSubject);
  await createTicket(page, closedSubject);

  await loginAsAdmin(page);
  await page.goto('/admin/support-tickets');

  const activeRow = page.locator('tr').filter({ hasText: activeSubject });
  const closedRow = page.locator('tr').filter({ hasText: closedSubject });

  await expect(activeRow).toBeVisible();
  await expect(closedRow).toBeVisible();

  await activeRow.getByRole('button', { name: 'Close' }).click();

  await expect(activeRow).toContainText('closed');
  await expect(closedRow).toContainText('open');
});

test('Admin sees an error when support tickets cannot load', async ({ page }) => {
  await loginAsAdmin(page);

  await page.route('**/api/showTickets', route =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Server error' })
    })
  );

  await page.goto('/admin/support-tickets');

  await expect(
    page.getByText('Failed to fetch support tickets')
  ).toBeVisible();
});

test('Admin can navigate to the Support Ticket Page', async ({ page }) => {
  await loginAsAdmin(page);

  await page.getByRole('button', { name: 'View Support Tickets' }).click();

  await expect(page).toHaveURL(/\/admin\/support-tickets/);
  await expect(
    page.getByRole('heading', { name: 'Support Tickets' })
  ).toBeVisible();
});
