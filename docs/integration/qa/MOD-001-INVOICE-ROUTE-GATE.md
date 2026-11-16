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

## #612 authorized logo-only successor (2026-11-16)

This scoped successor supersedes #605's blanket logo mutation prohibition only.
`VITE_CONNECTED_INVOICE_LOGO_WRITES` must be the compile-time string `true`;
missing, false and other strings leave logo writes OFF. No production flag was set.
Invoice preference handlers and controls remain disabled; Business/Team stay inside
their disabled fieldset. Preview code and backend are unchanged.

Local base: `918141878b1149a354ca881a774bf88c87e1ad82` on
`feat/mod001-612-logo-only-write-gate-20261116`; paired backend source remains
`476cefcdecad55873ee33bd182f12943fb4b1127` (not executed here).
Session log: native `gpt-6.1-sol`, reasoning `low`; installed readiness reports ready.
Changes are uncommitted; the orchestrator must pin the resulting commit and rerun
all external gates before draft PR. No merge or deployment is authorized here.

| Scenario | Executable evidence | Local result / remaining gate |
| --- | --- | --- |
| Held POST/DELETE success after revoked fresh grant; remount/token rotation | `tests/mod001-logo-authorization-race.test.ts`, two fresh-authorization race cases | Owner supplied RED (0 !== 2); GREEN locally |
| Revocation during file read, upload and delete; no automatic retry | Same file, revocation/blocking/unknown cases | GREEN |
| Denied grant before dispatch, denied manual reconciliation | Same file, denied fresh grant / manual refresh cases | GREEN |
| Literal true opt-in, both grants, same user, disabled preference handler/controls, Business/Team isolation | `scripts/mod001-connected-logo-write-gate.cjs` | RED exit 1 on missing opt-in, then GREEN exit 0; source assertions only |
| Mounted UI default OFF/ON; independent grant denial; same tenant/user/epoch/token, unhealthy sessions; private binary, original-file validation/boundaries | Existing browser/controller suites plus orchestrator acceptance | Required external verification pending |
| Lost response, concurrent actions, identity switch during revalidation, responsive/keyboard/touch/dark/light | Focused controller coverage is partial; mounted acceptance remains required | Not fully verified |
| Real two-tenant RLS, persisted bytes/audit | #548 disposable Nest/PostgreSQL acceptance | Separate task; not claimed here |
| Financial posting, cash sessions, stock, units, offline sync | No corresponding behavior changed | N/A: frontend logo gate only |

Executed locally: `node --experimental-strip-types --test tests/mod001-logo-authorization-race.test.ts`
exit 0; `node scripts/mod001-connected-logo-write-gate.cjs` exit 0;
`npx tsc --noEmit` exit 0 after correcting the initial two TypeScript errors;
`git diff --check` exit 0. Diagnostic `--test-isolation=none` ran nine cases (a tenth missing-callback denial case was subsequently added)
successfully but Vite emitted sandbox EPERM WebSocket-listener warnings.
The standard isolated test command is the recorded focused command.

Residual compatibility gate: older `tests/connected-invoice-logo-actions.test.ts`
configures the controller without a fresh-authorization callback and calls
`serverRefreshed()` synchronously. The new controller deliberately fails closed
without that callback and reconciliation is asynchronous. That suite needs an
explicitly authorized test-only migration outside this task's file allowlist;
it was not modified or claimed passing. Lint, build, full suite, UI contract,
Chromium, real API, GitHub CI and independent review remain unrun here.
**NOT VERIFIED / NOT MERGE-READY** until those gates are satisfied.
