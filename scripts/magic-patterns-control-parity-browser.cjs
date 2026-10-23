/* Shared-control visual/keyboard smoke test, reference: Magic Patterns party + sales.
   Run: npm run test:magic-controls. Read-only: never posts sales or changes records. */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

async function main() {
  const { createServer } = await import('vite');
  const server = await createServer({ server: { host: '127.0.0.1', port: 4483, strictPort: true } });
  await server.listen();
  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined,
    args: ['--no-sandbox']
  });
  const errors = [];
  try {
    for (const width of [390, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      page.on('pageerror', error => errors.push(error.message));
      await page.goto('http://127.0.0.1:4483/#/app/sales');
      await page.locator('main').waitFor();
      for (const theme of ['light', 'dark']) {
        await page.evaluate(value => document.documentElement.classList.toggle('dark', value === 'dark'), theme);
        const input = page.locator('input[data-hisabiq-input]:visible').first();
        await input.waitFor();
        await input.focus();
        const focused = await input.evaluate(node => {
          const s = getComputedStyle(node);
          return { border: s.borderColor, radius: s.borderRadius, shadow: s.boxShadow };
        });
        assert.equal(focused.border, theme === 'light' ? 'rgb(13, 124, 116)' : 'rgb(61, 184, 172)',
          `Input must use the shared teal focus border (${width}px, ${theme})`);
        assert.equal(focused.radius, '8px', 'Input corners must match Magic Patterns');
        assert.notEqual(focused.shadow, 'none', 'Input needs the pale focus halo');
        const button = page.locator('[data-hisabiq-button][data-hisabiq-variant="outline"]:visible').first();
        await button.waitFor();
        assert.equal(await button.evaluate(node => getComputedStyle(node).borderRadius), '8px',
          'Shared outline buttons must use the same 8px corners');
      }
      // Page-header context determines visual size; tiny table/menu actions do not grow.
      const pageAction = page.locator('[data-hisabiq-action-context="page"] .hisabiq-button[data-hisabiq-variant="default"]:visible').first();
      await pageAction.waitFor();
      const actionHeight = await pageAction.evaluate(node => node.getBoundingClientRect().height);
      assert.ok(actionHeight >= (width < 640 ? 40 : 44),
        `The page's primary CTA must outrank utility controls at ${width}px (got ${actionHeight}px)`);

      const creditTab = page.getByRole('tab', { name: /customer credit|ক্রেতার জমা/i }).first();
      await creditTab.click();
      const receive = page.getByRole('button', { name: /receive customer payment|ক্রেতার টাকা/i }).first();
      await receive.waitFor();
      assert.ok((await receive.evaluate(node => node.getBoundingClientRect().height)) >= 44,
        'Receiving customer payment must use the prominent contextual size');
      await page.getByRole('tab', { name: /^sales(?:\\s|$)|^বিক্রি/i }).first().click();
      if (width >= 768) {
        // Desktop Sales keeps its existing collapsed-filter behavior.
        const filters = page.getByRole('button', { name: /filters|ফিল্টার/i }).first();
        await filters.click();
        const trigger = page.locator('button[data-hisabiq-select]:visible').first();
        await trigger.waitFor();
        await trigger.focus();
        await trigger.press('Enter');
        const menu = page.locator('[data-hisabiq-select-menu]:visible').first();
        await menu.waitFor();
        assert.equal(await menu.evaluate(node => getComputedStyle(node).borderRadius), '12px',
          'Dropdown popovers must have the rounded Magic Patterns surface');
        await trigger.press('Escape');
        assert.equal(await trigger.getAttribute('aria-expanded'), 'false', 'Escape closes select');
        assert.equal(await trigger.evaluate(node => document.activeElement === node), true,
          'Closing a select preserves keyboard focus on its trigger');
      }
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      assert.ok(overflow <= 2, `Sales must not overflow at ${width}px: ${overflow}`);
      await page.close();
    }
    assert.deepEqual(errors, [], 'No runtime errors during shared-control visual checks');
    console.log('Magic Patterns shared-control style checks passed: 390/1440px, light/dark, focus and select keyboard.');
  } finally {
    await browser.close();
    await server.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
