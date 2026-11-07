/* Fresh viewport evidence; full-page shots separately reset all scroll positions. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const {capturePos,assertPosHeader}=require('./pos-browser-capture.cjs');
const base=process.env.POS_BASE||'http://127.0.0.1:4173';
const label=process.env.POS_SHOT_LABEL||'round-3';
const out=process.env.POS_EVIDENCE_DIR||'/workspace/hisabiq_ui/.claude/worktrees/refine-app-pos.run';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});const evidence=[];
 try{
  for(const [width,height]of [[320,700],[700,320],[390,844],[844,390],[768,1024],[1024,768],[1024,1366],[1366,1024],[1440,900]])for(const theme of ['light','dark']){
   const context=await browser.newContext({viewport:{width,height},hasTouch:width<=1366,reducedMotion:'reduce'});
   await context.addInitScript(theme=>localStorage.setItem('hisabiq-theme',theme),theme);
   const page=await context.newPage();await page.route('https://fonts.googleapis.com/**',r=>r.abort());await page.goto(base+'/#/app/pos');await page.getByTestId('pos-cart-row').first().waitFor();
   const prefix=path.join(out,'shots',`${label}-responsive-${width}x${height}-${theme}`);
   await capturePos(page,{path:prefix+'.png',fullPage:true});
   const search=page.getByRole('combobox',{name:'Add product',exact:true});await search.fill('');await search.focus();await page.getByRole('option').first().waitFor();
   const options=await page.getByRole('option').evaluateAll(items=>items.map(item=>{const name=item.querySelector('p'),range=document.createRange();range.selectNodeContents(name);const b=range.getBoundingClientRect(),s=getComputedStyle(name);return {text:name.textContent,opacity:s.opacity,color:s.color,textWidth:b.width,textHeight:b.height};}));
   for(const option of options)assert.ok(option.text.trim()&&option.textWidth>0&&option.textHeight>0&&Number(option.opacity)>0,'real popup text is visible');
   await capturePos(page,{path:prefix+'-search.png'});await search.press('Escape');
   await page.locator('[data-erp-workflow-action="complete"]').scrollIntoViewIfNeeded();await capturePos(page,{path:prefix+'-checkout-viewport.png'});
   const header=await assertPosHeader(page);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   evidence.push({width,height,theme,header,options,shots:[prefix+'.png',prefix+'-search.png',prefix+'-checkout-viewport.png']});await context.close();
  }
  fs.writeFileSync(path.join(out,label+'-responsive-captures.json'),JSON.stringify({head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),capturedAt:new Date().toISOString(),evidence},null,2));console.log('Fresh responsive/opened/scrolled captures passed '+evidence.length+' theme/orientation cases');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
