# POS ProductCombobox — remaining custom dropdown motion

**Reference:** merged Sabab-motion PR #260 and `docs/ui/SABAB-INTERACTION-MOTION.md`. **Route for baseline:** `#/app/pos`. **Scope:** `src/components/pos/ProductCombobox.tsx` only, with test and evidence. GitHub-only draft PR.

## C0 source audit
- **Already animated:** standard `AppSelect` / `FormSelect`, calendars, `SearchSelect` / `QuickAddSelect`, `FloatingPanel` (Action, customer, drafts, template), shared switches and segmented controls. Do not double animate them.
- **Missing:** the POS-style product suggestion list renders directly through `createPortal(<ul role=listbox>)` without motion. It is reused by Sales, Purchases, Quotation and other `ProductCombobox` consumers.
- The existing list has critical keyboard shortcuts (Enter, arrows, Escape), stock/cost/offer/unit detail, async responsive positioning, scroll repositioning and an authorized mobile-header clearance. **Preserve all**.

## Required fix
1. Animate the existing listbox **only**, with Sabab popup fade/scale/±4px at 140ms, and 90–120ms exit; no layout/size animation, no new wrapper changing list semantics.
2. Motion direction follows upward-opening vs downward-opening list, with appropriate transform origin; keep the portal, listRef and existing measured position bounds. Avoid a flash at top-left before position calculation.
3. Reduced-motion mode skips entrance and exit effects.
4. Escape closes without selecting; Enter selects one real product, ArrowUp/Down retain selection; outside click closes; fast reopen, scrolling and mobile navigation work. Preserve purchase mode and New product action; no sale/stock mutation.
5. Real Playwright at 320/390/768/1024/1440px in both light/dark and normal/reduced, verify visible frames, bounds, keyboard and absence of runtime errors.
6. Document other custom controls found but do not modify unrelated screens in this PR. One module at a time. Draft/unmerged; no backend/deploy.
