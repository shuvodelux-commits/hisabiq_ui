# Audit Ledger — approved Daybook compact funnel filters

**Route:** `#/app/audit-ledger`. **Approved reference:** merged Daybook #252's `DaybookFilters.tsx`, source not screenshot approximation. Applies the repo's `docs/ui/RESPONSIVE-FILTER-ACTION-PATTERN.md`.

## C0 observed
`src/components/audit/AuditFilters.tsx` currently displays Search/Date and a redundant date-mode helper in its first row; always-visible Source/Status, a text **More filters** button and a text **Reset** in a second row; Party/Account/Posted by/Changed by/Changed in a third conditional row. Header `AuditLedger.tsx` already contains actual Transaction Date/Created Date switch; the extra date-mode helper is redundant.

## Owner acceptance
- Lucide **funnel Filter**, 36px outlined icon toggle. No generic slider/settings icon; keep the real header Settings separate.
- Phone Search → Filter one line, Date next; tablet Search → Date → Filter one line; desktop Search → Date first row and all existing seven advanced dropdowns visible, no toggle.
- All seven secondary filters (Source/Status/Party/Account/Posted by/Changed by/Changed) collapse **by default below 1024px**, values preserved.
- 36px `RotateCcw` icon Reset **next to Status**, clearing all original fields, query, date range to **This month**, never modifying header date-mode setting.
- Filter icon right edge aligned with sticky Action column where applicable; full source reference readable and existing commands unchanged.
- Bilingual labels/active-filter dot, aria-expanded/controls, keyboard Tab order, light/dark/dense/long content. No accounting, audit-event, delete/correction, printing or permissions changes.
- TDD + 320/390/768/820/1024/1440, light/dark, default/expanded Filter/open Action screenshots, no false agent scores.
