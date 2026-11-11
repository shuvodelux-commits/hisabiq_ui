# GitHub handoff and build instructions

Repositories remain separate: `shuvodelux-commits/hisabiq_ui` for React and canonical integration documents, `shuvodelux-commits/nestshererp` for Nest services. Use the real `AGENTS.md` filename; do not create a competing `agent.md`.

1. Review the documentation PRs and merge only on explicit owner instruction. Uploading a draft branch is not merging main. The backend documentation PR targets `chore/hisabiq-adoption-runtime-a01`, not the older backend main.
2. In the selected build runner, authenticate using `gh auth login --hostname github.com --web`, then `gh auth status`. Use the secure browser/settings flow; never paste tokens into chat or repository files. If OAuth CLI access lacks Projects permission, grant it using `gh auth refresh --hostname github.com --scopes project`; other credential types need equivalent account permission.
3. Read [issue 17](https://github.com/shuvodelux-commits/nestshererp/issues/17), all comments, candidate PRs and the live Project 2 board. Verify actual available capacity and ownership before reserving work. Preserve existing issue 3 claims until reconciled. `gh auth status` alone does not prove Project access or a free worker.
4. Read root AGENTS.md, master, assigned specification and review gates. Record exact frontend/backend SHAs and revalidate changed source contracts. Coordinator reserves only the current approved F0 task with an exact file allowlist; keep `max_workers: 1`.
5. Resume the installed scoped Super Build for issue 17 only. F0-01/02 backend increments precede frontend consumers. Approval includes the named tests on disposable PostgreSQL 16; no production schema migration. Use frontend Node 24/npm and backend Node 20/pnpm 9.15.9, as pinned in the repositories.
6. Push task branches, open paired draft PRs and provide real command exits and UI evidence. Wait for explicit merge/deploy instructions. Do not claim success from a connector write or a planned test list.

Publication checks for this docs change are structural/link/diff checks only. No product code, application test, database change or live worker dispatch is part of this upload.
