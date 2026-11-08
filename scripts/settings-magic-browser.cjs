/* Magic Patterns Settings UI replacement — targeted browser regression.
 * Generic Settings routes use source-faithful UI-only drafts in Phase 1.
 * Specialized pages use exact Magic source when their own port is complete.
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
    // Full Magic Interface & workflows source: scope, searchable modules, grouped controls, advanced and preview.
    await go('interface');
    const interfaceUI = page.locator('[data-settings-magic-interface]');
    await interfaceUI.waitFor();
    await interfaceUI.getByRole('heading', { name: /Interface & workflows/ }).waitFor();
    await interfaceUI.locator('[data-interface-preview-notice]').getByText(/UI preview/).waitFor();
    await interfaceUI.getByText(/Sample Plus plan/).first().waitFor();
    await interfaceUI.getByRole('heading', { name: /^Columns/ }).waitFor();
    await interfaceUI.getByRole('heading', { name: /^Links & actions/ }).waitFor();
    await interfaceUI.getByRole('button', { name: /More options/ }).click();
    await interfaceUI.locator('[data-capability="sales.columns.profit"]').waitFor();
    await interfaceUI.locator('[data-capability="sales.columns.paymentBreakdown"]').waitFor();
    // Source selector supports module search and changes the visible capability set.
    await interfaceUI.locator('button[aria-haspopup="listbox"]').first().click();
    await interfaceUI.getByRole('textbox', { name: 'Search modules' }).fill('Products');
    await interfaceUI.getByRole('listbox', { name: 'Modules' }).getByRole('button', { name: /Products & stock/ }).click();
    await interfaceUI.locator('[data-capability="products.columns.stockValue"]').waitFor();
    assert.equal(await interfaceUI.locator('[data-capability="sales.columns.paymentMethod"]').count(), 0);
    await interfaceUI.locator('[data-capability="products.columns.stockValue"] label[data-slot="switch"]').click();
    await interfaceUI.getByText(/nothing was saved/i).first().waitFor();
    await interfaceUI.getByRole('button', { name: 'Preview', exact: true }).click();
    const previewTabs = interfaceUI.getByRole('tablist', { name: 'Preview size' });
    await previewTabs.getByRole('tab', { name: 'Mobile' }).click();
    await interfaceUI.getByText(/Other fields open with/).waitFor();
    await previewTabs.getByRole('tab', { name: 'Desktop' }).click();
    await interfaceUI.locator('table[data-erp-table]').waitFor();
    await interfaceUI.getByText('Stock value', { exact: true }).first().waitFor();
    // Unsaved edits are guarded when switching modules.
    await interfaceUI.locator('button[aria-haspopup="listbox"]').first().click();
    await interfaceUI.getByRole('listbox', { name: 'Modules' }).getByRole('button', { name: /^Sales/ }).click();
    const moduleDiscard = page.getByRole('dialog', { name: 'Discard unsaved changes?' });
    await moduleDiscard.waitFor();
    await moduleDiscard.getByRole('button', { name: 'Keep editing' }).click();
    await interfaceUI.locator('[data-capability="products.columns.stockValue"]').waitFor();
    await interfaceUI.locator('button[aria-haspopup="listbox"]').first().click();
    await interfaceUI.getByRole('listbox', { name: 'Modules' }).getByRole('button', { name: /^Sales/ }).click();
    await moduleDiscard.getByRole('button', { name: 'Discard', exact: true }).click();
    await interfaceUI.locator('[data-capability="sales.columns.paymentMethod"]').waitFor();
    // Owner preview of Everyone scope includes source review dialog; nothing persists.
    const applyTo = interfaceUI.getByRole('combobox', { name: 'Apply to' });
    await applyTo.click();
    await page.getByRole('option', { name: /Everyone \(UI preview\)/ }).click();
    const companyPayment = interfaceUI.locator('[data-capability="sales.columns.paymentMethod"] input[type="checkbox"]');
    await companyPayment.waitFor();
    await companyPayment.click();
    await interfaceUI.getByRole('button', { name: 'Review & save' }).click();
    const defaultReview = page.getByRole('dialog', { name: 'Review business defaults (UI preview)' });
    await defaultReview.waitFor();
    await defaultReview.getByRole('button', { name: 'Continue preview (no save)' }).click();
    await interfaceUI.getByRole('alert').filter({ hasText: /NOT saved for anyone/ }).waitFor();
    await page.reload();
    await interfaceUI.waitFor();
    await interfaceUI.getByText(/UI preview/).first().waitFor();
    assert.equal(await interfaceUI.getByRole('combobox', { name: 'Apply to' }).getAttribute('data-value'), 'user', 'Source interface preview does not persist scope or settings');
    await go('');
    await page.getByRole('button', { name: 'Start guided setup' }).click();
    const wizard = page.getByRole('dialog', { name: 'Set up your shop' });
    await wizard.waitFor();
    assert.equal(await wizard.getByRole('link', { name: /Open Shop details/ }).count(), 1);
    await wizard.getByRole('button', { name: 'Continue' }).click();
    await wizard.getByRole('link', { name: /Open Business type/ }).waitFor();
    await wizard.getByRole('button', { name: 'Skip for now' }).click();
    // Exact Magic Data & backup presentation; source demo flows are local and non-destructive.
    await go('data');
    const dataUI = page.locator('[data-settings-magic-data]');
    await dataUI.waitFor();
    assert.deepEqual(
      await dataUI.getByRole('tab').allTextContents().then(values => values.map(value => value.trim())),
      ['Backup & restore', 'Reset demo'],
    );
    assert.equal(await page.getByLabel('Restore settings backup', { exact: true }).count(), 0,
      'Legacy production restore input must not appear on Phase-1 Magic route');
    assert.equal(await page.getByLabel('Product CSV preview', { exact: true }).count(), 0,
      'Legacy CSV import panels must not appear on Phase-1 Magic route');
    await dataUI.getByRole('button', { name: 'Download', exact: true }).click();
    await dataUI.getByRole('status').filter({ hasText: /No backup file was created or downloaded/ }).waitFor();
    await dataUI.getByRole('tab', { name: 'Reset demo' }).click();
    await dataUI.getByRole('button', { name: 'Reset demo' }).click();
    const resetDialog = page.getByRole('dialog', { name: 'Reset all demo data?' });
    await resetDialog.waitFor();
    await resetDialog.getByRole('button', { name: 'Cancel' }).click();
    await dataUI.getByRole('button', { name: 'Reset demo' }).click();
    await resetDialog.getByRole('button', { name: 'Reset', exact: true }).click();
    await dataUI.getByRole('status').filter({ hasText: /No demo or business data was reset/ }).waitFor();
    await dataUI.getByRole('tab', { name: 'Backup & restore' }).click();
    await dataUI.getByLabel('Choose backup file').setInputFiles({
      name: 'magic-preview-backup.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify({
        sales: [{ id: 'preview-sale' }], expenses: [{ id: 'preview-expense' }],
        vendorEntries: [], staff: [], settings: {},
      })),
    });
    const restoreDialog = page.getByRole('dialog', { name: 'Replace demo data with this backup?' });
    await restoreDialog.waitFor();
    await restoreDialog.getByText(/1 sales and 1 expenses/).waitFor();
    await restoreDialog.getByRole('button', { name: 'Replace data' }).click();
    await dataUI.getByRole('status').filter({ hasText: /No demo or business data was restored/ }).waitFor();
    await page.reload();
    await dataUI.waitFor();
    assert.equal(await page.getByRole('dialog', { name: 'Replace demo data with this backup?' }).count(), 0,
      'Backup preview must not persist across reload');
    // Original Magic SessionsPage: source summary, all columns, search, risk filters,
    // per-device controls, bulk/PIN protection and nonpersistent preview state.
    await go('sessions');
    const sessionsUI = page.locator('[data-settings-magic-sessions]');
    await sessionsUI.waitFor();
    await sessionsUI.getByText(/Sample sign-in records from 3 November 2026/).waitFor();
    const sessionTable = sessionsUI.locator('[data-settings-sessions-table]');
    assert.deepEqual(
      await sessionTable.locator('thead th').allTextContents().then(values => values.map(text => text.trim())),
      ['Person', 'Device', 'Where', 'Signed in', 'Last active', 'Action'],
    );
    await sessionsUI.locator('div.grid').first().getByText('Online now', { exact: true }).waitFor();
    await sessionsUI.getByText('Signed-in devices', { exact: true }).waitFor();
    await sessionsUI.getByText('New devices', { exact: true }).waitFor();
    await sessionsUI.getByText('Unusual sign-ins', { exact: true }).waitFor();
    await sessionsUI.getByRole('radio', { name: 'Unusual' }).click();
    await page.waitForFunction(() => document.querySelectorAll('[data-settings-sessions-table] tbody tr').length === 1);
    await sessionsUI.getByText('Showing 1 of 8 devices').waitFor();
    await sessionsUI.getByRole('radio', { name: 'All', exact: true }).click();
    await sessionsUI.getByRole('textbox', { name: 'Search devices' }).fill('Chattogram');
    await page.waitForFunction(() => document.querySelectorAll('[data-settings-sessions-table] tbody tr').length === 1);
    await sessionsUI.getByText('Showing 1 of 8 devices').waitFor();
    await sessionsUI.getByRole('button', { name: 'Clear Search devices' }).click();
    assert.equal(await sessionsUI.getByRole('textbox', { name: 'Search devices' }).inputValue(), '', 'Search is cleared without changing the active filter');
    await page.getByRole('button', { name: 'Actions for Owner phone' }).click();
    await page.getByRole('menuitem', { name: 'Sign out this device' }).click();
    const deviceDialog = page.getByRole('dialog', { name: 'Sign out this device?' });
    await deviceDialog.waitFor();
    await deviceDialog.getByRole('button', { name: 'Cancel' }).click();
    await page.getByRole('button', { name: 'Actions for Owner phone' }).click();
    await page.getByRole('menuitem', { name: 'Sign out this device' }).click();
    await deviceDialog.getByRole('button', { name: 'Sign out', exact: true }).click();
    await sessionTable.getByText('Owner phone', { exact: true }).waitFor({ state: 'detached' });
    await sessionsUI.getByRole('heading', { name: /Sign-in safety/ }).waitFor();
    await sessionsUI.getByRole('combobox', { name: 'Idle sign-out' }).click();
    await page.getByRole('option', { name: '1 hour' }).click();
    await sessionsUI.getByRole('button', { name: /Sign out everyone except me/ }).click();
    const bulkDialog = page.getByRole('dialog', { name: 'Sign out everyone except you?' });
    await bulkDialog.waitFor();
    await bulkDialog.getByRole('textbox', { name: /Owner PIN/ }).fill('123');
    await bulkDialog.getByRole('button', { name: 'Sign out everyone' }).click();
    await bulkDialog.getByText(/Enter your 6-digit PIN/).waitFor();
    await bulkDialog.getByRole('textbox', { name: /Owner PIN/ }).fill('123456');
    await bulkDialog.getByRole('button', { name: 'Sign out everyone' }).click();
    await page.waitForFunction(() => document.querySelectorAll('[data-settings-sessions-table] tbody tr').length === 1);
    await sessionsUI.getByText('Showing 1 of 1 devices').waitFor();
    await page.reload();
    await sessionsUI.waitFor();
    assert.equal(await sessionTable.locator('tbody tr').count(), 8,
      'Preview session actions reset on reload and never revoke real sessions');
    // Original Magic Staff activity: fixed preview audit, four summary cards, filters,
    // expandable before/after rows, sample-only export and non-live record links.
    await go('activity');
    const activityUI = page.locator('[data-settings-magic-activity]');
    await activityUI.waitFor();
    await activityUI.getByText(/All activity entries are synthetic examples/).waitFor();
    for (const title of ['Things done', 'Needs a look', 'Sales recorded', 'People active']) {
      await activityUI.getByText(title, { exact: true }).first().waitFor();
    }
    await activityUI.getByRole('textbox', { name: 'Search activity' }).fill('discount');
    await activityUI.getByText(/gave 15% discount/i).waitFor();
    await activityUI.getByText('Showing 1 of 18').waitFor();
    await activityUI.getByRole('button', { name: 'Clear Search activity' }).click();
    assert.equal(await activityUI.getByRole('textbox', { name: 'Search activity' }).inputValue(), '');
    await activityUI.getByRole('checkbox', { name: 'Needs a look only' }).check();
    await activityUI.locator('ol li').first().waitFor();
    const badged = await activityUI.locator('ol li').count();
    assert.ok(badged > 0 && badged < 13, 'Needs a look filters source audit examples');
    await activityUI.getByRole('checkbox', { name: 'Needs a look only' }).uncheck();
    await activityUI.getByRole('combobox', { name: 'Person' }).click();
    await page.getByRole('option', { name: /Sumi Akter/ }).click();
    await activityUI.getByText(/Sumi Akter.*sales worth/).waitFor();
    await activityUI.getByRole('combobox', { name: 'Area' }).click();
    await page.getByRole('option', { name: 'Sign-in' }).click();
    await activityUI.locator('ol li').first().waitFor();
    await activityUI.getByRole('button', { name: 'Reset', exact: true }).click();
    const discountRow = activityUI.locator('ol li').filter({ hasText: /gave 15% discount/i }).first();
    await discountRow.getByRole('button', { name: 'Show details' }).click();
    await discountRow.getByText('Before', { exact: true }).waitFor();
    await discountRow.getByText('After', { exact: true }).waitFor();
    await discountRow.getByRole('link', { name: /Open the record/ }).click();
    await activityUI.getByRole('status').filter({ hasText: /This record link is a sample/ }).waitFor();
    assert.ok(page.url().includes('/app/settings/activity'), 'Synthetic record links cannot open real ERP records');
    await activityUI.getByRole('button', { name: 'Export', exact: true }).click();
    await activityUI.getByRole('status').filter({ hasText: /Sample activity CSV downloaded/ }).waitFor();
    await activityUI.getByRole('button', { name: 'Print', exact: true }).waitFor();
    await page.reload();
    await activityUI.waitFor();
    assert.equal(await activityUI.getByRole('status').count(), 0, 'Activity preview notifications do not persist');
    // Source TeamSettings is the route itself; legacy management and directory panels are absent.
    await go('team');
    const teamUI = page.locator('[data-settings-magic-team]');
    await teamUI.waitFor();
    const teamTable = teamUI.locator('[data-settings-team-table]');
    assert.deepEqual(
      await teamTable.locator('thead th').allTextContents().then(values => values.map(text => text.trim()).filter(Boolean)),
      ['Team member', 'Role', 'Status', 'Actions'],
    );
    await teamUI.getByText(/UI preview · changes here are not saved/).waitFor();
    assert.equal(await teamUI.getByRole('button', { name: 'Manage roles' }).count(), 0, 'Legacy role editor must not render');
    assert.equal(await teamUI.getByRole('button', { name: 'Filters & columns' }).count(), 0, 'Legacy directory panel must not render');
    await teamUI.getByRole('button', { name: 'Add team member', exact: true }).click();
    const employeeDialog = page.getByRole('dialog', { name: 'Add team member' });
    await employeeDialog.waitFor();
    await employeeDialog.getByRole('textbox', { name: 'Name' }).fill('UI Preview Employee');
    await employeeDialog.getByRole('button', { name: 'Save', exact: true }).click();
    await teamTable.getByText('UI Preview Employee').waitFor();
    await teamUI.getByText(/No team member, role, login or invitation was changed/).waitFor();
    await page.reload();
    await teamUI.waitFor();
    assert.equal(await teamTable.getByText('UI Preview Employee').count(), 0, 'Team preview changes must not persist across reload');
    await teamUI.getByRole('button', { name: 'Add team member', exact: true }).click();
    await page.getByRole('dialog', { name: 'Add team member' }).getByRole('button', { name: 'Cancel' }).click();
    // Magic Invoice Studio Phase 1: source gallery, document renderer and UI-local drafts.
    await go('invoices');
    const studio = page.locator('[data-settings-magic-invoice-studio]');
    await studio.waitFor();
    const invoiceGallery = studio.getByRole('radiogroup', { name: 'Invoice design' });
    assert.equal(await invoiceGallery.getByRole('radio').count(), 6, 'All six Magic template previews render');
    await studio.getByRole('heading', { name: /Paper & language/ }).waitFor();
    await studio.getByRole('heading', { name: /Brand color/ }).waitFor();
    await studio.getByRole('heading', { name: /What to show on the invoice/ }).waitFor();
    await studio.getByRole('heading', { name: /Live preview/ }).waitFor();
    await invoiceGallery.getByRole('radio', { name: /Modern/ }).click();
    const premiumDialog = page.getByRole('dialog', { name: 'Premium invoice designs' });
    await premiumDialog.waitFor();
    await premiumDialog.getByRole('button', { name: 'Keep current design' }).click();
    await invoiceGallery.getByRole('radio', { name: /Standard/ }).waitFor();
    const invoicePaper = studio.getByRole('radiogroup', { name: 'Paper size' });
    assert.equal(await invoicePaper.getByRole('radio').count(), 4, 'A4, 80mm, 58mm and Business Pad all visible');
    await invoicePaper.getByRole('radio', { name: /80mm roll/ }).click();
    await studio.locator('aside article[aria-label="Receipt preview"]').last().waitFor();
    const invoiceLanguage = studio.getByRole('radiogroup', { name: 'Document language' });
    await invoiceLanguage.getByRole('radio', { name: 'সম্পূর্ণ বাংলা' }).click();
    await studio.getByRole('button', { name: 'HisabIQ teal' }).waitFor();
    assert.equal(await studio.locator('input[type="checkbox"]').count(), 15, 'All fifteen original invoice content toggles visible');
    await studio.getByLabel('Thank-you line').fill('Thank you from Magic');
    const compare = studio.getByRole('radiogroup', { name: 'Compare' });
    await compare.getByRole('radio', { name: 'Current' }).click();
    await studio.locator('aside article[aria-label="Invoice preview"]').last().waitFor();
    await compare.getByRole('radio', { name: 'New' }).click();
    await studio.locator('aside article[aria-label="Receipt preview"]').last().waitFor();
    await studio.getByRole('button', { name: 'Save changes' }).click();
    await studio.getByText(/Invoice design has NOT been saved/).last().waitFor();
    await page.reload();
    await studio.waitFor();
    assert.equal(await invoiceGallery.getByRole('radio', { name: /Standard/ }).getAttribute('aria-checked'), 'true', 'Invoice Studio does not fake persistence in Phase 1');
    await studio.locator('aside article[aria-label="Invoice preview"]').last().waitFor();
    const numbering = page.locator('[data-settings-magic-general="invoices"]');
    await numbering.waitFor();
    await numbering.getByLabel('Invoice number prefix').waitFor();
    await numbering.getByRole('checkbox', { name: /Offer receipt printing/ }).waitFor();
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
      await go('data');
      const dataPage = page.locator('[data-settings-magic-data]');
      await dataPage.waitFor();
      const dataOverflow = await page.evaluate(() => {
        const oldY = scrollY;
        window.scrollTo({ left: 9999, top: oldY, behavior: 'instant' });
        const x = scrollX;
        window.scrollTo({ left: 0, top: oldY, behavior: 'instant' });
        return x;
      });
      assert.equal(dataOverflow, 0, 'Magic Data & backup page must not scroll sideways at ' + width);
      if (process.env.SETTINGS_SCREENSHOT_DIR) {
        await page.screenshot({ path: path.join(process.env.SETTINGS_SCREENSHOT_DIR, 'settings-data-' + width + '-light.png'), fullPage: true });
        await page.evaluate(() => document.documentElement.classList.add('dark'));
        await page.screenshot({ path: path.join(process.env.SETTINGS_SCREENSHOT_DIR, 'settings-data-' + width + '-dark.png'), fullPage: true });
        await page.evaluate(() => document.documentElement.classList.remove('dark'));
      }
      await go('sessions');
      const sessionsPage = page.locator('[data-settings-magic-sessions]');
      await sessionsPage.waitFor();
      const sessionsPageX = await page.evaluate(() => {
        const y = scrollY;
        window.scrollTo({left: 9999, top: y, behavior: 'instant'});
        const x = scrollX;
        window.scrollTo({left: 0, top: y, behavior: 'instant'});
        return x;
      });
      assert.equal(sessionsPageX, 0, 'Logged-in devices page must not scroll sideways at ' + width);
      const sessionScroll = await sessionsPage.locator('[data-settings-sessions-table]').evaluate(table => {
        const pane = table.parentElement;
        return {client: pane.clientWidth, content: pane.scrollWidth, mode: getComputedStyle(pane).overflowX};
      });
      assert.equal(sessionScroll.mode, 'auto', 'Source session table has an independent scroll area');
      if (width < 760) assert.ok(sessionScroll.content > sessionScroll.client,
        'Narrow Logged-in devices table scrolls internally at ' + width);
      if (process.env.SETTINGS_SCREENSHOT_DIR) {
        await page.screenshot({path: path.join(process.env.SETTINGS_SCREENSHOT_DIR, 'settings-sessions-' + width + '-light.png'), fullPage: true});
        await page.evaluate(() => document.documentElement.classList.add('dark'));
        await page.screenshot({path: path.join(process.env.SETTINGS_SCREENSHOT_DIR, 'settings-sessions-' + width + '-dark.png'), fullPage: true});
        await page.evaluate(() => document.documentElement.classList.remove('dark'));
      }
      await go('activity');
      const activityPage = page.locator('[data-settings-magic-activity]');
      await activityPage.waitFor();
      const activityPageX = await page.evaluate(() => {
        const y = scrollY;
        window.scrollTo({ left: 9999, top: y, behavior: 'instant' });
        const x = scrollX;
        window.scrollTo({ left: 0, top: y, behavior: 'instant' });
        return x;
      });
      assert.equal(activityPageX, 0, 'Magic Staff activity page must not scroll horizontally at ' + width);
      if (process.env.SETTINGS_SCREENSHOT_DIR) {
        await page.screenshot({path: path.join(process.env.SETTINGS_SCREENSHOT_DIR, 'settings-activity-' + width + '-light.png'), fullPage: true});
        await page.evaluate(() => document.documentElement.classList.add('dark'));
        await page.screenshot({path: path.join(process.env.SETTINGS_SCREENSHOT_DIR, 'settings-activity-' + width + '-dark.png'), fullPage: true});
        await page.evaluate(() => document.documentElement.classList.remove('dark'));
      }
      await go('team');
      await page.locator('[data-settings-magic-team] [data-settings-team-table]').waitFor();
      const teamLayout = await page.evaluate(() => {
        const table = document.querySelector('[data-settings-team-table]');
        const scroller = table?.parentElement;
        if (!scroller) return null;
        const bounds = scroller.getBoundingClientRect();
        const previousY = window.scrollY;
        window.scrollTo({ left: 9999, top: previousY, behavior: 'instant' });
        const pageScrollX = window.scrollX;
        window.scrollTo({ left: 0, top: previousY, behavior: 'instant' });
        return {
          bodyWidth: document.body.scrollWidth,
          pageScrollX,
          scrollerLeft: bounds.left,
          scrollerRight: bounds.right,
          scrollerClient: scroller.clientWidth,
          scrollerContent: scroller.scrollWidth,
          overflowX: getComputedStyle(scroller).overflowX,
        };
      });
      assert.ok(teamLayout, 'Source Users & roles table wrapper exists at ' + width);
      assert.equal(teamLayout.bodyWidth > width + 1, false, 'Body overflows at ' + width);
      assert.equal(teamLayout.pageScrollX, 0, 'Whole Settings page must not scroll sideways at ' + width + ': ' + JSON.stringify(teamLayout));
      assert.ok(teamLayout.scrollerLeft >= -1 && teamLayout.scrollerRight <= width + 1,
        'Source team table wrapper escapes viewport at ' + width + ': ' + JSON.stringify(teamLayout));
      assert.equal(teamLayout.overflowX, 'auto', 'Source team table has independent horizontal scroll');
      if (width < 520) assert.ok(teamLayout.scrollerContent > teamLayout.scrollerClient,
        'Wide team table must scroll inside its wrapper at ' + width);
      if (process.env.SETTINGS_SCREENSHOT_DIR) {
        fs.mkdirSync(process.env.SETTINGS_SCREENSHOT_DIR, { recursive: true });
        await page.screenshot({ path: path.join(process.env.SETTINGS_SCREENSHOT_DIR, 'settings-team-' + width + '-light.png'), fullPage: true });
        await page.evaluate(() => document.documentElement.classList.add('dark'));
        await page.screenshot({ path: path.join(process.env.SETTINGS_SCREENSHOT_DIR, 'settings-team-' + width + '-dark.png'), fullPage: true });
        await page.evaluate(() => document.documentElement.classList.remove('dark'));
      }
    }
    assert.deepEqual(errors, [], 'Browser must have no uncaught page errors');
    if (process.env.SETTINGS_SCREENSHOT_DIR) {
      fs.mkdirSync(process.env.SETTINGS_SCREENSHOT_DIR, { recursive: true });
      await page.screenshot({ path: path.join(process.env.SETTINGS_SCREENSHOT_DIR, 'settings-magic-1440.png'), fullPage: true });
    }
    console.log('Magic Patterns Settings: source fields across nine routes, honest preview-only saving, dirty-form navigation, setup, source Invoice Studio and Interface & workflows, Users & roles, Data & backup, and source Logged-in devices and Staff activity previews across five viewports passed.');
  } finally {
    await browser?.close();
    server.httpServer?.closeAllConnections();
    await server.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
