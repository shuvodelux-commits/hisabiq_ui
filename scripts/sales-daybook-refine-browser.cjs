/* Sales invoice list: approved Daybook compact filter + action + Reset behavior. */
'use strict';
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { expect } = require('playwright/test');

async function main() {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const baseUrl = process.env.SALES_DAYBOOK_URL || 'http://127.0.0.1:4311';
  try {
    for (const width of [320, 390, 768, 820, 1024, 1440]) {
      for (const theme of ['light', 'dark']) {
        const phone = width < 768;
        const tablet = width >= 768 && width < 1024;
        const context = await browser.newContext({
          viewport: { width, height: width === 320 ? 710 : 900 },
          colorScheme: theme,
          reducedMotion: 'reduce',
          hasTouch: width < 1024,
          isMobile: phone
        });
        await context.addInitScript(t => {
          localStorage.setItem('hisabiq-theme', t);
          localStorage.setItem('theme', t);
          localStorage.setItem('hisabiq-erp-personal-v1', JSON.stringify({
            mode: 'Simple', language: 'English', density: 'Compact', terminology: 'simple', dateView: 'transaction'
          }));
        }, theme);
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        try {
          await page.goto(baseUrl + '/#/app/sales', { waitUntil: 'networkidle' });
          await expect(page.getByRole('heading', { name: /^Sales/ })).toBeVisible();
          const search = page.getByRole('textbox', { name: 'Search sales' });
          await expect(search).toBeVisible();
          const toggle = page.locator('[data-sales-filter-toggle]').first();
          const group = page.locator('[data-sales-status-reset]:visible').first();
          if (width < 1024) {
            await expect(toggle).toBeVisible();
            await expect(toggle).toHaveAttribute('aria-expanded', 'false');
            const tb = await toggle.boundingBox();
            assert(tb && tb.width >= 35 && tb.width <= 38 && tb.height >= 35 && tb.height <= 38,
              'phone/tablet Filter must remain a 36px square');
            const action = page.locator(phone
              ? '.sales-mobile-record-actions button[aria-label^="Actions for"]'
              : 'tbody button[aria-label^="Actions for"]').first();
            await expect(action).toBeVisible();
            const ab = await action.boundingBox();
            assert(ab && ab.x >= 0 && ab.x + ab.width <= width + 1,
              'invoice action must remain fully visible without horizontal table scrolling');
            assert(Math.abs((tb.x + tb.width) - (ab.x + ab.width)) <= 12,
              'Filter right edge should align with the invoice action right edge');
            const sb = await search.boundingBox();
            assert(sb && Math.abs(sb.y - tb.y) <= 6 && sb.x + sb.width < tb.x,
              'Search and compact Filter remain in the same primary row');
            if (phone) {
              await expect(page.getByRole('button', { name: 'List actions' })).toBeVisible();
              await expect(page.getByText(/Clear filters/i)).toHaveCount(0);
            } else assert(tablet);
            await toggle.click();
            await expect(toggle).toHaveAttribute('aria-expanded', 'true');
          } else {
            await expect(toggle).toBeHidden();
          }
          await expect(group).toBeVisible();
          const status = group.getByRole('combobox').first();
          const reset = group.getByRole('button', { name: 'Reset sales filters' });
          await expect(status).toHaveAttribute('data-value', 'All status');
          await expect(reset).toBeVisible();
          const st = await status.boundingBox(), rb = await reset.boundingBox();
          assert(st && rb && Math.abs(st.y - rb.y) <= 7 &&
            rb.x >= st.x + st.width - 2 && rb.width >= 35 && rb.width <= 38,
            'Reset icon must be directly beside the Status combobox in the same row');
          await status.click();
          await page.getByRole('option', { name: 'Due', exact: true }).click();
          await expect(status).toHaveAttribute('data-value', 'Due');
          await search.fill('UNKNOWN-SALE-99999');
          await reset.focus();
          await page.keyboard.press('Enter');
          await expect(search).toHaveValue('');
          await expect(status).toHaveAttribute('data-value', 'All status');
          if (width < 1024) {
            await toggle.click();
            await expect(group).toBeHidden();
          }
          assert.deepEqual(errors, [], 'no Sales page runtime exceptions');
          console.log('PASS Sales Daybook filter pattern', width, theme);
        } finally {
          await context.close();
        }
      }
    }
  } finally {
    await browser.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
