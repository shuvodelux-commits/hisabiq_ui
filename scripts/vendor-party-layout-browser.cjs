const {chromium}=require('playwright');
const assert=require('node:assert/strict');

async function main(){
 const {createServer}=await import('vite');
 const server=await createServer({server:{host:'127.0.0.1',port:4286,strictPort:true}});
 await server.listen();
 const browser=await chromium.launch({
  executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']
 });
 const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://127.0.0.1:4286/#/app/vendors?partyId=v1&tab=ledger');
  const directory=page.getByRole('region',{name:'Vendor directory'});
  const workspace=page.getByRole('region',{name:'Selected Vendor work'});
  await directory.waitFor();
  await workspace.waitFor();
  assert.equal(await page.getByRole('region',{name:'Vendor module'}).count(),1);
  const tabs=page.getByRole('tablist',{name:'Vendor work tabs'});
  assert.equal(await tabs.getByRole('tab').count(),5);
  assert.equal(await tabs.evaluate(el=>getComputedStyle(el).display),'flex','Vendor tabs use the same horizontal text-tab layout as Parties');
  assert.ok((await tabs.getByRole('tab',{name:/Ledger/}).getAttribute('class'))?.includes('erp-tab-active'),
   'Active Vendor tab uses the shared Party underline');
  assert.ok(!(await tabs.getByRole('tab',{name:/Ledger/}).getAttribute('class'))?.includes('border-b-2'),
   'Vendor tab does not stack a second button-like underline');
  assert.match(await tabs.getByRole('tab',{name:/Taken/}).getAttribute('title')??'',/Goods received/,
   'Ambiguous tab names explain the goods flow on hover');
  assert.ok(await directory.getByRole('option',{name:/Shapla Transport/}).count()>0,
   'Vendor remains in the always-visible left directory');

  // Match the shared Parties 380px/remaining desktop split and stacked mobile flow.
  for(const width of [1440,1024,768,390]){
   await page.setViewportSize({width,height:900});
   const left=await directory.boundingBox();
   const right=await workspace.boundingBox();
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
   assert.ok(overflow<=2,`Vendor page must not overflow the ${width}px viewport; overflow=${overflow}px`);
   assert.equal(await tabs.evaluate(el=>getComputedStyle(el).display),'flex',
    'Tablist stays a scrollable horizontal Party-style strip at '+width);
   await workspace.getByRole('button',{name:'Explain Vendor receivable'}).focus();
   const tip=workspace.getByRole('tooltip').filter({hasText:/Money the vendor still owes/});
   const bounds=await tip.boundingBox();
   assert.ok(bounds,'Balance explanation must be available from keyboard and touch focus');
   assert.ok(bounds.x>=-2&&bounds.x+bounds.width<=width+2,
    'Balance tooltip must stay on-screen at '+width+': '+JSON.stringify(bounds));
   assert.ok(left&&right,'Both directory and selected detail must be rendered');
   if(width>=1024){
    assert.ok(right.x>=left.x+left.width-2,'Desktop Vendor detail must sit right of directory');
    if(width>=1280)assert.ok(Math.abs(left.width-380)<3,'Desktop directory must match Parties width');
   }else{
    assert.ok(right.y>=left.y+left.height-2,'Mobile and tablet Vendor detail must stack after directory');
   }
  }

  await page.setViewportSize({width:1440,height:900});
  await directory.getByRole('button',{name:/Needs price/}).click();
  await directory.getByRole('option',{name:/Shapla Transport/}).click();
  assert.ok(page.url().includes('partyId='),'Vendor selection should retain deep-link state');
  await directory.waitFor();
  await workspace.waitFor();
  await workspace.getByRole('tab',{name:/Taken/}).click();
  await workspace.getByRole('region',{name:'Taken product workplace'}).waitFor();

  await workspace.getByRole('button',{name:/Edit Vendor/}).click();
  await page.getByRole('dialog',{name:/Edit party/}).waitFor();
  await page.keyboard.press('Escape');
  await page.getByRole('dialog',{name:/Edit party/}).waitFor({state:'hidden'});

  await page.getByRole('button',{name:'Add Vendor'}).click();
  await page.getByRole('dialog',{name:/Add party/}).waitFor();
  await page.keyboard.press('Escape');

  await workspace.getByRole('tab',{name:/Payments/}).click();
  await workspace.getByRole('region',{name:'Vendor payments workspace'}).waitFor();
  assert.deepEqual(errors,[]);
  console.log('Vendor uses Parties split layout with in-place add/edit, preserved sourcing and payments, responsive at 390/768/1024/1440');
 }finally{
  await browser.close();
  await server.close();
 }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
