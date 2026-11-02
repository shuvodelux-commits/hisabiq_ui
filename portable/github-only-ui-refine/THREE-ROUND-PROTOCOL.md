# Three-round GitHub-only UI refine protocol

This file is a portable, ChatGPT-led adaptation of the original Impeccable check → fix loop. It is **not** the original Workflow/Agent engine, and does not provide fresh independent AI agents by default.

## Input contract

Read the user's focused visual brief, GitHub source of truth, route, real project tokens/design guide, original page code, UI states, preview fixtures and tests. Record `keep`, `change`, `avoid`, and protected functionality. Never assume login or a dense dataset exists.

## C0 baseline

Open the draft PR and obtain before/after screenshots from the GitHub Actions artifact. Before any UI edits, the captures should match. Confirm exact base/head SHAs, actual route, both themes, all five viewport widths, no error overlays and available tests. Note any unsupported state such as open dialog or filled cart.

## Each of C1, C2, C3 — check, detect, merge, fix, verify

**A. Visual design review:** Inspect real before/after pixels and source; assess specificity, hierarchy, typography, color and composition (0–4 each, /20) only when adequately evidenced.

**B. Independent mechanical detector + audit:** Read the actual pinned Impeccable CLI source-detector artifact if it was run. Review accessibility, performance, responsive, theming and implementation integrity (0–4 each, /20) with actual code/browser/CI evidence. Mechanical detector is **not** an independent model reviewer. If it was not run or evidence is insufficient, leave dimensions unscored; never invent results.

**C. Checker:** Merge and deduplicate at most eight issues by severity: P0 broken, P1 blocking/accessibility, P2 weak polish, P3 minor. Keep stable IDs and require each finding to name a source location, screenshot state/viewport/theme, cause, type and precise acceptance criterion. Compare to C0 as better/same/worse, including new regressions. Use a /40 sum only if all ten dimensions were genuinely assessed; label it a *ChatGPT combined heuristic*, not an official multi-agent score.

**D. Fixer:** Route issue type to Impeccable method:
- `cluttered→distill`, `spacing-hierarchy→layout`, `typography→typeset`, `responsive→adapt`
- `accessibility/edge-cases→harden`, `confusing-copy→clarify`, `performance→optimize`
- `drift→extract`, `too-loud→quieter`, `first-run-empty→onboard`, then **`polish` last**.

Fix P0 first; preserve original UI, components, data flows and approved design. Commit only scoped changes to a draft PR branch. Trigger automatic CI/screenshot jobs through PR updates. Check actual results and screenshot pixels; if broken, correct or revert before counting a completed round.

**E. Evidence ledger:** C0/C1/C2/C3 row with commit SHA, screenshot run/artifact, detector status, issue IDs, score if valid, test results, better/same/worse and remaining defects.

## Stop conditions

Stop after three successful fix rounds (then C4), or earlier if two checks have no actionable P0/P1, two rounds reverted, or essential screenshot/CI/model runtime failed. Record why. Do not invent rounds or green checks.

## C4 closeout

Perform a fresh evidence-led comparison against C0, independently from the previous fix claims insofar as the available ChatGPT session allows. Grade every claimed fix `fixed`, `partial`, `not-fixed`; identify up to three regressions. Test real controls and workflows (keyboard/touch, search, dialogs, theme, translations, data states). Fix or revert confirmed regressions, then rerun the relevant checks.

Update a draft PR with exact evidence, remaining problems, test caveats, changes, risks and approvals required. Do not merge/deploy or claim true parallel independent AI reviewer/fixer execution without that runner.

## Example verified reference

HisabIQ Expenses [pilot PR #243](https://github.com/shuvodelux-commits/hisabiq_ui/pull/243): C0, three screenshot-backed UI improvement rounds, C4 deep browser regression, 1024px pre-existing filter overlap correction, 10-viewport screenshot artifact, official CLI source scan and targeted Bangla tests. This is a tested example for **HisabIQ React/Vite**, not proof that all frameworks and project states have been validated.
