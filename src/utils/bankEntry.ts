export type BankEntryType =
  | 'Bank Charge'
  | 'Interest Received'
  | 'Cheque Bounced (Received)'
  | 'Cheque Bounced (Issued)'
  | 'Cash Deposit'
  | 'Cash Withdrawal'
  | 'Bank Adjustment';

export type BankEntryDirection = 'debit' | 'credit';

export const BANK_ENTRY_TYPES: ReadonlyArray<{
  key: BankEntryType;
  label: string;
  helperBn: string;
  direction: BankEntryDirection | 'either';
  cashMovement: boolean;
  cheque: boolean;
}> = [
  { key: 'Bank Charge', label: 'Bank Charge / Fee', helperBn: 'ব্যাংক চার্জ', direction: 'debit', cashMovement: false, cheque: false },
  { key: 'Interest Received', label: 'Interest Received', helperBn: 'ব্যাংকের সুদ', direction: 'credit', cashMovement: false, cheque: false },
  { key: 'Cheque Bounced (Received)', label: 'Cheque Bounced — we received', helperBn: 'গ্রাহকের চেক ফেরত', direction: 'debit', cashMovement: false, cheque: true },
  { key: 'Cheque Bounced (Issued)', label: 'Cheque Bounced — we issued', helperBn: 'আমাদের দেওয়া চেক ফেরত', direction: 'credit', cashMovement: false, cheque: true },
  { key: 'Cash Deposit', label: 'Cash Deposited into Bank', helperBn: 'ক্যাশ থেকে ব্যাংকে জমা', direction: 'credit', cashMovement: true, cheque: false },
  { key: 'Cash Withdrawal', label: 'Cash Withdrawn from Bank', helperBn: 'ব্যাংক থেকে ক্যাশ উত্তোলন', direction: 'debit', cashMovement: true, cheque: false },
  { key: 'Bank Adjustment', label: 'Other Adjustment', helperBn: 'হিসাব সংশোধন', direction: 'either', cashMovement: false, cheque: false }
];

export type BankEntryDraft = {
  bankAccountId: string;
  entryType: BankEntryType;
  amount: string;
  date: string;
  direction: BankEntryDirection;
  reference: string;
  description: string;
  notes: string;
  backdatedReason: string;
};

export type BankEntryPayload = {
  bankAccountId: string;
  entryType: BankEntryType;
  amount: number;
  date: string;
  direction: BankEntryDirection;
  reference: string;
  description: string;
  notes: string;
  backdatedReason: string;
};

export function bankEntryMeta(type: BankEntryType) {
  return BANK_ENTRY_TYPES.find((item) => item.key === type) ?? BANK_ENTRY_TYPES[0];
}

export function bankEntryImpact(type: BankEntryType, amount: number, adjustmentDirection: BankEntryDirection) {
  const meta = bankEntryMeta(type);
  const direction = meta.direction === 'either' ? adjustmentDirection : meta.direction;
  const validAmount = Number.isFinite(amount) && amount > 0 ? amount : 0;
  return {
    direction,
    bankDelta: direction === 'credit' ? validAmount : -validAmount,
    cashDelta: type === 'Cash Deposit' ? -validAmount : type === 'Cash Withdrawal' ? validAmount : 0
  };
}

/** The bank-only manual endpoint does not reverse cheques or restore party dues.
 * Those entries must go through the existing linked Cheques lifecycle instead. */
export function validateBankEntry(draft: BankEntryDraft, today: string, activeCashSession: boolean): string | null {
  if (!draft.bankAccountId) return 'Choose a bank account.';
  if (!BANK_ENTRY_TYPES.some((item) => item.key === draft.entryType)) return 'Choose a valid entry type.';
  if (bankEntryMeta(draft.entryType).cheque) return 'Return this cheque from Finance → Cheques to update the original payment and party ledger.';
  const amount = Number(draft.amount);
  if (!Number.isFinite(amount) || amount <= 0 || !/^\d+(?:\.\d{1,2})?$/.test(draft.amount.trim())) return 'Enter a positive amount with at most two decimals.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.date) || !Number.isFinite(Date.parse(draft.date))) return 'Choose a valid date.';
  if (draft.date > today) return 'A bank entry cannot be dated in the future.';
  if (draft.date < today && !draft.backdatedReason.trim()) return 'Give a reason for a backdated entry.';
  // BanijjIQ currently requires an open POS cash session on the manual-entry endpoint.
  if (!activeCashSession) return 'Start a POS Cash Session before posting a bank entry.';
  if (draft.entryType === 'Bank Adjustment' && !draft.notes.trim()) return 'Describe the reason for this adjustment in Notes.';
  if (draft.reference.trim().length > 150 || draft.description.trim().length > 500) return 'Reference or description is too long.';
  return null;
}

export function toBankEntryPayload(draft: BankEntryDraft): BankEntryPayload {
  return {
    bankAccountId: draft.bankAccountId,
    entryType: draft.entryType,
    amount: Number(draft.amount),
    date: draft.date,
    direction: bankEntryImpact(draft.entryType, Number(draft.amount), draft.direction).direction,
    reference: draft.reference.trim(),
    description: draft.description.trim(),
    notes: draft.notes.trim(),
    backdatedReason: draft.backdatedReason.trim()
  };
}
