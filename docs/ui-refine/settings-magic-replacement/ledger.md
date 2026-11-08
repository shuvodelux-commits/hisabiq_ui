# Settings Magic Patterns — GitHub-only UI refine evidence ledger

**Target:** `#/app/settings/interface` and the full Settings route matrix in draft [PR #272](https://github.com/shuvodelux-commits/hisabiq_ui/pull/272).  
**Design authority:** pinned original Magic Patterns artifact `238f01b4-0e3b-4eda-aac5-6d542fbf85cd`.  
**Mode:** GitHub-only ChatGPT-led evidence audit with real Playwright and the pinned official Impeccable **source detector**. This is **not** the original `/ui-refine-loop` Workflow/subagent execution; no independent design/fixer agents ran.

## C0 → C1 → limited closing check

| Check | PR SHA | Playwright / detector run | Detector status | Design /20 | Audit /20 | Total /40 | Compared with C0 | Issue and changed file | Tests / remaining |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C0 | `36ad3f7` | [42493039733](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/42493039733) | Exit 0, zero findings, **but scanned `src/pages`** | Unscored | Unscored | Unscored | Baseline implementation images captured | **SCOPE-01 P1:** PR declared `UI-REFINE-SCOPE: src/settings` but scope parser accepted only files; scanned unrelated directory | CI, auth and screenshots passed; detector result invalid as a Settings assessment |
| C1 | `d1f4d86` | [42493977141](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/42493977141) | Exit 0, zero findings, **scope now `src/settings`** | Unscored | Unscored | Unscored | Evidence quality **better**; UI pixels unchanged | **SCOPE-01 fixed:** `scripts/ui-refine-chatgpt-shots.cjs` now accepts existing source directories, rejects invalid paths, defaults Settings routes to `src/settings`, and self-tests representative valid/unsafe paths | Screenshot and auth checks passed. Separate PR Fast CI was still running when C1 evidence was written. No component, backend, tenant, auth or accounting logic changed |
| C4 (limited evidence review; not an independent reviewer) | `d1f4d86` | [42493977141](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/42493977141) | Artifact verified: `impeccable-scope.txt=src/settings`, `impeccable-exit-code.txt=0`, JSON `[]` | Unscored | Unscored | Unscored | Scanner coverage improved; no visual change to compare | SCOPE-01 **fixed** by actual command input/artifact; no UI visual defect was claimed fixed | **STOP:** original rendered reference not available and human English/Bangla screen-reader review unfinished; cannot certify source parity, visual score or WCAG conformance |

**C2 and C3 were not attempted.** The original rendered Magic Patterns reference is still missing (source-audit P-04), so further UI styling would risk diverging from the owner's approved Magic design. This is an evidence-blocked stop under the three-round protocol, not a claim of three executed fixes.

## Screenshot and visual review boundaries

- The passing Playwright Settings suite produces default-page evidence for Settings home, nine general Settings forms, Invoice Studio, and five specialized pages (16 named routes total), at **320 / 390 / 768 / 1024 / 1440 CSS pixels**, in **light and dark**; it also captures the risky-setting confirmation dialog. These are **implementation screenshots**, not original Magic Patterns images.
- The base-versus-PR Interface before/after images compare GitHub `main` and the draft branch, not the original approved reference. Their difference cannot establish Magic parity.
- The Playwright suite exercises UI-local interactions and screenshots; no real data is posted, saved, signed out, synced or restored in Phase 1.
- Review of the implementation PNGs found no reason to authorize an unrequested design change. This is not a comprehensive visual-accessibility certification. Open overlays, language pronunciation, touch ergonomics and exact original source geometry still need human review.
- Source scanner zero findings means **no issues emitted by this particular detector invocation**, not that all Settings code or rendering has no defects.

## Exit gates and next owner action

- [x] Correct `UI-REFINE-SCOPE` parsing and confirm scan actually covers `src/settings`.
- [x] Retrieve and inspect implementation-side real Playwright screenshot artifact and machine detector output.
- [ ] Obtain **same-version, rendered** Magic Patterns screenshots/authorized published root preview of artifact `238f01b4-0e3b-4eda-aac5-6d542fbf85cd`.
- [ ] Complete source-versus-PR viewport/theme/modal comparison, record any actual visual defects, then consider a bounded C1–C3 UI-fix loop.
- [ ] Human English/Bangla screen-reader and low-end Android touch review.
- [ ] Obtain explicit owner visual approval before Phase 2 integration.

**PR #272 remains draft, unmerged and undeployed. No Phase 2 API reconnection.**


## Owner-marked Settings alignment and embedded navigation — 8 November 2026

**Evidence input:** Four user-annotated Settings screenshots. This is a separate targeted GitHub-only ChatGPT-led review, not the native independent-agent `/ui-refine-loop` runtime. No invented model grades.

| Check | Commit / evidence | Issue and result | Tests |
| --- | --- | --- | --- |
| C0 (annotated baseline) | User screenshots, `776d4a6` | **SET-01 P2** Module selector visibly shorter than Apply to; **SET-02 P2** desktop Logged-in devices / Staff activity omitted icons and had inconsistent indentation; **SET-03 P1** Support & changes and Plan & billing left the Settings shell; Offline already had a correct embedded route. | Evidence is the user's screenshots and source inspection, not a rendered original Magic reference. |
| C1 (targeted fixes) | `65a67f6`, `e333a3e`, `6f9a92c`, `9496a3b`, `9cc5113`, `b7bffd5`, `ec7a7da` | **SET-01 fixed:** Module trigger is labeled and 36px; Apply to label spacing aligned. **SET-02 fixed:** icons and same left anchor on desktop. **SET-03 partial:** embedded existing Support and subscription content, routed the Settings tabs and ticket links inside the workspace. Old standalone links remain for compatibility. | First screenshot run [42501693373](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/42501693373) correctly failed on a support-ticket deep-link regression. |
| C2 (regression repair) | `f5e94a3` | **SET-03 fixed:** `settings/:section/:id` preserves the Support section when a ticket is opened; the earlier static `settings/support/:id` route lost `section` and rendered Settings home. | [PR Fast CI 42502009609](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/42502009609) **passed**; [Auth UI Preview 42502009592](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/42502009592) **passed on retry** following an unrelated interrupted same-URL login navigation; [Playwright + Impeccable screenshot run 42502009625](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/42502009625) **passed**. |
| C4 (limited human-in-chat screenshot review) | [Screenshot artifact 13626450523](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/42502009625/artifacts/13626450523) | **SET-01, SET-02, SET-03 fixed** against the annotated request. Screenshots show aligned 36px selectors, restored Settings icons, open Module menu, and embedded Support / billing at 390px. | Playwright asserts 36px height, control Y alignment, matching icon X position, URL + active section, ticket drill-down, and zero document overflow on targeted routes at 320/390/768/1024/1440px in light/dark. |

**C3:** Not performed; stop after the targeted defects were resolved and C4 evidence reviewed. No official isolated reviewer/fixer subagents or original Magic pixel-diff were run, so design/audit /40 scores remain **unscored**. This fixes the specifically annotated deviations only; it does **not** close original-source visual-parity gate P-04 or certify WCAG conformance.

**Behavior and safety:** The existing SaaS demo portal's content and actions were reused by an `embedded` opt-in without changing backend/API, financial or live tenant code. The original `/app/support` and `/app/subscription` routes remain functional outside Settings. Settings sidebar navigation, Help/plan links and new support ticket detail paths stay in the Settings shell. Offline selling remains on its existing local-preview screen. No merge or deployment authorized.
