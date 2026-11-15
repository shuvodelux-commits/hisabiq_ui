# MOD-001 #605 — connected read-only Invoice Studio gate

**Approved by owner:** 2026-11-15. **Source parent:** `hisabiq_ui` PR #579 head `397b830a1bb87536174e4b53fae54f75938247db`; backend read-only source `nestshererp` `476cefcdecad55873ee33bd182f12943fb4b1127`. #579 is not assumed merged. This route is a stacked draft only until its parent lands and the owner reviews it.

## REUSE / ADAPT / BLOCK

| Component or action | Source-backed implementation | #605 policy |
| --- | --- | --- |
| Settings navigation | Existing Magic labels and icon definitions | Connected invoices shown only with signed-in `sale.invoice.view` |
| Invoice preferences GET | Existing Nest `GET /api/v1/sales/invoice-settings` and `InvoiceStudio` | Fresh `/me` revalidation before adopting response; no six-design preview data |
| Private logo GET | Existing bearer-authenticated binary logo reader | Revalidate current verified tenant/user/epoch/token and `sale.invoice.view` **after** response, before constructing object URL; revoke URL on identity change/unmount |
| Mutations | Existing invoice preference PUT, logo upload/remove | Disabled within connected-only `fieldset`; #548 owns separate live logo mutation QA |
| Other connected modules | Existing `ConnectedWorkspaceGate` | Never mount preview `AppShell`, POS, Finance, cash/session stores or local backup workflows |
| Preview Settings | Existing Magic Patterns source | No changes to preview route, controls, layout or design |

## Acceptance matrix

- [ ] TDD new regression RED before source edits; GREEN after: permission-gated invoice nav, disabled connected editor and stale GET/binary reauthorization
- [ ] Signed-out: `#/app/settings/invoices` redirects to login, no invoice fields/private logo or preview forms
- [ ] Authenticated A/B with disposable PostgreSQL16: only `sale.invoice.view` can read invoices; no tenant B invoice/bytes appear in A's rendered view
- [ ] Delayed pre-revoke invoice preference **HTTP 200** cannot be adopted after `/me` loses invoice view grant
- [ ] Delayed pre-revoke private logo **HTTP 200** creates no object URL when the grant is revoked; prior object URLs revoked on tenant switch/unmount
- [ ] Unauthorized, locked, offline and unknown network outcomes display explicit states and no fixture fallback
- [ ] All visible connected Invoice Studio writes are disabled in this read-only slice
- [ ] Existing preview Settings, invoices, POS, Finance unaffected at 320/390/1440, keyboard/touch, English/Bangla
- [ ] Full TypeScript, lint, UI contract, unit, production build, targeted browser, GitHub CI and independent security review

**Release rule:** This ticket must not enable logo upload/removal or change backend/DB schemas. #548 live write acceptance resumes only after this route has real end-to-end read evidence and approved merge. The three-second `/me` polling production cadence remains a separate decision.
