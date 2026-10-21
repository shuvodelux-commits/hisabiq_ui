const { chromium } = require('playwright');
const assert = require('node:assert/strict');

async function main() {
  const { createServer } = await import('vite');
  const server = await createServer({ server: { host:'127.0.0.1',port:4196,strictPort:true }});
  await server.listen();
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined, args:['--no-sandbox'] });
  const page = await browser.newPage({ viewport:{width:1280,height:900},reducedMotion:'reduce' });
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  try {
    await page.goto('http://127.0.0.1:4196/#/app/parties');
    await page.getByRole('button',{name:/Add party/i}).click();
    const dialog=page.getByRole('dialog');
    await dialog.getByLabel('Party name').fill('New Party QA');
    await dialog.getByLabel('Bangla name').fill('নতুন পার্টি');
    await dialog.getByLabel('Phone').fill('01799990000');
    await dialog.getByLabel('Area').fill('Dhaka');
    await dialog.getByRole('checkbox',{name:'Supplier'}).check();
    await dialog.getByRole('button',{name:/Save party/i}).click();
    await page.getByRole('heading',{name:'New Party QA'}).waitFor();
    assert.match(page.url(),/id=party-preview-/);
    await page.getByRole('combobox',{name:'Relationship'}).click();
    await page.getByRole('listbox',{name:'Relationship options'}).getByRole('option',{name:'Supplier',exact:true}).click();
    assert.match(page.url(),/role=Supplier/);
    await page.getByRole('button',{name:/Edit party/i}).click();
    await dialog.getByLabel('Phone').fill('01888880000');
    await dialog.getByRole('button',{name:/Save party/i}).click();
    await page.locator(':text-is("01888880000"):visible').first().waitFor();
    await page.getByRole('tab',{name:/Notes/}).click();
    await page.getByRole('textbox',{name:'New note'}).fill('Ask for receipt');
    await page.getByRole('textbox',{name:'New note'}).locator('..').getByRole('button',{name:'Add note'}).click();
    await page.getByText('Ask for receipt').first().waitFor();
    await page.getByRole('button',{name:/Edit note Ask for receipt/i}).click();
    await page.getByRole('textbox',{name:'Edit note'}).fill('Bring receipt');
    await page.getByRole('button',{name:/Save note/i}).click();
    await page.getByText('Bring receipt').first().waitFor();
    await page.getByRole('button',{name:/Delete note Bring receipt/i}).click();
    await page.getByRole('button',{name:'Confirm delete'}).click();
    assert.equal(await page.getByText('Bring receipt').count(),0);
    // The directory search must include the Bangla display name.
    await page.getByRole('textbox',{name:'Search parties'}).fill('নতুন');
    assert.ok(await page.getByText('New Party QA',{exact:true}).count() >= 1);
    await page.getByRole('textbox',{name:'Search parties'}).fill('');
    await page.getByRole('button',{name:/Import Excel/i}).click();
    await page.getByRole('dialog',{name:'Choose Party import type'})
      .getByRole('button',{name:'Legacy multi-role CSV'}).click();
    await page.getByLabel('Select CSV file').setInputFiles({
      name:'parties.csv',mimeType:'text/csv',
      buffer:Buffer.from('name,nameBn,phone,area,roles\nCSV Supplier QA,সিএসভি,01700990011,Sylhet,Supplier|Customer\n')
    });
    await page.getByRole('button',{name:/Import 1 parties/}).click();
    await page.locator(':text-is("CSV Supplier QA"):visible').first().waitFor();
    // Magic Patterns adaptive Party workspace: one selected profile plus a chooser on narrow viewports.
    await page.setViewportSize({width:375,height:800});
    await page.getByRole('button',{name:'Change party'}).click();
    const choose=page.getByRole('dialog',{name:'Change party'});
    await choose.getByRole('textbox',{name:'Search parties'}).fill('CSV Supplier QA');
    await choose.getByRole('option',{name:/CSV Supplier QA/}).click();
    await choose.waitFor({state:'hidden'});
    await page.getByRole('heading',{name:/CSV Supplier QA/}).waitFor();
    await page.getByRole('button',{name:'More actions'}).click();
    const actionSheet=page.getByRole('dialog',{name:'More actions'});
    await actionSheet.getByRole('button',{name:/Opening balance/}).waitFor();
    await actionSheet.getByRole('button',{name:/Print statement/}).waitFor();
    await actionSheet.getByRole('button',{name:/Edit party/}).waitFor();
    await actionSheet.getByRole('button',{name:/Send statement/}).isDisabled().then(ok=>assert.ok(ok));
    await page.keyboard.press('Escape');
    await page.getByRole('dialog',{name:'More actions'}).waitFor({state:'hidden'});
    // Switch from an empty newly imported supplier to the seeded customer ledger.
    await page.goto('http://127.0.0.1:4196/#/app/parties?id=c1&role=Customer');
    const ledgerFeed=page.getByRole('list',{name:'Transactions'});
    assert.equal(await ledgerFeed.getByRole('button',{name:'View',exact:true}).count(),0,'no standalone View buttons in ledger feed');
    await ledgerFeed.getByRole('button',{name:/View transaction/}).first().click();
    const transaction=page.getByRole('dialog',{name:'Party transaction details'});
    await transaction.waitFor();
    await transaction.getByRole('button',{name:'Close'}).first().click();

    for(const width of [320,360,390,600,768,820,960,1000,1024,1280,1440]){
      await page.setViewportSize({width,height:900});
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
      assert.ok(overflow<=4,`Party ${width}px should not overflow horizontally (extra ${overflow}px)`);
      assert.equal(await page.getByRole('list',{name:'Transactions'}).isVisible(),width<768,`Party ${width}px uses transaction feed only on phones`);
      assert.equal(await page.locator('table').first().isVisible(),width>=768,`Party ${width}px uses compact ledger table on tablet/desktop`);
      assert.ok(await page.getByRole('button',{name:'Change party'}).isVisible(),`Change Party control is reachable at ${width}px`);
      if(width>=768){
        const heading=page.getByRole('heading',{name:'Parties & Ledger'});
        assert.ok(await heading.isVisible(),`Party page title stays visible at ${width}px`);
        assert.equal(await page.getByText('Everyone you deal with, in one place').count(),0,`No redundant introductory sentence at ${width}px`);
        const buttons=[
          page.getByRole('button',{name:'Import Excel / CSV'}),
          page.getByRole('button',{name:'Add party'}),
          page.getByRole('button',{name:'Change party'})
        ];
        for(const button of buttons)assert.ok(await button.isVisible(),`All Party header buttons visible at ${width}px`);
        const headingRect=await heading.boundingBox();
        const positions=await Promise.all(buttons.map(button=>button.boundingBox()));
        assert.ok(headingRect&&positions.every(Boolean),`Party header coordinates available at ${width}px`);
        assert.ok(positions.every(rect=>Math.abs(rect.y-positions[0].y)<3),`Header actions stay in one row at ${width}px`);
        assert.ok(positions[0].x>=headingRect.x+headingRect.width-5,`Header actions right aligned at ${width}px`);
        assert.ok(Math.abs(positions[0].y-headingRect.y)<14,`Header actions align with the title at ${width}px`);
        for(const button of buttons){
          const color=await button.evaluate(el=>getComputedStyle(el).backgroundColor);
          assert.equal(color,'rgb(255, 255, 255)',`Header action background white at ${width}px`);
        }
        assert.ok(await page.locator('p strong.text-emerald-700').isVisible(),`directory receivables are green at ${width}px`);
        assert.ok(await page.locator('p strong.text-danger').isVisible(),`directory payables are red at ${width}px`);
      }
      if(width<1024){
        assert.ok(await page.getByTestId('party-last-activity').isVisible(),`Last activity own line in responsive Party profile at ${width}px`);
        assert.ok(await page.getByTestId('party-receivable-helper').isVisible(),`Localized receivable explanation visible at ${width}px`);
      }
      if(width>=768&&width<1024){
        assert.ok(await page.getByRole('button',{name:/Opening balance/i}).isVisible(),`Opening balance in tablet action row at ${width}px`);
        assert.ok(await page.getByRole('button',{name:'Add note'}).isVisible(),`Add note in tablet action row at ${width}px`);
        assert.ok(await page.getByRole('button',{name:'More'}).isVisible(),`More overflow action on tablet at ${width}px`);
        assert.ok(await page.getByText('Period debit').first().isVisible(),`period totals above the tablet ledger at ${width}px`);
        const rowHeight=await page.locator('table tbody tr').first().evaluate(row=>row.getBoundingClientRect().height);
        assert.ok(rowHeight<=70,`tablet ${width}px ledger rows must be compact, got ${rowHeight}px`);
        await page.getByRole('button',{name:'Change party'}).click();
        await page.getByRole('dialog',{name:'Change party'}).waitFor();
        await page.keyboard.press('Escape');
        await page.getByRole('dialog',{name:'Change party'}).waitFor({state:'hidden'});
      }
      if(width>=1024){
        await page.getByRole('button',{name:'Change party'}).click();
        assert.ok(await page.getByRole('textbox',{name:'Search parties'}).evaluate(el=>document.activeElement===el),
          `desktop ${width}px Change Party focuses the existing directory`);
      }
    }
    assert.equal(errors.length,0,'browser page must not throw');
    console.log('Party profile browser flow passed');
  } finally {
    await browser.close();
    await server.close();
  }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
