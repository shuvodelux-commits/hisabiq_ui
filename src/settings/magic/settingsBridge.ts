import { useTenantSettings } from '../TenantSettingsProvider';

/**
 * Live HisabIQ state adapter for Magic Patterns' original SettingsHome JSX.
 * Never materialize the prototype DemoStore or fabricate backend data.
 */
export function useMagicSettingsState() {
  const { state: tenant } = useTenantSettings();
  const b = tenant.sections.business;
  const p = tenant.sections.products;
  const inv = tenant.sections.invoices;
  const n = tenant.sections.notifications;
  const state = {
    settings: {
      businessName: b.name,
      phone: b.phone,
      address: b.address,
      defaultPayment: tenant.sections.sales.defaultPayment,
      stockAlert: p.lowStock ? 1 : 0,
      pinEnabled: false, // A trusted PIN needs the auth server; never claim it is enabled from a UI fixture.
      smsEnabled: n.channel === 'In-app + SMS',
      setupDone: false, // No setup-completed flag exists in the production tenant model yet.
    },
    staff: tenant.sections.team.employees,
  };
  const saved = { paper: inv.paper, showBangla: inv.showBangla, showLogo: inv.showLogo };
  const defaultInvoiceDesign = { paper: 'A4', showBangla: true, showLogo: true };
  const sec = { offline: { deviceId: null as string | null } }; // No authorization record in tenant settings.
  return { state, sec, saved, defaultInvoiceDesign };
}
