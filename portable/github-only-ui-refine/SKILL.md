---
name: github-only-ui-refine
description: Refine any supported web UI through ChatGPT, connected GitHub tools, automatic GitHub Actions Playwright screenshots, three bounded Impeccable-guided check/fix rounds and a draft pull request. Does not alter local Codex or desktop skills.
argument-hint: "<verified route> [focused visual brief] [--rounds 3]"
---

# GitHub-only UI refine — portable skill v1

This skill is intentionally independent of local agent runners, Claude skills, Codex CLI, and Remote Desktop Commander. **Use only when the user asks for GitHub-only UI refinement in ChatGPT with an authorized GitHub connector.** Original local workflows remain untouched.

## Prerequisites and discovery

1. Read `ui-refine-github.json` and the project's `AGENTS.md` / design guidance, source files and imported components. If config or GitHub authorization is missing, report the blocker. Do not invent routes, credentials, UI fixtures or successful tests.
2. Inspect `src/`, `app/` or `pages/` according to the actual project. Validate the requested route using real routing definitions as well as configured allowlisted prefixes; a configured prefix alone does not prove a route renders.
3. Respect approved components, tokens, accessibility, theme, translations, keyboard/touch and existing business logic. The owner's latest explicit UI direction wins over generic patterns.
4. Read `THREE-ROUND-PROTOCOL.md` in this package and the corresponding original Impeccable playbooks **when installed**. If absent or its official detector cannot run, identify that limitation. Never mislabel ChatGPT feedback as independent-agent Impeccable assessment.

## Begin without a manual Actions button

ChatGPT opens a new `refine/<target>-github` branch and a **draft PR** based on the user-authorized repository branch. First commit a compact `docs/ui-refine/<target>/brief.md` with scope, current design authority, acceptance criteria and protected functions.

Include a single literal marker line in the PR body:

```text
UI-REFINE-ROUTE: /orders
```

For hash routers use `#/app/expenses`; change to the verified route. The GitHub-hosted `pull_request` workflow automatically checks out the base and head, runs Playwright, and uploads **before/after screenshots** at 320, 390, 768, 1024, 1440 in light/dark. It requires no OpenAI API key or manual `workflow_dispatch`.

## C0 baseline and bounded three-round implementation

1. **C0:** Fetch the actual screenshot artifact through the connected GitHub tool, inspect its PNG pixels, verify the page isn't a login/error overlay and record its commit/run IDs. If the ZIP isn't accessible, explicitly request image evidence; don't invent inspection.
2. **C1, C2, C3:** Follow the original check → fixer pattern. Examine actual screenshots, source, and (when executed) pinned official Impeccable detector output. Rank up to eight stable typed issues P0–P3, map to Impeccable commands and use `polish` last. Make one coherent in-scope GitHub commit per round. Wait for real PR CI and new automatic screenshots before the next round; revert red rounds. No backend/accounting/storage mutations under a visual polish request.
3. Maintain a `docs/ui-refine/<target>/ledger.md` with C0–C3, SHA, run, screenshot links, detector availability, findings, fixes, CI, regressions and honest scoring (no invented independent-agent /40 score).
4. Stop at three rounds, two consecutive checks without actionable P0/P1, two reverted rounds, or a critical runtime/evidence failure. Record the actual reason, do not fabricate completed rounds.
5. **C4 finish:** Inspect C0 versus the final pixel artifacts. Grade every issue fixed / partial / not-fixed; identify up to three regressions. Verify relevant functional and accessibility tests and any finance/stock invariants where applicable. Correct/revert verified regressions before closeout.
6. Update the same **draft PR** with before/after evidence, grades, tests, limitations, risk and approvals needed. **Never merge or deploy without explicit owner approval.**

## Execution model and honesty

GitHub Actions runs browsers, source checks, screenshots and optional locally installed Impeccable machine scans. **ChatGPT does the AI review interactively in this conversation**, not through an API-billed Action. There are no automatic independent parallel model subagents, and GitHub cannot send screenshots into an idle chat or autonomously continue conversation turns.

Cross-project installation and customization are in `README.md`. The templates are a **Vite/npm starter** usable with React or Vue; Next.js and other frameworks require the documented server/start command and routing/theme adaptations. Do not claim untested framework support. Leave local Codex and Remote Desktop Commander original skills unchanged.
