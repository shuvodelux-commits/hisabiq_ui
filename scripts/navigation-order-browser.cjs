const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {erpNavigation}=require('../src/navigation/erpNavigation.ts');
async function main(){
 const {createServer}=await import('vite');
 const server=await createServer({server:{host:'127.0.0.1',port:4247,strictPort:true}});
 await server.listen();
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 page.setDefaultTimeout(10000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base='http://127.0.0.1:4247/#';
 const modules=[
  ['/app/sales',['Sales','Sales return','Return history','Customer credit','Drafts & templates']],
  ['/app/purchases',['Purchases','Purchase return','Return history']],
  ['/app/products',['Product list','Stock lots','Stock history','Product settings']],
  ['/app/finance',['Overview','Loans & Owners','Cheques','Cash Sessions']],
  ['/app/accounts',['Overview','Money Accounts','Bank Entry','Vouchers','Ledger','Trial Balance','Statements','Chart of Accounts']]
 ];
 try{
  for(const width of [1440,768,390]){
   await page.setViewportSize({width,height:1000});
   for(const [route,labels] of modules){
    console.log('Checking',width,route);
    await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:15000});
    console.log('Loaded',route);
    const tabs=page.getByRole('tablist').first().getByRole('tab');
    await tabs.first().waitFor();
    console.log('Tabs ready',route);
    const actualLabels=await tabs.allTextContents();
    labels.forEach((label,i)=>assert.ok(actualLabels[i].trim().startsWith(label),`${route}: tab ${i+1}`));
    const destinations=erpNavigation.find(g=>g.landingPath===route).children.filter(c=>c.path.split('?')[0]===route).map(c=>c.path);
    assert.equal(destinations.length,labels.length,`${route}: every tab has a sidebar destination`);
    for(let i=0;i<labels.length;i++){
     if(width<1024)await page.getByRole('button',{name:'Open ERP navigation'}).click();
     const nav=width<1024?page.getByRole('dialog',{name:'ERP navigation'}):page.getByRole('navigation',{name:'Main'});
     await nav.locator(`a[href="#${destinations[i]}"]`).last().click();
     await tabs.nth(i).and(page.locator('[aria-selected="true"]')).waitFor();
     assert.equal(await tabs.nth(i).getAttribute('aria-selected'),'true',`${route}: sidebar item ${i+1} opens tab ${i+1}`);
    }
    // Clicking a tab must update URL and sidebar, including Finance's formerly local state.
    await tabs.first().click();
    await page.waitForFunction(expected=>location.hash==='#'+expected,route);
    assert.ok(page.url().endsWith(route),`${route}: default tab clears query`);
    await tabs.nth(1).click();
    await page.waitForFunction(expected=>location.hash==='#'+expected,destinations[1]);
    assert.ok(page.url().endsWith(destinations[1]),`${route}: tab updates sidebar destination`);
   }
   // The Money Accounts card still opens Bank Entry with its selected account and a way back.
   await page.goto(base+'/app/accounts?tab=money-accounts',{waitUntil:'domcontentloaded',timeout:15000});
   await page.locator('p').filter({hasText:/^Dutch-Bangla Bank · 4582$/}).first().waitFor();
   await page.getByRole('button',{name:'Bank Entry'}).first().click();
   await page.waitForURL(url => url.hash.startsWith('#/app/accounts?tab=bank-entry&accountId='));
   await page.getByRole('button',{name:'Back to Money Accounts'}).click();
   await page.waitForURL('**/#/app/accounts?tab=money-accounts');
   // Legacy bookmarks navigate to the new canonical module instead of disappearing.
   await page.goto(base+'/app/finance?tab=accounts',{waitUntil:'domcontentloaded',timeout:15000});
   await page.waitForURL('**/#/app/accounts?tab=money-accounts');
   await page.goto(base+'/app/finance?tab=counter',{waitUntil:'domcontentloaded',timeout:15000});
   await page.waitForURL('**/#/app/counter');
   // Finance and Accounts expand independently, while Daybook is a direct module.
   await page.goto(base+'/app/daybook',{waitUntil:'domcontentloaded',timeout:15000});
   if(width<1024)await page.getByRole('button',{name:'Open ERP navigation'}).click();
   const moduleNav=width<1024?page.getByRole('dialog',{name:'ERP navigation'}):page.getByRole('navigation',{name:'Main'});
   const daybookLink=moduleNav.locator('a[href="#/app/daybook"]');
   await daybookLink.waitFor();
   assert.equal(await daybookLink.getAttribute('aria-current'),'page','Daybook is the selected top-level module');
   assert.equal(await moduleNav.locator('a[data-nav-module="finance"]').count(),1,'Finance remains a direct module link');
   assert.equal(await moduleNav.locator('a[data-nav-module="accounts"]').count(),1,'Accounts remains a separate module link');
   await moduleNav.locator('a[data-nav-module="accounts"]').click();
   await page.waitForURL('**/#/app/accounts');
   if(width<1024)await page.getByRole('button',{name:'Open ERP navigation'}).click();
   const accountingNav=width<1024?page.getByRole('dialog',{name:'ERP navigation'}):page.getByRole('navigation',{name:'Main'});
   assert.equal(await accountingNav.locator('a[data-nav-module="accounts"]').getAttribute('aria-current'),'page','Accounts Overview opens beneath Accounts');
   assert.equal(await accountingNav.locator('a[href="#/app/daybook"]').count(),1,'Daybook remains outside Accounts as a one-click module');
   if(width<1024)await accountingNav.getByRole('button',{name:'Close navigation'}).click();
   await page.goto(base+'/app/settings/business');
   // Magic Patterns replaces the former Settings tablist with grouped navigation links.
   // Verify its source section order and live destinations consistently across widths.
   const settingButtons=page.locator('[data-settings-directory] a[data-settings-section]:visible');
   await settingButtons.first().waitFor();
   const order=await settingButtons.evaluateAll(nodes=>nodes.map(n=>n.dataset.settingsSection));
   const expected=['business','names','sales','products','purchases','invoices','finance','notifications','interface','team','sessions','activity','data','offline','support','subscription','personal','security'];
   assert.deepEqual(order,expected,'Magic Patterns Settings groups retain their exact source order');
   for(const [id,route] of [['business','business'],['names','financialTerminology'],['finance','money'],['security','security']]){
    assert.ok(order.includes(id), 'Missing Settings '+id);
    const destination=await page.locator(`[data-settings-directory] a[data-settings-section="${id}"]`).getAttribute('href');
    assert.equal(destination,'#/app/settings/'+route, 'Magic Settings '+id+' uses existing ERP route');
   }
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(base+'/app/sales?tab=return');
  await page.getByRole('tab',{name:'Sales return',exact:true}).waitFor();
  await page.screenshot({path:'/tmp/navigation-order-sales.png',fullPage:true});
  assert.deepEqual(errors,[]);
  console.log('Navigation order passed: all Sales/Purchase/Product/Finance tabs and destinations at 1440, 768, 390px; Settings compact order; tab/sidebar sync.');
 }catch(error){console.error(error);throw error;}finally{await browser.close();server.httpServer?.closeAllConnections();await server.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
