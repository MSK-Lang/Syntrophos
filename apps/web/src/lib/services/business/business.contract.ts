import type { ID } from '../types.js';

export type AutonomyState =
  | 'suggested'
  | 'approved'
  | 'executing'
  | 'awaiting_approval'
  | 'completed'
  | 'verified'
  | 'blocked'
  | 'failed';

export type AutonomyPolicy =
  | 'manual'
  | 'approval_required'
  | 'low_risk_auto'
  | 'high_risk_auto'
  | 'fully_autonomous';

export type FulfillmentStage =
  | 'objective'
  | 'project'
  | 'workflow'
  | 'task'
  | 'execution'
  | 'deliverable'
  | 'verification'
  | 'outcome';

export type AgentCapability =
  | 'web_research'
  | 'lead_qualification'
  | 'crm_read'
  | 'crm_write'
  | 'email_outreach'
  | 'doc_generation'
  | 'code_execution'
  | 'data_analytics'
  | 'qa_verification';

export type ModelProvider = 'anthropic' | 'openai' | 'google' | 'local';

export type BusinessObjective = {
  readonly id: ID;
  readonly title: string;
  readonly description: string;
  readonly targetOutcome: string;
  readonly progress: number; // 0-100
  readonly status: 'on_track' | 'at_risk' | 'behind' | 'completed';
  readonly ownerId: ID;
  readonly ownerName: string;
  readonly ownerType: 'human' | 'agent';
  readonly deadline: string;
  readonly linkedProjectIds: readonly ID[];
  readonly keyResults: readonly {
    readonly id: ID;
    readonly title: string;
    readonly current: number;
    readonly target: number;
    readonly unit: string;
  }[];
  readonly updatedAt: string;
};

export type ExecutionTraceStep = {
  readonly id: ID;
  readonly timestamp: string;
  readonly description: string;
  readonly step?: string | undefined;
  readonly status: 'completed' | 'in_progress' | 'failed' | 'skipped';
  readonly outputSnippet?: string | undefined;
};

export type ExecutionTrace = {
  readonly id: ID;
  readonly executionId: ID;
  readonly agentId?: ID | undefined;
  readonly humanId?: ID | undefined;
  readonly executorName: string;
  readonly executorType: 'agent' | 'human';
  readonly input: string;
  readonly actions: readonly ExecutionTraceStep[];
  readonly output: string;
  readonly verificationResult: 'passed' | 'flagged' | 'failed' | 'pending';
  readonly verificationNotes?: string | undefined;
  readonly summary: string;
};

export type WorkflowNode = {
  readonly id: ID;
  readonly title: string;
  readonly stage: FulfillmentStage;
  readonly autonomyState: AutonomyState;
  readonly autonomyPolicy: AutonomyPolicy;
  readonly executorType: 'agent' | 'human';
  readonly executorName: string;
  readonly executorId: ID;
  readonly dependencies: readonly ID[]; // ids of predecessor nodes
  readonly deliverableTitle?: string | undefined;
  readonly blockerReason?: string | undefined;
  readonly executionTrace?: ExecutionTrace | undefined;
  readonly description?: string | undefined;
  readonly nextAction?: string | undefined;
  readonly inputData?: string | undefined;
  readonly progress?: number | undefined;
  readonly assignedTo?: {
    readonly name: string;
    readonly type: 'agent' | 'human';
  } | undefined;
  readonly output?: {
    readonly deliverableName: string;
  } | undefined;
  readonly verification?: {
    readonly status: 'passed' | 'flagged' | 'failed';
  } | undefined;
};

export type BusinessWorkflow = {
  readonly id: ID;
  readonly name: string;
  readonly description: string;
  readonly objectiveId: ID;
  readonly projectId?: ID | undefined;
  readonly clientName?: string | undefined;
  readonly status: 'active' | 'paused' | 'completed' | 'failed' | 'blocked';
  readonly trigger: string;
  readonly autonomyPolicy: AutonomyPolicy;
  readonly nodes: readonly WorkflowNode[];
  readonly progress: number; // 0-100
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type BusinessProject = {
  readonly id: ID;
  readonly name: string;
  readonly clientName?: string | undefined;
  readonly clientId?: ID | undefined;
  readonly health: 'healthy' | 'at_risk' | 'critical';
  readonly progress: number;
  readonly ownerName: string;
  readonly deadline: string;
  readonly deliverablesCount: number;
  readonly completedDeliverablesCount: number;
  readonly activeWorkflowIds: readonly ID[];
  readonly workflowIds?: readonly ID[] | undefined;
  readonly deliverables?: readonly {
    readonly id: ID;
    readonly title: string;
    readonly status: 'pending' | 'in_review' | 'approved';
  }[] | undefined;
  readonly description: string;
};

export type BusinessClient = {
  readonly id: ID;
  readonly name: string;
  readonly industry: string;
  readonly tier: 'enterprise' | 'growth' | 'startup';
  readonly status: 'active' | 'onboarding' | 'pending_review' | 'paused';
  readonly activeProjectIds: readonly ID[];
  readonly leadContact: string | { readonly name: string; readonly title: string; readonly email: string; };
  readonly contactEmail: string;
  readonly mrr: string | number;
  readonly fulfillmentHealth: 'excellent' | 'good' | 'at_risk';
  readonly recentActivity: string;
};

export type BusinessAgent = {
  readonly id: ID;
  readonly name: string;
  readonly callsign: string;
  readonly role: string;
  readonly capabilities: readonly AgentCapability[];
  readonly provider: ModelProvider;
  readonly modelName: string;
  readonly model?: string | undefined;
  readonly status: 'active' | 'idle' | 'executing' | 'blocked' | 'paused';
  readonly currentExecution?: string | undefined;
  readonly tasksCompletedToday: number;
  readonly successRate: number; // 0-100
  readonly defaultAutonomyPolicy: AutonomyPolicy;
  readonly autonomyPolicy?: AutonomyPolicy | undefined;
  readonly tools?: readonly string[] | undefined;
  readonly permissions: readonly string[];
};

export type BusinessTeamMember = {
  readonly id: ID;
  readonly name: string;
  readonly role: string;
  readonly email: string;
  readonly avatarUrl?: string | undefined;
  readonly department: string;
  readonly currentWorkload: number; // 0-100
  readonly assignedObjectives: readonly string[];
  readonly pendingApprovalsCount: number;
};

export type BusinessActivity = {
  readonly id: ID;
  readonly actorType: 'human' | 'agent' | 'system';
  readonly actorName: string;
  readonly action: string;
  readonly target: string;
  readonly trigger?: string | undefined;
  readonly outcome?: string | undefined;
  readonly timestamp: string;
  readonly severity?: ('normal' | 'warning' | 'success' | 'alert') | undefined;
};

export type BusinessEvent = {
  readonly id: ID;
  readonly type:
    | 'ClientSigned'
    | 'LeadQualified'
    | 'DeliverableApproved'
    | 'TaskCompleted'
    | 'ExecutionFailed'
    | 'ApprovalRequested'
    | 'WorkflowTriggered';
  readonly source: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly timestamp: string;
};

export type DailyFulfillmentReport = {
  readonly date: string;
  readonly overallFulfillmentRate: number; // e.g. 82
  readonly totalCompletedToday: number;
  readonly totalBlocked: number;
  readonly blockedCount?: number | undefined;
  readonly awaitingApprovalCount: number;
  readonly agentCompletedCount: number;
  readonly humanCompletedCount: number;
  readonly objectiveSummaries: readonly {
    readonly title: string;
    readonly progress: number;
    readonly status: 'on_track' | 'at_risk' | 'behind';
  }[];
  readonly objectiveProgress?: readonly {
    readonly title: string;
    readonly progress: number;
  }[] | undefined;
  readonly activeBlockers: readonly {
    readonly id: ID;
    readonly title: string;
    readonly reason: string;
    readonly resolutionAction: string;
  }[];
  readonly blockers?: readonly string[] | undefined;
  readonly recommendedActions: readonly string[];
  readonly nextActions?: readonly string[] | undefined;
};
