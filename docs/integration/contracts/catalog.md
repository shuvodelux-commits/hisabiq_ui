# Backend contract fields: catalog

Field expressions below are source declarations, not a replacement schema. Multiline expressions and inherited `.extend`/`.omit` fields must be read at the immutable source link; defaults/nullability/strictness are defined there. No conversion may drop an unrepresented UI field silently.

| Schema | Field | Source expression |
|---|---|---|
| `catalogFeaturesSchema` | [productOffers](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/catalog.ts#L70) | `productOffers: z.boolean(),` |
| `catalogFeaturesSchema` | [expiryTracking](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/catalog.ts#L71) | `expiryTracking: z.boolean(),` |
| `catalogFeaturesSchema` | [serialTracking](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/catalog.ts#L72) | `serialTracking: z.boolean(),` |
| `catalogFeaturesSchema` | [warranty](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/catalog.ts#L73) | `warranty: z.boolean(),` |
| `catalogFeaturesSchema` | [customerGroups](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/catalog.ts#L74) | `customerGroups: z.boolean(),` |
| `catalogFeaturesSchema` | [vendors](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/catalog.ts#L75) | `vendors: z.boolean(),` |
| `catalogResponseSchema` | [units](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/catalog.ts#L83) | `units: z.array(unitResponseSchema),` |
| `catalogResponseSchema` | [brands](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/catalog.ts#L84) | `brands: z.array(brandResponseSchema),` |
| `catalogResponseSchema` | [categories](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/catalog.ts#L85) | `categories: z.array(categoryResponseSchema),` |
| `catalogResponseSchema` | [features](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/catalog.ts#L86) | `features: catalogFeaturesSchema,` |
