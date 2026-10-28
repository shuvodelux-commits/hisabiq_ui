const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

async function main() {
  const { createServer } = await import("vite");
  const { defaults, personalDefaults } = await import(
    "../src/settings/model.ts"
  );
  const server = await createServer({
    server: { host: "127.0.0.1", port: 4296, strictPort: true },
  });
  await server.listen();
  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined,
    args: [
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-zygote",
    ],
  });
  const errors = [],
    evidence = [];
  const out = path.resolve(".impeccable/review");
  fs.mkdirSync(out, { recursive: true });
  const base = "http://127.0.0.1:4296/#/app/settings/";
  const seed = async (context, language = "English", mode = "Simple") => {
    await context.addInitScript(
      ({ personal, state }) => {
        if (!localStorage.getItem("hisabiq-erp-personal-v1"))
          localStorage.setItem(
            "hisabiq-erp-personal-v1",
            JSON.stringify(personal),
          );
        if (!localStorage.getItem("hisabiq-erp-settings-v1:t1"))
          localStorage.setItem(
            "hisabiq-erp-settings-v1:t1",
            JSON.stringify(state),
          );
      },
      { personal: { ...personalDefaults, language, mode }, state: defaults() },
    );
    // Optional self-hosted font fixtures keep visual QA deterministic offline.
    if (process.env.HISABIQ_QA_FONT_DIR) {
      const fontRoot = process.env.HISABIQ_QA_FONT_DIR;
      const rules = [
        ["Geist", "geist", "latin"],
        ["Hind Siliguri", "hind-siliguri", "bengali"],
      ]
        .flatMap(([family, dir, subset]) =>
          [400, 500, 600, 700].map(
            (weight) =>
              `@font-face{font-family:'${family}';font-weight:${weight};src:url('https://fonts.gstatic.com/hisabiq/${dir}/${dir}-${subset}-${weight}-normal.woff2') format('woff2');}`,
          ),
        )
        .join("");
      await context.route("https://fonts.googleapis.com/**", (route) =>
        route.fulfill({ contentType: "text/css", body: rules }),
      );
      await context.route("https://fonts.gstatic.com/hisabiq/**", (route) => {
        const [dir, file] = new URL(route.request().url()).pathname
          .split("/")
          .slice(-2);
        return route.fulfill({
          contentType: "font/woff2",
          path: path.join(fontRoot, "@fontsource", dir, "files", file),
          headers: { "access-control-allow-origin": "*" },
        });
      });
    }
  };
  const open = async (page, section) => {
    await page.goto(base + section);
    await page.locator(".erp-settings").waitFor();
    await page.evaluate(() => document.fonts.ready);
  };
  const select = async (page, label, value) => {
    await page.getByRole("combobox", { name: label, exact: true }).click();
    await page.locator(`[role=option][data-value="${value}"]`).click();
  };
  const listen = (page) => page.on("pageerror", (e) => errors.push(e.message));
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: "reduce",
    });
    await seed(context);
    const page = await context.newPage();
    listen(page);
    await open(page, "business");
    assert.equal(
      await page.getByRole("group", { name: "Settings mode" }).count(),
      0,
    );
    assert.equal(
      await page.getByText("Show advanced options", { exact: true }).count(),
      0,
    );
    assert.equal(
      await page.getByText("Preview as", { exact: true }).count(),
      0,
    );
    assert.equal(
      await page.locator("[data-settings-directory] [role=tab]").count(),
      13,
    );
    const original = await page
      .getByRole("textbox", { name: "Business name", exact: true })
      .inputValue();
    await page
      .getByRole("textbox", { name: "Business name", exact: true })
      .fill("Natore Test Shop");
    await page.locator('[data-settings-section="products"]').click();
    await page
      .getByRole("button", { name: "Keep editing", exact: true })
      .click();
    assert.equal(
      await page
        .getByRole("textbox", { name: "Business name", exact: true })
        .inputValue(),
      "Natore Test Shop",
    );
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    assert.equal(
      await page
        .getByRole("textbox", { name: "Business name", exact: true })
        .inputValue(),
      original,
    );
    await page
      .getByRole("textbox", { name: "Business name", exact: true })
      .fill("Natore Test Shop");
    await page
      .getByRole("button", { name: "Save changes", exact: true })
      .click();
    await page
      .getByRole("status")
      .filter({ hasText: "Business settings saved." })
      .waitFor();
    await page.reload();
    assert.equal(
      await page
        .getByRole("textbox", { name: "Business name", exact: true })
        .inputValue(),
      "Natore Test Shop",
    );
    await page
      .getByRole("textbox", { name: "Business name", exact: true })
      .fill("");
    await page
      .getByRole("button", { name: "Save changes", exact: true })
      .click();
    await page
      .getByRole("alert")
      .filter({ hasText: "Business name is required." })
      .waitFor();
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await open(page, "products");
    await page
      .getByRole("combobox", { name: "Default lot allocation", exact: true })
      .waitFor();
    if (
      await page
        .getByRole("switch", { name: "Warranty by default", exact: true })
        .isChecked()
    )
      await page
        .getByRole("switch", { name: "Warranty by default", exact: true })
        .locator("..")
        .click();
    assert(
      await page
        .getByRole("spinbutton", {
          name: "Default warranty (months)",
          exact: true,
        })
        .isDisabled(),
    );
    await page
      .getByRole("switch", { name: "Warranty by default", exact: true })
      .locator("..")
      .click();
    assert(
      await page
        .getByRole("spinbutton", {
          name: "Default warranty (months)",
          exact: true,
        })
        .isEnabled(),
    );
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await page
      .getByRole("searchbox", { name: "Search settings", exact: true })
      .fill("Invoice rounding");
    await page.locator("[data-settings-result]").first().click();
    await page.waitForURL(/settings\/sales/);
    await page
      .getByRole("combobox", { name: "Invoice rounding", exact: true })
      .waitFor();
    const previousRounding = await page
      .getByRole("combobox", { name: "Invoice rounding", exact: true })
      .getAttribute("data-value");
    await select(
      page,
      "Invoice rounding",
      previousRounding === "Nearest ৳1" ? "No rounding" : "Nearest ৳1",
    );
    await page.locator('[data-settings-section="business"]').click();
    await page
      .getByRole("button", { name: "Save and continue", exact: true })
      .click();
    await page
      .getByRole("dialog", { name: "Review changes", exact: true })
      .waitFor();
    await page
      .getByRole("button", { name: "Confirm save", exact: true })
      .click();
    await page.waitForURL(/settings\/business/);
    await page
      .getByRole("button", { name: "About this preview", exact: true })
      .click();
    await select(page, "Demo employee access", "rafiq");
    await open(page, "sales");
    assert(
      await page
        .getByRole("combobox", { name: "Invoice rounding", exact: true })
        .isDisabled(),
    );
    assert(
      await page
        .getByRole("button", { name: "Save changes", exact: true })
        .isDisabled(),
    );
    await context.close();
    evidence.push(
      "save/cancel/reload, failed validation, guarded navigation with review, field search, dependencies, read-only permission",
    );

    const sections = [
      "business",
      "sales",
      "products",
      "purchases",
      "money",
      "invoices",
      "team",
      "notifications",
      "interface",
      "personal",
      "security",
      "financialTerminology",
      "data",
    ];
    for (const [width, language, mode, theme] of [
      [1440, "Bangla", "Simple", "light"],
      [390, "Bangla", "Advanced", "light"],
      [768, "English + Bangla", "Simple", "dark"],
    ]) {
      const c = await browser.newContext({
        viewport: { width, height: 1000 },
        reducedMotion: "reduce",
        colorScheme: theme,
      });
      await seed(c, language, mode);
      const p = await c.newPage();
      listen(p);
      for (const section of sections) {
        await open(p, section);
        assert.equal(await p.locator('input[name="settings-mode"]').count(), 0);
        assert(
          await p.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
          `${width}/${language}/${section} page overflow`,
        );
        const geometry = await p
          .locator(
            ".erp-settings input[data-hisabiq-input]:visible, .erp-settings button[data-hisabiq-button]:visible, .erp-settings button[data-hisabiq-select]:visible",
          )
          .evaluateAll((nodes) =>
            nodes.map((node) => ({
              text: node.getAttribute("aria-label") || node.textContent,
              height: node.getBoundingClientRect().height,
            })),
          );
        assert(
          geometry.every((item) => Math.abs(item.height - 36) < 1),
          `${section}: controls must stay 36px: ${JSON.stringify(geometry.filter((item) => Math.abs(item.height - 36) >= 1))}`,
        );
        if (section === "business")
          await p.screenshot({
            path: path.join(
              out,
              width === 1440
                ? "desktop.png"
                : width === 390
                  ? "mobile.png"
                  : "tablet-dark.png",
            ),
            fullPage: true,
          });
        if (width === 390 && section === "business") {
          await p.getByRole("button", { name: "দোকান", exact: true }).click();
          assert.equal(
            await p
              .locator("[data-settings-directory] [role=tab]:visible")
              .count(),
            13,
          );
          await p.locator('[data-settings-section="products"]').click();
          await p.waitForURL(/settings\/products/);
        }
      }
      evidence.push(
        `${width}px, ${language}, ${theme}, legacy ${mode}: all 13 settings sections, no page overflow, shared 36px controls`,
      );
      await c.close();
    }
    const bnContext = await browser.newContext({viewport:{width:1440,height:1400},reducedMotion:'reduce'});
    await seed(bnContext,'Bangla');
    const bn = await bnContext.newPage(); listen(bn);
    await open(bn,'data');
    await bn.getByLabel('HisabIQ গোপন চাবি',{exact:true}).fill('Bangla recovery key 12345');
    await bn.getByLabel('ডাউনলোডের জন্য চাবি আবার লিখুন',{exact:true}).fill('Bangla recovery key 12345');
    await bn.screenshot({path:path.join(out,'bangla-backup.png'),fullPage:true});
    await bn.locator('summary').filter({hasText:'JSON ব্যাকআপ'}).click();
    const restoreInput = bn.getByLabel('ব্যাকআপ ফেরত আনুন',{exact:true});
    await restoreInput.setInputFiles({name:'wrong-shop.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(defaults('other')))});
    await bn.getByRole('alert').filter({hasText:'ব্যাকআপটি সঠিক নয় অথবা অন্য দোকানের।'}).waitFor();
    const restoreDraft = defaults(); restoreDraft.sections.business.name='ফেরত আনা দোকান';
    await restoreInput.setInputFiles({name:'same-shop.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(restoreDraft))});
    const review = bn.getByRole('dialog',{name:'ফেরত আনার আগে দেখে নিন',exact:true});
    await review.getByRole('button',{name:'সেটিংস ফেরত আনুন',exact:true}).waitFor();
    await review.getByRole('button',{name:'বাতিল',exact:true}).waitFor();
    await bn.screenshot({path:path.join(out,'bangla-restore-review.png'),fullPage:true});
    await review.getByRole('button',{name:'সেটিংস ফেরত আনুন',exact:true}).click();
    await bn.getByRole('status').filter({hasText:'সেটিংস ফেরত এসেছে। পুরোনো রেকর্ড ঠিক আছে।'}).waitFor();
    await open(bn,'team');
    await bn.getByRole('tab',{name:'ভূমিকা',exact:true}).click();
    await bn.getByRole('button',{name:'ভূমিকা যোগ',exact:true}).click();
    const role = bn.getByRole('dialog',{name:'ভূমিকা যোগ',exact:true});
    await role.getByLabel('ভূমিকার নাম',{exact:true}).fill('পরীক্ষার কর্মী');
    await role.getByRole('checkbox',{name:/কর্মীদের তালিকা দেখুন/}).check();
    await role.getByRole('checkbox',{name:/কর্মী যোগ করুন/}).check();
    await role.getByRole('checkbox',{name:/কারা প্রভাবিত হবেন দেখেছি/}).check();
    await role.getByText('যে অনুমতি যোগ হবে:',{exact:false}).waitFor();
    await role.getByText('কোন বিভাগের সেটিংস বদলাবে',{exact:true}).waitFor();
    await role.getByText('এখন কারও এই ভূমিকা নেই',{exact:true}).waitFor();
    await bn.screenshot({path:path.join(out,'bangla-role.png'),fullPage:true});
    await role.getByRole('button',{name:'ভূমিকার খসড়া রাখুন',exact:true}).click();
    await bn.getByRole('button',{name:'সংরক্ষণ',exact:true}).click();
    await bn.getByRole('status').filter({hasText:'দোকানের সেটিংস সংরক্ষিত হয়েছে।'}).waitFor();
    const storedRole = await bn.evaluate(()=>JSON.parse(localStorage.getItem('hisabiq-erp-settings-v1:t1')).sections.team.roles.find(role=>role.name==='পরীক্ষার কর্মী'));
    assert.deepEqual(storedRole.permissions,['user.account.view','user.account.create']);
    await bnContext.close();
    evidence.push('Bangla backup password labels, wrong-shop error, restore review and success, role permission labels/review/actions, canonical permission codes preserved');
    assert.deepEqual(errors, []);
    fs.writeFileSync(
      path.join(out, "settings-checks.json"),
      JSON.stringify(evidence, null, 2),
    );
    console.log(
      JSON.stringify({ passed: evidence, screenshots: out }, null, 2),
    );
  } finally {
    await browser.close();
    await server.close();
  }
}
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
