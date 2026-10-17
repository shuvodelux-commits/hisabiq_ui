/* V1 Bundle POS: one parent cart line, frozen recipe revision, combined-stock warning, no inventory posting. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
async function main(){
 const {createServer}=await import('vite');
 const server=await createServer({server:{host:'127.0.0.1',port:4483,strictPort:true}});await server.listen();
 const browser=await chromium.launch({args:['--no-sandbox']});
 try{
  for(const viewport of [{width:390,height:844},{width:1024,height:768}]){
   const page=await browser.newPage({viewport,reducedMotion:'reduce'});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:4483/#/app/pos');
   await page.evaluate(async()=>{
    const m=await import('/src/data/productImportPreviewStore.ts');
    const p=m.getProductImportPreviewSnapshot().products;
    const pipe=p.find(x=>x.id==='p2'),net=p.find(x=>x.id==='p5');
    const v=await import('/src/bundles/bundleValidation.ts');
    m.upsertBundlePreview({
     product:{id:'bundle-check-'+Date.now(),kind:'Bundle',name:'Tubewell Package',sku:'PKG-TEST-01',category:'Hardware',unit:'Set',stock:0,minStock:0,purchasePrice:0,sellPrice:4900,active:true},
     components:[v.makeBundleComponent(pipe,'Pcs','3','',0),v.makeBundleComponent(net,'Gira','4','',1)]
    },null);
   });
   const picker=page.getByRole('combobox',{name:/Add product|পণ্য যোগ করুন/}).first();
   await picker.fill('PKG-TEST-01');
   await picker.press('ArrowDown');
   await picker.press('Enter');
   const row=page.getByTestId('pos-cart-row').filter({hasText:'Tubewell Package'});
   await row.waitFor();
   assert.equal(await row.count(),1);
   assert.equal(await row.getByRole('textbox',{name:/Quantity/}).count()>0,true);
   assert.match(await row.innerText(),/3|products|পণ্য/);
   const proof=await page.evaluate(async()=>{
    const state=await import('/src/data/productImportPreviewStore.ts');
    return state.getProductImportPreviewSnapshot().bundleVersions.find(x=>x.bundleProductId.startsWith('bundle-check-'))?.revision;
   });assert.equal(proof,1);
   await row.getByRole('textbox',{name:/Quantity/}).first().fill('1.5');
   await page.getByRole('button',{name:/Preview sale|বিক্রির হিসাব দেখুন/}).click();
   await page.getByText(/whole Sets|পূর্ণ সেট/).waitFor();
   assert.equal(await page.locator('[data-dialog-root]').count(),0);
   assert.deepEqual(errors,[]);
   await page.close();
  }
  console.log('POS bundle: revision-locked parent row and integer Set safety passed');
 }finally{await browser.close();await server.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1});
