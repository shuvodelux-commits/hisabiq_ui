import type { ProductUnitOption } from '../data/productUnits';

const same = (a: string, b: string) => a.trim().toLocaleLowerCase() === b.trim().toLocaleLowerCase();

export const productUnitKey = (unit: ProductUnitOption): string => unit.value ?? unit.symbol;

/** Validate before mutating the preview master lists, so failed inline edits are atomic. */
export function validateMasterRename(previous: string, proposed: string, options: readonly string[], noun: string): string {
  const next = proposed.trim();
  if (!next) throw new Error(`Enter a ${noun} name.`);
  if (!options.some((name) => same(name, previous))) throw new Error(`This ${noun} no longer exists. Reopen the list.`);
  if (options.some((name) => !same(name, previous) && same(name, next)))
    throw new Error(`This ${noun} already exists.`);
  return next;
}

/** A unit's persisted key must not change when its display name or symbol is edited. */
export function validateUnitRename(
  previousKey: string,
  proposedName: string,
  proposedSymbol: string,
  units: readonly ProductUnitOption[]
): { name: string; symbol: string } {
  const current = units.find((unit) => same(productUnitKey(unit), previousKey));
  if (!current) throw new Error('This unit no longer exists. Reopen the list.');
  const name = proposedName.trim();
  const symbol = proposedSymbol.trim();
  if (!name) throw new Error('Enter a unit name.');
  if (!/^[^\s]{1,4}$/u.test(symbol))
    throw new Error('Enter a short unit symbol (1–4 characters, no spaces).');
  const used = units.filter((unit) => !same(productUnitKey(unit), previousKey));
  if (used.some((unit) => [unit.name, unit.symbol, productUnitKey(unit), ...(unit.aliases ?? [])]
    .some((entry) => same(entry, name) || same(entry, symbol))))
    throw new Error('This unit name or symbol is already used.');
  return { name, symbol };
}
