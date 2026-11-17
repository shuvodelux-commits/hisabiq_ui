import { ApiError } from './errors.ts';
import {
  decodeTradingLedger,
  decodeHistoricalPartyOpening,
  decodeTradingPartyDetail,
  decodeTradingPartyList,
  type TradingLedger,
  type HistoricalPartyOpeningEnvelope,
  type TradingPartyDetail,
  type TradingPartyList,
  type TradingRole,
  type TradingStatus,
} from './party-reads.ts';

/**
 * MOD-004 T03-R: data-only projections for the future authenticated Party UI.
 *
 * This is not the existing preview Party type: its balance is a whole-party
 * number and cannot safely hold separate Customer/Supplier/Vendor obligations.
 * It must not be substituted into src/pages/Parties.tsx until the seven-role
 * connected-workspace acceptance and financial writer gates are complete.
 *
 * All money here remains signed integer poisha. A net role balance is NOT the
 * gross due/advance components required by D08; never label it as either.
 */
export type UiPartyRelationship =
  | 'Customer' | 'Supplier' | 'Vendor'
  | 'Lender' | 'Borrower' | 'Owner' | 'Payee';

const uiRoles: Record<UiPartyRelationship, TradingRole | null> = {
  Customer: 'CUSTOMER',
  Supplier: 'SUPPLIER',
  Vendor: 'VENDOR',
  Lender: null,
  Borrower: null,
  Owner: null,
  Payee: null,
};

export function tradingRoleForUi(
  relationship: UiPartyRelationship | 'All',
): TradingRole | null {
  return relationship === 'All'
    ? null
    : Object.prototype.hasOwnProperty.call(uiRoles, relationship)
      ? uiRoles[relationship]
      : null;
}

export interface SignedRoleNet {
  /** Selected-role net, not gross AR/AP or a cash-account balance. */
  signedMinor: number;
  magnitudeMinor: number;
  sign: 'POSITIVE_NET' | 'NEGATIVE_NET' | 'ZERO_NET';
}

export interface TradingDirectoryItem {
  partyId: string;
  name: string;
  phone: string | null;
  status: TradingStatus;
  selectedRole: TradingRole;
  /** Only badges disclosed by the server for this caller. */
  visibleTradingRoles: readonly TradingRole[];
  isSystemReserved: boolean;
  version: number;
  net: SignedRoleNet;
  /** Customer-only fields must not leak through Supplier/Vendor presentation. */
  customerCreditLimitMinor: number | null;
  customerGroupName: string | null;
}

export interface TradingDirectoryPage {
  selectedRole: TradingRole;
  items: readonly TradingDirectoryItem[];
  /**
   * All selected-role records matching server filters, NOT an aggregation of
   * this (possibly incomplete) page and NOT an All-relationships total.
   */
  selectedRoleSummary: {
    total: number;
    active: number;
    inactive: number;
    ungroupedCustomers: number | null;
    positiveNetTotalMinor: number;
    negativeNetMagnitudeTotalMinor: number;
    overCustomerCreditLimit: number | null;
  };
  page: TradingPartyList['page'];
}

export interface TradingPartyReadDetail {
  selectedRole: TradingRole;
  item: TradingDirectoryItem;
}

export interface TradingLedgerLineView {
  journalEntryId: string;
  journalLineId: string;
  sourceDocumentType: string;
  sourceDocumentId: string;
  sourceNumber: string;
  businessDate: string;
  controlAccount: string;
  debitMinor: number;
  creditMinor: number;
  /** Signed control-account movement, never a bank/cash movement. */
  amountMinor: number;
  runningRoleNet: SignedRoleNet;
}

export interface TradingRoleLedgerView {
  selectedRole: TradingRole;
  partyId: string;
  partyName: string;
  /** API's start-of-window/page snapshot, not a historical opening document. */
  serverOpeningNet: SignedRoleNet;
  /** API's closing role snapshot; not assumed to equal the last paginated row. */
  serverClosingNet: SignedRoleNet;
  rows: readonly TradingLedgerLineView[];
  /** API-reported totals. Never infer their time/page scope or net other roles. */
  serverTotals: { debitMinor: number; creditMinor: number };
  page: TradingLedger['page'];
}

function roleNet(signedMinor: number): SignedRoleNet {
  return {
    signedMinor,
    magnitudeMinor: Math.abs(signedMinor),
    sign: signedMinor > 0 ? 'POSITIVE_NET' : signedMinor < 0 ? 'NEGATIVE_NET' : 'ZERO_NET',
  };
}

function directoryItem(
  role: TradingRole,
  party: TradingPartyList['data'][number],
): TradingDirectoryItem {
  return {
    partyId: party.id,
    name: party.name,
    phone: party.phone,
    status: party.status,
    selectedRole: role,
    visibleTradingRoles: [...party.roles],
    isSystemReserved: party.isSystemReserved,
    version: party.version,
    net: roleNet(party.balance.netMinor),
    customerCreditLimitMinor: role === 'CUSTOMER' ? party.creditLimitMinor : null,
    customerGroupName: role === 'CUSTOMER' ? party.customerGroupName : null,
  };
}

/** Requires the matching T01-R response decoder, no fixture/preview fallback. */
export function projectTradingDirectoryPage(
  selectedRole: TradingRole,
  payload: TradingPartyList,
): TradingDirectoryPage {
  const checked = decodeTradingPartyList(payload, selectedRole);
  const { summary, page } = checked;
  return {
    selectedRole,
    items: checked.data.map(item => directoryItem(selectedRole, item)),
    selectedRoleSummary: {
      total: summary.total,
      active: summary.active,
      inactive: summary.inactive,
      ungroupedCustomers: selectedRole === 'CUSTOMER' && summary.ungrouped !== null
        ? summary.ungrouped : null,
      positiveNetTotalMinor: summary.totalOutstandingMinor,
      negativeNetMagnitudeTotalMinor: summary.totalAdvanceMinor,
      overCustomerCreditLimit: selectedRole === 'CUSTOMER' ? summary.overCreditLimit : null,
    },
    page: { nextCursor: page.nextCursor, hasMore: page.hasMore },
  };
}

/** One role at a time; never substitute its net into a whole-identity balance. */
export function projectTradingPartyDetail(
  selectedRole: TradingRole,
  payload: TradingPartyDetail,
): TradingPartyReadDetail {
  const checked = decodeTradingPartyDetail(payload, selectedRole);
  return { selectedRole, item: directoryItem(selectedRole, checked.data) };
}

/** A ledger retains source lineage and the original account family verbatim. */
export function projectTradingRoleLedger(
  selectedRole: TradingRole,
  expectedPartyId: string,
  payload: TradingLedger,
): TradingRoleLedgerView {
  const checked = decodeTradingLedger(payload, selectedRole, expectedPartyId);
  return {
    selectedRole,
    partyId: checked.partyId,
    partyName: checked.partyName,
    serverOpeningNet: roleNet(checked.openingBalance.netMinor),
    serverClosingNet: roleNet(checked.closingBalance.netMinor),
    rows: checked.rows.map(row => ({
      journalEntryId: row.journalEntryId,
      journalLineId: row.journalLineId,
      sourceDocumentType: row.sourceDocumentType,
      sourceDocumentId: row.sourceDocumentId,
      sourceNumber: row.sourceNumber,
      businessDate: row.businessDate,
      controlAccount: row.account,
      debitMinor: row.debitMinor,
      creditMinor: row.creditMinor,
      amountMinor: row.amountMinor,
      runningRoleNet: roleNet(row.runningBalanceMinor),
    })),
    serverTotals: {
      debitMinor: checked.totalDebitMinor,
      creditMinor: checked.totalCreditMinor,
    },
    page: {
      nextCursor: checked.page.nextCursor,
      hasMore: checked.page.hasMore,
    },
  };
}


/**
 * One historical OPENING_BALANCE source document for exactly one trading role.
 * Distinct from TradingRoleLedgerView.serverOpeningNet: a ledger's opening
 * snapshot is a balance at a page/window boundary, not this posted document.
 *
 * A documented absence (opening:null) differs from a stale/aborted controller
 * read (controller returns null). Neither implies an opening of zero taka.
 * This projection never generates/queries a cash session or a money account.
 */
export interface TradingHistoricalOpeningView {
  partyId: string;
  selectedRole: TradingRole;
  opening: null | {
    openingId: string;
    sourceNumber: string;
    direction: 'RECEIVABLE' | 'PAYABLE';
    amountMinor: number;
    businessDate: string;
    version: number;
  };
}
const partyUlid = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;

/** Server source identity and financial direction are preserved verbatim. */
export function projectTradingHistoricalOpening(
  selectedRole: TradingRole,
  expectedPartyId: string,
  payload: HistoricalPartyOpeningEnvelope,
): TradingHistoricalOpeningView {
  if (typeof expectedPartyId !== 'string' || !partyUlid.test(expectedPartyId)) {
    throw new ApiError('protocol', 'Opening source Party identity could not be verified');
  }
  const verified = decodeHistoricalPartyOpening(payload, selectedRole);
  const document = verified.data;
  return {
    partyId: expectedPartyId,
    selectedRole,
    opening: document === null ? null : {
      openingId: document.id,
      sourceNumber: document.number,
      direction: document.direction,
      amountMinor: document.amountMinor,
      businessDate: document.businessDate,
      version: document.version,
    },
  };
}
