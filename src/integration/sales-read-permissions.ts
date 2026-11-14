/**
 * MOD-009: exact canonical read permission from NestSherERP Permission.SALE_VIEW.
 *
 * The backend's sale-query service requires "sale.invoice.view"; the old
 * "sale.view" string is not a valid compatibility grant. Do not synthesize
 * aliases or use return-create/view permissions as substitutes.
 *
 * This check is solely for the unmounted GET-only UI. Server authorization
 * and tenant RLS remain mandatory on every request.
 */
export const SALES_INVOICE_VIEW_PERMISSION = 'sale.invoice.view' as const;

export function canReadSalesInvoices(
  mode: 'preview' | 'connected',
  snapshot: { status: string; permissions?: readonly string[] | null },
): boolean {
  return mode === 'connected' &&
    snapshot.status === 'authenticated' &&
    Array.isArray(snapshot.permissions) &&
    snapshot.permissions.includes(SALES_INVOICE_VIEW_PERMISSION);
}
