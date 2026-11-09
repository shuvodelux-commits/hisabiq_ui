const {chromium}=require('playwright');
const assert=require('node:assert/strict');

async function main(){
 const {createServer}=await import('vite');
 const server=await createServer({server:{host:'127.0.0.1',port:4389,strictPort:true}});
 await server.listen();
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
 const errors=[];
 try{
  for(const width of [320,390,768,1024,1440])for(const theme of ['light','dark']){
   const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce',colorScheme:theme});
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:4389/#/app/vendors?partyId=v1&tab=ledger');
   const workspace=page.getByRole('region',{name:'Selected Vendor work'});
   await workspace.waitFor();
   const picker=width<640;
   if(picker)await page.getByRole('button',{name:'Choose Vendor'}).click();
   const region=picker?page.getByRole('dialog',{name:'Choose Vendor'}):page.getByRole('region',{name:'Vendor directory'});
   const search=region.getByRole('textbox',{name:'Search Vendors'});
   await search.fill('nothing-can-match-this-vendor');
   const clear=region.getByRole('button',{name:'Clear Vendor search'});
   await clear.click();
   assert.equal(await search.inputValue(),'','clear search restores the directory');
   await region.getByRole('group',{name:'Vendor filter'}).getByRole('button',{name:/Needs price/}).click();
   assert.equal(await region.getByRole('button',{name:/Needs price/}).getAttribute('aria-pressed'),'true');
   const filterReset=region.getByRole('button',{name:/Clear filters/});
   if(await filterReset.count())await filterReset.click();
   else await region.getByRole('group',{name:'Vendor filter'}).getByRole('button',{name:/All/}).click();
   assert.equal(await region.getByRole('button',{name:/All/}).getAttribute('aria-pressed'),'true');
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
   assert.ok(overflow<=2,'no viewport overflow '+width+'/'+theme+': '+overflow);
   if(picker){await page.keyboard.press('Escape');await page.getByRole('button',{name:'More Vendor actions'}).click();await page.getByRole('dialog',{name:'More Vendor actions'}).waitFor();}
   await page.close();
   console.log('Vendor directory validated '+width+'px '+theme);
  }
  assert.deepEqual(errors,[]);
  console.log('Vendor refine: 10/10 viewport/theme journeys');
 }finally{await browser.close();await server.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
