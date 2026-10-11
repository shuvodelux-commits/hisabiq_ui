const {chromium}=require('playwright');
const assert=require('node:assert/strict');
async function main(){
 const {createServer}=await import('vite');
 const server=await createServer({server:{host:'127.0.0.1',port:4244,strictPort:true}});
 await server.listen();
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1250,height:850},reducedMotion:'reduce',acceptDownloads:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://127.0.0.1:4244/#/app/vendors?partyId=v1&tab=taken');
  const vendor=page.getByRole('region',{name:'Selected Vendor work'});
  await vendor.waitFor();
  await vendor.getByRole('tab',{name:/Products Received/}).waitFor();
  await vendor.getByText('Price not set · দাম ঠিক হয়নি').first().waitFor();
  // Desktop: the memo list and settlement workspace are available together.
  const split=vendor.locator('[data-testid="vendor-received-workspace"]');
  await split.waitFor();
  const memoList=vendor.locator('[data-testid="vendor-received-memo-list"]');
  const workPanel=vendor.locator('[data-testid="vendor-received-detail"]');
  await memoList.waitFor();
  await workPanel.waitFor();
  const settlement=workPanel.getByRole('form',{name:'Record Vendor Settlement'});
  await settlement.waitFor();
  const listBox=await memoList.boundingBox(),detailBox=await workPanel.boundingBox();
  assert.ok(listBox&&detailBox&&detailBox.x>listBox.x+listBox.width-4,
    'desktop memo list must be left of settlement workspace');
  assert.ok(detailBox.width>listBox.width,'settlement workspace uses 60% of desktop width');
  assert.equal(await memoList.getByRole('button',{name:/DEMO-INV-201/}).count(),1,
    'invoices remain selectable without opening another form');
  // Existing Receive Products action swaps in the *actual* shared purchase cart.
  await vendor.getByRole('button',{name:/Receive Products/}).first().click();
  const receiveEditor=workPanel.getByRole('form',{name:'Receive products editor'});
  await receiveEditor.waitFor();
  assert.equal(await receiveEditor.locator('[data-testid="purchase-cart"]').count(),1);
  assert.equal(await settlement.count(),0,'only one active detail workspace');
  await receiveEditor.getByRole('button',{name:'Close'}).click();
  await settlement.waitFor();
  await page.setViewportSize({width:390,height:800});
  const mobileList=await memoList.boundingBox(),mobilePanel=await workPanel.boundingBox();
  assert.ok(mobileList&&mobilePanel&&mobilePanel.y>=mobileList.y+mobileList.height-3,
    'mobile invoice list must stack before settlement editor');
  await page.setViewportSize({width:1250,height:850});
  const nav=page.getByRole('navigation',{name:'Main'});
  await nav.getByRole('link',{name:'Vendor'}).waitFor();
  await vendor.getByRole('tab',{name:/Ledger/}).click();
  await vendor.getByRole('button',{name:'Print Ledger'}).click();
  const dialog=page.getByRole('dialog',{name:'Vendor Statement'});
  await dialog.waitFor();
  const downloaded=page.waitForEvent('download');
  await dialog.getByRole('button',{name:/Export CSV/}).click();
  assert.match((await downloaded).suggestedFilename(),/vendor-ledger-/);
  await dialog.getByRole('button',{name:'Close'}).first().click();
  await page.setViewportSize({width:390,height:800});
  assert.deepEqual(errors,[]);
  console.log('Vendor top-level ledger and CSV statement preview verified');
 }finally{await browser.close();await server.close();}
}
main().catch(err=>{console.error(err);process.exitCode=1;});
