# MOD-000-A approved execution handoff

Owner approval and work status: https://github.com/shuvodelux-commits/nestshererp/issues/17

Specification: [MOD-000-A](modules/MOD-000-FOUNDATION_EXECUTION_SPEC.md)
Global rules: [scope and constraints](MOD-000-GLOBAL-RULES.md)

Coordinator preparation session: hisabiq-ui/mod-000-a/20261111/root.
Build worker: UNRESERVED / NOT DISPATCHED.
Selected environment: GitHub source changes plus GitHub Actions using disposable PostgreSQL16.
Board configuration: nestshererp .claude/super-board/configs/hisabiq-nest-adoption.json, Project2, max_workers1, human merges.

Current blocker: executor gh auth status reports no GitHub host login; live ProjectV2 read cannot authenticate. Repository connector operations work but do not prove board access or running capacity. Existing issue3 loop:in-build claim is preserved. No product implementation, test suite or database operation has started.

Resume: use the selected runner's secure GitHub login/settings with Project2 capability; re-read issue17, all comments, board and candidate PR; coordinator confirms actual capacity and records unique worker reservation, branch/worktree and exact F0-01 allowed paths. Run installed scoped Super Build for issue17 only; keep max_workers1 and existing claims. Advance F0-01 then F0-02 through backend draft PRs before frontend consumers. Pin the approved compatible backend candidate in the frontend CI workflow; no moving-branch tests.

F0-01 allowed production paths (backend): packages/core-contracts/src/auth.ts; packages/core-application/src/auth/get-my-access-service.ts; apps/api/src/registration/registration.module.ts. Test: apps/api/test/me-bootstrap.spec.ts. Existing DTO consumers/fixtures that need adjustment must be enumerated before that dispatch, not covered by an all-src glob. No money/cash/settings-service mutation or migration.

F0-02 production path: packages/core-domain/src/auth/credentials.ts. Tests: packages/core-domain/test/auth.spec.ts; apps/api/test/login.spec.ts. Preserve old four-digit credentials, add six-digit compatibility; no hashed-data migration.

Follow spec task allowlists for F0-03–07; do not change provider/contract/index/App.tsx/CI from competing sessions. Record actual command exits, paired SHAs, runner/disposable instance identity, screenshot/manual assertions and independent QA. Draft PR only; no merge/deploy.

This documentation PR publishes approval and reviewable execution instructions; it is not the module implementation or a successful Super Build run.
