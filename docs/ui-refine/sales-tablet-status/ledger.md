# Sales tablet Part returned badge — verified review ledger

**Reference:** merged Sales #253, approved Daybook #252. **PR:** #257. GitHub-only ChatGPT-led C0–C4; no independent /40 scores.

| Stage | Finding / fix | Evidence |
| --- | --- | --- |
| C0 | In actual prior 768px screenshot, blue `Part returned` badge extended under the sticky `⋮` Action cell, obscuring the word "returned". Root cause: single-line status badge exceeded available tablet column width. | Prior approved Sales screenshot comparison and source `PaymentStatus` |
| C1 | Added focused Playwright regression to existing `scripts/sales-daybook-refine-browser.cjs`: `INV-000238` badge must end at least 2px before sticky Action and have no internal overflow at 768/820px. | Test code on PR #257 |
| C2 | Wrapped only `Part returned` in a max-62px tablet badge; full text wraps to two lines between 768 and 1023px. Retained original status text/enum, English/Bangla helper and title; no generic StatusBadge or other statuses changed. | `src/pages/Sales.tsx` |
| C3 | Run actual before/after 320,390,768,1024,1440px screenshot states, both themes, plus original filter and Sales action menu interactions. Inspected 768px final screenshot: the full `Part returned` label is readable, visible before the Action cell, and the Action menu remains reachable. | [Screenshots and Playwright 41990011871](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41990011871) **SUCCESS**, targeted filters **12/12** including new tablet bounds, Action menus **12/12** |
| C4 | GitHub checks on implementation head `8fbfec694e3aca8dd9fb4c3f48ba75203ea09872` returned green for source checks, UI contract, unit tests, Vite build and required browser regressions. No related accounting or navigation changes. | [Fast CI 41990011969](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41990011969) **SUCCESS** |

**Grades:** tablet status no longer clipped — **fixed** (source, screenshot, bounding-box assertions); mobile/desktop original status presentation — **preserved**; accessibility (complete text/title, not abbreviated) — **fixed**; finance posting and Action handlers — **untouched**. A taller blue chip on the one affected tablet row is intentional and still fits the existing row rhythm.

**Stop:** Verified actual screenshot and tests, no outstanding supported P0/P1/P2 for this targeted issue. Draft PR left for owner merge approval, no deployment.
