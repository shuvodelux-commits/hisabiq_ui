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
    // Magic Business Profile two-column form retains HisabIQ business-only settings and VAT.
    const businessCore = page.locator('[data-settings-business-core]');
    await businessCore.waitFor();
    await businessCore.getByLabel('Phone number', { exact: true }).waitFor();
    await businessCore.getByLabel('Business address', { exact: true }).waitFor();
    const currency = businessCore.getByLabel('Currency', { exact: true });
    assert.equal(await currency.inputValue(), 'BDT — Bangladesh Taka (৳)');
    assert.equal(await currency.getAttribute('readonly'), '', 'Accounting currency remains fixed to BDT');
    await page.getByLabel('Bangla business name', { exact: true }).waitFor();
    await page.getByRole('tab', { name: /Other contacts/ }).click();
    await page.getByLabel('Business email', { exact: true }).waitFor();
    await page.getByRole('tab', { name: /Logo & branding/ }).click();
    await page.locator('input[type="file"][aria-label="Business logo"]').waitFor();
    await page.getByRole('tab', { name: /Regional & currency/ }).click();
    await page.getByLabel('Accounting currency', { exact: true }).waitFor();
    await page.getByRole('tab', { name: /Tax & VAT/ }).click();
    await page.getByRole('switch', { name: 'Enable VAT configuration' }).waitFor();
    await page.getByRole('tab', { name: /General/ }).click();
    await businessCore.waitFor();
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
    await wizard.getByRole('link', { name: /Open Business type/ }).waitFor();
    await wizard.getByRole('button', { name: 'Skip for now' }).click();
    // Data page retains live tenant backup and import-preview safeguards under Magic's tabbed card.
    await go('data');
    await page.getByRole('heading', { name: /Data & backup/ }).last().waitFor();
    await page.getByRole('tab', { name: /Backup & restore/ }).click();
    await page.getByLabel('Restore settings backup', { exact: true }).waitFor();
    await page.getByRole('tab', { name: /Record exports & import preview/ }).click();
    await page.getByLabel('Product CSV preview', { exact: true }).waitFor();
    await page.getByRole('tab', { name: /Backup & restore/ }).click();
    // Magic team table is the default, while RBAC role editing and advanced directory remain reachable.
    await go('team');
    const teamTable = page.locator('[data-settings-team-table]');
    await teamTable.waitFor();
    assert.deepEqual(
      await teamTable.locator('thead th').allTextContents().then(values => values.map(text => text.trim()).filter(Boolean)),
      ['Team member', 'Role', 'Status', 'Actions'],
    );
    await page.getByRole('button', { name: 'Add team member', exact: true }).click();
    const employeeDialog = page.getByRole('dialog', { name: 'Add demo employee' });
    await employeeDialog.waitFor();
    await employeeDialog.getByRole('button', { name: 'Cancel' }).click();
    await page.getByRole('button', { name: 'Manage roles' }).click();
    await page.getByRole('heading', { name: 'Roles & permissions' }).waitFor();
    await page.getByRole('button', { name: 'Create role' }).click();
    const roleDialog = page.getByRole('dialog', { name: 'Create role' });
    await roleDialog.waitFor();
    await roleDialog.getByLabel('Role name', { exact: true }).waitFor();
    await roleDialog.getByRole('button', { name: 'Cancel' }).click();
    await page.getByRole('button', { name: 'Back to team' }).click();
    await teamTable.waitFor();
    await page.getByRole('button', { name: 'Filters & columns' }).click();
    await page.getByRole('searchbox', { name: 'Search employees' }).waitFor();
    await page.getByRole('button', { name: 'Compact list' }).click();
    await teamTable.waitFor();
    // Magic invoice design gallery and live preview use actual HisabIQ document settings.
    await go('invoices');
    const invoiceGallery = page.getByRole('radiogroup', { name: 'Invoice design' });
    await invoiceGallery.waitFor();
    assert.equal(await invoiceGallery.getByRole('radio').count(), 6, 'Six Magic design thumbnails are visible');
    assert.equal(await invoiceGallery.getByRole('radio', { name: /Modern/ }).isDisabled(), true, 'Unsupported print design cannot be selected');
    const invoiceLive = page.locator('aside [data-invoice-template]').last();
    await invoiceLive.waitFor();
    await invoiceGallery.getByRole('radio', { name: /Classic/ }).click();
    assert.equal(await invoiceLive.getAttribute('data-invoice-template'), 'Classic', 'Live preview follows template');
    const invoicePaper = page.getByRole('radiogroup', { name: 'Paper size' });
    await invoicePaper.getByRole('radio', { name: /80mm roll/ }).click();
    const invoiceLanguage = page.getByRole('radiogroup', { name: 'Document language' });
    await invoiceLanguage.getByRole('radio', { name: /সম্পূর্ণ বাংলা/ }).click();
    await page.getByRole('radiogroup', { name: 'Compare invoice design' }).getByRole('radio', { name: 'Current' }).click();
    assert.equal(await invoiceLive.getAttribute('data-invoice-template'), 'Standard', 'Current shows saved invoice template');
    await page.getByRole('radiogroup', { name: 'Compare invoice design' }).getByRole('radio', { name: 'New' }).click();
    assert.equal(await invoiceLive.getAttribute('data-invoice-template'), 'Classic', 'New shows draft invoice template');
    await page.getByRole('button', { name: 'Save changes', exact: true }).click();
    await page.getByRole('status').filter({ hasText: /Business settings saved|Changes are in memory only/ }).waitFor();
    await page.reload();
    await invoiceGallery.waitFor();
    assert.equal(await page.locator('aside [data-invoice-template]').last().getAttribute('data-invoice-template'), 'Classic', 'Invoice design persists');
    await page.getByRole('tab', { name: /Document numbering/ }).click();
    await page.getByRole('tab', { name: /Ledger & report designs/ }).click();
    await page.getByRole('tab', { name: /Invoice design/ }).click();
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
