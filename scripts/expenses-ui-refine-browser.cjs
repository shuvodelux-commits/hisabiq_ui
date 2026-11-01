/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires -- Playwright CI check uses CommonJS. */
'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');

async function main() {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const origin = process.env.UI_REFINE_PR_URL || 'http://127.0.0.1:4311';
  const shotsDir = 'test-results/expenses-ui-refine';
  await fs.mkdir(shotsDir, { recursive: true });
  let checked = 0;
  try {
    for (const width of [320, 390, 768, 1024, 1440]) {
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
          await page.screenshot({ path: shotsDir + '/final-' + width + '-' + theme + '.png', fullPage: true, animations: 'disabled' });
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

          if (width <= 1024) {
            const reset = await page.getByRole('button', { name: 'Reset', exact: true }).boundingBox();
            const exportButton = await page.getByRole('button', { name: 'Export', exact: true }).boundingBox();
            assert.ok(reset && exportButton, 'Reset and Export must remain available');
            assert.ok(Math.abs(reset.y - exportButton.y) < 2, 'Reset and Export are no longer on one row');
          }

          if (width < 1280) {
            const filters = page.getByRole('button', { name: 'Filters', exact: true });
            assert.equal(await filters.getAttribute('aria-expanded'), 'false', 'Extra filters must start collapsed on phones/tablets');
            await filters.click();
            assert.equal(await filters.getAttribute('aria-expanded'), 'true');
          }
          const searchRect = await page.getByPlaceholder('Search expense, payee, category or reference').boundingBox();
          const categoryRect = await page.getByRole('combobox', { name: 'Expense category filter', exact: true }).boundingBox();
          assert.ok(searchRect && categoryRect, 'Search and category filter must exist');
          const overlaps = searchRect.x < categoryRect.x + categoryRect.width
            && searchRect.x + searchRect.width > categoryRect.x
            && searchRect.y < categoryRect.y + categoryRect.height
            && searchRect.y + searchRect.height > categoryRect.y;
          assert.equal(overlaps, false, width + 'px: search input blocks category filter');
          await page.getByRole('combobox', { name: 'Expense category filter', exact: true }).click();
          await page.getByRole('option', { name: 'Salary', exact: true }).click();
          assert.equal(await page.locator('tbody tr').count(), 1, 'Category filter should narrow the existing expense list');
          await page.getByRole('button', { name: 'Reset', exact: true }).click();
          assert.ok((await page.locator('tbody tr').count()) >= 6, 'Reset should restore the original expenses');

          // Verify horizontal scrolling leaves the row action reachable,
          // including in Categories and Payees, as in the Audit Ledger.
          async function verifySticky(tabName, triggerName) {
            if (tabName) await page.getByRole('tab', { name: tabName, exact: true }).click();
            const table = page.locator('table').first();
            const scroll = table.locator('xpath=ancestor::div[contains(@class,"overflow-x-auto")][1]');
            const action = page.getByRole('columnheader', { name: 'Action', exact: true });
            const trigger = page.getByRole('button', { name: triggerName }).first();
            const start = await action.boundingBox();
            assert.ok(start && start.x >= 0 && start.x + start.width <= width + 1, 'Pinned Action header clipped');
            const overflow = await scroll.evaluate(el => ({ total: el.scrollWidth, visible: el.clientWidth }));
            if (width <= 390) assert.ok(overflow.total > overflow.visible, tabName + ': table must scroll sideways on phones');
            await scroll.evaluate(el => { el.scrollLeft = el.scrollWidth; el.dispatchEvent(new Event('scroll')); });
            const end = await action.boundingBox();
            assert.ok(end && Math.abs(start.x - end.x) < 3, 'Action header must stay fixed on sideways scroll');
            const button = await trigger.boundingBox();
            assert.ok(button && button.x >= 0 && button.x + button.width <= width + 1, 'Action menu not reachable');
            await trigger.click();
            await page.getByRole('dialog', { name: /Actions for/ }).last().waitFor({ state: 'visible' });
            await page.keyboard.press('Escape');
          }
          await verifySticky(null, 'Actions for EXP-000061');
          await verifySticky('Categories', 'Actions for category');
          await verifySticky('Payees', 'Actions for payee');
          await page.getByRole('tab', { name: 'Expense list' }).click();

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
