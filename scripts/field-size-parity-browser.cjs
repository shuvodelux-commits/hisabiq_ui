/* Read-only rendered ERP component size survey.
 * Run: npm run test:field-size-parity
 * Optional: FIELD_SIZE_REPORT=/tmp/hisabiq-field-size.json
 * Checks 22 routes at 390/768/1440px; control heights should always be 36px.
 */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const routes = [
  'dashboard','pos','counter','sales','quotations','online-sales','notifications',
  'warranty','reconciliation','finance','daybook','accounts','audit-ledger',
  'products','parties','purchases','purchases/new','vendors','expenses',
  'reports','settings/business','settings/personal'
];
const widths = [390, 768, 1440];
const failures = [], report = [];
async function scan(page, route, width, surface = 'page') {
  const result = await page.evaluate(() => {
    const controls = [], violations = [];
    const visible = el => {
      const r = el.getBoundingClientRect(), style = getComputedStyle(el);
      return r.height > 0 && r.width > 0 && style.display !== 'none' &&
        style.visibility !== 'hidden';
    };
    const candidates = document.querySelectorAll(
      '[data-hisabiq-input],button[data-hisabiq-select],'+
      '[data-hisabiq-numeric],[data-hisabiq-field-shell],'+
      '.hisabiq-button,button[data-slot="button"],input[data-slot="input"],select'
    );
    for (const el of candidates) {
      if (!visible(el) || el.closest('[data-number-stepper]')) continue;
      if (el.closest('[data-numeric-input]') && !el.hasAttribute('data-hisabiq-numeric')) continue;
      if (el.closest('[data-numeric-joined]') && !el.hasAttribute('data-hisabiq-field-shell')) continue;
      const rect = el.getBoundingClientRect();
      const type = el.matches('button[data-slot="button"]') ? 'button' : el.hasAttribute('data-hisabiq-input') ? 'input'
        : el.hasAttribute('data-hisabiq-select') ? 'select'
        : el.hasAttribute('data-hisabiq-numeric') ? 'numeric' : 'joined';
      const product = el.closest('.product-form');
      const ledger = el.closest('[data-hisabiq-field-group="party-ledger"]');
      const context = product ? 'product-editor' : ledger ? 'party-ledger' : 'standard';
      const expected = 36;
      const actual = Math.round(rect.height * 10) / 10;
      controls.push({ type, context, actual, expected,
        aria: el.getAttribute('aria-label') || el.getAttribute('placeholder') || '' });
      if (Math.abs(actual - expected) > 2)
        violations.push({ type, context, actual, expected, aria: el.getAttribute('aria-label') || '' });
    }
    return { controls, violations };
  });
  report.push({ route, width, surface, ...result });
  failures.push(...result.violations.map(item=>({ route, width, surface, ...item })));
}
async function main() {
  const { createServer } = await import('vite');
  const server = await createServer({server:{host:'127.0.0.1',port:4992,strictPort:true}});
  await server.listen();
  const browser = await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined,args:['--no-sandbox']});
  try {
    for (const width of widths) {
      const context = await browser.newContext({viewport:{width,height:width===390?844:950},
        hasTouch:width<=768,reducedMotion:'reduce'});
      const page = await context.newPage();
      await page.route('https://fonts.googleapis.com/**', route => route.abort());
      for (const route of routes) {
        await page.goto('http://127.0.0.1:4992/#/app/'+route,{waitUntil:'domcontentloaded'});
        await page.locator('#erp-main').waitFor();
        await scan(page,route,width);
        if (route === 'products') {
          const add = page.getByRole('button',{name:/Add product/i}).first();
          if (await add.count() && await add.isVisible()) {
            await add.click();
            const editor = page.locator('.product-form').first();
            if (await editor.isVisible().catch(()=>false)) await scan(page,route,width,'product-editor');
          }
        }
      }
      await context.close();
    }
  } finally {
    await browser.close(); await server.close();
  }
  const file = process.env.FIELD_SIZE_REPORT;
  if (file) {fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify({report,failures},null,2));}
  if (failures.length) console.error(JSON.stringify(failures.slice(0,40),null,2));
  assert.equal(failures.length,0,'Unexpected standalone field-height drift');
  console.log('Field size parity:',report.reduce((sum,r)=>sum+r.controls.length,0),'controls across',routes.length,'routes and',widths.join('/'),'px');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
