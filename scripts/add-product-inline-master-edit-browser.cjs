/* Regression: contextual hover/focus edit stays inside Add Product's shared SearchSelect. */
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
async function main(){
  const {createServer} = await import('vite');
  const server = await createServer({server:{host:'127.0.0.1',port:4491,strictPort:true}});
  await server.listen();
  const browser = await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
  try {
    for(const width of [390,1280]){
      const context = await browser.newContext({viewport:{width,height:900},hasTouch:width<640,reducedMotion:'reduce'});
      const page = await context.newPage(),errors=[];
      page.on('pageerror',error=>errors.push(error.message));
      await page.goto('http://127.0.0.1:4491/#/app/products');
      await page.getByRole('button',{name:'Add product',exact:true}).click();
      const editor = page.locator('[data-product-editor]');
      await editor.waitFor();
      await editor.locator('#pf-name').fill('Draft should remain untouched');
      const category = editor.locator('#pf-category');
      await category.click();
      let plumbing = page.locator('[role="listbox"] [data-value="Plumbing"]');
      const pencil = plumbing.getByRole('button',{name:'Edit Plumbing'});
      if(width>=640){
        assert.equal(await pencil.evaluate(node=>getComputedStyle(node).opacity),'0','pencil hidden by default');
        await plumbing.hover();
        assert.equal(await pencil.evaluate(node=>getComputedStyle(node).opacity),'1','pencil appears on hover');
        await pencil.click();
      }else{
        await plumbing.dispatchEvent('contextmenu');
      }
      const name = page.getByRole('textbox',{name:'Edit category name'});
      await name.fill('Electrical');
      await page.getByRole('button',{name:'Save category'}).click();
      await page.getByRole('alert').filter({hasText:'already exists'}).waitFor();
      assert.equal(await name.inputValue(),'Electrical','duplicate keeps edit open');
      await name.fill('Plumbing supplies');
      await name.press('Enter');
      await page.locator('[role="listbox"] [data-value="Plumbing supplies"]').waitFor();
      assert.equal(await editor.locator('#pf-name').inputValue(),'Draft should remain untouched');
      // Keyboard focus should reveal edit, with F2 working without a mouse.
      const search = page.getByRole('combobox',{name:'Search category'});
      await search.fill('Building');
      await search.press('F2');
      await page.getByRole('textbox',{name:'Edit category name'}).waitFor();
      await page.getByRole('textbox',{name:'Edit category name'}).press('Escape');
      await search.press('Escape');

      await editor.locator('#pf-brand').click();
      const rfl = page.locator('[role="listbox"] [data-value="RFL"]');
      if(width>=640) await rfl.hover(); else await rfl.dispatchEvent('contextmenu');
      if(width>=640)await rfl.getByRole('button',{name:'Edit RFL'}).click();
      await page.getByRole('textbox',{name:'Edit brand name'}).fill('RFL Industries');
      await page.getByRole('button',{name:'Save brand'}).click();
      await page.locator('[role="listbox"] [data-value="RFL Industries"]').waitFor();
      await page.getByRole('combobox',{name:'Search brand'}).press('Escape');

      await editor.locator('#pf-unit').click();
      const gauge = page.locator('[role="listbox"] [data-value="Gauge"]');
      if(width>=640){await gauge.hover();await gauge.getByRole('button',{name:'Edit Gg'}).click();}
      else await gauge.dispatchEvent('contextmenu');
      await page.getByRole('textbox',{name:'Edit unit name'}).fill('Gauge');
      await page.getByRole('textbox',{name:'Edit unit short symbol'}).fill('GG');
      await page.getByRole('button',{name:'Save unit'}).click();
      const newGauge = page.locator('[role="listbox"] [data-value="Gauge"]');
      assert.match(await newGauge.innerText(),/GG/,'symbol changes but internal value stays Gauge');
      await newGauge.click();
      assert.equal(await editor.locator('#pf-unit').getAttribute('data-value'),'Gauge');
      assert.equal(await editor.locator('#pf-name').inputValue(),'Draft should remain untouched');
      assert.deepEqual(errors,[],errors.join(' | '));
      await context.close();
    }
  } finally {await browser.close(); await server.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1});
