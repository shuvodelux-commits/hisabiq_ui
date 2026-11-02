# HisabIQ ERP action-menu refinement ledger

Scope: `/#/app` existing action dropdowns. Base: `90c7b473`. Work branch: `refine/erp-action-menus`. Visual reference: user's attached icon-first action menu.

### Pass 1 — shared + core menus
New opt-in `ActionMenuList`, `ActionMenuItem` and `ActionMenuDivider`; existing `FloatingPanel` behavior untouched. Products, Expenses and Audit Ledger use leading Lucide icons, semantic sections and separate destructive actions. Existing callbacks, permissions and language labels remain.

### Pass 2 — transactions and ledger
Purchases, Party Ledger row actions, Daybook and Warranty actions migrated. No invoice, stock, return or accounting logic changed. Existing permission and disabled reasons retained.

### Pass 3 — other row/action menus
Sales invoice, return, customer-credit, draft and template menus; Party/Vendor detail More menus (including responsive dropdown); Accounts and Chart of Accounts menus updated. The larger mobile Party action sheet is deliberately untouched.

### Evidence and checks
- Pinned Impeccable `e89e3ada`, detected `critic: impeccable`, no setup warnings, engine 0.1.18; context run, detector `[]`.
- TypeScript, ESLint (0 errors, 248 existing warnings), UI contract, 846/846 unit tests and production build passed. Design-system component inventory regenerated as expected for newly added source and Lucide icons.
- Playwright action-menu browser matrix: real menu click; SVG per action; neutral/danger separation; keyboard ArrowDown/Home; Escape returns trigger focus; desktop and phone, light and dark. Screenshots before/after from real Chromium.
- Real screenshots for Products, Expenses, Audit Ledger, Sales, Purchases and Parties. Standalone Vendor route yields page-only screenshots because no row dropdown is available in that route during this test; shared Party/Vendor More dropdown is migrated.
- Reviewed opened Products and Expenses screenshots manually. Independent final design scoring not available; no scores claimed.

### Limitations
The official saved Workflow runner and fresh independent checkers are unavailable in this tool environment. These are three **implementation/validation passes**, not three independently scored Impeccable critic/fixer rounds. Screen readers, physical old Android devices, live accounting posting and every secondary menu were not independently certified. GitHub-only: draft PR, no merge or deploy.

### Final browser evidence count
The four-mode matrix completed successfully: **24 interactive menu profiles passed** (Products, Expenses, Audit Ledger, Purchases, Sales, Parties × 1440/390 × light/dark). The standalone Vendor route supplied **4 page-only captures** because no row dropdown was exposed; those four are excluded from interactive-pass counts. Before/after evidence includes **56 PNG files** total (28 baseline, 28 refined). Browser checks opened the real menus and tested icon presence, sectioning, red destructive actions where present, arrow/Home focus and Escape restoration. Independent browser-side ratings are not claimed.
