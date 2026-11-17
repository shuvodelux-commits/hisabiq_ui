# Backend contract fields: expenses

Field expressions below are source declarations, not a replacement schema. Multiline expressions and inherited `.extend`/`.omit` fields must be read at the immutable source link; defaults/nullability/strictness are defined there. No conversion may drop an unrepresented UI field silently.

| Schema | Field | Source expression |
|---|---|---|
| `expenseCategorySchema` | [id](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L17) | `id: ULID,` |
| `expenseCategorySchema` | [code](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L19) | `code: z.string(),` |
| `expenseCategorySchema` | [name](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L20) | `name: z.string(),` |
| `expenseCategorySchema` | [isSystem](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L21) | `isSystem: z.boolean(),` |
| `expenseCategorySchema` | [status](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L22) | `status: z.enum(['ACTIVE', 'ARCHIVED']),` |
| `expenseCategorySchema` | [spentMinor](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L24) | `spentMinor: z.number().int(),` |
| `saveExpenseCategoryRequestSchema` | [name](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L32) | `name: z.string().trim().min(2).max(60),` |
| `recordExpenseRequestSchema` | [categoryId](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L40) | `categoryId: ULID,` |
| `recordExpenseRequestSchema` | [amountMinor](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L42) | `amountMinor: z.number().int().positive(),` |
| `recordExpenseRequestSchema` | [accountCode](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L44) | `accountCode: z.string().max(60),` |
| `recordExpenseRequestSchema` | [payeePartyId](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L45) | `payeePartyId: ULID.nullable().default(null),` |
| `recordExpenseRequestSchema` | [note](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L46) | `note: z.string().trim().max(500).nullable().default(null),` |
| `recordExpenseRequestSchema` | [businessDate](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L47) | `businessDate: BUSINESS_DATE.optional(),` |
| `recordExpenseRequestSchema` | [backdateReason](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L48) | `backdateReason: z.string().trim().max(300).nullable().default(null),` |
| `voidDocumentRequestSchema` | [version](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L64) | `version: z.number().int().nonnegative(),` |
| `voidDocumentRequestSchema` | [reason](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L65) | `reason: z.string().trim().min(3).max(300),` |
| `correctExpenseRequestSchema` | [version](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L82) | `version: z.number().int().nonnegative(),` |
| `correctExpenseRequestSchema` | [reason](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L83) | `reason: z.string().trim().max(300).nullable().default(null),` |
| `expenseSchema` | [id](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L91) | `id: ULID,` |
| `expenseSchema` | [number](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L92) | `number: z.string(),` |
| `expenseSchema` | [categoryId](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L93) | `categoryId: ULID,` |
| `expenseSchema` | [categoryName](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L94) | `categoryName: z.string(),` |
| `expenseSchema` | [payeePartyId](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L95) | `payeePartyId: ULID.nullable(),` |
| `expenseSchema` | [payeeName](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L96) | `payeeName: z.string().nullable(),` |
| `expenseSchema` | [amountMinor](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L97) | `amountMinor: z.number().int(),` |
| `expenseSchema` | [accountCode](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L98) | `accountCode: z.string(),` |
| `expenseSchema` | [accountName](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L99) | `accountName: z.string().nullable(),` |
| `expenseSchema` | [note](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L100) | `note: z.string().nullable(),` |
| `expenseSchema` | [businessDate](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L101) | `businessDate: BUSINESS_DATE,` |
| `expenseSchema` | [status](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L102) | `status: z.enum(['POSTED', 'VOIDED']),` |
| `expenseSchema` | [entryMode](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L104) | `entryMode: z.string(),` |
| `expenseSchema` | [voidReason](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L105) | `voidReason: z.string().nullable(),` |
| `expenseSchema` | [correctionReason](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L106) | `correctionReason: z.string().nullable(),` |
| `expenseSchema` | [originalBusinessDate](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L108) | `originalBusinessDate: BUSINESS_DATE.nullable(),` |
| `expenseSchema` | [version](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L109) | `version: z.number().int(),` |
| `expenseSchema` | [createdAt](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L110) | `createdAt: z.string(),` |
| `expenseListResponseSchema` | [expenses](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L118) | `expenses: z.array(expenseSchema),` |
| `expenseListResponseSchema` | [nextCursor](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L119) | `nextCursor: z.string().nullable(),` |
| `expenseListResponseSchema` | [totalMinor](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L120) | `totalMinor: z.number().int(),` |
| `expenseListResponseSchema` | [categories](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L122) | `categories: z.array(expenseCategorySchema),` |
