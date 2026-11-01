# HisabIQ: GitHub-hosted Impeccable UI refinement (Expenses pilot)

This is a **manual, opt-in cloud execution adapter** for the complete installed
`/ui-refine-loop` role protocol. The existing source
`.claude/workflows/ui-refine-loop.js` is intended for a specialist Workflow/Agent
host and **cannot be executed by ordinary GitHub Actions or Node**. This runner
uses fresh isolated Codex Action invocations for design critique, Impeccable
detector/audit, merged checker and fixer (three rounds), a closing check and a
fresh finish review. Independent reviews are **sequential, not parallel**; this
difference from the original Workflow implementation is intentional and must not
be reported as the original runner operating unchanged.

GitHub is the code source of truth. No local CachyOS desktop or self-hosted
runner is required. Every GitHub-hosted run starts from `main`; it does not
import local work or switch backend code. The initial pilot only permits
`src/pages/Expenses.tsx` edits; optional-prop shared-component edits are
**not** automatically approved in this first cloud setup.

## Before your first AI run (repository owner)

1. Review and approve the *setup* draft PR separately. **Do not merge without approval**.
   GitHub's `Run workflow` button for a newly added workflow is available after
   the workflow has been accepted onto the default branch.
2. Go to repository **Settings → Secrets and variables → Actions →
   New repository secret**. Add `OPENAI_API_KEY` from your OpenAI API
   account. ChatGPT Plus alone is not an API key or API credit. Do not paste
   a key in the repository, PR, issue, chat, or workflow input.
3. In **Settings → Actions → General → Workflow permissions**, allow
   GitHub Actions to create pull requests if GitHub disallows the PR publishing
   job. Keep the default token read-only; this workflow grants only its
   separate publish job `contents: write` and `pull-requests: write`.
   If your organization restricts workflow dispatch or third-party actions,
   approve the applicable actions in repository settings.
4. Open **Actions → HisabIQ UI Refine Loop (GitHub cloud) → Run workflow**.
   Select `verify` first. This runs source checks, pinned Impeccable engine
   probe and baseline screenshots **without AI API billing**.
5. After the verification run is green, choose `refine` to opt into
   **three rounds** of billable Codex API calls. There are sixteen distinct
   model invocations (four roles for each of rounds 1–3, three for the
   closing check, and a final review). Costs depend on the model/API
   account, prompt size and usage. No automatic schedule is configured.

## What a refine run must prove

- `git submodule update --init --recursive` is implemented through recursive
  checkout. The pinned submodule commit is
  `e89e3ada3e875a89ac2c5d33d11e65ebef6fe285`.
- `refine-setup.sh detect` must say `critic: impeccable` with no warnings;
  the actual Impeccable engine probe must succeed. **Rubric fallback is refused**.
- Existing `AGENTS.md`, `DESIGN.md`, `docs/design/taste.md`,
  `docs/ui/HISABIQ-DESIGN-GUIDE.md` and the installed skill are binding.
- Each visual reviewer gets real baseline/current images at 1440/390px in
  both themes. Browser checks cover 320/768/1024 as well. The detector does
  not see the visual review output; the checker sees both *after* completion.
- Each fixer can edit **only** `src/pages/Expenses.tsx`. TypeScript,
  ESLint, UI contract, `CI=1 npm test`, build and the existing
  expenses workflow/Bangla Playwright suites must pass **after every round**.
  Failure ends the run with no PR. No fabricated scores or silent skip.
- The last check is scored design /20 + audit /20; a final independent reviewer
  grades claims as fixed/partial/not-fixed and names regressions.
- The read-only AI job produces review artifacts; a **separate**, narrow,
  write-permission job can propose the tested file with before/after screenshots
  in `docs/ui-refine/expenses` as a **draft PR only**. If no UI code changed,
  no empty PR is made.
- The existing UI is a browser-session **preview**, not a verified real
  backend expense posting system. Never imply otherwise.

## Limits and troubleshooting

- This is not a claim that `.claude/workflows/ui-refine-loop.js` executed:
  the faithful original parallel-agent Workflow host is not installed here.
  The GitHub adapter preserves fresh-role isolation but invokes reviews
  sequentially. Do not call it an exact parallel Workflow execution.
- The workflow is restricted to Expenses for the first review; new routes
  require a separate approved scope and route-aware screenshot/interaction
  tests. A different target must not be slipped into this run.
- It cannot add an API key for you. Missing secrets fail before any billable
  agent task. No key is exported as a persistent environment variable.
- `openai/codex-action@v1` uses a protected API proxy with `drop-sudo`
  and read-only or workspace-limited permission profiles. AI jobs have only
  `contents: read`; publish jobs have no API key.
- If a role fails, detector cannot run, test fails, images are wrong, or
  publishing is prohibited by repository settings, inspect its GitHub Actions
  logs and uploaded proof. Do not claim the loop finished or scores passed.
- When a bot creates the draft PR with `GITHUB_TOKEN`, GitHub may require
  a maintainer to approve the PR's CI workflow runs. Check their status before
  any decision to merge.
- GitHub Actions runner usage may be free for public repositories, but OpenAI
  API model calls and certain storage/usage conditions are separate.

## Files

- `.github/workflows/ui-refine-cloud.yml`: manual verify/refine entrypoint
  and isolated draft PR publisher.
- `.github/actions/ui-refine-round/action.yml`: fresh Impeccable role calls,
  score validation, protected round checks.
- `scripts/ui-refine-cloud.mjs`: cloud session, role prompts and JSON
  contracts, scoring ledger, fail-closed checks.
- `scripts/expense-refine-matrix.cjs`: genuine browser captures at small
  phone and tablet widths in light/dark.
- `.claude/skills/ui-refine-loop/scripts/shoot.mjs`: honors the existing
  HisabIQ localStorage theme key for consistent before/after screenshots.

The resulting PR is **always a draft**. Do not auto-merge, deploy, alter
backend data, or bypass the explicit owner approval gate.
