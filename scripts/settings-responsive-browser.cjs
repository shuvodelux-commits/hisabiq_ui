/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires -- Playwright CLI uses CommonJS. */
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
async function main() {
  const { createServer } = await import("vite");
  const server = await createServer({
    server: { host: "127.0.0.1", port: 4291, strictPort: true },
  });
  await server.listen();
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: "reduce",
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("http://127.0.0.1:4291/#/app/settings/business");
    await page
      .getByRole("heading", { level: 1, name: "Business profile", exact: true })
      .waitFor();
    assert.equal(
      await page
        .getByRole("combobox", { name: "Settings section", exact: true })
        .count(),
      0,
    );
    assert.equal(
      await page
        .getByText("Browse all settings · সব সেটিংস", { exact: true })
        .count(),
      0,
    );
    const main = page.getByRole("tablist", {
      name: "Settings categories",
      exact: true,
    });
    const sub = page.getByRole("tablist", {
      name: "Business profile sub-settings",
      exact: true,
    });
    await page
      .getByLabel("Business name", { exact: true })
      .fill("Responsive draft shop");
    for (const width of [320, 767, 768, 799, 800, 1023, 1024, 1280, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.waitForFunction(
        (desktop) =>
          document
            .querySelector('[aria-label="Business profile sub-settings"]')
            .getAttribute("aria-orientation") ===
          (desktop ? "vertical" : "horizontal"),
        width >= 1024,
      );
      assert.equal(await main.getAttribute("aria-orientation"), "horizontal");
      assert.equal(
        await page.getByLabel("Business name", { exact: true }).inputValue(),
        "Responsive draft shop",
      );
      await page.waitForFunction(() => {
        const nav = document.querySelector(
            '[data-settings-navigation="sections"]',
          ),
          tab = nav.querySelector('[aria-selected="true"]');
        const a = nav.getBoundingClientRect(),
          b = tab.getBoundingClientRect();
        return b.left >= a.left - 1 && b.right <= a.right + 1;
      });
      const geometry = await page.evaluate(() => {
        const nav = document.querySelector(
            '[data-settings-navigation="subsections"]',
          ),
          panel = document.querySelector("[data-settings-subpanel]");
        const a = nav.getBoundingClientRect(),
          b = panel.getBoundingClientRect();
        const inputs = [
          ...document.querySelectorAll(
            "[data-settings-subpanel] [data-field-key] input",
          ),
        ]
          .filter((el) => el.getClientRects().length)
          .map((el) => el.getBoundingClientRect());
        const main = document.querySelector(
            '[data-settings-navigation="sections"]',
          ),
          selected = main.querySelector('[aria-selected="true"]');
        const mainBox = main.getBoundingClientRect(),
          selectedBox = selected.getBoundingClientRect();
        return {
          selectedVisible:
            selectedBox.left >= mainBox.left - 1 &&
            selectedBox.right <= mainBox.right + 1,
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          left: a.right <= b.left + 1,
          above: a.bottom <= b.top + 1,
          fieldColumns:
            inputs.length > 1 && inputs[1].left > inputs[0].left + 20,
          fieldRoom: document
            .querySelector('[data-field-key="name"]')
            .parentElement.getBoundingClientRect().width,
        };
      });
      assert.equal(geometry.overflow, false, width + " page fits");
      assert.equal(
        geometry.selectedVisible,
        true,
        width + " selected main tab stays visible",
      );
      assert.equal(
        width >= 1024 ? geometry.left : geometry.above,
        true,
        width + " uses Party workspace bands",
      );
      assert.equal(
        geometry.fieldColumns,
        width >= 768 && geometry.fieldRoom >= 504,
        width + " form keeps readable columns within Party workspace bands",
      );
    }
    await page.setViewportSize({ width: 800, height: 1000 });
    await sub.getByRole("tab", { name: /General/ }).focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    await page.getByLabel("Phone number", { exact: true }).fill("01711000245");
    await page.setViewportSize({ width: 1024, height: 1000 });
    await sub.getByRole("tab", { name: /Contact & address/ }).focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await page.getByLabel("Business logo", { exact: true }).waitFor();
    await sub.getByRole("tab", { name: /General/ }).click();
    assert.equal(
      await page.getByLabel("Business name", { exact: true }).inputValue(),
      "Responsive draft shop",
    );
    await main.getByRole("tab", { name: /Sales & POS/ }).click();
    const leave = page.getByRole("dialog", {
      name: "Discard unsaved changes?",
    });
    await leave.waitFor();
    await leave
      .getByRole("button", { name: "Keep editing", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Save changes", exact: true })
      .click();
    await page
      .getByRole("status")
      .filter({ hasText: "Business settings saved." })
      .waitFor();
    await page.reload();
    assert.equal(
      await page.getByLabel("Business name", { exact: true }).inputValue(),
      "Responsive draft shop",
    );
    await sub.getByRole("tab", { name: /Contact & address/ }).click();
    assert.equal(
      await page.getByLabel("Phone number", { exact: true }).inputValue(),
      "01711000245",
    );
    await page
      .getByRole("searchbox", { name: "Search settings", exact: true })
      .fill("logo");
    await page
      .getByRole("region", { name: "Settings search results" })
      .getByRole("button", { name: /Business logo/ })
      .click();
    await page.getByLabel("Business logo", { exact: true }).waitFor();
    assert.equal(
      await sub
        .getByRole("tab", { name: /Logo & branding/ })
        .getAttribute("aria-selected"),
      "true",
    );
    const reviewFailures = [];
    await page.setViewportSize({ width: 768, height: 1000 });
    await main.locator('[data-settings-section="personal"]').focus();
    await page.keyboard.press("Enter");
    await page.waitForURL("**/settings/personal");
    if (
      (await page.evaluate(() =>
        document.activeElement?.getAttribute("data-settings-section"),
      )) !== "personal"
    )
      reviewFailures.push("Main tab activation must preserve keyboard focus");
    const chooseLanguage = async (value) => {
      await page
        .getByRole("combobox", { name: "Language", exact: true })
        .click();
      await page.locator(`[role=option][data-value="${value}"]`).click();
      await page
        .getByRole("button", { name: "Save changes", exact: true })
        .click();
      await page
        .getByRole("status")
        .filter({ hasText: /preferences saved/ })
        .waitFor();
    };
    await chooseLanguage("English");
    await chooseLanguage("English + Bangla");
    await page.waitForFunction(() =>
      document
        .querySelector('[data-settings-section="personal"]')
        .textContent.includes("আমার পছন্দ"),
    );
    if (
      !(await page.evaluate(() => {
        const nav = document.querySelector(
            '[data-settings-navigation="sections"]',
          ),
          tab = nav.querySelector('[aria-selected="true"]');
        const a = nav.getBoundingClientRect(),
          b = tab.getBoundingClientRect();
        return b.left >= a.left - 1 && b.right <= a.right + 1;
      }))
    )
      reviewFailures.push(
        "Language changes must keep the selected tab visible",
      );
    await main.locator('[data-settings-section="business"]').click();
    await page
      .getByLabel("Business name", { exact: true })
      .fill("Deferred focus draft");
    await main.locator('[data-settings-section="sales"]').focus();
    await page.keyboard.press("Enter");
    await page
      .getByRole("dialog", { name: "Discard unsaved changes?" })
      .getByRole("button", { name: "Discard and continue", exact: true })
      .click();
    await page.waitForURL("**/settings/sales");
    if (
      (await page.evaluate(() =>
        document.activeElement?.getAttribute("data-settings-section"),
      )) !== "sales"
    )
      reviewFailures.push(
        "Deferred main-tab activation must preserve keyboard focus",
      );
    assert.deepEqual(reviewFailures, []);
    fs.mkdirSync(".superpowers/sdd/final-settings/responsive", {
      recursive: true,
    });
    for (const section of ["business", "invoices", "team"]) {
      await main.locator(`[data-settings-section="${section}"]`).click();
      await page.getByTestId("settings-title").waitFor();
      for (const width of [390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth + 1,
          ),
          false,
        );
        await page.screenshot({
          path: `.superpowers/sdd/final-settings/responsive/${section}-${width}.png`,
          fullPage: true,
        });
      }
    }
    assert.deepEqual(errors, []);
    console.log(
      "Party-aligned Settings: 768/1024 boundaries, 799/800 parity, title/tabs, keyboard, draft/save/search and 12 responsive screens passed.",
    );
  } finally {
    await browser?.close();
    await server.close();
  }
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
