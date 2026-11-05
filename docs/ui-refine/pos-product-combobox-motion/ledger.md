# POS/Purchase product suggestions — Sabab motion audit (C0–C4)

**Route:** `#/app/pos` (also exercised in `#/app/purchases/new`). **PR:** #262. **Source reference:** merged Sabab motion PR #260, `docs/ui/SABAB-INTERACTION-MOTION.md`, and existing app `FloatingPanel` animation. **Implementation head:** `1a2f40f684c1c22ba593f9f5d75ee0a768b9e984`.

## C0 — inspected remaining controls
| Control type | Actual source | Finding and disposition |
| --- | --- | --- |
| Standard select | `AppSelect`, `FormSelect` | Already animated after #260; do not add a second effect |
| Searchable master dropdown | `SearchSelect`, `QuickAddSelect` | Already animated, including phone sheet; untouched |
| Customer, drafts, templates, purchases drafts, theme and row Actions | `FloatingPanel` consumers | Already animated via shared popover; untouched |
| Shared on/off and segmented | `Switch`, `products/fields/SegmentedControl`, Daybook segmented switch | Already animated in #260; untouched |
| **POS-style product search** | `src/components/pos/ProductCombobox.tsx` | Previously portal-mounted an instant `ul[role=listbox]`; targeted gap fixed |
| Native browser select, custom one-off/third-party control | Other/independent sources | Not certified as complete here; review per module if discovered |

## C1 — targeted implementation
- Kept the existing `role=listbox` `ul` and `listRef` and added `AnimatePresence` + `motion.ul` using the shared `sababEase.out` token.
- Popup enters/exits with 140ms opacity/scale/small vertical travel. Upward and downward layouts retain their measured transform origin. No animation of row sizes, width, maxHeight, table geometry or stock values.
- The last measured position stays available for the exit phase; it is cleared only once exit ends, avoiding an instantaneous flash to the screen corner.
- `prefers-reduced-motion: reduce` skips positional movement and fade with zero-duration transition.
- Product filtering, bilingual names, SKU, bundle stock, expiry and offer details, existing keyboard Enter/Arrow/Escape, outside dismissal, purchase/quotation modes and create-new actions are unchanged. No transaction is posted by opening the list.

## C2–C3 — real browser and static screenshots
- [Screenshot workflow 42006711469](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/42006711469) **SUCCESS**. Captured **40** before/after PNG files: default POS and actual open product-list states at 320/390/768/1024/1440 in light/dark.
- [Focused test log](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/42006711469) **10/10 PASS**, including Sale mode in all cases and Purchase mode at selected widths; verifies real intermediate opacity and transform samples with normal motion, immediate visibility with reduced motion, viewport bounds, keyboard ArrowDown/Escape, focus and fast reopen. The exact log is saved as `pos-product-combobox-motion-playwright.log` in the run artifact.
- Visually inspected actual after screenshots at **320px light**, **768px dark**, **1440px light**. The product suggestions stay within viewport and do not overlap mobile navigation. The presentation, item information, cart and checkout remain recognizably HisabIQ. Static screenshots verify geometry; the Playwright frame samples verify animation itself.
- Official pinned Impeccable **mechanical** source detector returned `[]`, exit 0. This is not an independent staffed visual audit.

## C4 — final checks and scope
- [Fast CI 42006711587](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/42006711587) **SUCCESS**: TypeScript, ESLint, UI contracts, unit tests, production build and repository smoke/browser regressions.
- **Fixed:** unanimated POS/Purchase product suggestions. **Preserved:** previously animated shared components, mobile header clearance, listbox semantics, business logic and keyboard loop.
- **Not claimed:** native OS select popup animation, every future custom dropdown, a full accounting E2E audit, native independently staffed `/ui-refine-loop` agents, or an invented design score.

**Finish:** bounded scope verified; draft PR left open and **unmerged** for owner review. No backend/deployment changes.
