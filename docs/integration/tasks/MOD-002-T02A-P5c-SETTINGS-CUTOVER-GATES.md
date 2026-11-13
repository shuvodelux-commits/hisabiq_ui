# MOD-002 T02A/P5c — Product Settings connected-mode cutover gates

**Status:** Backend contracts partially available; **full connected Product Settings activation BLOCKED**. This is an evidence-based, reviewable contract and testing artifact, **not a production rollout instruction or authorization**.

**Pinned sources at dispatch (2026-11-13):** Frontend `hisabiq_ui/main@2ed77d50e8638fea8986e8e1dbe0597b06f98d57`, after merged [PR #514](https://github.com/shuvodelux-commits/hisabiq_ui/pull/514); backend accepted metadata CREATE/GET/PATCH from [PR #90](https://github.com/shuvodelux-commits/nestshererp/pull/90), merge `408cced24662f9c77cce2d2cd2cfcd10247232f3`. Backend adoption branch may advance independently; inspect its latest source and CI again before any new build or cutover. Earlier disposable PostgreSQL two-tenant acceptance in backend [PR #76](https://github.com/shuvodelux-commits/nestshererp/pull/76) was merged. No production environment or retained tenant was inspected by this task.

## Source audit — current React actions vs Nest contracts

| Existing source / UI behavior | Verified backend capability | Classification | Exact live cutover condition |
|---|---|---|---|
| Product Settings Categories/Brands/Units list has English and Bangla names | Strict versioned GET `/api/v1/catalog/metadata-v1` returns `id,name,nameBn,version`, unit `symbol`, category `parentId` for **non-archived** rows | REUSE for active read | Verified authenticated session, per-tenant schema rollout, authorized GET; no fixture fallback |
| Add Unit with English, Bangla and short symbol in one form | Versioned atomic POST `/metadata-v1/units` inserts all fields in one transaction | REUSE server contract; ADAPT React form | Gate by verified session + `catalog.unit.manage`; preserve draft/focus on errors; server-issued ID only |
| Add Brand with English and Bangla | Atomic `POST /metadata-v1/brands` | REUSE server contract; ADAPT React form | Same plus `catalog.brand.manage`; no second metadata PATCH |
| Add Category with English and Bangla | Atomic `POST /metadata-v1/categories` requires `parentId:null|ULID` | REUSE for top-level; EXTEND UI for nested | Existing Add Category does not select parent; never infer parent from names or create a nested category as a top-level fallback |
| Edit English + Bangla name in **one** Save dialog | Metadata-v1 PATCH edits `nameBn` (and unit symbol), **not English name**; legacy PATCH edits English only | **BLOCKED** | Design and two-tenant test a single atomic, versioned, permission-checked edit that updates both together; never chain two HTTP saves |
| Edit unit symbol + Bangla only | Versioned unit metadata PATCH supports omitted/explicit-null and `expectedVersion` | REUSE server contract | Keep fresh row version and preserve no-op/required symbol semantics in UI; 409 keeps user draft |
| Active / Inactive row toggle | Metadata-v1 GET only lists non-archived rows; legacy remove may archive/delete | **BLOCKED** | A reversible activate/deactivate and inactive-list contract with tenancy, linked-product constraints and audit; delete is not deactivate |
| Product count per category, brand and unit | No usage count in metadata-v1 response | **BLOCKED** | Server-authoritative count or distinguish clearly unknown; never render invented 0 or preview counts for live tenant |
| Unit `Base` vs `Compound-ready` chip | Metadata-v1 returns symbol but not unit kind or conversion eligibility | **BLOCKED** | Explicit backend contract matching product unit-profile semantics, not name/symbol heuristics |
| Defaults tab; business default unit/serial/lot settings | UI reads `TenantSettingsProvider`; metadata-v1 `features` are not those defaults | **KEEP EXISTING** | Separate approved settings contract and state; do not substitute catalog feature flags |
| Nested quick-add from a half-filled product draft | HisabIQ draft/focus path exists; backend catalog masters are atomic but product multi-unit shape remains an integration gap | EXTEND/ BLOCKED | Preserve draft snapshot, keyboard focus, selected server ID, 403/409/network reconciliation; do not flatten multi-level conversions |

**Additional note:** The existing Product Settings preview uses synthetic IDs, local activation, fixture usage counts and `Base/Compound-ready` values. They must not be passed through to a real tenant or represented as server-confirmed fields. Full connected Product Settings should retain the same visual layout and all actions, with accurate availability states; removing the functionality to fit a narrower endpoint is unacceptable.

## Implemented in P5c (no UI activation)

- `src/integration/catalog-product-settings-projection.ts` revalidates a strict versioned response, projects real master IDs, explicit nullable Bangla/symbol fields and versions, and preserves parent IDs with `root/present/unresolved` status.
- Usage and reversible active state are `null` (unknown); unit classification is `null`; no defaults or tenant ID are invented.
- `contracts` describes **source-level API capability only**, not runtime tenant entitlements, permissions, migration availability or product workflow approval.
- `canMountFullConnectedEditor` stays `false` and names exact blockers; no Product Settings screen imports this helper.
- Focused tests enforce these invariants even if a future fixture or decoder adds misleading synthetic fields.

## Gates before enabling real connected Product Settings

1. **Environment authorization:** Decide which disposable/staging tenant is the acceptance target; separately approve any deployment/migration. P5c does not touch PostgreSQL, production data, releases or live tenants.
2. **Database readiness:** Confirm migration `0055_catalog_metadata_v1.sql` applied to that authorized target only, catalog metadata columns present on existing master rows, FORCE RLS effective for unprivileged app role, and tenant A/B isolation; use backend PG16 acceptance as a baseline, not proof for an uninspected environment.
3. **Contract gaps:** Add atomic English+Bengali rename, reversible status/inactive roster, product usage, unit classification, nested category parent selection and separate defaults mapping **before claiming full UI parity**. Validate optimistic 409, 401/403, unknown tenant 404, duplicate names, archive constraints and audit/outbox rollback.
4. **Session and feature gates:** Mount only for an authenticated, current `SessionStore` tenant/epoch/token, verified `/me` permissions and an explicitly approved per-tenant rollout capability. A metadata GET 200 alone is **not** authorization to switch UI.
5. **Draft and UI fidelity:** Keep current compact 36px controls, Bangla input, categories/brands/units/defaults tabs, status/action menu, edit dialog, keyboard focus, nested Quick Add and existing Products/POS behaviors. An API failure must **not** display preview fixtures or claim a save; ambiguous POST/PATCH requires re-read and reconciliation, not automatic retry.
6. **Accept on actual React + Nest:** Browser E2E for creating and editing each kind, duplicate and stale races, role revocation after load, tenant switching during a pending write, unknown parent, backend failure, touch/mobile, keyboard, bilingual input, dark/light, complete draft preservation and safe rollback/readiness-disable.
7. **Rollback:** Disable connected catalog UI rollout without deleting schema columns, audit history or master rows. Any data migration/rollback is a separately reviewed operation, never automatic. Do not down-migrate if that would lose data.

## Explicit exclusions

No backend contract/schema changes; no production migration; no React Product Settings activation; no advanced unit conversion/product pricing, stock, POS/cart, purchases, sales, cash session or accounting behavior changes. Keep unsupported work visibly recorded rather than silently dropping an existing UI capability.

**Review question for the next scoped task:** Do we implement atomic full English+Bengali catalog rename first, followed by lifecycle/status/read parity, or stage a separately labelled connected read-only view that cannot replace or impersonate the existing full editor? This P5c artifact does **not** decide or activate either path.
