# Recovery preview workflow coverage

This slice uses actual in-memory preview stores. Reloading resets source and recovery state. No backend authorization, durable retention job, stock, cash or ledger posting is implied.

| Source | Entry and outcome | Guard / restore dependency |
| --- | --- | --- |
| Sales draft | Existing action menu → Delete confirmation → bin; Undo uses deletion ID | Source revision, tenant/module permission, original product/party |
| Sale template | Existing action menu → Delete confirmation → bin | Source revision, original product/party |
| Purchase draft | Existing draft menu → confirmation → bin | Original supplier/products; posting consumes separately without recovery |
| Draft quotation | Existing detail Delete confirmation → bin | Draft only; original products/party; failure preserves confirmation |
| Online draft | Existing row/detail action menu → confirmation → bin | Unpaid Draft without progressed history; original products/party |
| Product/service/bundle | Existing product menu → confirmation → bin | Seed history is unverified and blocked; stock/lots/movements/source use, bundle recipes and dependencies checked; SKU/component checks on restore |
| Party identity | Existing More menu → confirmation → bin | All roles; seed history blocked; sources, balances, finance, expense, purchase, vendor, quote/order/draft references; phone conflict on restore |
| Party note | Existing note Delete → confirmation → bin | Original party must exist on restore; original note identity |

The bin has module tabs (including Purchases, Quotations and Online), search, status, visible-row selection, per-item bulk outcomes, details, original-module links and owner-only typed permanent deletion. Purge removes the payload while retaining deletion audit metadata. Exact expiry uses `now >= expiresAt`. Every deletion cycle has a fresh identity; an old Undo cannot restore a later cycle.

Shared controls: PageHeader, Button, Input, AppSelect, Table, Dialog, RowActionMenu / ActionMenuItem, FloatingPanel and MotionTabList. An isolated working recovery specimen is in the visual component library. No new dependency.

Evidence: `tests/recovery.test.ts`, `tests/recoveryAdapters.test.ts`, the draft/quotation/settings regressions and `scripts/recycle-bin-browser.cjs`. The browser script covers a real Sales menu, cancellation, mutation, details/Escape/focus, original identity restore, English/Bangla, light/dark and 390/820/1366px viewports. Screenshots are written to `/tmp/recycle-bin-*.png`.

Source-safe posted transaction policies are the following plan task, outside this recovery slice. Never-used eligibility is established from the available preview sources, with legacy seed identities blocked when complete history cannot be established.
