# MOD-001 — Tenant settings, teams, invoice preferences and permissions

[Master rules](../HISABIQ_NESTSHERERP_MODULE_INTEGRATION_PLAN.md) · [Core workflows](../tasks/CORE_WORKFLOWS.md) · [Verification](../tasks/VERIFICATION.md)

## 1. Module identification

**Dependencies:** MOD-000. **Maturity:** frontend preview/partial candidates; backend varies per feature. **Source baseline:** frontend `176bb1a3e8f42eef192ea3098074ac5c8a214261`; backend `1643dac059e568407bba2fff38a990268dfe28fe`. **Status:** PLANNED, approval absent; blocked features explicitly marked.

## 2. Current frontend

[Source action/state census](../evidence/MOD-001-source-actions.md) identifies exact existing files and line anchors. It is a lexical inventory, not proof that every event has been traced. Source references below distinguish active pages from reusable/legacy components.

- [src/contexts/UserPreferencesContext.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/contexts/UserPreferencesContext.tsx#L1)
- [src/settings/AccountSecuritySettings.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/AccountSecuritySettings.tsx#L1)
- [src/settings/CommerceSettingsPanels.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/CommerceSettingsPanels.tsx#L1)
- [src/settings/DataSettings.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DataSettings.tsx#L1)
- [src/settings/DocumentDesignSettings.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DocumentDesignSettings.tsx#L1)
- [src/settings/DraftRecovery.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DraftRecovery.tsx#L1)
- [src/settings/EmployeeDirectory.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/EmployeeDirectory.tsx#L1)
- [src/settings/FinancialTerminologySettings.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/FinancialTerminologySettings.tsx#L1)
- [src/settings/InterfaceSettings.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/InterfaceSettings.tsx#L1)
- [src/settings/InvoicePresentationEditor.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/InvoicePresentationEditor.tsx#L1)
- [src/settings/ModuleSettingsEntry.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/ModuleSettingsEntry.tsx#L1)
- [src/settings/ModuleSettingsToolbarContext.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/ModuleSettingsToolbarContext.tsx#L1)
- [src/settings/OutputDesignSettings.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/OutputDesignSettings.tsx#L1)
- [src/settings/SettingsActivity.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/SettingsActivity.tsx#L1)
- [src/settings/SettingsDirectory.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/SettingsDirectory.tsx#L1)
- [src/settings/SettingsSqlBackup.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/SettingsSqlBackup.tsx#L1)
- [src/settings/SettingsTabs.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/SettingsTabs.tsx#L1)
- [src/settings/TeamSettings.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TeamSettings.tsx#L1)
- [src/settings/TenantSettingsHub.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsHub.tsx#L1)
- [src/settings/TenantSettingsPage.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L1)
- [src/settings/TenantSettingsProvider.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsProvider.tsx#L1)
- [src/settings/commercePolicies.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/commercePolicies.ts#L1)
- [src/settings/fields.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/fields.ts#L1)
- [src/settings/magic/DataSettings.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/DataSettings.tsx#L1)
- [src/settings/magic/GeneralSettingsSection.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/GeneralSettingsSection.tsx#L1)
- [src/settings/magic/KhataPreview.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/KhataPreview.tsx#L1)
- [src/settings/magic/SaveBar.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/SaveBar.tsx#L1)
- [src/settings/magic/SettingsHome.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/SettingsHome.tsx#L1)
- [src/settings/magic/SettingsNav.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/SettingsNav.tsx#L1)
- [src/settings/magic/SettingsToggle.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/SettingsToggle.tsx#L1)
- [src/settings/magic/SetupWizard.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/SetupWizard.tsx#L1)
- [src/settings/magic/TeamSettings.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/TeamSettings.tsx#L1)
- [src/settings/magic/interface/CapabilityRow.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/CapabilityRow.tsx#L1)
- [src/settings/magic/interface/InterfacePreview.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/InterfacePreview.tsx#L1)
- [src/settings/magic/interface/InterfaceSettings.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/InterfaceSettings.tsx#L1)
- [src/settings/magic/interface/InterfaceTabs.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/InterfaceTabs.tsx#L1)
- [src/settings/magic/interface/ModuleSelector.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/ModuleSelector.tsx#L1)
- [src/settings/magic/interface/experienceCatalog.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/experienceCatalog.ts#L1)
- [src/settings/magic/interface/experienceResolver.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/experienceResolver.ts#L1)
- [src/settings/magic/interface/experienceTypes.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/experienceTypes.ts#L1)
- [src/settings/magic/interface/useInterfaceDraft.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/useInterfaceDraft.ts#L1)
- [src/settings/magic/invoice/DesignGallery.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/DesignGallery.tsx#L1)
- [src/settings/magic/invoice/InvoiceDocument.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/InvoiceDocument.tsx#L1)
- [src/settings/magic/invoice/InvoiceStudio.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/InvoiceStudio.tsx#L1)
- [src/settings/magic/invoice/Ui.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/Ui.tsx#L1)
- [src/settings/magic/invoice/bangla.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/bangla.ts#L1)
- [src/settings/magic/invoice/documentCopy.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/documentCopy.ts#L1)
- [src/settings/magic/invoice/invoiceDesigns.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/invoiceDesigns.ts#L1)
- [src/settings/magic/invoice/invoiceState.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/invoiceState.ts#L1)
- [src/settings/magic/invoice/sampleInvoice.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/sampleInvoice.ts#L1)
- [src/settings/magic/security/ActivityPage.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/ActivityPage.tsx#L1)
- [src/settings/magic/security/OfflinePage.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/OfflinePage.tsx#L1)
- [src/settings/magic/security/PinConfirmDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/PinConfirmDialog.tsx#L1)
- [src/settings/magic/security/RowActions.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/RowActions.tsx#L1)
- [src/settings/magic/security/SessionsPage.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/SessionsPage.tsx#L1)
- [src/settings/magic/security/SessionsUi.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/SessionsUi.tsx#L1)
- [src/settings/magic/security/StatTile.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/StatTile.tsx#L1)
- [src/settings/magic/security/activityPreview.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/activityPreview.ts#L1)
- [src/settings/magic/security/offlinePreview.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/offlinePreview.ts#L1)
- [src/settings/magic/security/sessionPreview.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/sessionPreview.ts#L1)
- [src/settings/magic/settingsBridge.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/settingsBridge.ts#L1)
- [src/settings/magic/settingsSections.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/settingsSections.ts#L1)
- [src/settings/magic/settingsTasks.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/settingsTasks.ts#L1)
- [src/settings/magic/sourceFields.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/sourceFields.ts#L1)
- [src/settings/model.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/model.ts#L1)
- [src/settings/moduleViews.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/moduleViews.ts#L1)
- [src/settings/navigationGuard.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/navigationGuard.ts#L1)
- [src/settings/rbac.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/rbac.ts#L1)
- [src/settings/settingsHub.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/settingsHub.ts#L1)
- [src/settings/sqlBackup.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/sqlBackup.ts#L1)
- [src/settings/subsections.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/subsections.ts#L1)
- [src/settings/ui.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/ui.tsx#L1)
- [src/settings/useModuleColumns.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/useModuleColumns.ts#L1)

## 3. Current backend

Existing controller declarations and exact service calls for this module:

| Method / route | Source | Request schema | Response | Service |
|---|---|---|---|---|
| `GET /api/v1/settings` | [SettingsController.get](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/settings/settings.controller.ts#L27) | Inline / no body; linked method | `{ data: SettingsResponse }` | `ManageSettingsService.get` |
| `POST /api/v1/settings/value` | [SettingsController.setValue](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/settings/settings.controller.ts#L32) | `updateSettingRequestSchema` | `{ data: SettingsResponse; warnings: readonly { code: string; message: string }[] }` | `ManageSettingsService.updateSetting` |
| `PATCH /api/v1/settings/business` | [SettingsController.setBusinessProfile](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/settings/settings.controller.ts#L53) | `updateBusinessProfileRequestSchema` | `{ data: SettingsResponse }` | `ManageSettingsService.updateBusinessProfile` |
| `GET /api/v1/roles` | [RolesController.list](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/users/roles.controller.ts#L38) | Inline / no body; linked method | `{ data: RoleListResponse }` | `ManageRolesService.list` |
| `POST /api/v1/roles` | [RolesController.create](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/users/roles.controller.ts#L43) | `createRoleRequestSchema` | `{ data: RoleDetailResponse }` | `ManageRolesService.create` |
| `PATCH /api/v1/roles/:id` | [RolesController.update](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/users/roles.controller.ts#L53) | `updateRoleRequestSchema` | `{ data: RoleDetailResponse }` | `ManageRolesService.update` |
| `DELETE /api/v1/roles/:id` | [RolesController.remove](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/users/roles.controller.ts#L64) | `deleteRoleRequestSchema` | `void` | `ManageRolesService.remove` |
| `GET /api/v1/users` | [UsersController.list](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/users/users.controller.ts#L41) | Inline / no body; linked method | `{ data: UserListResponse }` | `ManageUsersService.list` |
| `POST /api/v1/users` | [UsersController.create](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/users/users.controller.ts#L46) | `createUserRequestSchema` | `{ data: UserResponse }` | `ManageUsersService.create` |
| `PATCH /api/v1/users/:id` | [UsersController.update](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/users/users.controller.ts#L56) | `updateUserRequestSchema` | `{ data: UserResponse }` | `ManageUsersService.update` |
| `POST /api/v1/users/:id/disabled` | [UsersController.setDisabled](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/users/users.controller.ts#L68) | `setUserDisabledRequestSchema` | `{ data: UserResponse }` | `ManageUsersService.setDisabled` |

## 4. Feature parity matrix

| Feature ID | Existing interaction / symbol | Disposition | API or gap | Preservation / exact behavior | Gate |
|---|---|---|---|---|---|
| MOD-001-F01 | Read/save mapped business settings — `TenantSettingsPage; TenantSettingsProvider` | ADAPT | GET settings; POST settings/value; PATCH settings/business | Map approved keys explicitly, persist only after server reply, show warnings; preserve dirty-state SaveBar. | Settings key matrix incomplete |
| MOD-001-F02 | Staff and role administration — `settings/magic/TeamSettings.tsx; TeamSettings.tsx` | ADAPT | users; roles | Keep employee identity separate from login identity; carry only the version/step-up fields actually declared by each schema; Users/Roles requests have no version field. | Employee-only fields lack verified contract |
| MOD-001-F03 | Personal layout, terminology and interface preferences — `settings/magic/interface/; FinancialTerminologySettings` | PRESERVE | Local preferences | Tenant/user namespace only; no journal or authority changes. | None |
| MOD-001-F04 | Invoice Studio and document styles — `settings/magic/invoice/InvoiceStudio.tsx` | EXTEND | sales/invoice-settings; invoice-logo; :id/presentation | Separate shared rendering settings from immutable transaction amounts; preserve Bangla labels and existing gallery. | Full style/field parity NOT VERIFIED |

## 5. Proposed architecture and unresolved approval

Active TenantSettingsPage imports Magic screens alongside legacy controls. Open PRs 274/275/276/277/279 affect this area; baseline main is authority until disposition. Enumerate settingsFields + sourceFields + settingsBridge and backend SettingKey before a live save task; do not send a whole UI section to a single setting endpoint. Existing backend catalogue inEffect flags are not reliable proof of consumption (cash is a concrete mismatch).

No architecture in this packet is falsely labelled owner-approved. Owner decision references: D02,D04,D13.

## 6. API contract catalogue

The table in §3 is normative for existing transport shapes. Exact Zod fields/defaults are indexed below; read inherited schemas at the pinned source. Inline query/body validation in controllers is part of the contract. [UI field map](../contracts/UI_FIELD_MAPPING.md) states conversions and unsupported fields. FND-01 defines error envelope, abort handling and no-fallback behavior. This packet proposes no unspecified new HTTP endpoint. BUILD/EXTEND items without a complete contract are **BLOCKED**, not permission to invent one.

- [settings fields](../contracts/settings.md)
- [users fields](../contracts/users.md)
- [roles fields](../contracts/roles.md)
- [permissions fields](../contracts/permissions.md)

## 7. Database integration

Reuse source-owned repositories listed in the [database/service evidence](../evidence/SERVICE_INDEX.md) and [schema/migrations](../evidence/DATABASE_INDEX.md). Confirm the service method’s actual repository calls, tenant predicates, locking, audit and outbox before enabling writes. One UOW per business mutation; no independent React balance/stock writes. Class T operations preserve journal/stock/source idempotency; Class M/S do not invent accounting effects. **Runtime isolation/concurrency is NOT VERIFIED.** New schema required by blocked fields must be separately approved and reserved; no migration is allowed from this packet yet.

## 8. Frontend integration instructions

Use FND transport and a typed resource adapter (proposed owner file `src/integration/settings-team.ts`; use more specific existing name from CORE_WORKFLOWS if provided there). Modify only the handlers named in §4 after approved field mapping; preserve markup, current state initialization in preview, dialogs and keyboard handlers. Live read/mutation results go to a tenant/user/session-epoch-scoped cache. Successful POST updates from the actual response and invalidates related reads. Failed/unknown POST retains the entire draft and operation ID. No component may silently call a preview mutation after a server error.

## 9. Backend implementation instructions

For REUSE/ADAPT actions, do not add a new controller/service merely to fit UI names. Use the §3 application method and its domain function, existing errors and repository. Check its permission calls, version/idempotency path and transaction before treating it as sufficient. For EXTEND/BUILD actions, implement **only after** the linked decision has a complete typed request/response, source algorithm, storage and negative/concurrency test amendment. Unlisted business behavior is NOT VERIFIED.

## 10. File-by-file change manifest

| Path | Operation | Responsibility |
|---|---|---|
| `src/contexts/UserPreferencesContext.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/integration/settings-team.ts` | CREATE, PROPOSED | Resource transport/mapping; FND dependency |
| `tests/integration-settings-team.test.ts` | CREATE, PROPOSED | Mapping/async failure tests |
| `scripts/integration-settings-team-browser.cjs` | CREATE, PROPOSED | Existing UI against test API |
| Backend files linked in §3 | REUSE unless amendment specifies MODIFY | No implicit backend write allowance |

The census is a read scope, **not an allowed-write glob**. Exact child paths for blocked tasks are unassigned; those tasks fail the build-readiness gate. Coordinator reserves shared files before any task.

## 11. Ordered atomic tasks

### MOD-001-T01: Read/save mapped business settings

**State:** PLANNED — awaiting scoped approval. **Depends on:** MOD-000. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `TenantSettingsPage; TenantSettingsProvider`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `GET settings; POST settings/value; PATCH settings/business`. **Gate:** Settings key matrix incomplete.

**Algorithm / expected output:** Map approved keys explicitly, persist only after server reply, show warnings; preserve dirty-state SaveBar. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-settings-team.test.ts` case `MOD-001-F01 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-001-T02: Staff and role administration

**State:** PLANNED — awaiting scoped approval. **Depends on:** MOD-000. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `settings/magic/TeamSettings.tsx; TeamSettings.tsx`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `users; roles`. **Gate:** Employee-only fields lack verified contract.

**Algorithm / expected output:** Keep employee identity separate from login identity; carry only the version/step-up fields actually declared by each schema; Users/Roles requests have no version field. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-settings-team.test.ts` case `MOD-001-F02 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-001-T03: Personal layout, terminology and interface preferences

**State:** PRESERVE — no new backend integration. **Depends on:** MOD-000. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `settings/magic/interface/; FinancialTerminologySettings`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `Local preferences`. **Gate:** None.

**Algorithm / expected output:** Tenant/user namespace only; no journal or authority changes. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-settings-team.test.ts` case `MOD-001-F03 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-001-T04: Invoice Studio and document styles

**State:** BLOCKED — contract amendment required. **Depends on:** MOD-000. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `settings/magic/invoice/InvoiceStudio.tsx`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `sales/invoice-settings; invoice-logo; :id/presentation`. **Gate:** Full style/field parity NOT VERIFIED.

**Algorithm / expected output:** Separate shared rendering settings from immutable transaction amounts; preserve Bangla labels and existing gallery. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-settings-team.test.ts` case `MOD-001-F04 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

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

D02,D04,D13

Refer to [DECISIONS](../DECISIONS.md) and [REVIEW](../REVIEW.md). Missing active UI-to-service-to-table trace is a specification blocker. Do not infer it from a filename. No migration or external provider is activated.

## 17. Super Build execution contract

Issue UNASSIGNED except existing cash work explicitly recorded in GitHub snapshot. Owner session UNRESERVED. Branch proposed `integration/mod-001-<task>` from current approved baseline; actual base SHA and allowed paths recorded at dispatch. Coordinator owns shared types/contracts/schema/migrations and verifies capacity=1. A GitHub-only chat cannot claim shell/browser execution; hand off to a named runner. Draft PR, exact test/command outputs and independent QA required. Human merges only. See [execution prompt](../tasks/EXECUTION.md).

## 18. Completion status

**PLANNED / PARTIALLY BLOCKED.** NOT STARTED, NOT APPROVED, NOT BUILDING, NOT QA-PASSED, NOT DONE. For an entirely unsupported module, BLOCKED until full contracts and owner decisions exist.


---

## 19. Revision 4 — source-traced MOD-001 owner-approval plan (2026-11-11)

**Status:** **OWNER-APPROVED MOD-001 SPECIFICATION (2026-11-12), DOCUMENTATION-ONLY; implementation WAITING on MOD-000 acceptance and exclusive coordinator build reservation.** This section supersedes the older baseline, active-screen assumptions and incomplete mapping conclusions in §§2–11 where they conflict, without deleting the original evidence. The exact active implementation is the Magic Patterns shell; the legacy content remains a preservation/test scope. This review was performed through GitHub source inspection only: **no shell execution, PostgreSQL verification, React browser run, runner assignment, or independent QA**.

**Verified immutable source heads:**
- Frontend shuvodelux-commits/hisabiq_ui, main, **2e16821ba622192c69e5f5cc83aba93f70ec0638**.
- Backend shuvodelux-commits/nestshererp, **chore/hisabiq-adoption-runtime-a01**, **74bb37f2ae6441689b1ee73f0c7ce51e03bcb1f5**. Backend main is a different baseline (**b1bad29961a968829be622dc812d476773e6db78**).
- Existing original packet link anchors use older 176bb1a/1643dac source heads. Reconcile them against these new commits at dispatch. Open overlapping frontend PRs **274, 275, 276, 277, 279, 282** and backend cash PR **16** are not integrated into this baseline; the coordinator must decide their disposition independently. Nothing here cherry-picks or merges them.

### 19.1 Twelve-sentence owner overview

1. MOD-001 will connect the present HisabIQ React settings pages to NestSherERP while preserving all current components, controls, routes, responsive layouts, and Bangla/English helpers.
2. The inspected source heads are frontend 2e16821ba622192c69e5f5cc83aba93f70ec0638 and backend adoption 74bb37f2ae6441689b1ee73f0c7ce51e03bcb1f5.
3. Active Magic settings saves are preview-only apart from the browser-local cash-session toggle, so a successful local Save is not evidence of server persistence.
4. Stage A will integrate the existing settings GET, single-key POST, and business-profile PATCH only where the UI field and backend semantics are identical.
5. The existing setting catalogue, dependency cascade, permission check, step-up password, server response, and audit trail will remain authoritative.
6. Stage A will also read actual users and roles and connect narrowly compatible account and role operations without using demo actor identities as authentication.
7. The backend supports one login role per user, whereas HisabIQ keeps independent employee details and multiple role memberships, which requires a lossless Stage B extension.
8. User-facing layout, terminology and column preferences remain separate from tenant business policy, role permission and subscription entitlement.
9. Existing invoice settings and logo APIs can persist selected document flags, but the six design styles, all language choices, colors and richer output toggles exceed the backend contract.
10. The recorded Free, Counter, Pro and Plus plan limits and the Basic, Medium and Premium interface ladder take precedence over temporary Magic preview plan labels.
11. Implementation acceptance requires MOD-000, source-pinned paired heads, a coordinator-reserved single build worker, scoped tests and React-to-Nest-to-disposable-PostgreSQL evidence.
12. No code, schema, auth/cash service, merge, deployment, or production data change is authorized by this planning revision.

### 19.2 Actual active rendering and authority

The route owner is frontend src/settings/TenantSettingsPage.tsx, TenantSettingsPage (lower component). It selects MagicGeneralSettingsSection for business/names/sales/products/purchases/finance/notifications/personal/security; MagicTeamSettings for team; MagicInterfaceSettings for interface; MagicInvoiceStudio plus MagicGeneralSettingsSection for invoices; and embedded SaaS/subscription, support, session, activity, offline and data pages. The older SettingsPageContent, TeamSettings, EmployeeDirectory, CommerceSettingsPanels and DocumentDesignSettings are still part of the preservation inventory, but are **not** interchangeable with the current Magic route's active Save behavior.

- src/settings/magic/GeneralSettingsSection.tsx initializes drafts through useMagicSettingsState and sourceSettingsFields. General Save validates and reports preview-only status; it neither calls the Nest API nor persists the ordinary Magic fields. Exception: finance.cashSession immediately calls local TenantSettingsProvider.save and writes the browser settings model only.
- src/settings/magic/TeamSettings.tsx makes local component-state rows with name/role/active. Its Add, Edit, Active and Save do not create, invite, update, disable, or authenticate real users.
- src/settings/magic/invoice/InvoiceStudio.tsx hardcodes premium=false, initializes from defaultInvoiceDesign, and never persists the gallery/theme draft. Its Print button is a sample-preview explanation, not a real print completion.
- src/settings/magic/interface/useInterfaceDraft.ts uses sample PLUS, preview actor/permission, and a local draft with no backend persistence.
- src/settings/TenantSettingsProvider.tsx stores business state under a fixed demo tenant t1; personalKey is a single browser key, hisabiq-erp-personal-v1, **not scoped by tenant/user**. Its preview actor mahmud and canManage/effectivePermissions must never authorize a connected request.
- src/saas/TenantPortal.tsx / SaasProvider is a demo tenant portal. NestSherERP apps/api/src/deployment/subscription-entitlement-provider.ts is a **permissive SaaS stub** (modules empty means all). Neither establishes a paid account, current plan nor server-enforced seat or design entitlement.

**Write classification:** REUSE = existing compatible behavior may be connected via its authentic endpoint; ADAPT = typed projection/validation or existing UI handler change needed without loss; EXTEND = backend contract/consumer/persistence missing; BLOCKED = unsafe to execute or bind without a complete approved contract, cross-module dependency, or remaining product rule. Preview-only controls remain visible until supported.

### 19.3 Active Magic sourceSettingsFields: full input/consumer matrix

UI keys are section-qualified. Identical plain key names (defaultPayment or autoPrint) in different sections are **not** one universal backend setting. A tenant policy stored in Nest settings catalogue is not a per-product new-form default or UI appearance preference merely because labels resemble each other.

| Section / exact active source key | Classification | Target backend field, DTO or gap | Exact safe decision |
|---|---|---|---|
| business.businessName | ADAPT | PATCH /api/v1/settings/business businessName + timezone | Read server businessName/timezone first; submit both required fields, unchanged validated Asia/Dhaka; never substitute fixture name. |
| business.phone | EXTEND | no field in updateBusinessProfileRequestSchema | Business-contact/profile extension; invoiceSettings.businessPhone is a **print override**, not authoritative contact. |
| business.address | EXTEND | no field in updateBusinessProfileRequestSchema | Preserve genuine business address separately; optional invoiceSettings.businessAddress is only a printed override. |
| business.currency | REUSE display-only | no mutable currency field; UI BDT fixed | Preserve BDT as display/product constraint; never POST a fabricated setting. |
| names.dueLabel, names.receivedLabel, names.advanceLabel, names.ledgerOrder | EXTEND | no SettingKey or named persistent tenant/user preference DTO | Keep display-only semantics and selected order; add scoped preference contract and consumer rules, not accounting vocabulary/account changes. |
| sales.defaultPayment | EXTEND | no SettingKey; payment account defaults absent | Define POS default for future transactions only; separate from purchases.defaultPayment and finance.defaultPayment. |
| sales.autoPrint | ADAPT (local only), EXTEND (synced) | browser print preference; no SettingKey | Preserve explicit per-invoice print action and preference; no automatic print after failed posting. |
| sales.negativeStock | BLOCKED mapping | negative_stock_policy = BLOCK/WARN/ALLOW | Boolean cannot round-trip three distinct policies; do not silently choose WARN vs ALLOW or lose explicit Own/Negative/Vendor workflow. Require MOD-003/MOD-007 consumer reconciliation. |
| sales.priceOverride | EXTEND | no corresponding scalar SettingKey; backend role permissions separate | Define authorized checkout override policy alongside actual backend permissions. UI checked alone must never grant editing rights. |
| sales.maxDiscount | EXTEND | no server maximum discount policy field | Define percent range 0–100, exact POS validator/currency arithmetic, senior authorization and audit. |
| sales.returnDays | EXTEND | no tenant-wide return window contract | Define rule for new returns/legacy sales, effective date and per-item exceptions before enforcement. |
| products.stockAlert | EXTEND | no tenant-wide numeric alert threshold; product minimum is per product | Preserve numeric default/alert interpretation and individual product override; do not map 5 to a boolean setting. |
| products.requireSerial | EXTEND | serial_tracking_enabled = on/off, but UI describes a default for new products | Global master-feature gate is not a new-product default; preserve optional/required serial semantics. |
| products.expiryTracking | EXTEND | expiry_tracking_enabled = on/off, global gate | Existing UI describes per-new-product behavior; keep master gate and default distinct. |
| products.costMethod | BLOCKED mapping | sale_costing_method and inventory_issue_method each FIFO/AVERAGE | UI options Average/FIFO/FEFO, while backend has two separate cost choices; FEFO is lot allocation, not an accounting valuation method. Requires precise product/inventory/POS policy contract, step-up. |
| purchases.purchaseReceipt | EXTEND | no purchase receipt prompt SettingKey | UX prompt must not imply server attachment enforcement. |
| purchases.defaultPayment | EXTEND | no purchase default method SettingKey | Distinct from POS and finance defaults; reference real account IDs in eventual connected mode. |
| purchases.purchaseApproval | EXTEND | no equivalent approval/pending workflow | No fake stock-posting approval queue; requires MOD-008 service design. |
| purchases.backdateDays | EXTEND | no matching purchase date limit | Coordinate MOD-008 and MOD-022 accounting period guards. |
| invoices.invoicePrefix | EXTEND | no invoice-prefix SettingsKey / invoice settings patch field | Existing numbering counters are posted-document state, not an editable prefix policy; immutable issued numbers preserved. |
| invoices.autoPrint | ADAPT (local only), EXTEND (synced) | separate invoice print offer, no backend key | Do not collapse into sales.autoPrint without documented scope. |
| finance.cashAccount, finance.mobileAccount, finance.bankAccount | EXTEND | no default-account SettingKey or bank/MFS account ID mapping | Real account ULIDs required; never persist Magic demo labels or use names as identifiers. MOD-006 owns account definitions. |
| finance.defaultPayment | EXTEND | no separate finance default method SettingKey | Preserve distinct money-in/out form default. |
| finance.cashSession | ADAPT; live transition BLOCKED until MOD-005 | cash_session_enabled on/off through POST settings/value | Value matches as bool→on/off; back-end behaviour/cash gate must obey approved ON/OFF transaction policy and cash PR reconciliation. No new cash service here. |
| finance.lockDate | EXTEND (defer MOD-022) | no SettingsKey; accounting period policy absent | Do not treat a preview lock date as protection of posted entries. |
| notifications.smsEnabled, notifications.smsSender, notifications.dueReminderDays, notifications.alertTime | EXTEND (defer MOD-017/MOD-021) | no complete tenant SMS settings/delivery/credit accounting | No real SMS dispatch, spend or schedule from preview flags. Maintain current UI. |
| personal.language, personal.dateFormat | ADAPT | client-only user preference; no tenant SettingKey | Preserve language options and date display; local scoped persistence after authenticated bootstrap, optional synced future API. |
| security.screenLock, security.lockMinutes, security.trustedDays, security.pinEnabled | BLOCKED for MOD-001, preserve | authentication/security contracts owned by MOD-000 and MOD-022 | Keep current controls; never submit real PIN or security promises to ordinary settings/value API. |

**Legacy preservation, not a claim of active Magic save:** src/settings/fields.ts and src/settings/model.ts additionally expose business nameBn/logo/email/website/financialYear/registration/regional/tax; sales barcode/customerPhone/guardian/address/rounding/shortage/discountLimit; products lowStock/defaultUnit/priceEntry/openingUnit/minimumUnit/allocation/serial/warranty/warrantyMonths/expiry/expiryDays; purchase memo/attachments/defaultAccount/approval/costAllocation; money closeCount/adjustment; invoice design/profiles/paper/showLogo/showBangla/footer/prefix/numbering/showSerial/showWarranty/showPurchaseCost/copies; and notification channel/recipients/time/expiryDays/dueDays/smsTemplate. These values stay in the preservation and downstream-consumer contract. The Magic view does not currently expose all of them; none may silently disappear through cutover. Re-evaluate scope after open Settings PR 274/279 disposition.

### 19.4 Backend SettingKey source/consumption catalogue

Canonical source: backend packages/core-contracts/src/settings.ts; controller apps/api/src/settings/settings.controller.ts; use case packages/core-application/src/settings/manage-settings-service.ts; persistence packages/adapter-postgres/src/settings-repository.ts, schema.ts and migrations/0005_settings.sql.

| Existing backend keys | Wire choice | Frontend fit / disposition |
|---|---|---|
| sale_costing_method; inventory_issue_method | FIFO / AVERAGE each; step-up password | BLOCKED for UI costMethod union; expose both only with approved distinct explanations. |
| negative_stock_policy; expired_stock_sale_policy | BLOCK / WARN / ALLOW | BLOCKED direct boolean; separate master inventory policy and product/lot behavior. |
| expiry_tracking_enabled; serial_tracking_enabled; warranty_enabled; product_offers_enabled | on / off; warranty requires serial | REUSE backend catalogue/read, but EXTEND UI default-vs-global distinction and consumer verification. |
| expiry_warn_days | 7 / 15 / 30 / 60 / 90 text | REUSE only for exact chosen enum; UI arbitrary numeric expiryDays is not automatically valid. |
| customer_groups_enabled; wholesale_sales_enabled; dealer_pricing_enabled | on / off; dealer requires groups + wholesale | REUSE backend catalog; EXTEND UI exposition if added under existing shell. |
| vendor_management_enabled; vendor_ledger_enabled; vendor_consignment_enabled | on / off; dependent cascades | REUSE setting read/write on approved section, verify actual consuming module. |
| bank_accounts_enabled; bank_reconciliation_enabled; cash_session_enabled | on / off; reconciliation requires bank accounts | REUSE key persistence; actual cash-session effects deferred MOD-005 (warning: catalogue inEffect is not consumer proof). |
| customer_field_address_visible, customer_field_guardian_visible, customer_field_nid_visible, customer_field_email_visible, customer_field_notes_visible | on / off | REUSE server catalogue; UI display defaults must not remove stored data; confirm real party-form consumers in MOD-004. |
| planner_look_back_days | 7 / 15 / 30 / 60 / 90 text | REUSE exact choices; no Magic direct control at inspected route. |
| planner_cover_days | 7 / 15 / 30 / 45 / 60 / 90 text | REUSE exact choices; no Magic direct control at inspected route. |

Every unknown key is refused by ManageSettingsService. Settings GET returns the explicit catalogue, effective values, businessName, timezone and supportedTimezones. POST one key at a time (not a whole section) and replace client state from returned SettingsResponse; surface all cascade warnings. TOGGLE uses Permission.SETTING_TOGGLE (settings.module.toggle); CHOICE and business profile use Permission.SETTING_EDIT (settings.setting.edit); GET uses Permission.SETTING_VIEW (settings.setting.view). Step-up uses caller password for costing choices, never a PIN. The service uses one UnitOfWork and audit; settings upserts are tenant+key scoped in PostgreSQL with version increment, while PATCH business updates tenants.name/timezone and audits. **The API DTO has no expectedRevision/CAS field**, so do not claim stale-write refusal or optimistic locking at the HTTP boundary. Define any needed CAS contract as a separate coordinator-owned extension and test it before enabling multi-editor overwrite-risk workflows.

### 19.5 Users, employees, roles and permissions

**Existing routes and exact wire contracts**
- GET /api/v1/users → data:{users:[{id,username,displayName,email,phone,roleId,roleName,disabled,hasPassword}],roles:[{id,code,name}]} with user.account.view.
- POST /api/v1/users → {displayName:string1..120,username:string3..50,identifier:valid phone or email,roleId:ULID26,confirmPassword:string1..200}; user.account.create. The caller confirms their own password; new user sets password through forgot-password; no invite token exists.
- PATCH /api/v1/users/:id → {displayName,roleId:ULID26,confirmPassword?:string}; user.account.edit, step-up if role changes. A role change revokes target sessions.
- POST /api/v1/users/:id/disabled → {disabled:boolean,confirmPassword}; user.account.disable, revoke sessions on disable; last Owner and self-disable refused.
- GET /api/v1/roles → data:{roles:[{id,code,name,isSystem,locked,permissions,cashRefundPerReturnMinor,cashRefundPerDayMinor,userCount}],catalogue:[{code,group,label,detail}]}; user.role.view.
- POST /api/v1/roles and PATCH /api/v1/roles/:id → {name:string2..60,permissions:string[] max200, cashRefundPerReturnMinor:int>=0|null, cashRefundPerDayMinor:int>=0|null,confirmPassword:string}; user.role.manage. Refund limits are **minor currency units** and not booleans.
- DELETE /api/v1/roles/:id **with JSON body** {confirmPassword}, HTTP 204; user.role.manage. Backend refuses Owner, shipped system roles and roles held by users.
- All IDs used on a live request are server-issued 26-char ULIDs. Unknown permission codes are refused, Owner retains all permissions, role permissions apply on next server request. **No user/role DTO currently contains an expected revision**.

**Active UI action-by-action:** Magic Team Add (name+preview role+active) is BLOCKED as a direct POST users request because it lacks username, identifier and caller step-up password. Magic Edit name is ADAPT after a valid existing user account/roleId exists, but editing the active toggle must use the separate disabled endpoint and step-up; do not send active inside PATCH users. Magic role string Sales has no proven canonical role ID: resolve from server catalogue or treat as an employee-only title, never map silently to Cashier. Magic Save is presently local preview, not proof of changed access. Legacy Employee Directory search, date filter, status, column picker, pagination and access details are REUSE in UI, but employee joinedDate, email independent of login account and multiple roleIds have no backend round-trip: EXTEND. Legacy role create/edit/delete UI is ADAPT to existing roles API only for validated permission keys and refund cap defaults; role management must never use browser canManage as authorization.

**Required lossless Stage B design (PROPOSED; no migration approved):**
1. Separate employee profiles from login identities. A tenant-scoped employee has stable employeeId (ULID), name, email/contact, optional joinedDate, active status, optional linked userId, and optimistic version. An employee without login must not consume a named-user seat or get an authentication session. The userId remains a unique credential principal.
2. Add many-to-many user-role assignments or an equivalent server-authoritative assignment model so multiple roles are effective, not just displayed; keep legacy primary roleId compatible until all authorization consumers migrate. Use union-of-grants, with explicit denials/owner safety designed against existing AccessControl; do not let fake local roles grant access.
3. Provide typed employee-list/create/update/link/deactivate operations after a coordinator-approved new resource and schema contract. Proposed employee create: {name,email,joinedDate?:YYYY-MM-DD,roleIds:ULID26[],active:boolean,linkedUserId?:ULID26|null,expectedVersion?:number}; response includes id, version, roleIds, linkedUserId and active. Authorization requires real user.account.* or a separately approved employee.* permission; do not mint a code from the UI label.
4. Preserve current user create/role update/disable routes for login principals; add additive roleIds fields/assignment service only after security review. Existing password step-up, last Owner constraints, session revocation, unique global identifier and auditing are mandatory.
5. Enforce **owner-approved named-user seats** in the server: Free=1, Counter=2, Pro=3, Plus=5 including owner; only login-enabled principals consume seats, not employee-only profiles. Grant a downgrade non-destructive treatment via MOD-021 rather than deleting employees or users. Current backend SaaS entitlement stub enforces none of these limits.
6. Concurrency risks: verify simultaneous last-Owner disable/re-role and parallel seat-consuming creates with lock/unique constraints; current countActiveWithRole by itself is not evidence of serialized race safety.

### 19.6 Invoice preferences: exact field-by-field map

Existing backend routes: GET/PUT /api/v1/sales/invoice-settings (read requires sale.invoice.view / SALE_VIEW; write settings.setting.edit / SETTING_EDIT); GET/POST/DELETE /api/v1/sales/invoice-logo (read sale view; write settings edit); PUT /api/v1/sales/:id/presentation (invoice.presentation edit), strictly **per existing sale**. Persistence: packages/adapter-postgres/src/sale-repository.ts findInvoiceSettings/saveInvoiceSettings on invoice_settings by tenantId, separate logo MIME/bytes, audit in InvoicePresentationService. Existing invoice settings PATCH-like body is **PUT** using strict partial invoiceSettingsSchema, not an arbitrary JSON blob.

| Existing UI field/action | Source backend field or method | Decision |
|---|---|---|
| paper a4 | defaultTemplate=A4 | ADAPT direct. |
| paper 80mm | defaultTemplate=THERMAL_80; thermalPaper=80mm | ADAPT; verify rendered width. |
| paper 58mm | defaultTemplate=THERMAL_80; thermalPaper=58mm | ADAPT only after rendered 58mm test; backend names template THERMAL_80 but carries separate width field. |
| paper pad and padOffset 0..100mm | businessPadEnabled=true, businessPadTopMm 0..150 | ADAPT semantics/EXTEND print-pack gate and actual pad renderer; do not equate pad to an ordinary sheet size. |
| lang en, bn | language=EN or BN | ADAPT exact. |
| lang mixed | no supported enum; current language only EN/BN | EXTEND additive MIXED render mode and backwards-compatible contract. |
| design standard/classic/compact/modern/elegant/bold | no six-design identifier | EXTEND versioned designId and renderer/gallery persistence. |
| accent palette/custom color | no accentHex | EXTEND validated contrast/hex/theme storage and print rendering. |
| content.logo | showLogo | ADAPT direct boolean; actual logo existence is a distinct server-derived fact. |
| content.businessInfo, customer, sku | showBusinessBlock, showCustomerBlock, showSku | ADAPT only where wording/rendering parity is verified. |
| content.discount, payments, due, amountWords, signatures | showDiscount, showPaymentBreakdown, showDue, showAmountInWords, showSignatureLines | ADAPT exact presentation flags, with hard money values unaffected. |
| content.phone, address, serial, warranty, servedBy, terms | no equivalent granular show* flags | EXTEND explicit per-element switches; terms/termsText store content but do not substitute for the visible toggle. |
| footer | footerText nullable | ADAPT; preserve blank meaning “use localized default” rather than persisting an unintended empty printed line. |
| customer/business phone and address in extended legacy preview | invoiceSettings.businessPhone/businessAddress/businessName optional printed overrides | ADAPT **printing only**; never overwrite canonical tenant business profile. |
| logo upload/remove | POST/DELETE invoice-logo; PNG/JPEG/WebP supported | REUSE with the legacy UI 250KB cap and backend maximum decoded 1.5MiB; display POST/DELETE result and refresh image. |
| invoicePrefix/numbering | no prefix in invoice settings schema | EXTEND separately through document numbering policy; never renumber issued invoices. |
| print preview, Compare, Restore defaults, premium modal/navigation | browser UI behavior | REUSE/preserve; Restore affects draft until confirmed save, and Print must use a real renderer before claiming printed. |
| showBangla/showSerial/showWarranty/showPurchaseCost/copies, ledger/report output profiles (legacy) | no direct complete contract | EXTEND or display-only, preserve all; **never expose purchase costs to customer receipt**, enforce role permission. |

Existing invoiceSettingsSchema also stores headerText, showHeaderText, invoiceTitle, businessNameEn, proprietorName, proprietorNote, businessDescription, businessPhone2, contactPhones, mfsNumbers, terms, paymentTermsDays, paymentTermsLabel, showBarcode, termsText, pageMarginMm and other options not surfaced in Magic Studio. They remain server data and must not be overwritten by a partial UI update. **hasLogo is accepted by the current partial Zod DTO but is deliberately omitted by Postgres saveInvoiceSettings and derived from logo bytes when read**; the connected adapter must never submit this computed field. A future DTO cleanup can mark it response-only without suggesting that source currently persists arbitrary hasLogo.

**Stage B proposed additive contract:** extend invoice settings with designId enum six values, language MIXED, accentHex validated RGB, explicit granular content visibility booleans, validated content defaults and a returned revision; accept expectedRevision/If-Match on changes and reject stale save atomically. Keep current invoiceSettings fields and backward-compatible default rendering. Business-pad entitlement and invoice-design grant must be checked in the server, not only the gallery; preserve offline/browser draft and old printed documents. Print invoice data must be based on server transaction facts, with never a client POST modifying quantity, price, due, cost or journal from this module.

### 19.7 Commercial entitlements and interface preferences

**Owner-authorized policy exists already:** frontend docs/superpowers/specs/2026-10-25-hisabiq-approved-business-model-decisions.md establishes Free=1 seat/500 active products, Counter=2/2,000, Pro=3/10,000, Plus=5/20,000; user-facing Basic=Free, Medium=Pro, Premium=Plus. Basic keeps the entire standard accounting path with fewer details; Pro enables links/context actions; Plus adds eligible rich information. Counter gets its named package benefits, not automatically all Pro richness. Independent purchased passes survive plan downgrade. The invoice-design pack is an optional one-time per-business ৳149 entitlement. **Owner decision, 2026-11-11:** this pack unlocks **only the five additional gallery templates** (`classic`, `compact`, `modern`, `elegant`, `bold`); the `standard` template stays available without this purchase. The pack **does not grant custom brand colors, the custom-color picker, or business-pad printing**. Those capabilities remain subject to their separately applicable plan/feature rights (the current Magic preview labels them Premium), not to this invoice-design-pack grant. The paid template grant persists independently through unrelated plan downgrade, per the earlier approved commercial policy. Template access must be enforced by the server and not inferred from the current preview `premium=false` flag.

**Current UI:** src/settings/magic/interface/experienceCatalog.ts declares stable capabilities, per-tier minimums, protected essential columns and server-sensitive permissions. src/settings/magic/interface/useInterfaceDraft.ts is only a preview resolver; it does not persist tenant or user overrides, and its sample PLUS is not account plan proof. Current backend subscription-entitlement-provider.ts returns ACTIVE, licensed=true, modules=[] (unrestricted). MOD-021 must produce authoritative plan, seat/quota and purchased-grant decisions before paid gating can be accepted as live; MOD-001 must never advertise an effective paid feature from this stub.

| Capability keys currently present | Stage A / Stage B |
|---|---|
| sales.links.customerLedger; sales.actions.receivePayment; sales.columns.paymentMethod; sales.columns.items; sales.columns.paymentBreakdown; sales.columns.profit | REUSE existing UI interactions where consumer implemented; EXTEND tenant/user override persistence and plan/role resolver, never grant view.profit from plan alone. |
| parties.links.invoice; parties.ledger.items; parties.ledger.expandedDetails; parties.ledger.directionIcons | REUSE implemented UI; EXTEND scoped persistence, role/plan evaluation and details policy. |
| products.columns.brand; products.columns.stockValue; products.links.stockHistory | REUSE stock value if existing consumer supports it; brand and stockHistory are marked implemented=false at this head, so preserve preview, BLOCK live advertised toggle until MOD-002/003 consumer. |
| purchases.links.supplierLedger | REUSE link if existing consumer; EXTEND scoped override if accepted. |
| dashboard.details.breakdowns; finance.links.sourceDocument | Both implemented=false in inspected catalogue: BLOCK live enabled claim; coordinate module owners. |

**Exact production permissions, not Magic pseudo-permissions:** backend inventory.cost.view governs cost disclosure, report.profit.view governs report/dashboard profit, sale.price.edit and sale.discount.apply govern checkout changes, sale.invoice.view governs invoice-settings reads and invoice-logo reads, settings.setting.edit governs invoice-settings/logo writes, and invoice.presentation.edit governs editing one invoice's print-only presentation. Frontend preview view.cost and view.profit are not actual Nest permission codes. A capability row cannot change any of these authorization decisions; data filtering remains server-side.

**Proposed interface preference contract, no endpoint authorized:** versioned resource scoped by actual tenant/user/session: GET effective capability snapshot including server plan/grants and permission codes; PATCH user override and authorized tenant default by literal registered capability key, typed value and expected revision; DELETE/reset override preserving inheritance. Resolver order: shipped baseline → tenant default → personal user override, always intersecting **server entitlement AND server role permission AND implemented consumer**; mandatory essentials never disappear. Ineligible grants remain stored for future upgrade but do not activate during downgrade. Sensitive cost/profit data is filtered by backend permission, not only hidden in a column. User-local appearance mode, density, language, dateView, terminology, searchMode may remain local **only after namespacing to verified tenantId/userId**; synchronizing across devices is a separate approved preference contract. Do not write them to financial settings/value.

### 19.8 Stage split, contracts, dependencies and exact future allowlists

**Stage A after approved MOD-000-A**
- T01-R (read): GET settings and typed catalogue/profile projection; do not activate Magic fixture fallbacks in connected mode. Frontend proposed files: src/integration/settings-team.ts (new), src/settings/magic/settingsBridge.ts, src/settings/magic/GeneralSettingsSection.tsx. Backend **REUSE, NO WRITES**.
- T01-W (narrow write): PATCH businessName + timezone and individually POST only exact approved SettingKey values. Preserve dirty drafts/review dialog; on complete success adopt returned server snapshot and all warnings; on rejection/unknown outcome preserve draft. Same frontend proposed files plus tests/integration-settings-team.test.ts; no local cash-session service edit.
- T02-R: GET actual users and roles; preserve team UI layout, status badges, role names, filters and role impact view. Frontend src/integration/settings-team.ts, src/settings/magic/TeamSettings.tsx; backend **REUSE, NO WRITES**.
- T02-W narrow: where existing Magic/modal fields are truly populated with valid username/identifier/role ULID and caller password, wire existing POST/PATCH/disable/role APIs. Do not silently create login from name-only Magic Add. Frontend src/settings/magic/TeamSettings.tsx, src/integration/settings-team.ts and focused tests. Backend **REUSE, NO WRITES**.
- T03-P: keep personal display/local UI modes with authenticated scoped local key and no server privilege; prospective source files src/settings/TenantSettingsProvider.tsx and src/contexts/UserPreferencesContext.tsx are **coordinator-shared** and require explicit reservation. Interface override server work is not Stage A.
- T04-R/W: GET/PUT compatible invoice settings, POST/DELETE logo, render server-confirmed flags with the existing Studio UI and preserve draft; proposed frontend src/integration/invoice-preferences.ts (new), src/settings/magic/invoice/InvoiceStudio.tsx, src/settings/magic/invoice/invoiceState.ts, focused tests. Backend **REUSE, NO WRITES**. Document-specific presentation editor belongs to sale source context, not this shared design save.

**Stage B, separate contract amendments and coordinator dispatch:** employee_profile + role assignment model (MOD-001 with MOD-000 security approval), business contacts/preferences persistence, precise backend enum/default policies (consuming MOD-002/003/004/007/008), user/tenant interface override service and real subscription entitlements (MOD-021), invoice design/theme/print-pack + mixed language rendering, and accountant-period/security/SMS/cash ownership in MOD-022/MOD-017/MOD-005. No general-purpose JSONB settings catch-all and no new HTTP resource without validated input/output, ownership, audit, uniqueness, RLS, migration and negative tests.

**Proposed backend amendment paths, NOT writable under this review:** packages/core-contracts/src/settings.ts, users.ts, roles.ts, sales.ts, permissions.ts; packages/core-application/src/settings/manage-settings-service.ts, users/manage-users-service.ts, users/manage-roles-service.ts, sales/invoice-presentation-service.ts; apps/api/src/settings/settings.controller.ts, users/users.controller.ts, users/roles.controller.ts, sales/sales.controller.ts; packages/adapter-postgres/src/schema.ts, settings-repository.ts, sale-repository.ts and a coordinator-reserved new forward-only migration. New employee/experience preference services and tables are **TBD approved exact names**, not a blanket write allowance. Shared exports, auth, entitlement provider, migrations and platform plan services are exclusively coordinator-owned until separate issue approval.

**Only currently allowed write path for a documentation-only review branch:** docs/integration/modules/MOD-001-settings-team.md. No edits to AGENTS.md, master plan, REVIEW, EXECUTION, contract docs, authentication, cash-session services or application code. A docs PR does not reserve a build worker or satisfy MOD-000 completion. The coordinator must bind an approved task to real issue number, paired accepted source heads, one unique session owner, exact file subset, disposable DB identity, executor, test commands, independent QA and rollback before implementation.

### 19.9 Meaningful test contract and acceptance

The tests below are **required future evidence**, not tests claimed to have been run during this GitHub review.

| Area | Positive assertions | Negative, isolation, concurrency and UI assertions |
|---|---|---|
| Settings GET / PATCH | Exact profile and permitted catalogue; persisted tenant.name/timezone after reload; permissions checked | Missing setting.view/edit/toggle; unsupported timezone; wrong key/value; second tenant remains unchanged; expired session clears cache. |
| Single-key POST | one key changes, audit before/after; dependent feature cascades inside UOW; all warnings shown; costing change needs caller password | Unknown key 4xx, disallowed enum, missing parent, wrong password, permission revoked after load, race/stale behavior documented as last-writer-wins until CAS is approved. |
| UI draft mechanics | fields keep focus; review/restore/discard; successful save updates from data, never preview fallback | API 401/403/404/422/5xx/timeout, aborted tenant switch, unknown POST result and failed refresh preserve draft/error; no fake “Saved” or fixture actor re-authorizes. |
| Users | real ULID role mapping; create credential-less account; renaming/role change/disable and correct response; sessions revoked when required | Missing required Magic Add inputs, duplicate global identifier, wrong step-up, self/last Owner removal, concurrent last Owner race, parallel seat cap, cross-tenant user 404, sensitive hashes never serialized. |
| Roles | server catalogue labels, managed grants, refund caps in minor units, edit and custom deletion with 204/body/password | Unknown permission, Owner reduction, delete shipped/used role, role revoked after load, cross-tenant ULID, role cap validation, privilege never based on frontend preview RBAC. |
| Interface + plan | Free baseline path, Pro links, Plus rich columns, Counter's distinct benefits; eligible user/tenant override precedence; paid add-on survives downgrade | server entitlement/permission intersection; no cost/profit disclosure by hidden column, no gain of paid capabilities through saved overrides; previews for implemented=false consumers not called live. |
| Invoice | full GET and narrow PUT round-trip; 58/80/A4 print snapshots, BN/EN (and MIXED after extension), real logo fetch/upload/remove, footer/flag persistence; `standard` template available on Free and five extra templates available from the approved ৳149 grant or an independently eligible plan | unrelated source fields unchanged by partial write, read-only hasLogo ignored, wrong MIME/size, closed session, wrong rights, stale design version conflict, forbidden paid template, pack must **not** unlock custom colors or business-pad printing, pack remains available after downgrade, no sale totals/journal change. |
| Preservation | existing nav/tabs/modals, 36px inputs, typography and Bangla helper; keyboard Escape/Enter/focus, search/filters; 320/390/768/820/1440 widths and light/dark, actual React component screenshots | no removed legacy workflow, no localStorage tenant cross-contamination, no unimplemented operation represented as live; print stays correct and original invoices remain immutable. |

Run exact focused typecheck/lint/unit/integration/browser scripts selected from **the pinned repositories' package files**, not guessed CLI commands. A named runner must record runtime version, Node/package manager/lockfile, exact GitHub heads, command and exit status; use a fresh disposable PostgreSQL 16 instance bound to a verified test database (never retained dev or production). A real React → Nest API → service → PostgreSQL → React test must prove persistence, tenant/role isolation, audit and negative responses; backend Vue-only tests are insufficient. Independently QA the candidate SHA and manually approve any merge. Rollback for Stage A UI wiring is revert candidate commit + restore prior preview route only in an explicitly preview workspace; do not lose user edits or modify posted documents.

### 19.10 Unresolved owner question and dispatch stop signs

**Already decided; do not ask again:** Free/Counter/Pro/Plus names, monthly rates, named-user quotas, Basic/Medium/Premium presentation tiers, permanent Free, paid add-on survival, no fee for standard invoice printing, employee permission separation, and preservation of all existing HisabIQ features.

**Owner decision RESOLVED, 2026-11-11:** the ৳149 one-time invoice-design pack unlocks **only five additional invoice templates** (`classic`, `compact`, `modern`, `elegant`, `bold`), while the standard template remains free. It explicitly **does not** unlock custom colors or business-pad printing. These must be checked against their separate plan/feature entitlements; do not infer that pack ownership grants them. No further owner question about the pack's included features is open. This is approval of this commercial inclusion rule **only**, not approval to implement MOD-001, modify MOD-021, change pricing, or merge.

**Engineering decisions resolved as engineering constraints, not questions for the owner:** name-only Magic staff input cannot create a login; employee profile and login principal differ; backend one-role assignment cannot represent roleIds union; FEFO is not costing method; false/true negative stock cannot round-trip BLOCK/WARN/ALLOW; printed business overrides are not canonical tenant profile; cash-session frontend local toggle is not a backend policy gate; subscription stub means no real plan entitlement; hasLogo is derived on DB read; local personalKey is not user scoped; standard Magic Save is preview only. Each must use source-aware adapter or a complete cross-module contract, never an arbitrary builder guess.

**STOP:** Do not implement before MOD-000 accepted head is available, this module plan has explicit owner approval, coordinator verifies max_workers=1 and reserves a slot, actual overlapping PR disposition is known, and each task has an exact source-compatible write allowlist and evidence/test scope. No migration number or implementation issue is reserved in this document.


### 19.11 Owner approval recorded — 2026-11-12

**Approval:** In the HisabIQ_UI project conversation, immediately after the MOD-001 full-source plan and draft PR #287 were presented for review, the owner replied **“Approved”**. This accepts the complete MOD-001 integration **plan revision** including the previously approved **৳149 templates-only** invoice design pack (the five extra templates, excluding custom colors and business-pad printing), Stage A/Stage B split, source-traced mapping, preservation requirements, proposed technical direction and verification criteria. It resolves the packet's **owner-approval gate**, not its engineering/build-readiness gates.

**Approval target:** frontend `shuvodelux-commits/hisabiq_ui` draft PR #287 and the MOD-001 packet at head `3330e89328238e5662052967b97fce9a27f4b876` (immediately before this approval-record amendment). Frontend comparison baseline `2e16821ba622192c69e5f5cc83aba93f70ec0638`; backend adoption baseline `74bb37f2ae6441689b1ee73f0c7ce51e03bcb1f5`. This approval-record amendment changes no implementation requirements.

**Still blocked for implementation:** accepted MOD-000 dependency head and bootstrap contract; source recheck and dispositions for overlapping open PRs; coordinator-validated exclusive worker availability/reservation (`max_workers=1`); issue/task split and exact write allowlists, including exclusive shared-file control; full typed contract/storage/amendment for each Stage B gap; named runner and disposable PostgreSQL, permission/concurrency tests, and independent QA. No coordinator assignment, issue dispatch, application edit, database migration, merge, deployment or production test is authorized or claimed by this approval. Keep this documentation PR in draft for review and human-controlled merge.

