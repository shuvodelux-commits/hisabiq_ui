/**
 * Backend-compatible ULID: 48-bit millisecond timestamp and 80-bit randomness,
 * Crockford base32. Monotonic across calls at identical or regressed clock time.
 * Ported from nestshererp packages/shared-utils/src/ulid.ts.
 */
const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const BASE = 32;
const TIME_LEN = 10;
const RANDOM_LEN = 16;
const MAX_TIME = 281474976710655; // 48 bits
const ULID_PATTERN = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;

let lastTime = -1;
let lastRandom: number[] = [];

function encodeTime(time: number): string {
  let remaining = time;
  let encoded = '';
  for (let index = 0; index < TIME_LEN; index += 1) {
    encoded = ENCODING.charAt(remaining % BASE) + encoded;
    remaining = Math.floor(remaining / BASE);
  }
  return encoded;
}

function drawRandom(): number[] {
  const bytes = new Uint8Array(RANDOM_LEN);
  // Crypto is mandatory: never fall back to Math.random for posting identity.
  globalThis.crypto.getRandomValues(bytes);
  // 256 divides evenly by 32: unbiased Crockford symbols.
  return Array.from(bytes, byte => byte % BASE);
}

function incrementRandom(symbols: readonly number[]): number[] {
  const next = [...symbols];
  for (let i = next.length - 1; i >= 0; i -= 1) {
    const digit = next[i] ?? 0;
    if (digit < BASE - 1) {
      next[i] = digit + 1;
      return next;
    }
    next[i] = 0;
  }
  throw new RangeError('ULID random component overflow');
}

export function generateOperationId(nowMs: number = Date.now()): string {
  if (!Number.isSafeInteger(nowMs) || nowMs < 0 || nowMs > MAX_TIME) {
    throw new RangeError('ULID timestamp out of range');
  }

  if (nowMs > lastTime) {
    // Draw before committing the new timestamp, so crypto failure is atomic.
    const random = drawRandom();
    lastTime = nowMs;
    lastRandom = random;
  } else {
    lastRandom = incrementRandom(lastRandom);
  }

  return encodeTime(lastTime) +
    lastRandom.map(symbol => ENCODING.charAt(symbol)).join('');
}

export function isOperationId(value: string): boolean {
  return typeof value === 'string' && ULID_PATTERN.test(value);
}
