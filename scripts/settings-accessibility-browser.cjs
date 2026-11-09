/* Existing Settings preview state: keyboard, errors and tab/panel associations. */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const base = process.env.SETTINGS_BASE_URL || 'http://127.0.0.1:39953';
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const failures = [];
  const check = (ok, message) => { if (!ok) failures.push(message); };
  try {
    for (const width of [390, 1024]) for (const theme of ['light', 'dark']) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      const go = async route => {
        await page.goto(base + '/#/app/settings/' + route, { waitUntil: 'networkidle' });
        await page.locator('[data-settings-magic-patterns]').waitFor();
        await page.evaluate(t => document.documentElement.classList.toggle('dark', t === 'dark'), theme);
      };
      const associated = async field => field.evaluate(el => {
        const described = (el.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
        const error = document.getElementById(el.getAttribute('aria-errormessage'));
        return el.getAttribute('aria-invalid') === 'true' && described.length > 0 && described.every(id => document.getElementById(id)) && !!error && described.some(id => document.getElementById(id).contains(error));
      });
      await go('business');
      const name = page.getByLabel('Business name', { exact: true });
      const phone = page.getByLabel('Business mobile', { exact: true });
      await name.fill(''); await phone.fill('01');
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await page.waitForTimeout(100);
      check(await associated(name), `${width}/${theme} business error associated`);
      check(await associated(phone), `${width}/${theme} phone error associated`);
      check(await name.evaluate(el => el === document.activeElement), `${width}/${theme} first invalid field focused`);
      await name.fill('Nawabpur Hardware House');
      check(await name.getAttribute('aria-invalid') !== 'true', `${width}/${theme} corrected name clears invalid state`);
      assert.equal(await phone.inputValue(), '01', 'Editing one field preserves other invalid draft input');
      await go('sales');
      await page.getByRole('button', { name: 'Show advanced options', exact: true }).click();
      const discount = page.getByLabel('Biggest discount staff can give (%)', { exact: true });
      await discount.fill('101');
      await page.getByRole('button', { name: 'Hide advanced options', exact: true }).click();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await page.waitForTimeout(100);
      check(await discount.count() > 0, `${width}/${theme} invalid advanced field revealed`);
      if (await discount.count()) {
        check(await associated(discount), `${width}/${theme} advanced numeric error associated`);
        check(await discount.evaluate(el => el === document.activeElement), `${width}/${theme} advanced error focused`);
        assert.equal(await discount.inputValue(), '101');
      }
      if (process.env.SETTINGS_EVIDENCE_DIR) await page.screenshot({ path: path.join(process.env.SETTINGS_EVIDENCE_DIR, `round-2-error-${width}-${theme}.png`), fullPage: true });
      await go('interface');
      const trigger = page.getByRole('button', { name: 'Module', exact: true });
      await trigger.click();
      const search = page.getByLabel('Search modules', { exact: true });
      check(await search.getAttribute('role') === 'combobox', `${width}/${theme} search combobox role`);
      check(await search.evaluate(el => document.getElementById(el.getAttribute('aria-controls'))?.getAttribute('role') === 'listbox'), `${width}/${theme} controlled module list`);
      const pageScroll = await page.evaluate(() => scrollY);
      for (let i = 0; i < 30; i++) await search.press('ArrowDown');
      check(await search.evaluate(el => {
        const active = document.getElementById(el.getAttribute('aria-activedescendant'));
        if (!active) return false;
        const a = active.getBoundingClientRect(), l = active.closest('[role="listbox"]').getBoundingClientRect();
        return active.getAttribute('role') === 'option' && a.top >= l.top - 1 && a.bottom <= l.bottom + 1;
      }), `${width}/${theme} active module exposed and scrolled into view`);
      check(await page.evaluate(() => scrollY) === pageScroll, `${width}/${theme} option movement keeps page scroll`);
      await search.fill('no module matches this'); await search.press('ArrowDown'); await search.press('Enter');
      check(await search.getAttribute('aria-activedescendant') === null, `${width}/${theme} empty results have no active descendant`);
      await search.fill('Products'); await search.press('Enter');
      check(await trigger.evaluate(el => el === document.activeElement), `${width}/${theme} Enter restores trigger focus`);
      assert.match(await trigger.innerText(), /Products/);
      await trigger.click(); await search.press('Escape');
      check(await trigger.evaluate(el => el === document.activeElement), `${width}/${theme} Escape restores trigger focus`);
      await trigger.click(); await search.fill('Sales');
      await page.getByRole('listbox', { name: 'Modules' }).getByRole('button', { name: /^Sales/ }).click();
      check(await trigger.evaluate(el => el === document.activeElement), `${width}/${theme} pointer selection restores trigger focus`);
      assert.match(await trigger.innerText(), /Sales/);
      await page.getByRole('button', { name: 'Preview', exact: true }).click();
      const tabs = page.getByRole('tablist', { name: 'Preview size' });
      const panel = async () => {
        const tab = tabs.locator('[aria-selected="true"]');
        return tab.evaluate(el => {
          const panel = document.getElementById(el.getAttribute('aria-controls'));
          return !!el.id && panel?.getAttribute('role') === 'tabpanel' && panel.getAttribute('aria-labelledby') === el.id;
        });
      };
      check(await panel(), `${width}/${theme} desktop tab panel associated`);
      await tabs.getByRole('tab', { name: 'Desktop', exact: true }).press('End');
      check(await panel(), `${width}/${theme} keyboard-selected mobile panel associated`);
      assert.ok(await page.getByText(/Other fields open with/).count());
      await tabs.getByRole('tab', { name: 'Tablet', exact: true }).click();
      check(await panel(), `${width}/${theme} pointer-selected tablet panel associated`);
      assert.ok(await page.locator('table[data-erp-table]').count());
      if (process.env.SETTINGS_EVIDENCE_DIR) await page.screenshot({ path: path.join(process.env.SETTINGS_EVIDENCE_DIR, `round-2-preview-${width}-${theme}.png`), fullPage: true });
      await page.close();
    }
  } finally { await browser.close(); }
  console.log(JSON.stringify({ failures }, null, 2));
  assert.equal(failures.length, 0, 'Settings accessibility regressions');
})().catch(error => { console.error(error); process.exitCode = 1; });
