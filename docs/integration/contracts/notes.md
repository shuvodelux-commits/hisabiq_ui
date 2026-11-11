# Backend contract fields: notes

Field expressions below are source declarations, not a replacement schema. Multiline expressions and inherited `.extend`/`.omit` fields must be read at the immutable source link; defaults/nullability/strictness are defined there. No conversion may drop an unrepresented UI field silently.

| Schema | Field | Source expression |
|---|---|---|
| `createNoteRequestSchema` | [title](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/notes.ts#L12) | `title: z.string().min(1).max(200),` |
| `createNoteRequestSchema` | [amountMinor](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/notes.ts#L13) | `amountMinor: z.number().int(),` |
| `createNoteRequestSchema` | [businessDate](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/notes.ts#L14) | `businessDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'businessDate must be YYYY-MM-DD'),` |
| `noteResponseSchema` | [id](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/notes.ts#L22) | `id: z.string().length(26),` |
| `noteResponseSchema` | [noteNumber](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/notes.ts#L23) | `noteNumber: z.string(),` |
| `noteResponseSchema` | [title](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/notes.ts#L24) | `title: z.string(),` |
| `noteResponseSchema` | [amountMinor](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/notes.ts#L25) | `amountMinor: z.number().int(),` |
| `noteResponseSchema` | [businessDate](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/notes.ts#L26) | `businessDate: z.string(),` |
| `noteResponseSchema` | [entryMode](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/notes.ts#L27) | `entryMode: z.enum(['ON_TIME', 'LATE_ENTRY', 'BACKDATED', 'CORRECTED']),` |
| `noteResponseSchema` | [status](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/notes.ts#L28) | `status: z.enum(['DRAFT', 'POSTED', 'VOIDED']),` |
