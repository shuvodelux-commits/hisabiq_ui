const { chromium } = require('playwright');
const assert = require('node:assert/strict');

async function main() {
  const { createServer } = await import('vite');
  const server = await createServer({
    server: { host: '127.0.0.1', port: 4391, strictPort: true }
  });
  await server.listen();
  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined,
    args: ['--no-sandbox']
  });

  try {
    for (const [width, height, language, theme] of [
      [320, 640, 'English', 'light'],
      [390, 844, 'English', 'dark'],
      [390, 844, 'Bangla', 'light'],
      [768, 900, 'English + Bangla', 'dark'],
      [1440, 900, 'English', 'light']
    ]) {
      const context = await browser.newContext({
        viewport: { width, height }, hasTouch: width < 768,
        colorScheme: theme, reducedMotion: 'reduce'
      });
      await context.addInitScript((lang) => {
        localStorage.setItem('hisabiq-erp-personal-v1', JSON.stringify({
          mode: 'Simple', language: lang, density: 'Compact',
          terminology: 'simple', dateView: 'transaction', searchMode: 'Default'
        }));
      }, language);
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto('http://127.0.0.1:4391/#/app/audit-ledger');
      await page.locator('main table tbody tr').first().waitFor();
      const rowCount = await page.locator('main table tbody tr').count();
      assert.equal(rowCount, 6, 'The existing October audit records remain visible');

      const more = page.getByRole('button', { name: language === 'Bangla' ? 'আরও ফিল্টার' : 'More filters' });
      assert.equal(await page.locator('main [role="combobox"]:visible').count(), 2,
        'Only source and status filters stay in the first view');
      assert.equal(await more.getAttribute('aria-expanded'), 'false');
      await more.click();
      assert.equal(await page.locator('main [role="combobox"]:visible').count(), 7,
        'All original seven filters can be revealed');
      const less = page.getByRole('button', { name: language === 'Bangla' ? 'কম ফিল্টার' : 'Fewer filters' });
      assert.equal(await less.getAttribute('aria-expanded'), 'true');
      await less.click();
      assert.equal(await page.locator('main [role="combobox"]:visible').count(), 2);

      const search = page.getByRole('textbox', { name: language === 'Bangla' ? 'অডিট লেনদেন খুঁজুন' : 'Search audit transactions' });
      await search.fill('INV-000239');
      assert.equal(await page.locator('main table tbody tr').count(), 1,
        'Search still filters the ledger');
      assert.ok((await page.getByRole('status').allTextContents()).some((value) => value.includes('1')),
        'Visible record count follows search');
      await search.fill('');
      assert.equal(await page.locator('main table tbody tr').count(), 6);

      if (language === 'Bangla') {
        const sourceColumn = async (reference) => (
          await page.locator('main table tbody tr').filter({ hasText: reference }).locator('td').nth(4).innerText()
        ).trim();
        assert.equal(await sourceColumn('CP-000091'), 'বিক্রি / ক্রেতা',
          'Customer payment source must be localized');
        assert.equal(await sourceColumn('EXP-000062'), 'খরচ',
          'Expense source must be localized');
        assert.equal(await sourceColumn('TRF-000041'), 'টাকার লেনদেন',
          'Finance/transfer source must be localized');
        assert.equal(await sourceColumn('ADJ-000019'), 'হিসাব',
          'Account adjustment source must be localized');
      }

      const rowAction = page.getByRole('button', { name: 'Actions for INV-000239' });
      const table = page.locator('main table');
      const region = table.locator('xpath=..');
      await region.evaluate((element) => { element.scrollLeft = element.scrollWidth; });
      await page.waitForTimeout(100);
      const rect = await rowAction.boundingBox();
      assert.ok(rect && rect.width >= 36 && rect.height >= 36,
        'Row menu uses the 36px control standard');
      assert.ok(rect.x >= 0 && rect.x + rect.width <= width,
        'Row actions are reachable after horizontal scrolling');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        'The ledger must not overflow the document');
      await rowAction.click();
      const menu = page.getByRole('dialog', { name: 'Audit actions for INV-000239' });
      await menu.getByRole('button', { name: language === 'Bangla' ? 'খুলুন' : 'Open', exact: true }).waitFor();
      assert.equal(await menu.getByRole('button').count(), 3,
        'Open, Correct and Delete remain available in the action menu');
      await page.keyboard.press('Escape');
      await menu.waitFor({ state: 'detached' });
      assert.equal(await menu.count(), 0, 'Escape closes the menu');
      assert.deepEqual(errors, [], 'No runtime errors during audit interactions');
      await context.close();
      console.log('Audit refinement PASS', width, language, theme);
    }
  } finally {
    await browser.close();
    await server.close();
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
