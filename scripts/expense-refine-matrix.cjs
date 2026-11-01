/* GitHub cloud UI Refine Loop: screenshots and smoke at 320/768/1024 px. */
const { chromium } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');

async function main() {
  const label = process.argv[2] || 'round-0';
  if (!/^round-[0-4]$/.test(label)) throw Error('Invalid screenshot label');
  const out = path.resolve('.refine-cloud/shots');
  await fs.mkdir(out, { recursive:true });
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const results = [];
  try {
    for (const width of [320, 768, 1024]) {
      for (const theme of ['light','dark']) {
        const context = await browser.newContext({
          viewport: {width, height: 900}, hasTouch: width<=768,
          colorScheme:theme, reducedMotion:'reduce'
        });
        await context.addInitScript((mode) => {
          localStorage.setItem('hisabiq-theme',mode);
          localStorage.setItem('theme',mode);
          localStorage.setItem('hisabiq-erp-personal-v1',
            JSON.stringify({mode:'Simple',language:'English',density:'Compact',
              terminology:'simple',dateView:'transaction'}));
        }, theme);
        const page = await context.newPage();
        const errors=[];
        page.on('pageerror',err=>errors.push(err.message));
        await page.goto('http://127.0.0.1:4308/#/app/expenses',{waitUntil:'networkidle'});
        await page.getByText('Active expenses',{exact:true}).waitFor();
        assert.match(page.url(),/#\/app\/expenses$/);
        assert.equal(errors.length,0,'JS errors: '+errors.join('; '));
        const actualDark=await page.evaluate(()=>document.documentElement.classList.contains('dark'));
        assert.equal(actualDark,theme==='dark',`Theme mismatch ${theme} at ${width}px`);
        await page.screenshot({path:path.join(out,`matrix-${label}-${width}-${theme}.png`), fullPage:true});
        const metrics=await page.evaluate(()=>({
          bodyWidth:document.documentElement.scrollWidth,
          viewport:document.documentElement.clientWidth,
          actionCount:document.querySelectorAll('button').length
        }));
        results.push({label,width,theme,...metrics});
        await context.close();
      }
    }
  } finally { await browser.close(); }
  await fs.writeFile(path.resolve('.refine-cloud/reports/matrix-'+label+'.json'),
    JSON.stringify(results,null,2));
  console.log('Expenses phone/tablet matrix captured:',results.length,'screens');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
