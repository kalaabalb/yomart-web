import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const base = 'https://yomart.onrender.com';
const browser = await chromium.launch({
  executablePath: process.env.CHROME_BIN || '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const pageErrors = [];
page.on('pageerror', (error) => pageErrors.push(error.message));

try {
  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.getByText(/Preview catalogue/i).first().waitFor({ state: 'visible', timeout: 30000 });
  await page.getByRole('link', { name: /Browse products/i }).click();
  await page.waitForURL(/\/products(?:\?.*)?$/, { timeout: 30000 });
  const firstCard = page.locator('a.product-card').first();
  await firstCard.waitFor({ state: 'visible', timeout: 30000 });
  assert.ok(await page.getByText('Price to be confirmed').count() > 0, 'catalog cards must mask sample prices');
  assert.equal(await page.getByText('In stock', { exact: true }).count(), 0, 'catalog must not show synthetic stock');

  await firstCard.click();
  await page.waitForURL(/\/products\/[^/]+$/, { timeout: 30000 });
  await page.getByText('Availability to be confirmed', { exact: true }).waitFor({ state: 'visible' });
  assert.equal(await page.locator('button.detail-cta').first().isDisabled(), true, 'preview product add-to-cart must be disabled');
  assert.ok((await page.locator('.detail-price').innerText()).includes('Price to be confirmed'));

  await page.goto(`${base}/cart`, { waitUntil: 'domcontentloaded' });
  await page.getByText(/Your cart is empty/i).waitFor({ state: 'visible', timeout: 30000 });

  await page.goto(`${base}/login`, { waitUntil: 'domcontentloaded' });
  assert.ok(await page.locator('form').count() > 0, 'customer login form must render');

  await page.goto(`${base}/support`, { waitUntil: 'domcontentloaded' });
  assert.ok(await page.locator('main').count() > 0, 'support route must render');

  await page.goto(`${base}/privacy-policy.html`, { waitUntil: 'domcontentloaded' });
  const privacyRobots = await page.locator('meta[name="robots"]').getAttribute('content');
  assert.match(privacyRobots || '', /noindex/, 'draft privacy page must remain noindex');

  await page.goto(`${base}/account-deletion.html`, { waitUntil: 'domcontentloaded' });
  assert.ok(await page.locator('#delete-form').count() === 1, 'external account deletion form must render');
  assert.ok((await page.locator('script[src="/account-deletion-config.js"]').count()) === 1);

  await page.goto('https://yomart-admin.onrender.com/', { waitUntil: 'domcontentloaded' });
  assert.ok(await page.locator('form').count() > 0, 'admin sign-in form must render');

  assert.deepEqual(pageErrors, [], 'public pages must not throw browser runtime errors');
  console.log('Live UI interaction smoke PASS: home → catalog → product detail, preview safety, cart, login, support, legal pages and admin sign-in.');
} finally {
  await browser.close();
}
