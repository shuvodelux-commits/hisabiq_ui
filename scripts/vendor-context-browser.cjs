const {chromium}=require('playwright');
const assert=require('node:assert/strict');
async function main(){
 const {createServer}=await import('vite');
 const server=await createServer({server:{host:'127.0.0.1',port:4247,strictPort:true}});
 await server.listen();
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1270,height:850},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://127.0.0.1:4247/#/app/vendors?partyId=v1&tab=given');
  const vendor=page.getByRole('region',{name:'Selected Vendor work'});
  await vendor.getByRole('button',{name:'Issue Products'}).click();
  await page.getByRole('form',{name:'Issue products editor'}).waitFor();
  assert.equal(await page.getByRole('dialog',{name:'Issue products to Vendor'}).count(),0);
  await vendor.getByRole('tab',{name:/Purchases/}).click();
  const purchaseWorkspace=vendor.locator('[data-testid="vendor-purchases-workspace"]');
  await purchaseWorkspace.waitFor();
  const purchaseList=purchaseWorkspace.locator('[data-testid="vendor-purchases-list"]');
  const purchaseDetail=purchaseWorkspace.locator('[data-testid="vendor-purchases-detail"]');
  await purchaseList.waitFor();
  await purchaseDetail.getByText('No purchases from this Vendor yet.').waitFor();
  await vendor.getByRole('button',{name:'Buy Products'}).click();
  await vendor.getByText('Purchase details').waitFor();
  assert.ok(await vendor.getByText(/Supplier memo/).count()>=1);
  assert.equal(await page.getByRole('dialog',{name:'Buy products from Vendor'}).count(),0);
  await vendor.getByRole('button',{name:'Cancel'}).last().click();
  await vendor.getByText('No purchases from this Vendor yet.').waitFor();
  assert.deepEqual(errors,[]);
  console.log('Vendor inline product-issue cart and full-width Purchase editor verified');
 }finally{await browser.close();await server.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
