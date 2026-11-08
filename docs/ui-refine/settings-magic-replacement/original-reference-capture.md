# Magic Patterns Settings — original rendered-reference capture

**Reference editor:** https://www.magicpatterns.com/c/t6q3mxi6nhuak3qjvx8cwn  
**Pinned source artifact:** `238f01b4-0e3b-4eda-aac5-6d542fbf85cd`  
**Candidate:** HisabIQ_UI draft PR #272 (`refine/settings-magic-replacement-github`)  
**Review gate:** original-source pixel-parity certification **NOT COMPLETE**; a read-only published reference URL has not yet been supplied.

## Why the original images are absent

The Magic Patterns connector currently exposes the editor artifact's **source files**, but no screenshot action for this editor design. The available `preview_design` tool is for **MagicOS files** and requires a MagicOS design ID and `finish_working`; it cannot screenshot a `magicpatterns.com/c/<editorId>` artifact. The connected browser requires an originating browser-extension session, which is unavailable here.

Previous automated GitHub BEFORE/AFTER screenshots show the **GitHub base commit versus PR head**, **not** the original Magic Patterns editor. They must not be labeled as the original reference. The older Magic Patterns ZIP in this chat predates this Settings redesign and cannot stand in for this pinned source.

The source's `App.tsx` uses **BrowserRouter** (`/app/settings/<section>`), whereas HisabIQ UI uses a **HashRouter** (`/#/app/settings/<section>`). This matters when capturing truly identical route states.

## Ready-to-run, non-mutating capture

`scripts/settings-magic-original-parity.cjs` now provides an **optional**, GitHub-only paired screenshot pass. Its source input is the published read-only project root from Magic Patterns, not an editor link.

The workflow `.github/workflows/ui-refine-chatgpt.yml` already runs on an edit to PR #272. When a valid published source URL is present **as its own single line** in the PR description, it captures screenshots without sending new prompts or changing the original:

```text
MAGIC-SOURCE-PREVIEW-URL: https://project-YOUR-PROJECT.magicpatterns.app/
```

Do **not** add this marker until the real URL exists; the text above is an illustrative placeholder. The script strictly requires HTTPS under `*.magicpatterns.app`, default port and root path. It rejects editor, Canvas, other hosts and local addresses. No source credentials or private account tokens are requested.

Capture output is added to that workflow run's downloadable artifact in `original-magic-reference/`, containing:

- `source-<screen>-<width>-<theme>.png` — public original render
- `implementation-<screen>-<width>-<theme>.png` — local PR build
- `manifest.json` — exact routes, dimensions, themes and metadata
- `compare.html` — side-by-side, inspectable source-vs-candidate image pairs

The first pass captures **eight screen states** (Settings home; Interface & workflows; Users & roles; Data & backup; Logged-in devices; Staff activity; Offline selling; Invoices & printing), in **light and dark** at **320, 390, 768, 1024 and 1440px**. That is **80 source/candidate pairs**. The source is never clicked, saved, edited or published by this workflow. Images are evidence for a visual reviewer, not an automatic score.

## Before accepting any screenshot comparison

1. Open the pinned editor and confirm that the published preview matches the **same code version** as artifact `238f01b4-0e3b-4eda-aac5-6d542fbf85cd`. The capture script cannot prove the published site's artifact/version mapping automatically.
2. Inspect `compare.html` in the workflow artifact. Confirm viewport, font rendering, language, selected Settings section, theme and sample data. Differences in source demo records versus candidate synthetic records are not necessarily visual implementation defects.
3. Compare geometry, information density, labels, spacing, line wrapping, color contrast and internal scroll areas page by page. Record defects with reproducible screenshots and separate source-design choices from real port regressions.
4. Capture matched **open dialogs, selectors, tabs, invalid-field states and keyboard focus** before declaring *full* parity. The initial script covers only default page states.
5. Continue the separate human screen-reader pass; a visual image diff cannot assess spoken semantics or keyboard order.

**Without the published source URL or equivalent attached original screenshots, P-04 remains BLOCKED.** Green CI, high source-label coverage, and GitHub baseline/PR screenshots do not resolve this gate.

## Safety and privacy

This capture uses disposable browser contexts, no stored sessions or personal customer data. Publishing a Magic Patterns design may make the prototype accessible publicly. The owner should decide whether that is acceptable; do not publish it or change its sharing permissions solely to satisfy automated CI. If public sharing is undesirable, provide an original screenshot/export set for a manual comparison instead.

**Status:** reference-capture tooling prepared on the unmerged draft branch; waiting for an authorized original rendered source. **No Phase 1 approval, merge, deployment, or backend reconnection.**
