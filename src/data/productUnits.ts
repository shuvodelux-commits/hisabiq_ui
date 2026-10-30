export type ProductUnitOption = { name: string; symbol: string; value?: string; aliases?: string[] };

/** Display symbols are separate from the unit keys stored in existing products and invoices. */
export const productUnitOptions: ProductUnitOption[] = [
  { name: 'Piece', value: 'Pcs', symbol: 'pcs', aliases: ['Pieces'] },
  { name: 'Gira', symbol: 'Gira' }, { name: 'Kilogram', symbol: 'Kg' },
  { name: 'Feet', value: 'Feet', symbol: 'Ft' }, { name: 'Bag', symbol: 'Bag' },
  { name: 'Coil', symbol: 'Coil' }, { name: 'Pair', symbol: 'Pair' },
  { name: 'Litre', value: 'Litre', symbol: 'L' }, { name: 'Box', symbol: 'Box' },
  { name: 'Gauge', value: 'Gauge', symbol: 'Gg' }, { name: 'Carton', value: 'Carton', symbol: 'CT' },
  { name: 'Dozen', value: 'Dozen', symbol: 'Dz' }, { name: 'Meter', value: 'Meter', symbol: 'm' },
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
