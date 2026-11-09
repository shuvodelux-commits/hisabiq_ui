const { createServer } = require('vite');
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

async function main() {
  const out = path.resolve('.superpowers/saas-refine');
  fs.mkdirSync(out, { recursive: true });
  let hadFailure = false;
  const server = await createServer({ server: { host: '127.0.0.1', port: 4183, strictPort: true } });
  await server.listen();
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined, headless: true, args: ['--no-sandbox'] });
  try {
    for (const width of (process.env.VIEWPORTS || '1440,390').split(',').map(Number)) {
      for (const theme of ['light', 'dark']) {
        const page = await browser.newPage({ viewport: { width, height: 900 } });
        const failures = [];
        page.on('pageerror', e => failures.push('pageerror: ' + e.message));
        page.on('console', m => { if(m.type() === 'error') failures.push('console: ' + m.text()); });
        await page.addInitScript((value) => localStorage.setItem('hisabiq-theme', value), theme);
        for (const route of ['home', 'tenants']) {
          await page.goto('http://127.0.0.1:4183/#/saas/' + route, {waitUntil:'domcontentloaded'});
          await page.waitForTimeout(1200);
          const diag = await page.evaluate(() => ({
            route: location.hash,
            title: document.title,
            nav: !!document.querySelector('nav[aria-label="Control Center"]'),
            main: document.querySelector('main')?.textContent?.slice(0, 180),
            body: document.body.textContent?.slice(0, 260),
            overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth)
          }));
          await page.screenshot({ path: path.join(out, (process.env.SHOT_LABEL || 'baseline') + '-' + route + '-' + width + '-' + theme + '.png'), fullPage: true });
          console.log(JSON.stringify({width,theme,...diag,failures},null,0));
          if (!diag.nav || failures.length || diag.overflow > 0) hadFailure = true;
        }
        await page.close();
      }
    }
    if (hadFailure) process.exitCode = 1;
  } finally { await browser.close(); await server.close(); }
}
main().catch(e => { console.error(e); process.exitCode = 1; });
