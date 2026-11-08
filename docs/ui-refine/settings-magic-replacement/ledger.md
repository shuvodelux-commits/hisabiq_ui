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
