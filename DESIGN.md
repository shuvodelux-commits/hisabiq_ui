# HisabIQ — existing UI design context

This document guides the Impeccable agent. It **does not** define a new design system. The authoritative and complete design specification is [docs/ui/HISABIQ-DESIGN-GUIDE.md](docs/ui/HISABIQ-DESIGN-GUIDE.md) and the mandatory [AGENTS.md](AGENTS.md). For targeted visual refinement, also read [docs/design/taste.md](docs/design/taste.md).

## Design identity
- Product: compact, low-friction bilingual ERP for Bangladeshi shops, built in React, Tailwind and existing shadcn-style primitives.
- Reuse actual shared `Button`, `Input`, `AppSelect`, `Dialog`, `Table`, POS cart and Party Ledger conventions; do not create parallel versions.
- Maintain the approved blue/teal theme and light/dark contrast. Geist and Hind Siliguri are the approved font family.
- Standard form controls are 36px high, terminal transaction actions 48px only where explicitly contracted. Shared button/input radius: 0.375rem.
- Tables: 13px data, 12px headers, 11px helpers, right-aligned monetary values. Support small phones, tablets, desktop and bilingual text.
- Preserve keyboard navigation, focus handling, touch operation, multi-unit lines and every existing backend-independent interaction.
- Remove clutter and redundant help text before adding any effects. No fake financial postings or decorative AI-style gradients.

## Authority and review
Current owner decision > [AGENTS.md](AGENTS.md) and narrower contracts > [HisabIQ Design Guide](docs/ui/HISABIQ-DESIGN-GUIDE.md) > existing approved React UI.

For UI polish, visually compare light/dark and phone/desktop before and after, run project tests, disclose missing evidence, and submit a draft GitHub PR only. No changes to accounting, inventory, auth, backend or persistence on the authority of Impeccable alone.
