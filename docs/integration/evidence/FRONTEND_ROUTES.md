# Frontend route census

Every Route declaration in the pinned App.tsx; nested paths are relative to their parent. Redirects and design guide are retained.

| Line | Declaration |
|---|---|
| [71](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L71) | `<Route path="/" element={<Navigate to="/app/dashboard" replace />} />` |
| [72](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L72) | `<Route path="/design-system" element={<PageBoundary><BrandGuide /></PageBoundary>} />` |
| [73](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L73) | `<Route path="/login" element={<PageBoundary><LoginPreviewPage view="password" /></PageBoundary>} />` |
| [74](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L74) | `<Route path="/login/pin" element={<PageBoundary><LoginPreviewPage view="pin" /></PageBoundary>} />` |
| [75](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L75) | `<Route path="/login/accounts" element={<PageBoundary><LoginPreviewPage view="accounts" /></PageBoundary>} />` |
| [76](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L76) | `<Route path="/signup" element={<PageBoundary><SignupPreviewPage /></PageBoundary>} />` |
| [77](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L77) | `<Route path="/register" element={<Navigate to="/signup" replace />} />` |
| [78](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L78) | `<Route path="/login/signup" element={<Navigate to="/signup" replace />} />` |
| [79](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L79) | `<Route path="/recovery" element={<PageBoundary><RecoveryPreviewPage /></PageBoundary>} />` |
| [80](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L80) | `<Route path="/forgot-password" element={<Navigate to="/recovery" replace />} />` |
| [81](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L81) | `<Route path="/login/recovery" element={<Navigate to="/recovery" replace />} />` |
| [82](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L82) | `<Route path="/saas" element={<MagicSaasEntry />}>` |
| [83](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L83) | `<Route index element={<Navigate to="home" replace />} />` |
| [84](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L84) | `<Route path="home" element={<MagicMyWork />} />` |
| [85](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L85) | `<Route path="tenants" element={<MagicBusinesses />} />` |
| [86](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L86) | `<Route path="tenants/:tenantId" element={<MagicTenantWorkspace />} />` |
| [87](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L87) | `<Route path="subscriptions" element={<MagicSubscriptions />} />` |
| [88](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L88) | `<Route path="invoices" element={<MagicInvoices />} />` |
| [89](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L89) | `<Route path="payments" element={<MagicPayments />} />` |
| [90](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L90) | `<Route path="refunds" element={<MagicRefunds />} />` |
| [91](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L91) | `<Route path="plans" element={<MagicPackagesOffers view="plans" />} />` |
| [92](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L92) | `<Route path="addons" element={<MagicPackagesOffers view="addons" />} />` |
| [93](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L93) | `<Route path="offers" element={<MagicPackagesOffers view="offers" />} />` |
| [94](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L94) | `<Route path="packages" element={<Navigate to="/saas/plans" replace />} />` |
| [95](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L95) | `<Route path="tickets" element={<MagicTickets />} />` |
| [96](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L96) | `<Route path="support" element={<MagicSupportAccessQueue />} />` |
| [97](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L97) | `<Route path="services" element={<MagicServices />} />` |
| [98](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L98) | `<Route path="sms" element={<MagicSmsAdmin />} />` |
| [99](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L99) | `<Route path="data-requests" element={<MagicDataRequests />} />` |
| [100](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L100) | `<Route path="knowledge" element={<MagicKnowledgeBase />} />` |
| [101](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L101) | `<Route path="team" element={<MagicTeam />} />` |
| [102](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L102) | `<Route path="announcements" element={<MagicAnnouncements />} />` |
| [103](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L103) | `<Route path="reports" element={<MagicPlatformReports />} />` |
| [104](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L104) | `<Route path="audit" element={<MagicAuditLog />} />` |
| [105](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L105) | `<Route path="settings" element={<MagicPlatformSettings />} />` |
| [106](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L106) | `<Route path="*" element={<Navigate to="/saas/home" replace />} />` |
| [108](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L108) | `<Route path="/app" element={<AppShell />}>` |
| [109](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L109) | `<Route index element={<Navigate to="dashboard" replace />} />` |
| [110](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L110) | `<Route path="subscription" element={<TenantSubscription />} /><Route path="support" element={<TenantSupport />} /><Route path="support/:id" element={<TenantSupport detail />} />` |
| [111](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L111) | `<Route path="settings" element={<TenantSettingsPage />} />` |
| [112](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L112) | `<Route path="settings/:section" element={<TenantSettingsPage />} />` |
| [113](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L113) | `<Route path="settings/:section/:id" element={<TenantSettingsPage />} />` |
| [114](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L114) | `<Route path="dashboard" element={<Dashboard />} />` |
| [115](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L115) | `<Route path="search" element={<GlobalSearch />} />` |
| [116](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L116) | `<Route path="pos" element={<Pos />} />` |
| [117](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L117) | `<Route path="counter" element={<Finance counterOnly />} />` |
| [118](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L118) | `<Route path="recycle-bin" element={<RecycleBin />} />` |
| [119](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L119) | `<Route path="sales" element={<Sales />} />` |
| [120](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L120) | `<Route path="quotations" element={<Quotations />} />` |
| [121](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L121) | `<Route path="online-sales" element={<OnlineSales />} />` |
| [122](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L122) | `<Route path="notifications" element={<ErpNotifications />} />` |
| [123](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L123) | `<Route path="warranty" element={<Warranty />} />` |
| [124](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L124) | `<Route path="reconciliation" element={<Reconciliation />} />` |
| [125](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L125) | `<Route path="finance" element={<Finance />} />` |
| [126](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L126) | `<Route path="daybook" element={<Daybook />} />` |
| [127](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L127) | `<Route path="accounts" element={<Accounts />} />` |
| [128](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L128) | `<Route path="audit-ledger" element={<AuditLedger />} />` |
| [129](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L129) | `<Route path="products" element={<Products />} />` |
| [130](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L130) | `<Route path="parties" element={<Parties />} />` |
| [131](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L131) | `<Route path="purchases" element={<Purchases />} />` |
| [132](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L132) | `<Route path="vendors" element={<Vendors />} />` |
| [133](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L133) | `<Route path="vendors-v2" element={<VendorV2 />} />` |
| [134](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L134) | `<Route path="purchases/new" element={<PurchaseEditor />} />` |
| [135](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L135) | `<Route path="expenses" element={<Expenses />} />` |
| [136](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L136) | `<Route path="reports" element={<Reports />} />` |
| [138](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L138) | `<Route path="*" element={<Navigate to="/" replace />} />` |
