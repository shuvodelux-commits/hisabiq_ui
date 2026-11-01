export type ProductUnitOption = { name: string; nameBn?: string; symbol: string; value?: string; aliases?: string[] };

/** Display symbols are separate from the unit keys stored in existing products and invoices. */
export const productUnitOptions: ProductUnitOption[] = [
  { name: 'Piece', nameBn: 'পিস', value: 'Pcs', symbol: 'pcs', aliases: ['Pieces'] },
  { name: 'Gira', nameBn: 'গিরা', symbol: 'Gira' }, { name: 'Kilogram', nameBn: 'কেজি', symbol: 'Kg' },
  { name: 'Feet', nameBn: 'ফুট', value: 'Feet', symbol: 'Ft' }, { name: 'Bag', nameBn: 'বস্তা', symbol: 'Bag' },
  { name: 'Coil', nameBn: 'কয়েল', symbol: 'Coil' }, { name: 'Pair', nameBn: 'জোড়া', symbol: 'Pair' },
  { name: 'Litre', nameBn: 'লিটার', value: 'Litre', symbol: 'L' }, { name: 'Box', nameBn: 'বক্স', symbol: 'Box' },
  { name: 'Gauge', nameBn: 'গেজ', value: 'Gauge', symbol: 'Gg' }, { name: 'Carton', nameBn: 'কার্টন', value: 'Carton', symbol: 'CT' },
  { name: 'Dozen', nameBn: 'ডজন', value: 'Dozen', symbol: 'Dz' }, { name: 'Meter', nameBn: 'মিটার', value: 'Meter', symbol: 'm' },
];

export function matchesUnit(option: ProductUnitOption, unit: string): boolean {
  return [option.name, option.symbol, option.value ?? option.symbol, ...(option.aliases ?? [])]
    .some(value => value.toLowerCase() === unit.trim().toLowerCase());
}

export function unitSymbol(unit: string): string {
  return productUnitOptions.find(option => matchesUnit(option, unit))?.symbol ?? unit;
}

export function validUnitSymbol(symbol: string): boolean {
  return /^[^\s]{1,4}$/u.test(symbol.trim());
}

/** Only the display label is translated. Unit keys, factors and stock postings remain unchanged. */
export function unitBanglaName(unit: string): string | undefined {
  return productUnitOptions.find(option => matchesUnit(option, unit))?.nameBn?.trim() || undefined;
}

/** Freeze display wording with the sale so later master edits cannot change posted receipts. */
export function snapshotUnitBanglaNames(units: readonly string[]): Record<string, string> {
  return Object.fromEntries(units.map(unit => [unit, unitBanglaName(unit) ?? '']));
}
