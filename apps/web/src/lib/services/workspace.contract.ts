import type { AuditInfo, ID, PageResult, QueryParams } from './types.js';

export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer';

export type WorkspacePlan = 'free' | 'personal' | 'pro' | 'business' | 'enterprise';

export type WorkspaceMember = {
  readonly id: ID;
  readonly userId: ID;
  readonly email: string;
  readonly name: string;
  readonly displayName: string;
  readonly avatarUrl?: string;
  readonly role: WorkspaceRole;
  readonly joinedAt: string;
  readonly lastActiveAt?: string;
  readonly invitedBy?: ID;
};

export type WorkspaceSettings = {
  readonly name: string;
  readonly description?: string;
  readonly icon?: string;
  readonly defaultRole: WorkspaceRole;
  readonly allowInvites: boolean;
  readonly requireTwoFactor: boolean;
  readonly sessionTimeoutMinutes?: number;
  readonly retentionDays?: number;
  readonly allowedDomains?: readonly string[];
  readonly branding: {
    readonly primaryColor?: string;
    readonly logoUrl?: string;
    readonly customDomain?: string;
  };
};

export type Workspace = {
  readonly id: ID;
  readonly settings: WorkspaceSettings;
  readonly plan: WorkspacePlan;
  readonly memberCount: number;
  readonly storageUsedBytes: number;
  readonly storageLimitBytes: number;
  readonly audit: AuditInfo;
  readonly currentUserRole: WorkspaceRole;
};

export type Invite = {
  readonly id: ID;
  readonly email: string;
  readonly role: WorkspaceRole;
  readonly invitedBy: string;
  readonly invitedAt: string;
  readonly expiresAt: string;
  readonly accepted: boolean;
};

export interface WorkspaceService {
  readonly list: (params?: QueryParams) => Promise<PageResult<Workspace>>;
  readonly get: (id: ID) => Promise<Workspace>;
  readonly getCurrent: () => Promise<Workspace>;
  readonly switchTo: (id: ID) => Promise<Workspace>;
  readonly create: (data: Readonly<Pick<WorkspaceSettings, 'name' | 'description' | 'icon'>>) => Promise<Workspace>;
  readonly update: (id: ID, patch: Readonly<Partial<WorkspaceSettings>>) => Promise<Workspace>;
  readonly delete: (id: ID) => Promise<void>;
  readonly listMembers: (workspaceId: ID, params?: QueryParams) => Promise<PageResult<WorkspaceMember>>;
  readonly updateMemberRole: (workspaceId: ID, memberId: ID, role: WorkspaceRole) => Promise<WorkspaceMember>;
  readonly removeMember: (workspaceId: ID, memberId: ID) => Promise<void>;
  readonly inviteMember: (workspaceId: ID, email: string, role: WorkspaceRole) => Promise<Invite>;
  readonly listInvites: (workspaceId: ID) => Promise<readonly Invite[]>;
  readonly revokeInvite: (workspaceId: ID, inviteId: ID) => Promise<void>;
}
