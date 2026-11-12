export type ApiErrorKind = 'network' | 'http' | 'protocol';

export interface ApiErrorOptions {
  status?: number;
  code?: string;
  details?: Record<string, string>;
  traceId?: string;
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly code?: string;
  readonly details: Record<string, string>;
  readonly traceId?: string;

  constructor(kind: ApiErrorKind, message: string, options: ApiErrorOptions = {}) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = options.status;
    this.code = options.code;
    this.details = options.details ?? {};
    this.traceId = options.traceId;
  }
}
