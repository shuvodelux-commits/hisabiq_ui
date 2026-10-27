# Monthly/Yearly Business Review Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement task-by-task and superpowers:test-driven-development for each calculation.

**Goal:** Give Bangladeshi business owners an honest monthly/yearly overview and downloadable draft audit sheet with exact evidence.
**Architecture:** Pure review helpers take the existing `ReportData` preview and build period flows, snapshots and readiness; a single Reports-hosted UI selects and displays these without altering the eleven Magic Patterns destinations or 34-report library.
**Tech Stack:** React, TypeScript, Vite, Tailwind, Node strip-types tests, GitHub PR CI.
**Spec:** `docs/superpowers/specs/2026-10-27-business-review-audit-report.md`.

## Global Constraints
- Source-linked HisabIQ records only; no separate accounting source, fabricated historical coverage or false 'audited' certification.
- 36px controls, proportional digits, 13/12/11 table typography; English + Bangla, keyboard-accessible underline tabs.
- Unknown historical cost, period-end stock and unverified source coverage stay null with readiness reason.
- No PR merges or production deploys in this task.

## Review Focus
- A month with no recorded transactions has unknown coverage, not verified zero.
- 24 completed months excludes the current partial month; leap-year February handled.
- Reversal/return amounts cannot imply known historical issue cost.
- Closing stock and dues are as-of amounts, never additive monthly flows.
- Cash-book payments or transfers must not be called trading income or net profit.

### Task 1 — Pure readiness and date ranges (R1)
- [ ] RED: `tests/businessReview.test.ts` exercises empty coverage, leap periods, unknown COGS, historical snapshots, no mutation.
- [ ] GREEN: Create `src/reports/review/{types,businessReview}.ts` with typed metrics, source references and readiness.
- [ ] Run tests, TypeScript, lint and commit.

### Task 2 — Monthly schedule and owner priorities (R2)
- [ ] RED: 24 completed months, year totals, net sales and purchase/expense/cash separation, top-three evidence rows.
- [ ] GREEN: Extend pure helper; never sum closing stock/dues across months.
- [ ] Run tests and commit.

### Task 3 — Single Reports workspace (R3)
- [ ] Add `src/components/reports/BusinessReview.tsx` using existing shared inputs/underlined tabs and ReportDetails.
- [ ] Wire `?workspace=business-review` in `src/pages/Reports.tsx`, preserving URL state for 11 destinations.
- [ ] Show summary/monthly/documents/session history, scope hints and explicit missing records.

### Task 4 — Draft output and verification
- [ ] Print short owner sheet using existing report print engine; CSV monthly schedule with missing cells and readiness.
- [ ] Add browser smoke and test RTL/keyboard/light/dark/responsive against original reports.
- [ ] Update this plan and PR with verified results; leave as draft. Historical bank-ready reports and formal approval remain separate work.
