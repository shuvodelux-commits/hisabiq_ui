# Backend contract fields: management

Field expressions below are source declarations, not a replacement schema. Multiline expressions and inherited `.extend`/`.omit` fields must be read at the immutable source link; defaults/nullability/strictness are defined there. No conversion may drop an unrepresented UI field silently.

| Schema | Field | Source expression |
|---|---|---|
| `managementLicenceRequestSchema` | [key](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/management.ts#L19) | `key: z.string().min(1).max(8192),` |
| `managementFlagsRequestSchema` | [flags](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/management.ts#L26) | `flags: z.array(z.object({ key: z.string().max(64), enabled: z.boolean() })).max(200),` |
| `managementSupportSessionRequestSchema` | [session_id](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/management.ts#L42) | `session_id: z.string().max(64),` |
| `managementSupportSessionRequestSchema` | [operator_name](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/management.ts#L43) | `operator_name: z.string().max(120),` |
| `managementSupportSessionRequestSchema` | [reason](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/management.ts#L44) | `reason: z.string().max(500),` |
| `managementSupportSessionRequestSchema` | [issued_at](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/management.ts#L45) | `issued_at: z.string().max(40),` |
| `managementSupportSessionRequestSchema` | [expires_at](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/management.ts#L46) | `expires_at: z.string().max(40),` |
