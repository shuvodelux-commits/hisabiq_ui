/* Magic Patterns Settings module replacement — targeted browser regression.
 * Checks source nav, real tenant settings persistence, dirty draft protection
 * and all five supported viewport widths. No prototype-only backend claims.
 */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
async function main() {
  const { createServer } = await import('vite');
  const server = await createServer({
    server: { host: '127.0.0.1', port: 4292, strictPort: true },
  });
  await server.listen();
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined,
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce',
    });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const base = 'http://127.0.0.1:4292/#/app/settings';
    const go = route => page.goto(base + (route ? '/' + route : ''), { waitUntil: 'domcontentloaded' });
    const select = id => page.locator('[data-settings-directory] a[data-settings-section="' + id + '"]').click();
    await go('');
    await page.locator('[data-settings-magic-patterns="t6q3mxi6nhuak3qjvx8cwn"]').waitFor();
    await page.getByRole('heading', {name:/^Settings/}).first().waitFor();
    const navigation = page.locator('[data-settings-directory]');
    const ids = await navigation.locator('a[data-settings-section]').evaluateAll(nodes => nodes.map(n => n.dataset.settingsSection));
    assert.deepEqual(ids, [
      'business', 'names', 'sales', 'products', 'purchases', 'invoices',
      'finance', 'notifications', 'interface', 'team', 'sessions', 'activity',
      'data', 'offline', 'support', 'subscription', 'personal', 'security',
    ], 'Original Magic Patterns Settings navigation order');
    assert.equal(await page.locator('section[aria-label="Setup tasks"] li').count(), 9);
    const search = page.getByLabel('Search settings by goal', { exact: true });
    await search.fill('receipt');
    await page.locator('section[aria-label="Search settings"]').getByRole('link', {name:/Receipt design/}).first().waitFor();
    await search.fill('');
    await page.getByRole('textbox', { name: 'Search settings', exact: true }).fill('stock');
    assert.equal(await navigation.locator('a[data-settings-section]').count(), 1);
    await page.getByRole('textbox', { name: 'Search settings', exact: true }).fill('');
    await select('business');
    await page.getByTestId('settings-title').waitFor();
    await page.getByLabel('Business name', { exact: true }).fill('Magic Settings Regression Shop');
    const save = page.getByRole('button', { name: 'Save changes', exact: true });
    await save.click();
    const review = page.getByRole('dialog', { name: 'Review settings changes' });
    if (await review.isVisible()) await review.getByRole('button', { name: 'Confirm save' }).click();
    await page.getByRole('status').filter({ hasText: /Business settings saved|Changes are in memory only/ }).waitFor();
    await page.reload();
    await page.getByLabel('Business name', { exact: true }).waitFor();
    assert.equal(await page.getByLabel('Business name', { exact: true }).inputValue(), 'Magic Settings Regression Shop');
    const advanced = page.getByRole('checkbox', { name: 'Show advanced options' });
    await advanced.check();
    assert.equal(await advanced.isChecked(), true, 'Advanced controls remain accessible');
    await advanced.uncheck();
    assert.equal(await advanced.isChecked(), false);
    await page.getByLabel('Business name', { exact: true }).fill('Unsaved navigation edit');
    await select('sales');
    const discard = page.getByRole('dialog', { name: 'Discard unsaved changes?' });
    await discard.waitFor();
    await discard.getByRole('button', { name: 'Keep editing' }).click();
    assert.equal(await page.getByLabel('Business name', { exact: true }).inputValue(), 'Unsaved navigation edit');
    await select('sales');
    await discard.getByRole('button', { name: 'Discard and continue' }).click();
    await page.waitForURL(/\/app\/settings\/sales/);
    await page.getByText('Default payment method').first().waitFor();
    await go('');
    await page.getByRole('button', { name: 'Start guided setup' }).click();
    const wizard = page.getByRole('dialog', { name: 'Set up your shop' });
    await wizard.waitFor();
    assert.equal(await wizard.getByRole('link', { name: /Open Shop details/ }).count(), 1);
    await wizard.getByRole('button', { name: 'Continue' }).click();
    assert.equal(await wizard.getByRole('link', { name: /Open Business type/ }).count(), 1);
    await wizard.getByRole('button', { name: 'Skip for now' }).click();
    for (const width of [320,390,768,1024,1440]) {
      await page.setViewportSize({ width, height: 900 });
      await go('');
      await navigation.locator('a[data-settings-section]').first().waitFor();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      assert.equal(overflow, false, 'Settings home overflows at ' + width);
      await go('business');
      await page.getByLabel('Business name', { exact: true }).waitFor();
      const formOverflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      assert.equal(formOverflow, false, 'Settings form overflows at ' + width);
    }
    assert.deepEqual(errors, [], 'Browser must have no uncaught page errors');
    if (process.env.SETTINGS_SCREENSHOT_DIR) {
      fs.mkdirSync(process.env.SETTINGS_SCREENSHOT_DIR, { recursive: true });
      await page.screenshot({ path: path.join(process.env.SETTINGS_SCREENSHOT_DIR, 'settings-magic-1440.png'), fullPage: true });
    }
    console.log('Magic Patterns Settings: source nav, search, setup, tenant save, dirty-form protection, advanced controls, and 5 viewports passed.');
  } finally {
    await browser?.close();
    server.httpServer?.closeAllConnections();
    await server.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
