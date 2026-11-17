# Application service and repository evidence

Static index of public async methods, permission references, audit/outbox declarations, transaction calls and adapter table references. These are exact source anchors, not test outcomes. Read connected methods before design approval.

## ListAuditEventsService
File: [packages/core-application/src/audit/list-audit-events-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/audit/list-audit-events-service.ts#L1)

| Line | Declaration |
|---|---|
| [49](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/audit/list-audit-events-service.ts#L49) | `async list(command: ListAuditEventsCommand): Promise<AuditListResponse> {` |
| [53](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/audit/list-audit-events-service.ts#L53) | `return this.uow.run(ctx, async (tx) => {` |
| [54](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/audit/list-audit-events-service.ts#L54) | `await this.accessControl.require(tx, ctx, Permission.AUDIT_VIEW);` |
| [67](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/audit/list-audit-events-service.ts#L67) | `action: command.action,` |
| [118](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/audit/list-audit-events-service.ts#L118) | `action: row.action,` |
## RecordPermissionDenialService
File: [packages/core-application/src/audit/record-permission-denial-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/audit/record-permission-denial-service.ts#L1)

| Line | Declaration |
|---|---|
| [44](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/audit/record-permission-denial-service.ts#L44) | `async record(command: RecordPermissionDenialCommand): Promise<void> {` |
| [47](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/audit/record-permission-denial-service.ts#L47) | `await this.uow.run(ctx, async (tx) => {` |
| [54](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/audit/record-permission-denial-service.ts#L54) | `action: 'DENIED',` |
## ChangeCredentialsService
File: [packages/core-application/src/auth/change-credentials-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/change-credentials-service.ts#L1)

| Line | Declaration |
|---|---|
| [78](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/change-credentials-service.ts#L78) | `async changePassword(command: ChangePasswordCommand): Promise<void> {` |
| [89](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/change-credentials-service.ts#L89) | `await this.uow.run(ctx, async (tx) => {` |
| [125](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/change-credentials-service.ts#L125) | `action: replacing ? 'PASSWORD_CHANGED' : 'PASSWORD_SET',` |
| [139](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/change-credentials-service.ts#L139) | `async changePin(command: ChangePinCommand): Promise<void> {` |
| [146](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/change-credentials-service.ts#L146) | `await this.uow.run(ctx, async (tx) => {` |
| [160](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/change-credentials-service.ts#L160) | `action: replacing ? 'PIN_CHANGED' : 'PIN_SET',` |
| [169](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/change-credentials-service.ts#L169) | `async read(ctx: TenantContext): Promise<SecuritySettings> {` |
| [170](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/change-credentials-service.ts#L170) | `return this.uow.run(ctx, async (tx) => {` |
| [191](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/change-credentials-service.ts#L191) | `private async authorize(` |
## CompleteRegistrationService
File: [packages/core-application/src/auth/complete-registration-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/complete-registration-service.ts#L1)

| Line | Declaration |
|---|---|
| [97](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/complete-registration-service.ts#L97) | `async execute(command: CompleteRegistrationCommand): Promise<RegistrationResponse> {` |
| [120](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/complete-registration-service.ts#L120) | `const outcome = await this.uow.run(ctx, (tx) =>` |
| [128](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/complete-registration-service.ts#L128) | `private async register(` |
| [193](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/complete-registration-service.ts#L193) | `private async verifyOtp(tx: Tx, identifier: string, submitted: string): Promise<Outcome  /  null> {` |
## GetDashboardSummaryService
File: [packages/core-application/src/auth/get-dashboard-summary-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/get-dashboard-summary-service.ts#L1)

| Line | Declaration |
|---|---|
| [25](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/get-dashboard-summary-service.ts#L25) | `async execute(ctx: TenantContext): Promise<DashboardSummaryResponse> {` |
| [26](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/get-dashboard-summary-service.ts#L26) | `return this.uow.run(ctx, async (tx) => {` |
## GetMyAccessService
File: [packages/core-application/src/auth/get-my-access-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/get-my-access-service.ts#L1)

| Line | Declaration |
|---|---|
| [37](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/get-my-access-service.ts#L37) | `async execute(ctx: TenantContext): Promise<MyAccessResponse> {` |
| [38](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/get-my-access-service.ts#L38) | `return this.uow.run(ctx, async (tx) => {` |
## LoginService
File: [packages/core-application/src/auth/login-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/login-service.ts#L1)

| Line | Declaration |
|---|---|
| [64](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/login-service.ts#L64) | `async withPassword(command: LoginWithPasswordCommand): Promise<LoginResponse> {` |
| [89](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/login-service.ts#L89) | `async withGoogle(command: LoginWithGoogleCommand): Promise<LoginResponse> {` |
| [93](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/login-service.ts#L93) | `const known = await this.uow.runWithoutTenant((tx) =>` |
| [112](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/login-service.ts#L112) | `async withPin(command: LoginWithPinCommand): Promise<LoginResponse> {` |
| [115](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/login-service.ts#L115) | `const outcome = await this.uow.runWithoutTenant<LoginResponse  /  null>(` |
| [146](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/login-service.ts#L146) | `async refresh(refreshToken: string): Promise<LoginResponse> {` |
| [149](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/login-service.ts#L149) | `return this.uow.runWithoutTenant(async (tx, adoptTenant) => {` |
| [166](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/login-service.ts#L166) | `async logout(refreshToken: string): Promise<void> {` |
| [169](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/login-service.ts#L169) | `await this.uow.runWithoutTenant(async (tx, adoptTenant) => {` |
| [181](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/login-service.ts#L181) | `action: 'LOGOUT',` |
| [194](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/login-service.ts#L194) | `private async signIn(` |
| [198](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/login-service.ts#L198) | `const outcome = await this.uow.runWithoutTenant<LoginResponse  /  null>(` |
| [230](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/login-service.ts#L230) | `private async liveSession(tx: Tx, tokenHash: string) {` |
| [242](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/login-service.ts#L242) | `private async issue(` |
| [266](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/login-service.ts#L266) | `action: 'LOGIN',` |
| [280](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/login-service.ts#L280) | `private async recordFailure(tx: Tx, ctx: TenantContext, method: string): Promise<void> {` |
| [284](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/login-service.ts#L284) | `action: 'LOGIN_FAILED',` |
## RegisterWithGoogleService
File: [packages/core-application/src/auth/register-with-google-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/register-with-google-service.ts#L1)

| Line | Declaration |
|---|---|
| [71](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/register-with-google-service.ts#L71) | `async execute(command: RegisterWithGoogleCommand): Promise<RegistrationResponse> {` |
| [87](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/register-with-google-service.ts#L87) | `return this.uow.run(ctx, async (tx) => {` |
## RequestPasswordResetService
File: [packages/core-application/src/auth/request-password-reset-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/request-password-reset-service.ts#L1)

| Line | Declaration |
|---|---|
| [51](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/request-password-reset-service.ts#L51) | `async execute(command: RequestPasswordResetCommand): Promise<RequestPasswordResetResponse> {` |
| [61](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/request-password-reset-service.ts#L61) | `return this.uow.runWithoutTenant(async (tx, adoptTenant) => {` |
| [70](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/request-password-reset-service.ts#L70) | `action: 'SEND_SUPPRESSED',` |
| [106](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/request-password-reset-service.ts#L106) | `action: 'SEND',` |
## RequestSignupOtpService
File: [packages/core-application/src/auth/request-signup-otp-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/request-signup-otp-service.ts#L1)

| Line | Declaration |
|---|---|
| [49](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/request-signup-otp-service.ts#L49) | `async execute(command: RequestSignupOtpCommand): Promise<RequestSignupOtpResponse> {` |
| [59](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/request-signup-otp-service.ts#L59) | `return this.uow.runWithoutTenant(async (tx) => {` |
| [68](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/request-signup-otp-service.ts#L68) | `action: 'SEND_SUPPRESSED',` |
| [95](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/request-signup-otp-service.ts#L95) | `action: 'SEND',` |
## ResetPasswordService
File: [packages/core-application/src/auth/reset-password-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/reset-password-service.ts#L1)

| Line | Declaration |
|---|---|
| [73](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/reset-password-service.ts#L73) | `async execute(command: ResetPasswordCommand): Promise<void> {` |
| [91](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/reset-password-service.ts#L91) | `const outcome = await this.uow.runWithoutTenant<Outcome>((tx, adoptTenant) =>` |
| [98](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/reset-password-service.ts#L98) | `private async reset(` |
| [152](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/reset-password-service.ts#L152) | `action: 'PASSWORD_RESET',` |
## VerifySignupOtpService
File: [packages/core-application/src/auth/verify-signup-otp-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/verify-signup-otp-service.ts#L1)

| Line | Declaration |
|---|---|
| [48](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/verify-signup-otp-service.ts#L48) | `async execute(command: VerifySignupOtpCommand): Promise<void> {` |
| [58](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/verify-signup-otp-service.ts#L58) | `const outcome = await this.uow.runWithoutTenant((tx) =>` |
| [72](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/auth/verify-signup-otp-service.ts#L72) | `private async check(tx: Tx, identifier: string, submitted: string): Promise<Outcome> {` |
## ArchiveOpenError
File: [packages/core-application/src/backup/backup-ports.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/backup/backup-ports.ts#L1)

| Line | Declaration |
|---|---|
## BackupService
File: [packages/core-application/src/backup/backup-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/backup/backup-service.ts#L1)

| Line | Declaration |
|---|---|
| [85](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/backup/backup-service.ts#L85) | `async status(command: BackupStatusCommand): Promise<BackupStatusResponse> {` |
| [90](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/backup/backup-service.ts#L90) | `return this.uow.run(ctx, async (tx) => {` |
| [91](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/backup/backup-service.ts#L91) | `await this.access.require(tx, ctx, Permission.BACKUP_EXPORT);` |
| [126](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/backup/backup-service.ts#L126) | `async exportNow(command: ExportBackupCommand): Promise<ExportedArchive> {` |
| [129](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/backup/backup-service.ts#L129) | `await this.uow.run(ctx, async (tx) => {` |
| [130](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/backup/backup-service.ts#L130) | `await this.access.require(tx, ctx, Permission.BACKUP_EXPORT);` |
| [148](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/backup/backup-service.ts#L148) | `async replaceSecret(command: ReplaceSecretCommand): Promise<void> {` |
| [151](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/backup/backup-service.ts#L151) | `await this.uow.run(ctx, async (tx) => {` |
| [152](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/backup/backup-service.ts#L152) | `await this.access.require(tx, ctx, Permission.BACKUP_EXPORT);` |
| [159](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/backup/backup-service.ts#L159) | `await this.uow.run(ctx, async (tx) => {` |
| [163](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/backup/backup-service.ts#L163) | `action: hadOne ? 'BACKUP_SECRET_REPLACED' : 'BACKUP_SECRET_SET',` |
| [176](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/backup/backup-service.ts#L176) | `async runAutomatic(ctx: TenantContext): Promise<ExportedArchive> {` |
| [186](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/backup/backup-service.ts#L186) | `private async run(` |
| [202](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/backup/backup-service.ts#L202) | `await this.uow.run(ctx, async (tx) => {` |
| [225](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/backup/backup-service.ts#L225) | `await this.uow.run(ctx, async (tx) => {` |
| [241](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/backup/backup-service.ts#L241) | `action: kind === 'AUTO' ? 'BACKUP_AUTOMATIC' : 'BACKUP_EXPORTED',` |
| [254](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/backup/backup-service.ts#L254) | `await this.uow.run(ctx, async (tx) => {` |
| [272](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/backup/backup-service.ts#L272) | `private async buildArchive(` |
| [277](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/backup/backup-service.ts#L277) | `const { tables, businessName, evidenceBytes } = await this.uow.run(ctx, async (tx) => ({` |
| [316](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/backup/backup-service.ts#L316) | `private async pruneOldArchives(): Promise<void> {` |
## ResetBusinessService
File: [packages/core-application/src/backup/reset-business-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/backup/reset-business-service.ts#L1)

| Line | Declaration |
|---|---|
| [55](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/backup/reset-business-service.ts#L55) | `async reset(command: ResetBusinessCommand): Promise<ResetResultResponse> {` |
| [58](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/backup/reset-business-service.ts#L58) | `await this.uow.run(ctx, async (tx) => {` |
| [59](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/backup/reset-business-service.ts#L59) | `await this.access.require(tx, ctx, Permission.BUSINESS_RESET);` |
| [80](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/backup/reset-business-service.ts#L80) | `const rowsCleared = await this.uow.run(ctx, async (tx) => {` |
| [87](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/backup/reset-business-service.ts#L87) | `action: 'BUSINESS_RESET',` |
## RestoreService
File: [packages/core-application/src/backup/restore-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/backup/restore-service.ts#L1)

| Line | Declaration |
|---|---|
| [64](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/backup/restore-service.ts#L64) | `async inspect(command: InspectArchiveCommand): Promise<ArchivePreviewResponse> {` |
| [68](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/backup/restore-service.ts#L68) | `return this.uow.run(ctx, async (tx) => {` |
| [69](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/backup/restore-service.ts#L69) | `await this.access.require(tx, ctx, Permission.BACKUP_RESTORE);` |
| [95](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/backup/restore-service.ts#L95) | `async restore(command: RestoreCommand): Promise<RestoreResultResponse> {` |
| [99](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/backup/restore-service.ts#L99) | `await this.uow.run(ctx, async (tx) => {` |
| [100](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/backup/restore-service.ts#L100) | `await this.access.require(tx, ctx, Permission.BACKUP_RESTORE);` |
| [118](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/backup/restore-service.ts#L118) | `const result = await this.uow.runWithoutTenant(async (tx, adoptTenant) => {` |
| [166](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/backup/restore-service.ts#L166) | `action: 'BUSINESS_RESTORED',` |
| [190](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/backup/restore-service.ts#L190) | `private async open(content: Uint8Array): Promise<ArchiveBody> {` |
## ManageCatalogService
File: [packages/core-application/src/catalog/manage-catalog-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L1)

| Line | Declaration |
|---|---|
| [76](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L76) | `async list(command: ListCatalogCommand): Promise<CatalogResponse> {` |
| [79](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L79) | `return this.uow.run(ctx, async (tx) => {` |
| [80](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L80) | `await this.accessControl.require(tx, ctx, Permission.PRODUCT_VIEW);` |
| [87](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L87) | `async createUnit(command: SaveCatalogNameCommand): Promise<CatalogResponse> {` |
| [89](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L89) | `permission: Permission.UNIT_MANAGE,` |
| [96](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L96) | `async renameUnit(command: EditCatalogNameCommand): Promise<CatalogResponse> {` |
| [98](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L98) | `permission: Permission.UNIT_MANAGE,` |
| [106](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L106) | `async removeUnit(command: RemoveCatalogEntryCommand): Promise<RemoveCatalogEntryResponse> {` |
| [108](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L108) | `permission: Permission.UNIT_MANAGE,` |
| [119](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L119) | `async createBrand(command: SaveCatalogNameCommand): Promise<CatalogResponse> {` |
| [121](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L121) | `permission: Permission.BRAND_MANAGE,` |
| [128](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L128) | `async renameBrand(command: EditCatalogNameCommand): Promise<CatalogResponse> {` |
| [130](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L130) | `permission: Permission.BRAND_MANAGE,` |
| [138](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L138) | `async removeBrand(command: RemoveCatalogEntryCommand): Promise<RemoveCatalogEntryResponse> {` |
| [140](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L140) | `permission: Permission.BRAND_MANAGE,` |
| [151](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L151) | `async createCategory(command: CreateCategoryCommand): Promise<CatalogResponse> {` |
| [155](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L155) | `return this.uow.run(ctx, async (tx) => {` |
| [156](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L156) | `await this.accessControl.require(tx, ctx, Permission.CATEGORY_MANAGE);` |
| [174](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L174) | `action: 'CREATE',` |
| [180](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L180) | `eventType: 'category.created',` |
| [190](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L190) | `async renameCategory(command: EditCatalogNameCommand): Promise<CatalogResponse> {` |
| [194](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L194) | `return this.uow.run(ctx, async (tx) => {` |
| [195](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L195) | `await this.accessControl.require(tx, ctx, Permission.CATEGORY_MANAGE);` |
| [209](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L209) | `action: 'UPDATE',` |
| [215](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L215) | `eventType: 'category.updated',` |
| [225](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L225) | `async removeCategory(command: RemoveCatalogEntryCommand): Promise<RemoveCatalogEntryResponse> {` |
| [227](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L227) | `permission: Permission.CATEGORY_MANAGE,` |
| [241](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L241) | `private async readCatalog(tx: Tx, ctx: TenantContext): Promise<CatalogResponse> {` |
| [272](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L272) | `private async create(` |
| [284](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L284) | `return this.uow.run(ctx, async (tx) => {` |
| [294](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L294) | `action: 'CREATE',` |
| [300](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L300) | `eventType: `${kind.entityType}.created`,` |
| [310](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L310) | `private async rename(` |
| [323](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L323) | `return this.uow.run(ctx, async (tx) => {` |
| [336](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L336) | `action: 'UPDATE',` |
| [342](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L342) | `eventType: `${kind.entityType}.updated`,` |
| [352](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L352) | `private async remove(` |
| [372](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L372) | `return this.uow.run(ctx, async (tx) => {` |
| [393](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L393) | `action: outcome === 'ARCHIVED' ? 'ARCHIVE' : 'DELETE',` |
| [399](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L399) | `eventType: `${kind.entityType}.removed`,` |
| [414](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-catalog-service.ts#L414) | `private async resolveParent(` |
## ManageProductsService
File: [packages/core-application/src/catalog/manage-products-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L1)

| Line | Declaration |
|---|---|
| [186](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L186) | `async list(command: ListProductsCommand): Promise<ProductListResponse> {` |
| [189](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L189) | `return this.uow.run(ctx, async (tx) => {` |
| [190](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L190) | `await this.accessControl.require(tx, ctx, Permission.PRODUCT_VIEW);` |
| [250](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L250) | `async get(command: GetProductCommand): Promise<ProductResponse> {` |
| [253](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L253) | `return this.uow.run(ctx, async (tx) => {` |
| [254](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L254) | `await this.accessControl.require(tx, ctx, Permission.PRODUCT_VIEW);` |
| [263](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L263) | `async create(command: CreateProductCommand): Promise<ProductResponse> {` |
| [267](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L267) | `return this.uow.run(ctx, async (tx) => {` |
| [268](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L268) | `await this.accessControl.require(tx, ctx, Permission.PRODUCT_CREATE);` |
| [318](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L318) | `async createWithin(` |
| [324](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L324) | `await this.accessControl.require(tx, ctx, Permission.PRODUCT_CREATE);` |
| [334](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L334) | `action: 'CREATE',` |
| [340](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L340) | `eventType: 'product.created',` |
| [356](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L356) | `async update(command: UpdateProductCommand): Promise<ProductResponse> {` |
| [359](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L359) | `return this.uow.run(ctx, async (tx) => {` |
| [360](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L360) | `await this.accessControl.require(tx, ctx, Permission.PRODUCT_EDIT);` |
| [392](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L392) | `action: 'UPDATE',` |
| [398](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L398) | `eventType: 'product.updated',` |
| [416](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L416) | `async setStatus(command: SetProductStatusCommand): Promise<ProductResponse> {` |
| [419](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L419) | `return this.uow.run(ctx, async (tx) => {` |
| [420](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L420) | `await this.accessControl.require(tx, ctx, Permission.PRODUCT_DEACTIVATE);` |
| [428](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L428) | `action: command.status === 'ACTIVE' ? 'ACTIVATE' : 'DEACTIVATE',` |
| [434](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L434) | `eventType: 'product.status_changed',` |
| [465](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L465) | `async saveImage(command: {` |
| [471](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L471) | `return this.uow.run(ctx, async (tx) => {` |
| [472](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L472) | `await this.accessControl.require(tx, ctx, Permission.PRODUCT_EDIT);` |
| [496](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L496) | `action: 'UPDATE',` |
| [514](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L514) | `async image(` |
| [518](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L518) | `return this.uow.run(ctx, async (tx) => {` |
| [519](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L519) | `await this.accessControl.require(tx, ctx, Permission.PRODUCT_VIEW);` |
| [526](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L526) | `async generateBarcode(command: ProductIdCommand): Promise<GeneratedBarcodeResponse> {` |
| [529](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L529) | `return this.uow.run(ctx, async (tx) => {` |
| [530](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L530) | `await this.accessControl.require(tx, ctx, Permission.PRODUCT_EDIT);` |
| [547](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L547) | `action: 'UPDATE',` |
| [553](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L553) | `eventType: 'product.updated',` |
| [573](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L573) | `async deleteProduct(command: ProductIdCommand): Promise<void> {` |
| [576](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L576) | `return this.uow.run(ctx, async (tx) => {` |
| [577](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L577) | `await this.accessControl.require(tx, ctx, Permission.PRODUCT_DELETE);` |
| [587](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L587) | `action: 'DELETE',` |
| [593](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L593) | `eventType: 'product.deleted',` |
| [608](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L608) | `async validate(` |
| [770](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L770) | `private async maySeeCost(tx: Tx, ctx: TenantContext): Promise<boolean> {` |
| [772](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L772) | `return held.includes(Permission.COST_VIEW);` |
| [775](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L775) | `private async requireProduct(tx: Tx, ctx: TenantContext, id: string): Promise<ProductRow> {` |
| [796](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L796) | `private async assertNeverUsed(tx: Tx, ctx: TenantContext, productId: string): Promise<void> {` |
| [920](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/catalog/manage-products-service.ts#L920) | `private async valuationMethod(tx: Tx, ctx: TenantContext): Promise<'FIFO'  /  'AVERAGE'> {` |
## ChangeTransactionDateService
File: [packages/core-application/src/corrections/change-transaction-date-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/corrections/change-transaction-date-service.ts#L1)

| Line | Declaration |
|---|---|
| [111](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/corrections/change-transaction-date-service.ts#L111) | `async describe(` |
| [116](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/corrections/change-transaction-date-service.ts#L116) | `return this.uow.run(ctx, async (tx) => {` |
| [117](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/corrections/change-transaction-date-service.ts#L117) | `await this.access.require(tx, ctx, Permission.TRANSACTION_DATE_CHANGE);` |
| [142](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/corrections/change-transaction-date-service.ts#L142) | `mayChangeLocked: held.includes(Permission.TRANSACTION_DATE_CHANGE_LOCKED),` |
| [150](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/corrections/change-transaction-date-service.ts#L150) | `async change(command: ChangeTransactionDateCommand): Promise<ChangeTransactionDateResponse> {` |
| [154](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/corrections/change-transaction-date-service.ts#L154) | `return this.uow.run(ctx, async (tx) => {` |
| [155](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/corrections/change-transaction-date-service.ts#L155) | `await this.access.require(tx, ctx, Permission.TRANSACTION_DATE_CHANGE);` |
| [183](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/corrections/change-transaction-date-service.ts#L183) | `mayEnterClosedPeriod: held.includes(Permission.TRANSACTION_DATE_CHANGE_LOCKED),` |
| [240](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/corrections/change-transaction-date-service.ts#L240) | `eventType: 'transaction.date.changed',` |
| [287](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/corrections/change-transaction-date-service.ts#L287) | `action: 'UPDATE',` |
| [300](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/corrections/change-transaction-date-service.ts#L300) | `eventType: 'transaction.date.changed',` |
| [347](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/corrections/change-transaction-date-service.ts#L347) | `private async drawerDate(` |
| [366](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/corrections/change-transaction-date-service.ts#L366) | `private async sessionFor(` |
| [377](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/corrections/change-transaction-date-service.ts#L377) | `private async isOpen(tx: Tx, ctx: TenantContext, businessDate: string): Promise<boolean> {` |
## GetDaybookService
File: [packages/core-application/src/daybook/get-daybook-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/daybook/get-daybook-service.ts#L1)

| Line | Declaration |
|---|---|
| [38](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/daybook/get-daybook-service.ts#L38) | `async execute(ctx: TenantContext, query: DaybookQuery): Promise<DaybookResponse> {` |
| [39](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/daybook/get-daybook-service.ts#L39) | `return this.uow.run(ctx, async (tx) => {` |
| [40](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/daybook/get-daybook-service.ts#L40) | `await this.access.require(tx, ctx, Permission.DAYBOOK_VIEW);` |
| [55](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/daybook/get-daybook-service.ts#L55) | `const entryDate = held.includes(Permission.DAYBOOK_VIEW_ENTRY_DATE);` |
| [57](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/daybook/get-daybook-service.ts#L57) | `await this.access.require(tx, ctx, Permission.DAYBOOK_VIEW_ENTRY_DATE);` |
| [63](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/daybook/get-daybook-service.ts#L63) | `const allUsers = held.includes(Permission.DAYBOOK_VIEW_ALL_USERS);` |
| [110](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/daybook/get-daybook-service.ts#L110) | `private async days(` |
| [182](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/daybook/get-daybook-service.ts#L182) | `private async lockedDates(` |
| [242](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/daybook/get-daybook-service.ts#L242) | `(!locked  /  /  held.includes(Permission.TRANSACTION_DATE_CHANGE_LOCKED)),` |
## MarkDayReviewedService
File: [packages/core-application/src/daybook/mark-day-reviewed-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/daybook/mark-day-reviewed-service.ts#L1)

| Line | Declaration |
|---|---|
| [34](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/daybook/mark-day-reviewed-service.ts#L34) | `async execute(ctx: TenantContext, input: MarkDayReviewedRequest): Promise<DayReview> {` |
| [35](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/daybook/mark-day-reviewed-service.ts#L35) | `return this.uow.run(ctx, async (tx) => {` |
| [36](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/daybook/mark-day-reviewed-service.ts#L36) | `await this.access.require(tx, ctx, Permission.DAYBOOK_REVIEW_MARK);` |
| [48](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/daybook/mark-day-reviewed-service.ts#L48) | `action: existing === null ? 'CREATE' : 'UPDATE',` |
## PrintDaybookService
File: [packages/core-application/src/daybook/print-daybook-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/daybook/print-daybook-service.ts#L1)

| Line | Declaration |
|---|---|
| [36](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/daybook/print-daybook-service.ts#L36) | `async execute(` |
| [49](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/daybook/print-daybook-service.ts#L49) | `const print = await this.uow.run(ctx, async (tx) => {` |
| [50](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/daybook/print-daybook-service.ts#L50) | `await this.access.require(tx, ctx, Permission.DAYBOOK_PRINT);` |
| [85](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/daybook/print-daybook-service.ts#L85) | `action: 'CREATE',` |
| [102](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/daybook/print-daybook-service.ts#L102) | `async history(ctx: TenantContext, limit: number): Promise<readonly DaybookPrint[]> {` |
| [103](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/daybook/print-daybook-service.ts#L103) | `return this.uow.run(ctx, async (tx) => {` |
| [104](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/daybook/print-daybook-service.ts#L104) | `await this.access.require(tx, ctx, Permission.DAYBOOK_PRINT);` |
## ManageDevicesService
File: [packages/core-application/src/devices/manage-devices-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/manage-devices-service.ts#L1)

| Line | Declaration |
|---|---|
| [54](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/manage-devices-service.ts#L54) | `async list(ctx: TenantContext, callerPublicKey: string  /  null): Promise<DeviceListResponse> {` |
| [55](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/manage-devices-service.ts#L55) | `return this.uow.run(ctx, async (tx) => {` |
| [56](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/manage-devices-service.ts#L56) | `await this.access.require(tx, ctx, Permission.DEVICE_APPROVE);` |
| [67](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/manage-devices-service.ts#L67) | `async approve(command: {` |
| [73](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/manage-devices-service.ts#L73) | `return this.uow.run(command.ctx, async (tx) => {` |
| [75](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/manage-devices-service.ts#L75) | `await this.access.require(tx, ctx, Permission.DEVICE_APPROVE);` |
| [108](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/manage-devices-service.ts#L108) | `async offlineUsers(ctx: TenantContext, deviceId: string): Promise<DeviceUsersResponse> {` |
| [109](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/manage-devices-service.ts#L109) | `return this.uow.run(ctx, async (tx) => {` |
| [110](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/manage-devices-service.ts#L110) | `await this.access.require(tx, ctx, Permission.DEVICE_APPROVE);` |
| [125](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/manage-devices-service.ts#L125) | `async setOfflineUsers(command: {` |
| [131](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/manage-devices-service.ts#L131) | `return this.uow.run(ctx, async (tx) => {` |
| [132](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/manage-devices-service.ts#L132) | `await this.access.require(tx, ctx, Permission.DEVICE_APPROVE);` |
| [148](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/manage-devices-service.ts#L148) | `action: 'SET_OFFLINE_USERS',` |
| [167](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/manage-devices-service.ts#L167) | `async rename(command: {` |
| [173](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/manage-devices-service.ts#L173) | `return this.uow.run(command.ctx, async (tx) => {` |
| [175](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/manage-devices-service.ts#L175) | `await this.access.require(tx, ctx, Permission.DEVICE_RENAME);` |
| [181](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/manage-devices-service.ts#L181) | `action: 'UPDATE',` |
| [199](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/manage-devices-service.ts#L199) | `async revoke(command: {` |
| [204](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/manage-devices-service.ts#L204) | `return this.uow.run(command.ctx, async (tx) => {` |
| [206](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/manage-devices-service.ts#L206) | `await this.access.require(tx, ctx, Permission.DEVICE_REVOKE);` |
| [219](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/manage-devices-service.ts#L219) | `async forceRevoke(command: {` |
| [226](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/manage-devices-service.ts#L226) | `return this.uow.run(command.ctx, async (tx) => {` |
| [228](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/manage-devices-service.ts#L228) | `await this.access.require(tx, ctx, Permission.DEVICE_FORCE_REVOKE);` |
| [257](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/manage-devices-service.ts#L257) | `async replaceWriter(command: {` |
| [266](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/manage-devices-service.ts#L266) | `return this.uow.run(command.ctx, async (tx) => {` |
| [268](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/manage-devices-service.ts#L268) | `await this.access.require(tx, ctx, Permission.DEVICE_APPROVE);` |
| [285](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/manage-devices-service.ts#L285) | `await this.access.require(tx, ctx, Permission.DEVICE_FORCE_REVOKE);` |
| [321](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/manage-devices-service.ts#L321) | `private async stepUp(tx: Tx, ctx: TenantContext, password: string): Promise<void> {` |
| [329](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/manage-devices-service.ts#L329) | `private async reask(tx: Tx, ctx: TenantContext, device: DeviceRow): Promise<DeviceRow> {` |
| [342](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/manage-devices-service.ts#L342) | `private async move(` |
| [372](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/manage-devices-service.ts#L372) | `action: 'UPDATE',` |
| [380](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/manage-devices-service.ts#L380) | `private async load(tx: Tx, ctx: TenantContext, deviceId: string): Promise<DeviceRow> {` |
## OfflineStatusService
File: [packages/core-application/src/devices/offline-status-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/offline-status-service.ts#L1)

| Line | Declaration |
|---|---|
| [47](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/offline-status-service.ts#L47) | `async status(ctx: TenantContext, publicKey: string  /  null): Promise<OfflineStatusResponse> {` |
| [48](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/offline-status-service.ts#L48) | `return this.uow.run(ctx, async (tx) => {` |
| [66](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/offline-status-service.ts#L66) | `canRegister: held.includes(Permission.DEVICE_REGISTER),` |
| [67](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/offline-status-service.ts#L67) | `canApprove: held.includes(Permission.DEVICE_APPROVE),` |
| [68](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/offline-status-service.ts#L68) | `canRename: held.includes(Permission.DEVICE_RENAME),` |
| [69](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/offline-status-service.ts#L69) | `canRevoke: held.includes(Permission.DEVICE_REVOKE),` |
| [70](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/offline-status-service.ts#L70) | `canForceRevoke: held.includes(Permission.DEVICE_FORCE_REVOKE),` |
| [83](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/offline-status-service.ts#L83) | `async register(command: {` |
| [89](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/offline-status-service.ts#L89) | `return this.uow.run(command.ctx, async (tx) => {` |
| [91](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/offline-status-service.ts#L91) | `await this.access.require(tx, ctx, Permission.DEVICE_REGISTER);` |
| [121](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/offline-status-service.ts#L121) | `action: 'CREATE',` |
| [147](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/offline-status-service.ts#L147) | `async requestOfflineWrite(ctx: TenantContext, publicKey: string): Promise<DeviceResponse> {` |
| [148](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/offline-status-service.ts#L148) | `return this.uow.run(ctx, async (tx) => {` |
| [149](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/offline-status-service.ts#L149) | `await this.access.require(tx, ctx, Permission.DEVICE_REGISTER);` |
| [176](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/offline-status-service.ts#L176) | `action: 'UPDATE',` |
| [199](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/offline-status-service.ts#L199) | `async reportGate(command: {` |
| [206](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/offline-status-service.ts#L206) | `return this.uow.run(command.ctx, async (tx) => {` |
| [227](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/offline-status-service.ts#L227) | `async reportSnapshot(command: {` |
| [235](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/offline-status-service.ts#L235) | `return this.uow.run(command.ctx, async (tx) => {` |
| [249](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/offline-status-service.ts#L249) | `private async mine(` |
| [261](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/offline-status-service.ts#L261) | `private async reread(` |
## SnapshotService
File: [packages/core-application/src/devices/snapshot-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/snapshot-service.ts#L1)

| Line | Declaration |
|---|---|
| [109](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/snapshot-service.ts#L109) | `async build(ctx: TenantContext, publicKey: string): Promise<OfflineSnapshotResponse> {` |
| [110](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/snapshot-service.ts#L110) | `const { held, takenByName, offlineUsers } = await this.uow.run(ctx, async (tx) => {` |
| [149](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/snapshot-service.ts#L149) | `products: held.includes(Permission.PRODUCT_VIEW),` |
| [150](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/snapshot-service.ts#L150) | `customers: held.includes(Permission.CUSTOMER_VIEW),` |
| [151](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/snapshot-service.ts#L151) | `suppliers: held.includes(Permission.SUPPLIER_VIEW),` |
| [152](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/snapshot-service.ts#L152) | `vendors: held.includes(Permission.VENDOR_VIEW),` |
| [153](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/snapshot-service.ts#L153) | `cost: held.includes(Permission.COST_VIEW),` |
| [155](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/snapshot-service.ts#L155) | `sales: held.includes(Permission.SALE_VIEW),` |
| [201](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/snapshot-service.ts#L201) | `private async recentSales(ctx: TenantContext, since: string): Promise<OfflineSale[]> {` |
| [235](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/snapshot-service.ts#L235) | `private async allProducts(ctx: TenantContext): Promise<ProductResponse[]> {` |
| [258](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/snapshot-service.ts#L258) | `private async allParties(` |
| [283](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/devices/snapshot-service.ts#L283) | `private async allPartiesIfEnabled(` |
## ManageExpensesService
File: [packages/core-application/src/expenses/manage-expenses-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/expenses/manage-expenses-service.ts#L1)

| Line | Declaration |
|---|---|
| [30](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/expenses/manage-expenses-service.ts#L30) | `* **WRITE CLASS: T** (R-D). One transaction: permission → idempotency → period` |
| [95](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/expenses/manage-expenses-service.ts#L95) | `async record(command: RecordExpenseCommand): Promise<ExpenseResponse> {` |
| [104](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/expenses/manage-expenses-service.ts#L104) | `return this.uow.run(command.ctx, async (tx) => {` |
| [106](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/expenses/manage-expenses-service.ts#L106) | `await this.access.require(tx, ctx, Permission.EXPENSE_RECORD);` |
| [213](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/expenses/manage-expenses-service.ts#L213) | `action: 'CREATE',` |
| [225](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/expenses/manage-expenses-service.ts#L225) | `eventType: 'expense.recorded',` |
| [253](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/expenses/manage-expenses-service.ts#L253) | `async void(command: VoidExpenseCommand): Promise<ExpenseResponse> {` |
| [254](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/expenses/manage-expenses-service.ts#L254) | `return this.uow.run(command.ctx, async (tx) => {` |
| [256](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/expenses/manage-expenses-service.ts#L256) | `await this.access.require(tx, ctx, Permission.EXPENSE_VOID);` |
| [275](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/expenses/manage-expenses-service.ts#L275) | `eventType: 'expense.cancelled',` |
| [300](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/expenses/manage-expenses-service.ts#L300) | `async correct(command: CorrectExpenseCommand): Promise<ExpenseResponse> {` |
| [301](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/expenses/manage-expenses-service.ts#L301) | `return this.uow.run(command.ctx, async (tx) => {` |
| [303](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/expenses/manage-expenses-service.ts#L303) | `await this.access.require(tx, ctx, Permission.EXPENSE_RECORD);` |
| [348](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/expenses/manage-expenses-service.ts#L348) | `eventType: 'expense.corrected',` |
| [424](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/expenses/manage-expenses-service.ts#L424) | `action: 'UPDATE',` |
| [445](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/expenses/manage-expenses-service.ts#L445) | `private async isOpen(tx: Tx, ctx: TenantContext, businessDate: string): Promise<boolean> {` |
| [454](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/expenses/manage-expenses-service.ts#L454) | `async list(ctx: TenantContext, filter: ExpenseFilter): Promise<ExpenseListResponse> {` |
| [456](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/expenses/manage-expenses-service.ts#L456) | `return this.uow.run(ctx, async (tx) => {` |
| [457](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/expenses/manage-expenses-service.ts#L457) | `await this.access.require(tx, ctx, Permission.EXPENSE_VIEW);` |
| [486](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/expenses/manage-expenses-service.ts#L486) | `async saveCategory(command: SaveCategoryCommand): Promise<ExpenseCategoryResponse> {` |
| [487](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/expenses/manage-expenses-service.ts#L487) | `return this.uow.run(command.ctx, async (tx) => {` |
| [489](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/expenses/manage-expenses-service.ts#L489) | `await this.access.require(tx, ctx, Permission.EXPENSE_RECORD);` |
| [502](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/expenses/manage-expenses-service.ts#L502) | `action: 'UPDATE',` |
| [520](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/expenses/manage-expenses-service.ts#L520) | `action: 'CREATE',` |
| [529](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/expenses/manage-expenses-service.ts#L529) | `async archiveCategory(ctx: TenantContext, categoryId: string): Promise<void> {` |
| [530](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/expenses/manage-expenses-service.ts#L530) | `return this.uow.run(ctx, async (tx) => {` |
| [531](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/expenses/manage-expenses-service.ts#L531) | `await this.access.require(tx, ctx, Permission.EXPENSE_RECORD);` |
| [538](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/expenses/manage-expenses-service.ts#L538) | `action: 'UPDATE',` |
| [547](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/expenses/manage-expenses-service.ts#L547) | `private async guardDate(` |
| [558](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/expenses/manage-expenses-service.ts#L558) | `await this.access.require(tx, ctx, Permission.PERIOD_BACKDATE);` |
| [570](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/expenses/manage-expenses-service.ts#L570) | `private async detail(tx: Tx, ctx: TenantContext, expenseId: string): Promise<ExpenseResponse> {` |
## ImportDataService
File: [packages/core-application/src/imports/import-data-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/imports/import-data-service.ts#L1)

| Line | Declaration |
|---|---|
| [75](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/imports/import-data-service.ts#L75) | `PRODUCTS: Permission.PRODUCT_CREATE,` |
| [76](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/imports/import-data-service.ts#L76) | `CUSTOMERS: Permission.CUSTOMER_CREATE,` |
| [77](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/imports/import-data-service.ts#L77) | `SUPPLIERS: Permission.SUPPLIER_CREATE,` |
| [80](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/imports/import-data-service.ts#L80) | `OPENING_STOCK: Permission.PRODUCT_CREATE,` |
| [119](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/imports/import-data-service.ts#L119) | `async preview(command: ImportCommand): Promise<ImportPreviewResponse> {` |
| [122](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/imports/import-data-service.ts#L122) | `return this.uow.run(ctx, async (tx) => {` |
| [171](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/imports/import-data-service.ts#L171) | `async commit(command: CommitImportCommand): Promise<ImportResultResponse> {` |
| [175](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/imports/import-data-service.ts#L175) | `return this.uow.run(ctx, async (tx) => {` |
| [222](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/imports/import-data-service.ts#L222) | `action: 'IMPORT',` |
| [228](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/imports/import-data-service.ts#L228) | `eventType: 'data.imported',` |
| [255](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/imports/import-data-service.ts#L255) | `private async evaluate(` |
| [272](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/imports/import-data-service.ts#L272) | `private async evaluateProducts(` |
| [420](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/imports/import-data-service.ts#L420) | `private async evaluateParties(` |
| [496](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/imports/import-data-service.ts#L496) | `private async evaluateOpeningStock(` |
| [564](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/imports/import-data-service.ts#L564) | `private async resolveProduct(` |
| [609](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/imports/import-data-service.ts#L609) | `private async check(validate: () => Promise<unknown>): Promise<ImportCellError  /  null> {` |
## ManageInventoryService
File: [packages/core-application/src/inventory/manage-inventory-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L1)

| Line | Declaration |
|---|---|
| [115](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L115) | `async recordOpening(command: RecordOpeningStockCommand): Promise<OpeningStockResponse> {` |
| [117](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L117) | `return this.uow.run(command.ctx, async (tx) => {` |
| [118](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L118) | `await this.access.require(tx, command.ctx, Permission.PRODUCT_CREATE);` |
| [148](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L148) | `async recordOpeningWithin(tx: Tx, ctx: TenantContext, input: OpeningStockInput): Promise<OpeningStockResponse> {` |
| [149](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L149) | `await this.access.require(tx, ctx, Permission.PRODUCT_CREATE);` |
| [201](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L201) | `await this.audit.append(tx, ctx, { entityType: 'stock_opening', entityId: opening.id, action: 'CREATE', before: null, after: { productId: opening.productId, qty: opening.qty, valueMinor: opening.valueMinor, locationId: opening.locationId }, source: input.source });` |
| [202](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L202) | `await this.outbox.append(tx, ctx, { eventType: 'inventory.opening-recorded', aggregateType: 'stock_opening', aggregateId: opening.id, payload: { productId: opening.productId, movementId: opening.movementId } });` |
| [220](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L220) | `async adjustStock(command: AdjustStockCommand): Promise<StockAdjustmentResponse> {` |
| [229](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L229) | `return this.uow.run(command.ctx, async (tx) => {` |
| [230](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L230) | `await this.access.require(tx, command.ctx, Permission.PRODUCT_EDIT);` |
| [267](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L267) | `async voidAdjustment(command: VoidStockAdjustmentCommand): Promise<void> {` |
| [268](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L268) | `return this.uow.run(command.ctx, async (tx) => {` |
| [270](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L270) | `await this.access.require(tx, ctx, Permission.STOCK_ADJUSTMENT_VOID);` |
| [366](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L366) | `action: 'DELETE',` |
| [377](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L377) | `eventType: 'inventory.stock-adjustment-cancelled',` |
| [398](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L398) | `async adjustStockWithin(tx: Tx, command: AdjustStockCommand): Promise<StockAdjustmentResponse> {` |
| [446](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L446) | `entityType: 'stock_adjustment', entityId: adjustment.id, action: 'CREATE',` |
| [458](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L458) | `eventType: 'inventory.stock-adjusted', aggregateType: 'stock_adjustment',` |
| [488](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L488) | `private async planDecrease(` |
| [530](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L530) | `private async defaultLocation(tx: Tx, ctx: TenantContext): Promise<{ locationId: string; locationName: string }> {` |
| [536](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L536) | `private async adjustmentResponse(tx: Tx, ctx: TenantContext, row: StockAdjustmentRecord): Promise<StockAdjustmentResponse> {` |
| [537](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L537) | `const showCost = (await this.access.permissionsOf(tx, ctx)).includes(Permission.COST_VIEW);` |
| [548](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L548) | `async adjustments(ctx: TenantContext, query: InventoryReportQuery): Promise<readonly StockAdjustmentRow[]> {` |
| [549](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L549) | `return this.uow.run(ctx, async (tx) => {` |
| [550](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L550) | `await this.access.require(tx, ctx, Permission.PRODUCT_VIEW);` |
| [551](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L551) | `const showCost = (await this.access.permissionsOf(tx, ctx)).includes(Permission.COST_VIEW);` |
| [562](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L562) | `async costAdjustments(ctx: TenantContext, query: InventoryReportQuery): Promise<readonly CostAdjustmentRow[]> {` |
| [563](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L563) | `return this.uow.run(ctx, async (tx) => {` |
| [564](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L564) | `await this.access.require(tx, ctx, Permission.COST_VIEW);` |
| [569](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L569) | `async overview(ctx: TenantContext, query?: InventoryReportQuery): Promise<InventoryOverviewResponse> {` |
| [573](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L573) | `return this.uow.run(ctx, async (tx) => {` |
| [574](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L574) | `await this.access.require(tx, ctx, Permission.PRODUCT_VIEW);` |
| [575](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L575) | `const showCost = (await this.access.permissionsOf(tx, ctx)).includes(Permission.COST_VIEW);` |
| [592](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L592) | `async opening(ctx: TenantContext, id: string): Promise<OpeningStockResponse> {` |
| [593](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L593) | `return this.uow.run(ctx, async (tx) => {` |
| [594](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L594) | `await this.access.require(tx, ctx, Permission.PRODUCT_VIEW);` |
| [615](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L615) | `async setLotExpiry(command: {` |
| [620](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L620) | `return this.uow.run(command.ctx, async (tx) => {` |
| [622](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L622) | `await this.access.require(tx, ctx, Permission.PRODUCT_EDIT);` |
| [642](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L642) | `action: 'UPDATE',` |
| [650](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L650) | `async lots(ctx: TenantContext, query: InventoryLotsQuery): Promise<InventoryLotPage> {` |
| [651](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L651) | `return this.uow.run(ctx, async (tx) => {` |
| [652](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L652) | `await this.access.require(tx, ctx, Permission.INVENTORY_LOT_VIEW);` |
| [660](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L660) | `const showCost = (await this.access.permissionsOf(tx, ctx)).includes(Permission.COST_VIEW);` |
| [747](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L747) | `async valuation(ctx: TenantContext): Promise<InventoryValuationResponse> {` |
| [748](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L748) | `return this.uow.run(ctx, async (tx) => {` |
| [749](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L749) | `await this.access.require(tx, ctx, Permission.COST_VIEW);` |
| [786](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L786) | `private async costingMethod(tx: Tx, ctx: TenantContext): Promise<'FIFO'  /  'AVERAGE'> {` |
| [791](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L791) | `private async response(tx: Parameters<InventoryRepository['findDefaultLocation']>[0], ctx: TenantContext, row: OpeningStockRecord): Promise<OpeningStockResponse> {` |
| [792](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/manage-inventory-service.ts#L792) | `const showCost = (await this.access.permissionsOf(tx, ctx)).includes(Permission.COST_VIEW);` |
## SerialService
File: [packages/core-application/src/inventory/serial-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/serial-service.ts#L1)

| Line | Declaration |
|---|---|
| [48](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/serial-service.ts#L48) | `async record(input: {` |
| [53](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/serial-service.ts#L53) | `return this.uow.run(input.ctx, async (tx) => {` |
| [57](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/serial-service.ts#L57) | `await this.access.require(tx, ctx, Permission.PURCHASE_CREATE);` |
| [111](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/serial-service.ts#L111) | `action: 'CREATE',` |
| [122](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/serial-service.ts#L122) | `async progress(input: {` |
| [126](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/serial-service.ts#L126) | `return this.uow.run(input.ctx, async (tx) => {` |
| [127](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/serial-service.ts#L127) | `await this.access.require(tx, input.ctx, Permission.PURCHASE_VIEW);` |
| [134](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/serial-service.ts#L134) | `async available(input: {` |
| [139](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/serial-service.ts#L139) | `return this.uow.run(input.ctx, async (tx) => {` |
| [141](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/serial-service.ts#L141) | `await this.access.require(tx, ctx, Permission.PRODUCT_VIEW);` |
| [156](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/serial-service.ts#L156) | `private async assertSerialTrackingOn(` |
## StockCountService
File: [packages/core-application/src/inventory/stock-count-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/stock-count-service.ts#L1)

| Line | Declaration |
|---|---|
| [22](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/stock-count-service.ts#L22) | `* **WRITE CLASS: T** (R-D). The whole sheet is one transaction: a count that` |
| [78](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/stock-count-service.ts#L78) | `async post(command: PostStockCountCommand): Promise<StockCountResponse> {` |
| [81](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/stock-count-service.ts#L81) | `return this.uow.run(command.ctx, async (tx) => {` |
| [83](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/stock-count-service.ts#L83) | `await this.access.require(tx, ctx, Permission.STOCK_COUNT_POST);` |
| [215](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/stock-count-service.ts#L215) | `action: 'CREATE',` |
| [228](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/stock-count-service.ts#L228) | `eventType: 'inventory.count-posted',` |
| [245](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/stock-count-service.ts#L245) | `async list(ctx: TenantContext, limit: number): Promise<readonly StockCountResponse[]> {` |
| [246](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/stock-count-service.ts#L246) | `return this.uow.run(ctx, async (tx) => {` |
| [247](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/stock-count-service.ts#L247) | `await this.access.require(tx, ctx, Permission.STOCK_COUNT_POST);` |
| [275](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/stock-count-service.ts#L275) | `private async guardDate(` |
| [286](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/stock-count-service.ts#L286) | `await this.access.require(tx, ctx, Permission.PERIOD_BACKDATE);` |
| [298](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/stock-count-service.ts#L298) | `private async defaultLocationId(tx: Tx, ctx: TenantContext): Promise<string> {` |
| [304](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/inventory/stock-count-service.ts#L304) | `private async detail(tx: Tx, ctx: TenantContext, countId: string): Promise<StockCountResponse> {` |
## LicenseInstallService
File: [packages/core-application/src/licensing/license-install-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/licensing/license-install-service.ts#L1)

| Line | Declaration |
|---|---|
| [45](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/licensing/license-install-service.ts#L45) | `async install(ctx: TenantContext, raw: string): Promise<LicenseInstallResponse> {` |
| [46](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/licensing/license-install-service.ts#L46) | `await this.uow.run(ctx, async (tx) => {` |
| [47](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/licensing/license-install-service.ts#L47) | `await this.access.require(tx, ctx, Permission.LICENSE_INSTALL);` |
| [158](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/licensing/license-install-service.ts#L158) | `await this.uow.run(ctx, async (tx) => {` |
| [162](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/licensing/license-install-service.ts#L162) | `action: 'INSTALLED',` |
| [187](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/licensing/license-install-service.ts#L187) | `private async rejection(` |
| [194](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/licensing/license-install-service.ts#L194) | `await this.uow.run(ctx, async (tx) => {` |
| [198](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/licensing/license-install-service.ts#L198) | `action: 'INSTALL_REJECTED',` |
## LicenseStatusService
File: [packages/core-application/src/licensing/license-status-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/licensing/license-status-service.ts#L1)

| Line | Declaration |
|---|---|
| [48](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/licensing/license-status-service.ts#L48) | `async status(ctx: TenantContext): Promise<LicenseStatusResponse> {` |
| [49](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/licensing/license-status-service.ts#L49) | `return this.uow.run(ctx, async (tx) => {` |
| [50](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/licensing/license-status-service.ts#L50) | `await this.access.require(tx, ctx, Permission.LICENSE_VIEW);` |
| [112](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/licensing/license-status-service.ts#L112) | `async notice(ctx: TenantContext): Promise<LicenseNotice> {` |
| [113](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/licensing/license-status-service.ts#L113) | `return this.uow.run(ctx, async (tx) => this.noticeWithin(tx, ctx));` |
| [116](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/licensing/license-status-service.ts#L116) | `async noticeWithin(tx: Tx, ctx: TenantContext): Promise<LicenseNotice> {` |
## CashMovementService
File: [packages/core-application/src/money/cash-movement-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-movement-service.ts#L1)

| Line | Declaration |
|---|---|
| [99](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-movement-service.ts#L99) | `TRANSFER: Permission.CASH_MOVEMENT_RECORD,` |
| [100](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-movement-service.ts#L100) | `OPENING_ADJUSTMENT: Permission.CASH_MOVEMENT_RECORD,` |
| [101](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-movement-service.ts#L101) | `OWNER_INJECTION: Permission.OWNER_CAPITAL_RECORD,` |
| [102](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-movement-service.ts#L102) | `OWNER_WITHDRAWAL: Permission.OWNER_CAPITAL_RECORD,` |
| [103](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-movement-service.ts#L103) | `LOAN_RECEIVED: Permission.LOAN_MOVEMENT_RECORD,` |
| [104](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-movement-service.ts#L104) | `LOAN_REPAYMENT: Permission.LOAN_MOVEMENT_RECORD,` |
| [132](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-movement-service.ts#L132) | `async record(command: RecordMovementCommand): Promise<CashMovementResponse> {` |
| [142](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-movement-service.ts#L142) | `return this.uow.run(ctx, async (tx) => {` |
| [237](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-movement-service.ts#L237) | `action: 'CREATE',` |
| [286](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-movement-service.ts#L286) | `async void(command: VoidMovementCommand): Promise<void> {` |
| [287](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-movement-service.ts#L287) | `return this.uow.run(command.ctx, async (tx) => {` |
| [299](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-movement-service.ts#L299) | `await this.accessControl.require(tx, ctx, Permission.CASH_MOVEMENT_VOID);` |
| [320](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-movement-service.ts#L320) | `eventType: 'cash.movement.cancelled',` |
| [335](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-movement-service.ts#L335) | `async correct(command: CorrectMovementCommand): Promise<void> {` |
| [336](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-movement-service.ts#L336) | `return this.uow.run(command.ctx, async (tx) => {` |
| [385](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-movement-service.ts#L385) | `eventType: 'cash.movement.corrected',` |
| [457](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-movement-service.ts#L457) | `action: 'UPDATE',` |
| [482](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-movement-service.ts#L482) | `private async requireKindPermission(` |
| [493](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-movement-service.ts#L493) | `private async isOpen(tx: Tx, ctx: TenantContext, businessDate: string): Promise<boolean> {` |
| [506](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-movement-service.ts#L506) | `private async assertDrawerOpenFor(` |
| [534](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-movement-service.ts#L534) | `private async resolveSide(` |
| [579](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-movement-service.ts#L579) | `account.type === 'CASH' ? Permission.CASH_ACCOUNT_VIEW : Permission.BANK_ACCOUNT_VIEW,` |
## CashSessionService
File: [packages/core-application/src/money/cash-session-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-session-service.ts#L1)

| Line | Declaration |
|---|---|
| [128](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-session-service.ts#L128) | `async status(command: DayStatusCommand): Promise<DayStatusResponse> {` |
| [131](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-session-service.ts#L131) | `return this.uow.run(ctx, async (tx) => {` |
| [132](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-session-service.ts#L132) | `await this.accessControl.require(tx, ctx, Permission.CASH_DAILY_VIEW);` |
| [189](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-session-service.ts#L189) | `async startDay(command: StartDayCommand): Promise<CashSessionResponse> {` |
| [197](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-session-service.ts#L197) | `return this.uow.run(ctx, async (tx) => {` |
| [198](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-session-service.ts#L198) | `await this.accessControl.require(tx, ctx, Permission.CASH_SESSION_START);` |
| [296](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-session-service.ts#L296) | `action: 'START_DAY',` |
| [326](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-session-service.ts#L326) | `async closeDay(command: CloseDayCommand): Promise<CashSessionResponse> {` |
| [333](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-session-service.ts#L333) | `return this.uow.run(ctx, async (tx) => {` |
| [334](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-session-service.ts#L334) | `await this.accessControl.require(tx, ctx, Permission.CASH_SESSION_CLOSE);` |
| [416](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-session-service.ts#L416) | `action: 'CLOSE_DAY',` |
| [458](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-session-service.ts#L458) | `async reopenDay(command: ReopenDayCommand): Promise<CashSessionResponse> {` |
| [461](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-session-service.ts#L461) | `return this.uow.run(ctx, async (tx) => {` |
| [481](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-session-service.ts#L481) | `held.includes(Permission.CASH_SESSION_REOPEN)  /  /  close.closedBy === ctx.userId;` |
| [534](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-session-service.ts#L534) | `action: 'REOPEN_DAY',` |
| [551](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-session-service.ts#L551) | `private async postOpeningAdjustment(` |
| [607](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-session-service.ts#L607) | `private async sessionsEnabled(tx: Tx, ctx: TenantContext): Promise<boolean> {` |
| [612](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-session-service.ts#L612) | `private async requireSessionsEnabled(tx: Tx, ctx: TenantContext): Promise<void> {` |
| [618](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-session-service.ts#L618) | `private async requireDrawer(tx: Tx, ctx: TenantContext): Promise<MoneyAccountRow> {` |
| [629](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-session-service.ts#L629) | `private async requireAccount(` |
| [639](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-session-service.ts#L639) | `private async requireSession(` |
| [649](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-session-service.ts#L649) | `private async canReopenToday(` |
| [661](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-session-service.ts#L661) | `return held.includes(Permission.CASH_SESSION_REOPEN)  /  /  close.closedBy === ctx.userId;` |
| [673](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-session-service.ts#L673) | `private async toResponse(` |
## DailyCashService
File: [packages/core-application/src/money/daily-cash-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/daily-cash-service.ts#L1)

| Line | Declaration |
|---|---|
| [58](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/daily-cash-service.ts#L58) | `async history(command: DailyCashCommand): Promise<DailyCashResponse> {` |
| [61](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/daily-cash-service.ts#L61) | `return this.uow.run(ctx, async (tx) => {` |
| [62](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/daily-cash-service.ts#L62) | `await this.accessControl.require(tx, ctx, Permission.CASH_DAILY_VIEW);` |
| [119](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/daily-cash-service.ts#L119) | `async statement(command: AccountStatementCommand): Promise<AccountStatementResponse> {` |
| [122](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/daily-cash-service.ts#L122) | `return this.uow.run(ctx, async (tx) => {` |
| [141](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/daily-cash-service.ts#L141) | `account.type === 'CASH' ? Permission.CASH_ACCOUNT_VIEW : Permission.BANK_ACCOUNT_VIEW,` |
## ManageAccountsService
File: [packages/core-application/src/money/manage-accounts-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/manage-accounts-service.ts#L1)

| Line | Declaration |
|---|---|
| [104](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/manage-accounts-service.ts#L104) | `if (type === 'CASH') return Permission.CASH_ACCOUNT_VIEW;` |
| [105](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/manage-accounts-service.ts#L105) | `return Permission.BANK_ACCOUNT_VIEW;` |
| [110](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/manage-accounts-service.ts#L110) | `if (type === 'CASH') return Permission.CASH_ACCOUNT_MANAGE;` |
| [111](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/manage-accounts-service.ts#L111) | `if (type === 'LOAN') return Permission.LOAN_ACCOUNT_MANAGE;` |
| [112](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/manage-accounts-service.ts#L112) | `return Permission.BANK_ACCOUNT_MANAGE;` |
| [136](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/manage-accounts-service.ts#L136) | `async list(command: ListAccountsCommand): Promise<MoneyAccountListResponse> {` |
| [139](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/manage-accounts-service.ts#L139) | `return this.uow.run(ctx, async (tx) => {` |
| [145](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/manage-accounts-service.ts#L145) | `if (held.includes(Permission.CASH_ACCOUNT_VIEW)) types.push('CASH');` |
| [146](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/manage-accounts-service.ts#L146) | `if (banksOn && held.includes(Permission.BANK_ACCOUNT_VIEW)) types.push('BANK', 'MFS');` |
| [192](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/manage-accounts-service.ts#L192) | `async create(command: CreateAccountCommand): Promise<MoneyAccountResponse> {` |
| [196](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/manage-accounts-service.ts#L196) | `return this.uow.run(ctx, async (tx) => {` |
| [237](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/manage-accounts-service.ts#L237) | `action: 'CREATE',` |
| [268](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/manage-accounts-service.ts#L268) | `async update(command: UpdateAccountCommand): Promise<MoneyAccountResponse> {` |
| [271](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/manage-accounts-service.ts#L271) | `return this.uow.run(ctx, async (tx) => {` |
| [304](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/manage-accounts-service.ts#L304) | `action: 'UPDATE',` |
| [322](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/manage-accounts-service.ts#L322) | `async deactivate(command: DeactivateAccountCommand): Promise<MoneyAccountResponse> {` |
| [325](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/manage-accounts-service.ts#L325) | `return this.uow.run(ctx, async (tx) => {` |
| [357](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/manage-accounts-service.ts#L357) | `action: 'DEACTIVATE',` |
| [389](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/manage-accounts-service.ts#L389) | `private async requireNoOtherDrawer(` |
| [406](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/manage-accounts-service.ts#L406) | `private async postOpening(` |
| [461](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/manage-accounts-service.ts#L461) | `action: 'CREATE',` |
| [469](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/manage-accounts-service.ts#L469) | `private async reconcileOpening(` |
| [557](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/manage-accounts-service.ts#L557) | `action: 'CORRECT',` |
| [564](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/manage-accounts-service.ts#L564) | `private async requireAccount(` |
## MoneyMovementsService
File: [packages/core-application/src/money/money-movements-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/money-movements-service.ts#L1)

| Line | Declaration |
|---|---|
| [72](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/money-movements-service.ts#L72) | `async list(command: ListMovementsCommand): Promise<MoneyMovementListResponse> {` |
| [75](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/money-movements-service.ts#L75) | `return this.uow.run(ctx, async (tx) => {` |
| [97](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/money-movements-service.ts#L97) | `if (held.includes(Permission.CASH_ACCOUNT_VIEW)) types.push('CASH');` |
| [98](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/money-movements-service.ts#L98) | `if (banksOn && held.includes(Permission.BANK_ACCOUNT_VIEW)) types.push('BANK', 'MFS');` |
| [147](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/money-movements-service.ts#L147) | `return Permission.OWNER_CAPITAL_RECORD;` |
| [150](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/money-movements-service.ts#L150) | `return Permission.LOAN_MOVEMENT_RECORD;` |
| [152](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/money-movements-service.ts#L152) | `return Permission.CASH_MOVEMENT_RECORD;` |
## CreateNoteService
File: [packages/core-application/src/notes/create-note-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/notes/create-note-service.ts#L1)

| Line | Declaration |
|---|---|
| [74](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/notes/create-note-service.ts#L74) | `async execute(command: CreateNoteCommand): Promise<NoteResponse> {` |
| [82](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/notes/create-note-service.ts#L82) | `return this.uow.run(ctx, async (tx) => {` |
| [85](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/notes/create-note-service.ts#L85) | `await this.accessControl.require(tx, ctx, Permission.NOTE_CREATE);` |
| [143](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/notes/create-note-service.ts#L143) | `action: 'CREATE',` |
| [152](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/notes/create-note-service.ts#L152) | `eventType: 'note.created',` |
## GetNoteService
File: [packages/core-application/src/notes/get-note-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/notes/get-note-service.ts#L1)

| Line | Declaration |
|---|---|
| [23](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/notes/get-note-service.ts#L23) | `async execute(ctx: TenantContext, id: string): Promise<NoteResponse> {` |
| [24](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/notes/get-note-service.ts#L24) | `return this.uow.run(ctx, async (tx) => {` |
| [25](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/notes/get-note-service.ts#L25) | `await this.accessControl.require(tx, ctx, Permission.NOTE_VIEW);` |
## ManagePartiesService
File: [packages/core-application/src/parties/manage-parties-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L1)

| Line | Declaration |
|---|---|
| [171](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L171) | `view: Permission.CUSTOMER_VIEW,` |
| [172](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L172) | `create: Permission.CUSTOMER_CREATE,` |
| [173](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L173) | `edit: Permission.CUSTOMER_EDIT,` |
| [174](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L174) | `deactivate: Permission.CUSTOMER_DEACTIVATE,` |
| [177](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L177) | `view: Permission.SUPPLIER_VIEW,` |
| [178](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L178) | `create: Permission.SUPPLIER_CREATE,` |
| [179](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L179) | `edit: Permission.SUPPLIER_EDIT,` |
| [180](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L180) | `deactivate: Permission.SUPPLIER_DEACTIVATE,` |
| [183](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L183) | `view: Permission.VENDOR_VIEW,` |
| [184](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L184) | `create: Permission.VENDOR_CREATE,` |
| [185](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L185) | `edit: Permission.VENDOR_EDIT,` |
| [186](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L186) | `deactivate: Permission.VENDOR_DEACTIVATE,` |
| [226](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L226) | `async list(command: ListPartiesCommand): Promise<PartyListResponse> {` |
| [229](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L229) | `return this.uow.run(ctx, async (tx) => {` |
| [263](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L263) | `async get(command: PartyIdCommand): Promise<PartyResponse> {` |
| [266](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L266) | `return this.uow.run(ctx, async (tx) => {` |
| [276](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L276) | `async create(command: CreatePartyCommand): Promise<PartyResponse> {` |
| [280](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L280) | `return this.uow.run(ctx, async (tx) => {` |
| [324](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L324) | `async createWithin(` |
| [348](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L348) | `action: 'CREATE',` |
| [354](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L354) | `eventType: 'party.created',` |
| [373](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L373) | `private async postOpening(` |
| [462](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L462) | `action: 'CREATE',` |
| [475](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L475) | `async update(command: UpdatePartyCommand): Promise<PartyResponse> {` |
| [478](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L478) | `return this.uow.run(ctx, async (tx) => {` |
| [517](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L517) | `action: 'UPDATE',` |
| [523](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L523) | `eventType: 'party.updated',` |
| [539](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L539) | `async setStatus(command: SetPartyStatusCommand): Promise<PartyResponse> {` |
| [542](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L542) | `return this.uow.run(ctx, async (tx) => {` |
| [552](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L552) | `action: command.status === 'ACTIVE' ? 'ACTIVATE' : 'DEACTIVATE',` |
| [558](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L558) | `eventType: 'party.status_changed',` |
| [578](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L578) | `async deleteParty(command: PartyIdCommand): Promise<void> {` |
| [581](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L581) | `return this.uow.run(ctx, async (tx) => {` |
| [594](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L594) | `action: 'DELETE',` |
| [600](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L600) | `eventType: 'party.deleted',` |
| [611](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L611) | `async getOpening(command: GetPartyOpeningCommand): Promise<PartyOpeningResponse  /  null> {` |
| [614](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L614) | `return this.uow.run(ctx, async (tx) => {` |
| [635](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L635) | `async setOpening(command: SetPartyOpeningCommand): Promise<PartyOpeningResponse> {` |
| [639](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L639) | `return this.uow.run(ctx, async (tx) => {` |
| [669](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L669) | `eventType: 'party.opening.posted',` |
| [694](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L694) | `async correctOpening(command: CorrectPartyOpeningCommand): Promise<PartyOpeningResponse> {` |
| [698](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L698) | `return this.uow.run(ctx, async (tx) => {` |
| [811](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L811) | `action: 'UPDATE',` |
| [827](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L827) | `eventType: 'party.opening.corrected',` |
| [847](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L847) | `async validate(` |
| [1002](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L1002) | `private async assertVendorsOn(tx: Tx, ctx: TenantContext): Promise<void> {` |
| [1014](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L1014) | `private async requireAnyRole(` |
| [1018](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L1018) | `action: 'view'  /  'edit'  /  'deactivate',` |
| [1035](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L1035) | `private assertNotSystemReserved(party: PartyRow, action: string): void {` |
| [1044](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-parties-service.ts#L1044) | `private async requireParty(tx: Tx, ctx: TenantContext, id: string): Promise<PartyRow> {` |
## ManagePartyGroupsService
File: [packages/core-application/src/parties/manage-party-groups-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-party-groups-service.ts#L1)

| Line | Declaration |
|---|---|
| [56](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-party-groups-service.ts#L56) | `Permission.CUSTOMER_VIEW,` |
| [57](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-party-groups-service.ts#L57) | `Permission.SUPPLIER_VIEW,` |
| [58](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-party-groups-service.ts#L58) | `Permission.VENDOR_VIEW,` |
| [59](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-party-groups-service.ts#L59) | `Permission.CUSTOMER_CREATE,` |
| [60](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-party-groups-service.ts#L60) | `Permission.SUPPLIER_CREATE,` |
| [61](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-party-groups-service.ts#L61) | `Permission.VENDOR_CREATE,` |
| [75](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-party-groups-service.ts#L75) | `async setup(command: PartySetupCommand): Promise<PartySetupResponse> {` |
| [78](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-party-groups-service.ts#L78) | `return this.uow.run(ctx, async (tx) => {` |
| [83](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-party-groups-service.ts#L83) | `await this.accessControl.require(tx, ctx, Permission.CUSTOMER_VIEW);` |
| [109](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-party-groups-service.ts#L109) | `async create(command: CreateCustomerGroupCommand): Promise<PartySetupResponse> {` |
| [112](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-party-groups-service.ts#L112) | `await this.uow.run(ctx, async (tx) => {` |
| [113](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-party-groups-service.ts#L113) | `await this.accessControl.require(tx, ctx, Permission.PARTY_GROUP_MANAGE);` |
| [125](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-party-groups-service.ts#L125) | `action: 'CREATE',` |
| [131](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-party-groups-service.ts#L131) | `eventType: 'customer_group.created',` |
| [141](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-party-groups-service.ts#L141) | `async rename(command: RenameCustomerGroupCommand): Promise<PartySetupResponse> {` |
| [144](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-party-groups-service.ts#L144) | `await this.uow.run(ctx, async (tx) => {` |
| [145](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-party-groups-service.ts#L145) | `await this.accessControl.require(tx, ctx, Permission.PARTY_GROUP_MANAGE);` |
| [159](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-party-groups-service.ts#L159) | `action: 'UPDATE',` |
| [165](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-party-groups-service.ts#L165) | `eventType: 'customer_group.updated',` |
| [181](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-party-groups-service.ts#L181) | `async remove(command: RemoveCustomerGroupCommand): Promise<RemoveCatalogEntryResponse> {` |
| [184](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-party-groups-service.ts#L184) | `return this.uow.run(ctx, async (tx) => {` |
| [185](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-party-groups-service.ts#L185) | `await this.accessControl.require(tx, ctx, Permission.PARTY_GROUP_MANAGE);` |
| [200](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-party-groups-service.ts#L200) | `action: inUse === 0 ? 'DELETE' : 'ARCHIVE',` |
| [206](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-party-groups-service.ts#L206) | `eventType: inUse === 0 ? 'customer_group.deleted' : 'customer_group.archived',` |
| [230](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-party-groups-service.ts#L230) | `private async assertNameFree(` |
| [245](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-party-groups-service.ts#L245) | `private async assertGroupsOn(tx: Tx, ctx: TenantContext): Promise<void> {` |
| [255](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/manage-party-groups-service.ts#L255) | `private async requireGroup(` |
## PartyLedgerService
File: [packages/core-application/src/parties/party-ledger-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/party-ledger-service.ts#L1)

| Line | Declaration |
|---|---|
| [41](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/party-ledger-service.ts#L41) | `CUSTOMER: Permission.CUSTOMER_VIEW,` |
| [42](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/party-ledger-service.ts#L42) | `SUPPLIER: Permission.SUPPLIER_VIEW,` |
| [43](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/party-ledger-service.ts#L43) | `VENDOR: Permission.VENDOR_VIEW,` |
| [53](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/party-ledger-service.ts#L53) | `async ledger(command: PartyLedgerCommand): Promise<PartyLedgerResponse> {` |
| [56](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/parties/party-ledger-service.ts#L56) | `return this.uow.run(ctx, async (tx) => {` |
## ManagePeriodsService
File: [packages/core-application/src/periods/manage-periods-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/periods/manage-periods-service.ts#L1)

| Line | Declaration |
|---|---|
| [34](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/periods/manage-periods-service.ts#L34) | `async list(ctx: TenantContext): Promise<PeriodListResponse> {` |
| [35](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/periods/manage-periods-service.ts#L35) | `return this.uow.run(ctx, async (tx) => {` |
| [39](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/periods/manage-periods-service.ts#L39) | `await this.access.require(tx, ctx, Permission.SETTING_VIEW);` |
| [46](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/periods/manage-periods-service.ts#L46) | `async close(command: {` |
| [52](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/periods/manage-periods-service.ts#L52) | `return this.uow.run(command.ctx, async (tx) => {` |
| [54](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/periods/manage-periods-service.ts#L54) | `await this.access.require(tx, ctx, Permission.PERIOD_CLOSE);` |
| [80](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/periods/manage-periods-service.ts#L80) | `action: 'UPDATE',` |
## CreatePurchaseService
File: [packages/core-application/src/purchasing/create-purchase-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/create-purchase-service.ts#L1)

| Line | Declaration |
|---|---|
| [153](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/create-purchase-service.ts#L153) | `private async reverseForCorrection(` |
| [266](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/create-purchase-service.ts#L266) | `action: 'CORRECT',` |
| [279](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/create-purchase-service.ts#L279) | `async create(command: CreatePurchaseCommand): Promise<PurchaseResponse> {` |
| [280](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/create-purchase-service.ts#L280) | `return this.uow.run(command.ctx, (tx) => this.createWithin(tx, command));` |
| [284](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/create-purchase-service.ts#L284) | `async createWithin(tx: Tx, command: CreatePurchaseCommand): Promise<PurchaseResponse> {` |
| [350](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/create-purchase-service.ts#L350) | `command.correctionOf === null ? Permission.PURCHASE_CREATE : Permission.PURCHASE_EDIT,` |
| [380](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/create-purchase-service.ts#L380) | `* The correction happens first, inside this same transaction: the old` |
| [617](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/create-purchase-service.ts#L617) | `action: 'CREATE',` |
| [631](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/create-purchase-service.ts#L631) | `eventType: 'purchase.recorded',` |
| [646](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/create-purchase-service.ts#L646) | `private async detail(` |
| [654](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/create-purchase-service.ts#L654) | `const showCost = (await this.access.permissionsOf(tx, ctx)).includes(Permission.COST_VIEW);` |
## AddLandedCostService
File: [packages/core-application/src/purchasing/landed-cost-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/landed-cost-service.ts#L1)

| Line | Declaration |
|---|---|
| [102](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/landed-cost-service.ts#L102) | `async add(command: AddLandedCostCommand): Promise<LandedCostResponse> {` |
| [103](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/landed-cost-service.ts#L103) | `return this.uow.run(command.ctx, (tx) => this.addWithin(tx, command));` |
| [107](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/landed-cost-service.ts#L107) | `async addWithin(tx: Tx, command: AddLandedCostCommand): Promise<LandedCostResponse> {` |
| [122](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/landed-cost-service.ts#L122) | `await this.access.require(tx, ctx, Permission.PURCHASE_EDIT);` |
| [335](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/landed-cost-service.ts#L335) | `action: 'CREATE',` |
| [347](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/landed-cost-service.ts#L347) | `eventType: 'purchase.landed_cost.added',` |
## PaySupplierService
File: [packages/core-application/src/purchasing/pay-supplier-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/pay-supplier-service.ts#L1)

| Line | Declaration |
|---|---|
| [101](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/pay-supplier-service.ts#L101) | `async void(command: VoidSupplierPaymentCommand): Promise<void> {` |
| [102](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/pay-supplier-service.ts#L102) | `return this.uow.run(command.ctx, async (tx) => {` |
| [104](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/pay-supplier-service.ts#L104) | `await this.access.require(tx, ctx, Permission.SUPPLIER_PAYMENT_VOID);` |
| [123](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/pay-supplier-service.ts#L123) | `eventType: 'supplier.payment.cancelled',` |
| [136](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/pay-supplier-service.ts#L136) | `async correct(command: CorrectSupplierPaymentCommand): Promise<void> {` |
| [137](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/pay-supplier-service.ts#L137) | `return this.uow.run(command.ctx, async (tx) => {` |
| [139](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/pay-supplier-service.ts#L139) | `await this.access.require(tx, ctx, Permission.PURCHASE_PAY);` |
| [181](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/pay-supplier-service.ts#L181) | `eventType: 'supplier.payment.corrected',` |
| [243](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/pay-supplier-service.ts#L243) | `action: 'UPDATE',` |
| [260](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/pay-supplier-service.ts#L260) | `private async isOpen(tx: Tx, ctx: TenantContext, businessDate: string): Promise<boolean> {` |
| [269](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/pay-supplier-service.ts#L269) | `async due(command: SupplierDueCommand): Promise<SupplierDueResponse> {` |
| [270](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/pay-supplier-service.ts#L270) | `return this.uow.run(command.ctx, async (tx) => {` |
| [272](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/pay-supplier-service.ts#L272) | `await this.access.require(tx, ctx, Permission.PURCHASE_VIEW);` |
| [296](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/pay-supplier-service.ts#L296) | `async pay(command: PaySupplierCommand): Promise<SupplierPaymentResponse> {` |
| [305](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/pay-supplier-service.ts#L305) | `return this.uow.run(command.ctx, async (tx) => {` |
| [307](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/pay-supplier-service.ts#L307) | `await this.access.require(tx, ctx, Permission.PURCHASE_PAY);` |
| [410](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/pay-supplier-service.ts#L410) | `action: 'CREATE',` |
| [423](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/pay-supplier-service.ts#L423) | `eventType: 'purchase.supplier-paid',` |
| [439](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/pay-supplier-service.ts#L439) | `private async detail(tx: Tx, ctx: TenantContext, id: string): Promise<SupplierPaymentResponse> {` |
| [465](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/pay-supplier-service.ts#L465) | `private async accountName(tx: Tx, ctx: TenantContext, code: string): Promise<string> {` |
## PlannerService
File: [packages/core-application/src/purchasing/planner-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/planner-service.ts#L1)

| Line | Declaration |
|---|---|
| [53](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/planner-service.ts#L53) | `async plan(command: PlannerQueryCommand): Promise<PlannerResponse> {` |
| [54](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/planner-service.ts#L54) | `return this.uow.run(command.ctx, async (tx) => {` |
| [56](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/planner-service.ts#L56) | `await this.access.require(tx, ctx, Permission.PURCHASE_PLAN_VIEW);` |
| [57](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/planner-service.ts#L57) | `const showMoney = (await this.access.permissionsOf(tx, ctx)).includes(Permission.COST_VIEW);` |
| [183](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/planner-service.ts#L183) | `private async paramsFor(` |
## PurchasePlanService
File: [packages/core-application/src/purchasing/purchase-plan-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-plan-service.ts#L1)

| Line | Declaration |
|---|---|
| [89](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-plan-service.ts#L89) | `async save(command: SavePlanCommand): Promise<PurchasePlanResponse> {` |
| [90](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-plan-service.ts#L90) | `return this.uow.run(command.ctx, async (tx) => {` |
| [92](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-plan-service.ts#L92) | `await this.access.require(tx, ctx, Permission.PURCHASE_PLAN_MANAGE);` |
| [123](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-plan-service.ts#L123) | `action: 'CREATE',` |
| [136](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-plan-service.ts#L136) | `async update(command: UpdatePlanCommand): Promise<PurchasePlanResponse> {` |
| [137](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-plan-service.ts#L137) | `return this.uow.run(command.ctx, async (tx) => {` |
| [139](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-plan-service.ts#L139) | `await this.access.require(tx, ctx, Permission.PURCHASE_PLAN_MANAGE);` |
| [170](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-plan-service.ts#L170) | `action: 'UPDATE',` |
| [193](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-plan-service.ts#L193) | `async decide(input: {` |
| [200](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-plan-service.ts#L200) | `return this.uow.run(input.ctx, async (tx) => {` |
| [202](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-plan-service.ts#L202) | `await this.access.require(tx, ctx, Permission.PURCHASE_PLAN_MANAGE);` |
| [277](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-plan-service.ts#L277) | `action: input.decision === 'APPROVED' ? 'APPROVE' : 'REJECT',` |
| [288](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-plan-service.ts#L288) | `async remove(input: {` |
| [293](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-plan-service.ts#L293) | `return this.uow.run(input.ctx, async (tx) => {` |
| [295](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-plan-service.ts#L295) | `await this.access.require(tx, ctx, Permission.PURCHASE_PLAN_MANAGE);` |
| [311](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-plan-service.ts#L311) | `action: 'DELETE',` |
| [319](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-plan-service.ts#L319) | `async listOrders(input: {` |
| [324](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-plan-service.ts#L324) | `return this.uow.run(input.ctx, async (tx) => {` |
| [326](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-plan-service.ts#L326) | `await this.access.require(tx, ctx, Permission.PURCHASE_PLAN_VIEW);` |
| [350](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-plan-service.ts#L350) | `async order(input: {` |
| [354](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-plan-service.ts#L354) | `return this.uow.run(input.ctx, async (tx) => {` |
| [356](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-plan-service.ts#L356) | `await this.access.require(tx, ctx, Permission.PURCHASE_PLAN_VIEW);` |
| [397](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-plan-service.ts#L397) | `async detail(input: {` |
| [401](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-plan-service.ts#L401) | `return this.uow.run(input.ctx, async (tx) => {` |
| [402](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-plan-service.ts#L402) | `await this.access.require(tx, input.ctx, Permission.PURCHASE_PLAN_VIEW);` |
| [407](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-plan-service.ts#L407) | `async list(input: {` |
| [412](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-plan-service.ts#L412) | `return this.uow.run(input.ctx, async (tx) => {` |
| [414](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-plan-service.ts#L414) | `await this.access.require(tx, ctx, Permission.PURCHASE_PLAN_VIEW);` |
| [415](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-plan-service.ts#L415) | `const showMoney = (await this.access.permissionsOf(tx, ctx)).includes(Permission.COST_VIEW);` |
| [452](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-plan-service.ts#L452) | `private async buildLines(` |
| [500](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-plan-service.ts#L500) | `private async detailWithin(` |
| [508](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-plan-service.ts#L508) | `const showMoney = (await this.access.permissionsOf(tx, ctx)).includes(Permission.COST_VIEW);` |
## PurchaseQueryService
File: [packages/core-application/src/purchasing/purchase-query-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-query-service.ts#L1)

| Line | Declaration |
|---|---|
| [47](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-query-service.ts#L47) | `async list(command: PurchaseListCommand): Promise<PurchaseListResponse> {` |
| [48](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-query-service.ts#L48) | `return this.uow.run(command.ctx, async (tx) => {` |
| [50](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-query-service.ts#L50) | `await this.access.require(tx, ctx, Permission.PURCHASE_VIEW);` |
| [51](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-query-service.ts#L51) | `const showCost = (await this.access.permissionsOf(tx, ctx)).includes(Permission.COST_VIEW);` |
| [106](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-query-service.ts#L106) | `async detail(command: PurchaseDetailCommand): Promise<PurchaseResponse> {` |
| [107](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-query-service.ts#L107) | `return this.uow.run(command.ctx, async (tx) => {` |
| [109](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-query-service.ts#L109) | `await this.access.require(tx, ctx, Permission.PURCHASE_VIEW);` |
| [112](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/purchase-query-service.ts#L112) | `const showCost = (await this.access.permissionsOf(tx, ctx)).includes(Permission.COST_VIEW);` |
## VoidPurchaseService
File: [packages/core-application/src/purchasing/void-purchase-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/void-purchase-service.ts#L1)

| Line | Declaration |
|---|---|
| [59](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/void-purchase-service.ts#L59) | `async void(command: VoidPurchaseCommand): Promise<PurchaseResponse> {` |
| [60](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/void-purchase-service.ts#L60) | `return this.uow.run(command.ctx, async (tx) => {` |
| [62](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/void-purchase-service.ts#L62) | `await this.access.require(tx, ctx, Permission.PURCHASE_VOID);` |
| [175](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/void-purchase-service.ts#L175) | `action: 'DELETE',` |
| [185](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/void-purchase-service.ts#L185) | `eventType: 'purchase.cancelled',` |
| [193](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/void-purchase-service.ts#L193) | `const showCost = (await this.access.permissionsOf(tx, ctx)).includes(Permission.COST_VIEW);` |
## ImportStatementService
File: [packages/core-application/src/reconciliation/import-statement-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/import-statement-service.ts#L1)

| Line | Declaration |
|---|---|
| [73](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/import-statement-service.ts#L73) | `async upload(command: UploadStatementCommand): Promise<StatementPreviewResponse> {` |
| [76](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/import-statement-service.ts#L76) | `// Extraction happens outside the transaction: it is CPU work on bytes the` |
| [82](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/import-statement-service.ts#L82) | `return this.uow.run(ctx, async (tx) => {` |
| [83](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/import-statement-service.ts#L83) | `await this.accessControl.require(tx, ctx, Permission.RECONCILIATION_PERFORM);` |
| [114](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/import-statement-service.ts#L114) | `action: 'UPLOADED',` |
| [160](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/import-statement-service.ts#L160) | `async confirm(command: ConfirmStatementCommand): Promise<ReconciliationWorkspaceResponse> {` |
| [163](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/import-statement-service.ts#L163) | `await this.uow.run(ctx, async (tx) => {` |
| [164](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/import-statement-service.ts#L164) | `await this.accessControl.require(tx, ctx, Permission.RECONCILIATION_PERFORM);` |
| [212](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/import-statement-service.ts#L212) | `action: 'IMPORTED',` |
| [232](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/import-statement-service.ts#L232) | `async readFile(command: ReadStatementFileCommand): Promise<StatementFileContent> {` |
| [235](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/import-statement-service.ts#L235) | `return this.uow.run(ctx, async (tx) => {` |
| [236](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/import-statement-service.ts#L236) | `await this.accessControl.require(tx, ctx, Permission.RECONCILIATION_VIEW);` |
| [258](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/import-statement-service.ts#L258) | `private async extract(content: Uint8Array): ReturnType<StatementExtractor['extract']> {` |
## ReconcileAccountService
File: [packages/core-application/src/reconciliation/reconcile-account-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/reconcile-account-service.ts#L1)

| Line | Declaration |
|---|---|
| [118](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/reconcile-account-service.ts#L118) | `async start(command: StartReconciliationCommand): Promise<ReconciliationWorkspaceResponse> {` |
| [121](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/reconcile-account-service.ts#L121) | `return this.uow.run(ctx, async (tx) => {` |
| [122](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/reconcile-account-service.ts#L122) | `await this.accessControl.require(tx, ctx, Permission.RECONCILIATION_PERFORM);` |
| [164](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/reconcile-account-service.ts#L164) | `action: 'STARTED',` |
| [191](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/reconcile-account-service.ts#L191) | `async workspace(command: WorkspaceCommand): Promise<ReconciliationWorkspaceResponse> {` |
| [194](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/reconcile-account-service.ts#L194) | `return this.uow.run(ctx, async (tx) => {` |
| [195](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/reconcile-account-service.ts#L195) | `await this.accessControl.require(tx, ctx, Permission.RECONCILIATION_VIEW);` |
| [200](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/reconcile-account-service.ts#L200) | `async list(command: ListReconciliationsCommand): Promise<ReconciliationListResponse> {` |
| [203](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/reconcile-account-service.ts#L203) | `return this.uow.run(ctx, async (tx) => {` |
| [204](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/reconcile-account-service.ts#L204) | `await this.accessControl.require(tx, ctx, Permission.RECONCILIATION_VIEW);` |
| [234](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/reconcile-account-service.ts#L234) | `async saveMatch(command: SaveMatchCommand): Promise<ReconciliationWorkspaceResponse> {` |
| [237](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/reconcile-account-service.ts#L237) | `return this.uow.run(ctx, async (tx) => {` |
| [238](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/reconcile-account-service.ts#L238) | `await this.accessControl.require(tx, ctx, Permission.RECONCILIATION_PERFORM);` |
| [297](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/reconcile-account-service.ts#L297) | `action: `MATCH_${command.state}`,` |
| [310](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/reconcile-account-service.ts#L310) | `async removeMatch(command: RemoveMatchCommand): Promise<ReconciliationWorkspaceResponse> {` |
| [313](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/reconcile-account-service.ts#L313) | `return this.uow.run(ctx, async (tx) => {` |
| [314](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/reconcile-account-service.ts#L314) | `await this.accessControl.require(tx, ctx, Permission.RECONCILIATION_PERFORM);` |
| [323](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/reconcile-account-service.ts#L323) | `action: 'MATCH_REMOVED',` |
| [345](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/reconcile-account-service.ts#L345) | `async complete(` |
| [350](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/reconcile-account-service.ts#L350) | `return this.uow.run(ctx, async (tx) => {` |
| [351](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/reconcile-account-service.ts#L351) | `await this.accessControl.require(tx, ctx, Permission.RECONCILIATION_PERFORM);` |
| [393](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/reconcile-account-service.ts#L393) | `action: 'COMPLETED',` |
| [417](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/reconcile-account-service.ts#L417) | `async reopen(command: ReopenReconciliationCommand): Promise<ReconciliationWorkspaceResponse> {` |
| [420](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/reconcile-account-service.ts#L420) | `return this.uow.run(ctx, async (tx) => {` |
| [421](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/reconcile-account-service.ts#L421) | `await this.accessControl.require(tx, ctx, Permission.RECONCILIATION_REOPEN);` |
| [443](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/reconcile-account-service.ts#L443) | `action: 'REOPENED',` |
| [456](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/reconcile-account-service.ts#L456) | `private async requireExisting(` |
| [466](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/reconcile-account-service.ts#L466) | `private async requireDraft(tx: Tx, ctx: TenantContext, id: string): Promise<ReconciliationRow> {` |
| [477](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/reconcile-account-service.ts#L477) | `private async requireAccount(` |
| [488](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/reconcile-account-service.ts#L488) | `private async freezeAutoLinks(` |
| [530](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reconciliation/reconcile-account-service.ts#L530) | `private async build(` |
## DashboardService
File: [packages/core-application/src/reporting/dashboard-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/dashboard-service.ts#L1)

| Line | Declaration |
|---|---|
| [36](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/dashboard-service.ts#L36) | `async execute(ctx: TenantContext): Promise<DashboardResponse> {` |
| [39](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/dashboard-service.ts#L39) | `const body = await this.uow.run(ctx, async (tx) => {` |
| [47](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/dashboard-service.ts#L47) | `if (!may(Permission.DASHBOARD_VIEW)) return { businessName, businessDate };` |
| [50](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/dashboard-service.ts#L50) | `const sales = may(Permission.REPORT_SALES_VIEW);` |
| [51](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/dashboard-service.ts#L51) | `const money = may(Permission.REPORT_MONEY_VIEW);` |
| [52](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/dashboard-service.ts#L52) | `const stock = may(Permission.REPORT_STOCK_VIEW);` |
| [53](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/dashboard-service.ts#L53) | `const profit = may(Permission.REPORT_PROFIT_VIEW);` |
| [80](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/dashboard-service.ts#L80) | `...(stock && may(Permission.COST_VIEW) ? { stockValueMinor: figures.stockValueMinor } : {}),` |
## ProfitTargetService
File: [packages/core-application/src/reporting/profit-target-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/profit-target-service.ts#L1)

| Line | Declaration |
|---|---|
| [36](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/profit-target-service.ts#L36) | `async get(ctx: TenantContext, month: string): Promise<TargetResponse> {` |
| [37](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/profit-target-service.ts#L37) | `return this.uow.run(ctx, async (tx) => {` |
| [38](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/profit-target-service.ts#L38) | `await this.access.require(tx, ctx, Permission.REPORT_PROFIT_VIEW);` |
| [43](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/profit-target-service.ts#L43) | `async set(ctx: TenantContext, input: SetTargetRequest): Promise<TargetResponse> {` |
| [44](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/profit-target-service.ts#L44) | `return this.uow.run(ctx, async (tx) => {` |
| [45](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/profit-target-service.ts#L45) | `await this.access.require(tx, ctx, Permission.REPORT_TARGET_MANAGE);` |
| [58](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/profit-target-service.ts#L58) | `action: existing === null ? 'CREATE' : 'UPDATE',` |
| [71](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/profit-target-service.ts#L71) | `private async progress(tx: Tx, ctx: TenantContext, month: string): Promise<TargetResponse> {` |
## ReportQueryService
File: [packages/core-application/src/reporting/report-query-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/report-query-service.ts#L1)

| Line | Declaration |
|---|---|
| [40](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/report-query-service.ts#L40) | `async sales(ctx: TenantContext, query: SalesReportQuery): Promise<SalesReportResponse> {` |
| [41](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/report-query-service.ts#L41) | `return this.uow.run(ctx, async (tx) => {` |
| [42](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/report-query-service.ts#L42) | `await this.access.require(tx, ctx, Permission.REPORT_SALES_VIEW);` |
| [56](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/report-query-service.ts#L56) | `async purchases(ctx: TenantContext, query: PurchaseReportQuery): Promise<PurchaseReportResponse> {` |
| [57](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/report-query-service.ts#L57) | `return this.uow.run(ctx, async (tx) => {` |
| [58](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/report-query-service.ts#L58) | `await this.access.require(tx, ctx, Permission.REPORT_PURCHASE_VIEW);` |
| [87](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/report-query-service.ts#L87) | `async stock(ctx: TenantContext, query: StockReportQuery): Promise<StockReportResponse> {` |
| [88](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/report-query-service.ts#L88) | `return this.uow.run(ctx, async (tx) => {` |
| [89](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/report-query-service.ts#L89) | `await this.access.require(tx, ctx, Permission.REPORT_STOCK_VIEW);` |
| [90](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/report-query-service.ts#L90) | `await this.access.require(tx, ctx, Permission.COST_VIEW);` |
| [118](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/report-query-service.ts#L118) | `async money(ctx: TenantContext, query: MoneyReportQuery): Promise<MoneyReportResponse> {` |
| [119](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/report-query-service.ts#L119) | `return this.uow.run(ctx, async (tx) => {` |
| [120](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/report-query-service.ts#L120) | `await this.access.require(tx, ctx, Permission.REPORT_MONEY_VIEW);` |
| [161](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/report-query-service.ts#L161) | `await this.access.require(tx, ctx, Permission.REPORT_PROFIT_VIEW);` |
| [197](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/report-query-service.ts#L197) | `private async ageing(` |
| [274](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/report-query-service.ts#L274) | `async performance(ctx: TenantContext, query: PerformanceQuery): Promise<PerformanceResponse> {` |
| [275](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/report-query-service.ts#L275) | `return this.uow.run(ctx, async (tx) => {` |
| [276](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/report-query-service.ts#L276) | `await this.access.require(tx, ctx, Permission.REPORT_SALES_VIEW);` |
| [335](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/report-query-service.ts#L335) | `async why(ctx: TenantContext, query: WhyQuery): Promise<WhyResponse> {` |
| [336](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/report-query-service.ts#L336) | `return this.uow.run(ctx, async (tx) => {` |
| [339](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/report-query-service.ts#L339) | `? Permission.REPORT_STOCK_VIEW` |
| [341](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/report-query-service.ts#L341) | `? Permission.REPORT_PURCHASE_VIEW` |
| [343](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/report-query-service.ts#L343) | `? Permission.REPORT_SALES_VIEW` |
| [344](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/report-query-service.ts#L344) | `: Permission.REPORT_MONEY_VIEW;` |
| [384](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/report-query-service.ts#L384) | `private async visibility(` |
| [390](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/report-query-service.ts#L390) | `cost: held.includes(Permission.COST_VIEW),` |
| [391](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/reporting/report-query-service.ts#L391) | `profit: held.includes(Permission.REPORT_PROFIT_VIEW),` |
## CreatePurchaseReturnService
File: [packages/core-application/src/returns/create-purchase-return-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/create-purchase-return-service.ts#L1)

| Line | Declaration |
|---|---|
| [29](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/create-purchase-return-service.ts#L29) | `* **WRITE CLASS: T** (R-D). One transaction: permission → idempotency → the` |
| [109](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/create-purchase-return-service.ts#L109) | `async void(command: VoidPurchaseReturnCommand): Promise<void> {` |
| [110](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/create-purchase-return-service.ts#L110) | `return this.uow.run(command.ctx, async (tx) => {` |
| [112](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/create-purchase-return-service.ts#L112) | `await this.access.require(tx, ctx, Permission.PURCHASE_RETURN_VOID);` |
| [188](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/create-purchase-return-service.ts#L188) | `action: 'DELETE',` |
| [194](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/create-purchase-return-service.ts#L194) | `eventType: 'purchase.return.cancelled',` |
| [202](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/create-purchase-return-service.ts#L202) | `async create(command: CreatePurchaseReturnCommand): Promise<PurchaseReturnResponse> {` |
| [213](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/create-purchase-return-service.ts#L213) | `return this.uow.run(command.ctx, async (tx) => {` |
| [215](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/create-purchase-return-service.ts#L215) | `await this.access.require(tx, ctx, Permission.PURCHASE_RETURN_CREATE);` |
| [395](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/create-purchase-return-service.ts#L395) | `action: 'CREATE',` |
| [407](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/create-purchase-return-service.ts#L407) | `eventType: 'purchase.return.posted',` |
| [428](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/create-purchase-return-service.ts#L428) | `private async guardDate(` |
| [439](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/create-purchase-return-service.ts#L439) | `await this.access.require(tx, ctx, Permission.PERIOD_BACKDATE);` |
| [451](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/create-purchase-return-service.ts#L451) | `private async detail(tx: Tx, ctx: TenantContext, returnId: string): Promise<PurchaseReturnResponse> {` |
## CreateSalesReturnService
File: [packages/core-application/src/returns/create-sales-return-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/create-sales-return-service.ts#L1)

| Line | Declaration |
|---|---|
| [33](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/create-sales-return-service.ts#L33) | `* **WRITE CLASS: T** (R-D). One transaction: permission → idempotency → the` |
| [136](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/create-sales-return-service.ts#L136) | `async void(command: VoidSalesReturnCommand): Promise<void> {` |
| [137](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/create-sales-return-service.ts#L137) | `return this.uow.run(command.ctx, async (tx) => {` |
| [139](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/create-sales-return-service.ts#L139) | `await this.access.require(tx, ctx, Permission.SALES_RETURN_VOID);` |
| [328](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/create-sales-return-service.ts#L328) | `action: 'DELETE',` |
| [334](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/create-sales-return-service.ts#L334) | `eventType: 'sales.return.cancelled',` |
| [342](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/create-sales-return-service.ts#L342) | `async create(command: CreateSalesReturnCommand): Promise<SalesReturnResponse> {` |
| [353](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/create-sales-return-service.ts#L353) | `return this.uow.run(command.ctx, async (tx) => {` |
| [355](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/create-sales-return-service.ts#L355) | `await this.access.require(tx, ctx, Permission.SALES_RETURN_CREATE);` |
| [687](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/create-sales-return-service.ts#L687) | `action: 'CREATE',` |
| [700](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/create-sales-return-service.ts#L700) | `eventType: 'sales.return.posted',` |
| [743](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/create-sales-return-service.ts#L743) | `private async resolveCreditParty(` |
| [809](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/create-sales-return-service.ts#L809) | `private async guardDate(` |
| [820](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/create-sales-return-service.ts#L820) | `await this.access.require(tx, ctx, Permission.PERIOD_BACKDATE);` |
| [841](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/create-sales-return-service.ts#L841) | `private async approveRefund(` |
| [875](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/create-sales-return-service.ts#L875) | `private async detail(tx: Tx, ctx: TenantContext, returnId: string): Promise<SalesReturnResponse> {` |
## PurchaseReturnQueryService
File: [packages/core-application/src/returns/purchase-return-query-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/purchase-return-query-service.ts#L1)

| Line | Declaration |
|---|---|
| [24](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/purchase-return-query-service.ts#L24) | `async returnable(ctx: TenantContext, purchaseId: string): Promise<ReturnableBillResponse> {` |
| [25](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/purchase-return-query-service.ts#L25) | `return this.uow.run(ctx, async (tx) => {` |
| [26](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/purchase-return-query-service.ts#L26) | `await this.access.require(tx, ctx, Permission.PURCHASE_RETURN_CREATE);` |
| [58](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/purchase-return-query-service.ts#L58) | `async list(ctx: TenantContext, filter: PurchaseReturnFilter): Promise<PurchaseReturnListResponse> {` |
| [59](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/purchase-return-query-service.ts#L59) | `return this.uow.run(ctx, async (tx) => {` |
| [60](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/purchase-return-query-service.ts#L60) | `await this.access.require(tx, ctx, Permission.PURCHASE_RETURN_VIEW);` |
## SalesReturnQueryService
File: [packages/core-application/src/returns/sales-return-query-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/sales-return-query-service.ts#L1)

| Line | Declaration |
|---|---|
| [28](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/sales-return-query-service.ts#L28) | `async returnable(ctx: TenantContext, saleId: string): Promise<ReturnableInvoiceResponse> {` |
| [29](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/sales-return-query-service.ts#L29) | `return this.uow.run(ctx, async (tx) => {` |
| [30](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/sales-return-query-service.ts#L30) | `await this.access.require(tx, ctx, Permission.SALES_RETURN_CREATE);` |
| [90](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/sales-return-query-service.ts#L90) | `async list(ctx: TenantContext, filter: SalesReturnFilter): Promise<SalesReturnListResponse> {` |
| [91](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/sales-return-query-service.ts#L91) | `return this.uow.run(ctx, async (tx) => {` |
| [92](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/returns/sales-return-query-service.ts#L92) | `await this.access.require(tx, ctx, Permission.SALES_RETURN_VIEW);` |
## CancelSaleService
File: [packages/core-application/src/sales/cancel-sale-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/cancel-sale-service.ts#L1)

| Line | Declaration |
|---|---|
| [58](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/cancel-sale-service.ts#L58) | `async cancel(command: CancelSaleCommand): Promise<SaleResponse> {` |
| [59](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/cancel-sale-service.ts#L59) | `return this.uow.run(command.ctx, (tx) => this.cancelWithin(tx, command));` |
| [63](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/cancel-sale-service.ts#L63) | `async cancelWithin(tx: Tx, command: CancelSaleCommand): Promise<SaleResponse> {` |
| [65](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/cancel-sale-service.ts#L65) | `await this.access.require(tx, ctx, Permission.SALE_VOID);` |
| [234](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/cancel-sale-service.ts#L234) | `action: 'DELETE',` |
| [240](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/cancel-sale-service.ts#L240) | `eventType: 'sale.cancelled',` |
| [248](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/cancel-sale-service.ts#L248) | `const showCost = (await this.access.permissionsOf(tx, ctx)).includes(Permission.COST_VIEW);` |
## CreateSaleService
File: [packages/core-application/src/sales/create-sale-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/create-sale-service.ts#L1)

| Line | Declaration |
|---|---|
| [174](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/create-sale-service.ts#L174) | `async create(command: CreateSaleCommand): Promise<SaleResponse> {` |
| [202](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/create-sale-service.ts#L202) | `return this.uow.run(command.ctx, async (tx) => {` |
| [204](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/create-sale-service.ts#L204) | `await this.access.require(tx, ctx, Permission.SALE_CREATE);` |
| [509](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/create-sale-service.ts#L509) | `action: 'CREATE',` |
| [524](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/create-sale-service.ts#L524) | `eventType: 'sale.posted',` |
| [549](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/create-sale-service.ts#L549) | `private async resolveCustomer(` |
| [650](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/create-sale-service.ts#L650) | `private async mixedStockLine(` |
| [1092](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/create-sale-service.ts#L1092) | `private async detail(` |
| [1100](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/create-sale-service.ts#L1100) | `const showCost = (await this.access.permissionsOf(tx, ctx)).includes(Permission.COST_VIEW);` |
## InvoicePresentationService
File: [packages/core-application/src/sales/invoice-presentation-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/invoice-presentation-service.ts#L1)

| Line | Declaration |
|---|---|
| [50](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/invoice-presentation-service.ts#L50) | `async update(command: UpdateInvoicePresentationCommand): Promise<SaleResponse> {` |
| [51](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/invoice-presentation-service.ts#L51) | `return this.uow.run(command.ctx, async (tx) => {` |
| [53](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/invoice-presentation-service.ts#L53) | `await this.access.require(tx, ctx, Permission.SALE_PRESENTATION_EDIT);` |
| [76](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/invoice-presentation-service.ts#L76) | `action: before === null ? 'CREATE' : 'UPDATE',` |
| [84](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/invoice-presentation-service.ts#L84) | `const showCost = (await this.access.permissionsOf(tx, ctx)).includes(Permission.COST_VIEW);` |
| [90](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/invoice-presentation-service.ts#L90) | `async saveLogo(command: {` |
| [94](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/invoice-presentation-service.ts#L94) | `return this.uow.run(command.ctx, async (tx) => {` |
| [96](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/invoice-presentation-service.ts#L96) | `await this.access.require(tx, ctx, Permission.SETTING_EDIT);` |
| [116](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/invoice-presentation-service.ts#L116) | `action: 'UPDATE',` |
| [127](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/invoice-presentation-service.ts#L127) | `async logo(ctx: TenantContext): Promise<{ readonly mime: string; readonly bytes: Uint8Array }> {` |
| [128](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/invoice-presentation-service.ts#L128) | `return this.uow.run(ctx, async (tx) => {` |
| [129](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/invoice-presentation-service.ts#L129) | `await this.access.require(tx, ctx, Permission.SALE_VIEW);` |
| [136](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/invoice-presentation-service.ts#L136) | `async updateSettings(command: UpdateInvoiceSettingsCommand): Promise<InvoiceSettings> {` |
| [137](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/invoice-presentation-service.ts#L137) | `return this.uow.run(command.ctx, async (tx) => {` |
| [141](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/invoice-presentation-service.ts#L141) | `await this.access.require(tx, ctx, Permission.SETTING_EDIT);` |
| [155](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/invoice-presentation-service.ts#L155) | `action: 'UPDATE',` |
## QuotationService
File: [packages/core-application/src/sales/quotation-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/quotation-service.ts#L1)

| Line | Declaration |
|---|---|
| [59](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/quotation-service.ts#L59) | `async create(command: CreateQuotationCommand): Promise<QuotationResponse> {` |
| [60](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/quotation-service.ts#L60) | `return this.uow.run(command.ctx, async (tx) => {` |
| [67](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/quotation-service.ts#L67) | `? Permission.SALE_QUOTATION_MANAGE` |
| [68](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/quotation-service.ts#L68) | `: Permission.SALE_ORDER_MANAGE,` |
| [129](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/quotation-service.ts#L129) | `action: 'CREATE',` |
| [141](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/quotation-service.ts#L141) | `async list(` |
| [146](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/quotation-service.ts#L146) | `return this.uow.run(ctx, async (tx) => {` |
| [151](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/quotation-service.ts#L151) | `kind === 'QUOTATION' ? Permission.SALE_QUOTATION_MANAGE : Permission.SALE_ORDER_MANAGE,` |
| [158](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/quotation-service.ts#L158) | `async detail(` |
| [163](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/quotation-service.ts#L163) | `return this.uow.run(ctx, async (tx) => {` |
| [168](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/quotation-service.ts#L168) | `kind === 'QUOTATION' ? Permission.SALE_QUOTATION_MANAGE : Permission.SALE_ORDER_MANAGE,` |
| [176](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/quotation-service.ts#L176) | `private async assertWholesaleOn(tx: Tx, ctx: TenantContext): Promise<void> {` |
## ReceiveCustomerPaymentService
File: [packages/core-application/src/sales/receive-payment-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/receive-payment-service.ts#L1)

| Line | Declaration |
|---|---|
| [80](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/receive-payment-service.ts#L80) | `async receive(command: ReceiveCustomerPaymentCommand): Promise<CustomerReceiptResponse> {` |
| [81](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/receive-payment-service.ts#L81) | `return this.receiveForRole(command, Permission.SALE_RECEIVE_PAYMENT, 'CUSTOMER');` |
| [85](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/receive-payment-service.ts#L85) | `async receiveVendor(command: ReceiveCustomerPaymentCommand): Promise<CustomerReceiptResponse> {` |
| [86](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/receive-payment-service.ts#L86) | `return this.receiveForRole(command, Permission.VENDOR_RECEIPT_RECORD, 'VENDOR');` |
| [89](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/receive-payment-service.ts#L89) | `private async receiveForRole(` |
| [106](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/receive-payment-service.ts#L106) | `return this.uow.run(command.ctx, async (tx) => {` |
| [211](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/receive-payment-service.ts#L211) | `action: 'CREATE',` |
| [225](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/receive-payment-service.ts#L225) | `eventType: 'customer.payment.received',` |
| [250](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/receive-payment-service.ts#L250) | `async void(command: VoidReceiptCommand): Promise<CustomerReceiptResponse> {` |
| [251](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/receive-payment-service.ts#L251) | `return this.uow.run(command.ctx, async (tx) => {` |
| [253](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/receive-payment-service.ts#L253) | `await this.access.require(tx, ctx, Permission.RECEIPT_VOID);` |
| [272](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/receive-payment-service.ts#L272) | `eventType: 'customer.receipt.cancelled',` |
| [290](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/receive-payment-service.ts#L290) | `async correct(command: CorrectReceiptCommand): Promise<CustomerReceiptResponse> {` |
| [291](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/receive-payment-service.ts#L291) | `return this.uow.run(command.ctx, async (tx) => {` |
| [293](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/receive-payment-service.ts#L293) | `await this.access.require(tx, ctx, Permission.SALE_RECEIVE_PAYMENT);` |
| [335](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/receive-payment-service.ts#L335) | `eventType: 'customer.receipt.corrected',` |
| [398](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/receive-payment-service.ts#L398) | `action: 'UPDATE',` |
| [417](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/receive-payment-service.ts#L417) | `private async isOpen(tx: Tx, ctx: TenantContext, businessDate: string): Promise<boolean> {` |
| [426](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/receive-payment-service.ts#L426) | `private async detail(` |
## SaleQueryService
File: [packages/core-application/src/sales/sale-query-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/sale-query-service.ts#L1)

| Line | Declaration |
|---|---|
| [84](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/sale-query-service.ts#L84) | `async list(ctx: TenantContext, query: SaleListQuery): Promise<SaleListResponse> {` |
| [85](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/sale-query-service.ts#L85) | `return this.uow.run(ctx, async (tx) => {` |
| [86](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/sale-query-service.ts#L86) | `await this.access.require(tx, ctx, Permission.SALE_VIEW);` |
| [119](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/sale-query-service.ts#L119) | `async detail(ctx: TenantContext, id: string): Promise<SaleResponse> {` |
| [120](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/sale-query-service.ts#L120) | `return this.uow.run(ctx, async (tx) => {` |
| [121](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/sale-query-service.ts#L121) | `await this.access.require(tx, ctx, Permission.SALE_VIEW);` |
| [124](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/sale-query-service.ts#L124) | `const showCost = (await this.access.permissionsOf(tx, ctx)).includes(Permission.COST_VIEW);` |
| [136](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/sale-query-service.ts#L136) | `async customerStanding(` |
| [140](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/sale-query-service.ts#L140) | `return this.uow.run(ctx, async (tx) => {` |
| [141](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/sale-query-service.ts#L141) | `await this.access.require(tx, ctx, Permission.CUSTOMER_VIEW);` |
| [180](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/sale-query-service.ts#L180) | `async posProducts(ctx: TenantContext, query: PosProductQuery): Promise<PosProductList> {` |
| [181](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/sale-query-service.ts#L181) | `return this.uow.run(ctx, async (tx) => {` |
| [182](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/sale-query-service.ts#L182) | `await this.access.require(tx, ctx, Permission.SALE_CREATE);` |
| [185](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/sale-query-service.ts#L185) | `const showCost = permissions.includes(Permission.COST_VIEW);` |
| [266](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/sale-query-service.ts#L266) | `async listDrafts(ctx: TenantContext): Promise<readonly SaleDraftResponse[]> {` |
| [267](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/sale-query-service.ts#L267) | `return this.uow.run(ctx, async (tx) => {` |
| [268](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/sale-query-service.ts#L268) | `await this.access.require(tx, ctx, Permission.SALE_CREATE);` |
| [283](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/sale-query-service.ts#L283) | `async saveDraft(` |
| [287](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/sale-query-service.ts#L287) | `return this.uow.run(ctx, async (tx) => {` |
| [288](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/sale-query-service.ts#L288) | `await this.access.require(tx, ctx, Permission.SALE_CREATE);` |
| [305](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/sale-query-service.ts#L305) | `async deleteDraft(ctx: TenantContext, id: string): Promise<void> {` |
| [306](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/sale-query-service.ts#L306) | `return this.uow.run(ctx, async (tx) => {` |
| [307](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/sale-query-service.ts#L307) | `await this.access.require(tx, ctx, Permission.SALE_CREATE);` |
| [313](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/sale-query-service.ts#L313) | `async invoiceSettings(ctx: TenantContext): Promise<InvoiceSettings> {` |
| [314](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/sale-query-service.ts#L314) | `return this.uow.run(ctx, async (tx) => {` |
| [315](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/sale-query-service.ts#L315) | `await this.access.require(tx, ctx, Permission.SALE_VIEW);` |
## GlobalSearchService
File: [packages/core-application/src/search/global-search-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/search/global-search-service.ts#L1)

| Line | Declaration |
|---|---|
| [59](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/search/global-search-service.ts#L59) | `async search(command: GlobalSearchCommand): Promise<{ groups: GlobalSearchGroup[] }> {` |
| [65](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/search/global-search-service.ts#L65) | `return this.uow.run(ctx, async (tx) => {` |
| [71](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/search/global-search-service.ts#L71) | `const vendorsOn = may(Permission.VENDOR_VIEW)` |
| [76](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/search/global-search-service.ts#L76) | `may(Permission.PRODUCT_VIEW) ? this.productGroup(tx, ctx, query, limit) : null,` |
| [77](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/search/global-search-service.ts#L77) | `may(Permission.CUSTOMER_VIEW) ? this.partyGroup(tx, ctx, 'CUSTOMER', 'Customers', query, limit) : null,` |
| [78](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/search/global-search-service.ts#L78) | `may(Permission.SUPPLIER_VIEW) ? this.partyGroup(tx, ctx, 'SUPPLIER', 'Suppliers', query, limit) : null,` |
| [80](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/search/global-search-service.ts#L80) | `may(Permission.SALE_VIEW) ? this.saleGroup(tx, ctx, query, limit) : null,` |
| [81](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/search/global-search-service.ts#L81) | `may(Permission.PURCHASE_VIEW) ? this.purchaseGroup(tx, ctx, query, limit) : null,` |
| [97](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/search/global-search-service.ts#L97) | `private async productGroup(` |
| [130](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/search/global-search-service.ts#L130) | `private async partyGroup(` |
| [165](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/search/global-search-service.ts#L165) | `private async saleGroup(` |
| [195](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/search/global-search-service.ts#L195) | `private async purchaseGroup(` |
## ManageSettingsService
File: [packages/core-application/src/settings/manage-settings-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/settings/manage-settings-service.ts#L1)

| Line | Declaration |
|---|---|
| [91](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/settings/manage-settings-service.ts#L91) | `async get(command: GetSettingsCommand): Promise<SettingsResponse> {` |
| [94](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/settings/manage-settings-service.ts#L94) | `return this.uow.run(ctx, async (tx) => {` |
| [95](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/settings/manage-settings-service.ts#L95) | `await this.accessControl.require(tx, ctx, Permission.SETTING_VIEW);` |
| [100](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/settings/manage-settings-service.ts#L100) | `async updateSetting(command: UpdateSettingCommand): Promise<UpdateSettingResult> {` |
| [103](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/settings/manage-settings-service.ts#L103) | `return this.uow.run(ctx, async (tx) => {` |
| [119](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/settings/manage-settings-service.ts#L119) | `descriptor.kind === 'TOGGLE' ? Permission.SETTING_TOGGLE : Permission.SETTING_EDIT,` |
| [163](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/settings/manage-settings-service.ts#L163) | `action: 'UPDATE',` |
| [174](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/settings/manage-settings-service.ts#L174) | `action: 'UPDATE',` |
| [199](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/settings/manage-settings-service.ts#L199) | `async updateBusinessProfile(command: UpdateBusinessProfileCommand): Promise<SettingsResponse> {` |
| [203](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/settings/manage-settings-service.ts#L203) | `return this.uow.run(ctx, async (tx) => {` |
| [204](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/settings/manage-settings-service.ts#L204) | `await this.accessControl.require(tx, ctx, Permission.SETTING_EDIT);` |
| [226](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/settings/manage-settings-service.ts#L226) | `action: 'UPDATE',` |
| [237](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/settings/manage-settings-service.ts#L237) | `private async loadValues(tx: Tx, ctx: TenantContext): Promise<Map<string, string>> {` |
| [242](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/settings/manage-settings-service.ts#L242) | `private async snapshot(tx: Tx, ctx: TenantContext): Promise<SettingsResponse> {` |
| [262](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/settings/manage-settings-service.ts#L262) | `private async assertStepUp(tx: Tx, ctx: TenantContext, confirmPassword: string): Promise<void> {` |
## ReplayService
File: [packages/core-application/src/sync/replay-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/replay-service.ts#L1)

| Line | Declaration |
|---|---|
| [65](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/replay-service.ts#L65) | `async push(ctx: TenantContext, request: SyncPushRequest): Promise<SyncPushResponse> {` |
| [95](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/replay-service.ts#L95) | `const device = await this.uow.run(ctx, async (tx) =>` |
| [140](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/replay-service.ts#L140) | `(await this.uow.run(ctx, async (tx) => this.devices.listDeviceUsers(tx, ctx, device.id))).map(` |
| [154](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/replay-service.ts#L154) | `await this.uow.run(ctx, async (tx) => {` |
| [183](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/replay-service.ts#L183) | `action: 'DRAINED',` |
| [205](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/replay-service.ts#L205) | `private async one(` |
| [217](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/replay-service.ts#L217) | `const seen = await this.uow.run(ctx, async (tx) =>` |
| [275](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/replay-service.ts#L275) | `const reused = await this.uow.run(ctx, async (tx) =>` |
| [345](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/replay-service.ts#L345) | `const serverSeq = await this.uow.run(ctx, async (tx) => {` |
| [374](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/replay-service.ts#L374) | `action: 'SYNC_APPLY',` |
| [416](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/replay-service.ts#L416) | `const posted = await this.uow.run(ctx, async (tx) => {` |
| [494](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/replay-service.ts#L494) | `private async record(` |
| [501](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/replay-service.ts#L501) | `return this.uow.run(ctx, async (tx) => {` |
| [522](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/replay-service.ts#L522) | `private async quarantine(` |
| [537](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/replay-service.ts#L537) | `const conflictId = await this.uow.run(ctx, async (tx) => {` |
| [623](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/replay-service.ts#L623) | `private async remap(ctx: TenantContext, payload: unknown): Promise<unknown> {` |
| [628](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/replay-service.ts#L628) | `const mapping = await this.uow.run(ctx, async (tx) =>` |
| [636](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/replay-service.ts#L636) | `private async openConflictCount(ctx: TenantContext): Promise<number> {` |
| [637](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/replay-service.ts#L637) | `return this.uow.run(ctx, async (tx) => (await this.sync.counts(tx, ctx)).openConflicts);` |
## ResolveConflictService
File: [packages/core-application/src/sync/resolve-conflict-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/resolve-conflict-service.ts#L1)

| Line | Declaration |
|---|---|
| [51](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/resolve-conflict-service.ts#L51) | `async resolve(command: {` |
| [59](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/resolve-conflict-service.ts#L59) | `const conflict = await this.uow.run(ctx, async (tx) => {` |
| [64](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/resolve-conflict-service.ts#L64) | `? Permission.SYNC_CONFLICT_DISCARD` |
| [65](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/resolve-conflict-service.ts#L65) | `: Permission.SYNC_CONFLICT_RESOLVE,` |
| [102](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/resolve-conflict-service.ts#L102) | `private async discard(` |
| [115](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/resolve-conflict-service.ts#L115) | `return this.uow.run(ctx, async (tx) => {` |
| [131](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/resolve-conflict-service.ts#L131) | `action: 'DISCARD',` |
| [156](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/resolve-conflict-service.ts#L156) | `private async repost(` |
| [163](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/resolve-conflict-service.ts#L163) | `const device = await this.uow.run(ctx, async (tx) =>` |
| [196](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/resolve-conflict-service.ts#L196) | `return await this.uow.run(ctx, async (tx) => {` |
| [224](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/resolve-conflict-service.ts#L224) | `action: 'RESOLVE',` |
| [251](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/resolve-conflict-service.ts#L251) | `await this.uow.run(ctx, async (tx) => {` |
## SyncReadService
File: [packages/core-application/src/sync/sync-read-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/sync-read-service.ts#L1)

| Line | Declaration |
|---|---|
| [40](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/sync-read-service.ts#L40) | `async status(ctx: TenantContext): Promise<SyncStatusResponse> {` |
| [41](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/sync-read-service.ts#L41) | `return this.uow.run(ctx, async (tx) => {` |
| [42](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/sync-read-service.ts#L42) | `await this.access.require(tx, ctx, Permission.SYNC_STATUS_VIEW);` |
| [69](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/sync-read-service.ts#L69) | `async conflicts(` |
| [73](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/sync-read-service.ts#L73) | `return this.uow.run(ctx, async (tx) => {` |
| [74](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/sync-read-service.ts#L74) | `await this.access.require(tx, ctx, Permission.SYNC_STATUS_VIEW);` |
| [96](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/sync-read-service.ts#L96) | `async pull(` |
| [107](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/sync-read-service.ts#L107) | `const changed = await this.uow.run(ctx, async (tx) => {` |
| [157](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/sync-read-service.ts#L157) | `await this.uow.run(ctx, async (tx) => {` |
| [170](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/sync-read-service.ts#L170) | `private async productOrNull(ctx: TenantContext, id: string): Promise<unknown> {` |
| [178](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sync/sync-read-service.ts#L178) | `private async partyOrNull(ctx: TenantContext, id: string): Promise<unknown> {` |
## ManageRolesService
File: [packages/core-application/src/users/manage-roles-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-roles-service.ts#L1)

| Line | Declaration |
|---|---|
| [90](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-roles-service.ts#L90) | `async list(command: ListRolesCommand): Promise<RoleListResponse> {` |
| [93](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-roles-service.ts#L93) | `return this.uow.run(ctx, async (tx) => {` |
| [94](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-roles-service.ts#L94) | `await this.accessControl.require(tx, ctx, Permission.ROLE_VIEW);` |
| [104](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-roles-service.ts#L104) | `async create(command: CreateRoleCommand): Promise<RoleDetailResponse> {` |
| [109](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-roles-service.ts#L109) | `return this.uow.run(ctx, async (tx) => {` |
| [110](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-roles-service.ts#L110) | `await this.accessControl.require(tx, ctx, Permission.ROLE_MANAGE);` |
| [131](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-roles-service.ts#L131) | `action: 'CREATE',` |
| [141](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-roles-service.ts#L141) | `async update(command: UpdateRoleCommand): Promise<RoleDetailResponse> {` |
| [146](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-roles-service.ts#L146) | `return this.uow.run(ctx, async (tx) => {` |
| [147](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-roles-service.ts#L147) | `await this.accessControl.require(tx, ctx, Permission.ROLE_MANAGE);` |
| [181](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-roles-service.ts#L181) | `action: 'REPRIVILEGE',` |
| [191](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-roles-service.ts#L191) | `async remove(command: DeleteRoleCommand): Promise<void> {` |
| [194](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-roles-service.ts#L194) | `await this.uow.run(ctx, async (tx) => {` |
| [195](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-roles-service.ts#L195) | `await this.accessControl.require(tx, ctx, Permission.ROLE_MANAGE);` |
| [223](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-roles-service.ts#L223) | `action: 'DELETE',` |
| [232](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-roles-service.ts#L232) | `private async applyPermissions(` |
| [266](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-roles-service.ts#L266) | `private async assertStepUp(tx: Tx, ctx: TenantContext, confirmPassword: string): Promise<void> {` |
| [278](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-roles-service.ts#L278) | `private async requireRole(tx: Tx, ctx: TenantContext, roleId: string): Promise<RoleDetail> {` |
| [285](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-roles-service.ts#L285) | `private async reload(tx: Tx, ctx: TenantContext, roleId: string): Promise<RoleDetailResponse> {` |
## ManageUsersService
File: [packages/core-application/src/users/manage-users-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-users-service.ts#L1)

| Line | Declaration |
|---|---|
| [86](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-users-service.ts#L86) | `async list(command: ListUsersCommand): Promise<UserListResponse> {` |
| [89](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-users-service.ts#L89) | `return this.uow.run(ctx, async (tx) => {` |
| [90](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-users-service.ts#L90) | `await this.accessControl.require(tx, ctx, Permission.USER_VIEW);` |
| [104](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-users-service.ts#L104) | `async create(command: CreateUserCommand): Promise<UserResponse> {` |
| [116](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-users-service.ts#L116) | `return this.uow.run(ctx, async (tx) => {` |
| [117](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-users-service.ts#L117) | `await this.accessControl.require(tx, ctx, Permission.USER_CREATE);` |
| [156](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-users-service.ts#L156) | `action: 'CREATE',` |
| [168](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-users-service.ts#L168) | `async update(command: UpdateUserCommand): Promise<UserResponse> {` |
| [171](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-users-service.ts#L171) | `return this.uow.run(ctx, async (tx) => {` |
| [172](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-users-service.ts#L172) | `await this.accessControl.require(tx, ctx, Permission.USER_EDIT);` |
| [199](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-users-service.ts#L199) | `action: rePrivileging ? 'REPRIVILEGE' : 'UPDATE',` |
| [211](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-users-service.ts#L211) | `async setDisabled(command: SetUserDisabledCommand): Promise<UserResponse> {` |
| [214](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-users-service.ts#L214) | `return this.uow.run(ctx, async (tx) => {` |
| [215](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-users-service.ts#L215) | `await this.accessControl.require(tx, ctx, Permission.USER_DISABLE);` |
| [240](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-users-service.ts#L240) | `action: command.disabled ? 'DISABLE' : 'ENABLE',` |
| [256](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-users-service.ts#L256) | `private async assertStepUp(` |
| [279](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-users-service.ts#L279) | `private async assertNotLastOwner(` |
| [283](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-users-service.ts#L283) | `action: string,` |
| [296](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-users-service.ts#L296) | `private async requireUser(tx: Tx, ctx: TenantContext, userId: string): Promise<UserSummary> {` |
| [303](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/users/manage-users-service.ts#L303) | `private async requireRole(tx: Tx, ctx: TenantContext, roleId: string) {` |
## VendorIssueService
File: [packages/core-application/src/vendors/vendor-issue-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-issue-service.ts#L1)

| Line | Declaration |
|---|---|
| [103](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-issue-service.ts#L103) | `async give(command: GiveProductsToVendorCommand): Promise<SaleResponse  /  VendorProductIssueResponse> {` |
| [108](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-issue-service.ts#L108) | `private async giveCharged(command: GiveProductsToVendorCommand): Promise<SaleResponse> {` |
| [150](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-issue-service.ts#L150) | `private async giveTemporary(` |
| [160](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-issue-service.ts#L160) | `return this.uow.run(command.ctx, async (tx) => {` |
| [162](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-issue-service.ts#L162) | `await this.access.require(tx, ctx, Permission.VENDOR_ISSUE_MANAGE);` |
| [268](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-issue-service.ts#L268) | `action: 'CREATE',` |
| [279](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-issue-service.ts#L279) | `eventType: 'vendor.products.issued',` |
| [303](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-issue-service.ts#L303) | `async receiveBack(command: ReceiveProductsBackCommand): Promise<VendorProductIssueResponse> {` |
| [310](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-issue-service.ts#L310) | `return this.uow.run(command.ctx, async (tx) => {` |
| [312](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-issue-service.ts#L312) | `await this.access.require(tx, ctx, Permission.VENDOR_ISSUE_MANAGE);` |
| [400](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-issue-service.ts#L400) | `action: 'CREATE',` |
| [406](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-issue-service.ts#L406) | `eventType: 'vendor.products.received_back',` |
| [422](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-issue-service.ts#L422) | `private async expiryTracked(tx: Tx, ctx: TenantContext): Promise<boolean> {` |
| [427](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-issue-service.ts#L427) | `private async issueDetail(` |
| [437](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-issue-service.ts#L437) | `private async canSeeCost(tx: Tx, ctx: TenantContext): Promise<boolean> {` |
| [438](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-issue-service.ts#L438) | `return (await this.access.permissionsOf(tx, ctx)).includes(Permission.COST_VIEW);` |
## VendorMoneyService
File: [packages/core-application/src/vendors/vendor-money-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-money-service.ts#L1)

| Line | Declaration |
|---|---|
| [117](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-money-service.ts#L117) | `async pay(command: PayVendorCommand): Promise<VendorMoneyDocumentResponse> {` |
| [126](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-money-service.ts#L126) | `return this.uow.run(command.ctx, async (tx) => {` |
| [128](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-money-service.ts#L128) | `await this.access.require(tx, ctx, Permission.VENDOR_PAYMENT_RECORD);` |
| [215](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-money-service.ts#L215) | `action: 'CREATE',` |
| [226](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-money-service.ts#L226) | `eventType: 'vendor.payment.recorded',` |
| [255](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-money-service.ts#L255) | `async receive(command: ReceiveFromVendorCommand): Promise<VendorMoneyDocumentResponse> {` |
| [263](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-money-service.ts#L263) | `private async settleReceivable(` |
| [291](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-money-service.ts#L291) | `private async refundAdvance(` |
| [302](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-money-service.ts#L302) | `return this.uow.run(command.ctx, async (tx) => {` |
| [304](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-money-service.ts#L304) | `await this.access.require(tx, ctx, Permission.VENDOR_RECEIPT_RECORD);` |
| [382](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-money-service.ts#L382) | `action: 'CREATE',` |
| [393](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-money-service.ts#L393) | `eventType: 'vendor.receipt.recorded',` |
| [416](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-money-service.ts#L416) | `private async requireVendor(` |
| [429](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-money-service.ts#L429) | `private async paymentDetail(` |
| [450](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-money-service.ts#L450) | `private async receiptDetail(` |
| [472](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-money-service.ts#L472) | `private async accountName(tx: Tx, ctx: TenantContext, code: string): Promise<string> {` |
## VendorProductSettlementService
File: [packages/core-application/src/vendors/vendor-product-settlement-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-product-settlement-service.ts#L1)

| Line | Declaration |
|---|---|
| [50](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-product-settlement-service.ts#L50) | `async create(command: CreateVendorProductSettlementCommand): Promise<VendorProductSettlementResponse> {` |
| [51](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-product-settlement-service.ts#L51) | `return this.uow.run(command.ctx, async (tx) => {` |
| [53](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-product-settlement-service.ts#L53) | `await this.access.require(tx, ctx, Permission.VENDOR_STOCK_MANAGE);` |
| [246](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-product-settlement-service.ts#L246) | `action: 'CREATE',` |
| [258](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-product-settlement-service.ts#L258) | `eventType: 'vendor.product_settlement.posted',` |
## VendorStockService
File: [packages/core-application/src/vendors/vendor-stock-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-stock-service.ts#L1)

| Line | Declaration |
|---|---|
| [85](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-stock-service.ts#L85) | `async receive(command: ReceiveVendorStockCommand): Promise<VendorStockReceiptResponse> {` |
| [96](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-stock-service.ts#L96) | `return this.uow.run(command.ctx, async (tx) => {` |
| [98](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-stock-service.ts#L98) | `await this.access.require(tx, ctx, Permission.VENDOR_STOCK_MANAGE);` |
| [206](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-stock-service.ts#L206) | `action: 'CREATE',` |
| [216](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-stock-service.ts#L216) | `eventType: 'vendor.stock.received',` |
| [240](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-stock-service.ts#L240) | `async returnStock(command: ReturnVendorStockCommand): Promise<VendorStockReceiptResponse> {` |
| [248](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-stock-service.ts#L248) | `return this.uow.run(command.ctx, async (tx) => {` |
| [250](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-stock-service.ts#L250) | `await this.access.require(tx, ctx, Permission.VENDOR_STOCK_MANAGE);` |
| [352](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-stock-service.ts#L352) | `action: 'CREATE',` |
| [358](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-stock-service.ts#L358) | `eventType: 'vendor.stock.returned',` |
| [382](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-stock-service.ts#L382) | `async settlement(input: {` |
| [386](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-stock-service.ts#L386) | `return this.uow.run(input.ctx, async (tx) => {` |
| [388](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-stock-service.ts#L388) | `await this.access.require(tx, ctx, Permission.SUPPLIER_VIEW);` |
| [389](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-stock-service.ts#L389) | `const showMoney = (await this.access.permissionsOf(tx, ctx)).includes(Permission.COST_VIEW);` |
| [424](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-stock-service.ts#L424) | `async listReceipts(input: {` |
| [429](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-stock-service.ts#L429) | `return this.uow.run(input.ctx, async (tx) => {` |
| [431](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-stock-service.ts#L431) | `await this.access.require(tx, ctx, Permission.SUPPLIER_VIEW);` |
| [432](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-stock-service.ts#L432) | `const showMoney = (await this.access.permissionsOf(tx, ctx)).includes(Permission.COST_VIEW);` |
| [441](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-stock-service.ts#L441) | `private async receiptWithin(` |
| [448](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-stock-service.ts#L448) | `const showMoney = (await this.access.permissionsOf(tx, ctx)).includes(Permission.COST_VIEW);` |
| [452](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-stock-service.ts#L452) | `private async assertConsignmentOn(tx: Tx, ctx: TenantContext): Promise<void> {` |
## VendorWorkspaceService
File: [packages/core-application/src/vendors/vendor-workspace-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-workspace-service.ts#L1)

| Line | Declaration |
|---|---|
| [36](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-workspace-service.ts#L36) | `async summary(input: {` |
| [40](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-workspace-service.ts#L40) | `return this.uow.run(input.ctx, async (tx) => {` |
| [42](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-workspace-service.ts#L42) | `await this.access.require(tx, ctx, Permission.VENDOR_VIEW);` |
| [43](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-workspace-service.ts#L43) | `const showCost = (await this.access.permissionsOf(tx, ctx)).includes(Permission.COST_VIEW);` |
| [113](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-workspace-service.ts#L113) | `async activity(input: {` |
| [119](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-workspace-service.ts#L119) | `return this.uow.run(input.ctx, async (tx) => {` |
| [121](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-workspace-service.ts#L121) | `await this.access.require(tx, ctx, Permission.VENDOR_VIEW);` |
| [122](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/vendors/vendor-workspace-service.ts#L122) | `const showMoney = (await this.access.permissionsOf(tx, ctx)).includes(Permission.COST_VIEW);` |
## WarrantyService
File: [packages/core-application/src/warranty/warranty-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/warranty/warranty-service.ts#L1)

| Line | Declaration |
|---|---|
| [114](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/warranty/warranty-service.ts#L114) | `async lookup(input: {` |
| [120](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/warranty/warranty-service.ts#L120) | `return this.uow.run(input.ctx, async (tx) => {` |
| [122](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/warranty/warranty-service.ts#L122) | `await this.access.require(tx, ctx, Permission.WARRANTY_CLAIM_VIEW);` |
| [138](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/warranty/warranty-service.ts#L138) | `async create(command: CreateClaimCommand): Promise<WarrantyClaimResponse> {` |
| [139](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/warranty/warranty-service.ts#L139) | `return this.uow.run(command.ctx, async (tx) => {` |
| [141](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/warranty/warranty-service.ts#L141) | `await this.access.require(tx, ctx, Permission.WARRANTY_CLAIM_MANAGE);` |
| [207](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/warranty/warranty-service.ts#L207) | `action: 'CREATE',` |
| [225](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/warranty/warranty-service.ts#L225) | `async move(command: MoveClaimCommand): Promise<WarrantyClaimResponse> {` |
| [226](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/warranty/warranty-service.ts#L226) | `return this.uow.run(command.ctx, async (tx) => {` |
| [228](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/warranty/warranty-service.ts#L228) | `await this.access.require(tx, ctx, Permission.WARRANTY_CLAIM_MANAGE);` |
| [395](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/warranty/warranty-service.ts#L395) | `action: 'UPDATE',` |
| [401](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/warranty/warranty-service.ts#L401) | `eventType: 'warranty.claim.moved',` |
| [411](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/warranty/warranty-service.ts#L411) | `async detail(input: {` |
| [415](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/warranty/warranty-service.ts#L415) | `return this.uow.run(input.ctx, async (tx) => {` |
| [416](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/warranty/warranty-service.ts#L416) | `await this.access.require(tx, input.ctx, Permission.WARRANTY_CLAIM_VIEW);` |
| [421](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/warranty/warranty-service.ts#L421) | `async list(input: {` |
| [428](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/warranty/warranty-service.ts#L428) | `return this.uow.run(input.ctx, async (tx) => {` |
| [430](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/warranty/warranty-service.ts#L430) | `await this.access.require(tx, ctx, Permission.WARRANTY_CLAIM_VIEW);` |
| [431](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/warranty/warranty-service.ts#L431) | `const showMoney = (await this.access.permissionsOf(tx, ctx)).includes(Permission.COST_VIEW);` |
| [444](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/warranty/warranty-service.ts#L444) | `private async detailWithin(` |
| [451](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/warranty/warranty-service.ts#L451) | `const showMoney = (await this.access.permissionsOf(tx, ctx)).includes(Permission.COST_VIEW);` |
| [455](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/warranty/warranty-service.ts#L455) | `private async assertWarrantyOn(tx: Tx, ctx: TenantContext): Promise<void> {` |

## PostgreSQL adapters and table operations

- [audit-query-repository.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/audit-query-repository.ts#L1): table symbols `auditEvents, users`; visible lock lines none matched (not proof of absence).
- [backup-repository.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/backup-repository.ts#L1): table symbols `read linked source`; visible lock lines none matched (not proof of absence).
- [catalog-repository.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/catalog-repository.ts#L1): table symbols `brands, categories, units`; visible lock lines none matched (not proof of absence).
- [daybook-repository.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/daybook-repository.ts#L1): table symbols `daybookPrints`; visible lock lines none matched (not proof of absence).
- [device-authorization-repository.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/device-authorization-repository.ts#L1): table symbols `read linked source`; visible lock lines none matched (not proof of absence).
- [document-redate-repository.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/document-redate-repository.ts#L1): table symbols `read linked source`; visible lock lines none matched (not proof of absence).
- [document-reversal-repository.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/document-reversal-repository.ts#L1): table symbols `read linked source`; visible lock lines none matched (not proof of absence).
- [expense-repository.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/expense-repository.ts#L1): table symbols `expenseCategories, expenses, journalEntries, journalLines`; visible lock lines none matched (not proof of absence).
- [inventory-repository.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/inventory-repository.ts#L1): table symbols `costAdjustments, inventoryLocations, inventoryLots, journalEntries, journalLines, lotConsumptions, productCostState, products, stockAdjustments, stockMovements, stockOpenings, units, users`; visible lock lines none matched (not proof of absence).
- [landed-cost-repository.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/landed-cost-repository.ts#L1): table symbols `inventoryLots, journalEntries, journalLines, productCostState, purchaseLandedCostAllocations, purchaseLandedCosts, purchaseLines`; visible lock lines none matched (not proof of absence).
- [management-profile-repository.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/management-profile-repository.ts#L1): table symbols `read linked source`; visible lock lines none matched (not proof of absence).
- [money-repository.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/money-repository.ts#L1): table symbols `accountOpenings, accounts, cashMovements, cashSessionCloses, cashSessions, journalEntries, journalLines, users`; visible lock lines none matched (not proof of absence).
- [note-repository.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/note-repository.ts#L1): table symbols `notes`; visible lock lines none matched (not proof of absence).
- [otp-repository.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/otp-repository.ts#L1): table symbols `otpCodes`; visible lock lines none matched (not proof of absence).
- [party-repository.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/party-repository.ts#L1): table symbols `customerGroups, journalEntries, journalLines, parties, partyOpenings, partyRoles`; visible lock lines none matched (not proof of absence).
- [period-repository.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/period-repository.ts#L1): table symbols `read linked source`; visible lock lines none matched (not proof of absence).
- [product-repository.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/product-repository.ts#L1): table symbols `brands, categories, conversionUnits, image, parentCategories, products, units`; visible lock lines none matched (not proof of absence).
- [purchase-plan-repository.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/purchase-plan-repository.ts#L1): table symbols `purchasePlanLines, purchasePlans, supplierPurchaseOrderLines, supplierPurchaseOrders`; visible lock lines none matched (not proof of absence).
- [purchase-repository.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/purchase-repository.ts#L1): table symbols `accounts, inventoryLots, journalEntries, journalLines, paymentAllocations, productCostState, purchaseLandedCostAllocations, purchaseLandedCosts, purchaseLines, purchases, stockMovements, supplierPayments, supplierPurchaseOrders, units`; visible lock lines none matched (not proof of absence).
- [purchase-return-repository.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/purchase-return-repository.ts#L1): table symbols `inventoryLots, journalEntries, journalLines, parties, productCostState, products, purchaseLines, purchaseReturnLines, purchaseReturns, purchases, stockMovements, units`; visible lock lines none matched (not proof of absence).
- [reconciliation-repository.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/reconciliation-repository.ts#L1): table symbols `accountReconciliations, accounts, bankStatementFiles, file, journalEntries, journalLines, reconciliationMatches, statementLines, users`; visible lock lines none matched (not proof of absence).
- [registration-repository.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/registration-repository.ts#L1): table symbols `rolePermissions, roles, tenants, userIdentifiers, users`; visible lock lines none matched (not proof of absence).
- [report-repository.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/report-repository.ts#L1): table symbols `profitTargets`; visible lock lines none matched (not proof of absence).
- [sale-repository.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/sale-repository.ts#L1): table symbols `accounts, body, brands, customerReceipts, head, inventoryLots, inventoryUnits, invoiceLinePresentation, invoicePresentation, invoiceSettings, journalEntries, journalLines, logo, lotConsumptions, parties, productCostState, products, quotationLines, quotations, receiptAllocations, saleDrafts, saleLineSourceAllocations, saleLines, salePayments, saleSourceAllocationReversals, sales, salesOrderLines, salesOrders, salesReturns, stockMovements, units, vendorReceivableSettlementAllocations`; visible lock lines 99, 109.
- [sales-return-repository.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/sales-return-repository.ts#L1): table symbols `approver, inventoryLots, inventoryUnits, journalEntries, journalLines, lotConsumptions, parties, productCostState, products, roles, saleLineSourceAllocations, saleLines, saleSourceAllocationReversals, sales, salesReturnLines, salesReturns, stockMovements, units, users`; visible lock lines 99.
- [serial-repository.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/serial-repository.ts#L1): table symbols `inventoryUnits`; visible lock lines none matched (not proof of absence).
- [session-repository.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/session-repository.ts#L1): table symbols `refreshTokens`; visible lock lines none matched (not proof of absence).
- [settings-repository.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/settings-repository.ts#L1): table symbols `settings, tenants`; visible lock lines none matched (not proof of absence).
- [stock-count-repository.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/stock-count-repository.ts#L1): table symbols `products, stockCountLines, stockCounts, units`; visible lock lines none matched (not proof of absence).
- [sync-repository.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/sync-repository.ts#L1): table symbols `read linked source`; visible lock lines none matched (not proof of absence).
- [vendor-stock-repository.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/vendor-stock-repository.ts#L1): table symbols `inventoryLots, stockMovements, vendorStockReceipts, vendorStockReturns`; visible lock lines none matched (not proof of absence).
- [vendor-workspace-repository.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/vendor-workspace-repository.ts#L1): table symbols `inventoryLots, journalEntries, journalLines, productCostState, stockMovements, vendorPayments, vendorProductIssueLots, vendorProductIssueReturns, vendorProductIssues, vendorProductSettlements, vendorReceipts, vendorReceivableSettlementAllocations`; visible lock lines none matched (not proof of absence).
- [warranty-repository.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/warranty-repository.ts#L1): table symbols `journalEntries, journalLines, warrantyClaims`; visible lock lines none matched (not proof of absence).
