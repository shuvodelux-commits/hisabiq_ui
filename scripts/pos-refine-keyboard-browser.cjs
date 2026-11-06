/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {capturePos}=require('./pos-browser-capture.cjs');

async function main(){
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
 const failures=[];
 async function check(name,run){try{await run();console.log('PASS',name);}catch(error){failures.push(name+': '+error.message);console.error('FAIL',name,error.message);}}
 try{
  for(const theme of ['light','dark']){
   const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(process.env.POS_BASE||'http://127.0.0.1:4173/#/app/pos');
   await page.getByTestId('pos-cart-row').first().waitFor();
   await page.evaluate(theme=>document.documentElement.classList.toggle('dark',theme==='dark'),theme);
   await check(theme+' desktop routine totals and remove visible',async()=>{
    const geometry=await page.locator('[data-cart-kind="sale"]').evaluate(cart=>{
     const edge=cart.getBoundingClientRect();return {client:cart.clientWidth,scroll:cart.scrollWidth,rows:[...cart.querySelectorAll('[data-cart-row]')].map(row=>{
      const total=document.createRange();total.selectNodeContents(row.children[5]);const totalRect=total.getBoundingClientRect(),remove=row.children[6].getBoundingClientRect();
      return {total:totalRect.right,remove:remove.right,right:edge.right,totalColumnRight:cart.querySelector('[data-cart-header]').children[5].getBoundingClientRect().right,numberLeft:row.children[0].querySelector('span').getBoundingClientRect().left,left:edge.left};})};});
    assert.ok(geometry.scroll<=geometry.client+1,JSON.stringify(geometry));
    for(const row of geometry.rows)assert.ok(row.total<=row.right&&row.remove<=row.right&&row.numberLeft>=row.left&&Math.abs(row.total-row.totalColumnRight)<1,JSON.stringify(row));
   });
   const search=page.getByRole('combobox',{name:'Add product',exact:true});
   for(const width of [320,390,768,820,1024,1440]){
    await page.setViewportSize({width,height:700});await search.focus();await search.fill('');
    for(let i=0;i<7;i++)await search.press('ArrowDown');
    await check(theme+' '+width+' keyboard result visible without page scrolling',async()=>{
     const before=await page.evaluate(()=>scrollY);await search.press('ArrowUp');await search.press('ArrowDown');
     const state=await search.evaluate(input=>{const active=document.getElementById(input.getAttribute('aria-activedescendant')),list=document.getElementById(input.getAttribute('aria-controls'));const a=active.getBoundingClientRect(),l=list.getBoundingClientRect();return {visible:a.top>=l.top&&a.bottom<=l.bottom+1,activeTop:a.top,activeBottom:a.bottom,listTop:l.top,listBottom:l.bottom};});
     assert.ok(state.visible,JSON.stringify(state));assert.equal(await page.evaluate(()=>scrollY),before);
    });
    if(process.env.POS_SHOTS_DIR && [320,390,1024,1440].includes(width)){
     fs.mkdirSync(process.env.POS_SHOTS_DIR,{recursive:true});
     await capturePos(page,{path:process.env.POS_SHOTS_DIR+'/round-1-'+width+'-'+theme+'-search.png'});
    }
    await search.press('Escape');
    assert.equal(await search.getAttribute('aria-expanded'),'false');assert.equal(await search.evaluate(el=>document.activeElement===el),true);
    if(width>=768)for(const row of await page.getByTestId('pos-cart-row').all())assert.equal(await row.evaluate(el=>getComputedStyle(el).gridTemplateRows.trim().split(/\s+/).length),1);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   }
   await page.setViewportSize({width:1440,height:900});
   await search.fill('LED');
   await check(theme+' product composing Enter and browser keyCode229 preserve query/cart',async()=>{
    const before=await page.getByTestId('pos-cart-row').allTextContents();
    await search.dispatchEvent('compositionstart');await search.dispatchEvent('keydown',{key:'Enter',bubbles:true});
    assert.equal(await search.inputValue(),'LED');await search.dispatchEvent('compositionend');
    for(const event of [{key:'Enter',isComposing:true},{key:'ArrowDown',isComposing:true},{key:'Enter',keyCode:229}]){
     await search.dispatchEvent('keydown',{...event,bubbles:true});assert.equal(await search.inputValue(),'LED');assert.deepEqual(await page.getByTestId('pos-cart-row').allTextContents(),before);
    }
   });
   await check(theme+' ordinary Enter product to quantity to search',async()=>{
    await search.fill('Cement');await search.press('Enter');await page.waitForTimeout(100);
    assert.equal(await search.inputValue(),'');
    assert.match(await page.evaluate(()=>document.activeElement?.getAttribute('aria-label')||''),/Quantity/);
    await page.keyboard.press('Enter');assert.equal(await search.evaluate(el=>document.activeElement===el),true);await search.press('Escape');
   });
   await check(theme+' unit radio arrows and roving tab stop',async()=>{
    const group=page.getByTestId('pos-cart-row').filter({hasText:'LED Bulb'}).getByRole('radiogroup');const radios=group.getByRole('radio');
    const first=radios.first();await first.click();await first.press('ArrowRight');
    assert.equal(await radios.nth(1).getAttribute('aria-checked'),'true');assert.equal(await radios.nth(1).evaluate(el=>document.activeElement===el),true);
    assert.deepEqual(await radios.evaluateAll(nodes=>nodes.map(el=>el.tabIndex)),[-1,0]);
    await radios.nth(1).press('ArrowDown');assert.equal(await first.getAttribute('aria-checked'),'true');await first.press('End');assert.equal(await radios.nth(1).getAttribute('aria-checked'),'true');await radios.nth(1).press('Home');
   });
   await check(theme+' discount radio arrows and roving tab stop',async()=>{
    const group=page.locator('[data-pos-checkout]').getByRole('radiogroup');const radios=group.getByRole('radio');await radios.first().focus();await radios.first().press('ArrowRight');
    assert.equal(await radios.nth(1).getAttribute('aria-checked'),'true');assert.deepEqual(await radios.evaluateAll(nodes=>nodes.map(el=>el.tabIndex)),[-1,0]);await radios.nth(1).press('ArrowLeft');
   });
   await page.getByTestId('pos-customer-picker-trigger').click();const customerSearch=page.getByTestId('pos-customer-picker-search');await customerSearch.fill('Rah');
   await check(theme+' customer composition preserves search',async()=>{
    await customerSearch.dispatchEvent('compositionstart');await customerSearch.dispatchEvent('keydown',{key:'Enter',bubbles:true});
    assert.equal(await customerSearch.isVisible(),true);await customerSearch.dispatchEvent('compositionend');
    for(const event of [{key:'Enter',isComposing:true},{key:'Enter',keyCode:229}]){await customerSearch.dispatchEvent('keydown',{...event,bubbles:true});assert.equal(await customerSearch.isVisible(),true);assert.equal(await customerSearch.inputValue(),'Rah');}
   });
   if(await customerSearch.isVisible())await customerSearch.press('Enter');
   assert.deepEqual(errors,[]);await page.close();
  }
  const animated=await browser.newPage({viewport:{width:320,height:550},reducedMotion:'no-preference'});
  await animated.goto(process.env.POS_BASE||'http://127.0.0.1:4173/#/app/pos');
  const animatedSearch=animated.getByRole('combobox',{name:'Add product',exact:true});await animatedSearch.focus();
  for(let i=0;i<7;i++)await animatedSearch.press('ArrowDown');
  await animated.waitForTimeout(200);
  await check('active result remains visible after normal popup animation',async()=>{
   assert.equal(await animatedSearch.evaluate(input=>{
    const option=document.getElementById(input.getAttribute('aria-activedescendant')).getBoundingClientRect();
    const list=document.getElementById(input.getAttribute('aria-controls')).getBoundingClientRect();
    return option.top>=list.top&&option.bottom<=list.bottom+1;
   }),true);
  });await animated.close();
  const touch=await browser.newPage({viewport:{width:390,height:700},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
  await touch.goto(process.env.POS_BASE||'http://127.0.0.1:4173/#/app/pos');const search=touch.getByRole('combobox',{name:'Add product',exact:true});await search.fill('LED');await touch.getByRole('option').first().tap();assert.equal(await search.inputValue(),'');await touch.close();
 }finally{await browser.close();}
 assert.deepEqual(failures,[],'POS refinement failures');
 console.log('POS desktop fit, keyboard visibility, IME, radio navigation, Enter/Escape and touch passed.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
