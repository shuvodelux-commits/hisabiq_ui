/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');

async function joinedGeometry(field,count){
 const box=await field.boundingBox();assert.ok(box&&Math.abs(box.height-36)<1,'one 36px shell');
 const inputs=await field.locator('input').all();assert.equal(inputs.length,count);
 for(const input of inputs){const rect=await input.boundingBox();
  assert.ok(rect&&rect.width>=24&&Math.abs(rect.y-box.y)<=2,'all units on the same line');
  assert.ok(rect.x>=box.x&&rect.x+rect.width<=box.x+box.width,'input stays inside shell');
 }
 assert.equal(await field.locator('[data-numeric-joined]').count(),0,'no nested bordered fields');
}
async function main(){
 const {createServer}=await import('vite');
 const server=await createServer({server:{host:'127.0.0.1',port:4481,strictPort:true}});await server.listen();
 let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
  for(const [width,theme,language]of[[320,'dark','Bangla'],[390,'light','English'],[1440,'dark','English'],[1920,'light','English']]){
   const context=await browser.newContext({viewport:{width,height:1000},hasTouch:width<500,reducedMotion:'reduce'});
   await context.addInitScript(({theme,language})=>{
    localStorage.setItem('hisabiq-theme',theme);
    localStorage.setItem('hisabiq-erp-personal-v1',JSON.stringify({mode:'Simple',language,density:'Compact'}));
   },{theme,language});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:4481/#/design-system');
   const specimens=page.locator('#specimen-quantities');await specimens.scrollIntoViewIfNeeded();
   for(const count of [3,4]){
    const field=specimens.locator(`[data-unit-count="${count}"]`);await joinedGeometry(field,count);
    assert.deepEqual(await field.locator('[data-table-helper]').allTextContents(),count===3?['CT','Box','pcs']:['CT','Box','pcs','Ft']);
   }
   assert.deepEqual(errors,[]);await context.close();console.log('Joined 3/4-unit specimens:',width,theme,language);
  }
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  await page.goto('http://127.0.0.1:4481/#/app/products?view=settings&tab=units');
  const name=page.getByRole('textbox',{name:'Unit name',exact:true}),symbol=page.locator('#new-unit-symbol');
  await name.fill('Test packet');await page.getByRole('button',{name:'Add',exact:true}).click();
  await page.getByRole('alert').filter({hasText:'1–4'}).waitFor();
  assert.equal(await symbol.evaluate(el=>el===document.activeElement),true,'focus missing symbol');
  await symbol.fill('Pieces');await page.getByRole('button',{name:'Add',exact:true}).click();
  await page.getByRole('alert').filter({hasText:'1–4'}).waitFor();
  await symbol.fill('pcs');await page.getByRole('button',{name:'Add',exact:true}).click();
  await page.getByRole('alert').filter({hasText:'already exists'}).waitFor();
  await symbol.fill('Pkt');await page.getByRole('button',{name:'Add',exact:true}).click();
  await page.getByRole('row').filter({hasText:'Test packet'}).getByText('Pkt',{exact:true}).waitFor();
  await page.goto('http://127.0.0.1:4481/#/app/products');
  await page.getByRole('button',{name:'Add product',exact:true}).click();
  const editor=page.locator('[data-product-editor]');await editor.locator('#pf-name').fill('Preserved product draft');
  await editor.locator('#pf-unit').click();await page.getByText('Add new unit',{exact:true}).last().click();
  const quick=page.getByRole('dialog',{name:'New unit',exact:true});await quick.locator('#qa-name').fill('Test quick unit');
  await quick.getByRole('button',{name:'Add unit',exact:true}).click();await quick.getByRole('alert').filter({hasText:'1–4'}).waitFor();
  assert.equal(await quick.locator('#qa-symbol').evaluate(el=>el===document.activeElement),true);
  await quick.locator('#qa-symbol').fill('Tq');await quick.getByRole('button',{name:'Add unit',exact:true}).click();
  await quick.waitFor({state:'hidden'});assert.equal(await editor.locator('#pf-name').inputValue(),'Preserved product draft');
  assert.equal(await editor.locator('#pf-unit').getAttribute('data-value'),'Tq');
  // A separate page keeps the source-linked return test independent of the dirty product draft.
  const returns=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  await returns.goto('http://127.0.0.1:4481/#/app/sales?tab=return');
  await returns.evaluate(async()=>{
   const {updateSalesPreview}=await import('/src/data/salesPreviewStore.ts');
   updateSalesPreview('invoices',items=>[{...items[0],id:'unit-return-qa',invoice:'UNIT-RETURN-QA',
    subtotal:100000,total:100000,discount:0,rounding:0,paid:0,due:100000,
    lines:[{id:'unit-return-line',productId:'p9',name:'Frozen chain return',unit:'Feet',quantity:'100000',
     soldBaseQuantity:100000,returnableQuantity:100000,price:1,total:100000,
     unitSnapshot:{baseUnit:'Feet',factors:{Carton:28800,Box:2400,Pcs:120,Feet:1},purchasePrices:{},sellingPrices:{}}}]
   },...items]);
  });
  await returns.getByRole('checkbox').first().check();
  const row=returns.getByRole('row').filter({hasText:'Frozen chain return'}),field=row.locator('[data-multi-quantity]');
  await joinedGeometry(field,4);
  for(const [unit,qty]of[['Carton','1'],['Box','2'],['Pcs','3'],['Feet','10']])await field.getByRole('textbox',{name:'Quantity in '+unit,exact:true}).fill(qty);
  await field.getByRole('textbox',{name:'Quantity in Carton',exact:true}).press('Enter');
  assert.equal(await field.getByRole('textbox',{name:'Quantity in Box',exact:true}).evaluate(el=>el===document.activeElement),true);
  await returns.getByText('৳33,970',{exact:true}).first().waitFor();
  await field.getByRole('textbox',{name:'Quantity in Carton',exact:true}).fill('10');
  assert.equal(await returns.getByRole('button',{name:'Complete return',exact:true}).isDisabled(),true,'source limit still enforced');
  console.log('Unit Settings, required Quick Add, preserved draft and historical multi-unit return passed');
 }finally{await browser?.close();await server.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
