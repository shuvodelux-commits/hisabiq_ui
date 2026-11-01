# Audit Ledger UI refinement — three-pass review

**Brief:** Polish `#/app/audit-ledger` for compactness, clarity and touch usability. Preserve the existing design and functionality.

**Source:** `shuvodelux-commits/hisabiq_ui`, base `b3339464`. The branch contains only targeted UI edits and regression checks. No backend or accounting changes.

## Method and limitations

The bundled `/ui-refine-loop` Workflow/sub-agent runner is not exposed in this chat. The official setup detected no installed Impeccable or Humanizer. I followed three **manual, rubric-based** check/fix passes with browser evidence; these are **not independent Impeccable reviews**. The indicative scores below are human-judgment estimates using the built-in design/20 + audit/20 rubric, not automated or externally calibrated results. No auth or additional data fixture was invented.

Upstream setup warning:

> Impeccable NOT FOUND: the loop will use the built-in rubric (references/rubric.md). Scores are not Impeccable scores. Install the impeccable skill under .claude/skills or .agents/skills, or set refine.impeccable.

## Evidence and issues

| Check | Indicative rubric quality | Action | Verification |
| --- | --- | --- | --- |
| Round 0 (baseline) | 27/40 | Documented 7 always-visible filters, 28px row actions and phone content below the fold | 390px/1440px screenshots, both themes |
| Round 1 | 30/40 | Keep Source/Status visible, place five less-frequent filters behind More filters; accessible search label and badge count | All seven controls still visible when expanded; 320/390/1440px no document overflow |
| Round 2 | 32/40 | Use the existing Button at 36px and stick the Action column to the visible edge of horizontally scrolled ledger | 320/390/768/1440px: row button 36×36px, menu Open/Correct/Delete unchanged |
| Round 3 + closing review | 33/40 | Tighten summary spacing, simplify preview copy, show filtered-record count and mobile swipe cue | Dedicated Playwright script; TypeScript, lint, UI contract, 846 unit tests and Vite build passed |

## Fixed and still open

- **Fixed:** excessive initial filter height; all five secondary filters remain available and selected values are preserved when closed.
- **Fixed:** row actions previously required sideways scrolling and used 28px controls. They now use the 36px shared button.
- **Fixed:** no visible result count or scroll hint. Results follow search and the table remains a keyboard-scrollable region.
- **Fixed:** large mobile summary padding and repetitive mixed-language description.
- **Unchanged:** source records, date preferences, CSV export, print, details, correction, delete validation, audit history, monetary amounts, backend, and the preview-only distinction.
- **Open trade-off:** compact tables still require horizontal scroll for detailed columns; the pinned Action column occupies some space near the right edge. Validate with actual shop users before further changes.
- **Open verification:** No automatic independent critic/fixer agents were run. This review does not certify real ledger posting.

## Browser states covered

- Before and after: 1440px desktop light/dark and 390px phone light/dark; additional 320px and 768px capture.
- Interaction regression: 320px English light, 390px English dark, 390px Bangla light, 768px bilingual dark, 1440px English light.
- Focus and interaction: More/Fewer filters; seven filter controls; record search/count; horizontal scroll; 36px menu; Open/Correct/Delete availability; Escape dismissal; runtime page errors.
- Reused primitives: `AppSelect`, `AppDateRangePicker`, `Input`, `Button`, `FloatingPanel`, `Table`, `StatusBadge`, `PageHeader`, audit dialogs. No new UI component family.

## Screenshot names

`round-0-main-{mobile,desktop}-{light,dark}.png` and `round-3-main-{mobile,desktop}-{light,dark}.png`. They contain demo/sample ERP data, not a live shop's ledger. Images are committed to the draft PR branch for owner review.

**Disposition:** Draft PR ready for owner visual review; do not merge or deploy automatically.
