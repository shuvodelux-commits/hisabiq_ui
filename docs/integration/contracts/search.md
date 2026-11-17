# Backend contract fields: search

Field expressions below are source declarations, not a replacement schema. Multiline expressions and inherited `.extend`/`.omit` fields must be read at the immutable source link; defaults/nullability/strictness are defined there. No conversion may drop an unrepresented UI field silently.

| Schema | Field | Source expression |
|---|---|---|
| `globalSearchQuerySchema` | [q](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/search.ts#L42) | `q: z.string().trim().min(1).max(80),` |
| `globalSearchQuerySchema` | [limit](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/search.ts#L44) | `limit: z.coerce.number().int().min(1).max(10).optional(),` |
| `globalSearchHitSchema` | [kind](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/search.ts#L61) | `kind: globalSearchKindSchema,` |
| `globalSearchHitSchema` | [id](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/search.ts#L62) | `id: z.string(),` |
| `globalSearchHitSchema` | [title](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/search.ts#L63) | `title: z.string(),` |
| `globalSearchHitSchema` | [subtitle](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/search.ts#L65) | `subtitle: z.string().nullable(),` |
| `globalSearchHitSchema` | [amountMinor](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/search.ts#L66) | `amountMinor: z.number().int().nullable(),` |
| `globalSearchHitSchema` | [date](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/search.ts#L68) | `date: z.string().nullable(),` |
| `globalSearchGroupSchema` | [kind](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/search.ts#L73) | `kind: globalSearchKindSchema,` |
| `globalSearchGroupSchema` | [label](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/search.ts#L75) | `label: z.string(),` |
| `globalSearchGroupSchema` | [hits](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/search.ts#L76) | `hits: z.array(globalSearchHitSchema),` |
| `globalSearchResponseSchema` | [data](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/search.ts#L81) | `data: z.object({` |
| `globalSearchResponseSchema` | [groups](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/search.ts#L83) | `groups: z.array(globalSearchGroupSchema),` |
