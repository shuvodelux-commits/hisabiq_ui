const {chromium}=require('playwright');const assert=require('node:assert/strict');
async function main(){const {createServer}=await import('vite');const server=await createServer({server:{host:'127.0.0.1',port:4300,strictPort:true}});await server.listen();
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
 try{for(const width of [390,768,1024,1440])for(const theme of ['light','dark']){
  const context=await browser.newContext({viewport:{width,height:768},hasTouch:width<1440,reducedMotion:'reduce'});
  await context.addInitScript(t=>localStorage.setItem('hisabiq-theme',t),theme);const page=await context.newPage();
  await page.goto('http://127.0.0.1:4300/#/app/purchases/new');
  const search=page.getByRole('combobox',{name:'Search product to add to purchase'});await search.fill('Missing dialog product');
  await page.getByRole('button',{name:/Create new product/}).click();const dialog=page.getByRole('dialog',{name:'Add product',exact:true});await dialog.waitFor();
  assert.equal(await page.evaluate(()=>document.body.style.overflow),'hidden');
  const bounds=await dialog.boundingBox();assert.ok(bounds.x>=0&&bounds.y>=0&&bounds.x+bounds.width<=width+2&&bounds.y+bounds.height<=770);
  await dialog.locator('#pf-name').fill('Preserved draft');await dialog.locator('#pf-category').click();
  await page.getByText('Add new category',{exact:true}).click();const child=page.getByRole('dialog',{name:'New category',exact:true});await child.waitFor();
  await child.locator('#qa-name').fill('Nested draft');await page.keyboard.press('Escape');await child.waitFor({state:'hidden'});
  assert.equal(await dialog.locator('#pf-name').inputValue(),'Preserved draft');assert.equal(await page.evaluate(()=>document.body.style.overflow),'hidden');
  await dialog.locator('#pf-category').click();await page.getByRole('combobox',{name:'Search category',exact:true}).focus();await page.keyboard.press('Escape');assert.equal(await dialog.isVisible(),true,'picker Escape preserves editor');
  await dialog.getByRole('button',{name:'Cancel',exact:true}).click();await page.getByRole('button',{name:'Discard',exact:true}).click();await dialog.waitFor({state:'hidden'});
  assert.notEqual(await page.evaluate(()=>document.body.style.overflow),'hidden');assert.equal(await search.isVisible(),true);
  await context.close();
 }}finally{await browser.close();await server.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
