/* Bundle editor regression: original stock components, automatic history, mobile popup. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
async function run(){
 const {createServer}=await import('vite');
 const server=await createServer({server:{host:'127.0.0.1',port:4473,strictPort:true}});
 await server.listen();
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
 const errors=[];
 try{
  for(const viewport of [{width:390,height:844},{width:1024,height:768}]){
   const page=await browser.newPage({viewport,reducedMotion:'reduce'});
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:4473/#/app/products');
   await page.getByRole('button',{name:/Add package/i}).click();
   const editor=page.getByTestId('bundle-editor');
   await editor.waitFor();
   await editor.getByRole('textbox',{name:'Package name'}).fill('Tubewell Set');
   const sku='PKG-'+viewport.width+'-'+Date.now();
   await editor.getByRole('textbox',{name:'Package SKU'}).fill(sku);
   await editor.getByRole('textbox',{name:'Price per Set'}).fill('5000');
   for(const [i,name] of ['LED Bulb 12W','Wire Mesh Net 3 ft'].entries()){
    const pick=editor.getByRole('combobox',{name:'Find stock component'});
    await pick.fill(name);
    await pick.press('Enter');
    assert.equal(await editor.getByTestId('bundle-component-row').count(),i+1);
   }
   assert.equal(await editor.getByTestId('bundle-component-row').count(),2);
   await editor.getByTestId('bundle-component-row').first().getByRole('textbox',{name:/quantity/i}).first().fill('2');
   await editor.getByRole('button',{name:'Save package'}).click();
   await editor.waitFor({state:'hidden'});
   const initial=await page.evaluate(async id=>{
    const mod=await import('/src/data/productImportPreviewStore.ts');
    const state=mod.getProductImportPreviewSnapshot();
    const p=state.products.find(p=>p.sku===id);
    return state.bundleVersions.find(x=>x.bundleProductId===p?.id);
   },sku);
   assert.equal(initial.revision,1);
   assert.equal(initial.components.length,2);
   const actions=page.getByRole('button',{name:'Actions for Tubewell Set'}).last();
   await actions.click();
   await page.getByRole('button',{name:'Edit product'}).last().click();
   await editor.waitFor();
   await editor.getByTestId('bundle-component-row').first().getByRole('textbox',{name:/quantity/i}).first().fill('3');
   await editor.getByRole('button',{name:'Save package'}).click();
   const revisions=await page.evaluate(async id=>{
    const mod=await import('/src/data/productImportPreviewStore.ts');
    const state=mod.getProductImportPreviewSnapshot();
    const p=state.products.find(p=>p.sku===id);
    return state.bundleVersions.filter(x=>x.bundleProductId===p?.id);
   },sku);
   assert.equal(revisions.length,2);
   assert.equal(revisions[0].components[0].primaryQty,'2');
   assert.equal(revisions[1].components[0].primaryQty,'3');
   assert.equal(await page.locator('body').evaluate(el=>el.scrollWidth<=innerWidth),true);
   await page.close();
  }
  assert.deepEqual(errors,[]);
  console.log('Bundle editor creation, two revisions and mobile/landscape: PASS');
 }finally{await browser.close();await server.close();}
}
run().catch(e=>{console.error(e);process.exitCode=1});
