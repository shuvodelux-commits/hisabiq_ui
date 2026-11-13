/* eslint-disable @typescript-eslint/no-var-requires, no-undef */
/*
 * MOD-003 P2B1 VISUAL-ONLY browser runner. Unmounted display, no Nest, no DB,
 * no browser business API writes. The real PG16 integration is separate P2B0.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {chromium} = require('playwright');
const virtualSource = "\nimport React from 'react';\nimport {createRoot} from 'react-dom/client';\nimport {ConnectedInventoryReadPanel} from '/src/components/products/ConnectedInventoryReadPanel.tsx';\nimport {projectInventoryPresentation} from '/src/integration/inventory-projection.ts';\nimport '/src/index.css';\nconst p='01ARZ3NDEKTSV4RRFFQ69G5FC1', q='01ARZ3NDEKTSV4RRFFQ69G5FC2';\nconst la='01ARZ3NDEKTSV4RRFFQ69G5FD1', lb='01ARZ3NDEKTSV4RRFFQ69G5FD2';\nconst lotA='01ARZ3NDEKTSV4RRFFQ69G5FE1', lotB='01ARZ3NDEKTSV4RRFFQ69G5FE2';\nconst scopeA='01ARZ3NDEKTSV4RRFFQ69G5FA1/01ARZ3NDEKTSV4RRFFQ69G5FA2/1';\nconst scopeB='01ARZ3NDEKTSV4RRFFQ69G5FB1/01ARZ3NDEKTSV4RRFFQ69G5FB2/2';\nconst products=[\n {id:p,displayName:'Cable 2.5mm',baseUnitName:'Piece',status:'ACTIVE',version:1},\n {id:q,displayName:'Copper pipe',baseUnitName:'Piece',status:'ACTIVE',version:1}\n];\nconst stock=[\n {productId:p,productName:'Cable 2.5mm',productStatus:'ACTIVE',baseUnitName:'Piece',tracksExpiry:false,locationId:la,locationName:'Main rack',qtyOnHand:12500,minStockQty:1500,stockStatus:'IN_STOCK',valueMinor:32500},\n {productId:p,productName:'Cable 2.5mm',productStatus:'ACTIVE',baseUnitName:'Piece',tracksExpiry:false,locationId:lb,locationName:'Back room',qtyOnHand:2000,minStockQty:1500,stockStatus:'LOW_STOCK',valueMinor:0},\n {productId:q,productName:'Copper pipe',productStatus:'ACTIVE',baseUnitName:'Piece',tracksExpiry:false,locationId:la,locationName:'Main rack',qtyOnHand:0,minStockQty:1000,stockStatus:'ZERO_STOCK'}\n];\nconst movements=[{\n id:'01ARZ3NDEKTSV4RRFFQ69G5FG1',productId:p,productName:'Cable 2.5mm',locationName:'Main rack',\n lotId:lotA,qty:1500,direction:'OUT',sourceType:'STOCK_ADJUSTMENT',\n sourceId:'01ARZ3NDEKTSV4RRFFQ69G5FJ1',sourceNumber:'ADJ-114',\n businessDate:'2026-11-12',createdAt:'2026-11-12T06:00:00Z'\n}];\nconst lots=[\n {id:lotA,productId:p,productName:'Cable 2.5mm',locationId:la,locationName:'Main rack',ownerType:'OWNED',sourceType:'OPENING',sourceId:'01ARZ3NDEKTSV4RRFFQ69G5FJ1',sourceNumber:'OPEN-01',qtyReceived:15000,qtyRemaining:12500,expiryDate:null,status:'OPEN',businessDate:'2026-11-10',purchaseUnitCost:350,actualUnitCost:350,landedCostTotal:0,valueMinor:0},\n {id:lotB,productId:q,productName:'Copper pipe',locationId:la,locationName:'Main rack',ownerType:'VENDOR',sourceType:'PURCHASE',sourceId:'01ARZ3NDEKTSV4RRFFQ69G5FJ1',sourceNumber:'PO-09',qtyReceived:3000,qtyRemaining:0,expiryDate:'2026-12-01',status:'CLOSED',businessDate:'2026-11-11'}\n];\nconst adjustments=[{id:'01ARZ3NDEKTSV4RRFFQ69G5FH1',number:'ADJ-114',productId:p,productName:'Cable 2.5mm',locationName:'Main rack',qtyDelta:-1500,direction:'OUT',qty:1500,reason:'RECOUNT',note:'Visual-only',businessDate:'2026-11-12',createdAt:'2026-11-12T06:00:00Z',createdByName:'Test',valueMinor:0}];\nfunction stripCost(item) {\n const {valueMinor,purchaseUnitCost,actualUnitCost,landedCostTotal,unitCost,...rest}=item;\n return rest;\n}\nfunction fixture(scope,variant) {\n const empty=variant==='empty', blind=variant==='blind', absent=variant==='absent';\n const inventory=absent?undefined:{scope,value:{data:{stock:empty?[]:stock.map(row=>blind?stripCost(row):row),movements:empty?[]:movements}}};\n const lotPage=absent?undefined:{scope,value:{data:{data:empty?[]:lots.map(row=>blind?stripCost(row):row),page:{nextCursor:lotB,hasMore:true},valuationMethod:'FIFO'}}};\n const adjustmentPage=absent?undefined:{scope,value:{data:empty?[]:adjustments.map(row=>blind?stripCost(row):row)}};\n return projectInventoryPresentation({scope,products:{scope,value:{data:empty?[]:products,page:{hasMore:true}}},inventory,lots:lotPage,adjustments:adjustmentPage});\n}\nconst root=createRoot(document.getElementById('root'));\nwindow.__p2b1Render=(variant='owner',language='English')=>{\n const scope=variant==='tenant-b'?scopeB:scopeA;\n const presentation=variant==='null'?null:fixture(scope,variant);\n const expectedScope=variant==='stale'?scopeB:scope;\n const state=variant==='denied'?'permission-denied':variant==='error'?'error':variant==='loading'?'loading':'ready';\n root.render(React.createElement(ConnectedInventoryReadPanel,{presentation,expectedScope,state,language}));\n};\nwindow.__p2b1Render();\nwindow.__p2b1Ready=true;\n";
const virtualName = 'virtual:mod003-p2b1-panel-only';
const resolvedName = '\0' + virtualName;
async function main() {
  const {createServer} = await import('vite');
  const vite = await createServer({
    logLevel:'error',
    plugins:[{
      name:'mod003-p2b1-visual-only-entry',
      enforce:'pre',
      resolveId(id) { return id === '/__mod003_p2b1_entry.js' ? resolvedName : null; },
      load(id) { return id === resolvedName ? virtualSource : null; },
    }],
    server:{host:'127.0.0.1',port:0,hmr:false},
  });
  await vite.listen();
  const port = vite.httpServer.address().port;
  const screenshots = fs.mkdtempSync(path.join(os.tmpdir(),'hisabiq-mod003-p2b1-'));
  let browser;
  try {
    browser = await chromium.launch({
      executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined,
      headless:true,args:['--no-sandbox'],
    });
    const page = await browser.newPage({viewport:{width:390,height:844}});
    page.setDefaultTimeout(15000);
    const failures = [], api = [];
    page.on('pageerror',e=>failures.push(e.message));
    page.on('request',request=>{
      if(new URL(request.url()).pathname.startsWith('/api/v1/'))
        api.push(request.method()+' '+request.url());
    });
    await page.route('**/__mod003_p2b1_visual',route=>route.fulfill({
      contentType:'text/html',
      body:'<!doctype html><html><head><meta charset="utf-8"></head><body>' +
        '<div id="root" class="w-full min-w-0 mx-auto max-w-[1600px] p-3"></div>' +
        '<script type="module" src="/__mod003_p2b1_entry.js"></script></body></html>',
    }));
    await page.goto('http://127.0.0.1:'+port+'/__mod003_p2b1_visual');
    await page.waitForFunction(()=>window.__p2b1Ready===true);
    const panel=page.locator('[data-mod003-panel]');
    await panel.locator('[data-product-id]').first().waitFor();
    const render=async(variant,language='English')=>{
      await page.evaluate(([v,l])=>window.__p2b1Render(v,l),[variant,language]);
      await page.waitForTimeout(60);
    };
    assert.equal(await panel.getAttribute('data-view-state'),'ready');
    assert.equal(await panel.locator('[data-product-id="01ARZ3NDEKTSV4RRFFQ69G5FC1"]').count(),2,
      'same product at separate locations must not be collapsed');
    assert.ok((await panel.innerText()).includes('12.5 Piece'),'scale-3 quantity');
    assert.ok((await panel.innerText()).includes('৳0'),'authorized zero should show');
    await panel.getByRole('tab',{name:'Lots'}).click();
    assert.equal(await panel.locator('[data-owner-type="VENDOR"]').count(),1);
    assert.equal(await panel.locator('[data-page-has-more="true"]').count(),1);
    assert.ok((await panel.innerText()).includes('More lot pages exist'));
    assert.ok((await panel.innerText()).includes('unavailable'));
    await panel.getByRole('tab',{name:'Movements'}).click();
    assert.equal(await panel.locator('[data-movement-id]').count(),1);
    assert.ok((await panel.innerText()).includes('Not provided by API'));
    assert.ok((await panel.innerText()).includes('ADJ-114'));
    await panel.getByRole('tab',{name:'Adjustments'}).click();
    assert.equal(await panel.locator('[data-adjustment-id]').count(),1);
    assert.ok((await panel.innerText()).includes('৳0'));
    await render('blind');
    await panel.getByRole('tab',{name:'Stock'}).click();
    assert.ok(!(await panel.innerText()).includes('৳'),'cost blind stock');
    await panel.getByRole('tab',{name:'Lots'}).click();
    assert.ok(!(await panel.innerText()).includes('৳'),'cost blind lots');
    await panel.getByRole('tab',{name:'Adjustments'}).click();
    assert.ok(!(await panel.innerText()).includes('৳'),'cost blind adjustments');
    await render('stale');
    await page.locator('[data-mod003-panel][data-view-state="stale"]').waitFor();
    assert.equal(await panel.locator('table').count(),0,'stale tenant must not render');
    await render('denied');
    await page.locator('[data-mod003-panel][data-view-state="denied"]').waitFor();
    assert.equal(await panel.locator('table').count(),0);
    await render('loading');
    await page.locator('[data-mod003-panel][data-view-state="loading"]').waitFor();
    await render('error');
    await page.locator('[data-mod003-panel][data-view-state="error"]').waitFor();
    await render('absent');
    await page.locator('[data-mod003-panel][data-view-state="ready"]').waitFor();
    assert.ok((await panel.innerText()).includes('Waiting for verified inventory'));
    await render('empty');
    await panel.getByRole('tab',{name:'Stock'}).click();
    assert.ok((await panel.innerText()).includes('No rows in this response'));
    await render('owner','Bangla');
    await panel.getByRole('tab',{name:'স্টক',exact:true}).click();
    assert.ok((await panel.innerText()).includes('স্টকের সারাংশ'));
    await page.evaluate(()=>document.documentElement.classList.add('dark'));
    for(const width of [320,390,768,1440]) {
      await page.setViewportSize({width,height:900});
      await panel.locator('[data-product-id]').first().waitFor();
      const metrics=await page.evaluate(()=>({
        scrollWidth:document.documentElement.scrollWidth,innerWidth:window.innerWidth,
      }));
      assert.ok(metrics.scrollWidth<=metrics.innerWidth+2,'horizontal page overflow '+width);
      if(width===320||width===1440) await page.screenshot({
        path:path.join(screenshots,'inventory-'+width+'-dark.png'),fullPage:true,
      });
    }
    await page.evaluate(()=>document.documentElement.classList.remove('dark'));
    await render('owner','English + Bangla');
    await page.setViewportSize({width:390,height:844});
    await page.screenshot({path:path.join(screenshots,'inventory-390-bilingual-light.png'),fullPage:true});
    assert.deepEqual(api,[],'unmounted visual test must not access a business API');
    assert.deepEqual(failures,[],'browser had an unhandled page error');
    console.log('MOD003_P2B1_VISUAL_PASS viewports=320,390,768,1440');
    console.log('MOD003_P2B1_SCREENSHOTS='+screenshots);
  } finally {
    if(browser) await browser.close();
    await vite.close();
  }
}
main().catch(e=>{
  console.error('MOD003_P2B1_VISUAL_FAIL '+String(e?.message||e));
  process.exitCode=1;
});
