/* Verify Party profile → POS customer context across responsive, theme and language profiles. */
/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires -- Playwright CLI scripts use CommonJS. */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const axePath = require.resolve('axe-core');

async function audit(page, label) {
  const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => ({ target:node.target, html:node.html, failureSummary:node.failureSummary })) })));
  assert.deepEqual(violations, [], `${label} axe violations: ${JSON.stringify(violations)}`);
}

async function main() {
  const { createServer } = await import('vite');
  const server = await createServer({ server: { host: '127.0.0.1', port: 49262, strictPort: true } });
  await server.listen();
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined, args: ['--no-sandbox'] });
  const allProfiles = [[320,700],[360,800],[390,844],[430,932],[768,1024],[1024,768],[1280,800],[1440,900]];
  const profiles = process.env.PARTY_CONTEXT_WIDTH ? allProfiles.filter(([width]) => width === Number(process.env.PARTY_CONTEXT_WIDTH)) : allProfiles;
  let journeys = 0;
  try {
    for (const [width,height] of profiles) for (const theme of ['light','dark']) for (const language of ['English','English + Bangla','Bangla']) {
      const context = await browser.newContext({ viewport: { width, height }, hasTouch: true, colorScheme: theme, reducedMotion: 'reduce' });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript(({ theme, language }) => {
        localStorage.setItem('hisabiq-theme', theme);
        localStorage.setItem('hisabiq-erp-personal-v1', JSON.stringify({ mode:'Simple', language, density:'Compact', terminology:'simple', dateView:'transaction' }));
      }, { theme, language });
      const act = element => width <= 1024 ? element.tap() : element.click();
      const suffix = `${width}px ${theme} ${language}`;
      try {
        await page.goto('http://127.0.0.1:49262/#/app/parties?id=c1&role=Customer');
        await page.getByRole('heading', { name: /Rahman Hardware/ }).waitFor();
        await page.addScriptTag({ path: axePath });
        await audit(page, `${suffix} Party profile`);

        const startSale = page.getByRole('button', { name: /New invoice|নতুন বিল/ });
        await startSale.waitFor();
        assert.equal(await startSale.isEnabled(), true, `${suffix} active customer can start a sale`);
        await act(startSale);
        await page.getByRole('heading', { name: /New sale|নতুন বিক্রি/ }).waitFor();
        assert.match(page.url(), /\/app\/pos\?partyId=c1/);
        const customerName = page.locator('input[aria-label="Customer name"],input[aria-label="ক্রেতার নাম"]');
        await customerName.waitFor();
        assert.equal(await customerName.inputValue(), 'Rahman Hardware', `${suffix} customer draft is prefilled`);
        assert.equal(await page.locator('[data-pos-checkout] button').filter({ hasText: 'Rahman Hardware' }).count(), 1, `${suffix} source party identity stays selected`);
        assert.ok(await page.getByText(/Sale for Rahman Hardware/).count(), `${suffix} context is visible`);
        await audit(page, `${suffix} POS`);

        await act(page.getByRole('button', { name: /Back to party|পার্টিতে ফিরুন/ }));
        await page.getByRole('button', { name: /New invoice|নতুন বিল/ }).waitFor();
        assert.match(page.url(), /\/app\/parties\?id=c1&role=Customer/);
        assert.deepEqual(errors, [], `${suffix} browser errors`);
        journeys++;
        console.log(`Passed ${journeys}/${profiles.length * 6}: ${suffix}`);
      } finally {
        await context.close();
      }
    }
    console.log(`Party profile to POS context passed: ${journeys}/${profiles.length * 6} journeys, ${journeys*2} whole-page axe scans`);
  } finally {
    await browser.close();
    await server.close();
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
