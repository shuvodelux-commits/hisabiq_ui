# GPT Astra Review Prompt — HisabIQ Authentication V1

Copy the prompt below into GPT Astra while its GitHub connection can access **`shuvodelux-commits/hisabiq_ui`**.

---

You are an independent **principal security architect, senior TypeScript/Cloudflare engineer, and UX simplification reviewer**. Conduct a rigorous, skeptical, codebase-grounded review of the **HisabIQ Authentication V1** architecture and proposed implementation plan. Your work is **review and documentation only**; do **not implement code, install packages, edit existing feature files, create PRs, merge, or deploy**.

**GitHub repository:** `shuvodelux-commits/hisabiq_ui` (account `shuvodelux@gmail.com`).  
**Review branch:** `docs/superpowers-hisabiq-auth-v1-design-20261022`.  
**Source of truth:** Inspect that branch and compare any referenced component to `main`.

**READ THESE FOUR DOCUMENTS FIRST**
1. `docs/superpowers/specs/2026-10-22-hisabiq-authentication-v1-design.md`
2. `docs/superpowers/research/2026-10-22-authentication-v1-current-research.md`
3. `docs/superpowers/reviews/2026-10-22-authentication-kiss-impeccable-findings.md`
4. `docs/superpowers/plans/2026-10-22-hisabiq-authentication-v1-implementation.md`

**VERIFY SOURCE FILES** `AGENTS.md`, `README.md`, `wrangler.jsonc`, `package.json`, `src/App.tsx`, `src/components/brand/ApplicationsSection.tsx` (especially Login branding), `src/components/layout/TopBar.tsx`, `src/components/layout/AppShell.tsx`, and `src/settings/TenantSettingsPage.tsx`. Do not assume the existing UI-preview is a real backend.

**Nonnegotiable user-approved requirements:** mandatory phone OTP for every account including Google; mobile+password or Google; Gmail-first/email OTP password recovery with secure SMS fallback and assisted recovery; optional **custom six-digit HisabIQ PIN**, 90-day fixed trusted-browser authorization available even after logout or normal session expiry, five failed attempts force full auth; separate account enrollments for multiple users in same browser; 30-min auto UI lock by default but OFF setting per user/browser; last-used authorized business; Save Draft & Switch / Discard & Switch / Stay Here; and fresh full auth for sensitive account/security/ownership modifications. **KISS, bilingual accessibility, and exact existing Magic Patterns Brand Guide login styling are mandatory.**

**Review questions — try to falsify the design:**
1. **BLOCKER: Can the custom six-digit PIN + independent cryptographic device proof actually be implemented securely and conveniently in supported browser profiles?** Distinguish WebAuthn UV/UP and syncing from user-chosen application PIN and nonextractable browser keys. Show realistic threats: copied browser data, stolen cookie, XSS, replay, passkey sync, lost device, logout, 90-day expiry, 5 attempts, multiple remembered users. Recommend secure feasible approach with official 2026 docs, or **No-Go** and a safer user-approved alternative. No PIN-only fallback.
2. **Identity approach:** Compare managed identity vs Workers-compatible audited auth solution on Cloudflare+Neon. Check current version support, deployment model, Gmail/SMS OTP, Google-only accounts, Bangladesh SMS deliverability/pricing and ownership linking. Explain what is actually included and which custom code remains.
3. **Architecture accuracy:** Current repo is static Vite/HashRouter UI preview. Verify Cloudflare Worker+assets routing, same-origin cookie/CSRF, Neon+Hyperdrive pooling and tenant RLS approaches. Ensure you never treat the demo Team actor selector as a real authenticated identity.
4. **Security:** Check token verification (`sub`, issuer/audience/nonce/state), OTP enumeration/replay, revocable server sessions, password hashing on Workers, recovery abuse, forced logout semantics, security reauthentication, audit/incident response, tenant isolation, authorization and network failures.
5. **UX & KISS:** Insist on *existing* Brand Guide Login branding, only contextual extra controls, single reusable OTP, compact Settings, remembered-user chooser only when >1, device fallback, Bangla/English and phone widths. Identify what must be removed, merged or postponed without changing approved behavior.
6. **Plan quality:** Does every task have real files, coherent interfaces, test-first checks, exact prerequisites, feasible Worker/DB testing, scope boundaries and gateable increments? Call out assumptions, out-of-order dependencies and tasks that attempt to ship insecure partial identity.
7. **Owner-approved vs proposed defaults:** Specifically evaluate 2h idle/12h absolute session recommendation and full reauth to turn screen lock OFF. **Do not silently treat these as approved.**

**Research standard:** Verify claims from current primary sources (Google, OWASP, NIST, W3C, Cloudflare, Neon and specific identity-provider docs); quote dates/version constraints when important. Flag all unverifiable claims explicitly.

**Output format:**
- Verdict: **APPROVE / APPROVE WITH CONDITIONS / REWORK** and 1-paragraph executive summary.
- Ranked findings `P0 blocker / P1 high / P2 medium / P3 low`, each with exact `file:section`, problem, factual evidence/link, impact and minimum correction.
- **KISS deletion/merge table:** remove/merge/defer and reason.
- **Threat model:** identity, recovery, PIN+device trust, tenancy, session and support.
- **Decision table:** managed auth vs vetted Workers auth; device-proof technical choices, verified capability, trade-off and recommendation.
- **Revised plan outline:** dependencies, critical path, TDD boundaries, rollback, tests and gating, without writing production code.
- **Open questions for the owner:** only those truly blocking, with one best default each.
- **Precise Markdown patches** for any documentation changes you recommend, separated from product code; **do not write them to GitHub without my explicit permission**.

Finish with **what you would cut to make V1 smaller without making it less safe**. Stop after the review and await approval. Do not execute the implementation plan.

---
