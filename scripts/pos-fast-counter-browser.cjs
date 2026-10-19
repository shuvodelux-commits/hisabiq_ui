/* HisabIQ Fast Counter POS visual and workflow regression. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');

async function main(){
  const {createServer}=await import('vite');
  const port=Number(process.env.POS_FAST_COUNTER_PORT||49328);
  const server=await createServer({cacheDir:'.superpowers/pos-fast-counter-cache',server:{host:'127.0.0.1',port,strictPort:true}});
  await server.listen();
  const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
  let cases=0;
  try{
    for(const [width,height] of [[320,700],[390,844],[768,1024],[1440,900]])
      for(const theme of ['light','dark'])
        for(const language of ['English','English + Bangla','Bangla']){
          const context=await browser.newContext({viewport:{width,height},hasTouch:width<=1024,colorScheme:theme,reducedMotion:'reduce'});
          const page=await context.newPage(),errors=[];
          page.on('pageerror',error=>errors.push(error.message));
          await page.route('https://fonts.googleapis.com/**',route=>route.abort());
          await page.addInitScript(({theme,language})=>{
            localStorage.setItem('hisabiq-theme',theme);
            localStorage.setItem('hisabiq-erp-personal-v1',JSON.stringify({mode:'Simple',language,density:'Compact',terminology:'simple',dateView:'transaction'}));
          },{theme,language});
          const contextId=width+'px '+theme+' '+language;
          const labels=(en,bn)=>new RegExp(en+'|'+bn);
          try{
            await page.goto('http://127.0.0.1:'+port+'/#/app/pos');
            const checkout=page.locator('[data-pos-checkout]');
            await checkout.waitFor();
            const initialRows=await page.getByTestId('pos-cart-row').count();
            assert.ok(initialRows>0,contextId+' cart remains present');
            const toggle=checkout.getByTestId('pos-invoice-details-toggle');
            assert.equal(await toggle.getAttribute('aria-expanded'),'false',contextId+' invoice details start collapsed');
            const details=checkout.locator('[data-pos-customer-fields]');
            assert.equal(await details.isVisible(),false,contextId+' optional fields hidden until requested');
            assert.ok(await checkout.getByRole('button',{name:labels('Enter customer details','ক্রেতার তথ্য দিন')}).isVisible(),contextId+' due warning has direct next action');
            const modeGroup=checkout.getByRole('group',{name:labels('Sale type','বিক্রির ধরন')});
            const regular=modeGroup.getByRole('button',{name:labels('Regular sale','সাধারণ বিক্রি')});
            const installment=modeGroup.getByRole('button',{name:labels('Installment sale','কিস্তিতে বিক্রি')});
            assert.equal(await regular.getAttribute('aria-pressed'),'true',contextId+' regular sale is active');
            const saleColors=await modeGroup.locator('button').evaluateAll(items=>items.map(item=>getComputedStyle(item).backgroundColor));
            assert.notEqual(saleColors[0],saleColors[1],contextId+' green sale modes show selected state');
            await installment.click();
            assert.equal(await installment.getAttribute('aria-pressed'),'true',contextId+' installment mode selected');
            await checkout.getByText(labels('Installment terms','কিস্তির হিসাব')).first().waitFor();
            await regular.click();
            assert.equal(await regular.getAttribute('aria-pressed'),'true',contextId+' switching back restores regular mode');
            assert.equal(await checkout.getByText(labels('Installment terms','কিস্তির হিসাব')).count(),0,contextId+' installment terms hidden again');
            const payable=checkout.locator('[data-pos-payable]');
            const words=payable.locator('[data-amount-words-variant="compact"]');
            await words.waitFor();
            const style=await payable.evaluate(root=>{
              const price=root.querySelector('p');
              const words=root.querySelector('[lang="bn"]');
              const box=root.getBoundingClientRect();
              return {price:parseFloat(getComputedStyle(price).fontSize),words:parseFloat(getComputedStyle(words).fontSize),
                scroll:root.scrollWidth-root.clientWidth,left:box.left,right:box.right,viewport:innerWidth};
            });
            assert.ok(style.price>=28&&style.price<=30,contextId+' total is slightly reduced: '+JSON.stringify(style));
            assert.ok(style.words>=14&&style.words<=15,contextId+' words stay legible while slightly smaller: '+JSON.stringify(style));
            assert.ok(style.scroll<=1&&style.left>=-2&&style.right<=width+2,contextId+' payable does not overflow');
            await toggle.click();
            assert.equal(await toggle.getAttribute('aria-expanded'),'true',contextId+' customer details open');
            const name=details.getByRole('textbox',{name:labels('Customer name','ক্রেতার নাম')});
            const phone=details.getByRole('textbox',{name:labels('Customer phone','ক্রেতার ফোন')});
            await name.fill('Fast Counter Test');
            await phone.fill('01799008877');
            await toggle.click();
            assert.equal(await details.isVisible(),false,contextId+' fields collapse');
            assert.match(await toggle.innerText(),/Fast Counter Test/,contextId+' compact summary reflects entered customer');
            await toggle.click();
            assert.equal(await name.inputValue(),'Fast Counter Test',contextId+' collapse preserves customer data');
            assert.equal(await phone.inputValue(),'01799008877',contextId+' collapse preserves phone');
            assert.equal(await page.getByTestId('pos-cart-row').count(),initialRows,contextId+' cart unchanged');
            await checkout.getByRole('button',{name:labels('Quick add customer','নতুন ক্রেতা যোগ করুন')}).click();
            const quickAdd=page.getByRole('dialog',{name:labels('Quick add customer','নতুন ক্রেতা যোগ করুন')});
            await quickAdd.waitFor();
            await quickAdd.getByRole('button',{name:labels('Cancel','বাতিল')}).click();
            await quickAdd.waitFor({state:'hidden'});
            assert.equal(await name.inputValue(),'Fast Counter Test',contextId+' cancel quick add keeps draft');
            await checkout.getByRole('button',{name:labels('Exact','পুরো টাকা'),exact:true}).click();
            const preview=checkout.getByRole('button',{name:labels('Preview sale','বিক্রির হিসাব দেখুন')});
            assert.equal(await preview.isEnabled(),true,contextId+' fully paid sale can be previewed');
            await preview.click();
            const review=page.getByRole('dialog',{name:labels('Review sale','বিক্রির হিসাব যাচাই')});
            await review.waitFor();
            await review.getByRole('button',{name:labels('Edit details','সংশোধন করুন')}).click();
            await review.waitFor({state:'hidden'});
            assert.equal(await page.getByTestId('pos-cart-row').count(),initialRows,contextId+' closing review preserves sale');
            assert.deepEqual(errors,[],contextId+' no runtime errors');
            cases++;
            console.log('PASS '+contextId);
          }finally{await context.close();}
        }
    console.log('Fast Counter POS passed '+cases+'/24 journeys');
  }finally{await browser.close();await server.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
