# MOD-000-A global rules

This file carries the approved integration foundation's global constraints for a repository-only executor. Full product blueprint remains an evidence draft, not blanket build approval.

- Approved scope: MOD-000-A tasks F0-01 through F0-07. Owner said Approved in the originating conversation after the module overview and GitHub + Actions/disposable PostgreSQL environment proposal on2026-11-11. [Execution record](https://github.com/shuvodelux-commits/nestshererp/issues/17).
- Frontend baseline main176bb1a3e8f42eef192ea3098074ac5c8a214261; backend adoption1643dac059e568407bba2fff38a990268dfe28fe. Verify exact source before editing. Do not adopt unmerged cash PRs16/282 silently.
- Preserve HisabIQ React components, routes, dialogs, compact layout, Bangla/English, six-digit PIN slots, keyboard/touch/mobile behavior and preview functionality. No Vue migration or redesign.
- Existing frontend npm lockfile/Node24; backend pnpm9.15.9/Node20; PostgreSQL16. No dependency, runtime or lockfile upgrades.
- Session authority comes from backend identity and permissions. No preview identity/RBAC/token-presence grants live access. Separate preview from real backend responses; no fixture fallback on an API failure.
- Follow the module's exact transport, session, PIN compatibility, /me metadata, numeric/ULID/intent and route-isolation decisions. Signup/Google/recovery/durable trust and real business modules remain later increments.
- No financial source code, account schema, money/stock mutation, cash-session implementation or Reports/Analytics integration in this increment. Historical opening balances remain session-independent; actual tracked cash follows the tenant ON/OFF policy in later owning work.
- Tests named by the approved module are authorized in the selected disposable runner. Never initialize/truncate retained development or production data; both URL targets must be checked before helper execution. Use unprivileged application role for isolation tests. No credentials/tokens in source/logs/issues.
- One scoped Super Build worker. Verify actual Project2 capacity and coordinator-confirmed unique session reservation; an issue/assignee/comment is not an atomic worker lock. No queue draining, stale-worker recovery or capacity increase.
- Coordinator serializes shared App.tsx/backend DTO/provider/export/CI files. Exact task allowlist applies; stop for a concrete contract conflict rather than inventing API behavior.
- Each candidate has draft PR(s), exact paired heads, actual verification evidence and independent scoped QA. Human approval required for merge; no deployment authorized.
- Latest explicit owner decisions and this approved scope override older blanket no-test/no-extra-doc instructions. No second START is required for the same approved scope/environment. Approval is not proof a worker has been reserved or run.
