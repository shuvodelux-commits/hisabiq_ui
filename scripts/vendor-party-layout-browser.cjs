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
  assert.equal(await page.getByRole('tablist',{name:'Vendor work tabs'}).getByRole('tab').count(),5);
  assert.ok(await directory.getByRole('option',{name:/Shapla Transport/}).count()>0,
   'Vendor remains in the always-visible left directory');

  // Match the shared Parties desktop split, but keep the selected Vendor work immediately accessible on mobile.
  for(const width of [1440,1024,768,390,320]){
   await page.setViewportSize({width,height:900});
   const right=await workspace.boundingBox();
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
   assert.ok(overflow<=2,`Vendor page must not overflow the ${width}px viewport; overflow=${overflow}px`);
   assert.ok(right,'Selected Vendor detail must be rendered');
   const mobilePicker=page.getByTestId('mobile-vendor-picker');
   if(width>=1024){
    const left=await directory.boundingBox();
    assert.ok(left,'Desktop Vendor directory remains visible');
    assert.ok(await mobilePicker.isHidden(),'Compact selector must not replace the desktop directory');
    assert.ok(right.x>=left.x+left.width-2,'Desktop Vendor detail must sit right of directory');
    if(width>=1280)assert.ok(Math.abs(left.width-380)<3,'Desktop directory must match Parties width');
   }else{
    assert.ok(await directory.isHidden(),'Long Vendor directory must not push the ledger down on mobile');
    assert.ok(await mobilePicker.isVisible(),'Mobile selector must be visible');
    const chooser=await mobilePicker.boundingBox();
    assert.ok(chooser&&right.y>=chooser.y+chooser.height-2,'Vendor work follows the compact chooser');
   }
  }

  await page.setViewportSize({width:390,height:844});
  const mobilePicker=page.getByTestId('mobile-vendor-picker');
  await mobilePicker.click();
  const pickerDialog=page.getByRole('dialog',{name:/Choose Vendor/});
  await pickerDialog.waitFor();
  const chooserSearch=pickerDialog.getByRole('textbox',{name:/Search Vendors/});
  await chooserSearch.fill('Padma');
  await chooserSearch.press('Enter');
  await pickerDialog.waitFor({state:'hidden'});
  assert.ok(await mobilePicker.textContent().then(label=>label.includes('Padma')),'Selected mobile Vendor must update');
  assert.ok(await mobilePicker.evaluate(node=>node===document.activeElement),'Dialog must restore keyboard focus to selector');
  await mobilePicker.click();
  await page.keyboard.press('Escape');
  await pickerDialog.waitFor({state:'hidden'});

  // A half-filled Vendor goods memo must survive canceling a tab switch.
  await workspace.getByRole('button',{name:/Take Products/}).click();
  const memo=workspace.getByRole('textbox',{name:'Vendor memo reference'});
  await memo.fill('DRAFT-KEEP');
  await workspace.getByRole('tab',{name:/Given/}).click();
  const discard=page.getByRole('dialog',{name:/Leave without saving/});
  await discard.waitFor();
  await discard.getByRole('button',{name:/Keep editing/}).click();
  assert.equal(await memo.inputValue(),'DRAFT-KEEP','Cancel must preserve in-progress goods');
  await workspace.getByRole('tab',{name:/Given/}).click();
  await discard.getByRole('button',{name:/Discard changes/}).click();
  await discard.waitFor({state:'hidden'});
  await workspace.getByRole('tab',{name:/Given/}).waitFor();

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
  console.log('Vendor preserves Parties desktop layout, compact mobile picker, modal keyboard/focus, in-place add/edit and payment flows at 320/390/768/1024/1440');
 }finally{
  await browser.close();
  await server.close();
 }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
