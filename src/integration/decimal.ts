/**
 * Parse a human-entered amount/quantity into an exact safe scaled integer.
 * No floating-point arithmetic is used. Business-level nonnegative/positive
 * rules belong to the resource contract, not this conversion boundary.
 */
export function parseScaledInput(text: string, scale: 2 | 3 | 4): number {
  if (scale !== 2 && scale !== 3 && scale !== 4) {
    throw new RangeError('Invalid decimal scale');
  }
  if (typeof text !== 'string') throw new TypeError('Invalid decimal input');

  const normalized = text.trim().replace(/[০-৯]/g, digit =>
    String('০১২৩৪৫৬৭৮৯'.indexOf(digit)),
  );
  // UI text may omit the leading zero (.5) or fractional digits (1.).
  // Commas, exponents, separators and non-ASCII numerals never get guessed.
  const match = /^(-?)(?:(\d+)(?:\.(\d*))?|\.(\d+))$/.exec(normalized);
  if (!match) throw new TypeError('Invalid decimal number');

  const negative = match[1] === '-';
  const whole = match[2] ?? '0';
  const fraction = match[3] ?? match[4] ?? '';
  if (fraction.length > scale) throw new RangeError('Too many decimal places');

  const factor = 10n ** BigInt(scale);
  const magnitude = BigInt(whole) * factor + BigInt(fraction.padEnd(scale, '0'));
  const result = negative ? -magnitude : magnitude;
  const safe = BigInt(Number.MAX_SAFE_INTEGER);
  if (result > safe || result < -safe) throw new RangeError('Number too large for safe integer');
  return Number(result);
}
