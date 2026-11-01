# HisabIQ_UI: `/ui-refine-loop` (GitHub-only refinement)

This repository installs the upstream [EricTechPro/super-board `ui-refine-loop`](https://github.com/EricTechPro/super-board/tree/d0b7d5a6850614ca809477c1af43d5d7da408726/skills/ui-refine-loop), MIT-licensed. **Only the standalone UI refinement skill is installed.** No Super Board autopilot, background agent, merge permission or deployment is enabled.

## Operating model

1. The only authoritative code is GitHub `shuvodelux-commits/hisabiq_ui`. Run the skill in an authorized, temporary agent/CI/Codespaces checkout of the selected GitHub commit. Never use a machine's uncommitted files as a source of truth. A checkout/worktree may execute the necessary Node, screenshot and browser tests; the workflow is still **GitHub PR-only** for submitting changes.
2. A person starts `/ui-refine-loop <route-or-component> "<focused brief>" --rounds 3` in an agent environment that exposes the skill and Workflow/sub-agent capabilities. This repository setup does not automatically execute a slash command inside GitHub Actions or ChatGPT. If no Workflow tool is present, follow the upstream documented fresh-agent manual fallback, not a pretend completed run.
3. First read `AGENTS.md`, `docs/ui/HISABIQ-DESIGN-GUIDE.md`, `docs/ui/transaction-cart-design-contract.md`, the exact React page/components, and `docs/design/taste.md`. Ask only unresolved design/taste decisions; cap the skill's interview at 10 questions. Use the default "same look, cleaner" when it meets the brief.
4. Make only in-scope frontend edits. One target per branch `refine/<slug>`; do not push main, change data persistence/accounting/stock/auth, recreate screens or modify backend. Do not alter shared components globally without a narrowly scoped, backwards-compatible reason. No local-only completed work.
5. Before shots and after shots: 1440px desktop and 390px phone, both themes; additionally validate 320px phones and 768/1024px tablet layout where the target needs it. Test English, Bangla and English+Bangla, keyboard and touch, every affected field/action, busy/empty/error states when supported by authentic existing fixtures. Never invent data, a login or posting result.
6. Maintain real checks throughout each round: `npx tsc --noEmit`, `npm run lint`, `npm run check:ui-contract`, `CI=1 npm test`, `npm run build` (see `.claude/ui-refine.config.json`). Use relevant Playwright scripts for the specific module and avoid unrelated visual changes. Revert an unsafe or failing round.
7. A fresh reviewer grades before/after pixels and functionality. Publish a **draft PR** with a concise human-written rationale, scores, issues fixed/remaining, exact checks/results, and reviewable before/after screenshots. Never fabricate scores or screenshot claims. **No merge, auto-merge, direct deploy or direct main push without explicit owner authorization.**

## Invocation examples

```text
/ui-refine-loop /#/app/products "Polish the Products table spacing, hover and mobile usability; preserve every existing action" --rounds 3
/ui-refine-loop src/components/products/AddProductDialog.tsx "Reduce clutter but keep POS-style quick entry and existing fields" --rounds 3
/ui-refine-loop /#/app/audit-ledger "Polish the correction dialog; do not change accounting logic" --rounds 3
```

HisabIQ_UI uses hash navigation. Validate the actual route and rendering before capturing it. The above examples are templates to verify against the current routing, not claims that the skill has run.

## Runtime integration and limitations

- Source: `.claude/skills/ui-refine-loop/SKILL.md`, its `references/` and `scripts/`, and `.claude/workflows/ui-refine-loop.js`. The project config is `.claude/ui-refine.config.json`; `docs/design/taste.md` sets explicit HisabIQ design taste.
- A suitable agent runner needs Git, GitHub auth, Node 24, npm, Playwright Chromium, screenshots and fresh reviewer/fixer agents. The source Workflow file expects an agent Workflow runtime, **not ordinary Node or GitHub Actions alone**.
- The official tool recommends Impeccable. If it is installed in the runner's `.claude/skills/impeccable` or `.agents/skills/impeccable`, the official setup detects it; if absent, it must prominently warn and fall back to the built-in rubric. Do not label its output an Impeccable audit. The `humanizer` integration is optional; otherwise use short, plain, respectful words.
- `bash .claude/skills/ui-refine-loop/scripts/refine-setup.sh detect` inspects the project-specific config and prints resolved commands/warnings without running a refinement. `bash .../refine-setup.sh up --slug <slug>` creates an isolated local worktree for an actual authorized run.
- Generated worktrees, temporary auth state, console logs and intermediate screenshots are ignored. Only reviewed before/after evidence is intentionally included under `docs/ui-refine/<slug>/` on the draft PR branch.
- The installation CI check verifies structure, script syntax and configuration detection. **It does not claim to run the interactive refinement loop or prove visual improvement.**

## Draft PR format

**Title:** `ui: refine <module> — <specific improvement>`

**Body:** explain the chosen target; approved design reference; changes and preserved behaviors; before/after light/dark screenshots at 1440/390; review score (or explicit rubric fallback); issues fixed and still open; touched files; keyboard/mobile/Bangla and smoke checks with results; preview-only versus real posting distinction; risks and approval needed.

Keep a single primary intent and use practical English/Bangla familiar to Bangladeshi shopkeepers. Do not add "delight" by decorative gradients, vague microcopy or invented success indicators.
