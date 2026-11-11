# MOD-021 — Tenant subscription/support portal and SaaS control centre

[Master rules](../HISABIQ_NESTSHERERP_MODULE_INTEGRATION_PLAN.md) · [Core workflows](../tasks/CORE_WORKFLOWS.md) · [Verification](../tasks/VERIFICATION.md)

## 1. Module identification

**Dependencies:** MOD-000. **Maturity:** frontend preview/partial candidates; backend varies per feature. **Source baseline:** frontend `176bb1a3e8f42eef192ea3098074ac5c8a214261`; backend `1643dac059e568407bba2fff38a990268dfe28fe`. **Status:** PLANNED, approval absent; blocked features explicitly marked.

## 2. Current frontend

[Source action/state census](../evidence/MOD-021-source-actions.md) identifies exact existing files and line anchors. It is a lexical inventory, not proof that every event has been traced. Source references below distinguish active pages from reusable/legacy components.

- [src/magic-saas/MagicSaasEntry.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/MagicSaasEntry.tsx#L1)
- [src/magic-saas/_designSystem/ds-6551b66a-cfd3-4df9-a9b1-9ead8d7fe7e9/index.d.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/_designSystem/ds-6551b66a-cfd3-4df9-a9b1-9ead8d7fe7e9/index.d.ts#L1)
- [src/magic-saas/components/Badge.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/Badge.tsx#L1)
- [src/magic-saas/components/Checkbox.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/Checkbox.tsx#L1)
- [src/magic-saas/components/StatusBadge.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/StatusBadge.tsx#L1)
- [src/magic-saas/components/Switch.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/Switch.tsx#L1)
- [src/magic-saas/components/brand/Logo.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/brand/Logo.tsx#L1)
- [src/magic-saas/components/layout/FloatingPanel.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/layout/FloatingPanel.tsx#L1)
- [src/magic-saas/components/saas/AccessRequestCard.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/AccessRequestCard.tsx#L1)
- [src/magic-saas/components/saas/AuditTable.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/AuditTable.tsx#L1)
- [src/magic-saas/components/saas/BillingLedger.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/BillingLedger.tsx#L1)
- [src/magic-saas/components/saas/CheckoutDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/CheckoutDialog.tsx#L1)
- [src/magic-saas/components/saas/ControlCenterShell.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/ControlCenterShell.tsx#L1)
- [src/magic-saas/components/saas/GlobalSearch.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/GlobalSearch.tsx#L1)
- [src/magic-saas/components/saas/GrantDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/GrantDialog.tsx#L1)
- [src/magic-saas/components/saas/IdentityChip.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/IdentityChip.tsx#L1)
- [src/magic-saas/components/saas/MessageOwnerDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/MessageOwnerDialog.tsx#L1)
- [src/magic-saas/components/saas/OrderDetailDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/OrderDetailDialog.tsx#L1)
- [src/magic-saas/components/saas/RequestChangeDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/RequestChangeDialog.tsx#L1)
- [src/magic-saas/components/saas/RowActions.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/RowActions.tsx#L1)
- [src/magic-saas/components/saas/SaasBits.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/SaasBits.tsx#L1)
- [src/magic-saas/components/saas/SmsCreditPanel.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/SmsCreditPanel.tsx#L1)
- [src/magic-saas/components/saas/billing/VerifyPaymentDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/billing/VerifyPaymentDialog.tsx#L1)
- [src/magic-saas/components/saas/ops/NewTicketDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/ops/NewTicketDialog.tsx#L1)
- [src/magic-saas/components/saas/ops/ServiceDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/ops/ServiceDialog.tsx#L1)
- [src/magic-saas/components/saas/ops/TicketDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/ops/TicketDialog.tsx#L1)
- [src/magic-saas/components/saas/ops/TicketThread.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/ops/TicketThread.tsx#L1)
- [src/magic-saas/components/saas/packages/BuilderBits.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/BuilderBits.tsx#L1)
- [src/magic-saas/components/saas/packages/OfferBuilder.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/OfferBuilder.tsx#L1)
- [src/magic-saas/components/saas/packages/PackageBuilder.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/PackageBuilder.tsx#L1)
- [src/magic-saas/components/saas/tenant/CreateBusinessDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/CreateBusinessDialog.tsx#L1)
- [src/magic-saas/components/saas/tenant/HistoryTab.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/HistoryTab.tsx#L1)
- [src/magic-saas/components/saas/tenant/OverviewTab.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/OverviewTab.tsx#L1)
- [src/magic-saas/components/saas/tenant/PlanUsageTab.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/PlanUsageTab.tsx#L1)
- [src/magic-saas/components/saas/tenant/SettingsTab.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/SettingsTab.tsx#L1)
- [src/magic-saas/components/saas/tenant/SignalsPanel.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/SignalsPanel.tsx#L1)
- [src/magic-saas/components/saas/tenant/SupportTab.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/SupportTab.tsx#L1)
- [src/magic-saas/components/settings/SettingCard.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/settings/SettingCard.tsx#L1)
- [src/magic-saas/contexts/SaasContext.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/contexts/SaasContext.tsx#L1)
- [src/magic-saas/data/experienceCatalog.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/data/experienceCatalog.ts#L1)
- [src/magic-saas/data/saasNav.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/data/saasNav.ts#L1)
- [src/magic-saas/data/saasOpsSeeds.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/data/saasOpsSeeds.ts#L1)
- [src/magic-saas/data/saasSeeds.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/data/saasSeeds.ts#L1)
- [src/magic-saas/data/saasTenants.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/data/saasTenants.ts#L1)
- [src/magic-saas/hisabiq-library/components/AppDateRangePicker.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/components/AppDateRangePicker.tsx#L1)
- [src/magic-saas/hisabiq-library/components/AppSelect.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/components/AppSelect.tsx#L1)
- [src/magic-saas/hisabiq-library/i18n/datePickerCopy.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/i18n/datePickerCopy.ts#L1)
- [src/magic-saas/hisabiq-library/i18n/uiCopy.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/i18n/uiCopy.ts#L1)
- [src/magic-saas/hisabiq-library/i18n/useUiCopy.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/i18n/useUiCopy.ts#L1)
- [src/magic-saas/hisabiq-library/motion/MotionTabList.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/motion/MotionTabList.tsx#L1)
- [src/magic-saas/hisabiq-library/motion/tokens.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/motion/tokens.ts#L1)
- [src/magic-saas/hisabiq-library/settings/TenantSettingsProvider.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/settings/TenantSettingsProvider.tsx#L1)
- [src/magic-saas/hisabiq-library/settings/model.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/settings/model.ts#L1)
- [src/magic-saas/hisabiq-library/utils/dateRange.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/utils/dateRange.ts#L1)
- [src/magic-saas/hisabiq-library/utils/libraryPortal.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/utils/libraryPortal.tsx#L1)
- [src/magic-saas/hooks/saas/useAdminCommands.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hooks/saas/useAdminCommands.ts#L1)
- [src/magic-saas/hooks/saas/useBillingCommands.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hooks/saas/useBillingCommands.ts#L1)
- [src/magic-saas/hooks/saas/useCatalogCommands.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hooks/saas/useCatalogCommands.ts#L1)
- [src/magic-saas/hooks/saas/useFirstLoad.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hooks/saas/useFirstLoad.ts#L1)
- [src/magic-saas/hooks/saas/useSaasCore.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hooks/saas/useSaasCore.ts#L1)
- [src/magic-saas/hooks/saas/useSupportCommands.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hooks/saas/useSupportCommands.ts#L1)
- [src/magic-saas/hooks/saas/useTenantCommands.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hooks/saas/useTenantCommands.ts#L1)
- [src/magic-saas/hooks/saas/useWorkQueue.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hooks/saas/useWorkQueue.ts#L1)
- [src/magic-saas/pages/saas/AuditLog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/AuditLog.tsx#L1)
- [src/magic-saas/pages/saas/PackagesOffers.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/PackagesOffers.tsx#L1)
- [src/magic-saas/pages/saas/Payments.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/Payments.tsx#L1)
- [src/magic-saas/pages/saas/SmsAdmin.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/SmsAdmin.tsx#L1)
- [src/magic-saas/pages/saas/SupportAccessQueue.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/SupportAccessQueue.tsx#L1)
- [src/magic-saas/pages/saas/TenantWorkspace.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/TenantWorkspace.tsx#L1)
- [src/magic-saas/pages/saas/admin/Announcements.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/Announcements.tsx#L1)
- [src/magic-saas/pages/saas/admin/PlatformReports.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/PlatformReports.tsx#L1)
- [src/magic-saas/pages/saas/admin/PlatformSettings.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/PlatformSettings.tsx#L1)
- [src/magic-saas/pages/saas/admin/Team.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/Team.tsx#L1)
- [src/magic-saas/pages/saas/customers/Businesses.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/customers/Businesses.tsx#L1)
- [src/magic-saas/pages/saas/home/MyWork.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/home/MyWork.tsx#L1)
- [src/magic-saas/pages/saas/ops/DataRequests.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/ops/DataRequests.tsx#L1)
- [src/magic-saas/pages/saas/ops/KnowledgeBase.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/ops/KnowledgeBase.tsx#L1)
- [src/magic-saas/pages/saas/ops/Services.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/ops/Services.tsx#L1)
- [src/magic-saas/pages/saas/ops/Tickets.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/ops/Tickets.tsx#L1)
- [src/magic-saas/pages/saas/revenue/Invoices.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Invoices.tsx#L1)
- [src/magic-saas/pages/saas/revenue/Refunds.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Refunds.tsx#L1)
- [src/magic-saas/pages/saas/revenue/Subscriptions.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Subscriptions.tsx#L1)
- [src/magic-saas/prototype/Ui.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/prototype/Ui.tsx#L1)
- [src/magic-saas/types/experience.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/types/experience.ts#L1)
- [src/magic-saas/types/saas.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/types/saas.ts#L1)
- [src/magic-saas/utils/currency.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/utils/currency.ts#L1)
- [src/magic-saas/utils/saas.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/utils/saas.ts#L1)
- [src/magic-saas/utils/saasAccess.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/utils/saasAccess.ts#L1)
- [src/magic-saas/utils/saasBilling.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/utils/saasBilling.ts#L1)
- [src/magic-saas/utils/saasSignals.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/utils/saasSignals.ts#L1)
- [src/magic-saas/utils/saasState.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/utils/saasState.ts#L1)
- [src/saas/AttachmentField.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/AttachmentField.tsx#L1)
- [src/saas/OverviewPage.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/OverviewPage.tsx#L1)
- [src/saas/SaasProvider.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/SaasProvider.tsx#L1)
- [src/saas/SaasShell.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/SaasShell.tsx#L1)
- [src/saas/TenantPortal.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/TenantPortal.tsx#L1)
- [src/saas/admin/AnnouncementsPage.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/AnnouncementsPage.tsx#L1)
- [src/saas/admin/AuditPage.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/AuditPage.tsx#L1)
- [src/saas/admin/ReportsPage.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/ReportsPage.tsx#L1)
- [src/saas/admin/SettingsPage.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/SettingsPage.tsx#L1)
- [src/saas/admin/TeamPage.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/TeamPage.tsx#L1)
- [src/saas/admin/auditSelectors.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/auditSelectors.ts#L1)
- [src/saas/admin/schedule.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/schedule.ts#L1)
- [src/saas/admin/teamTransitions.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/teamTransitions.ts#L1)
- [src/saas/admin/transitions.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/transitions.ts#L1)
- [src/saas/billing/InvoicesPage.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/InvoicesPage.tsx#L1)
- [src/saas/billing/PaymentForm.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/PaymentForm.tsx#L1)
- [src/saas/billing/PaymentsPage.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/PaymentsPage.tsx#L1)
- [src/saas/billing/PlansPage.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/PlansPage.tsx#L1)
- [src/saas/billing/SubscriptionsPage.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/SubscriptionsPage.tsx#L1)
- [src/saas/billing/selectors.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/selectors.ts#L1)
- [src/saas/billing/transitions.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/transitions.ts#L1)
- [src/saas/components.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/components.tsx#L1)
- [src/saas/guards.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/guards.ts#L1)
- [src/saas/hooks.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/hooks.ts#L1)
- [src/saas/messaging/SmsPage.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/messaging/SmsPage.tsx#L1)
- [src/saas/messaging/transitions.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/messaging/transitions.ts#L1)
- [src/saas/permissions.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/permissions.ts#L1)
- [src/saas/seed.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/seed.ts#L1)
- [src/saas/services/ServicesPage.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/services/ServicesPage.tsx#L1)
- [src/saas/services/transitions.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/services/transitions.ts#L1)
- [src/saas/state.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/state.ts#L1)
- [src/saas/support/KnowledgePage.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/support/KnowledgePage.tsx#L1)
- [src/saas/support/TicketsPage.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/support/TicketsPage.tsx#L1)
- [src/saas/support/transitions.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/support/transitions.ts#L1)
- [src/saas/tenants/TenantsPage.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/tenants/TenantsPage.tsx#L1)
- [src/saas/tenants/transitions.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/tenants/transitions.ts#L1)
- [src/saas/types.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/types.ts#L1)
- [src/saas/validateState.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/validateState.ts#L1)

## 3. Current backend

Existing controller declarations and exact service calls for this module:

| Method / route | Source | Request schema | Response | Service |
|---|---|---|---|---|
| `GET /api/control/deployments` | [DeploymentsController.list](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/deployments/deployments.controller.ts#L26) | Inline / no body; linked method | `unknown` | `DeploymentsService.listJobs` |
| `GET /api/control/deployments/:id` | [DeploymentsController.get](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/deployments/deployments.controller.ts#L32) | Inline / no body; linked method | `unknown` | `DeploymentsService.job`, `DeploymentsService.targetsOf` |
| `POST /api/control/deployments` | [DeploymentsController.create](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/deployments/deployments.controller.ts#L38) | `jobSchema` | `unknown` | `DeploymentsService.createJob` |
| `POST /api/control/deployments/:id/advance` | [DeploymentsController.advance](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/deployments/deployments.controller.ts#L49) | Inline / no body; linked method | `unknown` | `DeploymentsService.advance` |
| `POST /api/control/deployments/:id/clear-halt` | [DeploymentsController.clearHalt](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/deployments/deployments.controller.ts#L61) | Inline / no body; linked method | `{ ok: true }` | `DeploymentsService.clearHalt` |
| `GET /api/control/feature-flags` | [FlagsController.list](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/flags/flags.controller.ts#L15) | Inline / no body; linked method | `unknown` | `FlagsService.list` |
| `POST /api/control/feature-flags` | [FlagsController.set](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/flags/flags.controller.ts#L21) | Inline / no body; linked method | `{ ok: true }` | `FlagsService.set` |
| `POST /api/agent/enrol` | [AgentController.enrol](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/installations/agent.controller.ts#L54) | `enrolmentRequestSchema` | `unknown` | `InstallationsService.enrol` |
| `POST /api/agent/checkin` | [AgentController.checkIn](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/installations/agent.controller.ts#L80) | `checkInRequestSchema` | `unknown` | `InstallationsService.recordCheckIn`, `CommandsService.pendingFor`, `InstallationsService.isRevoked`, `InstallationsService.checkInIntervalOf` |
| `POST /api/agent/command-result` | [AgentController.commandResult](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/installations/agent.controller.ts#L122) | `commandResultSchema` | `{ ok: true }` | `CommandsService.recordResult`, `DeploymentsService.onCommandResult` |
| `POST /api/agent/diagnostics` | [AgentController.uploadDiagnostics](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/installations/agent.controller.ts#L135) | `diagnosticsUploadSchema` | `{ ok: true }` | `DiagnosticsService.record` |
| `POST /api/agent/deployment-stage` | [AgentController.deploymentStage](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/installations/agent.controller.ts#L154) | Inline / no body; linked method | `{ ok: true }` | `DeploymentsService.recordStage` |
| `GET /api/control/installations` | [InstallationsController.list](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/installations/installations.controller.ts#L47) | Inline / no body; linked method | `unknown` | `InstallationsService.list` |
| `GET /api/control/installations/:id` | [InstallationsController.get](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/installations/installations.controller.ts#L53) | Inline / no body; linked method | `unknown` | `InstallationsService.get`, `CommandsService.listFor`, `DiagnosticsService.listFor`, `SupportService.listFor` |
| `POST /api/control/installations` | [InstallationsController.create](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/installations/installations.controller.ts#L65) | `createSchema` | `unknown` | `InstallationsService.create` |
| `POST /api/control/installations/:id/enrolment-token` | [InstallationsController.enrolmentToken](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/installations/installations.controller.ts#L74) | Inline / no body; linked method | `unknown` | `InstallationsService.issueEnrolmentToken` |
| `POST /api/control/installations/:id/revoke` | [InstallationsController.revoke](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/installations/installations.controller.ts#L80) | `reasonSchema` | `{ ok: true }` | `InstallationsService.revoke` |
| `POST /api/control/installations/:id/command/:type` | [InstallationsController.runCommand](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/installations/installations.controller.ts#L101) | Inline / no body; linked method | `unknown` | `InstallationsService.get`, `Clock.now`, `CommandsService.enqueue` |
| `GET /api/control/known-issues` | [IssuesController.list](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/issues/issues.controller.ts#L30) | Inline / no body; linked method | `unknown` | `IssuesService.list` |
| `GET /api/control/known-issues/:id/affected` | [IssuesController.affected](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/issues/issues.controller.ts#L37) | Inline / no body; linked method | `unknown` | `IssuesService.affected` |
| `POST /api/control/known-issues` | [IssuesController.create](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/issues/issues.controller.ts#L43) | `createSchema` | `unknown` | `IssuesService.create` |
| `PUT /api/control/known-issues/:id` | [IssuesController.update](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/issues/issues.controller.ts#L53) | Inline / no body; linked method | `{ ok: true }` | `IssuesService.update` |
| `GET /api/control/licences` | [LicencesController.list](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/licences/licences.controller.ts#L27) | Inline / no body; linked method | `unknown` | `LicencesService.listFor` |
| `GET /api/control/licences/expiring` | [LicencesController.expiring](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/licences/licences.controller.ts#L33) | Inline / no body; linked method | `unknown` | `LicencesService.expiringSoon` |
| `POST /api/control/licences` | [LicencesController.issue](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/licences/licences.controller.ts#L40) | `issueSchema` | `unknown` | `LicencesService.issue` |
| `POST /api/control/licences/:id/deliver/:installationId` | [LicencesController.deliver](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/licences/licences.controller.ts#L54) | Inline / no body; linked method | `{ ok: true }` | `LicencesService.deliver` |
| `POST /api/control/licences/:id/revoke` | [LicencesController.revoke](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/licences/licences.controller.ts#L65) | Inline / no body; linked method | `{ ok: true }` | `LicencesService.revoke` |
| `POST /api/control/operators/login` | [OperatorsController.login](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/operators/operators.controller.ts#L44) | `loginSchema` | `unknown` | `OperatorsService.login` |
| `POST /api/control/operators/enrol` | [OperatorsController.enrol](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/operators/operators.controller.ts#L58) | `codeSchema` | `{ ok: true }` | `OperatorsService.completeEnrolment` |
| `POST /api/control/operators/reauth` | [OperatorsController.reauth](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/operators/operators.controller.ts#L69) | `codeSchema` | `{ ok: true }` | `OperatorsService.reauthenticate` |
| `POST /api/control/operators/logout` | [OperatorsController.logout](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/operators/operators.controller.ts#L78) | Inline / no body; linked method | `{ ok: true }` | `OperatorsService.logout` |
| `GET /api/control/operators/me` | [OperatorsController.me](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/operators/operators.controller.ts#L87) | Inline / no body; linked method | `See source` |  |
| `GET /api/control/operators` | [OperatorsController.list](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/operators/operators.controller.ts#L102) | Inline / no body; linked method | `unknown` | `OperatorsService.list` |
| `POST /api/control/operators` | [OperatorsController.create](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/operators/operators.controller.ts#L109) | `createSchema` | `unknown` | `OperatorsService.create` |
| `GET /api/control/overview` | [OverviewController.summary](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/overview/overview.controller.ts#L16) | Inline / no body; linked method | `unknown` | `OverviewService.summary` |
| `GET /api/control/audit` | [OverviewController.auditLog](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/overview/overview.controller.ts#L22) | Inline / no body; linked method | `unknown` | `AuditService.list` |
| `GET /api/control/releases` | [ReleasesController.list](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/releases/releases.controller.ts#L35) | Inline / no body; linked method | `unknown` | `ReleasesService.list` |
| `POST /api/control/releases` | [ReleasesController.publish](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/releases/releases.controller.ts#L42) | `publishSchema` | `unknown` | `ReleasesService.publish` |
| `GET /api/agent/releases/:id/artifact` | [ReleaseArtifactController.artifact](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/releases/releases.controller.ts#L67) | Inline / no body; linked method | `void` | `ReleasesService.artifactPathFor` |
| `GET /api/control/support-sessions` | [SupportController.listActive](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/support/support.controller.ts#L27) | Inline / no body; linked method | `unknown` | `SupportService.listActive`, `TunnelRegistry.isConnected` |
| `GET /api/control/support-sessions/:id` | [SupportController.get](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/support/support.controller.ts#L41) | Inline / no body; linked method | `unknown` | `SupportService.get`, `SupportService.actionsOf`, `TunnelRegistry.isConnected`, `SupportService.get` |
| `POST /api/control/support-sessions` | [SupportController.open](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/support/support.controller.ts#L51) | `openSchema` | `unknown` | `SupportService.open` |
| `POST /api/control/support-sessions/:id/close` | [SupportController.close](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/support/support.controller.ts#L68) | Inline / no body; linked method | `{ ok: true }` | `SupportService.close`, `SupportService.get`, `TunnelRegistry.disconnect` |
| `POST /api/control/support-sessions/:id/revoke` | [SupportController.revoke](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/support/support.controller.ts#L86) | Inline / no body; linked method | `{ ok: true }` | `SupportService.get`, `SupportService.revoke`, `TunnelRegistry.disconnect` |
| `GET /api/control/tenants` | [TenantsController.list](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/tenants/tenants.controller.ts#L25) | Inline / no body; linked method | `unknown` | `TenantsService.list` |
| `GET /api/control/tenants/:id` | [TenantsController.get](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/tenants/tenants.controller.ts#L31) | Inline / no body; linked method | `unknown` | `TenantsService.get` |
| `POST /api/control/tenants` | [TenantsController.create](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/tenants/tenants.controller.ts#L37) | `tenantSchema` | `unknown` | `TenantsService.create` |
| `PUT /api/control/tenants/:id` | [TenantsController.update](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/control-plane/src/tenants/tenants.controller.ts#L45) | `tenantSchema` | `unknown` | `TenantsService.update` |

## 4. Feature parity matrix

| Feature ID | Existing interaction / symbol | Disposition | API or gap | Preservation / exact behavior | Gate |
|---|---|---|---|---|---|
| MOD-021-F01 | Every /saas route and tenant portal — `MagicSaasEntry; TenantPortal` | PRESERVE | Separate control-plane API | Inventory billing, plans, offers, addons, payments, refunds, tickets, team, data requests and settings. | No reports integration |
| MOD-021-F02 | Installations, licences and support operations where equivalent — `SaaS support access` | ADAPT | Control-plane operators/tenants/installations/licences/support | Separate platform authority, transport/origin and audit; tenant JWT never grants operator access. | Per-action equivalence NOT VERIFIED |
| MOD-021-F03 | Billing, provider payments, refunds, SMS credits and entitlements — `MagicSaas command hooks` | BUILD | No verified complete matching business subscription API | Plan billing/entitlement transactions and webhook verification before real integration. | D12 |

## 5. Proposed architecture and unresolved approval

Platform backend includes its own contracts/schema and management agent. Do not expose /api/v1/management routes as customer APIs or use tenant settings to grant a paid entitlement. Older database-per-plan marketing is not an approved storage migration in this task.

No architecture in this packet is falsely labelled owner-approved. Owner decision references: D12.

## 6. API contract catalogue

The table in §3 is normative for existing transport shapes. Exact Zod fields/defaults are indexed below; read inherited schemas at the pinned source. Inline query/body validation in controllers is part of the contract. [UI field map](../contracts/UI_FIELD_MAPPING.md) states conversions and unsupported fields. FND-01 defines error envelope, abort handling and no-fallback behavior. This packet proposes no unspecified new HTTP endpoint. BUILD/EXTEND items without a complete contract are **BLOCKED**, not permission to invent one.

- [management fields](../contracts/management.md)
- [licensing fields](../contracts/licensing.md)

## 7. Database integration

Reuse source-owned repositories listed in the [database/service evidence](../evidence/SERVICE_INDEX.md) and [schema/migrations](../evidence/DATABASE_INDEX.md). Confirm the service method’s actual repository calls, tenant predicates, locking, audit and outbox before enabling writes. One UOW per business mutation; no independent React balance/stock writes. Class T operations preserve journal/stock/source idempotency; Class M/S do not invent accounting effects. **Runtime isolation/concurrency is NOT VERIFIED.** New schema required by blocked fields must be separately approved and reserved; no migration is allowed from this packet yet.

## 8. Frontend integration instructions

Use FND transport and a typed resource adapter (proposed owner file `src/integration/saas-platform.ts`; use more specific existing name from CORE_WORKFLOWS if provided there). Modify only the handlers named in §4 after approved field mapping; preserve markup, current state initialization in preview, dialogs and keyboard handlers. Live read/mutation results go to a tenant/user/session-epoch-scoped cache. Successful POST updates from the actual response and invalidates related reads. Failed/unknown POST retains the entire draft and operation ID. No component may silently call a preview mutation after a server error.

## 9. Backend implementation instructions

For REUSE/ADAPT actions, do not add a new controller/service merely to fit UI names. Use the §3 application method and its domain function, existing errors and repository. Check its permission calls, version/idempotency path and transaction before treating it as sufficient. For EXTEND/BUILD actions, implement **only after** the linked decision has a complete typed request/response, source algorithm, storage and negative/concurrency test amendment. Unlisted business behavior is NOT VERIFIED.

## 10. File-by-file change manifest

| Path | Operation | Responsibility |
|---|---|---|
| `src/magic-saas/pages/saas/AuditLog.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/magic-saas/pages/saas/PackagesOffers.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/magic-saas/pages/saas/Payments.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/magic-saas/pages/saas/SmsAdmin.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/magic-saas/pages/saas/SupportAccessQueue.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/magic-saas/pages/saas/TenantWorkspace.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/magic-saas/pages/saas/admin/Announcements.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/magic-saas/pages/saas/admin/PlatformReports.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/magic-saas/pages/saas/admin/PlatformSettings.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/magic-saas/pages/saas/admin/Team.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/magic-saas/pages/saas/customers/Businesses.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/magic-saas/pages/saas/home/MyWork.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/magic-saas/pages/saas/ops/DataRequests.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/magic-saas/pages/saas/ops/KnowledgeBase.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/magic-saas/pages/saas/ops/Services.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/magic-saas/pages/saas/ops/Tickets.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/magic-saas/pages/saas/revenue/Invoices.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/magic-saas/pages/saas/revenue/Refunds.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/magic-saas/pages/saas/revenue/Subscriptions.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/integration/saas-platform.ts` | CREATE, PROPOSED | Resource transport/mapping; FND dependency |
| `tests/integration-saas-platform.test.ts` | CREATE, PROPOSED | Mapping/async failure tests |
| `scripts/integration-saas-platform-browser.cjs` | CREATE, PROPOSED | Existing UI against test API |
| Backend files linked in §3 | REUSE unless amendment specifies MODIFY | No implicit backend write allowance |

The census is a read scope, **not an allowed-write glob**. Exact child paths for blocked tasks are unassigned; those tasks fail the build-readiness gate. Coordinator reserves shared files before any task.

## 11. Ordered atomic tasks

### MOD-021-T01: Every /saas route and tenant portal

**State:** PRESERVE — no new backend integration. **Depends on:** MOD-000. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `MagicSaasEntry; TenantPortal`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `Separate control-plane API`. **Gate:** No reports integration.

**Algorithm / expected output:** Inventory billing, plans, offers, addons, payments, refunds, tickets, team, data requests and settings. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-saas-platform.test.ts` case `MOD-021-F01 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-021-T02: Installations, licences and support operations where equivalent

**State:** PLANNED — awaiting scoped approval. **Depends on:** MOD-000. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `SaaS support access`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `Control-plane operators/tenants/installations/licences/support`. **Gate:** Per-action equivalence NOT VERIFIED.

**Algorithm / expected output:** Separate platform authority, transport/origin and audit; tenant JWT never grants operator access. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-saas-platform.test.ts` case `MOD-021-F02 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-021-T03: Billing, provider payments, refunds, SMS credits and entitlements

**State:** BLOCKED — contract amendment required. **Depends on:** MOD-000. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `MagicSaas command hooks`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `No verified complete matching business subscription API`. **Gate:** D12.

**Algorithm / expected output:** Plan billing/entitlement transactions and webhook verification before real integration. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-saas-platform.test.ts` case `MOD-021-F03 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.

## 12. Automated test specification

Common fixture/isolation/error suite is [VERIFICATION](../tasks/VERIFICATION.md). CORE_WORKFLOWS supplies exact numeric expectations for the applicable core flow. This packet additionally requires each §4 interaction to be exercised on actual React against Nest: success, validation, permission revoked after load, foreign tenant source, stale version, timeout/retry and failed refresh. GET/read-only cases assert zero mutations; financial cases assert golden invariants and expected absence of unrelated rows. **Gaps:** secondary features without numeric business rules/complete field map are explicitly NOT VERIFIED and cannot pass this section by merely receiving HTTP 200.

## 13. UI preservation checklist

- [ ] Every existing route, tab, row action and dialog in §2 retained; Reports links preserved without integration.
- [ ] Existing Bangla/English names, unit symbols and printed source wording preserved.
- [ ] Keyboard focus/Enter/Escape and nested quick-add return preserve parent draft.
- [ ] 320/390 phone, 768/820 tablet and 1440 desktop: same layout, light/dark and open overlays.
- [ ] No mock number, preview success or partial-page total appears as real data.
- [ ] Unsupported feature still exists in preview and blocks full live cutover, rather than disappearing.

## 14. Security/accounting checklist

- [ ] Server identity and tenant predicates, RLS with unprivileged role; no UI-only authorization.
- [ ] Permissions checked by actual owning service; sensitive fields absent on wire.
- [ ] Class T transaction includes audit/outbox and journal/stock as appropriate.
- [ ] Idempotency replay, altered-body refusal, stale version and simultaneous final-capacity races verified.
- [ ] Immutable history, closed-period rules, source identity and correct money/quantity scales retained.
- [ ] No secrets in diagnostics, previews, audit events or PR evidence.

## 15. Definition of Done

All selected feature contracts complete; exact allowlist approved; dependencies at accepted SHAs; no unknown business rule delegated to builder; specified focused tests and required repo gates pass on the candidate; real React→Nest path verified on disposable PostgreSQL; UI comparison accepted; independent QA reports evidence; human approves merge. Existence of this packet or a green typecheck alone never means DONE.

## 16. Blockers and decisions

D12

Refer to [DECISIONS](../DECISIONS.md) and [REVIEW](../REVIEW.md). Missing active UI-to-service-to-table trace is a specification blocker. Do not infer it from a filename. No migration or external provider is activated.

## 17. Super Build execution contract

Issue UNASSIGNED except existing cash work explicitly recorded in GitHub snapshot. Owner session UNRESERVED. Branch proposed `integration/mod-021-<task>` from current approved baseline; actual base SHA and allowed paths recorded at dispatch. Coordinator owns shared types/contracts/schema/migrations and verifies capacity=1. A GitHub-only chat cannot claim shell/browser execution; hand off to a named runner. Draft PR, exact test/command outputs and independent QA required. Human merges only. See [execution prompt](../tasks/EXECUTION.md).

## 18. Completion status

**PLANNED / PARTIALLY BLOCKED.** NOT STARTED, NOT APPROVED, NOT BUILDING, NOT QA-PASSED, NOT DONE. For an entirely unsupported module, BLOCKED until full contracts and owner decisions exist.
