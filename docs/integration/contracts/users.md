# Backend contract fields: users

Field expressions below are source declarations, not a replacement schema. Multiline expressions and inherited `.extend`/`.omit` fields must be read at the immutable source link; defaults/nullability/strictness are defined there. No conversion may drop an unrepresented UI field silently.

| Schema | Field | Source expression |
|---|---|---|
| `createUserRequestSchema` | [displayName](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/users.ts#L13) | `displayName: z.string().min(1).max(120),` |
| `createUserRequestSchema` | [username](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/users.ts#L14) | `username: z.string().min(3).max(50),` |
| `createUserRequestSchema` | [identifier](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/users.ts#L16) | `identifier: z.string().min(1).max(120),` |
| `createUserRequestSchema` | [roleId](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/users.ts#L17) | `roleId: z.string().length(26),` |
| `createUserRequestSchema` | [confirmPassword](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/users.ts#L18) | `confirmPassword: z.string().min(1).max(200),` |
| `updateUserRequestSchema` | [displayName](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/users.ts#L26) | `displayName: z.string().min(1).max(120),` |
| `updateUserRequestSchema` | [roleId](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/users.ts#L27) | `roleId: z.string().length(26),` |
| `updateUserRequestSchema` | [confirmPassword](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/users.ts#L29) | `confirmPassword: z.string().min(1).max(200).optional(),` |
| `setUserDisabledRequestSchema` | [disabled](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/users.ts#L37) | `disabled: z.boolean(),` |
| `setUserDisabledRequestSchema` | [confirmPassword](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/users.ts#L38) | `confirmPassword: z.string().min(1).max(200),` |
| `userResponseSchema` | [id](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/users.ts#L47) | `id: z.string().length(26),` |
| `userResponseSchema` | [username](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/users.ts#L48) | `username: z.string(),` |
| `userResponseSchema` | [displayName](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/users.ts#L49) | `displayName: z.string(),` |
| `userResponseSchema` | [email](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/users.ts#L50) | `email: z.string().nullable(),` |
| `userResponseSchema` | [phone](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/users.ts#L51) | `phone: z.string().nullable(),` |
| `userResponseSchema` | [roleId](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/users.ts#L52) | `roleId: z.string().length(26),` |
| `userResponseSchema` | [roleName](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/users.ts#L53) | `roleName: z.string(),` |
| `userResponseSchema` | [disabled](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/users.ts#L54) | `disabled: z.boolean(),` |
| `userResponseSchema` | [hasPassword](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/users.ts#L56) | `hasPassword: z.boolean(),` |
| `roleSummarySchema` | [id](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/users.ts#L64) | `id: z.string().length(26),` |
| `roleSummarySchema` | [code](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/users.ts#L65) | `code: z.string(),` |
| `roleSummarySchema` | [name](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/users.ts#L66) | `name: z.string(),` |
| `userListResponseSchema` | [users](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/users.ts#L79) | `users: z.array(userResponseSchema),` |
| `userListResponseSchema` | [roles](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/users.ts#L80) | `roles: z.array(roleSummarySchema),` |
