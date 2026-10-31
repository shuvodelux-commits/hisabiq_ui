/* Audit actual computed corners across ERP routes and portal controls. */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const routes = [
  'dashboard','pos','counter','sales','quotations','online-sales','notifications',
  'warranty','reconciliation','finance','daybook','accounts','audit-ledger',
  'products','parties','purchases','purchases/new','vendors','expenses',
  'reports','settings/business','settings/personal'
];
const report = [];
async function scan(page, context, expected = 6) {
  const result = await page.evaluate(expected => {
    const failures = [];
    let checked = 0;
    for (const node of document.querySelectorAll('button,[role="button"],input,textarea,select,[role="combobox"],[data-numeric-joined],[data-hisabiq-numeric],[data-hisabiq-field-shell],[data-slot="input-group"]')) {
      if (!node.getClientRects().length) continue;
      if (node.matches('[role="switch"],[role="checkbox"],[role="radio"],input[type="checkbox"],input[type="radio"],input[type="hidden"],input[type="range"],input[type="color"]')) continue;
      // A joined control has one visible outline, with borderless inner editors.
      if (node.matches('.numeric-input-control') || node.matches('input,select,[data-hisabiq-numeric],[data-hisabiq-select]') && node.parentElement.closest('[data-numeric-joined],[data-numeric-input],[data-slot="input-group"]')) continue;
      const style = getComputedStyle(node);
      if (style.visibility === 'hidden') continue;
      checked++;
      const corners = ['borderTopLeftRadius','borderTopRightRadius','borderBottomRightRadius','borderBottomLeftRadius'].map(key => style[key]);
      if (corners.some(value => value !== expected + 'px')) failures.push({
        tag: node.tagName, name: node.getAttribute('aria-label') || node.getAttribute('placeholder') || node.textContent?.trim().slice(0,70), corners, className: node.className
      });
    }
    const innerCorners = [...document.querySelectorAll('[data-numeric-joined] [data-hisabiq-numeric]')].map(node => getComputedStyle(node).borderTopLeftRadius);
    return { checked, failures, innerCorners };
  }, expected);
  report.push({ context, ...result });
  assert.deepEqual(result.failures, [], context + ': every outer corner uses the shared radius');
  assert.ok(result.innerCorners.every(value => value === '0px'), context + ': joined fields retain square internal seams');
}
async function main() {
  const { createServer } = await import('vite');
  const server = await createServer({ server: { host: '127.0.0.1', port: 4995, strictPort: true } });
  await server.listen();
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined, args: ['--no-sandbox'] });
  try {
    for (const width of [390,768,1440]) for (const theme of ['light','dark']) {
      const context = await browser.newContext({ viewport: { width, height: 950 }, hasTouch: width <= 768, reducedMotion: 'reduce' });
      const page = await context.newPage();
      await page.route('https://fonts.googleapis.com/**', route => route.abort());
      for (const route of routes) {
        await page.goto('http://127.0.0.1:4995/#/app/' + route);
        await page.locator('#erp-main').waitFor();
        await page.evaluate(theme => document.documentElement.classList.toggle('dark', theme === 'dark'), theme);
        await page.waitForTimeout(180);
        const name = width + '/' + theme + '/' + route;
        await scan(page, name);
        if (route === 'products') {
          await page.getByRole('button', { name: /Add product/i }).first().click();
          await page.locator('.product-form').waitFor();
          await scan(page, name + '/editor');
        }
        const combo = page.locator('button[role="combobox"]').filter({ visible: true }).first();
        if (await combo.count()) {
          await combo.click();
          await scan(page, name + '/open-select');
          await page.keyboard.press('Escape');
        }
      }
      // Prove consumers inherit the token, including existing utility overrides.
      await page.evaluate(() => document.documentElement.style.setProperty('--erp-control-radius', '0.625rem'));
      // Some legacy controls animate all properties; measure the settled value.
      await page.waitForTimeout(350);
      await scan(page, width + '/' + theme + '/inherited-token-change', 10);
      await context.close();
    }
  } finally {
    fs.mkdirSync('test-results', { recursive: true });
    fs.writeFileSync('test-results/control-radius.json', JSON.stringify(report, null, 2));
    await browser.close();
    await server.close();
  }
  console.log('Control radius: PASS; ' + report.length + ' scans, ' + report.reduce((n, row) => n + row.checked, 0) + ' rendered controls.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
