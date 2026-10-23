# HisabIQ ERP — 36px Universal Control Contract
**Updated:** 2026-10-23 · **Decision:** all regular visible interactive controls have a 36px height across desktop, tablet, and phone. **Scope:** ERP business modules.

## Why this was needed
The source audit of 21 ERP page entrypoints and reusable components found conflicting size rules: `Input` started at 32px, dropdowns at 36px, some page controls used 40px, product forms used 40/44px, and touch media queries forced a 44px minimum. Party ledger Clear filters/Print statement and Sales Columns/More highlighted this inconsistency. Independent page-local patches were not durable because CSS sizing rules competed with one another.

## Canonical rule
One token in `src/index.css`: `--erp-control-height: 36px`.

| Control | Height | Coverage |
| --- | --- | --- |
| Primary / outline / secondary / small / icon-only buttons | **36px** | Same visual height, independent of action priority |
| Plain/search/number/date input and textarea-like single-line field | **36px** | Use shared Input / NumericInput; multiline textareas grow naturally |
| AppSelect / SearchSelect / FormSelect / date picker trigger | **36px** | Keyboard, quick-add and dropdown navigation unchanged |
| Combined money/unit or quantity editor | **36px outer shell** | Child editors fill shell, not independent focus rings |
| Dropdown option row | **36px** | Popup remains scrollable |
| Party Ledger / Sales filter toolbar | **36px** | Includes Clear filters, Print statement, Columns, More and search |
| Product editor fields and Save/Cancel | **36px** | No 40/44px per-device enlargement |
| Mobile / tablet pointer controls | **36px** | No separate 44px visual height |

**Functional exceptions:** multi-line textarea, calendar day grid, numeric stepper's two half-height arrows, checkbox/radio inputs, slider thumbs, calculator keys, and drag handles are not ordinary peer form controls. Cart grids preserve their layout and business behavior; their ordinary shared input and button controls still follow 36px. These exceptions are not a renewed priority-based button hierarchy.

## Root causes and corrections
1. **32px input vs 36px select:** shared Input adopts the 36px baseline.
2. **Touch CSS vs desktop CSS:** remove 40/44px global touch control inflation and use a single 36px token.
3. **Product form independent token:** `--ctl-h` now resolves to `--erp-control-height` at every breakpoint.
4. **Party ledger action stretch:** Clear filters and Print statement now use the same h-9 class and non-stretch alignment as adjacent filters.
5. **Sales toolbar drift:** native 32px Columns trigger uses shared Button, while phone Sales More uses a 36px square control.
6. **Dialog portals:** include regular dialog hosts in the same shared sizing scope.
7. **Tests:** cheap source contract in `npm run check:ui-contract`; read-only `npm run test:field-size-parity` across 22 ERP routes at phone/tablet/desktop sizes, plus `npm run test:field-alignment`.

## Validation and accessibility
36px is a **visual control height**. It is smaller than the often-recommended 44px touch target, so button spacing and accessible touch hit areas should be checked at phone sizes. Do not reintroduce taller visible buttons automatically to solve this; instead improve spacing or hit area without visual enlargement where possible. All focus/invalid states, keyboard navigation, Bangla labels and money/stock interactions must remain intact.

**Status:** Source changes have been committed to draft PR #198. Browser size tests must be executed against a running checkout, with screenshots for light/dark and Bangla/English. Not yet certified pixel-perfect.
