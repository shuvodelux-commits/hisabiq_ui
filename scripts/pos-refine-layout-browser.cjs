/* Real POS large values, phone identity, and UI-created three/four-unit chains. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pick,fillChain}=require('./product-form-browser-helpers.cjs');
const {assertPosHeader,capturePos}=require('./pos-browser-capture.cjs');
const label=process.env.POS_SHOT_LABEL||'round-3';
const base=process.env.POS_BASE||'http://127.0.0.1:4173';
const widths=[320,390,768,820,1024,1440];
const evidence=[];
async function inputFit(input,context){
 const m=await input.evaluate(el=>{const s=getComputedStyle(el),c=document.createElement('canvas').getContext('2d');c.font=s.font;return {value:el.value,text:c.measureText(el.value).width,available:el.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)};});
 assert.ok(m.available>=m.text+1,context+': complete numeric value '+JSON.stringify(m));return m;
}
async function capture(page,label,fullPage=false){
 if(!process.env.POS_SHOTS_DIR)return;
 fs.mkdirSync(process.env.POS_SHOTS_DIR,{recursive:true});
 const file=path.join(process.env.POS_SHOTS_DIR,label+'.png');
 await capturePos(page,{path:file,fullPage});evidence.push({shot:file});
}
async function add(page,name){
 const search=page.getByRole('combobox',{name:'Add product',exact:true});await search.fill(name);
 await page.getByRole('option').filter({hasText:name}).first().click();
 return page.getByTestId('pos-cart-row').filter({hasText:name});
}
async function createUnits(page,count){
 await page.evaluate(()=>location.hash='#/app/products');
 await page.getByRole('button',{name:'Add product',exact:true}).click();
 const editor=page.locator('[data-product-editor]'),name=`POS ${count} unit readability`;
 if(count===4){
  await fillChain(page,editor,name);
  await pick(page,editor.locator('[data-product-unit-relationship]').nth(2).getByRole('combobox'),'Pack',true);
  await pick(page,editor.locator('#pf-opening-unit'),'Pack');await editor.locator('#pf-opening').fill('100');
  await pick(page,editor.locator('#pf-view'),'Pack');
 }else{
  await editor.locator('#pf-name').fill(name);await editor.locator('#pf-nameBn').fill('তিন এককের পরীক্ষার পণ্য');
  await pick(page,editor.locator('#pf-unit'),'Feet',true);await editor.locator('label:has(#pf-multi-toggle)').click();
  for(const [index,unit,factor]of[[0,'Pcs','120'],[1,'Box','20']]){
   if(index)await editor.getByRole('button',{name:'Add another unit',exact:true}).click();
   const row=editor.locator('[data-product-unit-relationship]').nth(index);
   await pick(page,row.getByRole('combobox'),unit,true);await row.locator('input').fill(factor);await row.locator('input').press('Tab');
  }
  await pick(page,editor.locator('#pf-sell-unit'),'Pcs');await editor.locator('#pf-sell').fill('240');
  await pick(page,editor.locator('#pf-buy-unit'),'Pcs');await editor.locator('#pf-buy').fill('180');
  await pick(page,editor.locator('#pf-opening-unit'),'Box');await editor.locator('#pf-opening').fill('1000');
 }
 assert.equal(await editor.locator('[data-product-unit-relationship]').count(),count-1,'genuine configured unit chain');
 await editor.getByRole('button',{name:'Save product',exact:true}).click();await editor.waitFor({state:'hidden'});
 return name;
}
async function main(){
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
 try{
  if(!process.env.POS_UNITS_ONLY)for(const theme of ['light','dark'])for(const language of ['English','Bangla','English + Bangla']){
   const context=await browser.newContext({viewport:{width:320,height:900},hasTouch:true,reducedMotion:'reduce'});
   await context.addInitScript(({theme,language})=>{localStorage.setItem('hisabiq-theme',theme);localStorage.setItem('hisabiq-erp-personal-v1',JSON.stringify({language,mode:'Simple',density:'Compact',terminology:'simple',dateView:'transaction'}));},{theme,language});
   const page=await context.newPage();await page.goto(base+'/#/app/pos');
   const row=page.getByTestId('pos-cart-row').first();await row.waitFor();
   const price=row.getByRole('textbox',{name:/Price for|দাম:/});await price.fill('100000000.00');
   await page.getByRole('textbox',{name:/Payment amount 1|পেমেন্টের পরিমাণ 1/}).fill('100000000.00');
   for(const width of widths){
    await page.setViewportSize({width,height:900});await price.focus();
    const fit=await inputFit(price,width+' '+theme+' '+language+' price');
    const amounts=await row.evaluate(el=>{
     const total=el.querySelector('[data-pos-line-total]'),remove=el.children[6];
     const range=document.createRange();range.selectNodeContents(total);
     const t=range.getBoundingClientRect(),cell=total.getBoundingClientRect(),r=remove.getBoundingClientRect();
     const name=el.children[1].querySelector('p');return {total:total.textContent.trim(),textRight:t.right,cellRight:cell.right,removeLeft:r.left,nameWrap:getComputedStyle(name).whiteSpace!=='nowrap',nameFits:name.scrollWidth<=name.clientWidth+1,rowHeight:el.clientHeight};
    });
    assert.ok(amounts.textRight<=amounts.cellRight+1&&amounts.textRight<=amounts.removeLeft+1,'exact total stays separate from remove '+JSON.stringify(amounts));
    if(width<768){assert.ok(amounts.nameWrap&&amounts.nameFits,'complete phone name');assert.ok(amounts.rowHeight<230,'compact phone row');}
    const cta=page.locator('[data-erp-workflow-action="complete"]');await cta.scrollIntoViewIfNeeded();
    const button=await cta.evaluate(el=>{const b=el.getBoundingClientRect();return {height:b.height,client:el.clientWidth,scroll:el.scrollWidth,parts:[...el.querySelectorAll('[data-pos-complete-copy] > span,kbd')].map(x=>{const r=x.getBoundingClientRect();return {text:x.textContent,left:r.left,right:r.right,top:r.top,bottom:r.bottom};}),left:b.left,right:b.right,top:b.top,bottom:b.bottom};});
    assert.equal(button.height,48,'terminal CTA remains48px');assert.ok(button.scroll<=button.client+1,'CTA content fits');
    for(const part of button.parts)assert.ok(part.left>=button.left+4&&part.right<=button.right-4&&part.top>=button.top&&part.bottom<=button.bottom,'CTA regions stay inside button '+JSON.stringify(button));
    for(const amount of await page.locator('[data-pos-payable] p').all())assert.ok(await amount.evaluate(el=>el.scrollWidth<=el.clientWidth+1),'payable amount readable');
    const paidDue=await page.locator('[data-pos-checkout] .space-y-1\\.5.rounded-lg > div').evaluateAll(rows=>rows.map(row=>{const range=document.createRange();range.selectNodeContents(row.lastElementChild);const a=range.getBoundingClientRect(),b=row.getBoundingClientRect();return {text:row.lastElementChild.textContent,left:a.left,right:a.right,parentLeft:b.left,parentRight:b.right};}));
    assert.equal(paidDue.length,3,'actual paid/change/due rows');
    for(const value of paidDue)assert.ok(value.left>=value.parentLeft&&value.right<=value.parentRight+1,'complete paid/change/due values '+JSON.stringify(value));
    await assertPosHeader(page);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no page overflow');
    if(language==='Bangla'&&[320,390,1440].includes(width))await capture(page,`${label}-fit-${width}-${theme}-checkout`);
    evidence.push({width,theme,language,price:fit,...amounts,button});
   }
   await context.close();
  }
  for(const theme of ['light','dark']){
   const context=await browser.newContext({viewport:{width:390,height:900},hasTouch:true,reducedMotion:'reduce'});
   await context.addInitScript(theme=>{localStorage.setItem('hisabiq-theme',theme);localStorage.setItem('hisabiq-erp-personal-v1',JSON.stringify({language:'English',mode:'Simple'}));},theme);
   const page=await context.newPage();await page.goto(base+'/#/app/products');
   const three=await createUnits(page,3),four=await createUnits(page,4);
   await page.evaluate(()=>location.hash='#/app/pos');
   await page.getByTestId('pos-cart-row').first().waitFor();
   const initial=await page.getByTestId('pos-cart-row').count();
   await add(page,three);await add(page,four);await add(page,'Cement');
   assert.equal(await page.getByTestId('pos-cart-row').count(),initial+3,'three actual product additions');
   for(const [name,units,total]of[[three,['Box','Pcs','Feet'],'60,504'],[four,['Pack','Box','Pcs','Feet'],'7,51,704']]){
    const row=page.getByTestId('pos-cart-row').filter({hasText:name}),field=row.locator('[data-multi-quantity]');
    assert.equal(await field.locator('input').count(),units.length,'real unit count');
    for(const unit of units)await row.getByRole('textbox',{name:'Quantity in '+unit,exact:true}).fill('12');
    await row.locator('[data-pos-line-total]').filter({hasText:total}).waitFor();
    for(const width of widths){
     await page.setViewportSize({width,height:900});
     const values=[];
     for(const unit of units){const input=row.getByRole('textbox',{name:'Quantity in '+unit,exact:true});await input.focus();values.push(await inputFit(input,`${width} ${theme} ${units.length} units ${unit} focused`));await input.press('Tab');await inputFit(input,`${width} ${theme} ${unit} unfocused`);}
     const shell=await field.boundingBox();assert.equal(Math.round(shell.height),36,'joined field remains36px');
     const quantityGeometry=await field.evaluate(el=>({client:el.clientWidth,scroll:el.scrollWidth,parts:[...el.children].map(x=>({width:x.clientWidth,min:getComputedStyle(x).minWidth,text:x.textContent}))}));
     assert.ok(quantityGeometry.scroll<=quantityGeometry.client+1,`${width} ${units.length} units fit: `+JSON.stringify(quantityGeometry));
     if(width===768){
      const cart=page.getByRole('region',{name:'Sale products',exact:true});
      assert.equal(await cart.getAttribute('tabindex'),'0','overflowing cart keyboard region');
      await cart.evaluate(el=>{el.scrollLeft=0;});await cart.focus();await cart.press('ArrowRight');
      await page.waitForFunction(()=>document.querySelector('[data-cart-kind="sale"]').scrollLeft>0);
      await cart.evaluate(el=>{el.scrollLeft=0;});await cart.scrollIntoViewIfNeeded();
      const box=await cart.boundingBox(),cdp=await context.newCDPSession(page);
      const y=Math.max(160,box.y+18),start=Math.min(740,box.x+box.width-24),end=box.x+24;
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:start,y}]});
      for(let step=1;step<=6;step++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start+(end-start)*step/6,y}]});await page.waitForTimeout(20);}
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      await page.waitForFunction(()=>document.querySelector('[data-cart-kind="sale"]').scrollLeft>0);
      await cdp.detach();
      const remove=row.getByRole('button',{name:'Remove '+name,exact:true});await remove.focus();
      const action=await remove.boundingBox(),cartBox=await cart.boundingBox();
      assert.ok(action.x>=cartBox.x&&action.x+action.width<=cartBox.x+cartBox.width+1,'keyboard reaches remove after native touch scroll');
      await cart.evaluate(el=>{el.scrollLeft=0;});
     }
     const symbols=await field.locator('[data-table-helper]').allTextContents();assert.ok(symbols.every(x=>x.length<=4),'short unit symbols');
     if(units.length===4)assert.ok(symbols.includes('Pack'),'real four-character symbol');
     assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no page overflow');
     if(width>=768)assert.equal(await row.evaluate(el=>getComputedStyle(el).gridTemplateRows.trim().split(/\s+/).length),1,'tablet row remains single line');
     if([320,390,768,1440].includes(width)){await field.scrollIntoViewIfNeeded();await capture(page,`${label}-${units.length}units-${width}-${theme}`);}
     evidence.push({width,theme,unitCount:units.length,symbols,values,total});
    }
    // Selected-unit prices and a local override still produce the actual summed total.
    await pick(page,row.getByRole('combobox',{name:'Sale unit for '+name}),'Pcs');
    const price=row.getByRole('textbox',{name:'Price for '+name,exact:true});assert.equal(await price.inputValue(),'240');
    await price.fill('250');
    await row.locator('[data-pos-line-total]').filter({hasText:units.length===3?'60,624':'7,51,824'}).waitFor();
    await price.fill('240');
    const first=row.getByRole('textbox',{name:'Quantity in '+units[0],exact:true});await first.press('Enter');
    assert.equal(await row.getByRole('textbox',{name:'Quantity in '+units[1],exact:true}).evaluate(el=>document.activeElement===el),true,'Enter advances actual unit order');
    const last=row.getByRole('textbox',{name:'Quantity in '+units.at(-1),exact:true});await last.press('Enter');assert.equal(await page.getByRole('combobox',{name:'Add product',exact:true}).evaluate(el=>document.activeElement===el),true,'last unit Enter returns search');
   }
   await context.close();
  }
  if(process.env.POS_LAYOUT_REPORT)fs.writeFileSync(process.env.POS_LAYOUT_REPORT,JSON.stringify(evidence,null,2));
  console.log('PASS: large price/line/payable/CTA at6 widths x2 themes x3 languages; genuine UI-created3/4-unit products, multiple additions, symbols, conversions, focused multi-digit quantities and selected-unit prices');
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
