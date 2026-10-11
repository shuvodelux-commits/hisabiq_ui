const {chromium}=require('playwright');
const assert=require('node:assert/strict');
async function main(){
 const {createServer}=await import('vite');
 const server=await createServer({server:{host:'127.0.0.1',port:4270,strictPort:true}});
 await server.listen();
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://127.0.0.1:4270/#/app/vendors');
  await page.getByRole('region',{name:'Vendor Sourcing module'}).waitFor();
  const nav=page.getByRole('navigation',{name:'Main'});
  await nav.getByRole('link',{name:/Vendor/}).first().waitFor();
  await page.getByRole('textbox',{name:'Search Vendors'}).fill('Shapla');
  await page.getByRole('button',{name:/Shapla Transport/}).first().click();
  const tabs=page.getByRole('tablist',{name:'Vendor work tabs'});
  assert.equal(await tabs.getByRole('tab').count(),5);
  await tabs.getByRole('tab',{name:/Products Received/}).click();
  assert.ok(page.url().includes('tab=taken'));
  await page.reload();
  assert.equal(await tabs.getByRole('tab',{name:/Products Received/}).getAttribute('aria-selected'),'true');
  for(const [name,selector] of [
    ['Products Issued','vendor-issued-workspace'],
    ['Purchases','vendor-purchases-workspace'],
    ['Payments','vendor-payments-workspace']
  ]){
    await tabs.getByRole('tab',{name:new RegExp(name)}).click();
    const layout=page.locator('[data-testid="'+selector+'"]');
    await layout.waitFor();
    const left=layout.locator('[data-testid="'+selector+'-list"]');
    const right=layout.locator('[data-testid="'+selector+'-detail"]');
    const desktopLeft=await left.boundingBox(),desktopRight=await right.boundingBox();
    assert.ok(desktopLeft&&desktopRight&&desktopRight.x>=desktopLeft.x+desktopLeft.width-3,
      name+' should use two-column desktop list and working panel');
    assert.ok(desktopRight.width>desktopLeft.width,name+' detail workspace should be wider');
    await page.setViewportSize({width:390,height:840});
    const mobileLeft=await left.boundingBox(),mobileRight=await right.boundingBox();
    assert.ok(mobileLeft&&mobileRight&&mobileRight.y>=mobileLeft.y+mobileLeft.height-3,
      name+' should stack list over detail on mobile');
    await page.setViewportSize({width:1280,height:900});
  }
  await tabs.getByRole('tab',{name:/Ledger/}).click();
  await page.locator('[data-testid="vendor-ledger-workspace"]').waitFor();
  const toolbar=await tabs.boundingBox();
  const print=await page.getByRole('button',{name:'Print Ledger'}).boundingBox();
  assert.ok(toolbar&&print&&Math.abs(toolbar.y-print.y)<30,
    'Print Ledger belongs in the top tab toolbar, not a second row');
  await page.setViewportSize({width:390,height:840});
  assert.deepEqual(errors,[]);
  console.log('Top-level Vendor route, five tabs and responsive selection verified');
 }finally{await browser.close();await server.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
