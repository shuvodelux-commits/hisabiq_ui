/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
const {chromium}=require('playwright');const assert=require('node:assert/strict');
const {fillChain}=require('./product-form-browser-helpers.cjs');
async function main(){
 const {createServer}=await import('vite');const server=await createServer({server:{host:'127.0.0.1',port:4471,strictPort:true}});await server.listen();
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
 try{for(const width of [320,390,1440]){
  const page=await browser.newPage({viewport:{width,height:900},hasTouch:width<500,reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4471/#/app/products');
  await page.getByRole('button',{name:'Add product',exact:true}).click();const editor=page.locator('[data-product-editor]');
  const name='Four unit cart QA '+width;await fillChain(page,editor,name);await editor.locator('#pf-opening').fill('10');
  await editor.locator('details summary').click();
  await editor.getByRole('textbox',{name:'Selling price per Box',exact:true}).fill('4500');
  await editor.getByRole('textbox',{name:'Purchase price per Box',exact:true}).fill('3000');
  await editor.getByRole('button',{name:'Save product',exact:true}).click();await editor.waitFor({state:'hidden'});
  for(const [route,label,testId,total]of[['pos','Add product','pos-cart-row','67,340'],['purchases/new','Search product to add to purchase','purchase-cart-row','49,755']]){
   await page.evaluate(route=>{location.hash='#/app/'+route;},route);
   const picker=page.getByRole('combobox',{name:label,exact:true});await picker.fill(name);
   await page.getByRole('option').filter({hasText:name}).first().click();const row=page.getByTestId(testId).filter({hasText:name});
   for(const [unit,qty]of[['Carton','1'],['Box','2'],['Pcs','3'],['Feet','10']])await row.getByRole('textbox',{name:'Quantity in '+unit,exact:true}).fill(qty);
   await row.getByRole('textbox',{name:'Quantity in Carton',exact:true}).press('Enter');
   assert.equal(await row.getByRole('textbox',{name:'Quantity in Box',exact:true}).evaluate(el=>document.activeElement===el),true,'Enter follows unit order');
   await row.getByText(new RegExp(total)).waitFor();
   const field=row.locator('[data-multi-quantity]');
   assert.equal(await field.locator('[data-numeric-joined]').count(),0,'one outer joined shell');
   const shell=await field.boundingBox();assert.ok(shell&&Math.abs(shell.height-36)<1,'36px quantity field');
   const inputs=await field.locator('input').all();assert.equal(inputs.length,4);
   let previous=shell.x;
   for(const input of inputs){const box=await input.boundingBox();
    assert.ok(box&&box.width>=24&&Math.abs(box.y-shell.y)<=2,'quantity inputs fit on one horizontal line');
    assert.ok(box.x>=previous&&box.x+box.width<=shell.x+shell.width,'no overlapping or clipped inputs');previous=box.x+box.width;
   }
   assert.deepEqual(await field.locator('[data-table-helper]').allTextContents(),['CT','Box','pcs','Ft']);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no page overflow');
  }
  assert.deepEqual(errors,[]);await page.close();console.log('Four-unit products, custom prices, POS and Purchase totals:',width);
 }}finally{await browser.close();await server.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
