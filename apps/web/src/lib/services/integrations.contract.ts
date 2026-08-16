import type { AuditInfo, ID, PageResult, QueryParams, Timestamp } from './types.js';

export type IntegrationCategory =
  | 'storage'
  | 'productivity'
  | 'communication'
  | 'calendar'
  | 'development'
  | 'browser'
  | 'ai'
  | 'other';

export type IntegrationStatus = 'available' | 'connected' | 'error' | 'suspended';

export type AuthFlowType = 'oauth' | 'api-key' | 'password' | 'token' | 'browser-extension';

export type Integration = {
  readonly id: ID;
  readonly code: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly category: IntegrationCategory;
  readonly authFlow: AuthFlowType;
  readonly status: IntegrationStatus;
  readonly capabilities: readonly string[];
  readonly scopes?: readonly string[];
  readonly websiteUrl?: string;
  readonly docsUrl?: string;
};

export type IntegrationConnection = {
  readonly id: ID;
  readonly integrationId: ID;
  readonly integrationCode: string;
  readonly accountName?: string;
  readonly accountEmail?: string;
  readonly connectedAt: Timestamp;
  readonly lastSyncAt?: Timestamp;
  readonly nextSyncAt?: Timestamp;
  readonly errorMessage?: string;
  readonly scopes: readonly string[];
  readonly enabled: boolean;
  readonly workspaceId: ID;
  readonly audit: AuditInfo;
};

export type IntegrationEvent = {
  readonly id: ID;
  readonly connectionId: ID;
  readonly eventType: string;
  readonly status: 'success' | 'error' | 'running';
  readonly summary: string;
  readonly startedAt: Timestamp;
  readonly completedAt?: Timestamp;
  readonly itemsProcessed?: number;
  readonly errorMessage?: string;
};

export interface IntegrationService {
  readonly listAvailable: (params?: QueryParams) => Promise<PageResult<Integration>>;
  readonly get: (id: ID) => Promise<Integration>;
  readonly listConnections: (params?: QueryParams) => Promise<PageResult<IntegrationConnection>>;
  readonly getConnection: (id: ID) => Promise<IntegrationConnection>;
  readonly beginConnect: (integrationId: ID, options?: unknown) => Promise<{
    readonly flow: AuthFlowType;
    readonly authUrl?: string;
    readonly requiresInput: boolean;
    readonly fields?: readonly {
      readonly name: string;
      readonly label: string;
      readonly type: 'text' | 'password' | 'textarea';
      readonly placeholder?: string;
    }[];
  }>;
  readonly completeConnect: (integrationId: ID, payload: unknown) => Promise<IntegrationConnection>;
  readonly disconnect: (connectionId: ID) => Promise<void>;
  readonly toggleEnabled: (connectionId: ID, enabled: boolean) => Promise<IntegrationConnection>;
  readonly triggerSync: (connectionId: ID) => Promise<IntegrationEvent>;
  readonly listEvents: (connectionId: ID, params?: QueryParams) => Promise<PageResult<IntegrationEvent>>;
}
