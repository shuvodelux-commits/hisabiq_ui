/* Sabab popup-motion parity in the real POS/Purchase product search.
 * Does not submit any sale or purchase.
 */
'use strict';
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { expect } = require('playwright/test');

async function captureFramesBeforeOpening(page) {
  await page.evaluate(() => {
    window.__posSuggestionFrames = [];
    const observer = new MutationObserver(() => {
      const popup = document.querySelector('[data-sabab-pos-suggestions]');
      if (!popup) return;
      observer.disconnect();
      let frame = 0;
      const sample = () => {
        const style = getComputedStyle(popup);
        if (style.visibility === 'visible') {
          window.__posSuggestionFrames.push({
            opacity: Number(style.opacity),
            transform: style.transform
          });
          frame += 1;
        }
        if (frame < 12) requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    observer.observe(document.body, {childList: true, subtree: true});
  });
}

async function checkProductPicker(page, width, reduced, kind) {
  const name = kind === 'purchase' ? 'Search product to add to purchase' : 'Add product';
  const input = page.getByRole('combobox', { name, exact: true }).first();
  await expect(input).toBeVisible();
  // POS may auto-focus its Add Product input on mount; start with a known closed state.
  await input.press('Escape');
  await expect(page.locator('#pos-product-list:visible')).toBeHidden();
  await captureFramesBeforeOpening(page);
  await input.click();
  const popup = page.locator('#pos-product-list:visible');
  await expect(popup).toBeVisible();
  await expect(input).toHaveAttribute('aria-expanded', 'true');
  await expect(popup).toHaveAttribute('role', 'listbox');
  await expect(popup).toHaveAttribute('data-reduced-motion', reduced ? 'true' : 'false');
  const box = await popup.boundingBox();
  const vp = page.viewportSize();
  assert(box && vp && box.x >= -1 && box.y >= -1 &&
    box.x + box.width <= vp.width + 1 && box.y + box.height <= vp.height + 1,
    kind + ': popup must be clamped to viewport at ' + width);
  await page.waitForFunction(() => (window.__posSuggestionFrames?.length ?? 0) >= 12);
  const frames = await page.evaluate(() => window.__posSuggestionFrames);
  const finalOpacity = await popup.evaluate(el => Number(getComputedStyle(el).opacity));
  assert(finalOpacity > 0.98, kind + ': dropdown ends fully visible');
  if (!reduced) {
    assert(frames.some(frame => frame.opacity < 0.98), kind + ': real fade frames occur');
    assert(frames.some(frame => frame.transform !== 'none' && frame.transform !== 'matrix(1, 0, 0, 1, 0, 0)'),
      kind + ': real transform frames occur');
  } else {
    assert(frames.every(frame => frame.opacity >= 0.98),
      kind + ': reduced motion skips visible opacity fades');
  }
  await expect(popup.getByRole('option').first()).toBeVisible();
  await input.press('ArrowDown');
  await expect(input).toHaveAttribute('aria-activedescendant', /pos-product-option-/);
  await input.press('Escape');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await expect(popup).toBeHidden();
  await expect(input).toBeFocused();
  // A quick reopened popup must never use stale geometry.
  await input.focus();
  await input.click();
  await expect(popup).toBeVisible();
  await input.press('Escape');
  await expect(popup).toBeHidden();
}

async function main() {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const base = process.env.POS_COMBOBOX_MOTION_URL || 'http://127.0.0.1:4311';
  const cases = [320, 390, 768, 1024, 1440].flatMap(width =>
    ['light', 'dark'].map(theme => ({width, theme, reduced: width === 390 || width === 1024})));
  try {
    for (const item of cases) {
      const ctx = await browser.newContext({
        viewport: {width:item.width,height:item.width===1024?768:item.width===768?1024:900},
        colorScheme:item.theme,reducedMotion:item.reduced?'reduce':'no-preference',
        isMobile:item.width<768,hasTouch:item.width<=768
      });
      await ctx.addInitScript(theme => {
        localStorage.setItem('hisabiq-theme',theme);
        localStorage.setItem('theme',theme);
        localStorage.setItem('hisabiq-erp-personal-v1', JSON.stringify({
          mode:'Simple', language:'English',density:'Compact', terminology:'simple',dateView:'transaction'
        }));
      },item.theme);
      const page = await ctx.newPage(), errors = [];
      page.on('pageerror', err => errors.push(err.message));
      try {
        await page.goto(base+'/#/app/pos', {waitUntil:'networkidle'});
        await checkProductPicker(page,item.width,item.reduced,'sale');
        if ([390,768,1024,1440].includes(item.width) && item.theme==='light') {
          await page.goto(base+'/#/app/purchases/new',{waitUntil:'networkidle'});
          await checkProductPicker(page,item.width,item.reduced,'purchase');
        }
        assert.deepEqual(errors, [], 'No browser errors at '+item.width+' '+item.theme);
        console.log('PASS POS/Purchase product popup', item.width, item.theme,
          item.reduced ? 'reduced' : 'normal');
      } finally {
        await ctx.close();
      }
    }
  } finally {
    await browser.close();
  }
}
main().catch(error => {console.error(error);process.exitCode=1;});
