# HisabIQ Authentication V1 — KISS + Impeccable Evaluation Findings

**Date:** 2026-10-22  
**Review posture:** Design/code-context inspection only; not a live browser audit and not an authentication penetration test.  
**Use:** Feed the Astra implementation-plan review.  
**Source:** [Brand login draft](../../../src/components/brand/ApplicationsSection.tsx) · [AGENTS.md](../../../AGENTS.md) · [current research](../research/2026-10-22-authentication-v1-current-research.md).

## Highest-priority observations

| Priority | Existing evidence / design risk | Do less without sacrificing functionality |
| --- | --- | --- |
| P0 | `src/App.tsx` directly renders `/app/*` with no production authentication guard; `wrangler.jsonc` has static assets only | One real server-side auth/session boundary and tenant authorization, **not** fake frontend-only protection |
| P0 | Requested six-digit PIN after logout/restart could be implemented insecurely with a cookie/PIN alone | Treat secure device proof as a hard go/no-go gate, no insecure fallback |
| P1 | The current Brand Guide already includes a complete two-column **Login branding** draft | **Reuse exact composition** and shared components, add only Google, recovery and conditionally visible PIN |
| P1 | Numerous optional auth/security surfaces risk a long shopkeeper onboarding wizard | Ask only mobile OTP + password (unless Google) + business name/type; postpone other setup |
| P1 | Login account chooser has no value when one remembered user exists | Only show chooser for two or more remembered accounts |
| P1 | OTP registration/recovery duplicated components invites inconsistent behavior | One reusable OTP entry component and server challenge verifier |
| P1 | Current `TopBar` user identity is a demo actor from tenant settings, not verified user | Wire actual server principal, keep one header and existing UX |
| P1 | Tenant switching while composing POS/purchase could destroy a draft | Reuse existing AlertDialog and draft contracts; Save/Discard/Stay; block switch on save failure |
| P1 | A free-standing security dashboard would duplicate existing Settings | Add compact Account Security inside `src/settings/TenantSettingsPage.tsx`/existing hub |
| P2 | Existing login draft includes hard-coded sample phone/password and `Trusted by 2,400+ shops` | Keep visual rhythm, **remove sample credentials and unverified social proof** in production |
| P2 | Animation and layout could make phone login hard to use on narrow screens | Collapse decorative Ink panel into small branding header on mobile; one vertical form, minimal motion |
| P2 | Many login variants could add phone/password/Google/PIN simultaneously | Show user's **contextual** fastest login route; other methods remain clearly accessible |
| P2 | Brand styles spread across `src/index.css`, `src/data/brand.ts` and generated design-system bundle | Reuse existing tokens; don't add new CSS-only auth theme or replace typography |

## Impeccable Operate/Distill conclusions

**Primary task:** Let a shopkeeper open their authorized business and make a sale with the fewest safe steps.  
**Visual authority:** [`ApplicationsSection.tsx` lines 127–169](../../../src/components/brand/ApplicationsSection.tsx), which already has Ledger Ink branding, logo, Bangla headline, white form, focused teal Sign in CTA.  
**Hierarchy:** One dominant primary action, secondary Google option, small Create account/Forgot password links; PIN view takes over only for remembered valid device.  
**Consistency:** Shared `Button`, `Input`, `Switch`, `Dialog` and typography, rather than new components.  
**Accessibility:** Explicit inputs, keyboard, readable Bengali, focus/error/loading, paste/autofill, touch sizes without blowing up dense ERP rows.  
**Performance:** No extra splash screens, auto-animated page reveals, redundant Google/login endpoints or modal cascades.  
**Truthfulness:** UI-only previews must not imply real auth security before Worker/Neon integration is completed.

## What to preserve

- Required verified mobile, Google and mobile/password signup/login, verified email/SMS fallback recovery, assisted recovery.
- Optional 6-digit PIN with 90-day fixed enrollment, after-logout use, multi-user remembered browser support, 5-try lockout, server revocation and independent cryptographic browser/device proof.
- User-configurable default 30-min UI lock per user/browser, independent from backend timeouts.
- Last-used authorized business, safe draft switching, sensitive-action full reauthentication.
- Security telemetry, tenancy and independent support approval behind the simple UI.

## What **not** to build by default

Separate security dashboard, login animations, social-login gallery, per-feature PIN customization, OTP per daily login, passkey settings dashboard, forced business picker for one business, mandatory detailed business setup, recovery codes, staff management rewrite, POS component forks, or an advanced security-risk dashboard.

## Review limitations and next steps

1. No current login screen exists as a functional product route; the verified login screen is a **Brand Guide preview component**.
2. Current `hisabiq_ui` frontend alone cannot enforce real tenant sessions, password reset, or account recovery.
3. A connected remote Magic Patterns editor is unnecessary for checking the code-committed baseline and may have different access permissions; use committed reference in the repo.
4. Detailed security and implementation feasibility findings live in the [research doc](../research/2026-10-22-authentication-v1-current-research.md) and must be validated independently by Astra.
5. **No implementation or PR merge authorized.**
