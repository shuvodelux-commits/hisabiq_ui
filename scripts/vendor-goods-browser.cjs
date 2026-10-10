const {chromium}=require('playwright');
const assert=require('node:assert/strict');
async function main(){
 const {createServer}=await import('vite');
 const server=await createServer({server:{host:'127.0.0.1',port:4272,strictPort:true}});
 await server.listen();
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1250,height:900},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://127.0.0.1:4272/#/app/vendors?partyId=v1&tab=given');
  const work=page.getByRole('region',{name:'Selected Vendor work'});
  await work.waitFor();
  await work.getByRole('button',{name:/Issue Products/}).first().click();
  const editor=page.getByRole('form',{name:'Issue products editor'});
  await editor.waitFor();
  assert.equal(await page.getByRole('dialog',{name:/Issue products/}).count(),0,'full cart must be inline, not modal');
  assert.equal(await editor.locator('[data-testid="purchase-cart"]').count(),1,'Vendor issue must use canonical PurchaseCart');
  assert.equal(await editor.locator('[data-testid="purchase-add-row"]').count(),1,'Vendor issue must use PurchaseCart inline search row');
  await editor.getByRole('combobox',{name:'Search product to issue to vendor'}).fill('LED Bulb');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await editor.locator('[data-testid="purchase-cart-row"]').first().waitFor();
  await editor.getByRole('textbox',{name:/quantity for/i}).first().waitFor();
  await editor.getByRole('button',{name:/Save Issued Products/}).click();
  await editor.getByRole('alert').getByText(/price/i).waitFor();
  await page.goto('http://127.0.0.1:4272/#/app/vendors?partyId=v1&tab=taken');
  const received=page.getByRole('region',{name:'Selected Vendor work'});
  await received.getByRole('button',{name:/Receive Products/}).first().click();
  const receiveEditor=page.getByRole('form',{name:'Receive products editor'});
  await receiveEditor.waitFor();
  assert.equal(await receiveEditor.locator('[data-testid="purchase-cart"]').count(),1,'Vendor receive must use canonical PurchaseCart');
  assert.equal(await receiveEditor.locator('[data-testid="purchase-add-row"]').count(),1,'Vendor receive must use PurchaseCart inline search');
  await receiveEditor.getByRole('combobox',{name:'Search product to receive from vendor'}).waitFor();
  assert.deepEqual(errors,[]);
  console.log('Vendor issue reuses PurchaseCart inline search, keyboard entry and agreed-price validation');
 }finally{await browser.close();await server.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
