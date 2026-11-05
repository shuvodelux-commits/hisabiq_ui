/* POS V2 screen-only refinement regression; no posting or backend mutation. */
'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const widths=[320,390,768,820,1024,1440];
const themes=['light','dark'];
const origin=process.env.POS_V2_REFINE_URL||'http://127.0.0.1:4311';
const bounds=async locator=>locator.evaluate(el=>{const b=el.getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height,right:b.right,bottom:b.bottom,scrollWidth:el.scrollWidth,clientWidth:el.clientWidth};});
async function main(){
 const standalone=!process.env.POS_V2_REFINE_URL;
 const server=standalone?await (await import('vite')).createServer({server:{host:'127.0.0.1',port:4311,strictPort:true}}):null;
 if(server)await server.listen();
 const browser=await chromium.launch({args:['--no-sandbox']});
 let passed=0;
 try{
  for(const width of widths)for(const theme of themes){
    const ctx=await browser.newContext({viewport:{width,height:width===768?1024:width===1024?768:900},colorScheme:theme,reducedMotion:'reduce',hasTouch:width<=1024});
    try {
      await ctx.addInitScript(t=>{localStorage.setItem('hisabiq-theme',t);localStorage.setItem('theme',t);},theme);
      const page=await ctx.newPage(), errors=[];page.on('pageerror',e=>errors.push(e.message));
      await page.goto(origin+'/#/app/pos',{waitUntil:'networkidle'});
      const cart=page.locator('[data-cart-kind="sale"]'),checkout=page.locator('[data-pos-checkout]');
      await cart.locator('[data-cart-row="sale"]').first().waitFor({state:'visible'});
      assert.ok(await checkout.count(),'Checkout present');
      const cartBox=await bounds(cart),checkoutBox=await bounds(checkout);
      const total=cart.locator('[data-cart-row="sale"]').first().locator(':scope > :nth-child(6)');
      const totalBox=await bounds(total);
      assert.ok(totalBox.right<=cartBox.right+1,
        width+' '+theme+': first line total truncated outside cart');
      const clippedText=await total.evaluate(el=>{
         const nodes=[];const walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
         while(walk.nextNode()){const n=walk.currentNode;if(!n.textContent?.trim())continue;const r=document.createRange();r.selectNodeContents(n);nodes.push(r.getBoundingClientRect().right);}
         return Math.max(0,...nodes);
      });
      // Ordinary POS rows must keep the whole Total column inside the available
      // cart width. Wider 3–4-unit editors may still scroll as one tablet row.
      if(width>=768 && !(await cart.locator('[data-multi-quantity]').count())){
        assert.ok(cartBox.scrollWidth<=cartBox.clientWidth+2,
          width+' '+theme+': ordinary cart overflows horizontally');
        const gridRows=await cart.locator('[data-cart-row="sale"]').first().evaluate(
          el=>getComputedStyle(el).gridTemplateRows.trim().split(/\\s+/).filter(Boolean).length);
        assert.equal(gridRows,1,width+' '+theme+': tablet POS cart product must stay on one row');
      }
      assert.ok(clippedText<=cartBox.right+1,width+' '+theme+': numeric total glyphs clipped ('+Math.round(clippedText)+' > '+Math.round(cartBox.right)+')');
      const quick=page.getByRole('region',{name:/Quick add products/});
      assert.ok(await quick.isVisible(),'Quick products list accessible');
      assert.equal(await quick.getByRole('button').count(),8,'All 8 one-tap quick products retained');
      const q=await bounds(quick);
      assert.ok(q.height<=135,width+' '+theme+': Quick items consume unnecessary vertical space');
      assert.ok(q.scrollWidth>q.clientWidth+1,width+' '+theme+': Quick items should remain horizontally scrollable');
      if(width<1280){
       assert.ok(checkoutBox.y>=cartBox.bottom,width+' '+theme+': stacked checkout remains below cart');
       assert.ok(checkoutBox.y-cartBox.bottom<=175,width+' '+theme+': checkout too far below cart');
      }
      const clear=checkout.getByRole('button',{name:/Clear|মুছে/}).first();
      const clearBox=await bounds(clear);
      assert.ok(clearBox.height>=35,width+' '+theme+': Clear hit area below 36px');
      const quickAdd=checkout.getByRole('button',{name:/Quick add customer|নতুন ক্রেতা/});
      const quickAddBox=await bounds(quickAdd);
      assert.ok(quickAddBox.height>=35&&quickAddBox.height<=38,width+' '+theme+': inconsistent customer icon size');
      const details=checkout.getByTestId('pos-invoice-details-toggle');
      await details.click();
      assert.equal(await details.getAttribute('aria-expanded'),'true','Customer form opens');
      for(const term of [/Customer name|ক্রেতার নাম/,/Customer phone|ক্রেতার ফোন/]){
       const input=checkout.getByRole('textbox',{name:term}).first();
       assert.ok(await input.isVisible(),'Customer field remains available');
       const box=await bounds(input);
       assert.ok(box.x>=0&&box.right<=width+1,'Customer field extends outside viewport');
      }
      const addPayment=checkout.getByRole('button',{name:/^Add$|^যোগ/}).first();
      await addPayment.click();
      const payment2=checkout.getByRole('textbox',{name:/Payment amount 2|পেমেন্টের পরিমাণ 2/});
      await payment2.fill('500');
      assert.equal(await payment2.inputValue(),'500','Split payment amount editable');
      const method2=checkout.getByRole('combobox',{name:/Payment method 2|পেমেন্টের মাধ্যম 2/});
      assert.ok(await method2.isVisible(),'Second payment method available');
      const review=checkout.locator('[data-erp-workflow-action="complete"]');
      assert.ok(await review.isDisabled(),'Due without customer must block confirmation');
      assert.deepEqual(errors,[],'Client JavaScript errors');
      console.log('PASS pos '+width+'px '+theme);
      passed++;
    }finally{await ctx.close();}
  }
 }finally{await browser.close();if(server)await server.close();}
 console.log('POS V2 UI-refine matrix '+passed+'/12');
}
main().catch(err=>{console.error(err);process.exitCode=1;});
