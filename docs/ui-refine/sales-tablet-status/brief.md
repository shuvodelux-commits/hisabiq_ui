# Sales tablet status badge — prevent sticky Action overlap

**Route:** `#/app/sales`. **Owner-approved reference:** merged Daybook PR #252 and merged Sales PR #253. **Finding:** Screenshot at 768px shows the blue "Part returned" badge partially behind the pinned right-side `⋮` Action column.

## Scope
Only `src/pages/Sales.tsx`, focused regression script and evidence. This is a **Sales-only** P2 visual defect. Do not modify shared Badge, shared Table, invoice accounting logic, default columns, business actions, print/returns, themes or other module UI.

## Fix contract
- Preserve **full, unambiguous "Part returned" / Bangla status meaning** for narrow tablet viewport. A compact two-line responsive label is permitted within the existing 11px status badge; do not silently abbreviate or remove meaning.
- No part of the badge may be obscured by sticky Action at 768 and 820px with scrollLeft=0; preserve the Action button visible and existing menu.
- At 320/390 phones and 1024/1440 desktop keep the previously approved presentation unless necessary.
- No page horizontal overflow, layout thrashing or unneeded row height expansion.
- Screenshots at 320/390/768/820/1024/1440 light/dark; Playwright check actual overlapping element bounds, label visibility, row actions and both English/Bangla semantics. Preserve every existing filter and Reset behavior.

## Verify
`npx tsc --noEmit`, `npm run lint`, `npm run check:ui-contract`, `CI=1 npm test`, `npm run build`, real screenshots and focused Playwright before/after. Github-only ChatGPT-led Impeccable detector; no native independent agent scores. Draft PR, no merge/deploy.
