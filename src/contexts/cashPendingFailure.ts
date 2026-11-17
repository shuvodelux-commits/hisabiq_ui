import { ApiError } from '../integration/errors.ts';

/** A specific 4xx response is authoritative only for an operation that has
 * never previously had an ambiguous network/server outcome. */
export function isDefinitiveCashRefusal(error: unknown): boolean {
  return error instanceof ApiError && error.kind === 'http' &&
    [400, 401, 403, 404, 409, 422].includes(error.status ?? 0);
}

/** Never infer that a previously possible commit was undone by a later denial. */
export function shouldClearPendingCashAfterFailure(
  error: unknown,
  alreadyUncertain: boolean,
): boolean {
  return !alreadyUncertain && isDefinitiveCashRefusal(error);
}
