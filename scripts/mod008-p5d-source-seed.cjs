/* MOD-008 P5D: test-only source provisioning through *real* Nest HTTP writes.
 *
 * Only use with disposable, self-owned PostgreSQL and signed QA tenants.
 * Required:
 *   HISABIQ_P5D_API_ORIGIN=http://127.0.0.1:3230
 *   HISABIQ_P5D_PG_CONTAINER=hisabiq-mod008-p5d-pg16
 *   HISABIQ_P5D_DISPOSABLE_ACK=isolated-pg16-only
 *   HISABIQ_P5D_TENANT_A/B, HISABIQ_P5D_USER_A/B, HISABIQ_P5D_JWT_A/B
 * Permissions on disposable users:
 * catalog.unit.manage, catalog.product.create/edit/deactivate/view,
 * party.supplier.create/view, party.customer.create/view,
 * inventory.cost.view, purchase.bill.create.
 *
 * No production IDs, user data, financial posting or SQL writes. This script
 * creates only test suppliers, test products and catalog unit definitions.
 * It prints IDs, never JWTs, request headers or body error traces.
 */
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { randomBytes } = require('node:crypto');
const ULID = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const alphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
function operationId() {
  let clock = Date.now(), head = '';
  for (let i = 0; i < 10; i++) { head = alphabet[clock % 32] + head; clock = Math.floor(clock / 32); }
  let buffer = 0, bits = 0, random = '';
  for (const byte of randomBytes(10)) {
    buffer = (buffer << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5; random += alphabet[(buffer >>> bits) & 31];
      buffer &= (1 << bits) - 1;
    }
  }
  return head + random;
}
function validateEnvironment() {
  assert.equal(process.env.HISABIQ_P5D_API_ORIGIN, 'http://127.0.0.1:3230');
  assert.equal(process.env.HISABIQ_P5D_DISPOSABLE_ACK, 'isolated-pg16-only');
  const name = process.env.HISABIQ_P5D_PG_CONTAINER;
  assert.equal(name, 'hisabiq-mod008-p5d-pg16');
  const inspect = spawnSync('podman',
    ['inspect', '--format', '{{index .Config.Labels "hisabiq.qa"}}|{{.State.Running}}', name],
    { encoding: 'utf8' });
  assert.equal(inspect.status, 0);
  assert.equal(inspect.stdout.trim(), 'mod008-p5d-501|true');
  for (const who of ['A', 'B']) {
    for (const label of ['TENANT', 'USER']) {
      assert.match(process.env['HISABIQ_P5D_' + label + '_' + who] || '', ULID);
    }
    assert.ok(process.env['HISABIQ_P5D_JWT_' + who],
      'Signed temporary test JWT must be supplied outside Git');
  }
  assert.notEqual(process.env.HISABIQ_P5D_TENANT_A, process.env.HISABIQ_P5D_TENANT_B);
}
async function request(who, method, path, body) {
  const headers = {
    Authorization: 'Bearer ' + process.env['HISABIQ_P5D_JWT_' + who],
    ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    ...(method === 'POST' && (path === '/api/v1/parties' || path === '/api/v1/products')
      ? { 'Idempotency-Key': operationId() } : {}),
  };
  const response = await fetch('http://127.0.0.1:3230' + path, {
    method, headers, ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  assert.equal(response.status, method === 'POST' && !path.endsWith('/status') ? 201 : 200,
    'Disposable Nest source creation/readback status');
  const payload = await response.json();
  assert.ok(payload && payload.data && typeof payload.data === 'object');
  return payload.data;
}
function productBody(name, pieceId, boxId, conversion = true) {
  return {
    name, baseUnitId: pieceId, purchasePriceMinor: 187,
    sellingPriceMinor: 300, minStockQty: 0,
    brandId: null, categoryId: null, sku: null, barcode: null,
    description: null, defaultDiscountType: null,
    defaultDiscountValue: null, offerEnabled: false,
    offerPriceMinor: null, offerStartDate: null, offerEndDate: null,
    // The default tenant setting disables expiry tracking until explicitly enabled.
    // Serial/expiry text below is preserved only as an opaque draft snapshot.
    tracksExpiry: false, tracksSerial: false,
    conversionUnitId: conversion ? boxId : null,
    conversionFactorQty: conversion ? 20_000 : null,
  };
}
function partyBody(name, role, phone = null) {
  return {
    name, roles: [role], phone, address: null, guardianName: null,
    nid: null, email: null, notes: null, customerGroupId: null,
    creditLimitMinor: null,
  };
}
async function seed(who) {
  const units1 = await request(who, 'POST', '/api/v1/catalog/units', { name: 'Pcs' });
  const units2 = await request(who, 'POST', '/api/v1/catalog/units', { name: 'Box' });
  const units = units2.units || units1.units;
  assert.ok(Array.isArray(units), 'Nest catalog returns stored units');
  const pcs = units.find(x => x.name === 'Pcs')?.id;
  const box = units.find(x => x.name === 'Box')?.id;
  assert.match(pcs || '', ULID); assert.match(box || '', ULID);
  const supplier = await request(who, 'POST', '/api/v1/parties',
    partyBody('P5D Supplier ' + who, 'SUPPLIER'));
  const product = await request(who, 'POST', '/api/v1/products',
    productBody('P5D Copper Cable ' + who, pcs, box));
  assert.match(supplier.id, ULID);
  assert.match(product.id, ULID);
  assert.equal(product.conversion?.factorQty, 20_000);
  const readback = await request(who, 'GET', '/api/v1/products/' + product.id);
  assert.equal(readback.purchasePriceMinor, 187);
  assert.equal(readback.conversion?.unitName, 'Box');
  return { supplier: supplier.id, product: product.id, pcs, box };
}
async function main() {
  validateEnvironment();
  const a = await seed('A');
  const b = await seed('B');
  const wrong = await request('A', 'POST', '/api/v1/parties',
    partyBody('P5D Wrong Role Customer', 'CUSTOMER', '01790000123'));
  const off = await request('A', 'POST', '/api/v1/products',
    productBody('P5D Inactive Cable A', a.pcs, a.box));
  const inactive = await request('A', 'POST',
    '/api/v1/products/' + off.id + '/status', { status: 'INACTIVE' });
  assert.equal(inactive.status, 'INACTIVE');
  const output = {
    HISABIQ_P5D_SUPPLIER_A: a.supplier, HISABIQ_P5D_PRODUCT_A: a.product,
    HISABIQ_P5D_SUPPLIER_B: b.supplier, HISABIQ_P5D_PRODUCT_B: b.product,
    HISABIQ_P5D_WRONG_ROLE_A: wrong.id, HISABIQ_P5D_INACTIVE_PRODUCT_A: off.id,
  };
  for (const [key, value] of Object.entries(output)) {
    assert.match(value, ULID);
    process.stdout.write(key + '=' + value + '\n');
  }
}
main().catch(() => {
  console.error('P5D source provisioning failed (network/authorization data suppressed)');
  process.exitCode = 1;
});
