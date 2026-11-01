# Expenses GitHub-only UI refine · evidence ledger

**Route:** `#/app/expenses` · **Pilot draft PR:** #243 · **Dependency:** GitHub-only setup PR #242 remains unmerged.

This is a **ChatGPT-led** review of original HisabIQ screenshots/source backed by GitHub Playwright and the independently executed official Impeccable *source detector*. The original parallel AI reviewer/checker/fixer Workflow runtime was **not** executed. No independent-agent /40 rating is claimed. Only real evidence is recorded.

| Stage | Source commit | Screenshot + detector run | Source scan | Before→After | Verified change | CI |
|---|---|---|---|---|---|---|
| **C0 baseline** | `99b7837` | [41345824237](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41345824237) | `src/pages/Expenses.tsx`: exit 0, `[]` | Baseline: 320 light height 1339px; 390 dark 1286px; 1440 light 921px | Actual screenshots and existing React/Design Guide inspected | Screenshot job passed |
| **C1** | `98a2d35` | [41346035591](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41346035591) | exit 0, `[]` | 320 light 1295px (**44px less**); 390 dark 1243px; 1440 unchanged | Kept four tabs in one scrollable underline row; left a narrow-phone Reports discoverability issue | [PR CI passed](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41346035588) |
| **C2** | `be2caa5` | [41346284325](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41346284325) | exit 0, `[]` | 320 light 1251px (**another 44px less**); 390 dark 1199px; 1440 unchanged | Aligned Reset and Export on one mobile/tablet row; preserved both handlers | [PR CI passed](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41346284303) |
| **C3** | `4b75c29` | [41346529254](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41346529254) | exit 0, `[]` | 320 remains 1251px; all four tabs **visually fit**; 390 dark remains 1199px; 1440 unchanged | Tightened mobile tab spacing, added roving focus + ArrowLeft/Right/Home/End key navigation | [PR CI passed](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41346529276) |
| **C4 final** | Test/infrastructure changes after `4b75c29` | Latest screenshots and **targeted keyboard/Expenses/Bangla test run pending confirmation** | Latest scan pending | Visually inspected C0 and C3 phone+desktop and previous rounds | Finish reviewer below | Not yet proven for new targeted tests |

## Tracked problems and verdict

| ID | Priority | Original evidence | Impeccable route | Final verdict | Final evidence |
|---|---|---|---|---|---|
| `expenses-tabs-mobile-wrap` | P2 · responsive | C0 320/390: tabs occupy two rows and push the table down | `adapt` → `polish` | **fixed** | C1/C3 PNGs: one row, no second line |
| `expenses-filter-actions-stacked` | P2 · spacing-hierarchy | C0 phone/tablet: Reset and Export use separate vertical rows | `layout` → `polish` | **fixed** | C2/C3 PNGs: single shared row; handler code unchanged |
| `expenses-reports-tab-phone-hidden` | P1 · responsive | C1 320px: horizontal tab strip leaves Reports offscreen | `adapt` → `polish` | **fixed** | C3 320px: Reports tab visible in the first row |
| `expenses-tab-keyboard` | P1 · accessibility | Original role=tab buttons had no ArrowLeft/Right/Home/End handling | `harden` → `polish` | **partial until browser test passes** | C3 source has handlers and roving tabIndex; automated key test added but not yet confirmed |

## Closing visual review

- **Visual state:** Improved on 320px, 390px and 768px screens, with no pixel changes at 1440px (C0 vs C3).
- **Measured vertical reduction:** 320px light `1339→1251px` (**88px**); 390px dark `1286→1199px` (**87px**).
- **Scope:** Original Expenses React page only for UI edits. Test scripts and GitHub-only screenshot workflow were extended to prove interactions. No backend, accounting, party preview store or expense posting edits.
- **Actual source detector:** Pinned Impeccable engine ran in GitHub Actions; exit status `0` / result `[]` for each C0–C3 PR snapshot. This does not certify rendered-page accessibility.
- **Unchanged behaviour:** Expense search, filters, add/edit/cancel, export, print, payees and Bangla preview behaviour are protected by source scope. **Only claim executed functional checks after the targeted workflow passes.**
- **Known remaining limitation:** Table columns beyond the narrow viewport still require horizontal scrolling (existing shared table behavior). Full dialogs, dense/empty/error UI states are not proven by default-route screenshots.
- **Regressions observed:** None in inspected main-page screenshots. Full interaction regressions remain subject to the targeted browser tests.
- **Stop reason:** Three requested source refinement rounds attempted; visual C4 completed. The original independent parallel-agent implementation is not available in this ChatGPT connector environment.

## Final gate

Do not mark this pilot fully successful or merge #243 until the **Expenses pilot interaction matrix, expense workflows, Bangla Expenses** and ordinary PR Fast CI pass on the final candidate revision. Owner approval is additionally required for every merge.
