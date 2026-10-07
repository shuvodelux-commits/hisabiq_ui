# SDD ledger — plan: docs/superpowers/plans/2026-10-07-finance-daybook-accounts-audit-ledger.md

Execution mode: native/inline on isolated GitHub feature branch `feat/separate-finance-accounts-bd`.
Spec: `docs/superpowers/specs/2026-10-07-finance-daybook-accounts-separation-design.md`.

Pre-flight: Task 1 produces UnifiedTransaction/date preferences consumed by Tasks 2–5 — interfaces match.
Pre-flight: Task 2 produces Daybook/Finance source actions consumed by Task 4 correction adapters — interfaces match.
Pre-flight: Task 3 produces accounting postings consumed by Task 4 and Task 5 — interfaces match.
Pre-flight: Task 4 produces audit correction/delete behavior consumed by Task 5 integration — interfaces match.
Ruling: use the existing isolated GitHub feature branch as the worktree-equivalent workspace because this session edits GitHub directly and does not use the user's local machine — cost if wrong: branch-only changes remain isolated and can be discarded without affecting main.

Task 1: complete (commits f9a9b5b..2c03eca, tests: GitHub UI Check run 37601535150 → success; npm test + npm run build passed).

Task 2: Ruling: Purchase/Expense source pages do not yet expose a reusable edit form; Daybook routes to the source module now and Task 4's centralized Audit Edit provides complete correction — preserves single-source ownership without duplicating forms — cost if wrong: Daybook edit for those types is one click less direct until Task 4.
Task 2: complete (commits ad889fb..e0cc6f9, tests: GitHub UI Check run 37602762389 → success; npm test + npm run build passed).
