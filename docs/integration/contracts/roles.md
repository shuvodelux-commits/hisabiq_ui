# Backend contract fields: roles

Field expressions below are source declarations, not a replacement schema. Multiline expressions and inherited `.extend`/`.omit` fields must be read at the immutable source link; defaults/nullability/strictness are defined there. No conversion may drop an unrepresented UI field silently.

| Schema | Field | Source expression |
|---|---|---|
| `refundLimitsSchema` | [cashRefundPerReturnMinor](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/roles.ts#L24) | `cashRefundPerReturnMinor: z.number().int().nonnegative().nullable(),` |
| `refundLimitsSchema` | [cashRefundPerDayMinor](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/roles.ts#L25) | `cashRefundPerDayMinor: z.number().int().nonnegative().nullable(),` |
| `createRoleRequestSchema` | [name](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/roles.ts#L33) | `name: z.string().min(2).max(60),` |
| `createRoleRequestSchema` | [permissions](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/roles.ts#L34) | `permissions: z.array(z.string().max(80)).max(200),` |
| `createRoleRequestSchema` | [cashRefundPerReturnMinor](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/roles.ts#L35) | `cashRefundPerReturnMinor: z.number().int().nonnegative().nullable().default(null),` |
| `createRoleRequestSchema` | [cashRefundPerDayMinor](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/roles.ts#L36) | `cashRefundPerDayMinor: z.number().int().nonnegative().nullable().default(null),` |
| `createRoleRequestSchema` | [confirmPassword](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/roles.ts#L37) | `confirmPassword: z.string().min(1).max(200),` |
| `updateRoleRequestSchema` | [name](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/roles.ts#L45) | `name: z.string().min(2).max(60),` |
| `updateRoleRequestSchema` | [permissions](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/roles.ts#L46) | `permissions: z.array(z.string().max(80)).max(200),` |
| `updateRoleRequestSchema` | [cashRefundPerReturnMinor](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/roles.ts#L47) | `cashRefundPerReturnMinor: z.number().int().nonnegative().nullable().default(null),` |
| `updateRoleRequestSchema` | [cashRefundPerDayMinor](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/roles.ts#L48) | `cashRefundPerDayMinor: z.number().int().nonnegative().nullable().default(null),` |
| `updateRoleRequestSchema` | [confirmPassword](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/roles.ts#L49) | `confirmPassword: z.string().min(1).max(200),` |
| `roleDetailSchema` | [id](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/roles.ts#L63) | `id: z.string().length(26),` |
| `roleDetailSchema` | [code](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/roles.ts#L64) | `code: z.string(),` |
| `roleDetailSchema` | [name](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/roles.ts#L65) | `name: z.string(),` |
| `roleDetailSchema` | [isSystem](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/roles.ts#L67) | `isSystem: z.boolean(),` |
| `roleDetailSchema` | [locked](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/roles.ts#L72) | `locked: z.boolean(),` |
| `roleDetailSchema` | [permissions](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/roles.ts#L73) | `permissions: z.array(z.string()),` |
| `roleDetailSchema` | [cashRefundPerReturnMinor](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/roles.ts#L74) | `cashRefundPerReturnMinor: z.number().int().nullable(),` |
| `roleDetailSchema` | [cashRefundPerDayMinor](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/roles.ts#L75) | `cashRefundPerDayMinor: z.number().int().nullable(),` |
| `roleDetailSchema` | [userCount](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/roles.ts#L77) | `userCount: z.number().int(),` |
| `permissionDescriptorSchema` | [code](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/roles.ts#L85) | `code: z.string(),` |
| `permissionDescriptorSchema` | [group](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/roles.ts#L86) | `group: z.string(),` |
| `permissionDescriptorSchema` | [label](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/roles.ts#L87) | `label: z.string(),` |
| `permissionDescriptorSchema` | [detail](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/roles.ts#L88) | `detail: z.string(),` |
| `roleListResponseSchema` | [roles](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/roles.ts#L101) | `roles: z.array(roleDetailSchema),` |
| `roleListResponseSchema` | [catalogue](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/roles.ts#L102) | `catalogue: z.array(permissionDescriptorSchema),` |
