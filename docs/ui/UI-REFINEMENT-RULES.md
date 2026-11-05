# HisabIQ — mandatory UI refinement workflow

Effective 2026-11-05. Owner-approved workflow for **navigation and future module-by-module UI refinement**. Read together with `AGENTS.md`, `HISABIQ-DESIGN-GUIDE.md`, `docs/design/taste.md` and the current business/transaction contracts.

## Rule 1 — Source before guesses

When the owner specifies a reference design, **read its exact current code first** (including components, motion tokens, theme and interactions). Do not approximate timing, layout or behavior from screenshots. For the navigation project, source is [Sabab SIS in Magic Patterns](https://www.magicpatterns.com/c/kecprgln6zfkctsc37g2to), artifact `0fdd761a-0c9e-4e22-9d6b-4fb248e73b14`, specifically `NavTree.tsx`, `Sidebar.tsx`, `TopBar.tsx`, `TopNavStrip.tsx`, `MobileDrawer.tsx`, `AppShell.tsx`, and `utils/motion.ts`.

Copy the reference's **approved interaction and animation** first, then rewire it to the **existing HisabIQ routes, roles, permissions, data, tokens and handlers**. The owner's explicit decision to use Sabab navigation overrides earlier generic advice not to change that one presentation pattern. Do not import school roles/data or fake effects. Keep HisabIQ design principles elsewhere.

## Rule 2 — One scope, one draft PR

- One component group or module at a time; no broad redesign or unrelated refactors.
- GitHub `shuvodelux-commits/hisabiq_ui` is the sole authoritative code; create `refine/<slug>-github` from main and open a **draft PR**.
- Commit `docs/ui-refine/<slug>/brief.md` **before code edits**; describe reference, exact source files, retained functionality and acceptance tests.
- Use the GitHub-only skill `.github/skills/github-only-ui-refine/SKILL.md` inside ChatGPT. The original local `/ui-refine-loop` remains for agents with the native Workflow runtime. Do not falsely label GitHub-only mode as having run the original independent model agents.

## Rule 3 — Test first, then inspect actual images

1. Add/update focused Playwright interactions and watch the relevant regression fail before implementing the fix when executable tests are available.
2. In the PR description set `UI-REFINE-ROUTE: #/app/<verified-route>` and optional valid `UI-REFINE-SCOPE:` and `UI-REFINE-STATE:`. The existing GitHub Actions job automatically captures **main vs PR** screenshots and runs the pinned official Impeccable source detector.
3. Inspect real PNGs at **320/390/768/1024/1440px**, both themes. Screenshots of the *closed* page never prove an open menu/modal; capture the actual state and test hover, tap, Escape, Tab, focus return, scroll, popover placement and drag where relevant.
4. Check Bangla, English + Bangla, keyboard use, touch/Android, empty/busy/error states and reduced-motion. For animation changes, verify the live temporal motion or disclose that static screenshots cannot validate timing.
5. Run and read **actual results**: `npx tsc --noEmit`, `npm run lint`, `npm run check:ui-contract`, `CI=1 npm test`, `npm run build`, plus focused Playwright scripts; no green claims without command output.

## Rule 4 — Three bounded Impeccable passes and verification

Use `.github/skills/github-only-ui-refine/THREE-ROUND-PROTOCOL.md`: C0 baseline → C1/C2/C3 (individually checked and fixed) → C4 closing review. Route findings through the matching Impeccable improvement approach, polish last; keep stable P0–P3 issue IDs, before/after comparisons, independent detector output and evidence ledger. Stop early only under documented stop rules (e.g. no P0/P1 twice or missing required evidence), **never invent rounds or /40 scores**.

Save `docs/ui-refine/<slug>/ledger.md`, link screenshot workflow runs/artifacts and tests to the PR, label unfinished evidence honestly. CI reports static image and detector evidence; visual judgment requires opening the images. Fresh reviewer agents are not assumed when unavailable.

## Rule 5 — Protect workflows and approve every merge

Keep HisabIQ's compact blue/teal brand, control-height/radius and table typography contracts, proportional digits, POS V2, purchases, finance postings, customer/vendor permissions and bilingual labels. Never introduce fake posting or notifications. Adapt only what the approved scope requires; avoid excess animation or extra libraries.

**No automatic merge, deployment or direct push to main.** The owner reviews the draft PR and approves it before moving to the next module.

## Rule 6 — Mandatory compact mobile filtering and reachable row actions (owner approved 2026-11-05)

Use the **approved Daybook compact mobile layout** as the ERP-wide default for future table/ledger UI refinement, along with existing Audit Ledger behavior.

- On small phones (**below 768px**), show **Search + one 36px square Filter icon** on the first row and **Date / Date range** on the second. On tablets (**768–1023px**), arrange **Search → Date → Filter** on one horizontal line with no second row; all controls must fit the available width and keyboard focus must follow the same order. On desktop (**1024px and wider**), show **Search → Date** together with the existing advanced filter controls visible. Hide the filter icon at desktop widths. Advanced dropdowns remain **collapsed by default below 1024px**, preserving their values and Reset.
- **Remove redundant date-mode helper labels** (e.g. a second "Transaction Date · ..." explanation to the right of a date picker) when the active date mode is already clear from the module's header tabs or control labels. Do not remove date/date-range picker labels, screen-reader names, or meaningful context when it is the sole explanation.
- Preserve all filter choices, `Reset`, URL/search-state, and active filters even when their controls are collapsed. The button must expose `aria-expanded` and `aria-controls`; show a subtle active-filter indicator only when filters are applied. Never hide active filter effects or reset silently.
- On small screens, **every row's three-dot action must be visible without horizontal scrolling**. Prefer a compact table with Date / Type / Reference (plus party as subordinate text) / sticky Action; show all detail columns on desktop and retain source detail access via existing row actions. If a full-width table still scrolls, pin the action cell to the right (as in Audit Ledger). No clipped controls or pointer targets outside the viewport.
- Reuse existing `ActionMenu`, `FloatingPanel`, table and button primitives. Ordinary square/icon controls are 36px with the universal radius token. Ensure touch, keyboard, Escape, focus return, menu clamping and Bangla rendering. Never change transaction handlers, permissions, posting, print, returns or accounting logic to achieve layout.
- New refinement PRs must include **collapsed and expanded filter** screenshots plus actual open-row-action screenshots at 320/390/768px in light/dark, and a Playwright check that the action is in viewport at scrollLeft=0. Treat these as **universal acceptance rules** for every future ERP module; apply one module per PR, not a sweeping rewrite.

**Approved visual reference:** Daybook mobile design confirmed by owner 2026-11-05: search + square funnel icon, date below, four-column compact rows with always-visible `⋮`.

**Reusable implementation checklist:** `docs/ui/RESPONSIVE-FILTER-ACTION-PATTERN.md` (phone, tablet, desktop, accessible focus order, screenshots, and future per-module rollout).

