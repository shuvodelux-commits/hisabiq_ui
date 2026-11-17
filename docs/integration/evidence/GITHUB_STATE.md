# GitHub state observed 2026-11-11

Read-only snapshot, not a live reservation. No issue or PR was changed. PR metadata was obtained through the connected GitHub account; source checkouts are public read-only clones. Later source changes require reconciliation.

## Open pull requests

| Repo | PR | Head SHA | Base branch | Draft | Title |
|---|---|---|---|---|---|
| backend | [#16](https://github.com/shuvodelux-commits/nestshererp/pull/16) | `913fedc7e9919cce72a81af5a2131ff3a05fad96` | `chore/hisabiq-adoption-runtime-a01` | True | 🛡️ [fix] cash-session: enforce optional-day safeguards |
| frontend | [#282](https://github.com/shuvodelux-commits/hisabiq_ui/pull/282) | `62b6576842252fdd94a3f42e625c89e64fcaa792` | `main` | False | feat(cash): adopt NestSherERP cash sessions without redesigning HisabIQ UI |
| frontend | [#279](https://github.com/shuvodelux-commits/hisabiq_ui/pull/279) | `0c36243887c5679d19412703fcee3e92c94275be` | `main` | True | ui: refine Settings — compact layout and keyboard accessibility |
| frontend | [#277](https://github.com/shuvodelux-commits/hisabiq_ui/pull/277) | `c998a8d2d09080d937ff028db0261d65eca88cfd` | `fix/settings-restore-live-controls` | True | ✨ [feat] settings: restore safe Data & Backup workflows |
| frontend | [#276](https://github.com/shuvodelux-commits/hisabiq_ui/pull/276) | `04890bdc75523936b1258ed14c5547fb4ed03987` | `docs/settings-functional-migration-design-2026-11-09` | True | 📝 [docs] settings: audit functional migration readiness |
| frontend | [#275](https://github.com/shuvodelux-commits/hisabiq_ui/pull/275) | `f61ab6e3900036d0c57227d0fe3af8ac44a52dec` | `main` | True | docs(settings): Superpowers functional migration design (preserve new UI) |
| frontend | [#274](https://github.com/shuvodelux-commits/hisabiq_ui/pull/274) | `fc9780ded7217dcdd2d60eb645e691ae332f7b79` | `main` | True | fix(settings): restore previous functional controls inside new Settings UI |
| frontend | [#264](https://github.com/shuvodelux-commits/hisabiq_ui/pull/264) | `b25467032434267dafe4259a103db6726bd495a0` | `main` | True | ui(pos): three-round POS V2 compact full-screen refinement |

## Workflow and execution facts

- Backend issue3 tracks multi-environment workflow; issue14 and draft PR16 concern cash-setting safeguards; frontend issue281 and PR282 concern existing cash UI adoption. These are not reservations for this blueprint.
- Checked-in `.claude/super-board/configs/hisabiq-nest-adoption.json`: Project owner shuvodelux-commits, number2; base chore/hisabiq-adoption-runtime-a01; max_workers1; human_approves_merge true; automatic line threshold400; migration allowed_envs empty; worker_backend workflow; host codex.
- Live Project v2 item states, coordinator reservation, actual runner readiness, local installed CLI capabilities and active Cloud environment are NOT VERIFIED. The exposed GitHub tools did not include Project v2 query/mutation or atomic reservation. Do not interpret a checked-in setting as an active process.
- Backend PR16 body reports independent QA and 57 integration tests for its candidate. These are author/reviewer statements, not tests repeated in this planning session. PR remains unmerged in observed metadata.
- Frontend main changed since historic base SHAs recorded on some PR metadata; fresh clone SHA is used here. PR base.sha is not assumed to equal current branch HEAD.
- Backend main is not the adoption baseline. Documentation-only publishing location proposed: frontend `docs/integration/`, with immutable cross-repository links; no publication performed here.
