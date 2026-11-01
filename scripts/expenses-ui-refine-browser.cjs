/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires -- Playwright CI check uses CommonJS. */
'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');

async function main() {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const origin = process.env.UI_REFINE_PR_URL || 'http://127.0.0.1:4311';
  let checked = 0;
  try {
    for (const width of [320, 390, 768, 1440]) {
      for (const theme of ['light', 'dark']) {
        const context = await browser.newContext({
          viewport: { width, height: 900 },
          hasTouch: width <= 768,
          reducedMotion: 'reduce',
          colorScheme: theme
        });
        try {
          await context.addInitScript(value => {
            localStorage.setItem('hisabiq-theme', value);
            localStorage.setItem('theme', value);
          }, theme);
          const page = await context.newPage();
          const errors = [];
          page.on('pageerror', error => errors.push(error.message));
          await page.goto(origin + '/#/app/expenses', { waitUntil: 'networkidle' });
          const tablist = page.getByRole('tablist', { name: 'Expense sections' });
          const tabs = tablist.getByRole('tab');
          assert.equal(await tabs.count(), 4, 'Expected all four original Expenses tabs');
          const rects = await tabs.evaluateAll(elements => elements.map(element => {
            const r = element.getBoundingClientRect();
            return { top: r.top, left: r.left, right: r.right, height: r.height };
          }));
          assert.ok(Math.max(...rects.map(r => r.top)) - Math.min(...rects.map(r => r.top)) < 2, width + 'px: tabs wrapped to another line');
          if (width === 320) {
            assert.ok(rects[3].right <= width - 8, 'Reports tab not fully visible on 320px phone');
            assert.ok(rects[0].left >= 0, 'First tab clipped on 320px phone');
          }
          await tabs.nth(0).focus();
          await page.keyboard.press('ArrowRight');
          assert.equal(await tabs.nth(1).getAttribute('aria-selected'), 'true', 'ArrowRight did not activate Categories');
          assert.equal(await tabs.nth(1).evaluate(el => el === document.activeElement), true, 'ArrowRight did not move focus');
          await page.keyboard.press('End');
          assert.equal(await tabs.nth(3).getAttribute('aria-selected'), 'true', 'End did not activate Reports');
          await page.keyboard.press('Home');
          assert.equal(await tabs.nth(0).getAttribute('aria-selected'), 'true', 'Home did not restore Expenses');

          if (width <= 768) {
            const reset = await page.getByRole('button', { name: 'Reset', exact: true }).boundingBox();
            const exportButton = await page.getByRole('button', { name: 'Export', exact: true }).boundingBox();
            assert.ok(reset && exportButton, 'Reset and Export must remain available');
            assert.ok(Math.abs(reset.y - exportButton.y) < 2, 'Reset and Export are no longer on one row');
          }

          await page.getByRole('combobox', { name: 'Expense category filter', exact: true }).click();
          await page.getByRole('option', { name: 'Salary', exact: true }).click();
          assert.equal(await page.locator('tbody tr').count(), 1, 'Category filter should narrow the existing expense list');
          await page.getByRole('button', { name: 'Reset', exact: true }).click();
          assert.ok((await page.locator('tbody tr').count()) >= 6, 'Reset should restore the original expenses');

          await page.getByRole('button', { name: 'Add expense', exact: true }).click();
          await page.getByRole('dialog', { name: 'Add expense', exact: true }).waitFor({ state: 'visible' });
          await page.keyboard.press('Escape');
          await page.getByRole('dialog', { name: 'Add expense', exact: true }).waitFor({ state: 'hidden' });
          assert.deepEqual(errors, [], 'Browser page errors');
          checked += 1;
        } finally {
          await context.close();
        }
      }
    }
  } finally {
    await browser.close();
  }
  console.log('Expenses UI refine interaction matrix passed for ' + checked + ' viewport/theme combinations.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
