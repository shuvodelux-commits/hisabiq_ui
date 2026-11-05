# Daybook and ERP motion parity with Sabab SIS

Reference: Sabab SIS Magic Patterns editor kecprgln6zfkctsc37g2to, active artifact 0fdd761a-0c9e-4e22-9d6b-4fb248e73b14. The source files utils/motion.ts and components/layout/AppShell.tsx were read.

Scope:
- Daybook advanced filters currently show/hide without motion. Use source-matched reveal opacity and vertical offset with 180ms enter and 120ms exit; no height/width animations.
- The ERP AppShell currently has no module-entrance animation. Use source-matched one-time module entry opacity and 10px offset at 280ms. Tab and query changes must not restart it.
- Preserve all existing routes, components, filters, reset actions, focus handling, tables, menus and transactions.
- Reduce or disable the motion for users with reduced-motion preference.
- Shared motion variants may be reused by future, separately scoped modules.
- Verify normal and reduced-motion interactions and current responsive behavior through GitHub CI/Playwright at 320, 390, 768, 1024, and 1440 pixels in both themes.
- One draft PR; no automatic merge.
