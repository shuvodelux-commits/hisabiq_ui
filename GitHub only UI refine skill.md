# GitHub only UI refine skill

> **Reusable installation guide · ChatGPT + GitHub + Playwright · no local PC, manual Actions launch, or extra OpenAI API key**
>
> This document describes the **separate GitHub-only workflow**, not the original local `/ui-refine-loop` engine. **All declared HisabIQ modules** are supported as targets, including ERP `#/app/*`, SaaS Control Center `#/saas/*`, and auth routes. It follows the original **three-round check → fix → recheck** method, with a closing check and a result ledger. A pinned official Impeccable *source detector* runs automatically in Actions; the AI review remains in ChatGPT, not parallel subagents. Use its companion skill `.github/skills/github-only-ui-refine/SKILL.md`.

## 1. Purpose and separation

There are **two independent paths**. Do **not** overwrite one with the other.

| | Original local UI refine skill | GitHub only UI refine skill |
|---|---|---|
| Invocation | `/ui-refine-loop <route> ...` in a compatible local Codex/Agent/Workflow runner | Ask ChatGPT: `GitHub only UI refine <route> --rounds 3` |
| Execution | Local Codex or Remote Desktop Commander running an authorized checkout | ChatGPT calls its connected GitHub tools; GitHub-hosted Actions runs browsers |
| Browser | Local agent/Playwright | GitHub-hosted Playwright from PR events |
| Screenshots | Local runner / original skill | Before/after screenshot ZIP in the PR's Actions artifacts |
| AI critique | Original Impeccable workflow's fresh agents **if the agent runner supports them** | This ChatGPT conversation, guided by Impeccable's documented principles |
| API cost | Depends on original agent environment | **No separate OpenAI API key** for the screenshot flow |
| Trigger | Original slash command | User message to ChatGPT, which creates/updates a GitHub PR; Actions runs automatically |
| Output | Feature branch and draft PR | Feature branch and draft PR; GitHub test/screenshot artifacts |
| Limitation | Requires compatible installed agent/Workflow engine | ChatGPT can't autonomously receive GitHub images or keep working when the conversation is idle |

**HisabIQ original local files remain unchanged**:

- `.claude/skills/ui-refine-loop/SKILL.md`
- `.claude/workflows/ui-refine-loop.js`
- `.claude/ui-refine.config.json`
- `AGENTS.md`
- `docs/ui/ui-refine-loop.md`
- `.github/workflows/ui-refine-install-check.yml`

The **GitHub-only files** are intentionally elsewhere:

- `.github/skills/github-only-ui-refine/SKILL.md` — self-contained GitHub-only agent instructions
- `.github/skills/github-only-ui-refine/THREE-ROUND-PROTOCOL.md` — C0 baseline, C1/C2/C3 reviews/fixes, C4 closing check, original routing, score and stop rules
- `.github/workflows/ui-refine-chatgpt.yml` — automatic PR-triggered baseline/PR screenshot job
- `scripts/ui-refine-chatgpt-shots.cjs` — Playwright screenshot utility and route self-test
- `GitHub only UI refine skill.md` — this portable installation guide

The older `.github/workflows/ui-refine-cloud.yml` is an **optional separate** manually invoked API-billed adapter; **do not use its `refine` mode** for this ChatGPT-only method. It is not started by the workflow in this guide.

## 2. What has been verified in HisabIQ

In HisabIQ draft [PR #242](https://github.com/shuvodelux-commits/hisabiq_ui/pull/242), a `pull_request` event triggered screenshot CI automatically. The initial successful run was [GitHub Actions run 41343034633](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41343034633).

That run captured **20 actual PNGs** (10 baseline + 10 PR) for `#/app/expenses`, a comparison HTML file, and a JSON manifest. The ChatGPT GitHub connector could fetch the artifact and its ZIP into the chat environment. The source code of Expenses was unchanged in the setup PR, so the before/after screenshots were expected to match. This verifies **GitHub capture and artifact handoff**, not that an AI refinement round was executed.

Future access depends on the available GitHub connector and artifact permissions. When the ZIP cannot be opened programmatically in chat, the assistant must say so rather than claim visual inspection.

## 3. Install in a second GitHub project

### Prerequisites

- A GitHub repository with GitHub Actions enabled, a protected default branch (usually `main`), and a GitHub connector authorized in ChatGPT.
- Node.js + a lockfile (the sample workflow uses Node 24 and `npm ci`).
- A locally runnable UI (the sample expects a Vite React app started by `npm run dev -- --port <PORT> --host 127.0.0.1`).
- Playwright available as a dev dependency, or install it in the pipeline. The sample runner invokes `require('playwright')`.
- A real route and deterministic preview fixture. Screenshots cannot prove anything if the browser opens an auth wall, blank page, or unrelated redirect.
- The app should support light/dark styles. Adapt the theme setter for projects that do not use HisabIQ's keys.
- Existing tests for essential user behavior; screenshots are not sufficient to prove click/keyboard/accounting correctness.

### Step A — Copy these three files

Copy from the **approved source commit** of `shuvodelux-commits/hisabiq_ui` into the new repository (preserve paths). There are **four** files, not just three:

```text
.github/skills/github-only-ui-refine/SKILL.md
.github/skills/github-only-ui-refine/THREE-ROUND-PROTOCOL.md
.github/workflows/ui-refine-chatgpt.yml
scripts/ui-refine-chatgpt-shots.cjs
```

Also copy this guide as `GitHub only UI refine skill.md` if the new project needs the setup documentation.

You can use GitHub's web editor, a development checkout, or connected GitHub tools. Use a **separate setup branch and draft PR**. Do not copy or replace the other project's original `.claude/skills/ui-refine-loop` or local agent configuration.

### Step B — Adapt the screenshot script to the new UI framework

Edit `scripts/ui-refine-chatgpt-shots.cjs` deliberately:

| In the HisabIQ reference | Change for another project |
|---|---|
| `routeFromBody` reads `src/App.tsx` and accepts declared `#/app/*`, `#/saas/*`, and top-level routes | Verify your actual router file and route format (React Router, Next.js, etc.) |
| `#/app/expenses` marker is an **example only** | Use any verified route, e.g. `#/app/pos`, `#/app/purchases/new`, `#/saas/overview`; do not guess |
| `location.hash` route assertion | For history routers validate `location.pathname` instead |
| `localStorage.setItem('hisabiq-theme', ...)` | Use the new app's real theme mechanism; keep light and dark comparable |
| `page.locator('main')` | Use the actual page-content container, and ensure it isn't the login page |
| Port 4310 (baseline), 4311 (PR) | Use ports supported by the new dev command |
| Responsive widths `320,390,768,1024,1440` | Keep these defaults unless the device matrix is expressly different |
| 10 screenshots per source | Keep five widths × two themes for traceable comparison |

Use a source-scope marker for **any module** if available: `UI-REFINE-SCOPE: src/pages/Pos.tsx`, or its actual source file. The script validates the scope exists in the checked-out source. Without a scope marker the official detector scans the relevant source family (`src/pages`, `src/saas`, `src/features/auth`), not Expenses. A real screenshot may still show a login screen on protected routes.

If the app uses an authenticated UI, design a **safe, explicit test-only authentication method** and never add credentials to PR text, screenshots, source, or generic shell logs. Prefer isolated demo data. Do not claim server-side posting from a frontend preview.

### Step C — Adapt the GitHub Action

In `.github/workflows/ui-refine-chatgpt.yml`, confirm:

1. `on: pull_request` includes `opened` and `synchronize` and relevant `paths` for source files and `docs/ui-refine/**` (the initial brief must trigger screenshots).
2. The job is gated to a **same-repository** PR and the `UI-REFINE-ROUTE:` marker. It does **not** use `pull_request_target`.
3. Checkout `candidate` at `github.event.pull_request.head.sha`, and `baseline` at `github.event.pull_request.base.sha`; compare actual commits, not moving branches.
4. Use `contents: read` and `persist-credentials: false`. The job must **not** have an AI API secret or repository write permission.
5. Adapt the package-manager commands, lockfiles, start commands, dependency cache, and browser installation to your project.
6. Run `node scripts/ui-refine-chatgpt-shots.cjs --self-test` after customizing its route parser. Test the route with Playwright.
7. Run the **pinned official Impeccable CLI source detector** on the declared `UI-REFINE-SCOPE` or area fallback, with `impeccable detect --json <scope>`, and upload its JSON result alongside the screenshots. Its exit `0` means clean; `2` means findings; `1` means failed scan. **Fail the job for code 1, not for ordinary findings.** A source scan is not the same as a rendered accessibility audit.
8. Upload screenshots, `manifest.json`, `compare.html`, and the real detector evidence via `actions/upload-artifact@v4` with a useful retention policy.

**Important:** GitHub workflow settings, Actions quota, and hosted runner costs depend on the repository and account. The screenshot flow itself makes no AI model/API calls.

### Step D — Include project rules and regression tests

Keep the target project's `AGENTS.md`, design system, component library, route definitions and domain rules authoritative. Add new GitHub-only instructions **only** to `.github/skills/github-only-ui-refine/SKILL.md` or this separate guide, not the original local agent entrypoint.

Ensure ordinary PR CI runs the actual project's TypeScript, lint, unit tests, build and relevant Playwright interaction tests. In HisabIQ, these are provided by the existing **PR Fast CI**, while `ui-refine-chatgpt.yml` supplies image evidence. For a new repository, add corresponding checks rather than claim they exist.

Optional: install an **official, version-pinned Impeccable reference** in the new project if you want its playbooks or executable detector. If it isn't installed or the engine isn't actually run, the ChatGPT review must say **Impeccable-guided**, not claim a detector pass or original agent workflow.

### Step E — Verify installation without a manual workflow

1. Open a small **draft PR** with a real file change, e.g. `docs/ui-refine/orders/brief.md`.
2. Add an unformatted line to the PR body:

   ```text
   UI-REFINE-ROUTE: #/app/orders
   ```

   Replace it with the route verified in the new app. Do not use Markdown bold/backticks around the marker.
3. PR opening should automatically show **UI refine screenshots for ChatGPT (automatic)** in the PR checks.
4. Confirm successful screenshot captures from **both** the base commit and PR commit; open the artifact and inspect the PNGs, HTML and manifest. Before code changes, the images should look the same.
5. Confirm ordinary app tests pass. If not, correct the setup in the same draft PR and allow GitHub to rerun on the next commit.
6. Only after this verification, approve and merge **the setup PR**. No automatic UI or backend changes result from installing it.

## 4. Daily workflow: no manual GitHub Actions button

For any page in the project, request in ChatGPT:

```text
GitHub only UI refine #/app/expenses --rounds 3.
Polish compactness, clarity and touch usability. Keep the original UI and all functionality.
```

ChatGPT then follows the companion skill:

1. Read the GitHub source, target components, existing tests and design guide.
2. Create an isolated `refine/<page>-github` branch with a small scope brief; create a **draft PR** with `UI-REFINE-ROUTE` in its body.
3. GitHub Actions captures the first baseline automatically on opening the PR.
4. ChatGPT reads the run status and screenshot artifact through its GitHub tools, opens **actual images**, identifies specific, ranked issues, and uses Impeccable principles to propose minimal changes.
5. ChatGPT edits only the scoped source through GitHub. New commits automatically trigger **both normal PR CI and screenshots**.
6. Repeat up to three screenshot-backed review/fix passes, stop on failing checks, regressions, unverified images or no actionable defect; keep a truthful issue ledger.
7. Update the same draft PR with real before/after findings, remaining issues and test results. **Wait for owner approval before merging.**

The assistant cannot keep working in the background while the chat is idle. A GitHub workflow finishing does **not** automatically send a new assistant message or screenshot into the ChatGPT window; a live or follow-up user turn is still required. In a supported session, the assistant can fetch the artifact itself. If artifact bytes cannot be inspected through connected tools, attach the ZIP to the conversation.

## 4A. Preserve the original three-round quality process for **every module**

Read `.github/skills/github-only-ui-refine/THREE-ROUND-PROTOCOL.md` before each run. The **project default is three fix rounds**, never an unstructured single-pass style cleanup.

- **C0**: source/taste research, verified route + scope, baseline Playwright images in light/dark, initial issue ledger.
- **C1**: visual design assessment (/20), separately executed official Impeccable machine source detector, evidence-backed audit (/20), merged checker (at most 8 ranked P0–P3 issues), scoped fixer using Impeccable command chain with `polish` last, PR CI and refreshed screenshots.
- **C2**: fresh comparison to original baseline and C1, repeat checker → fixer and CI, retain stable issue IDs.
- **C3**: third bounded check/fix, test, screenshot and genuine regression review.
- **C4**: closing check, then finish-grade every claimed fix `fixed/partial/not-fixed`, record up to three regressions, update the draft PR with a source and screenshot ledger.

Use the original skill's **stop rules**: three rounds, two consecutive no-P0/P1 checks, two reverted rounds, or a failed essential runner. Document if stopped early. Do not claim C1/C2/C3 happened just because GitHub generated screenshots. Each fix round must have its **own commit, CI result and screenshot artifact**. When the official source scan detects issues, they become independent mechanical input for ChatGPT's checker; it does not create a fresh second AI agent.

For a PR targeting a different module, change the route and source scope markers accordingly. The screenshot workflow is **not hard-coded to Expenses**. For POS, Products, Purchases, Reports, Audit Ledger, Party, Finance or SaaS, use the actual React route. For modal, cart, Bangla, hover, error, empty/dense states or dialogs, use the module's actual Playwright interaction suites in addition to the default-page captures. A generic screenshot alone is not enough.

## 5. What GitHub-only mode does not do

- Does **not** use ChatGPT Plus as an API key or charge the separate OpenAI API.
- Does **not** call `openai/codex-action`, run the older `ui-refine-cloud.yml` `refine` job, or require the GitHub **Run workflow** button.
- Does **not** alter the original local Codex skill or Remote Desktop Commander behavior.
- Does **not** claim original `/ui-refine-loop` independent fresh reviewer/checker/fixer subagents ran unless they really did.
- Does **not** invent screenshots, numerical scores, test passes or background monitoring.
- Does **not** auto-merge, deploy, write backend code or modify accounting as part of cosmetic refinement.

## 6. Troubleshooting

| Symptom | Check |
|---|---|
| No screenshot run after PR | PR body must include `UI-REFINE-ROUTE:` on its own line; PR must be same repository; at least one changed file must match the workflow `paths` filter; Actions must be enabled |
| No screenshot artifact | Read Actions logs; verify installed Chromium, both Vite servers, route parser, `main` selector and screenshot upload |
| Browser redirects to login | Configure safe test authentication; don't pretend the requested page was photographed |
| Dark screenshots equal light | Check the actual theme key/class and if the framework overrides it |
| Can't view the artifact in ChatGPT | GitHub connector may return ZIP metadata only; materialize images in the chat runtime or attach the ZIP |
| Baseline and after are identical | Expected before any UI code changes; compare again after the first fix |
| Tests fail after fixing UI | Resolve or revert the change on the draft PR branch; do not report a green round |
| Local Codex starts GitHub-only mode | Do **not** change the original local skill; this separate GitHub skill should be invoked explicitly in ChatGPT |
| Need the full original automatic Impeccable multi-agent loop | Use a compatible Workflow/Agent runner with the original `.claude/skills/ui-refine-loop/SKILL.md`; this GitHub-only method is deliberately different |

## 7. Reference and maintenance

HisabIQ source repository: `shuvodelux-commits/hisabiq_ui`.

- Screenshot CI: `.github/workflows/ui-refine-chatgpt.yml`
- Playwright harness: `scripts/ui-refine-chatgpt-shots.cjs`
- GitHub-only skill: `.github/skills/github-only-ui-refine/SKILL.md`
- Original local skill: `.claude/skills/ui-refine-loop/SKILL.md` (**keep unchanged**)
- Existing PR tests: `.github/workflows/pr-ci.yml`
- Original separate GitHub API-billed experimental adapter: `.github/workflows/ui-refine-cloud.yml` (**unused in this method**)

For another project, carry the **four-file** GitHub-only bundle (skill, three-round protocol, screenshot script, automatic Action) and **adapt routing, theme, fixtures, build commands, pinned detector and tests**. Do not copy HisabIQ design/business rules to an unrelated application.
