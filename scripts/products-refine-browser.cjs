/* Products refinement: actual Chromium layout, focus and scroll regression matrix.
 * Uses the already-running isolated preview; never posts stock or edits source data.
 */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.PRODUCTS_REFINE_BASE||'http://127.0.0.1:32821';
const widths=process.env.PRODUCTS_REFINE_WIDTHS?.split(',').map(Number)||[320,390,768,1024,1280,1440];
async function main(){
 const browser=await chromium.launch({args:['--no-sandbox']});
 try{for(const language of ['English','English + Bangla','Bangla'])for(const theme of ['light','dark'])for(const width of widths){
  const context=await browser.newContext({viewport:{width,height:900},hasTouch:true,reducedMotion:'reduce'});
  await context.addInitScript(({language,theme})=>{
   localStorage.setItem('hisabiq-theme',theme);
   localStorage.setItem('hisabiq-erp-personal-v1',JSON.stringify({mode:'Simple',language,density:'Compact',terminology:'simple',dateView:'transaction'}));
  },{language,theme});
  const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  const bn=language==='Bangla';
  await page.goto(base+'/#/app/products');
  await page.getByRole('heading',{name:bn?'পণ্য তালিকা':'Products',exact:true}).waitFor();
  const table=page.locator('table').first(),region=table.locator('..');
  const columns=page.getByRole('button',{name:bn?'কলাম':'Columns',exact:true});
  const actions=page.getByRole('button',{name:new RegExp(bn?'পণ্যের কাজ:':'Actions for')});
  const category=page.getByRole('button',{name:'Plumbing',exact:true});
  const stock=page.getByRole('radio');
  if(width>=1280){
   const searchBox=await page.getByRole('textbox',{name:bn?'পণ্য খুঁজুন':'Search products'}).boundingBox();
   const columnBox=await columns.boundingBox();
   const serviceBox=await page.getByRole('button',{name:'Service',exact:true}).boundingBox();
   const stockBox=await stock.first().boundingBox();
   const middle=(rect)=>rect.y+rect.height/2;
   for(const [label,box] of [['category',serviceBox],['stock',stockBox],['columns',columnBox]]){
    assert.ok(Math.abs(middle(searchBox)-middle(box))<3,'wide toolbar keeps '+label+' on one row');
   }
  }
  for(const control of [columns,category,stock.nth(0),stock.nth(1),stock.nth(2),actions.first()]){
   const rect=await control.boundingBox();assert.equal(rect.height,36,'ordinary control height '+await control.getAttribute('aria-label'));
  }
  const actionRect=await actions.first().boundingBox();assert.equal(actionRect.width,36,'row action is a square 36px control');
  const total=await table.locator('tbody tr').count();
  if(width<=390){
   const summaryGrid=page.locator('.grid.grid-cols-2').first();
   const summaryCard=summaryGrid.locator('> div').first();
   const toolbar=page.getByRole('textbox',{name:bn?'পণ্য খুঁজুন':'Search products'}).locator('xpath=../../..');
   assert.equal(await summaryGrid.evaluate(el=>getComputedStyle(el).rowGap),'8px','mobile summary cards use compact gaps');
   assert.equal(await summaryCard.evaluate(el=>getComputedStyle(el).paddingTop),'8px','mobile summary cards use compact padding');
   assert.equal(await toolbar.evaluate(el=>getComputedStyle(el).paddingTop),'8px','mobile filter toolbar uses compact padding');
   assert.ok(await summaryCard.evaluate(el=>el.scrollHeight<=el.clientHeight+1),'summary text does not clip');
  }
  await category.tap();assert.equal(await category.getAttribute('aria-pressed'),'true');
  assert.ok(await table.locator('tbody tr').count()<total,'category actually filters');
  await page.getByRole('button',{name:bn?'সব':'All',exact:true}).tap();
  assert.equal(await table.locator('tbody tr').count(),total);
  await stock.nth(1).tap();assert.equal(await stock.nth(1).getAttribute('aria-checked'),'true');
  assert.ok(await table.locator('tbody tr').count()<total,'stock filter actually filters');
  await stock.first().tap();assert.equal(await table.locator('tbody tr').count(),total);
  await stock.first().focus();await page.keyboard.press('ArrowRight');
  assert.equal(await stock.nth(1).getAttribute('aria-checked'),'true','ArrowRight selects next stock option');
  assert.ok(await stock.nth(1).evaluate(el=>el===document.activeElement),'selected stock option retains keyboard focus');
  await page.keyboard.press('End');assert.equal(await stock.last().getAttribute('aria-checked'),'true','End selects last stock option');
  await page.keyboard.press('Home');assert.equal(await stock.first().getAttribute('aria-checked'),'true','Home selects first stock option');
  await columns.focus();await page.keyboard.press('Enter');
  await page.getByRole('menuitemcheckbox',{name:bn?'স্টকের দাম':'Stock value',exact:true}).waitFor();
  const chooser=page.getByRole('menu',{name:bn?'পণ্যের তালিকায় কোন কলাম দেখাবেন':'Choose product table columns'});
  await chooser.getByRole('menuitemcheckbox',{name:'#',exact:true}).focus();
  await page.keyboard.press('ArrowDown');
  assert.ok(await chooser.getByRole('menuitemcheckbox',{name:bn?'ধরন':'Category',exact:true}).evaluate(el=>el===document.activeElement),'ArrowDown skips protected columns in chooser');
  await page.keyboard.press('Escape');assert.equal(await columns.evaluate(el=>el===document.activeElement),true,'column panel restores focus');
  assert.equal(await page.locator('[data-product-scroll-action]').count(),0,'no extra Stock/Selling/Actions helper row');
  const header=table.locator('thead th').last();
  assert.equal((await header.innerText()).trim(),bn?'কাজ':'Actions','Actions is visible in table header');
  assert.ok(await header.evaluate(el=>getComputedStyle(el).visibility==='visible'&&el.querySelector('.sr-only')===null),'Actions is not screen-reader-only');
  const overflow=await region.evaluate(el=>el.scrollWidth>el.clientWidth+1);
  if(overflow){
   assert.equal(await region.getAttribute('role'),'region');assert.ok(await region.getAttribute('aria-label'),'overflow region is named');
   await region.scrollIntoViewIfNeeded();await region.focus();await page.keyboard.press('ArrowRight');
   assert.ok(await region.evaluate(el=>el.scrollLeft)>0,'keyboard scroll moves table');
   await region.evaluate(el=>{el.scrollLeft=el.scrollWidth;});
   await page.waitForFunction(()=>{const table=document.querySelector('table'),el=table.parentElement;return el.scrollLeft+el.clientWidth>=el.scrollWidth-2;});
   const box=await actions.first().boundingBox();assert.ok(box.x>=0&&box.x+box.width<=width,'row action is reachable after scroll action');
   // Synthesized Chromium touch swipe, not just a resized viewport.
   if(width<=390){
    await region.evaluate(el=>el.scrollLeft=0);await region.scrollIntoViewIfNeeded();
    const box=await region.boundingBox(),y=Math.min(870,box.y+45),x=box.x+box.width-16;
    const cdp=await context.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
    for(let step=1;step<=6;step++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-step*30,y}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await page.waitForFunction(()=>document.querySelector('table').parentElement.scrollLeft>0);
    await cdp.detach();await region.evaluate(el=>{el.scrollLeft=el.scrollWidth;});
   }
  }
  await actions.first().tap();await page.getByRole('button',{name:bn?'বিস্তারিত দেখুন':'View details',exact:true}).waitFor();
  await page.keyboard.press('Escape');assert.equal(await actions.first().evaluate(el=>el===document.activeElement),true,'row panel restores focus');
  const search=page.getByRole('textbox',{name:bn?'পণ্য খুঁজুন':'Search products'});
  await search.fill('NOT-A-PRODUCT-REFINE');await page.getByText(bn?'কোনো পণ্য মেলেনি':'No products match',{exact:true}).waitFor();
  await page.getByRole('button',{name:bn?'ফিল্টার মুছুন':'Clear filters',exact:true}).tap();assert.equal(await table.locator('tbody tr').count(),total);
  const sizes=await table.evaluate(el=>({data:getComputedStyle(el.querySelector('tbody td')).fontSize,heading:getComputedStyle(el.querySelector('th')).fontSize,helper:getComputedStyle(el.querySelector('[data-table-helper]')).fontSize}));
  assert.deepEqual(sizes,{data:'13px',heading:'12px',helper:'11px'});
  const tabs=page.getByRole('tablist').first().getByRole('tab');
  await tabs.first().focus();await page.keyboard.press('ArrowRight');
  assert.equal(await tabs.nth(1).getAttribute('aria-selected'),'true','ArrowRight selects Stock lots tab');
  assert.ok(await tabs.nth(1).evaluate(el=>el===document.activeElement),'next tab receives keyboard focus');
  await page.keyboard.press('End');assert.equal(await tabs.last().getAttribute('aria-selected'),'true','End selects Product settings');
  await page.keyboard.press('Home');assert.equal(await tabs.first().getAttribute('aria-selected'),'true','Home returns to Product list');
  assert.ok(await tabs.first().evaluate(el=>el===document.activeElement),'Home retains focus on selected tab');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no whole-page horizontal overflow');
  assert.deepEqual(errors,[]);await context.close();console.log('Products refinement:',language,theme,width,'passed; touch '+(width<=390?'swipe':'tap')+', keyboard scroll/focus');
 }}finally{await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
