const {chromium}=require('playwright');
const assert=require('node:assert/strict');
async function main(){
 const {createServer}=await import('vite');
 const server=await createServer({server:{host:'127.0.0.1',port:4201,strictPort:true}});
 await server.listen();
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1280,height:850},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://127.0.0.1:4201/#/app/parties?id=c1&role=Customer');
  // Semantic labels are visible as text, not color alone.
  assert.ok(await page.getByLabel('Money in').count()>0);
  assert.ok(await page.getByLabel('Customer due increased').count()>0);
  await page.getByRole('button',{name:'Edit opening balance'}).click();
  const opening=page.getByRole('dialog',{name:'Party opening balance'});
  await opening.waitFor();
  await opening.getByRole('textbox',{name:'Opening balance amount'}).fill('5000');
  await opening.getByRole('button',{name:'Save opening balance'}).click();
  await opening.waitFor({state:'hidden'});
  assert.ok(await page.getByText('5,000', {exact:false}).count()>0);
  // Add Party supports separate opening balances in two relationships.
  await page.getByRole('button',{name:/Add party/i}).click();
  const editor=page.getByRole('dialog',{name:'Add party'});
  await editor.getByLabel('Party name').fill('Opening QA');
  await editor.getByLabel('Phone').fill('01700011444');
  await editor.getByLabel('Area').fill('Dhaka');
  await editor.getByRole('checkbox',{name:'Supplier'}).check();
  await editor.locator('summary').filter({hasText:'Opening balances'}).click();
  await editor.getByRole('textbox',{name:'Opening amount Customer'}).fill('800');
  await editor.getByRole('textbox',{name:'Opening amount Supplier'}).fill('1200');
  await editor.getByRole('button',{name:'Save party'}).click();
  await editor.waitFor({state:'hidden'});
  assert.ok(await page.getByText('Opening QA',{exact:true}).count()>0);
  await page.getByRole('combobox',{name:'Relationship'}).click();
  await page.getByRole('listbox',{name:'Relationship options'}).getByRole('option',{name:'Supplier',exact:true}).click();
  await page.getByRole('button',{name:'Edit opening balance'}).click();
  const supplier=page.getByRole('dialog',{name:'Party opening balance'});
  await supplier.getByRole('textbox',{name:'Opening balance amount'}).fill('700');
  await supplier.getByRole('button',{name:'Save opening balance'}).click();
  await supplier.waitFor({state:'hidden'});
  await page.setViewportSize({width:375,height:812});
  assert.ok(await page.getByLabel('Opening balance').count()>0);
  assert.deepEqual(errors,[]);
  console.log('Party opening create/edit + ledger semantic impact desktop/mobile smoke passed');
 }finally{await browser.close();await server.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
