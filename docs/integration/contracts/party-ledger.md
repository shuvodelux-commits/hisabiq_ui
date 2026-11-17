# Backend contract fields: party-ledger

Field expressions below are source declarations, not a replacement schema. Multiline expressions and inherited `.extend`/`.omit` fields must be read at the immutable source link; defaults/nullability/strictness are defined there. No conversion may drop an unrepresented UI field silently.

| Schema | Field | Source expression |
|---|---|---|
| `partyLedgerRowSchema` | [journalEntryId](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/party-ledger.ts#L26) | `journalEntryId: ULID,` |
| `partyLedgerRowSchema` | [journalLineId](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/party-ledger.ts#L27) | `journalLineId: ULID,` |
| `partyLedgerRowSchema` | [businessDate](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/party-ledger.ts#L28) | `businessDate: z.string().date(),` |
| `partyLedgerRowSchema` | [sourceDocumentType](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/party-ledger.ts#L30) | `sourceDocumentType: z.string(),` |
| `partyLedgerRowSchema` | [sourceDocumentId](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/party-ledger.ts#L31) | `sourceDocumentId: ULID,` |
| `partyLedgerRowSchema` | [sourceNumber](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/party-ledger.ts#L33) | `sourceNumber: z.string(),` |
| `partyLedgerRowSchema` | [account](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/party-ledger.ts#L34) | `account: z.string(),` |
| `partyLedgerRowSchema` | [amountMinor](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/party-ledger.ts#L36) | `amountMinor: z.number().int(),` |
| `partyLedgerRowSchema` | [debitMinor](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/party-ledger.ts#L37) | `debitMinor: z.number().int().min(0),` |
| `partyLedgerRowSchema` | [creditMinor](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/party-ledger.ts#L38) | `creditMinor: z.number().int().min(0),` |
| `partyLedgerRowSchema` | [runningBalanceMinor](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/party-ledger.ts#L40) | `runningBalanceMinor: z.number().int(),` |
| `partyLedgerResponseSchema` | [partyId](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/party-ledger.ts#L48) | `partyId: ULID,` |
| `partyLedgerResponseSchema` | [partyName](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/party-ledger.ts#L49) | `partyName: z.string(),` |
| `partyLedgerResponseSchema` | [openingBalance](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/party-ledger.ts#L55) | `openingBalance: balanceSchema,` |
| `partyLedgerResponseSchema` | [rows](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/party-ledger.ts#L56) | `rows: z.array(partyLedgerRowSchema),` |
| `partyLedgerResponseSchema` | [closingBalance](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/party-ledger.ts#L58) | `closingBalance: balanceSchema,` |
| `partyLedgerResponseSchema` | [totalDebitMinor](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/party-ledger.ts#L59) | `totalDebitMinor: z.number().int().min(0),` |
| `partyLedgerResponseSchema` | [totalCreditMinor](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/party-ledger.ts#L60) | `totalCreditMinor: z.number().int().min(0),` |
| `partyLedgerResponseSchema` | [page](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/party-ledger.ts#L61) | `page: z.object({ nextCursor: z.string().nullable(), hasMore: z.boolean() }).strict(),` |
| `partyLedgerQuerySchema` | [fromDate](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/party-ledger.ts#L76) | `fromDate: z.string().date().optional(),` |
| `partyLedgerQuerySchema` | [toDate](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/party-ledger.ts#L77) | `toDate: z.string().date().optional(),` |
| `partyLedgerQuerySchema` | [cursor](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/party-ledger.ts#L79) | `cursor: ULID.optional(),` |
| `partyLedgerQuerySchema` | [limit](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/party-ledger.ts#L80) | `limit: z.coerce.number().int().min(1).max(200).optional(),` |
