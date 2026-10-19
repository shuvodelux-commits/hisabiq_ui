const {chromium}=require('playwright');
const assert=require('node:assert/strict');
async function main(){
 const {createServer}=await import('vite');
 const server=await createServer({server:{host:'127.0.0.1',port:4471,strictPort:true}});
 await server.listen();
 const browser=await chromium.launch({args:['--no-sandbox']});
 try {
  for(const width of [320,390,1440]){
   const page=await browser.newPage({viewport:{width,height:width<500?844:900},reducedMotion:'reduce',hasTouch:width<500});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:4471/#/app/products');
   await page.getByRole('button',{name:'Add product',exact:true}).click();
   const dlg=page.locator('[data-slot="dialog-content"]').last();
   await dlg.waitFor();
   const name='Unit Chain QA '+width;
   await dlg.getByPlaceholder('e.g. LED Bulb 12W').fill(name);
   const rows=dlg.locator('[data-product-unit-relationship]');
   assert.equal(await rows.count(),1);
   await dlg.getByRole('button',{name:'Add another unit'}).click();
   assert.equal(await rows.count(),2);
   await rows.nth(1).getByRole('combobox',{name:'Smaller unit 2 unit'}).click();
   await page.getByRole('option',{name:'Pcs',exact:true}).click();
   await rows.nth(1).getByRole('textbox',{name:'Smaller unit 2'}).fill('5');
   const firstInput=rows.first().getByRole('textbox',{name:'Larger unit 1'});
   assert.equal(await firstInput.inputValue(),'1');
   assert.equal(await firstInput.getAttribute('readonly'),'');
   for(const row of await rows.all()){
    const widths=await row.locator('[data-numeric-joined]').evaluateAll(nodes=>nodes.map(node=>{
     const shell=node.getBoundingClientRect(),input=node.querySelector('input')?.getBoundingClientRect();
     return {shell:shell.width,input:input?.width??0,viewport:innerWidth};
    }));
    assert.ok(widths.every(x=>x.shell>115 && x.input>24 && x.shell<=x.viewport),'joined quantity/unit fields remain usable and visible at '+width);
   }
   const saleUnit=dlg.getByRole('combobox',{name:'Selling price unit'});
   await saleUnit.click();await page.getByRole('option',{name:'Gauge',exact:true}).click();
   await dlg.getByRole('textbox',{name:'Selling price',exact:true}).fill('3200');
   const buyUnit=dlg.getByRole('combobox',{name:'Purchase price unit'});
   await buyUnit.click();await page.getByRole('option',{name:'Gauge',exact:true}).click();
   await dlg.getByRole('textbox',{name:'Purchase price',exact:true}).fill('1800');
   await dlg.getByRole('checkbox',{name:/Set different prices for each unit/}).check();
   await dlg.getByRole('textbox',{name:'Selling price per Gira'}).fill('230');
   await dlg.getByRole('textbox',{name:'Selling price per Pcs'}).fill('30');
   await dlg.getByRole('textbox',{name:'Purchase price per Gira'}).fill('160');
   await dlg.getByRole('textbox',{name:'Purchase price per Pcs'}).fill('15');
   await dlg.getByRole('button',{name:'Save product',exact:true}).click();
   await dlg.waitFor({state:'hidden'});

   await page.evaluate(()=>{location.hash='#/app/pos';});
   const addSale=page.getByRole('combobox',{name:'Add product'});
   await addSale.fill(name);await page.getByRole('option',{name:new RegExp(name)}).first().click();
   const sale=page.getByTestId('pos-cart-row').filter({hasText:name}).first();
   await sale.locator('[data-multi-quantity]').waitFor();
   await sale.getByRole('textbox',{name:'Quantity in Gauge'}).fill('1');
   await sale.getByRole('textbox',{name:'Quantity in Gira'}).fill('2');
   await sale.getByRole('textbox',{name:'Quantity in Pcs'}).fill('3');
   await sale.getByText(/3,750/).waitFor();

   await page.evaluate(()=>{location.hash='#/app/purchases/new';});
   const addPurchase=page.getByRole('combobox',{name:'Search product to add to purchase'});
   await addPurchase.fill(name);await page.getByRole('option',{name:new RegExp(name)}).first().click();
   const purchase=page.getByTestId('purchase-cart-row').filter({hasText:name}).first();
   await purchase.locator('[data-multi-quantity]').waitFor();
   await purchase.getByRole('textbox',{name:'Quantity in Gauge'}).fill('1');
   await purchase.getByRole('textbox',{name:'Quantity in Gira'}).fill('2');
   await purchase.getByRole('textbox',{name:'Quantity in Pcs'}).fill('3');
   await purchase.getByText(/2,165/).waitFor();
   assert.deepEqual(errors,[],'browser errors at '+width);
   await page.close();
   console.log('Three-level joined fields, prices, POS and Purchase validated at '+width+'px');
  }
 }finally{await browser.close();await server.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
