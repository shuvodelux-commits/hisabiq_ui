const {chromium}=require('playwright');
const assert=require('node:assert/strict');
async function main(){
 const {createServer}=await import('vite');
 const server=await createServer({server:{host:'127.0.0.1',port:4238,strictPort:true}});
 await server.listen();
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1330,height:890},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base='http://127.0.0.1:4238/#';
 try{
  await page.goto(base+'/app/quotations');
  const nav=page.getByRole('navigation',{name:'Main'});
  await nav.getByRole('link',{name:/Quotations & Estimates/}).waitFor();
  assert.equal(await nav.getByRole('link',{name:/Quotations & Estimates/}).getAttribute('aria-current'),'page');
  assert.equal(await nav.getByRole('button',{name:'Collapse Sales'}).getAttribute('aria-expanded'),'true');
  const before=page.url();
  await nav.getByRole('button',{name:'Expand Purchases'}).click();
  assert.equal(page.url(),before,'opening a group must not navigate away');
  assert.equal(await nav.getByRole('button',{name:'Collapse Purchases'}).getAttribute('aria-expanded'),'true');
  await page.keyboard.press('Enter');
  assert.equal(page.url(),before);

  // Clicking the text or chevron on a parent row must have identical behavior.
  const purchasesTrigger=nav.getByRole('button',{name:'Expand Purchases'});
  await nav.getByRole('button',{name:'Collapse Purchases'}).getByText('Purchases',{exact:true}).click();
  assert.equal(page.url(),before,'parent label must only collapse its group');
  assert.equal(await purchasesTrigger.getAttribute('aria-expanded'),'false');
  await purchasesTrigger.locator('svg:last-child').click();
  assert.equal(page.url(),before,'parent chevron must only expand its group');
  assert.equal(await nav.getByRole('button',{name:'Collapse Purchases'}).getAttribute('aria-expanded'),'true');
  await nav.getByRole('link',{name:/Purchase Bills/}).click();
  assert.ok(page.url().includes('/app/purchases'),'child link must navigate to its module');
  await page.goto(base+'/app/sales?tab=return');
  await page.getByRole('tab',{name:'Sales return'}).waitFor();
  assert.equal(await page.getByRole('tab',{name:'Sales return'}).getAttribute('aria-selected'),'true');
  await page.goto(base+'/app/purchases?tab=return');
  await page.getByRole('tab',{name:'Purchase return'}).waitFor();
  assert.equal(await page.getByRole('tab',{name:'Purchase return'}).getAttribute('aria-selected'),'true');
  await page.goto(base+'/app/parties?role=Supplier');
  await nav.getByRole('link',{name:/Suppliers & Vendors/}).waitFor();
  assert.equal(await nav.getByRole('link',{name:/Suppliers & Vendors/}).getAttribute('aria-current'),'page');
  await page.goto(base+'/app/products?view=lots');
  assert.equal(await nav.getByRole('link',{name:/Stock, Lots & Adjustments/}).getAttribute('aria-current'),'page');
  await page.goto(base+'/app/notifications');
  assert.equal(await nav.getByRole('link',{name:/Notifications & SMS/}).getAttribute('aria-current'),'page');
  await page.getByRole('button',{name:'Collapse sidebar'}).click();
  const sidebar=page.locator('aside[data-sidebar="sidebar"]');
  assert.equal(await sidebar.getAttribute('data-collapsible'),'icon');
  assert.ok(await nav.getByRole('link',{name:'Dashboard'}).isVisible(),'icon-only leaf links remain usable');
  assert.ok(await nav.getByRole('button',{name:/Expand sidebar to open Sales/}).isVisible());
  await nav.getByRole('button',{name:/Expand sidebar to open Sales/}).click();
  assert.equal(await sidebar.getAttribute('data-collapsible'),'none');
  assert.equal(await nav.getByRole('button',{name:'Collapse Sales'}).getAttribute('aria-expanded'),'true');
  await nav.getByRole('link',{name:/Notifications & SMS/}).waitFor();

  await page.keyboard.press('Control+b');
  assert.equal(await sidebar.getAttribute('data-collapsible'),'icon','shadcn sidebar shortcut collapses');
  await page.reload();
  assert.equal(await sidebar.getAttribute('data-collapsible'),'icon','sidebar preference persists after refresh');
  await page.getByRole('button',{name:'Expand sidebar'}).click();
  assert.equal(await sidebar.getAttribute('data-collapsible'),'none');

  await page.setViewportSize({width:375,height:812});
  await page.goto(base+'/app/sales');
  await page.getByRole('button',{name:'Open ERP navigation'}).click();
  const drawer=page.getByRole('dialog',{name:'ERP navigation'});
  await drawer.waitFor();
  await drawer.getByRole('link',{name:/Quotations & Estimates/}).click();
  await drawer.waitFor({state:'hidden'});
  assert.ok(page.url().includes('/app/quotations'));
  await page.getByRole('button',{name:'Open ERP navigation'}).click();
  assert.equal(await page.getByRole('dialog',{name:'ERP navigation'}).getByRole('link',{name:/Quotations & Estimates/}).getAttribute('aria-current'),'page');
  await page.keyboard.press('Escape');
  await drawer.waitFor({state:'hidden'});
  await page.setViewportSize({width:768,height:1024});
  await page.getByRole('button',{name:'Open ERP navigation'}).click();
  const mobile=page.getByRole('dialog',{name:'ERP navigation'});
  await mobile.getByRole('button',{name:'Expand Settings'}).getByText('Settings',{exact:true}).click();
  await mobile.getByRole('link',{name:/Business & General/}).waitFor();
  assert.equal(await mobile.getByRole('button',{name:'Collapse Settings'}).getAttribute('aria-expanded'),'true');
  assert.deepEqual(errors,[]);
  console.log('ERP navigation: routes, nested active links, tab deep links, collapsed sidebar and mobile drawer passed');
 }finally{await browser.close();await server.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
