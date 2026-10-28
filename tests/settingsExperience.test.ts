import test from "node:test";
import assert from "node:assert/strict";
import { settingsFields } from "../src/settings/fields.ts";
import {
  settingTasks,
  taskFields,
  fieldDependency,
  fieldHelpBangla,
  settingOption,
} from "../src/settings/experience.ts";
import type { BusinessSection } from "../src/settings/model.ts";

test("task groups retain every existing control exactly once, including former Advanced controls", () => {
  for (const section of Object.keys(settingTasks) as BusinessSection[]) {
    const fields = settingsFields[section] ?? [];
    const delegated =
      section === "invoices"
        ? [
            "paper",
            "showLogo",
            "showBangla",
            "footer",
            "showSerial",
            "showWarranty",
          ]
        : [];
    const expected = fields
      .filter((field) => !delegated.includes(field.key))
      .map((field) => field.key)
      .sort();
    const actual = taskFields(section, fields)
      .flatMap((task) => task.fields.map((field) => field.key))
      .sort();
    assert.deepEqual(
      actual,
      expected,
      `${section} must not hide or repeat any setting`,
    );
    for (const key of actual)
      assert.ok(
        fieldHelpBangla[`${section}.${key}`],
        `${section}.${key} needs Bangla help`,
      );
  }
});

test("dependent controls have section-specific parents; switching off does not erase values", () => {
  assert.equal(fieldDependency("products", "warrantyMonths"), "warranty");
  assert.equal(fieldDependency("products", "expiryDays"), "expiry");
  assert.equal(fieldDependency("notifications", "expiryDays"), undefined);
  assert.equal(fieldDependency("products", "serial"), undefined);
});

test("translated option labels retain canonical stored values and unknown names", () => {
  assert.equal(settingOption("FIFO", "Bangla"), "আগে আসা পণ্য আগে");
  assert.equal(settingOption("FIFO", "English"), "FIFO");
  assert.equal(
    settingOption("bKash Business · 01711•••412", "Bangla"),
    "bKash Business · 01711•••412",
  );
});
