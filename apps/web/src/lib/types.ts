export type PromiseResult<T> =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'success'; readonly data: T }
  | { readonly status: 'error'; readonly error: Error };

export type SortDirection = 'asc' | 'desc';

export type PageResult<T> = {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
};

export type QueryParams = {
  readonly page?: number;
  readonly pageSize?: number;
  readonly query?: string;
  readonly sortBy?: string;
  readonly sortDirection?: SortDirection;
  readonly filters?: Readonly<Record<string, readonly string[]>>;
};

export type ID = string;

export type Timestamp = string;

export type AuditInfo = {
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
  readonly createdBy?: ID;
  readonly updatedBy?: ID;
};

export type ServiceError = {
  readonly code: string;
  readonly message: string;
  readonly details?: unknown;
};

export function createServiceError(code: string, message: string, details?: unknown): ServiceError {
  return { code, message, details };
}

export function isServiceError(value: unknown): value is ServiceError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'message' in value &&
    typeof (value as ServiceError).code === 'string' &&
    typeof (value as ServiceError).message === 'string'
  );
}

export async function delay<T>(value: T, ms = 300): Promise<T> {
  return await new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
