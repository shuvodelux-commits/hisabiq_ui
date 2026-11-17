import type { SaasState } from '../types/saas';
import {
  seedAccess,
  seedAudit,
  seedEntitlements,
  seedOffers,
  seedOrders,
  seedPackages,
  seedProviders,
  seedSenders,
  seedSmsMessages,
  seedSmsMoves,
  seedStaff,
  seedStatement,
  seedTariffs,
  seedTenants,
} from '../data/saasSeeds';
import { seedAnnouncements, seedArticles, seedDataRequests, seedNudges, seedPlatformSettings, seedServices, seedTemplates, seedTickets } from '../data/saasOpsSeeds';

function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

/** Fresh copy of every seed so the prototype can reset cleanly. */
export function createInitialState(): SaasState {
  return clone<SaasState>({
    tenants: seedTenants,
    entitlements: seedEntitlements,
    orders: seedOrders,
    statement: seedStatement,
    smsMoves: seedSmsMoves,
    smsMessages: seedSmsMessages,
    packages: seedPackages,
    offers: seedOffers,
    tickets: seedTickets,
    access: seedAccess,
    audit: seedAudit,
    providers: seedProviders,
    tariffs: seedTariffs,
    senders: seedSenders,
    marginThreshold: 25,
    services: seedServices,
    articles: seedArticles,
    announcements: seedAnnouncements,
    templates: seedTemplates,
    nudges: seedNudges,
    dataRequests: seedDataRequests,
    settings: seedPlatformSettings,
    staff: seedStaff,
  });
}
