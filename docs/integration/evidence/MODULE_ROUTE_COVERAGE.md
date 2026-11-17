# Route-to-packet coverage

Every explicit path declaration in pinned App.tsx. Nested /app and /saas routes retain their parent prefix; redirects/index routes are preserved under MOD-000. This maps responsibility, not proof every button is specified.

| Declared path | Parent | Packet / disposition | Source |
|---|---|---|---|
| `/` | `public` | MOD-000 | [App.tsx:71](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L71) |
| `/design-system` | `public` | MOD-000 | [App.tsx:72](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L72) |
| `/login` | `public` | MOD-000 | [App.tsx:73](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L73) |
| `/login/pin` | `public` | MOD-000 | [App.tsx:74](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L74) |
| `/login/accounts` | `public` | MOD-000 | [App.tsx:75](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L75) |
| `/signup` | `public` | MOD-000 | [App.tsx:76](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L76) |
| `/register` | `public` | MOD-000 | [App.tsx:77](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L77) |
| `/login/signup` | `public` | MOD-000 | [App.tsx:78](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L78) |
| `/recovery` | `public` | MOD-000 | [App.tsx:79](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L79) |
| `/forgot-password` | `public` | MOD-000 | [App.tsx:80](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L80) |
| `/login/recovery` | `public` | MOD-000 | [App.tsx:81](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L81) |
| `/saas` | `/saas` | MOD-021 | [App.tsx:82](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L82) |
| `home` | `/saas` | MOD-021 | [App.tsx:84](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L84) |
| `tenants` | `/saas` | MOD-021 | [App.tsx:85](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L85) |
| `tenants/:tenantId` | `/saas` | MOD-021 | [App.tsx:86](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L86) |
| `subscriptions` | `/saas` | MOD-021 | [App.tsx:87](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L87) |
| `invoices` | `/saas` | MOD-021 | [App.tsx:88](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L88) |
| `payments` | `/saas` | MOD-021 | [App.tsx:89](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L89) |
| `refunds` | `/saas` | MOD-021 | [App.tsx:90](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L90) |
| `plans` | `/saas` | MOD-021 | [App.tsx:91](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L91) |
| `addons` | `/saas` | MOD-021 | [App.tsx:92](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L92) |
| `offers` | `/saas` | MOD-021 | [App.tsx:93](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L93) |
| `packages` | `/saas` | MOD-021 | [App.tsx:94](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L94) |
| `tickets` | `/saas` | MOD-021 | [App.tsx:95](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L95) |
| `support` | `/saas` | MOD-021 | [App.tsx:96](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L96) |
| `services` | `/saas` | MOD-021 | [App.tsx:97](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L97) |
| `sms` | `/saas` | MOD-021 | [App.tsx:98](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L98) |
| `data-requests` | `/saas` | MOD-021 | [App.tsx:99](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L99) |
| `knowledge` | `/saas` | MOD-021 | [App.tsx:100](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L100) |
| `team` | `/saas` | MOD-021 | [App.tsx:101](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L101) |
| `announcements` | `/saas` | MOD-021 | [App.tsx:102](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L102) |
| `reports` | `/saas` | EXCLUDED — preserve | [App.tsx:103](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L103) |
| `audit` | `/saas` | MOD-021 | [App.tsx:104](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L104) |
| `settings` | `/saas` | MOD-021 | [App.tsx:105](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L105) |
| `*` | `/saas` | MOD-021 | [App.tsx:106](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L106) |
| `/app` | `/app` | MOD-000 route container/redirect | [App.tsx:108](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L108) |
| `subscription` | `/app` | MOD-021 | [App.tsx:110](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L110) |
| `support` | `/app` | MOD-021 | [App.tsx:110](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L110) |
| `support/:id` | `/app` | MOD-021 | [App.tsx:110](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L110) |
| `settings` | `/app` | MOD-001 / MOD-020 / MOD-022 | [App.tsx:111](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L111) |
| `settings/:section` | `/app` | MOD-001 / MOD-020 / MOD-022 | [App.tsx:112](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L112) |
| `settings/:section/:id` | `/app` | MOD-001 / MOD-020 / MOD-022 | [App.tsx:113](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L113) |
| `dashboard` | `/app` | MOD-016 | [App.tsx:114](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L114) |
| `search` | `/app` | MOD-016 | [App.tsx:115](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L115) |
| `pos` | `/app` | MOD-007 | [App.tsx:116](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L116) |
| `counter` | `/app` | MOD-006 | [App.tsx:117](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L117) |
| `recycle-bin` | `/app` | MOD-020 | [App.tsx:118](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L118) |
| `sales` | `/app` | MOD-007 | [App.tsx:119](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L119) |
| `quotations` | `/app` | MOD-010 | [App.tsx:120](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L120) |
| `online-sales` | `/app` | MOD-017 | [App.tsx:121](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L121) |
| `notifications` | `/app` | MOD-017 | [App.tsx:122](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L122) |
| `warranty` | `/app` | MOD-013 | [App.tsx:123](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L123) |
| `reconciliation` | `/app` | MOD-014 | [App.tsx:124](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L124) |
| `finance` | `/app` | MOD-006 | [App.tsx:125](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L125) |
| `daybook` | `/app` | MOD-015 | [App.tsx:126](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L126) |
| `accounts` | `/app` | MOD-006 | [App.tsx:127](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L127) |
| `audit-ledger` | `/app` | MOD-015 | [App.tsx:128](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L128) |
| `products` | `/app` | MOD-002 / MOD-003 / MOD-019 | [App.tsx:129](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L129) |
| `parties` | `/app` | MOD-004 | [App.tsx:130](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L130) |
| `purchases` | `/app` | MOD-008 / MOD-009 | [App.tsx:131](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L131) |
| `vendors` | `/app` | MOD-011 | [App.tsx:132](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L132) |
| `vendors-v2` | `/app` | MOD-011 | [App.tsx:133](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L133) |
| `purchases/new` | `/app` | MOD-008 | [App.tsx:134](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L134) |
| `expenses` | `/app` | MOD-012 | [App.tsx:135](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L135) |
| `reports` | `/app` | EXCLUDED — preserve | [App.tsx:136](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L136) |
| `*` | `/app` | MOD-000 route container/redirect | [App.tsx:138](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L138) |
