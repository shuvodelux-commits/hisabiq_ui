# GitHub Only UI Refine · portable skill (v0.1 draft)

**A reusable ChatGPT + GitHub + Playwright UI refinement skill.** No paid OpenAI API key, manual GitHub Actions click, local Codex session or Remote Desktop Commander is required. ChatGPT reviews real screenshots while GitHub runs the browser and test jobs. All code changes go through a **draft PR**.

This package was extracted **after** the HisabIQ Expenses three-round pilot passed its [final browser and Bangla regression run](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41347817428). It is a reusable **beta starter**, not a claim that every framework or independent model-agent feature has been tested.

## Files in this package

```text
portable/github-only-ui-refine/
  SKILL.md                        ChatGPT GitHub-only agent instructions
  THREE-ROUND-PROTOCOL.md         C0 + C1/C2/C3 + C4 review/stop rules
  ui-refine-github.example.json   Route, theme, viewport and server config
  scripts/capture.cjs             Generic Playwright before/after runner
  templates/ui-refine.yml         GitHub Actions PR screenshot workflow
```

## Install in a new project

1. Create a **setup branch** in the target project's GitHub repository; do not overwrite existing `.claude/skills/ui-refine-loop`, `AGENTS.md`, Codex local skills or remote desktop settings.
2. Copy `SKILL.md` and `THREE-ROUND-PROTOCOL.md` into `.github/skills/github-only-ui-refine/` (keep both together).
3. Copy `scripts/capture.cjs` to `scripts/ui-refine-github/capture.cjs`.
4. Copy `templates/ui-refine.yml` to `.github/workflows/ui-refine.yml`.
5. Copy `ui-refine-github.example.json` to the repository root as `ui-refine-github.json`, and adjust every field to the actual app. Commit the setup changes on that branch; open a **draft setup PR**.

For the starter, use Node.js 24, `npm ci`, the existing `package-lock.json`, and `playwright` as a dev dependency. The template uses **Vite's dev command**, two GitHub-hosted localhost ports, and the project-specific `main` content selector. Vue/Vite can use the starter after routing and theme configuration. Next.js, Angular and other stacks **must adapt the startup commands, build environment, auth/fixtures and route validation**; they are not automatically supported or validated by this package.

## Configuration

`ui-refine-github.json` supports:

| Field | Purpose |
|---|---|
| `allowedRoutePrefixes` | Explicit prefix allowlist, e.g. `["/orders", "/products"]` for history router or `["#/app/"]` for React HashRouter |
| `contentSelector` | Selector for the real page content (not the login/splash) |
| `theme.storageKey` | Existing localStorage theme key; omit if not used |
| `theme.lightValue`, `theme.darkValue` | Actual theme values for the app |
| `viewports` | Default 320/390/768/1024/1440; customize if necessary |
| `captureHeight` | Screenshot viewport height; `fullPage` captures longer content |
| `baseUrl`, `headUrl` | Baseline and PR dev URLs; must match CI startup ports |

The route prefix allowlist is a safety gate, **not proof a router implements a page**. ChatGPT must inspect actual route declarations before opening the PR. The runner also checks URL, visible selector, nonempty text and browser JS errors, but it **cannot** prove authentication, all actions or visual correctness by itself.

If the UI is behind login, provide a secure **test-only** environment/auth fixture as a separate reviewed change. Do not put production secrets in a PR description, browser screenshot, or untrusted workflow.

## First smoke test, automatically

After the setup is merged to the default branch with owner approval, tell ChatGPT (with an authorized connected GitHub app):

```text
GitHub only UI refine /orders --rounds 3.
Preserve the existing UI and behavior; polish spacing and mobile usability.
```

ChatGPT should open a **new draft PR** containing a scoped brief and this exact marker as a plain PR body line:

```text
UI-REFINE-ROUTE: /orders
```

Opening the PR automatically runs `UI refine screenshots`. No one needs to click `Run workflow`. The artifact contains real `before-` and `after-` PNGs for five widths in light/dark, `manifest.json` with exact Git SHAs, and `compare.html`. ChatGPT uses the connected GitHub tools to retrieve the artifact ZIP and inspect the actual images. If images cannot be opened, it must explain the limitation and request the ZIP; it cannot claim it visually inspected filenames or logs.

In each of **C1–C3**, ChatGPT critiques, ranks, fixes, verifies, captures new images, and keeps a ledger. After the third round, **C4** grades claimed fixes against the baseline and runs real interaction tests. If any regression is found it must be corrected/reverted, then CI rerun. **Never auto-merge or deploy.**

## Functional testing is mandatory

The starter workflow captures images; it **does not replace the project's tests**. Supply regular PR CI for TypeScript/build/lint/unit tests and targeted Playwright flows for menus, dropdowns, keyboard, touch, nonempty/error states, languages and responsive layouts. During the pilot, these deeper tests found a pre-existing 1024px filter overlap missed by generic screenshots and enabled a verified correction.

You can optionally add an official, **version-pinned Impeccable CLI detector** to your GitHub-hosted pipeline. Do **not** claim it ran merely because the SKILL.md references it; its exit code and findings must be saved in a real artifact. A mechanical detector is not a parallel AI model reviewer.

## Security and privacy

- The screenshot Action uses `pull_request` events, `contents: read`, `persist-credentials: false`, and blocks fork-origin PR execution by matching the head repository. It does not receive an AI API key.
- Do not use `pull_request_target` to execute untrusted PR source. Keep all workflow tokens read-only.
- Avoid running previews against a production API or uploading real customer, invoice, phone, payment, bank or health data in publicly downloadable artifacts.
- Artifacts expire according to the configured retention period. A PR may be public; treat every screenshot as publishable evidence and use sanitized test data.
- GitHub Actions usage can have GitHub-hosted runner quota/billing depending on account and repository settings. **No additional OpenAI model API billing** is introduced by the template.
- A connected ChatGPT conversation is needed for each AI review/fix continuation; GitHub completion does not automatically message ChatGPT or continue the AI session.

## Local workflows remain independent

This package does not modify, install into, or replace local Codex / Remote Desktop Commander `/ui-refine-loop` instructions. Its C0→C4 method is a ChatGPT-led **functional equivalent where tools allow**, not the original runtime's independent parallel reviewer/detector/checker/fixer model-agent execution. The final PR report must disclose the actual level of automation.

## Verified reference, publication status

- HisabIQ setup: [PR #242](https://github.com/shuvodelux-commits/hisabiq_ui/pull/242)
- Real pilot: [PR #243](https://github.com/shuvodelux-commits/hisabiq_ui/pull/243)
- Final working screenshot/Impeccable/browser regression artifact: [GitHub Actions run 41347817428](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41347817428)

**This package is a draft for owner review**. It has not been separately installed and smoke-tested on an unrelated repository; do not publish it as verified universal framework support.
