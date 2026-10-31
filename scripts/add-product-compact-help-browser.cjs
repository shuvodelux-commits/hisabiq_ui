/* Add Product compact labels: touch/keyboard help, required state and mobile layout. */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');

async function main() {
  const { createServer } = await import('vite');
  const server = await createServer({ server: { host: '127.0.0.1', port: 4482, strictPort: true } });
  await server.listen();
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined, args: ['--no-sandbox'] });
  try {
    fs.mkdirSync('test-results/add-product-help', { recursive: true });
    for (const { width, height, language, scheme } of [
      { width: 390, height: 844, language: 'English', scheme: 'light' },
      { width: 390, height: 844, language: 'Bangla', scheme: 'dark' },
      { width: 1280, height: 900, language: 'English', scheme: 'dark' },
      { width: 1280, height: 900, language: 'English + Bangla', scheme: 'light' }
    ]) {
      const context = await browser.newContext({ viewport: { width, height }, colorScheme: scheme, hasTouch: width < 768, reducedMotion: 'reduce' });
      const errors = [];
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript(({ language, scheme }) => {
        localStorage.setItem('hisabiq-erp-personal-v1', JSON.stringify({ mode: 'Simple', language, density: 'Compact', terminology: 'simple', dateView: 'transaction' }));
        localStorage.setItem('hisabiq-theme', scheme);
      }, { language, scheme });
      await page.goto('http://127.0.0.1:4482/#/app/products');
      await page.getByRole('button', { name: language === 'Bangla' ? 'নতুন পণ্য' : 'Add product', exact: true }).click();
      const editor = page.locator('[data-product-editor]');
      await editor.waitFor();
      await editor.locator('#pf-sell').waitFor();

      assert.match(await editor.locator('#pf-name-label').innerText(), /\*/);
      assert.match(await editor.locator('#pf-sell-label').innerText(), /\*/);
      assert.match(await editor.locator('#pf-buy-label').innerText(), language === 'Bangla' ? /ঐচ্ছিক/ : /optional/);
      assert.match(await editor.locator('#pf-min-label').innerText(), language === 'Bangla' ? /ঐচ্ছিক/ : /optional/);
      assert.ok(!(await editor.innerText()).includes('Optional. We warn you when stock falls to this.'), 'explanation does not take a permanent row');
      assert.equal(await editor.locator('#pf-advanced-button').getAttribute('aria-expanded'), 'false');

      const helpName = language === 'Bangla' ? 'বিক্রয় মূল্য সম্পর্কে সাহায্য' : 'Help for Selling price';
      const help = editor.getByRole('button', { name: helpName, exact: true });
      if (width < 768) await help.tap(); else await help.click();
      const tooltip = page.getByRole('tooltip');
      await tooltip.waitFor({ state: 'visible' });
      assert.match(await tooltip.innerText(), language === 'Bangla' ? /সাধারণ দাম/ : /Normal price/);
      const bounds = await tooltip.boundingBox();
      assert.ok(bounds && bounds.x >= 0 && bounds.x + bounds.width <= width + 1, 'tooltip stays inside viewport');
      assert.equal(await editor.locator('#pf-advanced-button').getAttribute('aria-expanded'), 'false', 'tooltip does not expand advanced stock');
      await help.press('Escape');
      await tooltip.waitFor({ state: 'hidden' });

      await editor.locator('#pf-buy').fill('120');
      await editor.locator('#pf-sell').fill('180');
      assert.equal(await editor.locator('#pf-buy').inputValue(), '120');
      assert.equal(await editor.locator('#pf-sell').inputValue(), '180');

      await page.screenshot({ path: `test-results/add-product-help/${width}-${language.replace(/\W/g, '-')}-${scheme}.png`, fullPage: true });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'no horizontal page overflow');
      assert.deepEqual(errors, [], language + ' ' + width + ' page errors');
      await context.close();
      console.log('Compact Add Product help: ' + language + ' @ ' + width + 'px (' + scheme + ') passed');
    }
  } finally {
    await browser.close();
    await server.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
