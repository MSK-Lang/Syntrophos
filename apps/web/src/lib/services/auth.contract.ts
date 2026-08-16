import type { AuditInfo, ID, PageResult, QueryParams, Timestamp } from './types.js';

export type UserRole = 'owner' | 'admin' | 'member' | 'viewer' | 'guest';

export type UserPreferences = {
  readonly theme: 'light' | 'dark' | 'system';
  readonly language: string;
  readonly timezone: string;
  readonly dateFormat: string;
  readonly timeFormat: string;
  readonly compactMode: boolean;
  readonly reducedMotion: boolean;
  readonly notifications: {
    readonly email: boolean;
    readonly inApp: boolean;
    readonly desktop: boolean;
    readonly soundEnabled: boolean;
    readonly weeklyDigest: boolean;
  };
  readonly voice: {
    readonly enabled: boolean;
    readonly inputLocale: string;
    readonly outputVoiceId?: string;
    readonly autoPlayResponses: boolean;
  };
  readonly ai: {
    readonly defaultProviderId?: ID;
    readonly defaultModelId?: ID;
    readonly autoSuggestions: boolean;
    readonly streaming: boolean;
    readonly temperature: number;
  };
  readonly obsidian: {
    readonly vaultPath?: string;
    readonly autoSync: boolean;
    readonly syncIntervalMinutes: number;
    readonly conflictStrategy: 'manual' | 'keepVault' | 'keepRemote' | 'merge';
  };
};

export type User = {
  readonly id: ID;
  readonly email: string;
  readonly name: string;
  readonly displayName: string;
  readonly avatarUrl?: string;
  readonly role: UserRole;
  readonly emailVerified: boolean;
  readonly preferences: UserPreferences;
  readonly audit: AuditInfo;
  readonly lastActiveAt: Timestamp;
};

export type SessionInfo = {
  readonly user: User;
  readonly tokenExpiresAt: Timestamp;
  readonly workspaceId: ID;
};

export type SignInCredentials = {
  readonly email: string;
  readonly password: string;
  readonly rememberMe?: boolean;
};

export type SignUpData = {
  readonly email: string;
  readonly password: string;
  readonly name: string;
  readonly inviteToken?: string;
};

export interface AuthService {
  readonly getCurrentSession: () => Promise<SessionInfo | null>;
  readonly signIn: (credentials: SignInCredentials) => Promise<SessionInfo>;
  readonly signUp: (data: SignUpData) => Promise<SessionInfo>;
  readonly signOut: () => Promise<void>;
  readonly requestPasswordReset: (email: string) => Promise<void>;
  readonly confirmPasswordReset: (token: string, newPassword: string) => Promise<void>;
  readonly changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  readonly updateCurrentUser: (patch: Readonly<Partial<Pick<User, 'name' | 'displayName' | 'avatarUrl'>>>) => Promise<User>;
  readonly updatePreferences: (patch: Readonly<Partial<UserPreferences>>) => Promise<UserPreferences>;
}
