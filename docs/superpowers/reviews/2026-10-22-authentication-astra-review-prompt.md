# GPT Astra Review Prompt — HisabIQ Authentication UI / ByabsIQ Alignment

Copy the prompt below into GPT Astra with GitHub access to both repositories through `shuvodelux@gmail.com`.

---

Act as an independent principal software architect, application security reviewer and UX simplification expert. Review the HisabIQ Authentication V1 UI design and its alignment with our existing backend. Apply Superpowers, KISS and Impeccable.

**Important corrected context:** This is the UI design step. Cloudflare hosts only the live `hisabiq_ui` preview. Our backend already exists in `shuvodelux-commits/ByabsIQ` (NestJS/Fastify/PostgreSQL/Drizzle with a connected web app). Do not infer that HisabIQ lacks a backend because the design repository is static. Do not recommend or plan a new Worker API, Hyperdrive setup, database foundation/migrations, provider replacement or backend rewrite.

**Strict boundary:** Review only. Do not implement code, install packages, change GitHub files, create PRs, merge, connect live services or deploy. Recommend documentation corrections in your answer and wait for approval.

## Repositories and documents

- UI/design: `shuvodelux-commits/hisabiq_ui`, branch `docs/superpowers-hisabiq-auth-v1-design-20261022`.
- Existing application/backend: `shuvodelux-commits/ByabsIQ`, `main`. Capability map was inspected at `17dcadfaa86ac868063408cc2be6209ca652e164`; verify current source and report drift.

Read these four UI-branch documents:
1. `docs/superpowers/specs/2026-10-22-hisabiq-authentication-v1-design.md`
2. `docs/superpowers/research/2026-10-22-authentication-v1-current-research.md`
3. `docs/superpowers/reviews/2026-10-22-authentication-kiss-impeccable-findings.md`
4. `docs/superpowers/plans/2026-10-22-hisabiq-authentication-v1-implementation.md` — now an eight-task UI design/alignment proposal, not the superseded backend implementation plan.

Inspect UI `AGENTS.md`, `README.md`, `src/App.tsx`, `src/components/brand/ApplicationsSection.tsx:127-170`, shared Input/Button/Dialog/Switch, settings/navigation, shell and language helpers. Existing Magic Patterns Login branding is the visual authority; no generic replacement design.

Inspect ByabsIQ `AGENTS.md`, `README.md`, auth/business controllers, session service, auth module wiring, `packages/contracts/src/{auth,businesses}.ts`, `packages/db/src/schema/users.ts`, connected `apps/web/src/features/auth`, `apps/web/src/lib/{api-client,foundation-api}.ts`, business switcher, query/workspace handling and relevant tests. Use existing architecture authority; do not transfer routers/frameworks between repos.

## Preserve approved requirements

Mandatory verified mobile even with Google; mobile/password or Google; no forced password for Google-only users; explicit linking ownership proof; verified email/Gmail-first recovery with secure SMS fallback and assisted recovery; optional custom six-digit HisabIQ PIN, fixed 90 days, after ordinary logout/restart/session expiry, five failures requiring full auth, independent remembered users per browser; configurable default 30-minute UI lock; last-used authorized business; Save Draft & Switch / Discard & Switch / Stay Here; full reauthentication for sensitive account/security/ownership changes. Preserve existing shadcn UI, current Magic Patterns composition, compactness and English/Bangla/bilingual accessibility.

## Review priorities

1. Verify actual backend capabilities. Reuse phone/password, signup OTP, server cookies, CSRF, session/logout, membership and business activation. Do not duplicate them.
2. Separate implemented contracts from missing alignment: Google/linking and Google-only password model, recovery/channel verification, PIN/device proof, remote enrollment controls, action-bound reauth, persistent last-used business and business type.
3. Check the approved registration order against current signup: OTP is consumed together with password in signup, signup does not issue a session, and no standalone verification grant is exposed. Preserve UI requirements and flag the contract gap.
4. Critically assess PIN feasibility as a future integration acceptance condition. Non-extractable WebCrypto keys do not automatically resist profile copying; synced passkeys do not prove the original computer; OS/WebAuthn PIN is not automatically the HisabIQ PIN. No custom crypto or fake successful enrollment during UI design.
5. Check concrete UI reuse risks: numeric steppers on code fields; tenant-dependent translation before login; personal security access for non-Owners; lock preference without PIN enrollment; dismissible lock; cross-user/tenant cache/draft state; pending/uncertain payment protections.
6. Preserve the existing API client's cookie/CSRF/error/context semantics during later integration. An expected-business header is a precondition, not authority. Do not assume all ERP endpoints have full coverage because foundation endpoints do.
7. Challenge duplicated layouts, extra screens, dependencies, broad settings/POS rewrites and tasks that are too large. Keep current work to UI design and a clear integration handoff.
8. Backend currently uses fixed 30-day session expiry in inspected source. The earlier 2h idle/12h absolute suggestion and full reauth to disable auto-lock are unapproved policy proposals. No backend policy change is part of this task.

## Output

- Executive verdict: Approve / Approve with conditions / Rework.
- Prioritized P0/P1/P2/P3 findings with exact source paths, evidence and minimum correction. Distinguish UI design issues from future real-authentication blockers.
- Existing-backend reuse/capability/gap table; no invented endpoints.
- KISS remove/merge/defer table preserving approved functionality.
- Review of the eight-task UI dependency order, acceptance cases and existing test reuse.
- Future integration/security acceptance gaps without implementing or planning a new backend.
- Only genuinely necessary owner decisions. Do not re-ask the clarified hosting/backend scope.

Research primary documentation only when a security/platform claim needs verification. A source file or historic test report is not proof of freshly tested runtime behavior.

Finish by explaining what you would remove to make Authentication V1 UI significantly simpler without weakening its security contract. Stop after the review.

---
