# Existing PostgreSQL schema index

Existing Drizzle tables and SQL migration names. Tenant isolation is verified per operation, not inferred from a table name. Identity/registration and control-plane tables have different ownership. No migrations were run.

| Symbol | Table | Source |
|---|---|---|
| `tenants` | `tenants` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L26) |
| `roles` | `roles` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L39) |
| `rolePermissions` | `role_permissions` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L57) |
| `users` | `users` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L71) |
| `periodLocks` | `period_locks` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L90) |
| `numberingCounters` | `numbering_counters` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L106) |
| `auditEvents` | `audit_events` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L126) |
| `outbox` | `outbox` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L144) |
| `idempotencyKeys` | `idempotency_keys` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L156) |
| `otpCodes` | `otp_codes` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L177) |
| `userIdentifiers` | `user_identifiers` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L194) |
| `refreshTokens` | `refresh_tokens` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L215) |
| `notes` | `notes` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L234) |
| `settings` | `settings` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L270) |
| `units` | `units` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L297) |
| `brands` | `brands` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L311) |
| `products` | `products` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L336) |
| `productUnitConversions` | `product_unit_conversions` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L391) |
| `inventoryLocations` | `inventory_locations` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L406) |
| `stockOpenings` | `stock_openings` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L414) |
| `stockAdjustments` | `stock_adjustments` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L424) |
| `inventoryLots` | `inventory_lots` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L439) |
| `stockMovements` | `stock_movements` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L449) |
| `lotConsumptions` | `lot_consumptions` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L454) |
| `costAdjustments` | `cost_adjustments` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L459) |
| `journalEntries` | `journal_entries` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L463) |
| `journalLines` | `journal_lines` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L467) |
| `productCostState` | `product_cost_state` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L471) |
| `categories` | `categories` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L475) |
| `customerGroups` | `customer_groups` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L490) |
| `parties` | `parties` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L510) |
| `partyOpenings` | `party_openings` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L535) |
| `partyRoles` | `party_roles` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L546) |
| `accounts` | `accounts` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L563) |
| `accountOpenings` | `account_openings` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L582) |
| `cashSessions` | `cash_sessions` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L602) |
| `cashSessionCloses` | `cash_session_closes` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L624) |
| `cashMovements` | `cash_movements` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L649) |
| `purchases` | `purchases` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L685) |
| `purchaseLines` | `purchase_lines` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L721) |
| `supplierPayments` | `supplier_payments` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L747) |
| `paymentAllocations` | `payment_allocations` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L774) |
| `sales` | `sales` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L788) |
| `saleLines` | `sale_lines` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L822) |
| `saleLineSourceAllocations` | `sale_line_source_allocations` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L839) |
| `saleSourceAllocationReversals` | `sale_source_allocation_reversals` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L851) |
| `salePayments` | `sale_payments` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L864) |
| `customerReceipts` | `customer_receipts` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L872) |
| `receiptAllocations` | `receipt_allocations` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L888) |
| `invoicePresentation` | `invoice_presentation` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L895) |
| `invoiceLinePresentation` | `invoice_line_presentation` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L910) |
| `invoiceSettings` | `invoice_settings` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L918) |
| `productGroupPrices` | `product_group_prices` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L945) |
| `quotations` | `quotations` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L954) |
| `quotationLines` | `quotation_lines` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L969) |
| `salesOrders` | `sales_orders` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L980) |
| `salesOrderLines` | `sales_order_lines` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L995) |
| `saleDrafts` | `sale_drafts` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L1006) |
| `salesReturns` | `sales_returns` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L1017) |
| `salesReturnLines` | `sales_return_lines` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L1043) |
| `purchaseReturns` | `purchase_returns` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L1054) |
| `purchaseReturnLines` | `purchase_return_lines` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L1079) |
| `expenseCategories` | `expense_categories` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L1091) |
| `expenses` | `expenses` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L1100) |
| `stockCounts` | `stock_counts` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L1122) |
| `stockCountLines` | `stock_count_lines` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L1137) |
| `purchasePlans` | `purchase_plans` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L1154) |
| `purchasePlanLines` | `purchase_plan_lines` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L1170) |
| `supplierPurchaseOrders` | `supplier_purchase_orders` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L1187) |
| `supplierPurchaseOrderLines` | `supplier_purchase_order_lines` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L1202) |
| `purchaseLandedCosts` | `purchase_landed_costs` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L1212) |
| `purchaseLandedCostAllocations` | `purchase_landed_cost_allocations` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L1229) |
| `inventoryUnits` | `inventory_units` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L1239) |
| `warrantyClaims` | `warranty_claims` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L1263) |
| `vendorStockReceipts` | `vendor_stock_receipts` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L1293) |
| `vendorStockReturns` | `vendor_stock_returns` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L1309) |
| `profitTargets` | `profit_targets` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L1327) |
| `daybookReviewMarks` | `daybook_review_marks` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L1338) |
| `daybookPrints` | `daybook_prints` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L1350) |
| `bankStatementFiles` | `bank_statement_files` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L1368) |
| `statementLines` | `statement_lines` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L1388) |
| `accountReconciliations` | `account_reconciliations` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L1405) |
| `reconciliationMatches` | `reconciliation_matches` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L1427) |
| `vendorPayments` | `vendor_payments` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L1451) |
| `vendorReceipts` | `vendor_receipts` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L1468) |
| `vendorProductIssues` | `vendor_product_issues` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L1485) |
| `vendorProductIssueLots` | `vendor_product_issue_lots` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L1503) |
| `vendorProductIssueReturns` | `vendor_product_issue_returns` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L1514) |
| `vendorProductSettlements` | `vendor_product_settlements` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L1529) |
| `vendorReceivableSettlementAllocations` | `vendor_receivable_settlement_allocations` | [Columns and constraints](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/schema.ts#L1544) |

## Existing migrations

- [0001_foundation.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0001_foundation.sql#L1)
- [0002_auth_registration.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0002_auth_registration.sql#L1)
- [0003_login_sessions.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0003_login_sessions.sql#L1)
- [0004_password_recovery.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0004_password_recovery.sql#L1)
- [0005_settings.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0005_settings.sql#L1)
- [0006_audit_entity_id_text.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0006_audit_entity_id_text.sql#L1)
- [0007_catalog_foundations.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0007_catalog_foundations.sql#L1)
- [0008_products.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0008_products.sql#L1)
- [0009_parties.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0009_parties.sql#L1)
- [0010_product_unit_conversion.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0010_product_unit_conversion.sql#L1)
- [0011_sortable_list_columns.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0011_sortable_list_columns.sql#L1)
- [0012_inventory_opening.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0012_inventory_opening.sql#L1)
- [0013_inventory_costing.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0013_inventory_costing.sql#L1)
- [0014_stock_adjustments.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0014_stock_adjustments.sql#L1)
- [0015_party_openings.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0015_party_openings.sql#L1)
- [0016_money_accounts.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0016_money_accounts.sql#L1)
- [0017_purchases.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0017_purchases.sql#L1)
- [0018_sales.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0018_sales.sql#L1)
- [0019_invoice_header.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0019_invoice_header.sql#L1)
- [0020_invoice_identity.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0020_invoice_identity.sql#L1)
- [0021_invoice_english_name.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0021_invoice_english_name.sql#L1)
- [0022_invoice_phone_list.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0022_invoice_phone_list.sql#L1)
- [0023_invoice_phone_labels.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0023_invoice_phone_labels.sql#L1)
- [0024_invoice_guardian.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0024_invoice_guardian.sql#L1)
- [0025_sale_drafts.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0025_sale_drafts.sql#L1)
- [0026_product_search_text.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0026_product_search_text.sql#L1)
- [0027_sales_returns.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0027_sales_returns.sql#L1)
- [0028_purchase_returns.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0028_purchase_returns.sql#L1)
- [0029_expenses.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0029_expenses.sql#L1)
- [0030_stock_counts.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0030_stock_counts.sql#L1)
- [0031_purchase_plans.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0031_purchase_plans.sql#L1)
- [0032_landed_costs.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0032_landed_costs.sql#L1)
- [0033_serial_units.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0033_serial_units.sql#L1)
- [0034_warranty_and_vendor_stock.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0034_warranty_and_vendor_stock.sql#L1)
- [0035_plan_approval.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0035_plan_approval.sql#L1)
- [0036_reporting_and_daybook.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0036_reporting_and_daybook.sql#L1)
- [0037_corrections.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0037_corrections.sql#L1)
- [0038_correction_indexes.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0038_correction_indexes.sql#L1)
- [0039_prior_period_entry_mode.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0039_prior_period_entry_mode.sql#L1)
- [0039_reconciliation.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0039_reconciliation.sql#L1)
- [0040_backup_and_license.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0040_backup_and_license.sql#L1)
- [0041_device_authorizations.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0041_device_authorizations.sql#L1)
- [0042_vendor_workspace.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0042_vendor_workspace.sql#L1)
- [0043_finance_module.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0043_finance_module.sql#L1)
- [0044_offline_snapshot_report.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0044_offline_snapshot_report.sql#L1)
- [0045_phase_8_2_inventory_origins.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0045_phase_8_2_inventory_origins.sql#L1)
- [0046_phase_8_2_origin_hardening.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0046_phase_8_2_origin_hardening.sql#L1)
- [0047_offline_sync.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0047_offline_sync.sql#L1)
- [0048_offline_origin_cash_movements.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0048_offline_origin_cash_movements.sql#L1)
- [0049_sync_in_flight.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0049_sync_in_flight.sql#L1)
- [0050_return_operation_uniqueness.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0050_return_operation_uniqueness.sql#L1)
- [0051_phase_8_2_serial_vendor_returns.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0051_phase_8_2_serial_vendor_returns.sql#L1)
- [0052_warranty_replacement_serial_status.sql](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/migrations/0052_warranty_replacement_serial_status.sql#L1)
