const { chromium } = require('playwright');
const assert = require('node:assert/strict');
async function main() {
  const { createServer } = await import('vite');
  const server = await createServer({ server: { host: '127.0.0.1', port: 4183, strictPort: true } });
  await server.listen();
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1320, height: 960 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));
  const root = 'http://127.0.0.1:4183/#/app/';
  try {
    await page.goto(root + 'daybook');
    await page.evaluate(() => localStorage.setItem('hisabiq-theme', 'dark'));
    await page.reload();
    assert.equal(await page.getAttribute('html', 'data-theme'), 'dark');

    const status = page.getByRole('combobox', { name: 'Status', exact: true });
    await status.click();
    const options = page.getByRole('listbox', { name: 'Status options' });
    await options.waitFor();
    assert.equal(await options.evaluate((node) => getComputedStyle(node).backgroundColor),
      'rgb(20, 38, 59)', 'dark dropdown uses HisabIQ popover color');
    await page.getByRole('option', { name: 'Posted', exact: true }).click();
    assert.match(await status.innerText(), /Posted/);
    await status.focus();
    await status.press('ArrowDown');
    await status.press('Enter');
    assert.match(await status.innerText(), /Draft/, 'keyboard arrows update the selected option');

    const range = page.getByRole('button', { name: 'Daybook date range' });
    await range.click();
    const calendar = page.getByRole('dialog', { name: 'Daybook date range calendar' });
    await calendar.waitFor();
    assert.equal(await calendar.evaluate((node) => getComputedStyle(node).backgroundColor),
      'rgb(20, 38, 59)', 'dark calendar uses HisabIQ popover color');
    const monthGrids = calendar.locator('[role="grid"]');
    assert.equal(await monthGrids.count(), 2, 'two month calendars rendered on desktop');
    assert.equal(await monthGrids.nth(0).isVisible(), true);
    assert.equal(await monthGrids.nth(1).isVisible(), true, 'second month visible on desktop');
    await calendar.locator('[data-calendar-date="2026-10-06"]').click();
    await calendar.locator('[data-calendar-date="2026-10-09"]').click();
    await calendar.getByRole('button', { name: 'Apply' }).click();
    assert.match(await range.innerText(), /6 Oct 2026 – 9 Oct 2026/);

    await range.click();
    await calendar.getByRole('button', { name: 'Last month' }).click();
    await calendar.getByRole('button', { name: 'Cancel' }).click();
    assert.match(await range.innerText(), /6 Oct 2026 – 9 Oct 2026/, 'cancel does not alter applied range');

    await range.click();
    await calendar.getByRole('button', { name: 'Clear' }).click();
    assert.match(await range.innerText(), /All dates/, 'clear removes the date filter');

    await page.goto(root + 'audit-ledger');
    const audit = page.getByRole('button', { name: 'Audit date range' });
    await audit.click();
    await page.getByRole('button', { name: 'This month' }).click();
    await page.getByRole('button', { name: 'Apply' }).click();
    assert.doesNotMatch(await audit.innerText(), /All dates/);

    await page.goto(root + 'accounts');
    await page.getByRole('tab', { name: /^Ledger/ }).click();
    const ledger = page.getByRole('button', { name: 'Account ledger date range' });
    await ledger.click();
    await page.getByRole('button', { name: 'Clear' }).click();
    assert.match(await ledger.innerText(), /All dates/, 'account ledger accepts an unbounded range');

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(root + 'daybook');
    await page.getByRole('button', { name: 'Daybook date range' }).click();
    const mobile = page.getByRole('dialog', { name: 'Daybook date range calendar' });
    const mobileGrids = mobile.locator('[role="grid"]');
    assert.equal(await mobileGrids.count(), 2, 'both months retained for responsive UI');
    assert.equal(await mobileGrids.first().isVisible(), true);
    assert.equal(await mobileGrids.last().isVisible(), false, 'second month hidden on mobile');
    assert.ok((await mobile.boundingBox()).width <= 390);

    await page.evaluate(() => localStorage.setItem('hisabiq-theme', 'light'));
    await page.reload();
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.getByRole('combobox', { name: 'Status', exact: true }).click();
    assert.equal(await page.getByRole('listbox', { name: 'Status options' }).evaluate((node) => getComputedStyle(node).backgroundColor),
      'rgb(255, 255, 255)', 'light dropdown matches card color');
    assert.deepEqual(errors, []);
    console.log('Themed menus and range calendars passed dark/light, pointer, keyboard, apply/cancel, preset, mobile checks.');
  } finally {
    await browser.close();
    await server.close();
  }
}
main().catch((err) => { console.error(err); process.exitCode = 1; });
