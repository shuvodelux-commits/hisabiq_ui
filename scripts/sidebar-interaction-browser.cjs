/* Regression for Sabab NavTree interactions with HisabIQ ERP routes. */
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {expect}=require('playwright/test');

async function main(){
  const {createServer}=await import('vite');
  const server=await createServer({server:{host:'127.0.0.1',port:4363,strictPort:true}});
  await server.listen();
  const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
  const errors=[];
  const cases=[];
  for(const width of [1280,1440])for(const theme of ['light','dark'])for(const reducedMotion of ['no-preference','reduce'])
    cases.push({width,theme,reducedMotion,hasTouch:false});
  for(const width of [390,768,1024])for(const theme of ['light','dark'])
    cases.push({width,theme,reducedMotion:'no-preference',hasTouch:true});
  try{
    for(const config of cases){
      const ctx=await browser.newContext({viewport:{width:config.width,height:900},reducedMotion:config.reducedMotion,hasTouch:config.hasTouch});
      await ctx.addInitScript(t=>{
        localStorage.setItem('hisabiq-theme',t);
        localStorage.setItem('hisabiq-erp-personal-v1',JSON.stringify({mode:'Simple',language:'English',density:'Compact',terminology:'simple',dateView:'transaction'}));
      },config.theme);
      const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
      await page.goto('http://127.0.0.1:4363/#/app/dashboard');
      const drawer=config.width<1024;
      const trigger=page.getByRole('button',{name:'Open ERP navigation',exact:true});
      if(drawer)await trigger.tap();
      const root=drawer?page.getByRole('dialog',{name:'ERP navigation',exact:true}):page.locator('aside[data-sidebar="sidebar"]');
      const nav=root.locator('[data-sabab-nav-tree]');
      await expect(nav).toBeVisible();
      const dashboard=nav.getByRole('link',{name:'Dashboard',exact:true});
      await expect(dashboard).toHaveAttribute('aria-current','page');
      const sales=nav.locator('a[data-nav-module="sales"]');
      if(config.hasTouch)await sales.tap();else await sales.click();
      await expect(page).toHaveURL(/\/app\/sales$/);
      if(drawer)await expect(root).toHaveCount(0);
      else{
        await expect(sales).toHaveAttribute('aria-current','page');
        const children=nav.getByRole('link',{name:'Sales History',exact:true});
        await expect(children).toBeVisible();
        await children.click();
        await root.getByRole('button',{name:'Collapse sidebar',exact:true}).click();
        await expect(root).toHaveAttribute('data-collapsible','icon');
        await expect(root).toHaveCSS('width','64px');
        await nav.getByRole('link',{name:'Products & Stock',exact:true}).click();
        await expect(page).toHaveURL(/\/app\/products$/);
        await page.keyboard.press('Control+b');
        await expect(root).toHaveCSS('width','256px');
        await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
        const violations=await root.evaluate(async el=>(await axe.run(el,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}})).violations.map(item=>({id:item.id,nodes:item.nodes.map(n=>n.target)})));
        assert.deepEqual(violations,[],'sidebar accessibility');
      }
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'no horizontal overflow');
      await ctx.close();
      console.log('Sabab sidebar:',config);
    }
    assert.deepEqual(errors,[]);
    console.log(cases.length+' Sabab sidebar interaction cases passed');
  }finally{await browser.close();await server.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
