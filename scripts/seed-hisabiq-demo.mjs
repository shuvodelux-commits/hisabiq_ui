#!/usr/bin/env node
/**
 * HisabIQ UI demo source → isolated NestSherERP PostgreSQL database.
 *
 * Run with Node 24+ --experimental-strip-types. This script uses only the
 * existing UI source fixtures and the REAL Nest HTTP business APIs. It never
 * fabricates ledger rows, copies preview IDs into ULID columns, posts demo
 * invoices, or touches another tenant's data.
 *
 * Required environment:
 *   HISABIQ_DEMO_SEED_CONFIRM=hisabiq_ui_demo_20261113
 *   HISABIQ_DEMO_API_URL=http://127.0.0.1:3065
 *   HISABIQ_DEMO_OUTPUT_DIR=<new private directory, mode 0700>
 *   DATABASE_URL and ADMIN_DATABASE_URL: same exclusive new local database,
 *     distinct restricted app/admin users. No URL is logged.
 */
import { randomBytes } from 'node:crypto';
import { mkdir, open, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const EXPECTED = 'hisabiq_ui_demo_20261113';
const BASE = process.env.HISABIQ_DEMO_API_URL;
const OUTPUT = process.env.HISABIQ_DEMO_OUTPUT_DIR;
if (process.env.HISABIQ_DEMO_SEED_CONFIRM !== EXPECTED || !BASE || !OUTPUT) {
  throw new Error('Explicit new-demo-database confirmation, API origin and private output are required');
}
const target = new URL(BASE);
if (target.protocol !== 'http:' || target.hostname !== '127.0.0.1' ||
    target.port !== '3065' || target.pathname !== '/' ||
    target.search || target.hash || target.username || target.password) {
  throw new Error('Refusing a non-local or unexpected Nest API origin');
}
function validDb(url, label) {
  if (!url) throw new Error(label + ' missing');
  const parsed = new URL(url);
  if (parsed.protocol !== 'postgres:' && parsed.protocol !== 'postgresql:') {
    throw new Error(label + ': invalid PostgreSQL protocol');
  }
  if (parsed.hostname !== '127.0.0.1' || parsed.port !== '55665' ||
      parsed.pathname !== '/' + EXPECTED || !parsed.username || !parsed.password ||
      parsed.search || parsed.hash) {
    throw new Error(label + ': not the named isolated PostgreSQL16 database');
  }
  return parsed.username;
}
const appRole = validDb(process.env.DATABASE_URL, 'DATABASE_URL');
const adminRole = validDb(process.env.ADMIN_DATABASE_URL, 'ADMIN_DATABASE_URL');
if (appRole === adminRole || appRole === 'postgres' || adminRole !== 'postgres') {
  throw new Error('Application must be a separate non-owner, non-superuser role');
}
const output = resolve(OUTPUT);
if (output === '/' || output.startsWith('/tmp/') || !output.includes('hisabiq-demo')) {
  throw new Error('Use a private persistent HisabIQ demo output directory');
}

const { products, productCategories } = await import('../src/data/products.ts');
const { parties, ledgerEntries } = await import('../src/data/parties.ts');
const { purchases, expenses, expenseCategories } = await import('../src/data/purchases.ts');
const sales = await import('../src/data/sales.ts');
const finance = await import('../src/data/financeAccounts.ts');

const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const today = () => Date.now();
function operationId() {
  let ms = today();
  let head = '';
  for (let i = 0; i < 10; i++) {
    head = ALPHABET[ms % 32] + head;
    ms = Math.floor(ms / 32);
  }
  return head + Array.from(randomBytes(16), byte => ALPHABET[byte & 31]).join('');
}
function minor(value, label) {
  if (!Number.isFinite(value) || value < 0 ||
      !Number.isSafeInteger(Math.round(value * 100)) ||
      Math.abs(value * 100 - Math.round(value * 100)) > 1e-7) {
    throw new Error('Invalid poisha precision: ' + label);
  }
  return Math.round(value * 100);
}
function scaled(value, label) {
  if (!Number.isFinite(value) || value < 0 ||
      !Number.isSafeInteger(Math.round(value * 1000)) ||
      Math.abs(value * 1000 - Math.round(value * 1000)) > 1e-7) {
    throw new Error('Invalid base-unit quantity: ' + label);
  }
  return Math.round(value * 1000);
}
const months = { Jan:'01', Feb:'02', Mar:'03', Apr:'04', May:'05', Jun:'06',
  Jul:'07', Aug:'08', Sep:'09', Oct:'10', Nov:'11', Dec:'12' };
function previewDate(value) {
  const match = /^(\d{1,2}) ([A-Z][a-z]{2}) (\d{4})$/.exec(value);
  if (!match || !months[match[2]]) throw new Error('Invalid source demo date');
  return match[3] + '-' + months[match[2]] + '-' + match[1].padStart(2, '0');
}
const isUlid = value => typeof value === 'string' && /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/.test(value);

let bearer = '';
async function call(path, opts = {}) {
  const { method = 'GET', body, authenticated = true, idempotent = false } = opts;
  const response = await fetch(BASE + path, {
    method, redirect: 'error', credentials: 'omit',
    headers: {
      Accept: 'application/json',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(authenticated ? { Authorization: 'Bearer ' + bearer } : {}),
      ...(idempotent ? { 'Idempotency-Key': operationId() } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const json = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(method + ' ' + path + ' returned HTTP ' + response.status +
      ', code=' + (json?.error?.code ?? 'unknown'));
  }
  return json?.data ?? json;
}
const archive = {
  provenance: {
    source: 'shuvodelux-commits/hisabiq_ui/src/data',
    sourceRevision: process.env.HISABIQ_DEMO_SOURCE_SHA ?? null,
    financialPosting: 'Only source-backed historical openings and inventory snapshots are journaled',
    stockAsOf: '2026-10-07',
  },
  products, productCategories, parties, ledgerEntries, purchases, expenses,
  expenseCategories,
  salesInvoices: sales.salesInvoices, salesReturns: sales.salesReturns,
  salesDrafts: sales.salesDrafts, saleTemplates: sales.saleTemplates,
  customerCredits: sales.customerCredits,
  financeAccounts: finance.financeAccounts,
  financeTransactions: finance.financeTransactions,
  accountTransfers: finance.accountTransfers,
  cashSessions: finance.cashSessions,
};
const mapping = {
  sourceSha: archive.provenance.sourceRevision,
  tenantId: null, products: {}, parties: {}, moneyAccounts: {},
  categories: {}, units: {}, expenseCategories: {},
  deferred: [],
  totals: {},
};
const defer = (source, reason, count) => mapping.deferred.push({ source, reason, count });

if (process.env.HISABIQ_DEMO_RECONCILE_SETTINGS === '1') {
  // Repair server feature visibility for a previous partial seed without
  // registering another tenant, changing money or replaying a financial POST.
  const credentials = JSON.parse(await readFile(resolve(output, 'demo-login.private.json'), 'utf8'));
  const existingMap = JSON.parse(await readFile(resolve(output, 'backend-id-map.json'), 'utf8'));
  const session = await call('/api/v1/auth/login', { method:'POST', authenticated:false,
    body:{ identifier:credentials.identifier, password:credentials.password } });
  if (!session?.accessToken) throw new Error('Existing demo login was refused');
  bearer = session.accessToken;
  const identity = await call('/api/v1/me');
  if (!isUlid(existingMap.tenantId) || identity.tenantId !== existingMap.tenantId) {
    throw new Error('Existing demo database identity mismatch; no setting changed');
  }
  await call('/api/v1/settings/value', {
    method:'POST', body:{ key:'bank_accounts_enabled', value:'on' },
  });
  const accountList = await call('/api/v1/money/accounts');
  if (accountList.accounts?.length !== finance.financeAccounts.length) {
    throw new Error('Bank setting saved but not all demo accounts are visible');
  }
  console.log('RECONCILED_AND_VERIFIED finance account visibility for ' +
    accountList.accounts.length + ' accounts');
  process.exit(0);
}

if (process.env.HISABIQ_DEMO_VERIFY === '1') {
  const credentials = JSON.parse(await readFile(resolve(output, 'demo-login.private.json'), 'utf8'));
  const existingMap = JSON.parse(await readFile(resolve(output, 'backend-id-map.json'), 'utf8'));
  const session = await call('/api/v1/auth/login', {
    method:'POST', authenticated:false,
    body:{ identifier:credentials.identifier, password:credentials.password },
  });
  if (!session?.accessToken) throw new Error('Cannot verify seeded demo owner');
  bearer = session.accessToken;
  const me = await call('/api/v1/me');
  if (me.tenantId !== existingMap.tenantId) throw new Error('Wrong demo tenant identity');
  const catalog = await call('/api/v1/catalog');
  const visible = await call('/api/v1/products?limit=100');
  const rows = Array.isArray(visible) ? visible : visible.items ?? visible.products ?? [];
  if (rows.length !== products.length) throw new Error('Demo product total mismatch');
  for (const p of products) {
    const recorded = rows.find(row => row.sku === p.sku);
    if (!recorded || recorded.stockQty !== scaled(p.stock,'stock') ||
      recorded.sellingPriceMinor !== minor(p.sellPrice,'sell') ||
      recorded.purchasePriceMinor !== minor(p.purchasePrice,'purchase')) {
      throw new Error('Product field mismatch ' + p.id);
    }
  }
  const partyIds = new Set();
  for (const role of ['CUSTOMER','SUPPLIER','VENDOR']) {
    const response = await call('/api/v1/parties?role=' + role + '&limit=100');
    for (const entry of Array.isArray(response) ? response : response.items ?? response.parties ?? []) {
      partyIds.add(entry.id);
    }
  }
  if (partyIds.size !== Object.keys(existingMap.parties).length + 1) {
    throw new Error('Demo parties do not match supported identities and walk-in');
  }
  const accounts = await call('/api/v1/money/accounts');
  if (accounts.accounts?.length !== finance.financeAccounts.length) {
    throw new Error('Missing accessible cash, bank or MFS account');
  }
  for (const original of finance.financeAccounts) {
    const recorded = accounts.accounts.find(item => item.name === original.name);
    if (!recorded || recorded.openingAmountMinor !== minor(original.openingBalance,'account opening')) {
      throw new Error('Money account opening mismatch ' + original.id);
    }
  }
  if (catalog.categories.length < Object.keys(existingMap.categories).length) {
    throw new Error('Missing source product categories');
  }
  const inactive = rows.filter(p => p.status === 'INACTIVE').map(p => p.sku).sort();
  const expectedInactive = products.filter(p => !p.active || p.kind === 'Service' ||
    p.serialTracking === 'Required' || !!p.expiry?.enabled).map(p => p.sku).sort();
  if (inactive.join(',') !== expectedInactive.join(',')) {
    throw new Error('Unverified serial/expiry/service placeholder is active');
  }
  console.log('PASS authenticated tenant and all ' + rows.length + ' source products');
  console.log('PASS ' + partyIds.size + ' parties and ' + accounts.accounts.length + ' accounts');
  console.log('PASS matching exact stock, prices, opening accounts and deferred product safety');
  process.exit(0);
}

await mkdir(output, { recursive: true, mode: 0o700 });
async function writeNew(name, value) {
  const file = await open(resolve(output, name), 'wx', 0o600);
  try { await file.writeFile(JSON.stringify(value, null, 2) + '\n'); }
  finally { await file.close(); }
}
// Preserve all original preview data even when the current backend cannot
// post its historical economic source chain without inventing stock/journals.
await writeNew('source-preview-nonposting.json', archive);
const login = {
  identifier: 'hisabiq-demo-' + randomBytes(6).toString('hex') + '@example.test',
  password: 'DemoDev_' + randomBytes(15).toString('hex') + 'A9!',
  pin: '482193',
  username: 'demoowner',
  businessName: 'HisabIQ Demo Hardware',
};
// Save account recovery *before* registering. Never show it in stdout or GitHub.
await writeNew('demo-login.private.json', login);

try {
  const health = await fetch(BASE + '/health', { redirect: 'error' });
  if (health.status !== 200) throw new Error('Nest API health endpoint is unavailable');
  const otp = await call('/api/v1/auth/registration/otp', {
    method: 'POST', authenticated: false, body: { identifier: login.identifier },
  });
  if (typeof otp.devCode !== 'string' || !/^\d{6}$/.test(otp.devCode)) {
    throw new Error('Dev-only registration OTP unavailable; refuse production SMS setup');
  }
  const created = await call('/api/v1/auth/registration', {
    method: 'POST', authenticated: false,
    body: { identifier: login.identifier, otpCode: otp.devCode,
      businessName: login.businessName, username: login.username,
      password: login.password, pin: login.pin },
  });
  if (!isUlid(created.tenant?.id) || !created.accessToken) {
    throw new Error('Tenant registration returned an invalid response');
  }
  bearer = created.accessToken;
  mapping.tenantId = created.tenant.id;
  const access = await call('/api/v1/me');
  if (access.tenantId !== mapping.tenantId) throw new Error('Authenticated tenant identity mismatch');
  console.log('Registration + /me verified: one isolated demo tenant');

  // Create full master catalogs first. Preserve exact stock-unit spellings.
  let catalog = await call('/api/v1/catalog');
  const unitNames = [...new Set(products.flatMap(p =>
    [p.unit, p.altUnit?.unit, ...(p.unitRelations ?? []).flatMap(x => [x.leftUnit,x.rightUnit])].filter(Boolean)))];
  for (const name of unitNames) {
    if (!catalog.units.some(u => u.name === name)) {
      catalog = await call('/api/v1/catalog/units', { method:'POST', body:{ name } });
    }
    mapping.units[name] = catalog.units.find(u => u.name === name)?.id;
    if (!isUlid(mapping.units[name])) throw new Error('Cannot resolve stock unit ' + name);
  }
  for (const name of productCategories.filter(c => c !== 'All')) {
    if (!catalog.categories.some(c => c.name === name && c.parentId === null)) {
      catalog = await call('/api/v1/catalog/categories', {
        method:'POST', body:{ name, parentId:null },
      });
    }
    mapping.categories[name] = catalog.categories.find(c => c.name === name)?.id;
    if (!isUlid(mapping.categories[name])) throw new Error('Cannot resolve category ' + name);
  }
  for (const name of [...new Set(products.map(p => p.brand).filter(Boolean))]) {
    if (!catalog.brands.some(b => b.name === name)) {
      catalog = await call('/api/v1/catalog/brands', { method:'POST', body:{ name } });
    }
  }

  // The source balance is derived from later example transactions. Only
  // source ledger rows explicitly marked opening are posted as openings.
  const supported = new Set(['Customer','Supplier','Vendor']);
  const roleMap = { Customer:'CUSTOMER', Supplier:'SUPPLIER', Vendor:'VENDOR' };
  if (parties.some(p => p.roles.includes('Vendor'))) {
    await call('/api/v1/settings/value', { method:'POST',
      body:{ key:'vendor_management_enabled', value:'on' } });
  }
  for (const p of parties) {
    const roles = p.roles.filter(r => supported.has(r)).map(r => roleMap[r]);
    if (!roles.length) {
      defer('party:' + p.id, 'No equivalent Nest party role for ' + p.roles.join('/'), 1);
      continue;
    }
    const explicit = ledgerEntries.filter(e => e.partyId === p.id && e.type === 'opening');
    if (explicit.length > 1) throw new Error('Ambiguous multiple opening fixtures for party ' + p.id);
    let opening;
    if (explicit.length) {
      const e = explicit[0];
      if ((e.debit > 0 && e.credit > 0) || (e.debit === 0 && e.credit === 0)) {
        throw new Error('Invalid historical opening sides for party ' + p.id);
      }
      const receivable = e.debit > 0;
      const openingRole = receivable ? 'CUSTOMER' : 'SUPPLIER';
      if (!roles.includes(openingRole)) throw new Error('Opening direction contradicts relationship');
      opening = {
        role: openingRole, direction: receivable ? 'RECEIVABLE' : 'PAYABLE',
        amountMinor: minor(receivable ? e.debit : e.credit, 'party-opening'),
        businessDate: previewDate(e.date),
      };
    }
    const createdParty = await call('/api/v1/parties', { method:'POST', idempotent:true,
      body:{ name:p.name, roles, phone:p.phone ?? null, address:p.area ?? null,
        guardianName:null, nid:null, email:null, notes:p.nameBn ? 'বাংলা নাম: ' + p.nameBn : null,
        customerGroupId:null, creditLimitMinor:null, ...(opening ? { opening } : {}) },
    });
    if (!isUlid(createdParty.id)) throw new Error('Invalid saved party for ' + p.id);
    mapping.parties[p.id] = createdParty.id;
    if (p.roles.length !== roles.length) {
      defer('party-role:' + p.id, 'Additional display-only role not supported', p.roles.length - roles.length);
    }
  }

  // No source sale/purchase is replayed: on-hand numbers are current snapshot
  // values, and replaying earlier sales against them would double-reduce stock.
  for (const p of products) {
    const requiresUnprovidedIdentifiers = p.serialTracking === 'Required' || !!p.expiry?.enabled;
    const conversionUnitId = p.altUnit ? mapping.units[p.altUnit.unit] : null;
    const factor = p.altUnit ? scaled(p.altUnit.factor, 'conversion factor') : null;
    const warrantyMonths = p.warranty?.enabled
      ? p.warranty.durationUnit === 'Years' ? p.warranty.duration * 12
        : p.warranty.durationUnit === 'Months' ? p.warranty.duration : null
      : null;
    const product = await call('/api/v1/products', { method:'POST', idempotent:true,
      body: {
        name:p.name, baseUnitId:mapping.units[p.unit],
        purchasePriceMinor:minor(p.purchasePrice, 'purchase price ' + p.id),
        sellingPriceMinor:minor(p.sellPrice, 'selling price ' + p.id),
        minStockQty:scaled(p.minStock, 'minimum stock ' + p.id),
        brandId: p.brand ? catalog.brands.find(b => b.name === p.brand)?.id ?? null : null,
        categoryId:mapping.categories[p.category] ?? null,
        sku:p.sku ?? null, barcode:null,
        description:[p.nameBn ? 'বাংলা নাম: ' + p.nameBn : '',
          p.kind === 'Service' ? 'Demo service placeholder; inactive until service API exists.' : '']
          .filter(Boolean).join(' | ') || null,
        defaultDiscountType:null, defaultDiscountValue:null,
        offerEnabled:false, offerPriceMinor:null, offerStartDate:null, offerEndDate:null,
        // Source has no serial list or per-lot expiry for these stocked demo
        // products. Refuse to make those mandatory controls look verified.
        tracksExpiry:false,
        tracksSerial:false,
        conversionUnitId:conversionUnitId ?? null, conversionFactorQty:factor,
        usualSupplierId:null, minOrderQty:null,
        warrantyMonths:Number.isSafeInteger(warrantyMonths) ? warrantyMonths : null,
        supplierWarrantyMonths:null,
      },
    });
    if (!isUlid(product.id)) throw new Error('Invalid saved product ' + p.id);
    mapping.products[p.id] = product.id;
    if (p.kind === 'Service' || !p.active || requiresUnprovidedIdentifiers) {
      await call('/api/v1/products/' + product.id + '/status', {
        method:'POST', body:{ status:'INACTIVE' },
      });
    }
    if (p.altUnit?.price !== undefined || p.unitSellPrices || p.unitPurchasePrices) {
      defer('product-price:' + p.id, 'Independent alternate-unit selling prices are preview-only in Nest', 1);
    }
    if (p.kind === 'Service') defer('service:' + p.id, 'Inactive stock placeholder; not a posted service sale', 1);
    if (p.serialTracking === 'Required') {
      defer('product-serials:' + p.id, 'Inactive until real source serial numbers and tracked opening are available', 1);
    }
    if (p.expiry?.enabled) {
      defer('product-expiry:' + p.id, 'Inactive until source lot expiry dates enable FEFO integrity', 1);
    }
    if (p.stock > 0 && p.kind !== 'Service') {
      const opened = await call('/api/v1/inventory/openings', {
        method:'POST', idempotent:true,
        body:{ productId:product.id, qty:scaled(p.stock,'opening stock ' + p.id),
          businessDate:'2026-10-07', expiryDate:null },
      });
      if (!isUlid(opened.id)) throw new Error('Stock opening missing posted document for ' + p.id);
    }
  }

  // The source contains two BANK and two MFS accounts. They may be created
  // while the tenant's bank feature is off, but an ordinary authenticated
  // money-account GET would then hide them; enable the setting deliberately.
  if (finance.financeAccounts.some(a => a.type === 'Bank' || a.type === 'Mobile Banking')) {
    await call('/api/v1/settings/value', {
      method:'POST', body:{ key:'bank_accounts_enabled', value:'on' },
    });
  }
  for (const a of finance.financeAccounts) {
    const type = a.type === 'Cash' || a.type === 'Petty Cash' ? 'CASH'
      : a.type === 'Bank' ? 'BANK' : a.type === 'Mobile Banking' ? 'MFS' : null;
    if (!type) { defer('account:' + a.id, 'Unsupported money account type', 1); continue; }
    const createdAccount = await call('/api/v1/money/accounts', {
      method:'POST', body: {
        name:a.name, type, holderName:null, reference:a.number ?? null,
        isDrawer:a.id === 'acc-cash',
        openingAmountMinor:minor(a.openingBalance, 'opening account ' + a.id),
        openingDate:'2026-09-01',
        operationId:operationId(),
      },
    });
    if (!isUlid(createdAccount.id)) throw new Error('Missing money account ID for ' + a.id);
    mapping.moneyAccounts[a.id] = createdAccount.id;
    if (a.balance !== a.openingBalance) {
      defer('account-current-balance:' + a.id,
        'Current preview amount is not an opening balance and requires actual payments', 1);
    }
  }

  const categoryCreated = [];
  for (const name of expenseCategories) {
    const row = await call('/api/v1/expenses/categories', {
      method:'POST', body:{name},
    });
    categoryCreated.push(name);
    mapping.expenseCategories[name] = row?.id ?? null;
  }

  defer('salesInvoices', 'Historical sale lines/payments are not replayed against stock-on-hand snapshot', sales.salesInvoices.length);
  defer('purchases', 'Preview bills lack verified full inventory/source allocations', purchases.length);
  defer('expenses', 'Illustrative account/payment splits are not verified posting events', expenses.length);
  defer('salesReturns', 'Must reference verified posted sale documents', sales.salesReturns.length);
  defer('cashSessions', 'Preview day counts not linked to reconstructed journal cash movements', finance.cashSessions.length);
  defer('financeTransactions', 'Owner/lender/borrower financial identity mapping is not approved', finance.financeTransactions.length);
  defer('accountTransfers', 'Sample transfers cannot be posted without verified cash and bank source state', finance.accountTransfers.length);
  defer('ledgerEntries', 'Historical entries other than explicit openings not posted', ledgerEntries.filter(e => e.type !== 'opening').length);

  mapping.totals = {
    sourceProducts: products.length, savedProducts: Object.keys(mapping.products).length,
    stockOpenings:products.filter(p => p.stock > 0 && p.kind !== 'Service').length,
    sourceParties:parties.length, savedParties:Object.keys(mapping.parties).length,
    sourceAccounts:finance.financeAccounts.length,
    savedAccounts:Object.keys(mapping.moneyAccounts).length,
    categoryCount:Object.keys(mapping.categories).length,
    expenseCategoryCount:categoryCreated.length,
    deferredSources:mapping.deferred.length,
  };
  await writeNew('backend-id-map.json', mapping);
  await writeNew('seed-summary.json', {
    ...mapping.totals, tenantId:mapping.tenantId, asOf:'2026-10-07',
    warnings:[
      'Preview cash/party current balances are not ledger postings.',
      'Service and missing-serial/expiry products are inactive until valid backend contracts and source evidence exist.',
      'Alternate unit prices are retained in source archive, not backend prices.',
      'Historical invoices, purchases, returns and loans not posted.',
    ],
  });
  console.log('SEED_OK ' + JSON.stringify(mapping.totals));
  console.log('Private seed evidence saved outside GitHub');
} catch (error) {
  // Preserve partial records for diagnostic review. Never silently retry a
  // financial POST or generate a second tenant after an uncertain response.
  await writeFile(resolve(output, 'seed-error.txt'),
    String(error instanceof Error ? error.message : error) + '\n', { mode:0o600, flag:'wx' });
  console.error('SEED_FAILED ' + (error instanceof Error ? error.message : String(error)));
  process.exitCode = 1;
}
