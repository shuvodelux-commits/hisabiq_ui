const {chromium}=require('playwright');
const assert=require('node:assert/strict');
async function main(){
 const {createServer}=await import('vite');
 const server=await createServer({server:{host:'127.0.0.1',port:4297,strictPort:true}});await server.listen();
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
 try{
  for(const width of [390,768,1024,1440])for(const theme of ['light','dark']){
   const page=await browser.newPage({viewport:{width,height:900},colorScheme:theme});const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:4297/#/app/vendors');
   await page.getByRole('button',{name:/Needs price/}).click();
   await page.getByRole('listbox',{name:'Vendors'}).getByRole('option',{name:/Shapla Transport/}).click();
   const work=page.getByRole('region',{name:'Taken product workplace'});
   await work.getByRole('form',{name:'Set Vendor price'}).waitFor();
   if(width<1024){
    const choose=work.getByRole('button',{name:/Choose another memo/});await choose.click();
    assert.equal(await work.getByRole('form',{name:'Set Vendor price'}).isVisible(),false);
    await work.locator('button[aria-pressed]').first().click();
    assert.equal(await work.getByRole('form',{name:'Set Vendor price'}).isVisible(),true);
   }
   const tabs=page.getByRole('tablist',{name:'Vendor work tabs'});
   await tabs.getByRole('tab',{name:/Payments/}).click();
   await page.getByRole('region',{name:'Vendor payments workspace'}).waitFor();
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'no page overflow at '+width);
   assert.deepEqual(errors,[]);await page.close();
  }
  console.log('Vendor price-first entry, mobile memo selection, payment workspace and eight viewport/theme combinations passed');
 }finally{await browser.close();await server.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
