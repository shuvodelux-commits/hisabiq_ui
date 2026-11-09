import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { settingsFields } from "../src/settings/fields.ts";

const matrixPath = new URL("../docs/settings/functional-migration-matrix.md", import.meta.url);
type AuditRow = {
  kind: string; id: string; enBn: string; legacy: string; main: string; pr: string;
  consumer: string; displayed: string; editable: string; persistent: string;
  consumed: string; enforced: string; readiness: string; priority: string; evidence: string;
};

function readRows(): AuditRow[] {
  const markdown = readFileSync(matrixPath, "utf8");
  return markdown.split("\n")
    .filter(line => /^\| (ordinary|specialized) \|/.test(line))
    .map(line => {
      const parts = line.split("|").slice(1, -1).map(v => v.trim());
      assert.equal(parts.length, 15, "Every audit row has the full 15-column schema: " + line);
      const [kind, id, enBn, legacy, main, pr, consumer, displayed, editable, persistent, consumed, enforced, readiness, priority, evidence] = parts;
      return {kind, id, enBn, legacy, main, pr, consumer, displayed, editable, persistent, consumed, enforced, readiness, priority, evidence};
    });
}

test("every canonical ordinary field has exactly one audited row", () => {
  const canonical = Object.entries(settingsFields).flatMap(([section, fields]) =>
    (fields ?? []).map(field => section + "." + field.key));
  assert.equal(canonical.length, 60, "Document any intentional changes to the pinned legacy 60-field catalogue");
  assert.equal(new Set(canonical).size, 60, "Canonical field keys must be distinct");
  const ordinary = readRows().filter(row => row.kind === "ordinary");
  const found = ordinary.map(row => row.id);
  assert.deepEqual(found.slice().sort(), canonical.slice().sort(), "Every field must appear once, with no extraneous or duplicate ordinary rows");
});

test("specialized legacy workflows cannot disappear silently", () => {
  const rows = readRows();
  const ids = rows.map(row => row.id);
  const required = [
    "team.employees", "team.roles", "data.settingsJsonBackup",
    "data.encryptedSettingsSnapshot", "data.deletedSalesDrafts",
    "activity.settingsChanges", "invoices.documentDesign",
    "invoices.numbering", "invoices.ledgerReportProfiles",
    "financialTerminology.khataLabels", "interface.moduleColumns",
    "security.accountSecurity",
  ];
  for (const key of required) assert.ok(ids.includes(key), "Missing specialist: " + key);
  assert.equal(new Set(ids).size, ids.length, "Duplicate matrix ID");
});

test("audit statuses never conflate visibility, saving, consumption and enforcement", () => {
  const statuses = new Set(["yes", "no", "partial", "unverified", "n/a"]);
  const readiness = new Set(["browser-working", "preview-only", "backend-required", "unsupported", "unverified"]);
  const priority = new Set(["P0", "P1", "P2", "P3"]);
  for (const row of readRows()) {
    for (const key of ["displayed", "editable", "persistent", "consumed", "enforced"] as const)
      assert.ok(statuses.has(row[key]), row.id + ": invalid " + key + "=" + row[key]);
    assert.ok(readiness.has(row.readiness), row.id + ": invalid readiness");
    assert.ok(priority.has(row.priority), row.id + ": invalid priority");
    for (const key of ["legacy", "main", "pr", "consumer", "evidence"] as const)
      assert.ok(row[key].length >= 5, row.id + ": requires explicit evidence or 'none found' (not a blank cell)");
    assert.ok(row.enBn.length > 0, row.id + ": missing label");
    assert.ok(row.enforced !== "yes" || row.evidence.includes("enforcement:"),
      row.id + ": 'enforced=yes' requires named enforcement evidence");
    if (row.consumed === "yes") {
      assert.ok(row.consumer.includes("src/"), row.id + ": consumed=yes requires actual source consumer path");
    }
  }
});

test("main and PR 274 descriptions allow unchanged behavior", () => {
  const markdown = readFileSync(matrixPath, "utf8");
  assert.match(markdown, /main.*e73e83d01f8e6237a7a74ce0a6db72e45d6292f4/s);
  assert.match(markdown, /PR #274.*053f2ceb29fff556eed06461575dc9cbb650e92c/s);
  const rows = readRows();
  assert.ok(rows.length >= 72, "60 ordinary plus at least 12 specialists");
  assert.ok(rows.some(row => /unchanged/i.test(row.pr)), "Unchanged features must be recorded honestly");
  for (const row of rows) {
    assert.ok(row.main.length > 5 && row.pr.length > 5, row.id + ": describe both versions");
  }
});

test("browser-working label rejects unverified consumption or missing persistence", () => {
  for (const row of readRows().filter(row => row.readiness === "browser-working")) {
    assert.ok(["yes", "partial"].includes(row.persistent), row.id + ": working without persistence");
    assert.ok(["yes", "partial"].includes(row.consumed), row.id + ": unverified or absent consumer cannot be working");
  }
});


test("the ordinary inventory retains exact English and Bangla field labels", () => {
  const rows = new Map(readRows().filter(row => row.kind === "ordinary").map(row => [row.id, row]));
  for (const [section, fields] of Object.entries(settingsFields)) {
    for (const field of fields ?? []) {
      const id = section + "." + field.key;
      assert.equal(rows.get(id)?.enBn, field.label + " / " + field.bn,
        id + ": the audit should preserve the real bilingual source label");
    }
  }
});
