/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires -- Browser CLI uses CommonJS. */
const {chromium}=require('playwright');const assert=require('node:assert/strict');
async function main(){
 const{createServer}=await import('vite');const server=await createServer({server:{host:'127.0.0.1',port:4260,strictPort:true}});await server.listen();
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
 try{for(const theme of ['light','dark'])for(const width of [320,390,768,1024,1440]){
  const context=await browser.newContext({viewport:{width,height:1000},hasTouch:width<1024,reducedMotion:'reduce'});
  await context.addInitScript(theme=>localStorage.setItem('hisabiq-theme',theme),theme);
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const base='http://127.0.0.1:4260/#';await page.goto(base+'/app/dashboard');
  const search=page.getByRole('searchbox',{name:'Global search',exact:true});await search.waitFor();
  await page.keyboard.press('Control+k');assert(await search.evaluate(node=>node===document.activeElement));
  async function submit(query){await search.fill(query);if(width<1024)await page.getByRole('button',{name:'Run global search',exact:true}).click();else await search.press('Enter');await page.getByRole('heading',{name:'Search results',exact:true}).waitFor();await page.waitForFunction(q=>document.querySelector('main')?.textContent.includes('Results for “'+q+'”'),query);}
  const results=page.getByRole('region',{name:'Search results',exact:true});
  await submit('এলইডি');await results.getByRole('link',{name:/LED Bulb 12W/}).click();
  await page.getByRole('textbox',{name:'Search products',exact:true}).waitFor();assert.equal(await page.getByRole('textbox',{name:'Search products',exact:true}).inputValue(),'ELC-1201');
  assert.equal(await page.getByRole('button',{name:'Actions for PVC Pipe 1" (20 ft)',exact:true}).count(),0);
  await page.getByRole('button',{name:'Add product',exact:true}).click();const dialog=page.locator('[data-slot="dialog-content"]').last();await dialog.waitFor();await dialog.locator('input').first().focus();await page.keyboard.press('Control+k');assert(await dialog.evaluate(node=>node.contains(document.activeElement)),'Search shortcut must not leave an open draft');await dialog.getByRole('button',{name:'Close',exact:true}).last().click();await dialog.waitFor({state:'hidden'});
  await submit('INV-০০০২৪১');await results.getByRole('link',{name:/INV-000241/}).click();
  await page.getByRole('button',{name:'Actions for INV-000241',exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Actions for INV-000240',exact:true}).count(),0);
  await submit('PUR-000118');await results.getByRole('link',{name:/PUR-000118/}).click();
  await page.getByRole('button',{name:'Actions for PUR-000118',exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Actions for PUR-000117',exact:true}).count(),0);
  await submit('Rahman');const partyLink=results.getByRole('link').filter({hasText:'Party'}).first();await partyLink.click();await page.waitForFunction(()=>location.hash.includes('/app/parties?id='));
  await submit('Cash');await results.getByRole('link',{name:/Finance/}).click();await page.waitForFunction(()=>location.hash.includes('/app/finance'));
  await submit('হিসাব মিলানো');await results.getByRole('link',{name:/Reconciliation/}).click();await page.waitForFunction(()=>location.hash.includes('/app/reconciliation'));
  await submit('zzzz-no-record');await page.getByRole('status').filter({hasText:'No matching records'}).waitFor();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.getByRole('button',{name:'Run global search',exact:true}).click();await page.getByRole('heading',{name:'Search results',exact:true}).waitFor();
  assert.deepEqual(errors,[]);await context.close();console.log(`Global keyboard, Bangla product, exact invoice/bill, Party and module navigation passed: ${width}px ${theme}`);
 }}finally{await browser.close();await server.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
