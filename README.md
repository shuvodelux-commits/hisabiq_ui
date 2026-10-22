# HisabIQ — ERP UI Preview

HisabIQ is a bilingual (English / বাংলা) POS, inventory, finance and accounting interface for Bangladesh small businesses. This repository is a **frontend/UI preview**, not a live tenant accounting backend. Sample orders, payments, inventory and ledgers do **not** certify real posting or persistence.

## Run locally

```bash
npm ci                   # Install pinned dependencies
npm run dev              # Start Vite development server
npm test                 # Unit/regression tests
npx tsc --noEmit         # Strict TypeScript checks
npm run lint             # ESLint (existing warnings may remain)
npm run check:ui-contract # Shared POS/cart/picker contract guard
npm run build            # Production frontend bundle
```

Focused browser workflows are available via `npm run test:remaining-audit`, `npm run test:sales-audit`, `npm run test:purchases` and related `test:*` scripts. These use Playwright/Chromium. Set `PLAYWRIGHT_EXECUTABLE_PATH` only if your local Chromium path requires it.

## Architecture

- `/#/login` — approved login UI preview; `/#/login/pin` and `/#/login/accounts` show conditional returning-user states with sample identities. The Brand Guide links to this preview. Existing `/app/*` entry remains available.
- `/app/*` — tenant ERP screens: Dashboard, POS, Counter, Sales, Purchases, Products, Parties, Finance and related workflows.
- `/saas/*` — separate SaaS platform administration (roles, tenant subscriptions, support and billing).
- `src/components/pos`, `src/components/purchases`, `src/components/transactions` — shared product transaction UI family.
- `src/data/*PreviewStore.ts` — demo/session preview records, not production data storage.

### Login design review

The login preview reuses `LogoLockup`, `Button`, `Input`, `AppSelect`, `Dialog`, existing theme tokens and Geist/Hind Siliguri. It supports English, বাংলা and bilingual copy independently of tenant settings. Only the public language preference is saved; passwords and PINs remain in component memory and are cleared after a preview submission or when leaving the screen.

Submissions validate the fields and report that no authentication request was sent. Google, account creation and password recovery open explanatory dialogs; no OAuth, OTP, session, enrollment or tenant authorization is simulated. The account chooser contains explicit sample accounts, not discovered users. The six-slot PIN presentation uses one masked input without arithmetic steppers. Real PIN/device-proof feasibility and ByabsIQ integration remain separate work.

Run `npm run test:auth-login` for focused Chromium coverage. To capture review screenshots, set `AUTH_SCREENSHOT_DIR` to a local output directory. No dependency or hosting changes are required.

See [login implementation scope and verification](docs/ui/auth-login-preview.md) for the preview boundaries and known unrelated test limitation.

## Rules before making changes

Read [AGENTS.md](AGENTS.md), the [transaction cart design contract](docs/ui/transaction-cart-design-contract.md), and the [context-complete workflow contract](docs/superpowers/specs/2026-10-09-erp-kiss-contextual-workflows-design.md). Preserve the original [Magic Patterns UI](https://www.magicpatterns.com/c/t6q3mxi6nhuak3qjvx8cwn), current shared inputs, Bangla text, keyboard/touch controls, and POS-style carts. Never present a sample payment or stock change as a real backend posting.

Cloudflare scripts, if configured in your environment, are `npm run cf:preview` and `npm run cf:deploy`; review the deployment configuration before deploying.

