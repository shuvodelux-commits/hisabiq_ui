/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires -- focused browser regression runner */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');
const { expect } = require('playwright/test');
const base = process.env.PARTY_LEDGER_URL || 'http://127.0.0.1:4311';
const out = process.env.PARTY_LEDGER_EVIDENCE || '/tmp/party-ledger-round1';
const results = [];
async function check(name, fn) {
  try { await fn(); results.push({ name, status: 'passed' }); }
  catch (error) { results.push({ name, status: 'failed', error: error.message }); }
}
async function main() {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  try {
    for (const width of [320, 390, 1440]) for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      await context.addInitScript(theme => localStorage.setItem('hisabiq-theme', theme), theme);
      const page = await context.newPage();
      await page.goto(base + '/#/app/parties?id=c1&role=Customer');
      await page.getByRole('textbox', { name: 'Search ledger transactions' }).waitFor();
      await page.evaluate(() => document.fonts.ready);
      await check(`${width}-${theme} selected count contrast`, async () => {
        const contrast = await page.locator('[role="tab"][aria-selected="true"] [data-testid="party-tab-count"]').evaluate(node => {
          const rgb = value => value.match(/[\d.]+/g).map(Number);
          const style = getComputedStyle(node), foreground = rgb(style.color), background = rgb(style.backgroundColor);
          const parent = rgb(getComputedStyle(node.closest('.bg-card')).backgroundColor);
          const alpha = background[3] ?? 1;
          const blended = background.slice(0, 3).map((v, i) => v * alpha + parent[i] * (1 - alpha));
          const luminance = color => color.slice(0, 3).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
          const values = [luminance(foreground), luminance(blended)].sort((a, b) => a - b);
          return (values[1] + .05) / (values[0] + .05);
        });
        assert.ok(contrast >= 4.5, `selected badge contrast ${contrast.toFixed(2)}:1`);
      });
      if (width === 1440) await check(`${theme} desktop directory keyboard`, async () => {
        const search = page.getByRole('textbox', { name: 'Search parties', exact: true });
        await search.fill('Hossain');
        const option = page.getByRole('option').filter({ hasText: 'Hossain Electric' });
        await search.press('ArrowDown'); await expect(option).toBeFocused();
        await page.keyboard.press('Enter'); await expect(page).toHaveURL(/id=c2&role=Customer/);
        await search.fill(''); await search.press('ArrowDown');
        await page.keyboard.press('End'); await expect(page.getByRole('option').last()).toBeFocused();
        await page.keyboard.press('Home'); await expect(page.getByRole('option').first()).toBeFocused();
        assert.equal(await page.locator('[data-party-directory-list] [role="option"][tabindex="0"]').count(), 1);
        const group = page.getByRole('group', { name: 'Filter by role' });
        const customer = group.getByRole('button', { name: 'Customer', exact: true });
        await customer.focus(); await page.keyboard.press('Enter');
        await expect(customer).toHaveAttribute('aria-pressed', 'true');
      });
      if (width < 768) {
        await check(`${width}-${theme} mobile identity appears once`, async () => {
          const duplicates = await page.locator('ul[data-erp-table-view] > li').evaluateAll(rows => rows.flatMap(row => {
            const texts = [...row.querySelectorAll('button p')].map(node => node.textContent.trim()).filter(Boolean);
            return texts.filter((text, i) => texts.indexOf(text) !== i);
          }));
          assert.deepEqual(duplicates, []);
        });
        await check(`${width}-${theme} complete large money and meaning`, async () => {
          await page.goto(base + '/#/app/parties?id=py1&role=Payee');
          await page.getByRole('button', { name: 'Opening balance', exact: true }).click();
          const dialog = page.getByRole('dialog', { name: 'Party opening balance', exact: true });
          await dialog.getByRole('textbox', { name: 'Opening balance amount' }).fill('1234567890123.45');
          await dialog.getByRole('radio').last().check();
          await dialog.getByRole('button', { name: 'Save opening balance', exact: true }).click();
          await expect(dialog).toBeHidden();
          const card = page.getByTestId('party-balance-card').filter({ visible: true });
          const sizes = await card.evaluate(node => {
            const title = node.querySelector('p'), helper = node.querySelector('[data-testid="party-balance-helper"]');
            return { width: node.clientWidth, scroll: node.scrollWidth, title: title.getBoundingClientRect().width, helper: helper.getBoundingClientRect().width };
          });
          assert.ok(sizes.scroll <= sizes.width + 1 && sizes.title >= 140 && sizes.helper >= 140, JSON.stringify(sizes));
          const summary = page.locator('[aria-label="Ledger summary"]:visible strong').last();
          const lines = await summary.evaluate(node => {
            const range = document.createRange(); range.selectNodeContents(node);
            return new Set([...range.getClientRects()].map(rect => Math.round(rect.y))).size;
          });
          assert.equal(lines, 1, 'full period amount stays on one line');
          await expect(card).toContainText('12,34,56,78,90,123.45');
          const row = page.locator('ul[data-erp-table-view] > li').first();
          const date = await row.getByText(/^\d{4}-\d{2}-\d{2}$/).boundingBox();
          const money = await row.getByTestId('ledger-money-value').boundingBox();
          assert.ok(date.y + date.height <= money.y || money.y + money.height <= date.y || date.x + date.width <= money.x, 'large row money does not overlap its date');
          await expect(page.locator('[data-sonner-toast]')).toBeHidden({ timeout: 10000 });
          await page.screenshot({ path: `${out}/${width}-${theme}-large-money.png`, fullPage: true });
        });
      }
      await context.close();
    }
  } finally { await browser.close(); }
  fs.writeFileSync(`${out}/results.json`, JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
  if (results.some(result => result.status === 'failed')) process.exitCode = 1;
}
main().catch(error => { console.error(error); process.exitCode = 1; });
