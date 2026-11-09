/* Presentation regression for the existing Magic Settings shell. Uses real UI previews only. */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.SETTINGS_BASE_URL || 'http://127.0.0.1:39953';
const failures = [];
const check = (condition, message, detail) => {
  if (!condition) failures.push({ message, detail });
};
function contrast(a, b) {
  const luminance = color => {
    const c = color.match(/[\d.]+/g).slice(0, 3).map(Number).map(x => {
      x /= 255;
      return x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4;
    });
    return c[0] * .2126 + c[1] * .7152 + c[2] * .0722;
  };
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
}
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  try {
    for (const width of [320, 390, 768, 1024, 1440]) for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, hasTouch: width < 1024, reducedMotion: 'reduce' });
      const page = await context.newPage();
      const go = async route => {
        await page.goto(base + '/#/app/settings' + route, { waitUntil: 'networkidle' });
        await page.locator('[data-settings-magic-patterns]').waitFor();
        await page.evaluate(dark => document.documentElement.classList.toggle('dark', dark), theme === 'dark');
        await page.evaluate(() => document.fonts.ready);
      };
      const pair = locator => locator.evaluate(el => ({ color: getComputedStyle(el).color, bg: getComputedStyle(el).backgroundColor, height: el.getBoundingClientRect().height }));
      const readable = async (locator, name) => {
        const p = await pair(locator);
        check(contrast(p.color, p.bg) >= 4.5, `${width}/${theme} ${name} contrast >=4.5`, p);
        check(p.height === 36, `${width}/${theme} ${name} remains 36px`, p);
      };
      // Test actual paint ordering at the decorative glyph's position, while
      // temporarily enabling hit-testing; restoring it preserves input clicks.
      const visibleGlyph = async (input, name) => {
        await input.scrollIntoViewIfNeeded();
        const visible = await input.evaluate(el => {
          const svg = el.closest('span').parentElement.querySelector('svg.lucide-search');
          const old = svg.style.pointerEvents;
          svg.style.pointerEvents = 'auto';
          const r = svg.getBoundingClientRect();
          const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
          svg.style.pointerEvents = old;
          return top === svg || svg.contains(top);
        });
        check(visible, `${width}/${theme} ${name} glyph paints above input`);
      };
      const shortPlaceholder = async (input, name) => {
        const fits = await input.evaluate(el => {
          const s = getComputedStyle(el), canvas = document.createElement('canvas');
          const context = canvas.getContext('2d'); context.font = s.font;
          return context.measureText(el.placeholder).width <= el.clientWidth - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight);
        });
        check(fits, `${width}/${theme} ${name} placeholder fits`);
      };
      await go('');
      const setup = page.getByRole('button', { name: 'Start guided setup', exact: true });
      const geometry = await setup.evaluate(el => {
        const section = el.closest('section'), copy = section.querySelector('p').parentElement;
        return { bannerHeight: section.getBoundingClientRect().height, copyWidth: copy.getBoundingClientRect().width,
          buttonTop: el.getBoundingClientRect().top, copyBottom: copy.getBoundingClientRect().bottom };
      });
      if (width < 640) check(geometry.copyWidth >= 160 && geometry.bannerHeight < 210 && geometry.buttonTop >= geometry.copyBottom,
        `${width}/${theme} compact banner has readable copy and deliberate CTA row`, geometry);
      await readable(setup, 'guided setup');
      await readable(page.getByRole('link', { name: /^Next:/ }), 'next action');
      const backup = await pair(page.getByRole('button', { name: 'Settings backup', exact: true }));
      const primary = await pair(setup);
      check(backup.bg !== primary.bg, `${width}/${theme} backup is secondary`, backup);
      const goal = page.getByLabel('Search settings by goal', { exact: true });
      const directory = page.getByRole('textbox', { name: 'Search settings', exact: true });
      for (const [input, name, query] of [[goal, 'goal', 'রসিদ'], [directory, 'directory', 'stock']]) {
        await visibleGlyph(input, name); await shortPlaceholder(input, name);
        await input.fill(query); await visibleGlyph(input, name + ' typed');
        if (name === 'goal') assert.ok(await page.locator('section[aria-label="Search settings"] li').count() > 0);
        else assert.equal(await page.locator('[data-settings-directory] a').count(), 1);
        await page.getByRole('button', { name: 'Clear ' + await input.getAttribute('aria-label'), exact: true }).click();
        assert.equal(await input.inputValue(), ''); assert.equal(await input.evaluate(el => el === document.activeElement), true);
        await visibleGlyph(input, name + ' cleared');
      }
      await setup.click();
      const dialog = page.getByRole('dialog', { name: 'Set up your shop' });
      await readable(dialog.getByRole('link', { name: /^Open Shop details/ }), 'wizard link');
      await page.keyboard.press('Escape');
      await go('/interface');
      await page.getByRole('button', { name: 'Module', exact: true }).click();
      const modules = page.getByLabel('Search modules', { exact: true });
      await visibleGlyph(modules, 'module'); await modules.fill('sales'); await visibleGlyph(modules, 'module typed');
      await page.getByRole('button', { name: 'Clear Search modules', exact: true }).click();
      assert.equal(await modules.inputValue(), ''); await visibleGlyph(modules, 'module cleared');
      await page.keyboard.press('Escape');
      await go('/invoices');
      await page.getByRole('radiogroup', { name: 'Invoice design', exact: true }).getByRole('radio').filter({ hasText: 'Premium' }).first().click();
      const invoicePrimary = page.getByRole('dialog', { name: 'Premium invoice designs' }).locator('button.ref-button-primary:visible');
      assert.ok(await invoicePrimary.count() > 0);
      for (const button of await invoicePrimary.all()) await readable(button, 'invoice primary');
      await context.close();
    }
  } finally { await browser.close(); }
  console.log(JSON.stringify({ failures }, null, 2));
  assert.equal(failures.length, 0, 'Settings presentation defects must be resolved');
  console.log('Settings refinement: banner, contrast, hierarchy, search paint order, query/clear/focus passed across five widths and both themes.');
})().catch(error => { console.error(error); process.exitCode = 1; });
