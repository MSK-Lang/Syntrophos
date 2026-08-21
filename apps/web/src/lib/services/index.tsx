import {
  createContext,
  useContext,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react';
import type { AuthService } from './auth.contract.ts';
import type { WorkspaceService } from './workspace.contract.ts';
import type { ChatService } from './chat.contract.ts';
import type { NotesService } from './notes.contract.ts';
import type { TasksService } from './tasks.contract.ts';
import type { SearchService } from './search.contract.ts';
import type { NotificationService } from './notifications.contract.ts';
import type { IntegrationService } from './integrations.contract.ts';
import type { AgentService } from './agents.contract.ts';
import type { ProviderService } from './providers.contract.ts';
import type { SyncService } from './sync.contract.ts';
import type { VoiceService } from './voice.contract.ts';
import type { PluginService } from './plugins.contract.ts';
import type { CalendarService } from './calendar.contract.ts';
import type { SessionInfo, User } from './auth.contract.ts';
import type { Workspace } from './workspace.contract.ts';
import type { ID, PromiseResult } from '../types.ts';
import {
  mockAgentService,
  mockAuthService,
  mockCalendarService,
  mockChatService,
  mockIntegrationService,
  mockNotesService,
  mockNotificationService,
  mockPluginService,
  mockProviderService,
  mockSearchService,
  mockSyncService,
  mockTasksService,
  mockVoiceService,
  mockWorkspaceService,
} from './mock/services.js';

export type ServiceBundle = {
  readonly auth: AuthService;
  readonly workspace: WorkspaceService;
  readonly chat: ChatService;
  readonly notes: NotesService;
  readonly tasks: TasksService;
  readonly search: SearchService;
  readonly notifications: NotificationService;
  readonly integrations: IntegrationService;
  readonly agents: AgentService;
  readonly providers: ProviderService;
  readonly sync: SyncService;
  readonly voice: VoiceService;
  readonly plugins: PluginService;
  readonly calendar: CalendarService;
};

export type AppSessionState = {
  readonly session: PromiseResult<SessionInfo>;
  readonly user: User | null;
  readonly currentWorkspace: PromiseResult<Workspace>;
  readonly setCurrentWorkspaceId: (id: ID) => Promise<void>;
  readonly refreshSession: () => Promise<void>;
};

type ServiceContextValue = ServiceBundle & AppSessionState;

const ServiceContext = createContext<ServiceContextValue | null>(null);

const MOCK_SERVICES: ServiceBundle = Object.freeze({
  auth: Object.freeze(mockAuthService),
  workspace: Object.freeze(mockWorkspaceService),
  chat: Object.freeze(mockChatService),
  notes: Object.freeze(mockNotesService),
  tasks: Object.freeze(mockTasksService),
  search: Object.freeze(mockSearchService),
  notifications: Object.freeze(mockNotificationService),
  integrations: Object.freeze(mockIntegrationService),
  agents: Object.freeze(mockAgentService),
  providers: Object.freeze(mockProviderService),
  sync: Object.freeze(mockSyncService),
  voice: Object.freeze(mockVoiceService),
  plugins: Object.freeze(mockPluginService),
  calendar: Object.freeze(mockCalendarService),
});

import { mockUser } from './mock/data.js';
import { useAuth as useSyntrophosAuth } from '../auth.js';

export function ServiceProvider({
  children,
  overrides,
}: {
  readonly children: ReactNode;
  readonly overrides?: Partial<ServiceBundle>;
}) {
  const auth = useSyntrophosAuth();
  const services = useMemo<ServiceBundle>(() => ({ ...MOCK_SERVICES, ...overrides }), [overrides]);

  const user: User | null = auth.user
    ? {
        id: auth.user.id as ID,
        email: auth.user.email,
        name: auth.user.name,
        displayName: auth.user.displayName,
        ...(auth.user.avatarUrl ? { avatarUrl: auth.user.avatarUrl } : {}),
        role: 'owner',
        emailVerified: Boolean(auth.user.emailVerified),
        preferences: mockUser.preferences,
        audit: {
          createdAt: auth.user.createdAt ?? new Date().toISOString(),
          updatedAt: auth.user.updatedAt ?? new Date().toISOString(),
        },
        lastActiveAt: new Date().toISOString(),
      }
    : null;


  const session = useMemo<PromiseResult<SessionInfo>>(() => {
    if (auth.loading) return { status: 'loading' };
    if (!auth.user || !user) return { status: 'idle' };
    return {
      status: 'success',
      data: {
        workspaceId: (auth.currentWorkspace?.id ?? 'ws-default') as ID,
        user,
        tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    };
  }, [auth.loading, auth.user, auth.currentWorkspace, user]);


  const currentWorkspace = useMemo<PromiseResult<Workspace>>(() => {
    if (auth.loading) return { status: 'loading' };
    if (!auth.currentWorkspace) return { status: 'idle' };
    return {
      status: 'success',
      data: {
        id: auth.currentWorkspace.id as ID,
        settings: {
          name: auth.currentWorkspace.name,
          description: '',
          icon: '⚡',
          defaultRole: 'member',
          allowInvites: true,
          requireTwoFactor: false,
          branding: {},
        },
        plan: (auth.currentWorkspace.subscriptionPlan || 'free') as 'free' | 'pro' | 'enterprise',
        memberCount: 1,
        storageUsedBytes: 0,
        storageLimitBytes: 10_000_000_000,
        audit: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        currentUserRole: (auth.currentWorkspace.role || 'owner') as 'owner' | 'admin' | 'member' | 'viewer',
      },
    };
  }, [auth.loading, auth.currentWorkspace]);

  const refreshSession = useCallback(async () => {
    await auth.refreshSession();
  }, [auth]);

  const setCurrentWorkspaceId = useCallback(
    async (id: ID) => {
      auth.setCurrentWorkspaceId(id);
    },
    [auth],
  );

  const value = useMemo<ServiceContextValue>(
    () => ({
      ...services,
      session,
      user,
      currentWorkspace,
      setCurrentWorkspaceId,
      refreshSession,
    }),
    [services, session, user, currentWorkspace, setCurrentWorkspaceId, refreshSession],
  );

  return <ServiceContext.Provider value={value}>{children}</ServiceContext.Provider>;
}

export function useServices(): ServiceContextValue {
  const ctx = useContext(ServiceContext);
  if (ctx === null) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return ctx;
}

export { useAuth } from '../auth.js';


export function useWorkspace(): WorkspaceService &
  Pick<AppSessionState, 'currentWorkspace' | 'setCurrentWorkspaceId'> {
  const s = useServices();
  return { ...s.workspace, currentWorkspace: s.currentWorkspace, setCurrentWorkspaceId: s.setCurrentWorkspaceId };
}

export function useChat(): ChatService {
  return useServices().chat;
}
export function useNotes(): NotesService {
  return useServices().notes;
}
export function useTasks(): TasksService {
  return useServices().tasks;
}
export function useSearch(): SearchService {
  return useServices().search;
}
export function useNotifications(): NotificationService {
  return useServices().notifications;
}
export function useIntegrations(): IntegrationService {
  return useServices().integrations;
}
export function useAgents(): AgentService {
  return useServices().agents;
}
export function useProviders(): ProviderService {
  return useServices().providers;
}
export function useSync(): SyncService {
  return useServices().sync;
}
export function useVoice(): VoiceService {
  return useServices().voice;
}
export function usePlugins(): PluginService {
  return useServices().plugins;
}
export function useCalendar(): CalendarService {
  return useServices().calendar;
}
