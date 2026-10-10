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
  await page.goto('http://127.0.0.1:4247/#/app/parties?id=v1&role=Vendor');
  const workspace=page.getByRole('region',{name:'Vendor workspace'});
  await workspace.getByRole('button',{name:/Give products/}).click();
  const issue=page.getByRole('dialog',{name:'Give products to Vendor'});
  await issue.waitFor();
  await issue.getByRole('combobox',{name:'Issue product 1'}).click();
  await page.getByRole('listbox',{name:'Issue product 1 options'}).getByRole('option').first().click();
  const quantity=issue.getByRole('textbox',{name:/Issue quantity for/}).first();
  await quantity.fill('2');
  await issue.getByRole('textbox',{name:/Agreed cost for/}).first().fill('100');
  await issue.getByRole('button',{name:'Record issue memo'}).click();
  await issue.waitFor({state:'hidden'});
  assert.match(await workspace.innerText(),/Issued|receivable/i);
  assert.match(await workspace.innerText(),/V-ISS-/i);

  await workspace.getByRole('button',{name:/Buy products/}).first().click();
  const purchase=page.getByRole('dialog',{name:'Buy products from Vendor'});
  await purchase.waitFor();
  assert.ok((await purchase.innerText()).includes('Purchase details'));
  assert.ok(await purchase.getByText(/Supplier memo/).count()>=1);
  await purchase.getByRole('button',{name:'Cancel'}).last().click();
  await purchase.waitFor({state:'hidden'});
  assert.deepEqual(errors,[]);
  console.log('Vendor in-context multi-product issue and original Purchase dialog smoke passed');
 }finally{await browser.close();await server.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
