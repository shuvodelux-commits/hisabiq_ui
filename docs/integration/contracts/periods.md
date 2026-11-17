# Backend contract fields: periods

Field expressions below are source declarations, not a replacement schema. Multiline expressions and inherited `.extend`/`.omit` fields must be read at the immutable source link; defaults/nullability/strictness are defined there. No conversion may drop an unrepresented UI field silently.

| Schema | Field | Source expression |
|---|---|---|
| `periodSchema` | [period](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/periods.ts#L14) | `period: z.string().regex(/^\d{4}-\d{2}$/),` |
| `periodSchema` | [year](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/periods.ts#L15) | `year: z.number().int(),` |
| `periodSchema` | [month](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/periods.ts#L16) | `month: z.number().int(),` |
| `periodSchema` | [status](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/periods.ts#L17) | `status: z.enum(['OPEN', 'CLOSED']),` |
| `periodSchema` | [entryCount](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/periods.ts#L19) | `entryCount: z.number().int(),` |
| `periodSchema` | [closedAt](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/periods.ts#L20) | `closedAt: z.string().nullable(),` |
| `periodSchema` | [closedByName](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/periods.ts#L21) | `closedByName: z.string().nullable(),` |
| `periodSchema` | [isCurrent](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/periods.ts#L23) | `isCurrent: z.boolean(),` |
| `closePeriodRequestSchema` | [year](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/periods.ts#L37) | `year: z.number().int().min(2000).max(2999),` |
| `closePeriodRequestSchema` | [month](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/periods.ts#L38) | `month: z.number().int().min(1).max(12),` |
| `closePeriodRequestSchema` | [note](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/periods.ts#L39) | `note: z.string().trim().max(300).nullable().default(null),` |
