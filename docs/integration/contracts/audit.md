# Backend contract fields: audit

Field expressions below are source declarations, not a replacement schema. Multiline expressions and inherited `.extend`/`.omit` fields must be read at the immutable source link; defaults/nullability/strictness are defined there. No conversion may drop an unrepresented UI field silently.

| Schema | Field | Source expression |
|---|---|---|
| `auditEventSchema` | [id](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/audit.ts#L14) | `id: z.string().length(26),` |
| `auditEventSchema` | [occurredAt](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/audit.ts#L16) | `occurredAt: z.string(),` |
| `auditEventSchema` | [actorName](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/audit.ts#L18) | `actorName: z.string(),` |
| `auditEventSchema` | [actorId](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/audit.ts#L19) | `actorId: z.string(),` |
| `auditEventSchema` | [entityType](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/audit.ts#L20) | `entityType: z.string(),` |
| `auditEventSchema` | [entityId](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/audit.ts#L21) | `entityId: z.string(),` |
| `auditEventSchema` | [action](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/audit.ts#L22) | `action: z.string(),` |
| `auditEventSchema` | [before](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/audit.ts#L24) | `before: z.record(z.string(), z.union([z.string(), z.number(), z.null()])).nullable(),` |
| `auditEventSchema` | [after](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/audit.ts#L26) | `after: z.record(z.string(), z.union([z.string(), z.number(), z.null()])).nullable(),` |
| `auditEventSchema` | [reason](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/audit.ts#L27) | `reason: z.string().nullable(),` |
| `auditEventSchema` | [source](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/audit.ts#L29) | `source: z.string(),` |
| `auditPageSchema` | [nextCursor](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/audit.ts#L42) | `nextCursor: z.string().nullable(),` |
| `auditPageSchema` | [hasMore](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/audit.ts#L43) | `hasMore: z.boolean(),` |
| `auditListResponseSchema` | [events](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/audit.ts#L49) | `events: z.array(auditEventSchema),` |
| `auditListResponseSchema` | [timezone](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/audit.ts#L56) | `timezone: z.string(),` |
| `auditListResponseSchema` | [page](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/audit.ts#L57) | `page: auditPageSchema,` |
| `auditListResponseSchema` | [actions](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/audit.ts#L63) | `actions: z.array(z.string()),` |
| `auditListResponseSchema` | [entityTypes](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/audit.ts#L64) | `entityTypes: z.array(z.string()),` |
| `auditListResponseSchema` | [actors](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/audit.ts#L66) | `actors: z.array(z.object({ id: z.string(), name: z.string() }).strict()),` |
| `auditQuerySchema` | [actorId](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/audit.ts#L90) | `actorId: z.string().length(26).optional(),` |
| `auditQuerySchema` | [entityType](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/audit.ts#L91) | `entityType: z.string().max(60).optional(),` |
| `auditQuerySchema` | [action](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/audit.ts#L92) | `action: z.string().max(60).optional(),` |
| `auditQuerySchema` | [entityId](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/audit.ts#L94) | `entityId: z.string().max(60).optional(),` |
| `auditQuerySchema` | [cursor](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/audit.ts#L95) | `cursor: z.string().length(26).optional(),` |
| `auditQuerySchema` | [limit](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/audit.ts#L96) | `limit: z.coerce.number().int().min(1).max(AUDIT_PAGE_MAX).optional(),` |
