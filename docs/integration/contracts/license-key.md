# Backend contract fields: license-key

Field expressions below are source declarations, not a replacement schema. Multiline expressions and inherited `.extend`/`.omit` fields must be read at the immutable source link; defaults/nullability/strictness are defined there. No conversion may drop an unrepresented UI field silently.

| Schema | Field | Source expression |
|---|---|---|
| `licensePayloadSchema` | [schema_version](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/license-key.ts#L64) | `schema_version: z.number().int().positive(),` |
| `licensePayloadSchema` | [licence_id](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/license-key.ts#L66) | `licence_id: z.string().min(1).max(64),` |
| `licensePayloadSchema` | [signing_key_id](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/license-key.ts#L68) | `signing_key_id: z.string().min(1).max(64),` |
| `licensePayloadSchema` | [business_id](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/license-key.ts#L70) | `business_id: z.string().min(1).max(64),` |
| `licensePayloadSchema` | [issued_at](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/license-key.ts#L71) | `issued_at: z.string().datetime({ offset: true }),` |
| `licensePayloadSchema` | [valid_until](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/license-key.ts#L72) | `valid_until: z.string().datetime({ offset: true }),` |
| `licensePayloadSchema` | [modules](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/license-key.ts#L74) | `modules: z.array(z.enum(LICENSABLE_MODULE_CODES)),` |
| `licensePayloadSchema` | [replacement_of](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/license-key.ts#L83) | `replacement_of: z.string().min(1).max(64).optional(),` |
| `licenseInstallRequestSchema` | [key](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/license-key.ts#L136) | `key: z.string().min(1).max(8192),` |
| `licenseInstallResponseSchema` | [licenceId](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/license-key.ts#L142) | `licenceId: z.string(),` |
| `licenseInstallResponseSchema` | [validUntil](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/license-key.ts#L143) | `validUntil: z.string(),` |
| `licenseInstallResponseSchema` | [modules](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/license-key.ts#L144) | `modules: z.array(z.string()),` |
| `licenseInstallResponseSchema` | [previousLicenceId](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/license-key.ts#L146) | `previousLicenceId: z.string().nullable(),` |
