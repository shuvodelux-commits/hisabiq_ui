# SDD ledger — plan: docs/superpowers/plans/2026-10-07-finance-daybook-accounts-audit-ledger.md

Execution mode: native/inline on isolated GitHub feature branch `feat/separate-finance-accounts-bd`.
Spec: `docs/superpowers/specs/2026-10-07-finance-daybook-accounts-separation-design.md`.

Pre-flight: Task 1 produces UnifiedTransaction/date preferences consumed by Tasks 2–5 — interfaces match.
Pre-flight: Task 2 produces Daybook/Finance source actions consumed by Task 4 correction adapters — interfaces match.
Pre-flight: Task 3 produces accounting postings consumed by Task 4 and Task 5 — interfaces match.
Pre-flight: Task 4 produces audit correction/delete behavior consumed by Task 5 integration — interfaces match.
Ruling: use the existing isolated GitHub feature branch as the worktree-equivalent workspace because this session edits GitHub directly and does not use the user's local machine — cost if wrong: branch-only changes remain isolated and can be discarded without affecting main.
