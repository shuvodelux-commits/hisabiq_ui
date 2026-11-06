# HisabIQ Counter · scoped UI refinement

- **Route:** `#/app/counter` (React Router, `src/pages/Finance.tsx` with `counterOnly`).
- **Source scope:** `src/components/finance/CounterWorkspace.tsx`. Add a Counter-specific Playwright test only when necessary; leave all business/data files unchanged.
- **Direction:** Same approved HisabIQ compact design, clearer first-time counter workflow and less wasted space at 320/390px; no redesign.
- **Users:** Bangladeshi counter operators on small Android phones, tablets and keyboards.
- **Three bounded passes:** C1 action selection density and readable labels; C2 payment rows, selected-party/bill context, touch targets; C3 transaction summary hierarchy, responsive polish and accessibility checks.
- **Keep:** six existing counter entry points; customer/supplier selection and Quick Add; invoice allocation including oldest first; discounts/settlements, multiple payment sources and account identity, Bank Entry shared tab; expense and bank transfer workflows; amount-in-words, review/confirm dialog, error/success announcements, light/dark and Bangla/English; all callbacks, validations and preview-only semantics.
- **Guardrails:** No calculation/accounting/stock/auth/backend/storage changes. Keep existing source-linked preview rules and active-account validation. Use existing Button/Input/AppSelect components and existing colors. Ordinary controls 36px, button/field radius 0.375rem, touch >=36px.
- **Evidence required:** Main vs branch at 320/390/768/1024/1440, light/dark. Opened party search, amount entry, 2 payment rows and review dialog where authentic. TypeScript, ESLint, UI-contract, unit, build, Counter Playwright; pinned mechanical Impeccable scanner. Record limitations honestly.
- **Runtime limitation:** The ChatGPT GitHub connector lacks the original independent Workflow/sub-agent runner. Run GitHub-only bounded C0–C4 protocol, not a falsely claimed original independent-agent Impeccable loop.
- **Release gate:** Draft PR only. No merge/deploy until explicit owner approval.
