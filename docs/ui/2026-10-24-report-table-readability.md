# Report table readability

The user requested slightly less compact report tables and cleaner typography. This is a narrow refinement of the existing Reports UI, using its shared Table, StatusBadge, fonts and semantic tokens.

## Changes
- Main table data: 14px text with 24px line height; cell padding increases from 4px/8px to 8px/12px vertically/horizontally.
- Headings use a light existing surface tint, medium weight and clearer separation from Bangla helper text. Totals retain stronger weight and extra vertical space.
- Text badges use 12px type in a 24px content badge; normal ERP controls retain their existing 36px sizing.
- Dates, references and amounts stay on one line. Narrow layouts retain the existing named, keyboard-scrollable table region.
- Report and contributing-record tables explicitly use proportional digits rather than inheriting the body's tabular-number feature. Geist/Hind Siliguri and all existing semantic colors remain.
- Contributing-record tables use the same data size and spacing. No report calculations, output formatting or filters change.

## Verification
Compared before/after sales-register tables on bilingual light desktop/tablet, English dark desktop and Bangla dark phone. The first row grows from 30px to 43px, with no document overflow. Sorting and record details work; four sales-register axe scans returned zero findings. One corrective pass retained single-line dates/references rather than stretching rows through wrapping.

The existing guidance test passes four device/language/theme profiles, and the report-workspace browser smoke passes filters, details, columns, saved views, CSV and purchase planning. TypeScript, production build and focused ESLint pass with zero errors; one existing fast-refresh warning remains. Detector: no findings. Report-model tests and UI-contract results are recorded in the PR. Full repository unit tests are outside this presentation-only follow-up; PR #200 documented two pre-existing quotation failures.
