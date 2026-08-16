import type { AuditInfo, ID, PageResult, QueryParams, Timestamp } from './types.js';

export type AgentType = 'general' | 'research' | 'code' | 'writing' | 'planning' | 'memory' | 'custom';

export type AgentStatus = 'available' | 'busy' | 'offline' | 'error';

export type AgentCapability = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
};

export type Agent = {
  readonly id: ID;
  readonly workspaceId: ID;
  readonly code: string;
  readonly name: string;
  readonly description: string;
  readonly avatar?: string;
  readonly type: AgentType;
  readonly status: AgentStatus;
  readonly systemPrompt?: string;
  readonly providerId?: ID;
  readonly defaultModel?: string;
  readonly temperature: number;
  readonly topP: number;
  readonly maxTokens?: number;
  readonly toolIds: readonly ID[];
  readonly capabilities: readonly AgentCapability[];
  readonly collaborator: boolean;
  readonly audit: AuditInfo;
};

export type AgentRun = {
  readonly id: ID;
  readonly agentId: ID;
  readonly conversationId?: ID;
  readonly taskTitle: string;
  readonly status: 'queued' | 'running' | 'waiting' | 'success' | 'error' | 'cancelled';
  readonly steps?: readonly {
    readonly id: ID;
    readonly title: string;
    readonly status: 'pending' | 'running' | 'success' | 'error' | 'skipped';
    readonly detail?: string;
    readonly startedAt?: Timestamp;
    readonly completedAt?: Timestamp;
  }[];
  readonly startedAt: Timestamp;
  readonly completedAt?: Timestamp;
  readonly trigger: 'user' | 'schedule' | 'event' | 'webhook';
  readonly errorMessage?: string;
};

export type Workflow = {
  readonly id: ID;
  readonly name: string;
  readonly description?: string;
  readonly trigger: {
    readonly type: 'manual' | 'schedule' | 'event' | 'webhook';
    readonly config?: unknown;
  };
  readonly steps: readonly unknown[];
  readonly enabled: boolean;
  readonly audit: AuditInfo;
};

export interface AgentService {
  readonly list: (params?: QueryParams) => Promise<PageResult<Agent>>;
  readonly get: (id: ID) => Promise<Agent>;
  readonly create: (
    data: Readonly<
      Partial<
        Pick<
          Agent,
          | 'code'
          | 'name'
          | 'description'
          | 'avatar'
          | 'type'
          | 'systemPrompt'
          | 'providerId'
          | 'defaultModel'
          | 'temperature'
          | 'topP'
          | 'maxTokens'
          | 'toolIds'
          | 'collaborator'
        >
      > & { readonly name: string }
    >,
  ) => Promise<Agent>;
  readonly update: (id: ID, patch: Readonly<Partial<Agent>>) => Promise<Agent>;
  readonly delete: (id: ID) => Promise<void>;
  readonly listRuns: (params?: QueryParams & { readonly agentId?: ID }) => Promise<PageResult<AgentRun>>;
  readonly getRun: (id: ID) => Promise<AgentRun>;
  readonly cancelRun: (id: ID) => Promise<void>;
  readonly subscribeToRun: (
    runId: ID,
    onUpdate: (run: AgentRun) => void,
  ) => () => void;
  readonly listWorkflows: (params?: QueryParams) => Promise<PageResult<Workflow>>;
  readonly getWorkflow: (id: ID) => Promise<Workflow>;
  readonly createWorkflow: (data: Readonly<Omit<Workflow, 'id' | 'audit'>>) => Promise<Workflow>;
  readonly updateWorkflow: (id: ID, patch: Readonly<Partial<Workflow>>) => Promise<Workflow>;
  readonly deleteWorkflow: (id: ID) => Promise<void>;
  readonly runWorkflow: (id: ID, input?: unknown) => Promise<AgentRun>;
}
