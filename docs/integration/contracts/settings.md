# Backend contract fields: settings

Field expressions below are source declarations, not a replacement schema. Multiline expressions and inherited `.extend`/`.omit` fields must be read at the immutable source link; defaults/nullability/strictness are defined there. No conversion may drop an unrepresented UI field silently.

| Schema | Field | Source expression |
|---|---|---|
| `settingDescriptorSchema` | [key](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/settings.ts#L483) | `key: z.string(),` |
| `settingDescriptorSchema` | [group](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/settings.ts#L484) | `group: z.string(),` |
| `settingDescriptorSchema` | [label](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/settings.ts#L485) | `label: z.string(),` |
| `settingDescriptorSchema` | [detail](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/settings.ts#L486) | `detail: z.string(),` |
| `settingDescriptorSchema` | [kind](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/settings.ts#L487) | `kind: z.union([z.literal('TOGGLE'), z.literal('CHOICE')]),` |
| `settingDescriptorSchema` | [options](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/settings.ts#L488) | `options: z.array(z.string()),` |
| `settingDescriptorSchema` | [defaultValue](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/settings.ts#L489) | `defaultValue: z.string(),` |
| `settingDescriptorSchema` | [requires](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/settings.ts#L490) | `requires: z.array(z.string()),` |
| `settingDescriptorSchema` | [stepUp](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/settings.ts#L491) | `stepUp: z.boolean(),` |
| `settingDescriptorSchema` | [consumedBy](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/settings.ts#L492) | `consumedBy: z.string(),` |
| `settingDescriptorSchema` | [inEffect](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/settings.ts#L493) | `inEffect: z.boolean(),` |
| `settingsResponseSchema` | [businessName](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/settings.ts#L509) | `businessName: z.string(),` |
| `settingsResponseSchema` | [timezone](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/settings.ts#L510) | `timezone: z.string(),` |
| `settingsResponseSchema` | [supportedTimezones](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/settings.ts#L511) | `supportedTimezones: z.array(z.string()),` |
| `settingsResponseSchema` | [catalogue](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/settings.ts#L512) | `catalogue: z.array(settingDescriptorSchema),` |
| `settingsResponseSchema` | [values](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/settings.ts#L513) | `values: z.record(z.string(), z.string()),` |
| `updateSettingRequestSchema` | [key](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/settings.ts#L529) | `key: z.string().min(1).max(80),` |
| `updateSettingRequestSchema` | [value](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/settings.ts#L530) | `value: z.string().min(1).max(80),` |
| `updateSettingRequestSchema` | [confirmPassword](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/settings.ts#L531) | `confirmPassword: z.string().min(1).max(200).optional(),` |
| `updateBusinessProfileRequestSchema` | [businessName](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/settings.ts#L539) | `businessName: z.string().min(2).max(120),` |
| `updateBusinessProfileRequestSchema` | [timezone](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/settings.ts#L540) | `timezone: z.string().min(1).max(60),` |
