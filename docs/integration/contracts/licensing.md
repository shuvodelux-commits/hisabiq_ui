# Backend contract fields: licensing

Field expressions below are source declarations, not a replacement schema. Multiline expressions and inherited `.extend`/`.omit` fields must be read at the immutable source link; defaults/nullability/strictness are defined there. No conversion may drop an unrepresented UI field silently.

| Schema | Field | Source expression |
|---|---|---|
| `licensedModuleStatusSchema` | [code](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/licensing.ts#L29) | `code: z.string(),` |
| `licensedModuleStatusSchema` | [label](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/licensing.ts#L30) | `label: z.string(),` |
| `licensedModuleStatusSchema` | [labelBn](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/licensing.ts#L31) | `labelBn: z.string(),` |
| `licensedModuleStatusSchema` | [included](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/licensing.ts#L32) | `included: z.boolean(),` |
| `licensedModuleStatusSchema` | [readOnlyHistorical](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/licensing.ts#L38) | `readOnlyHistorical: z.boolean(),` |
| `licenseStatusResponseSchema` | [state](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/licensing.ts#L43) | `state: licenseStateSchema,` |
| `licenseStatusResponseSchema` | [businessName](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/licensing.ts#L44) | `businessName: z.string(),` |
| `licenseStatusResponseSchema` | [businessId](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/licensing.ts#L50) | `businessId: z.string(),` |
| `licenseStatusResponseSchema` | [licenceId](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/licensing.ts#L52) | `licenceId: z.string().nullable(),` |
| `licenseStatusResponseSchema` | [foreignBusiness](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/licensing.ts#L60) | `foreignBusiness: z.boolean(),` |
| `licenseStatusResponseSchema` | [clockWarning](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/licensing.ts#L67) | `clockWarning: z.string().nullable(),` |
| `licenseStatusResponseSchema` | [validUntil](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/licensing.ts#L69) | `validUntil: z.string().nullable(),` |
| `licenseStatusResponseSchema` | [daysRemaining](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/licensing.ts#L71) | `daysRemaining: z.number().nullable(),` |
| `licenseStatusResponseSchema` | [graceDaysRemaining](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/licensing.ts#L73) | `graceDaysRemaining: z.number().nullable(),` |
| `licenseStatusResponseSchema` | [licenceReadable](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/licensing.ts#L75) | `licenceReadable: z.boolean(),` |
| `licenseStatusResponseSchema` | [modules](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/licensing.ts#L76) | `modules: z.array(licensedModuleStatusSchema),` |
| `licenseNoticeSchema` | [state](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/licensing.ts#L89) | `state: licenseStateSchema,` |
| `licenseNoticeSchema` | [validUntil](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/licensing.ts#L90) | `validUntil: z.string().nullable(),` |
| `licenseNoticeSchema` | [daysRemaining](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/licensing.ts#L91) | `daysRemaining: z.number().nullable(),` |
| `licenseNoticeSchema` | [graceDaysRemaining](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/licensing.ts#L92) | `graceDaysRemaining: z.number().nullable(),` |
| `licenseNoticeSchema` | [hiddenModules](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/licensing.ts#L94) | `hiddenModules: z.array(z.string()),` |
| `licenseNoticeSchema` | [readOnlyModules](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/licensing.ts#L96) | `readOnlyModules: z.array(z.string()),` |
