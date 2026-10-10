const {chromium}=require('playwright');
const assert=require('node:assert/strict');
async function main(){
 const {createServer}=await import('vite');
 const server=await createServer({server:{host:'127.0.0.1',port:4245,strictPort:true}});
 await server.listen();
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1280,height:850},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://127.0.0.1:4245/#/app/pos');
  const row=page.locator('[data-testid="pos-cart-row"]').first();
  await row.getByRole('textbox',{name:/Quantity for/}).fill('100');
  await row.getByRole('button',{name:/Short/}).click();
  const dialog=page.getByRole('dialog').filter({hasText:'Stock shortage'}).first();
  console.log('DEBUG STOCK dialog_count=',await page.getByRole('dialog').count(), 'texts=',(await page.getByRole('dialog').allInnerTexts()).map(x=>x.slice(0,320)), 'pageerrors=',errors);
  await page.getByText('Source only the shortage from a nearby Vendor.',{exact:false}).first().click({timeout:7000});
  await dialog.getByRole('combobox',{name:'Vendor'}).click();
  await page.getByRole('listbox',{name:'Vendor options'}).getByRole('option').first().click();
  assert.match(await dialog.innerText(),/Price pending/i);
  assert.equal(await dialog.getByRole('button',{name:/Use vendor/}).isEnabled(),true);
  await dialog.getByRole('button',{name:/Use vendor/}).click();
  await row.getByRole('button',{name:/Shapla|Padma/}).waitFor();
  assert.deepEqual(errors,[]);
  console.log('Vendor POS shortage without up-front cost browser flow passed');
 }finally{await browser.close();await server.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
