import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
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

export function ServiceProvider({
  children,
  overrides,
}: {
  readonly children: ReactNode;
  readonly overrides?: Partial<ServiceBundle>;
}) {
  const services = useMemo<ServiceBundle>(() => ({ ...MOCK_SERVICES, ...overrides }), [overrides]);

  const [session, setSession] = useState<PromiseResult<SessionInfo>>({ status: 'loading' });
  const [currentWorkspace, setCurrentWorkspace] = useState<PromiseResult<Workspace>>({ status: 'loading' });

  const user: User | null = session.status === 'success' ? session.data.user : null;

  const loadInitial = useCallback(async () => {
    try {
      const s = await services.auth.getCurrentSession();
      setSession(s ? { status: 'success', data: s } : { status: 'idle' });
      try {
        const ws = await services.workspace.getCurrent();
        setCurrentWorkspace({ status: 'success', data: ws });
      } catch (err) {
        setCurrentWorkspace({ status: 'error', error: err instanceof Error ? err : new Error(String(err)) });
      }
    } catch (err) {
      setSession({ status: 'error', error: err instanceof Error ? err : new Error(String(err)) });
    }
  }, [services]);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  const refreshSession = useCallback(async () => {
    setSession({ status: 'loading' });
    setCurrentWorkspace({ status: 'loading' });
    await loadInitial();
  }, [loadInitial]);

  const setCurrentWorkspaceId = useCallback(
    async (id: ID) => {
      setCurrentWorkspace({ status: 'loading' });
      try {
        const ws = await services.workspace.switchTo(id);
        setCurrentWorkspace({ status: 'success', data: ws });
      } catch (err) {
        setCurrentWorkspace({
          status: 'error',
          error: err instanceof Error ? err : new Error(String(err)),
        });
      }
    },
    [services],
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

export function useAuth(): AuthService & Pick<AppSessionState, 'session' | 'user' | 'refreshSession'> {
  const s = useServices();
  return { ...s.auth, session: s.session, user: s.user, refreshSession: s.refreshSession };
}

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
