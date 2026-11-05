# Expenses reconciliation — GitHub-only C0–C4 UI Refine evidence

**Route:** `#/app/expenses` · **PR:** #263 (draft) · **Source:** `src/pages/Expenses.tsx`  
**Base:** `c7162bf6f9c51d4323d2456101677fd739a976b5` (`main` after #262).  
**Verified implementation head:** `64cf17d7678ae523fcc2f2ff4bfb96779d681e90`.

## Provenance / scope

This reconciles the previous approved three-round Expenses pilot [#243](https://github.com/shuvodelux-commits/hisabiq_ui/pull/243) with current `main`. PR #243 was merged into the already-merged setup PR #242 branch; its Expenses page refinements were not in `main`. The original pilot's older generic action menus were **not** copied back: current `ActionMenuList`, `ActionMenuItem`, `ActionMenuDivider`, `FloatingPanel`, and action permissions were retained.

**Review mode:** GitHub-only ChatGPT-led Impeccable-guided C0–C4 with official pinned *mechanical* Impeccable source detector and real Playwright screenshots. The original independent-model parallel agent Workflow was not executed. No official independent agent design/audit or /40 scores are claimed.

## C0–C4 evidence ledger

| Check | Source / evidence | Review and changes | Tests / outcome | Design/Audit score |
|---|---|---|---|---|
| **C0 baseline** | Current main `c7162bf6`; exact *before* images in [screenshot run 42058918669](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/42058918669) | 320px four tabs wrapped into two lines; four secondary dropdowns, Reset and Export stacked; row Actions outside initial narrow viewport; desktop full layout retained. The first setup-only PR screenshot run was cancelled when later commits arrived, so final before-candidate comparison supplies the auditable C0 pixels. | Baseline captured in final 60-PNG comparison, not independently scored | Unscored |
| **C1 — adapt/harden** | `38687cd301ce992bffe7e08e6d525c0acb3514a9` | Restore pilot's one-row responsive underline tabs, show all four at 320px, roving tab focus and ArrowLeft/Right/Home/End. Current motion tab components preserved. | Source committed; standalone C1 workflow was superseded by later pushes, not separately reported green | Unscored |
| **C2 — layout/clarify** | `c647126d72d5ce21990f429201bcaf78decf87e9` | Reconcile approved Daybook responsive pattern: Search + 36px funnel Filter on phone/tablet, four original secondary filters behind reveal, active indicator, outlined 36px Reset alongside Status and preserved Export. Desktop controls visible, no invented date selector. Shared Sabab `AnimatedAdvancedFilters`. | Source committed; C2 run not falsely reported as isolated independent pass | Unscored |
| **C3 — harden/action reachability** | `0866a00577642960f9c4eb68933889e25853fa26` and inventory correction `70cd357e31f790ab23628c80a04790b8a83c9d6b` | Expense, Category and Payee tables gained sticky-right 36px `⋮` actions and scroll hints. Full `EXP-` references remain in first column. Kept modern icon-first menu hierarchy and source handlers/permission guards. The first CI failed solely on stale generated icon inventory; it was synchronized. | TypeScript and ESLint passed on first C3 run; generated UI contract was repaired before final green validation. | Unscored |
| **C4 — closing verification** | Implementation/test head `64cf17d7678ae523fcc2f2ff4bfb96779d681e90`; [fast CI 42058918822](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/42058918822), [screenshots + Playwright 42058918669](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/42058918669) | Visually inspected actual *before/after* 320 light, 320 dark expanded, 320 open menu, 768 light, 1440 light. No P0/P1 observed in examined states. | **Both GitHub workflows SUCCESS**. 12/12 focused Playwright profiles, UI contract, TypeScript, ESLint, unit suite, production build all green. Pinned Impeccable detector scope `src/pages/Expenses.tsx`: exit 0, JSON `[]`. | Unscored |

### Actual screenshot evidence

[Screenshot workflow #42058918669](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/42058918669) uploaded artifact `ui-refine-chatgpt-shots-pr-263-42058918669`, containing **30 BEFORE and 30 AFTER PNGs**, default, advanced filters and actual opened Expense row menu, for 320/390/768/1024/1440px light/dark. A separate Playwright interaction matrix covered **820px** as well.

| View | Main before | Candidate after | Change |
|---|---:|---:|---|
| 320px light screenshot height | 1384px | 1174px | **210px shorter**; one-row tabs, collapsed filters and visible first-row Action |
| 768px light screenshot height | 1220px | 1029px | **191px shorter**; compact responsive toolbar and Action |
| 1440px light screenshot height | 900px | 900px | Main content preserved; advanced filters arranged in a compact desktop row |

Measurements are from the artifact's actual PNG dimensions; changing screenshot height is a density observation, not proof of end-to-end workflow correctness.

### Stable issues and C4 grades

| ID | Severity | Final verdict | Grounding |
|---|---|---|---|
| EXR-01: mobile tabs wrap / Reports offscreen | P1 | **Fixed** | 320px screenshot and keyboard/tab geometry assertions |
| EXR-02: redundant always-visible secondary filters | P2 | **Fixed** | 320/390/768 default vs opened-state screenshots, values persist when collapsed |
| EXR-03: mobile/tablet search filter density | P2 | **Fixed** | 320/768 screenshot comparison and 12-case source/geometry checks |
| EXR-04: Reset/Status alignment and Reset semantics | P1 | **Fixed** | 12-case Reset bounds + filter state restored after Salary selection |
| EXR-05: clipped initial-viewport Action button | P1 | **Fixed** | 12-case header/trigger bounds at scrollLeft=0, sticky during horizontal scroll, open/Escape focus-return |
| EXR-06: older category/payee actions vs current menu standard | P1 | **Fixed** | Current icon-first `FloatingPanel` preserved, old handlers and disabled Payee deactivation retained |
| EXR-07: tablet table secondary Reference header | P2 | **Remaining cosmetic issue** | At 768px the secondary `Reference` heading partly meets the pinned Action boundary; full primary `EXP-` references remain visible. Original columns remain horizontally scrollable |

### Preserved and unverified boundaries

- Expense preview data, report date selection, Edit/Correct/Cancel, Category/Payee editor and activation, receipts, print/export, role/deactivation constraints, Bangla helpers and Settings links are preserved in source. Existing CI gates and focused browser work cover accessible navigation, filter state, menus, and the Add Expense dialog.
- **Not a live-backend accounting test:** Financial posting remains explicitly preview-only. Other untested states (dense real production data, all screen readers, older physical Android browsers) are not certified.
- **No independent /40 score**: `impeccable-detector.json=[]` is a static-source finding result, not a multi-agent design grade.
- **Stop reason:** Three bounded implementation passes followed by C4. No observed P0/P1 remained in the examined responsive screenshots and tests. Minor tablet secondary-heading clipping is documented rather than hidden. The PR stays draft for owner approval; no merge/deployment.
