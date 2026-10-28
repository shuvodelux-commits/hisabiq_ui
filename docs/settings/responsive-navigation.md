# Settings navigation — Party breakpoint alignment

The user-approved responsive design uses Party's existing viewport rules, not an 800px cutoff.

| Band | Source | Settings behavior |
| --- | --- | --- |
| Phone: below 768px | `Parties.tsx` tablet query; Tailwind `md` | Scrollable underline main/sub-tabs; stacked controls and fields. |
| Tablet: 768–1023px | `Parties.tsx`; `PartyDetailResponsive.tsx` | Compact underline tabs; fields may use two readable columns. |
| Desktop: at least 1024px | `PartyDetailAdaptive.tsx`; Tailwind `lg` | Main tabs above; sub-settings list left and editor right where sub-settings exist. |

Party's 900px content adjustments and 1280px directory sizing are local fit rules, not additional device bands. Reuse `useMediaQuery`, `MotionTabList`, `MotionTabIndicator` and existing Settings controls. Keep one editor mounted across viewport changes so resizing never discards drafts or changes permissions.

Implementation: selected section title at the top; remove the section dropdown and category disclosure; compact preview/employee/mode controls; business and invoice sub-pages and existing employee/role tabs use responsive navigation. Sections without sub-pages retain full editor width. Search must reveal the right sub-page, and parent Save validates the complete draft.

Verification: inspect both sides of 768px and 1024px, plus 799/800px to reject the previous assumption; check long Bangla, light/dark, keyboard tabs, horizontal scrolling, unsaved changes and draft preservation during resize. Update existing navigation/browser checks and the design guide.

Main tabs retain keyboard focus after route changes, including navigation resumed through the dirty guard. Selected horizontal tabs remain visible after resizing and language changes. Nested-tab changes keep the section draft; shared Save validates every sub-page.
