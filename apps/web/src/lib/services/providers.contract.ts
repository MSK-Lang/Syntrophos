import type { AuditInfo, ID, PageResult, QueryParams } from './types.js';

export type ProviderKind = 'llm' | 'embedding' | 'tts' | 'stt' | 'image' | 'rerank';

export type ProviderStatus = 'configured' | 'available' | 'error' | 'rate-limited';

export type Model = {
  readonly id: ID;
  readonly providerId: ID;
  readonly externalId: string;
  readonly name: string;
  readonly kind: ProviderKind;
  readonly description?: string;
  readonly capabilities: readonly string[];
  readonly maxInputTokens?: number;
  readonly maxOutputTokens?: number;
  readonly supportsStreaming: boolean;
  readonly supportsTools: boolean;
  readonly supportsFunctionCalling: boolean;
  readonly contextWindow?: number;
  readonly pricing: {
    readonly costPerMillionInputTokens?: number;
    readonly costPerMillionOutputTokens?: number;
    readonly costPerSecond?: number;
  };
  readonly enabled: boolean;
  readonly defaultTemperature?: number;
  readonly hidden: boolean;
};

export type Provider = {
  readonly id: ID;
  readonly code: string;
  readonly name: string;
  readonly kind: ProviderKind;
  readonly description?: string;
  readonly websiteUrl?: string;
  readonly docsUrl?: string;
  readonly icon?: string;
  readonly status: ProviderStatus;
  readonly authType: 'api-key' | 'oauth' | 'bearer' | 'username-password' | 'none';
  readonly isConfigured: boolean;
  readonly models: readonly Model[];
  readonly defaultModelId?: ID;
  readonly rateLimitRequestsPerMinute?: number;
  readonly rateLimitTokensPerMinute?: number;
  readonly audit: AuditInfo;
};

export type ProviderUsageStats = {
  readonly providerId: ID;
  readonly modelId?: ID;
  readonly window: 'day' | 'week' | 'month';
  readonly requests: number;
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly estimatedCost: number;
  readonly latencyMs: { readonly p50: number; readonly p95: number; readonly p99: number };
  readonly errorRate: number;
};

export interface ProviderService {
  readonly list: (params?: QueryParams) => Promise<PageResult<Provider>>;
  readonly get: (id: ID) => Promise<Provider>;
  readonly listModels: (providerId: ID) => Promise<readonly Model[]>;
  readonly configure: (
    providerCode: string,
    config: Readonly<Record<string, string>>,
  ) => Promise<Provider>;
  readonly testConnection: (providerId: ID) => Promise<{
    readonly success: boolean;
    readonly latencyMs?: number;
    readonly errorMessage?: string;
  }>;
  readonly updateProvider: (id: ID, patch: Readonly<Partial<Pick<Provider, 'name' | 'defaultModelId' | 'rateLimitRequestsPerMinute' | 'rateLimitTokensPerMinute'>>>) => Promise<Provider>;
  readonly updateModel: (id: ID, patch: Readonly<Partial<Pick<Model, 'name' | 'enabled' | 'defaultTemperature' | 'hidden'>>>) => Promise<Model>;
  readonly disconnect: (id: ID) => Promise<void>;
  readonly getUsage: (options?: {
    readonly providerId?: ID;
    readonly modelId?: ID;
    readonly window?: 'day' | 'week' | 'month';
  }) => Promise<readonly ProviderUsageStats[]>;
  readonly getDefaults: () => Promise<{
    readonly chatProviderId?: ID;
    readonly chatModelId?: ID;
    readonly embeddingProviderId?: ID;
    readonly embeddingModelId?: ID;
    readonly ttsProviderId?: ID;
    readonly ttsModelId?: ID;
    readonly sttProviderId?: ID;
    readonly sttModelId?: ID;
  }>;
  readonly setDefaults: (defaults: Parameters<ProviderService['getDefaults']> extends () => Promise<infer R> ? Partial<R> : never) => Promise<void>;
}
