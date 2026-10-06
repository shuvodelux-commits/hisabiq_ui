function numeric(value: string | number): number {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function factorFor(
  selectedUnit: string,
  baseUnit: string,
  alternateUnit: string | undefined,
  factor: number
): number {
  if (selectedUnit === baseUnit || !alternateUnit || selectedUnit !== alternateUnit) return 1;
  return Number.isFinite(factor) && factor > 0 ? factor : 1;
}

export function toBaseQuantity(
  value: string | number,
  selectedUnit: string,
  baseUnit: string,
  alternateUnit: string | undefined,
  factor: number
): number {
  return numeric(value) * factorFor(selectedUnit, baseUnit, alternateUnit, factor);
}

export function toBasePrice(
  value: string | number,
  selectedUnit: string,
  baseUnit: string,
  alternateUnit: string | undefined,
  factor: number
): number {
  return numeric(value) / factorFor(selectedUnit, baseUnit, alternateUnit, factor);
}
