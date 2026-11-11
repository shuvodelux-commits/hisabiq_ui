# Recycle Bin, ERP delete actions and Start Cash Session

Status: proposed for owner review; no product implementation yet.

## Intent and sources

Bring the Recycle Bin module from the supplied Magic Patterns design into HisabIQ UI, connect Delete in ERP record action menus, and add an accessible Start Cash Session flow based on NestSherERP. Preserve the current HisabIQ layout, shared components, English/Bangla preferences and light/dark themes.

Sources inspected:

- Target: `shuvodelux-commits/hisabiq_ui`, local revision `de33350ea48d7d0c1040b0895b227310cbd484a6`.
- Magic Patterns editor `t6q3mxi6nhuak3qjvx8cwn`, artifact `238f01b4-0e3b-4eda-aac5-6d542fbf85cd`: `pages/RecycleBin.tsx`, `components/recycle/RecycleBinList.tsx` and related context/types.
- NestSherERP: `shuvodelux-commits/nestshererp`, `SRS_AND_BUILD_GUIDE.md` section 5.16, plus actual UI on branch `chore/hisabiq-adoption-runtime-a01`: `apps/web/src/components/money/{DayStatusChip,StartDayDialog,EndDayDialog,ReopenDayDialog}.vue` and `apps/web/src/api/money.ts`. Pin the branch's exact commit during implementation.
- Binding target rules: `AGENTS.md`, `docs/ui/HISABIQ-DESIGN-GUIDE.md`, `docs/ui/AI-UI-PROMPT.md`, transaction-cart contract and ERP contextual-workflow contract.

## Current behavior

- `salesPreviewStore.ts` already supports same-session, 30-day sales-draft recovery. Settings renders it through `DraftRecovery.tsx`. There is no standalone Recycle Bin route.
- Purchase drafts and draft quotations are removed from their preview stores without recovery. Template deletion is separate. Product deletion is limited to eligible unsold bundles; ordinary products and parties have deactivation workflows.
- Posted-record operations vary by owner: Audit Ledger has reasoned deletion, Expense has cancellation, and Party/Finance have source-specific reversal. These stores must not be replaced by an unrelated copy of the Magic Patterns demo store.
- `CashSessionContext.tsx` starts with a sample open session and hardcoded sample movements. Its dialog supports opening only after closing that sample session. Opening/counts reset on reload and are explicitly disconnected from sales/payment posting. Finance history uses separate sample rows.

## Approaches

1. **Recommended: adapt the reference UI to existing stores and domain commands.** Introduce one recovery service with narrow adapters; keep source-specific financial operations. Extend the existing cash context/dialog/history. This fits HisabIQ's rules and avoids two sources of truth.
2. Port the prototype contexts and demo store wholesale. This reproduces prototype interactions quickly but duplicates live HisabIQ state, permissions and record identity. Rejected.
3. Integrate production APIs and accounting across all modules now. Durable recovery and cash posting require this eventually, but it expands the requested UI work into a backend project. Deferred unless the owner explicitly includes backend work.

The recommended approach and the proposed policies below are author recommendations, not recorded owner approval.

## Scope and honesty

This is a functional UI-preview implementation in `hisabiq_ui`, using its actual preview stores. Deletion, restore, session opening and closing must change those stores and visible history. Each screen must clearly disclose preview persistence and posting limits. Do not claim real server authorization, automatic durable purge, cash posting or ledger reversal from local state changes.

Do not change backend repositories, SaaS billing/admin records, authentication sessions, global tokens, existing navigation presentation, or transaction cart behavior. Deliver feature branches and draft PRs; merge and deployment remain separate owner decisions.

## Recycle Bin

- Add `/app/recycle-bin` through the existing hash router and Settings navigation; replace the embedded sales-only recovery list with a link/summary backed by the same service.
- Preserve the reference hierarchy: page heading and deleted count; module tabs; search; status filter; selection and bulk restore; compact table; details; restore outcome; owner-only permanent-delete confirmation.
- Eligible records: sales drafts, sale templates, purchase drafts, draft quotations, draft online orders, notes, never-used products including eligible unsold bundles, and never-used parties. Add Purchases/Online filters because the requested coverage is ERP-wide.
- Published/accepted quotations and progressed online orders retain their lifecycle actions. They do not become drafts on restore.
- Never-used means no source reference, inventory/stock history, bundle dependency, financial balance, allocation, credit, refund, payment, fulfilment or other downstream history. Zero current balance alone does not prove a master record was never used. Block deletion with a readable reason if complete eligibility cannot be established.
- Recoverable records retain original identity and a full immutable payload, tenant, actor, deletion time, 30-day deadline, revision and lifecycle state. Use a distinct deletion ID so repeated delete/restore cycles cannot accidentally target an older deletion.
- One service owns recovery metadata and subscriptions; adapters mutate the actual source stores. Validate permission, tenant, source revision, eligibility and dependencies before removal; publish source/recovery changes as one observable operation.
- Restore validates current permission, tenant, exact expiry boundary, identity/SKU/phone conflicts and missing dependencies. It restores the original source identity once, with no stock or financial posting. Show failures inline and preserve retry context.
- Bulk restore operates only on selected eligible visible rows; report partial failures by item. Clear selection when search, tab or status changes.
- Restored rows show their state and an Open link to the owning module. Expired rows are blocked; lazy removal of payload in an in-memory preview must not be described as a server retention job.
- Permanent deletion requires owner authority and typing the displayed confirmation text. Retain minimal audit metadata, remove the payload and prevent later restore. No financial source can be purged here.

## ERP delete action matrix

| Record/menu | Required outcome |
| --- | --- |
| Sales/POS drafts and templates | Delete → confirmation → Recycle Bin; Undo uses the same restore command |
| Purchase drafts | User deletion → Recycle Bin; successful conversion/consumption is a separate command and must not create a deleted draft |
| Draft quotations and draft online orders | Delete → Recycle Bin; converted or progressed records show a reason and their lifecycle action |
| Products, services and bundles | Eligible never-used records → Recycle Bin; historical use blocks deletion and retains Deactivate |
| Parties, including customer/supplier/vendor/payee roles | Eligible never-used identity → Recycle Bin; inspect all roles and references; used identity retains Deactivate |
| Party notes | Delete → Recycle Bin; restore to the same party, with missing-party checks |
| Posted sales, purchases, returns, expenses, payments, vouchers, transfers and vendor operations | Delete entry opens source-owned impact/reason review where an eligible audited delete/reversal command exists; otherwise disabled with the exact limitation |
| Daybook, ledgers, reports, reconciliations and stock-history projections | Delete resolves the original source review; never delete a derived debit/credit/stock row |
| Closed cash sessions and immutable audit events | Delete disabled with explanation; correction must be a new audited operation |
| Categories/brands/units/accounts and other referenced setup records | Show Delete eligibility and block with explanation; retain current edit/deactivation paths. Setup-record recovery adapters are explicitly deferred from this delivery; do not permanently remove them |

All destructive entries are last in the existing ActionMenu family. Keep current record, date range, filters, scroll and draft after cancel/success. Do not route an eligible record to an unrelated sample audit record by matching only a display reference. A visible disabled reason is required where source identity or a safe mutation is missing; a success toast without a source mutation fails acceptance.

Permission recommendation: introduce explicit recovery view/restore/purge and the actual reference grants `cash.daily.view`, `cash.session.start` and `cash.session.close` in the existing RBAC catalogue; owner receives them, and other roles need explicit grants. Source deletion also requires the corresponding module grant. Do not silently make every employee a cashier with start/end authority. Preview checks do not substitute for server enforcement.

## Start Cash Session / Start Day

- One business drawer session per tenant and business day, per NestSherERP section 5.16. Keep the opening business date across midnight; no per-cashier sessions.
- Start with no active session, so Start cash session is reachable directly from TopBar and Finance. Respect the existing cash-session enable setting. Keep the first opening amount blank; zero is valid; accept valid two-decimal currency without silently stripping characters.
- Follow the actual `StartDayDialog.vue` sequence: show previous actual counted close when present, then ask for actual counted opening. Compute the difference against the drawer's existing balance (normally the previous actual close). Suggested previous cash is context, not a prefilled count. Previous expected cash must never substitute for previous actual cash. On the first session, explicitly identify the absence of prior history; a positive amount above the initial drawer balance still requires a declared source.
- Only when the difference is nonzero, reveal the amount/direction and source/destination choices: owner injection/drawing, another active cash account, or active bank account as appropriate. Exclude the drawer itself. The selected choice supplies the explanation; free-text note is optional, matching the actual source UI. Preserve the account identity and reviewed movement in preview history. No generic unexplained withdrawal option.
- Guard duplicate starts and stale revisions at the store command, not only by disabling the button. Preserve user input on failure. Enforce one session for the business date; a closed session cannot be overwritten as another session for that date. Show an earlier unclosed session as blocked and open its existing count/close flow before allowing a new day, matching `DayStatusChip.vue`.
- The source branch also has a separately audited Reopen Day command and offline queue. Those are outside this Start Cash Session delivery. Preserve closed history and show the limitation; do not emulate reopening by overwriting the old session. Existing HisabIQ denomination counting remains available; copying Start Day does not authorize replacing its close UI with NestSherERP's total-only close flow.
- Extend existing counting/closing: expected = opening + eligible cash in − eligible cash out. Separate expected, counted and difference. Save count stays open; closing freezes the session snapshot and requires a reason for a difference. Closed history is read-only.
- Remove the hardcoded sample movement totals from newly opened sessions. Use explicitly source-linked preview movements where those already exist; otherwise show no connected activity and the UI-preview limitation. Do not suggest that opening enables production cash posting.
- Connect current and newly closed session rows to Finance history/details through the same store. Keep older sample history labelled and separate; do not derive a real opening amount from arbitrary dated sample rows.
- NestSherERP's server rules reject cash-affecting posting without an open enabled session, post shortage/overage, and reconcile opening differences. This UI work exposes and validates the intended workflow but cannot establish those backend guarantees. Existing POS preview behavior must disclose that boundary.

## Component mapping

Reuse `PageHeader`, `Panel`, `Button`, `Input`/`NumericInput`, `AppSelect`, `Table`, `StatusBadge`, `Dialog`, `RowActionMenu`, `ActionMenuItem`, `FloatingPanel`, `MotionTabList`, existing date/currency helpers, `useUiCopy`, `TenantSettingsProvider`, `CashSessionDialog` and `CashSessionDetailsDialog`. Use the existing checkbox pattern for selection. Compose domain-specific recovery details/confirmation without another generic modal/button library. No new dependency is expected.

Preserve 36px ordinary controls, 13/12/11 table roles, tokens, proportional digits, phone/tablet/desktop behavior, accessible names, focus return, Escape and reduced motion. Every new shared family needs a working library specimen and regenerated design inventory.

## Delivery and verification

Implement in dependency order: (1) recovery service and standalone bin; (2) module-by-module Delete wiring and source-review matrix; (3) Start Day and shared session history. Keep these as bounded changes/draft PRs with explicit dependencies rather than a wholesale ERP rewrite.

Meaningful domain checks: delete/restore original identity, exact expiry, repeated cycles, denied tenant/actor, stale revision, dependency/conflict, purge authorization, bulk partial failure, draft consumption, no posted record in recovery, no financial projection deletion; zero/decimal/invalid opening, duplicate start, enable setting, opening difference source/destination, immutable close and one business date across midnight. Use NestSherERP's 20,000 + 50,000 + 5,000 − 3,000 − 7,000 = 65,000 expected; 64,500 counted; next opening 64,500/70,000/60,000 examples for cash model checks.

Run changed-code type/lint checks, build, focused domain tests, `npm run check:ui-contract`, guide sync check and existing relevant draft/cash/finance/browser regressions. Add Playwright journeys for real menu → review → mutation → bin → restore, blocked posted deletion, and direct Start Day → count → close → history. Capture English/Bangla, light/dark and phone/tablet/desktop, keyboard focus/Escape and open overlays. Report failed/pre-existing/blocked checks precisely.

## Owner decisions before implementation

1. Approve or amend the recommended UI-preview approach, recovery eligibility and source-safe Delete policy above.
2. The UI reference question is resolved: use the actual Start Day dialog and day-status chip on `chore/hisabiq-adoption-runtime-a01`, expressed through HisabIQ's shared controls. No additional source input is needed unless the owner intended a different branch.

Implementation details left to the builder: adapter file boundaries, module slice order within the dependencies above, test fixture organisation and compact layout wrapping that follows existing controls. Do not treat unimplemented backend posting as one of these routine choices.
