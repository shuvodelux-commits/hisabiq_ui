# Settings library and detail verification — 28 October 2026

Implemented on the Settings draft branch; no merge performed. Requirements and scope: [approved implementation](report-library-implementation.md).

## Passed

- 765/765 unit tests, including strict SQL grammar, wrong-business/invalid settings, fresh ciphertext, wrong secret, tampering, unsupported envelope and input limits; joined-date validation/backward compatibility; all three invoice templates and language styles.
- TypeScript, production build, guide/inventory synchronization, UI contract and changed-source lint (existing warnings remain; build retains large chunk notices).
- New Settings library browser check: shared 215px Report Library shell, sidebar filtering and empty result, saved draft across sub-settings, employee role/status/joined-date search/filtering, unknown legacy dates, protected/resettable columns, URL view persistence, staged Save, actual encrypted download, wrong-key rejection, restore review and successful owner restore. Actual Reports library search/record filtering/columns checked after extracting shared shells.
- Party bands at 767/768, 799/800, 1023/1024 and wider desktop; direct/deferred main-tab keyboard focus, draft/save/search and 12 responsive screens.
- Existing Settings suite: 49 light/dark states plus combined roles, owner protection, persistence, restore/import, stale tabs and storage-full recovery. Existing redesign suite includes real Party consumers, print, permission denial, draft recovery, output profiles and browser Back.
- Nine locale/viewport profiles across team/data/invoices: English, Bangla and bilingual at 390/768/1440, with native-modal joined-date entry, real employee search, password-masked key and no global overflow; 27 screenshots.
- Six visual guide profiles with accessibility checks, 564 control observations over 22 routes, and 75 typography views/3,218 observations.
- Fresh reviewer independently passed 19 focused tests; verified calendar Escape/focus, dirty drafts while changing columns and overflow at 320/390/768/1024. No Critical/Important findings.

## Review follow-ups

- Minor: a focused subsection tab can lose focus when resizing across 1024px because its desktop library wrapper changes DOM ancestry. Drafts and selection remain intact.
- Minor: underlying SQL/key/format errors still display English in Bangla mode; surrounding recovery labels and guidance are translated.

## Existing optional scripts with stale expectations

- `scripts/report-workspace-browser.cjs` stops at the old `Business overview` heading; current overview uses `Sales and gross profit`, and the library intentionally has no duplicate report title. The current production Reports matrix and new actual library behavior checks are used instead.
- `scripts/bangla-shared-date-picker-browser.cjs` expects the phone Party date range to be visible before opening Filters. Current Party mobile layout puts it inside Filters. Shared native-modal date behavior is independently checked in Settings in all three languages and widths.

## Scope decisions

The encrypted SQL snapshot covers actual Settings data, designs, employees, roles and activity. Uploaded SQL is parsed as one declared snapshot format and never executed. Restore preserves the current audit trail and appends a restore event; snapshot activity is reference only. No full server SQL database, sales/stock/payment restore, server key custody, production authentication or scheduled cloud backup is claimed. Names/custom notes remain stored source values rather than invented translations.
