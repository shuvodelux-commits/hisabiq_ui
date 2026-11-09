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
    for (const id of ['offline', 'support', 'subscription']) {
      assert.equal(await navigation.locator('a[data-settings-section="' + id + '"]').getAttribute('href'),
        '#/app/settings/' + id, id + ' stays in the Settings workspace');
    }
    // The two marked device tabs have the same icon and text start as siblings.
    const navPosition = async id => navigation.locator('a[data-settings-section="' + id + '"] svg')
      .evaluate(el => el.getBoundingClientRect().left);
    const teamIconX = await navPosition('team');
    for (const id of ['sessions', 'activity']) {
      assert.ok(Math.abs((await navPosition(id)) - teamIconX) <= 1,
        'Desktop Settings navigation icon should align: ' + id);
    }
    assert.equal(await page.locator('section[aria-label="Setup tasks"] li').count(), 9);
    const search = page.getByLabel('Search settings by goal', { exact: true });
    await search.fill('receipt');
    await page.locator('section[aria-label="Search settings"]').getByRole('link', {name:/Receipt design/}).first().waitFor();
    await search.fill('');
    await page.getByRole('textbox', { name: 'Search settings', exact: true }).fill('stock');
    assert.equal(await navigation.locator('a[data-settings-section]').count(), 1);
    await page.getByRole('textbox', { name: 'Search settings', exact: true }).fill('');
    // Live Settings controls: existing business preferences, not Magic demo state.
    await select('business');
    await page.getByLabel('Business name', { exact: true }).waitFor();
    await select('sales');
    const sales = page.locator('[data-settings-live-section="sales"]');
    await sales.waitFor();
    const guardian = sales.getByRole('switch', { name: 'Guardian name field' });
    assert.ok(await guardian.isVisible(), 'Guardian toggle restored to current Settings UI');
    const initialGuardian = await guardian.isChecked();
    await guardian.setChecked(!initialGuardian);
    const chips = sales.locator('[data-settings-live-sales-preview]');
    assert.equal(await chips.getByText('Guardian', {exact:true}).count(), initialGuardian ? 0 : 1,
      'POS preview immediately follows the Guardian Name setting');

    await select('products');
    const leave = page.getByRole('dialog', { name: 'Leave without saving?' });
    await leave.waitFor();
    await leave.getByRole('button', { name: 'Keep editing' }).click();
    assert.equal(await guardian.isChecked(), !initialGuardian);
    await sales.getByRole('button', {name:'Save changes'}).click();
    await sales.getByText(/Saved for this business on this device/).waitFor();
    await page.reload();
    await sales.waitFor();
    assert.equal(await guardian.isChecked(), !initialGuardian,
      'Guardian switch survives reload through the existing tenant settings provider');

    // The actual POS checkout must consume a saved visibility switch.
    await page.goto('http://127.0.0.1:4292/#/app/pos', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('pos-invoice-details-toggle').click();
    const checkoutFields = page.locator('[data-pos-customer-fields]');
    assert.equal(await checkoutFields.getByRole('textbox', {name:/guardian/i}).count(),
      initialGuardian ? 0 : 1, 'Guardian is hidden or shown in POS after saving');

    await go('sales');
    await sales.waitFor();
    await guardian.setChecked(initialGuardian);
    await sales.getByRole('button', {name:'Save changes'}).click();
    await sales.getByText(/Saved for this business on this device/).waitFor();
    await page.reload();
    await sales.waitFor();
    assert.equal(await guardian.isChecked(), initialGuardian, 'Restored initial Guardian preference');

    // Other legacy settings are still in their original model and available
    // in the new compact page, with advanced sections and real Save/Discard.
    for (const [route, section, field] of [
      ['products', 'products', 'Low-stock alerts'],
      ['purchases', 'purchases', 'Supplier memo reference'],
      ['money', 'money', 'Use cash sessions'],
      ['notifications', 'notifications', 'Low-stock notifications'],
    ]) {
      await go(route);
      const panel = page.locator('[data-settings-live-section="' + section + '"]');
      await panel.waitFor();
      if (section === 'money') await panel.getByRole('button', {name:'Show advanced options'}).click();
      await panel.getByRole('switch', {name:field}).waitFor();
    }
    // The legacy purchase receipt preference controls the actual editor.
    await go('purchases');
    const purchaseControls = page.locator('[data-settings-live-section="purchases"]');
    await purchaseControls.waitFor();
    const receipt = purchaseControls.getByRole('switch', {name:'Receipt attachments'});
    const originalReceipt = await receipt.isChecked();
    await receipt.uncheck();
    if (originalReceipt) {
      await purchaseControls.getByRole('button', {name:'Save changes'}).click();
      await purchaseControls.getByText(/Saved for this business on this device/).waitFor();
    }
    await page.goto('http://127.0.0.1:4292/#/app/purchases/new', {waitUntil:'domcontentloaded'});
    await page.locator('[data-purchase-layout]').waitFor();
    assert.equal(await page.locator('[data-purchase-receipt]').count(), 0,
      'Turning off receipt attachments hides the real Purchase Editor upload');
    await go('purchases');
    await purchaseControls.waitFor();
    await receipt.setChecked(originalReceipt);
    if (originalReceipt) {
      await purchaseControls.getByRole('button', {name:'Save changes'}).click();
      await purchaseControls.getByText(/Saved for this business on this device/).waitFor();
    }
    for (const route of ['financialTerminology', 'personal', 'security']) {
      await go(route);
      await page.locator('.erp-settings section').first().waitFor();
    }
    await go('invoices');
    await page.locator('[data-settings-magic-invoice-studio]').waitFor();
    const liveInvoice = page.locator('[data-settings-live-section="invoices"]');
    await liveInvoice.waitFor();
    await liveInvoice.getByRole('switch', {name:'Show business logo'}).waitFor();

    // Regression: restoring *visible* invoice preferences must preserve the
    // separately saved document-numbering prefix and still permit saving.
    await page.getByRole('button', {name:/Document numbering, ledger & report designs/}).click();
    const legacyDocuments = page.locator('[data-settings-live-document-controls]');
    await legacyDocuments.getByRole('tab', {name:/^Document numbering/}).click();
    const prefixInput = legacyDocuments.getByRole('textbox', {name:/^Prefix/});
    const previousPrefix = await prefixInput.inputValue();
    const customPrefix = previousPrefix === 'TST' ? 'TST2' : 'TST';
    await prefixInput.fill(customPrefix);
    await legacyDocuments.getByRole('button', {name:'Save changes'}).click();
    const documentReview = page.getByRole('dialog', {name:'Review settings changes'});
    await documentReview.getByRole('button', {name:'Confirm save'}).click();
    await documentReview.waitFor({state:'hidden'});

    const invoiceFooter = liveInvoice.getByRole('textbox', {name:/^Invoice footer/});
    const originalFooter = await invoiceFooter.inputValue();
    await invoiceFooter.fill(originalFooter === 'Temporary receipt footer' ? 'Other receipt footer' : 'Temporary receipt footer');
    await liveInvoice.getByRole('button', {name:'Save changes'}).click();
    await liveInvoice.getByText(/Saved for this business on this device/).waitFor();
    await liveInvoice.getByRole('button', {name:'Restore defaults'}).click();
    await liveInvoice.getByRole('button', {name:'Save changes'}).click();
    await liveInvoice.getByText(/Saved for this business on this device/).waitFor();
    await page.reload();
    await liveInvoice.waitFor();
    assert.equal(await invoiceFooter.inputValue(), 'Thank you for your business.',
      'Visible invoice footer returns to defaults and saves');
    await page.getByRole('button', {name:/Document numbering, ledger & report designs/}).click();
    await legacyDocuments.getByRole('tab', {name:/^Document numbering/}).click();
    assert.equal(await prefixInput.inputValue(), customPrefix,
      'Restoring visible invoice preferences must not reset saved numbering prefix');

    // Leave the original numbering unchanged for the rest of the browser suite.
    await prefixInput.fill(previousPrefix);
    await legacyDocuments.getByRole('button', {name:'Save changes'}).click();
    await documentReview.getByRole('button', {name:'Confirm save'}).click();
    await documentReview.waitFor({state:'hidden'});
    await go('interface');
    const interfaceUI = page.locator('[data-settings-magic-interface]');
    await interfaceUI.waitFor();
    await interfaceUI.getByRole('heading', { name: /Interface & workflows/ }).waitFor();
    await interfaceUI.locator('[data-interface-preview-notice]').getByText(/UI preview/).waitFor();
    const moduleTrigger = interfaceUI.getByRole('button', { name: 'Module', exact: true });
    const applyToTrigger = interfaceUI.getByRole('combobox', { name: 'Apply to' });
    const moduleBox = await moduleTrigger.boundingBox();
    const applyBox = await applyToTrigger.boundingBox();
    assert.ok(moduleBox && applyBox, 'Both Interface dropdown triggers are rendered');
    assert.ok(Math.abs(moduleBox.height - 36) <= 1 && Math.abs(applyBox.height - 36) <= 1,
      'Both Module and Apply to controls use the standard 36px height');
    assert.ok(Math.abs(moduleBox.y - applyBox.y) <= 2,
      'Interface dropdowns share the same vertical alignment');
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
    await interfaceUI.locator('[data-capability="products.columns.stockValue"] input[role="switch"]').click();
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
    const companyPayment = interfaceUI.locator('[data-capability="sales.columns.paymentMethod"] input[role="switch"]');
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
    // Support and billing must render in the SAME Settings shell as Offline selling.
    await go('support');
    await page.locator('[data-settings-embedded-support]').waitFor();
    await page.getByRole('heading', { name: /My support tickets/ }).waitFor();
    assert.equal(await navigation.locator('a[data-settings-section="support"]').getAttribute('aria-current'), 'page');
    assert.ok(page.url().includes('#/app/settings/support'), 'Support stays in Settings');
    const supportLinks = page.locator('[data-settings-embedded-support] a[href^="#/app/settings/support/"]');
    if (await supportLinks.count()) {
      await supportLinks.first().click();
      await page.waitForURL(/\/app\/settings\/support\//);
      await page.locator('[data-settings-embedded-support]').waitFor();
      assert.equal(await navigation.locator('a[data-settings-section="support"]').getAttribute('aria-current'), 'page',
        'Support ticket detail keeps the Settings navigation visible');
    }
    await go('subscription');
    await page.locator('[data-settings-embedded-subscription]').waitFor();
    await page.getByRole('heading', { name: 'My subscription' }).waitFor();
    assert.equal(await navigation.locator('a[data-settings-section="subscription"]').getAttribute('aria-current'), 'page');
    await page.locator('[data-settings-embedded-subscription]').getByText('Current plan', { exact: true }).waitFor();
    await page.locator('[data-settings-embedded-subscription]').getByText('Outstanding', { exact: true }).waitFor();
    await page.getByRole('link', { name: 'Contact support' }).click();
    await page.waitForURL(/\/app\/settings\/support/);
    await page.locator('[data-settings-embedded-support]').waitFor();
    await go('offline');
    await page.locator('[data-settings-magic-offline]').waitFor();
    assert.equal(await navigation.locator('a[data-settings-section="offline"]').getAttribute('aria-current'), 'page');
    await go('');
    await page.getByRole('button', { name: 'Start guided setup' }).click();
    const wizard = page.getByRole('dialog', { name: 'Set up your shop' });
    await wizard.waitFor();
    assert.equal(await wizard.getByRole('link', { name: /Open Shop details/ }).count(), 1);
    await wizard.getByRole('button', { name: 'Continue' }).click();
    await wizard.getByRole('link', { name: /Open Business type/ }).waitFor();
    await wizard.getByRole('button', { name: 'Skip for now' }).click();
    // Real Settings-only backup/restore within the existing Magic Data shell.
    await go('data');
    const dataUI = page.locator('[data-settings-magic-data]');
    await dataUI.waitFor();
    assert.deepEqual(
      await dataUI.getByRole('tab').allTextContents().then(values => values.map(value => value.trim())),
      ['Backup & restore', 'Record exports & import preview'],
      'Data page retains compact tabs while removing the misleading Reset demo flow',
    );
    assert.equal(await dataUI.getByRole('button', {name:'Reset demo'}).count(), 0,
      'Data & Backup must never offer a fake bulk business-data reset');
    const [settingsDownload] = await Promise.all([
      page.waitForEvent('download'),
      dataUI.getByRole('button', {name:'Download settings backup'}).click(),
    ]);
    const originalSettings = JSON.parse(fs.readFileSync(await settingsDownload.path(), 'utf8'));
    assert.equal(originalSettings.tenantId, 't1');
    assert.equal(originalSettings.sections.business.name.length > 0, true);
    assert.equal(Object.prototype.hasOwnProperty.call(originalSettings, 'sales'), false,
      'The backup is settings-only, not a transaction data backup');
    assert.equal(Object.prototype.hasOwnProperty.call(originalSettings, 'stock'), false);
    const restoreInput = dataUI.getByLabel('Restore settings backup', {exact:true});
    const uploadSettings = async (value, name='hisabiq-settings.json') => {
      await restoreInput.setInputFiles({name, mimeType:'application/json', buffer:Buffer.from(JSON.stringify(value))});
    };
    await uploadSettings({...originalSettings, tenantId:'different-business'});
    await dataUI.getByRole('alert').getByText(/Invalid backup or a backup from another business/i).waitFor();
    assert.equal(await page.getByRole('dialog', {name:'Review settings restore'}).count(), 0,
      'Wrong-tenant backups must never reach confirmation');

    await restoreInput.setInputFiles({name:'malformed.json',mimeType:'application/json',buffer:Buffer.from('{broken')});
    await dataUI.getByRole('alert').getByText(/Invalid backup or a backup from another business/i).waitFor();
    await restoreInput.setInputFiles({name:'oversized.json',mimeType:'application/json',buffer:Buffer.alloc(1_000_001, 97)});
    await dataUI.getByRole('alert').getByText(/smaller than 1 MB/i).waitFor();

    const changedBackup = structuredClone(originalSettings);
    changedBackup.sections.business.name = 'Backup Review Test Shop';
    await uploadSettings(changedBackup);
    const restoreReview = page.getByRole('dialog', {name:'Review settings restore'});
    await restoreReview.waitFor();
    await restoreReview.getByText('Business', {exact:true}).waitFor();
    await restoreReview.getByRole('button', {name:'Cancel'}).click();
    await restoreReview.waitFor({state:'hidden'});

    await uploadSettings(changedBackup);
    await restoreReview.getByRole('button', {name:'Restore settings'}).click();
    await dataUI.getByRole('status').filter({hasText:/Business settings restored/}).waitFor();
    await page.reload();
    await dataUI.waitFor();
    await go('business');
    assert.equal(await page.getByLabel('Business name',{exact:true}).inputValue(),
      'Backup Review Test Shop', 'Restore must persist to the canonical Settings provider');
    await go('data');
    await uploadSettings(originalSettings);
    await restoreReview.getByRole('button',{name:'Restore settings'}).click();
    await dataUI.getByRole('status').filter({hasText:/Business settings restored/}).waitFor();
    await page.reload();
    await go('business');
    assert.equal(await page.getByLabel('Business name',{exact:true}).inputValue(),
      originalSettings.sections.business.name, 'Original settings restored after regression test');
    await go('data');
    await dataUI.getByRole('heading', {name:/Encrypted SQL backup & recovery/}).waitFor();
    await dataUI.getByRole('heading', {name:/Recycle Bin/}).waitFor();
    await dataUI.getByText(/current session.*draft store/i).waitFor();
    await dataUI.getByRole('tab', {name:'Record exports & import preview'}).click();
    await dataUI.getByLabel('Product CSV preview').waitFor();
    await dataUI.getByText(/No records imported/i).waitFor();
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
    const bulkTrigger = sessionsUI.getByRole('button', { name: /Sign out everyone except me/ });
    await bulkTrigger.click();
    const bulkDialog = page.getByRole('dialog', { name: 'Sign out everyone except you?' });
    await bulkDialog.waitFor();
    const bulkPin = bulkDialog.getByRole('textbox', { name: /Owner PIN/ });
    assert.equal(await bulkPin.evaluate(el => document.activeElement === el), true,
      'Owner PIN receives initial modal focus');
    const bulkConfirm = bulkDialog.getByRole('button', { name: 'Sign out everyone' });
    await bulkConfirm.focus();
    await page.keyboard.press('Tab');
    assert.equal(await bulkDialog.getByRole('button', { name: 'Close' }).evaluate(el => document.activeElement === el), true,
      'Tab wraps from the last dialog control to the first');
    await page.keyboard.press('Shift+Tab');
    assert.equal(await bulkConfirm.evaluate(el => document.activeElement === el), true,
      'Shift+Tab wraps from the first control to the last');
    await page.keyboard.press('Escape');
    await bulkDialog.waitFor({ state: 'detached' });
    assert.equal(await bulkTrigger.evaluate(el => document.activeElement === el), true,
      'Escape returns focus to the original bulk-action trigger');
    await bulkTrigger.press('Enter');
    await bulkDialog.waitFor();
    assert.equal(await bulkPin.evaluate(el => document.activeElement === el), true,
      'Reopened dialog restores its PIN initial-focus behavior');
    await bulkPin.fill('123');
    await bulkConfirm.click();
    await bulkDialog.getByRole('alert').filter({ hasText: /Enter your 6-digit PIN/ }).waitFor();
    assert.equal(await bulkPin.getAttribute('aria-invalid'), 'true', 'PIN marks the field invalid');
    const describedBy = await bulkPin.getAttribute('aria-describedby');
    const messageId = await bulkDialog.getByRole('alert').filter({ hasText: /Enter your 6-digit PIN/ }).getAttribute('id');
    assert.equal(describedBy, messageId, 'PIN validation is associated with its accessible description');
    assert.equal(await bulkPin.getAttribute('aria-errormessage'), messageId,
      'PIN validation also sets aria-errormessage');
    assert.equal(await bulkPin.evaluate(el => document.activeElement === el), true,
      'PIN retains focus after invalid confirmation');
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
    const activityExpand = discountRow.getByRole('button', { name: /Show details for/ });
    assert.equal(await activityExpand.getAttribute('aria-expanded'), 'false',
      'Activity disclosure announces its collapsed state');
    assert.equal(await activityExpand.getAttribute('aria-controls'), null,
      'Collapsed details are not referenced while removed from the DOM');
    await activityExpand.click();
    const activityCollapse = discountRow.getByRole('button', { name: /Hide details for/ });
    const activityDetailsId = await activityCollapse.getAttribute('aria-controls');
    assert.ok(activityDetailsId, 'Expanded activity disclosure points to its details');
    assert.equal(await activityCollapse.getAttribute('aria-expanded'), 'true',
      'Activity disclosure announces expanded state and changed action');
    assert.equal(await activityCollapse.getAttribute('aria-controls'), activityDetailsId,
      'Expanded activity details keep a stable control relationship');
    assert.equal(await discountRow.locator('[id]').filter({ hasText: 'Before' }).first().getAttribute('id'), activityDetailsId,
      'The disclosure controls its actual expanded content');
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
    // Pinned Magic Offline selling: exactly one synthetic offline device, trusted-device
    // approval, preview sale and deferred handover, then sync/disable/reset.
    await go('offline');
    const offlineUI = page.locator('[data-settings-magic-offline]');
    await offlineUI.waitFor();
    await offlineUI.getByText(/This page cannot authorize a real device or save a sale/).waitFor();
    await offlineUI.getByText(/Counter PC/).first().waitFor();
    await offlineUI.getByRole('heading', { name: /Rules while offline/ }).waitFor();
    await offlineUI.getByRole('heading', { name: /Sync history/ }).waitFor();
    const offlineHistory = offlineUI.locator('[data-settings-offline-history]');
    assert.equal(await offlineHistory.locator('tbody tr').count(), 3, 'Three source demo sync records');
    const untrusted = offlineUI.locator('li').filter({ hasText: /iPhone 13/ }).first();
    assert.equal(await untrusted.getByRole('button', { name: 'Make this the offline device' }).isDisabled(), true,
      'Untrusted devices cannot become the demo offline device');
    await offlineUI.getByRole('combobox', { name: 'Sync deadline' }).click();
    await page.getByRole('option', { name: '12 hours' }).click();
    assert.equal(await offlineUI.getByRole('combobox', { name: 'Sync deadline' }).getAttribute('data-value'), '12');
    await offlineUI.getByRole('button', { name: 'Open product' }).click();
    assert.ok(page.url().includes('/app/settings/offline'), 'Example stock item link never opens a real product');
    await offlineUI.getByRole('button', { name: 'Go offline' }).click();
    await offlineUI.getByRole('button', { name: 'Record a test offline sale' }).click();
    await offlineUI.getByRole('button', { name: 'Turn off', exact: true }).click();
    const offDialog = page.getByRole('dialog', { name: 'Turn off offline selling?' });
    await offDialog.waitFor();
    await offDialog.getByText(/Sync 1 sale first/).waitFor();
    assert.equal(await offDialog.getByRole('button', { name: 'Turn off', exact: true }).count(), 0,
      'A pending demo sale blocks disabling the offline device');
    await offDialog.locator('footer').getByRole('button', { name: 'Close', exact: true }).click();
    const target = offlineUI.locator('li').filter({ hasText: /Owner phone/ }).first();
    await target.getByRole('button', { name: 'Make this the offline device' }).click();
    const pinDialog = page.getByRole('dialog', { name: 'Change the offline device?' });
    await pinDialog.waitFor();
    await pinDialog.getByRole('textbox', { name: /Owner PIN/ }).fill('123');
    await pinDialog.getByRole('button', { name: 'Make offline device' }).click();
    await pinDialog.getByText(/Enter your 6-digit PIN/).waitFor();
    await pinDialog.getByRole('textbox', { name: /Owner PIN/ }).fill('123456');
    await pinDialog.getByRole('button', { name: 'Make offline device' }).click();
    const pendingTransfer = offlineUI.getByRole('status').filter({ hasText: /Waiting to switch to Owner phone/ });
    await pendingTransfer.waitFor();
    await pendingTransfer.getByText(/still has 1 unsynced sale/).waitFor();
    await pendingTransfer.getByRole('button', { name: 'Sync now' }).click();
    await pendingTransfer.waitFor({ state: 'detached' });
    await offlineUI.getByText(/Owner phone/).first().waitFor();
    assert.equal(await offlineHistory.locator('tbody tr').count(), 4, 'Demo sync recorded in local history');
    await offlineUI.getByRole('button', { name: 'Turn off', exact: true }).click();
    await offDialog.waitFor();
    await offDialog.getByRole('button', { name: 'Turn off', exact: true }).click();
    await offlineUI.getByText('Offline selling is off', { exact: true }).waitFor();
    await page.reload();
    await offlineUI.waitFor();
    await offlineUI.getByText(/Counter PC/).first().waitFor();
    assert.equal(await offlineHistory.locator('tbody tr').count(), 3,
      'Offline demo device, pending sales, policy and sync history reset on reload');
    assert.equal(await offlineUI.getByRole('combobox', { name: 'Sync deadline' }).getAttribute('data-value'), '24',
      'Changed sync policy was never stored for any business');
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
    const addTeamTrigger = teamUI.getByRole('button', { name: 'Add team member', exact: true });
    await addTeamTrigger.click();
    const addTeamModal = page.getByRole('dialog', { name: 'Add team member' });
    await addTeamModal.waitFor();
    const teamName = addTeamModal.getByRole('textbox', { name: 'Name' });
    await addTeamModal.getByRole('button', { name: 'Save', exact: true }).click();
    const teamError = addTeamModal.getByRole('alert');
    await teamError.waitFor();
    assert.match(await teamError.textContent(), /Enter a name\./, 'Blank team name is announced as an alert');
    const teamErrorId = await teamError.getAttribute('id');
    assert.ok(teamErrorId, 'Name validation alert has an ID');
    assert.equal(await teamName.getAttribute('aria-invalid'), 'true',
      'Empty team member name is exposed as invalid');
    assert.equal(await teamName.getAttribute('aria-describedby'), teamErrorId,
      'Team name is associated with its validation explanation');
    assert.equal(await teamName.getAttribute('aria-errormessage'), teamErrorId,
      'Team name exposes the error message to assistive technology');
    assert.equal(await teamName.evaluate(el => document.activeElement === el), true,
      'Team validation moves focus back to the offending input');
    await teamName.fill('Accessible preview member');
    assert.equal(await addTeamModal.getByRole('alert').count(), 0,
      'Correcting the name clears the previous validation alert');
    assert.equal(await teamName.getAttribute('aria-invalid'), null,
      'Correcting the name clears the invalid state');
    await addTeamModal.getByRole('button', { name: 'Cancel' }).click();
    await addTeamModal.waitFor({ state: 'detached' });
    assert.equal(await addTeamTrigger.evaluate(el => document.activeElement === el), true,
      'Team modal returns focus to Add team member after Cancel');
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
    assert.equal(await studio.getByRole('switch').count(), 15, 'All fifteen invoice content options use switches');
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
    const numbering = page.locator('[data-settings-live-section="invoices"]');
    await numbering.waitFor();
    await numbering.getByRole('switch', { name: /Show business logo/ }).waitFor();
    // WCAG AA text contrast regression for source Magic Settings in both modes.
    // Theme token values are measured at their actual rendered element surfaces.
    const ratio = (fore, back) => {
      const channel = css => (css.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
      const luminance = cs => cs.reduce((acc, v, i) => {
        const x = v / 255;
        const linear = x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
        return acc + linear * [0.2126, 0.7152, 0.0722][i];
      }, 0);
      const x = luminance(channel(fore)), y = luminance(channel(back));
      return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
    };
    const pair = (element, background) => page.evaluate(([fg, bg]) => {
      const fore = document.querySelector(fg), back = document.querySelector(bg);
      return fore && back
        ? { foreground: getComputedStyle(fore).color, surface: getComputedStyle(back).backgroundColor }
        : null;
    }, [element, background]);
    await go('interface');
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await page.locator('#interface-title').waitFor();
    const interfacePair = await pair('#interface-title', 'section[aria-labelledby="interface-title"]');
    assert.ok(interfacePair && ratio(interfacePair.foreground, interfacePair.surface) >= 4.5,
      'Interface & workflows dark title contrast >= 4.5:1: ' + JSON.stringify(interfacePair));
    await go('offline');
    const offlineSyncButton = page.locator('[data-settings-magic-offline] button.ref-button-outline').first();
    await offlineSyncButton.waitFor();
    const offlineButtonPair = await offlineSyncButton.evaluate(el => ({
      foreground: getComputedStyle(el).color,
      surface: getComputedStyle(el).backgroundColor,
    }));
    assert.ok(ratio(offlineButtonPair.foreground, offlineButtonPair.surface) >= 4.5,
      'Enabled Magic outline action dark contrast >= 4.5:1: ' + JSON.stringify(offlineButtonPair));
    await go('invoices');
    const contrastPaper = page.locator('article[aria-label="Invoice preview"]').first();
    await contrastPaper.waitFor();
    const paperPair = await contrastPaper.evaluate(el => ({
      foreground: getComputedStyle(el).color,
      surface: getComputedStyle(el).backgroundColor,
    }));
    assert.ok(ratio(paperPair.foreground, paperPair.surface) >= 4.5,
      'White invoice paper preview uses legible dark text in dark mode: ' + JSON.stringify(paperPair));
    await page.evaluate(() => document.documentElement.classList.remove('dark'));
    await go('interface');
    const lightPair = await pair('#interface-title', 'section[aria-labelledby="interface-title"]');
    assert.ok(lightPair && ratio(lightPair.foreground, lightPair.surface) >= 4.5,
      'Interface & workflows light title contrast >= 4.5:1: ' + JSON.stringify(lightPair));
    for (const width of [320,390,768,1024,1440]) {
      await page.setViewportSize({ width, height: 900 });
      await go('');
      await navigation.locator('a[data-settings-section]').first().waitFor();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      assert.equal(overflow, false, 'Settings home overflows at ' + width);
      // Phase-1 visual evidence: cover the nine general-source routes and
      // Invoice Studio at each viewport/theme, not only the five security pages.
      // These are implementation screenshots, NEVER original Magic references.
      if (process.env.SETTINGS_SCREENSHOT_DIR) {
        fs.mkdirSync(process.env.SETTINGS_SCREENSHOT_DIR, { recursive: true });
        const sourceRoutes = [
          ['home', '', '[data-settings-magic-patterns]'],
          ['business', 'business', '[data-field-key=\"name\"]'],
          ['names', 'financialTerminology', '[data-settings-magic-patterns]'],
          ['sales', 'sales', '[data-settings-live-section=\"sales\"]'],
          ['products', 'products', '[data-settings-live-section=\"products\"]'],
          ['purchases', 'purchases', '[data-settings-live-section=\"purchases\"]'],
          ['finance', 'money', '[data-settings-live-section=\"money\"]'],
          ['notifications', 'notifications', '[data-settings-live-section=\"notifications\"]'],
          ['personal', 'personal', '[data-settings-magic-patterns]'],
          ['security', 'security', '[data-settings-magic-patterns]'],
          ['invoices', 'invoices', '[data-settings-magic-invoice-studio]'],
          ['interface', 'interface', '[data-settings-magic-interface]'],
          ['support', 'support', '[data-settings-embedded-support]'],
          ['subscription', 'subscription', '[data-settings-embedded-subscription]'],
        ];
        for (const [name, route, selector] of sourceRoutes) {
          await go(route);
          await page.locator(selector).waitFor({ state: 'visible' });
          await page.evaluate(() => document.fonts.ready);
          const pageX = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
          assert.equal(pageX, false, 'Source Settings route ' + name + ' overflows at ' + width);
          for (const theme of ['light', 'dark']) {
            await page.evaluate(mode => {
              document.documentElement.classList.toggle('dark', mode === 'dark');
            }, theme);
            await page.screenshot({
              path: path.join(process.env.SETTINGS_SCREENSHOT_DIR,
                'settings-' + name + '-' + width + '-' + theme + '.png'),
              fullPage: true, animations: 'disabled',
            });
            if (name === 'interface') {
              const trigger = page.locator('[data-settings-magic-interface] button[aria-label="Module"]');
              await trigger.click();
              await page.getByRole('listbox', { name: 'Modules' }).waitFor();
              await page.screenshot({
                path: path.join(process.env.SETTINGS_SCREENSHOT_DIR,
                  'settings-interface-module-open-' + width + '-' + theme + '.png'),
                fullPage: true, animations: 'disabled',
              });
              await page.getByRole('textbox', { name: 'Search modules' }).press('Escape');
              await page.getByRole('listbox', { name: 'Modules' }).waitFor({ state: 'detached' });
            }
          }
          await page.evaluate(() => document.documentElement.classList.remove('dark'));
        }
        await go('');
        await navigation.locator('a[data-settings-section]').first().waitFor();
      }
      // An off-screen deep link must reveal the selected Magic navigation item
      // inside the horizontal strip without moving keyboard focus or the page.
      const activeNavVisible = async id => {
        await page.waitForFunction(section => {
          const strip = document.querySelector('[data-settings-directory]');
          const selected = strip?.querySelector('a[data-settings-section="' + section + '"]');
          if (!strip || !selected || selected.getAttribute('aria-current') !== 'page') return false;
          if (matchMedia('(min-width: 1024px)').matches) return true;
          const container = strip.getBoundingClientRect();
          const item = selected.getBoundingClientRect();
          return item.left >= container.left + 3 && item.right <= container.right - 3;
        }, id);
      };
      await go('offline');
      await activeNavVisible('offline');
      const mobileNav = page.locator('[data-settings-directory]');
      if (width < 1024) {
        assert.ok(await mobileNav.evaluate(el => el.scrollLeft > 0),
          'Deep-linked Offline selling tab should scroll into view at ' + width);
      }
      await page.evaluate(() => { window.location.hash = '#/app/settings/security'; });
      await page.waitForURL(/\/app\/settings\/security/);
      await activeNavVisible('security');
      const searchDirectory = page.getByRole('textbox', { name: 'Search settings', exact: true });
      await searchDirectory.fill('offline');
      assert.equal(await mobileNav.locator('a[data-settings-section]').count(), 1,
        'Navigation search still filters the original source links');
      await page.evaluate(() => { window.location.hash = '#/app/settings/offline'; });
      await page.waitForURL(/\/app\/settings\/offline/);
      await activeNavVisible('offline');
      await searchDirectory.fill('');
      await activeNavVisible('offline');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false,
        'Selected-item reveal must never cause whole-page horizontal overflow at ' + width);
      await go('business');
      await page.getByLabel('Business name', { exact: true }).waitFor();
      const formOverflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      assert.equal(formOverflow, false, 'Settings form overflows at ' + width);
      // Source risk-review modal is also readable and contained on small screens.
      await go('money');
      const financeGeneral = page.locator('[data-settings-live-section="money"]');
      await financeGeneral.waitFor();
      await financeGeneral.getByRole('button', { name: 'Show advanced options' }).click();
      await financeGeneral.getByLabel('Lock posting through date').fill('2026-10-31');
      await financeGeneral.getByRole('button', { name: 'Save changes' }).click();
      const riskDialog = page.getByRole('dialog', { name: 'Review business setting changes' });
      await riskDialog.waitFor();
      const riskLayout = await riskDialog.evaluate(el => ({
        width: el.getBoundingClientRect().width,
        left: el.getBoundingClientRect().left,
        right: el.getBoundingClientRect().right,
      }));
      assert.ok(riskLayout.left >= 0 && riskLayout.right <= width + 1,
        'Source risk modal is within viewport at ' + width + ': ' + JSON.stringify(riskLayout));
      if (process.env.SETTINGS_SCREENSHOT_DIR) {
        await page.screenshot({path: path.join(process.env.SETTINGS_SCREENSHOT_DIR,
          'settings-before-save-' + width + '-light.png'), fullPage: true});
        await page.evaluate(() => document.documentElement.classList.add('dark'));
        await page.screenshot({path: path.join(process.env.SETTINGS_SCREENSHOT_DIR,
          'settings-before-save-' + width + '-dark.png'), fullPage: true});
        await page.evaluate(() => document.documentElement.classList.remove('dark'));
      }
      await riskDialog.getByRole('button', { name: 'Review again' }).click();
      await riskDialog.waitFor({ state: 'detached' });
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
      await go('offline');
      const offlinePage = page.locator('[data-settings-magic-offline]');
      await offlinePage.waitFor();
      const offlineLayout = await page.evaluate(() => {
        const beforeY = scrollY;
        window.scrollTo({ left: 9999, top: beforeY, behavior: 'instant' });
        const x = scrollX;
        window.scrollTo({ left: 0, top: beforeY, behavior: 'instant' });
        const table = document.querySelector('[data-settings-offline-history]');
        const parent = table?.parentElement;
        return { x, client: parent?.clientWidth ?? 0, content: parent?.scrollWidth ?? 0,
          mode: parent ? getComputedStyle(parent).overflowX : '' };
      });
      assert.equal(offlineLayout.x, 0, 'Whole Offline settings page must not scroll sideways at ' + width);
      assert.equal(offlineLayout.mode, 'auto', 'Offline history table scrolls inside its section at ' + width);
      if (width < 560) assert.ok(offlineLayout.content > offlineLayout.client,
        'Offline history table supports independent horizontal scrolling at ' + width);
      if (process.env.SETTINGS_SCREENSHOT_DIR) {
        await page.screenshot({path: path.join(process.env.SETTINGS_SCREENSHOT_DIR, 'settings-offline-' + width + '-light.png'), fullPage: true});
        await page.evaluate(() => document.documentElement.classList.add('dark'));
        await page.screenshot({path: path.join(process.env.SETTINGS_SCREENSHOT_DIR, 'settings-offline-' + width + '-dark.png'), fullPage: true});
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
    console.log('HisabIQ Settings: saved business preferences, POS Guardian visibility, Magic UI specialty previews, bilingual navigation, accessibility and five-viewport responsive coverage passed.');
  } finally {
    await browser?.close();
    server.httpServer?.closeAllConnections();
    await server.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
