/* Magic Patterns Settings UI replacement — targeted browser regression.
 * Generic Settings routes use source-faithful UI-only drafts in Phase 1.
 * Specialized pages retain prior tests until their own source port.
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
    // Phase 1: copy the ORIGINAL Magic GeneralSettingsSection for every generic route.
    // These are deliberately UI-local drafts, not production writes.
    await select('business');
    const businessSource = page.locator('[data-settings-magic-general="business"]');
    await businessSource.waitFor();
    await page.getByLabel('Business name', { exact: true }).fill('Magic UI only shop');
    await page.getByLabel('Business mobile', { exact: true }).waitFor();
    await page.getByLabel('Business address', { exact: true }).waitFor();
    await page.getByRole('combobox', { name: 'Currency' }).waitFor();
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await businessSource.getByText(/Saving to the business will be connected/).first().waitFor();
    await page.reload();
    await businessSource.waitFor();
    assert.notEqual(await page.getByLabel('Business name', { exact: true }).inputValue(), 'Magic UI only shop', 'Phase 1 does not pretend to persist business data');
    await page.getByLabel('Business name', { exact: true }).fill('Unsaved preview change');
    await select('sales');
    const leave = page.getByRole('dialog', { name: 'Leave without saving?' });
    await leave.waitFor();
    await leave.getByRole('button', { name: 'Keep editing' }).click();
    assert.equal(await page.getByLabel('Business name', { exact: true }).inputValue(), 'Unsaved preview change');
    await select('sales');
    await leave.getByRole('button', { name: 'Discard preview and continue' }).click();
    await page.waitForURL(/\/app\/settings\/sales/);
    const salesSource = page.locator('[data-settings-magic-general="sales"]');
    await salesSource.waitFor();
    await page.getByRole('checkbox', { name: /Open print after each sale/ }).waitFor();
    await page.getByRole('combobox', { name: 'Default payment method' }).click();
    await page.getByRole('option', { name: 'bKash', exact: true }).click();
    await salesSource.getByRole('checkbox', { name: 'Show advanced options' }).check();
    await page.getByRole('checkbox', { name: /Allow selling when stock is zero/ }).check();
    await page.getByRole('checkbox', { name: /Let staff change the price at checkout/ }).waitFor();
    await page.getByRole('spinbutton', { name: 'Biggest discount staff can give (%)' }).fill('10');
    await page.getByRole('spinbutton', { name: 'Accept returns within (days)' }).waitFor();
    await page.getByRole('button', { name: 'Discard' }).click();
    assert.equal(await page.getByRole('combobox', { name: 'Default payment method' }).getAttribute('data-value'), 'Cash', 'UI discard restores draft without tenant write');
    const genericPages = [
      ['financialTerminology', 'names', /What you call money owed/],
      ['products', 'products', /Warn me when stock drops to/],
      ['purchases', 'purchases', /Ask for supplier receipt photo/],
      ['money', 'finance', /Cash goes to/],
      ['notifications', 'notifications', /Send SMS to customers/],
      ['personal', 'personal', /Interface language/],
      ['security', 'security', /Lock the screen when idle/],
    ];
    for (const [route, id, label] of genericPages) {
      await go(route);
      await page.locator('[data-settings-magic-general="' + id + '"]').waitFor();
      await page.getByText(label).first().waitFor();
      if (id === 'names') {
        const khata = page.locator('[aria-label="Khata preview"]');
        await khata.waitFor();
        await page.getByRole('combobox', { name: 'What you call money owed' }).click();
        await page.getByRole('option', { name: 'Due', exact: true }).click();
        await khata.getByText(/Total due/i).waitFor();
      }
    }
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
    console.log('Magic Patterns Settings: source fields across nine routes, honest preview-only saving, dirty-form navigation, setup, specialized pages and five viewports passed.');
  } finally {
    await browser?.close();
    server.httpServer?.closeAllConnections();
    await server.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
