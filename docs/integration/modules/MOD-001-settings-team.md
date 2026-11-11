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
