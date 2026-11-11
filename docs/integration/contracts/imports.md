# Backend contract fields: imports

Field expressions below are source declarations, not a replacement schema. Multiline expressions and inherited `.extend`/`.omit` fields must be read at the immutable source link; defaults/nullability/strictness are defined there. No conversion may drop an unrepresented UI field silently.

| Schema | Field | Source expression |
|---|---|---|
| `importColumnSchema` | [key](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/imports.ts#L43) | `key: z.string(),` |
| `importColumnSchema` | [header](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/imports.ts#L44) | `header: z.string(),` |
| `importColumnSchema` | [required](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/imports.ts#L45) | `required: z.boolean(),` |
| `importColumnSchema` | [help](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/imports.ts#L46) | `help: z.string(),` |
| `importPreviewRowSchema` | [rowNumber](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/imports.ts#L59) | `rowNumber: z.number().int().positive(),` |
| `importPreviewRowSchema` | [values](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/imports.ts#L61) | `values: z.record(z.string()),` |
| `importPreviewRowSchema` | [errors](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/imports.ts#L63) | `errors: z.array(importCellErrorSchema),` |
| `importPreviewResponseSchema` | [type](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/imports.ts#L70) | `type: importTypeSchema,` |
| `importPreviewResponseSchema` | [columns](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/imports.ts#L71) | `columns: z.array(importColumnSchema),` |
| `importPreviewResponseSchema` | [rows](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/imports.ts#L72) | `rows: z.array(importPreviewRowSchema),` |
| `importPreviewResponseSchema` | [totalRows](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/imports.ts#L73) | `totalRows: z.number().int().nonnegative(),` |
| `importPreviewResponseSchema` | [validRows](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/imports.ts#L74) | `validRows: z.number().int().nonnegative(),` |
| `importPreviewResponseSchema` | [invalidRows](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/imports.ts#L75) | `invalidRows: z.number().int().nonnegative(),` |
| `importPreviewResponseSchema` | [missingColumns](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/imports.ts#L81) | `missingColumns: z.array(z.string()),` |
| `importResultResponseSchema` | [type](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/imports.ts#L88) | `type: importTypeSchema,` |
| `importResultResponseSchema` | [rows](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/imports.ts#L90) | `rows: z.number().int().nonnegative(),` |
| `importResultResponseSchema` | [imported](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/imports.ts#L91) | `imported: z.number().int().nonnegative(),` |
