const {chromium}=require('playwright');
const assert=require('node:assert/strict');
async function main(){
 const {createServer}=await import('vite');const server=await createServer({server:{host:'127.0.0.1',port:4252,strictPort:true}});await server.listen();
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
 try{for(const width of [1440,768,390])for(const theme of ['light','dark']){
  const context=await browser.newContext({viewport:{width,height:960},reducedMotion:'reduce'});
  const page=await context.newPage();page.setDefaultTimeout(8000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4252/#/app/products?view=settings');
  await page.evaluate(theme=>{document.documentElement.classList.toggle('dark',theme==='dark');},theme);
  const openEdit=async(name)=>{await page.getByRole('button',{name:'Actions for '+name,exact:true}).click();await page.getByRole('button',{name:'Edit',exact:true}).click();};
  await openEdit('Plumbing');const dialog=page.getByRole('dialog');
  await dialog.getByLabel('Category name',{exact:true}).fill('Plumbing supplies');
  await dialog.getByLabel('Bangla name',{exact:true}).fill('প্লাম্বিং সামগ্রী');
  await dialog.getByRole('button',{name:'Save changes',exact:true}).click();await dialog.waitFor({state:'hidden'});
  await page.getByRole('row').filter({hasText:'Plumbing supplies'}).waitFor();
  await openEdit('Steel');await dialog.getByLabel('Category name',{exact:true}).fill('Electrical');
  await dialog.getByRole('button',{name:'Save changes',exact:true}).click();await dialog.getByRole('alert').waitFor();
  await dialog.getByRole('button',{name:'Cancel',exact:true}).click();
  await page.getByRole('tab',{name:'Units',exact:true}).click();await openEdit('Piece');
  await dialog.getByLabel('Symbol',{exact:false}).fill('too long');await dialog.getByRole('button',{name:'Save changes',exact:true}).click();await dialog.getByRole('alert').waitFor();
  await dialog.getByLabel('Unit name',{exact:true}).fill('Single piece');await dialog.getByLabel('Symbol',{exact:false}).fill('pc');
  await dialog.getByRole('button',{name:'Save changes',exact:true}).click();await dialog.waitFor({state:'hidden'});
  assert.ok((await page.getByRole('row').filter({hasText:'Single piece'}).textContent()).includes('pc'));
  await page.getByRole('tab',{name:'Brands',exact:true}).click();await openEdit('RFL');
  await dialog.getByLabel('Brand name',{exact:true}).fill('RFL Group');await dialog.getByRole('button',{name:'Save changes',exact:true}).click();await dialog.waitFor({state:'hidden'});
  await openEdit('RFL Group');await dialog.getByLabel('Brand name',{exact:true}).fill('Cancelled name');await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
  assert.equal(await page.getByRole('row').filter({hasText:'Cancelled name'}).count(),0);
  await page.getByRole('tab',{name:/Product list/}).click();await page.getByRole('tab',{name:/Product settings/}).click();
  await page.getByRole('row').filter({hasText:'Plumbing supplies'}).waitFor();
  assert.deepEqual(errors,[]);await context.close();console.log('Product settings Edit, save, duplicate/symbol validation, cancel and revisit:',width,theme);
 }}finally{await browser.close();server.httpServer?.closeAllConnections();await server.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
