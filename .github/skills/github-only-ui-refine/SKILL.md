---
name: github-only-ui-refine
description: ChatGPT-guided, GitHub-connector-only UI refinement using automatic pull-request Playwright screenshot evidence. Explicit GitHub mode; not the original local /ui-refine-loop.
argument-hint: "<verified GitHub route> [specific polish request] [--rounds 3]"
---

# GitHub only UI refine skill

## Scope and invocation

**Explicit GitHub-only mode.** Use this skill only when a ChatGPT conversation has an authorized GitHub connector and the user requests GitHub-based UI refinement. The assistant orchestrates GitHub calls from the conversation. The user's machine stays offline. No manual `workflow_dispatch`, API key or paid AI action.

**Never replace, modify or redirect** the upstream `.claude/skills/ui-refine-loop/SKILL.md`, `.claude/workflows/ui-refine-loop.js`, `.claude/ui-refine.config.json`, `AGENTS.md` or Remote Desktop Commander / local Codex instructions. Local Codex, desktop agents and a compatible Workflow/Agent runner continue to use the **original** `/ui-refine-loop`. This GitHub-only skill is a distinct alternative.

Reference implementation: `.github/workflows/ui-refine-chatgpt.yml` and `scripts/ui-refine-chatgpt-shots.cjs`.
**Mandatory three-round protocol:** `.github/skills/github-only-ui-refine/THREE-ROUND-PROTOCOL.md`. Read it before initiating a GitHub-only refinement. It carries the original check/fix, type routing, score, ledger, stop and closing-review requirements.

Cross-project setup and required adaptations: `GitHub only UI refine skill.md`.

## One-line user trigger

```text
GitHub only UI refine #/app/expenses --rounds 3. Preserve the existing design and functions.
```

User may name ANY verified HisabIQ React route in ordinary language, including `#/app/*` (ERP), `#/saas/*` (Control Center), and top-level `#/login` and other declared screens. This skill is **not** Expenses-specific. The project-configured default remains **three** check/fix rounds plus a closing C4 check; apply the original stop rules from `THREE-ROUND-PROTOCOL.md`. No need to direct the user to run GitHub Actions manually.

## Procedure: ChatGPT + GitHub connector

1. **Read the source of truth.** Inspect current GitHub `main`, target React route/source, imports, the project's existing agent/design guidance, typography, theme, relevant business functions and Playwright tests. For HisabIQ: obey `AGENTS.md`, `DESIGN.md`, `docs/design/taste.md`, `docs/ui/HISABIQ-DESIGN-GUIDE.md`, and `docs/ui/transaction-cart-design-contract.md`. Pin decisions to the exact PR base/head commits. Reuse original components; no redesign, accounting/backend/storage/auth changes.
2. **Prepare one isolated draft PR.** Create `refine/<slug>-github` from `main` using the connected GitHub tool. Before any edits, commit a small `docs/ui-refine/<slug>/brief.md` stating the verified route, preserved features and acceptance criteria; open a **draft PR**. Include a single unformatted line in the PR description:
   ```
   UI-REFINE-ROUTE: #/app/expenses
   ```
   Replace with **any** verified route under `src/App.tsx`. Include an optional, genuine source scope line `UI-REFINE-SCOPE: src/pages/Products.tsx` (or the actual SaaS/auth file) for a focused independent Impeccable source audit. This marker plus a same-repository PR triggers `ui-refine-chatgpt.yml` on `pull_request.opened` or `synchronize` automatically. Never ask the owner to click Run workflow. No ChatGPT API credentials belong in GitHub.
3. **Get real baseline screenshots.** GitHub Actions checks out the base and PR separately, uses `npm ci` and Playwright Chromium, renders the verified route in light/dark at 320/390/768/1024/1440 pixels, and uploads `ui-refine-chatgpt-shots-pr-...` containing `before-*.png`, `after-*.png`, `manifest.json`, `compare.html`. Check the actual run conclusion and artifact. The first baseline PR has identical before/after pixels, and that is expected.
4. **Inspect images in ChatGPT.** Use the GitHub connector's workflow run and artifact tools, and view the **actual PNG pixels** when possible. A ZIP may need to be materialized in the chat container before opening. Screenshots cover default route only; use module-specific Playwright scripts for dialogs, menus, empty/busy states and keyboard/touch behavior. If the images are inaccessible, be explicit; request an image/ZIP attachment rather than inventing screenshot inspection or a visual score. Verify theme, viewport, clipping, density, hierarchy, Bangla text, touch targets, keyboard focus and core workflow behavior.
5. **Impeccable-guided check, machine detector, checker and fixer.** Follow `THREE-ROUND-PROTOCOL.md` fully: take C0 baseline, use actual screenshot pixels for the five-dimension design assessment, read the independent **official pinned Impeccable source detector result** from the GitHub artifact, assess the five audit dimensions with evidence, merge/reuse at most 8 ranked issues, route the fixes via the original Impeccable command playbooks (`polish` last). Record real scores only if justified. **Do not call this the original parallel-subagent runtime**; the detector is machine-independent but the ChatGPT reviewer/checker may share a context. When detector cannot run, report failure, not an official /40 score.
6. **Three bounded fix rounds and closing review.** Make minimal, scoped React code edits via GitHub; commit to the same draft PR branch only. Each commit automatically reruns PR CI, screenshots and Impeccable detector. Check the results and updated images. Record C1, C2, C3 separately in `docs/ui-refine/<slug>/ledger.md` with SHA/run IDs/defects/score/test evidence, using the original stop rules. After fix rounds, complete C4 closing check and grade every claimed fix `fixed/partial/not-fixed`. If tests fail or a new regression cannot be fixed, revert the round; never claim an unperformed round.
7. **Close out.** Update the draft PR with the changed files, real before/after evidence and links, tests run and their status, remaining defects, any detector/agent/image-access limitations. Explicitly distinguish preview state from production posting. Leave the PR unmerged until the owner explicitly authorizes merge.

## Safety and limitations

- GitHub Actions job is **screenshots/tests only**. It never invokes ChatGPT/OpenAI API models or accesses the chat subscription.
- Github's PR event is automatic. **AI review is interactive, not a background task.** Screenshots cannot arrive in or trigger an idle ChatGPT conversation on their own.
- Follow-up user messages continue the same draft PR unless the owner requests a different target.
- Never automatically merge/deploy. Never use `pull_request_target` for untrusted code; keep Actions permissions `contents: read` for screenshot CI.
- This mode does not take over the local Codex skill discovery or the Remote Desktop Commander runtime. Original skills and local commands stay intact.
- When moving the setup to another project, use the exact `GitHub only UI refine skill.md` install/adaptation guide rather than copying HisabIQ-specific selectors and routes blindly.
