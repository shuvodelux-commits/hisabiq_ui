# Magic Patterns SaaS Control Center — source-faithful import

- User-provided ZIP SHA-256: `869456cf6fcbdbe736ced14ccba15b03c36eed689081162f025b100c2f046619`.
- Original ZIP was inspected to determine the **88-file SaaS dependency closure**, including all **67 SaaS-specific source files**.
- Files were imported through the connected **Magic Patterns artifact** from the same project. Its source is functionally equivalent but may have different whitespace formatting than the ZIP; this is not a byte-for-byte reproduction.
- The exact precompiled design-system library.js and CSS are reused as Git blobs from the existing repository because their git blob hashes match the ZIP. Existing repo also supplies index.d.ts.
- New entrypoint scopes the Magic SaaS provider to `/#/saas`. The previous `src/saas` remains for rollback and existing tenant portal; only the `/saas` route tree is changed.
- Added a missing type-only `hisabiq-library/settings/model.ts` shim.
- Existing ERP routes, backend code, root theme, and global CSS are unchanged.
- No server backend is in the user ZIP. State is ephemeral, initialized from `createInitialState()`, and resets on refresh. Browser-side staff permissions are demo only.
- **Do not merge or deploy as a production admin panel** until real authentication, server-side tenant isolation, permissions, persistence, payment idempotency and audit are complete.

## Validation required before merge

`npm run build`, `npm run test:saas-magic`, `npm test`, `npm run check:ui-contract`, Playwright light/dark/mobile screenshots and interaction tests. Existing `npm run test:saas` is for the replaced control center and may need migration. Review all failures and post evidence in the PR.
