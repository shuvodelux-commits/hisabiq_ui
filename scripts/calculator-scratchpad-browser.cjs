/* Responsive multiline calculator and active-input visibility regression. */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

async function main() {
  const { createServer } = await import('vite');
  const server = await createServer({server:{host:'127.0.0.1',port:4388,strictPort:true}});
  await server.listen();
  const browser = await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
  const cases = [[320,568],[390,700],[667,375],[768,780],[1024,400],[1440,900]];
  try {
    for (const [width,height] of cases) for (const theme of ['light','dark']) {
      const context = await browser.newContext({viewport:{width,height},hasTouch:width<1024,reducedMotion:'reduce'});
      await context.addInitScript(theme => {
        localStorage.setItem('hisabiq-theme',theme);
        localStorage.setItem('hisabiq-erp-personal-v1',JSON.stringify({mode:'Simple',language:'English',density:'Compact',terminology:'simple',dateView:'transaction'}));
        localStorage.setItem('hisabiq.calc.lines.v1',JSON.stringify(['500+10%','20*2']));
      },theme);
      const page = await context.newPage();
      const errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      await page.goto('http://127.0.0.1:4388/#/app/dashboard');
      await page.getByRole('button',{name:'Calculator',exact:true}).click();
      const dialog=page.getByRole('dialog',{name:'Calculator',exact:true});
      await dialog.waitFor();
      const surface=dialog.locator('[data-calculator="scratchpad"]');
      const total=surface.locator('[data-calculator-total]');
      const enter=surface.getByRole('button',{name:'Next calculation line'});
      assert.equal((await enter.textContent()).trim(),'Enter','Next-line action has an explicit Enter label');
      const field=surface.getByRole('textbox',{name:'Calculation line 1'});
      assert.equal(await field.evaluate(el=>getComputedStyle(el).borderBottomWidth),'0px','Calculator fields have no unnecessary bottom underline');
      assert.equal(await field.evaluate(el=>getComputedStyle(el).outlineWidth),'0px','No dark green focus outline on the calculation input');
      const area=surface.locator('[data-calculator-lines]');
      const row=surface.locator('[data-calculator-line]').first();
      const areaRect=await area.boundingBox();
      const rowRect=await row.boundingBox();
      assert.ok(areaRect && rowRect && areaRect.height>=rowRect.height*2, 'Two persisted calculation lines fit without artificial blank rows');
      assert.equal(await surface.locator('[data-calculator-line]').count(),2,'Only the two stored lines render');
      assert.equal(await surface.locator('[data-calculator-display]').count(),1,'Restores compact result-first calculator display');
      assert.equal(await surface.locator('[data-calculator-keypad] button').count(),22,'Original 4x5 keypad and two grouped bracket helpers');
      assert.equal(await surface.locator('[data-calculator-display] button').count(),1,'Only Copy stays in the result display');
      assert.equal(await surface.locator('[data-calculator-parentheses] button').count(),2,'Both brackets live with the keypad');
      await page.waitForFunction(() => document.querySelector('[data-calculator-total]')?.textContent?.trim() === '590',null,{timeout:10000});
      assert.equal((await total.textContent()).trim(),'590','Saved expressions restored on open');
      const pageScroll=await page.evaluate(()=>window.scrollY);
      const clear=surface.getByRole('button',{name:'Clear all calculator lines'});
      await clear.click();
      assert.equal(await surface.locator('[data-calculator-line]').count(),1,'Clear returns to one editable line');
      const compactList=await surface.locator('[data-calculator-lines]').boundingBox();
      assert.ok(compactList && compactList.height<90,'Single line uses compact space without empty blank rows');
      for(const key of ['5','0','0','+','1','0','%']) await surface.getByRole('button',{name:key,exact:true}).click();
      assert.equal((await total.textContent()).trim(),'550','Smart percentage on keypad');
      await surface.getByRole('button',{name:'Next calculation line'}).click();
      await page.waitForFunction(()=>document.activeElement?.getAttribute('aria-label')==='Calculation line 2');
      await page.keyboard.type('20*2');
      assert.equal((await total.textContent()).trim(),'590','Physical keyboard and keypad share one scratchpad');
      await surface.getByRole('button',{name:'Next calculation line'}).click();
      await page.waitForFunction(()=>document.activeElement?.getAttribute('aria-label')==='Calculation line 3');
      await page.keyboard.type('1/0');
      assert.equal((await total.textContent()).trim(),'590','Invalid line excluded from total');
      assert.match(await surface.innerText(),/invalid line/);
      await surface.getByRole('button',{name:'Next calculation line'}).click();
      await page.waitForFunction(()=>document.activeElement?.getAttribute('aria-label')==='Calculation line 4');
      // A centered popover can move while its fourth row is committed.
      // Observe the list and both rows in the same browser rendering tick;
      // independent boundingBox awaits may compare coordinates from
      // different dialog positions even when all four rows fit correctly.
      await page.waitForFunction(() => {
        const list=document.querySelector('[data-calculator-lines]');
        const rows=list?.querySelectorAll('[data-calculator-line]');
        if(!list || !rows || rows.length!==4) return false;
        const area=list.getBoundingClientRect();
        const first=rows[0].getBoundingClientRect();
        const fourth=rows[3].getBoundingClientRect();
        return area.height>=166 &&
          first.y>=area.y-2 &&
          fourth.bottom<=area.bottom+2;
      },null,{timeout:10000});
      const geometry=await area.evaluate(list => {
        const rows=[...list.querySelectorAll('[data-calculator-line]')];
        const rect=node => {
          const {x,y,width,height}=node.getBoundingClientRect();
          return {x,y,width,height};
        };
        return {
          count:rows.length,
          fourArea:rect(list),
          firstRow:rows[0] ? rect(rows[0]) : null,
          fourthRow:rows[3] ? rect(rows[3]) : null,
          scroll:list.scrollTop
        };
      });
      const {count,firstRow,fourthRow,fourArea,scroll}=geometry;
      assert.equal(count,4,'Four real lines appear only after Enter creates them');
      assert.ok(fourArea && firstRow && fourthRow && firstRow.y>=fourArea.y-2 && fourthRow.y+fourthRow.height<=fourArea.y+fourArea.height+2,
        'At least four calculation lines fit visibly once present: '+JSON.stringify({width,height,firstRow,fourthRow,fourArea,scroll}));
      for(let i=0;i<13;i++) await surface.getByRole('button',{name:'Next calculation line'}).click();
      const current=surface.locator('[data-calculator-line][data-active="true"]');
      const listBox=await surface.locator('[data-calculator-lines]').boundingBox();
      const rowBox=await current.boundingBox();
      const dialogBox=await dialog.boundingBox();
      const keypadBox=await surface.getByRole('button',{name:'Next calculation line'}).boundingBox();
      const keypadViewport=await surface.locator('[data-calculator-keypad]').boundingBox();
      const totalBox=await total.boundingBox();
      if(height>=560) assert.ok(keypadBox && keypadViewport && keypadBox.y+keypadBox.height<=keypadViewport.y+keypadViewport.height+1, 'Entire original keypad remains visible without scrolling on normal screens');
      assert.ok(rowBox && listBox && rowBox.y>=listBox.y-2 && rowBox.y+rowBox.height<=listBox.y+listBox.height+2,
        'Active input remains in the internally scrollable list');
      assert.ok(dialogBox && dialogBox.y>=-1 && dialogBox.y+dialogBox.height<=height+1,
        'Calculator panel remains inside viewport');
      assert.ok(keypadBox && keypadBox.y+keypadBox.height<=height+1,'Keypad stays on screen');
      assert.ok(totalBox && totalBox.y+totalBox.height<=height+1,'Sticky grand total stays on screen');
      assert.equal(await page.evaluate(()=>window.scrollY),pageScroll,'Background page must not scroll');
      await page.keyboard.press('Escape');
      await dialog.waitFor({state:'hidden'});
      await page.getByRole('button',{name:'Calculator',exact:true}).click();
      const restored=page.getByRole('dialog',{name:'Calculator',exact:true});
      assert.equal((await restored.locator('[data-calculator-total]').textContent()).trim(),'590');
      assert.equal(await restored.locator('[data-calculator-line]').count(),17);
      await page.keyboard.press('Escape');
      await restored.waitFor({state:'hidden'});
      assert.deepEqual(errors,[],'No runtime errors');
      console.log('Calculator multi-line, persistence and visibility: '+width+'px '+theme);
      await context.close();
    }
  } finally {
    await browser.close();
    await server.close();
  }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
