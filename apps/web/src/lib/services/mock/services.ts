import type { AuthService, SessionInfo, SignInCredentials, SignUpData, User, UserPreferences } from '../auth.contract.js';
import type { Workspace, WorkspaceMember, WorkspaceService, Invite, WorkspaceRole, WorkspaceSettings } from '../workspace.contract.js';
import type { ChatMessage, ChatService, Conversation } from '../chat.contract.js';
import type { NotesService, Note } from '../notes.contract.js';
import type { TasksService, Task, Project, Section } from '../tasks.contract.js';
import type { SearchHit, SearchScope, SearchService, SearchSuggestion } from '../search.contract.js';
import type { Notification, NotificationOrigin, NotificationPreference, NotificationService } from '../notifications.contract.js';
import type { Integration, IntegrationConnection, IntegrationService } from '../integrations.contract.js';
import type { Agent, AgentRun, AgentService, Workflow } from '../agents.contract.js';
import type { Provider, ProviderService, ProviderUsageStats, Model, ProviderStatus } from '../providers.contract.js';
import type { SyncConflict, SyncEvent, SyncService, SyncState } from '../sync.contract.js';
import type { VoiceCapabilities, VoiceService, VoiceState, VoiceTranscript, Utterance } from '../voice.contract.js';
import type { Plugin, PluginService, RegistryPlugin } from '../plugins.contract.js';
import type { Calendar, CalendarEvent, CalendarService } from '../calendar.contract.js';
import { delay, type ID, type PageResult, type QueryParams } from '../types.js';
import {
  mockAgents,
  mockAgentRuns,
  mockCalendarEvents,
  mockCalendars,
  mockConnections,
  mockConversations,
  mockIntegrations,
  mockMessages,
  mockNotes,
  mockNotifications,
  mockPlugins,
  mockProjects,
  mockProviders,
  mockRegistryPlugins,
  mockSearchHits,
  mockSections,
  mockSession,
  mockTasks,
  mockUser,
  mockWorkflows,
  mockWorkspaceMembers,
  mockWorkspaces,
  paginate,
} from './data.js';

/* ─────────────────────────────────────────────────────────────────────────────
 *  MOCK HELPERS
 * ──────────────────────────────────────────────────────────────────────────── */

const LATENCY = { fast: 120, normal: 280, slow: 600 } as const;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/* ─────────────────────────────────────────────────────────────────────────────
 *  AUTH
 * ──────────────────────────────────────────────────────────────────────────── */

export const mockAuthService: AuthService = {
  async getCurrentSession(): Promise<SessionInfo | null> {
    await delay(null, LATENCY.fast);
    return clone(mockSession);
  },
  async signIn(_credentials: SignInCredentials): Promise<SessionInfo> {
    await delay(null, LATENCY.normal);
    return clone(mockSession);
  },
  async signUp(_data: SignUpData): Promise<SessionInfo> {
    await delay(null, LATENCY.normal);
    return clone(mockSession);
  },
  async signOut(): Promise<void> {
    await delay(null, LATENCY.fast);
  },
  async requestPasswordReset(_email: string): Promise<void> {
    await delay(null, LATENCY.fast);
  },
  async confirmPasswordReset(_token: string, _newPassword: string): Promise<void> {
    await delay(null, LATENCY.fast);
  },
  async changePassword(_oldPassword: string, _newPassword: string): Promise<void> {
    await delay(null, LATENCY.fast);
  },
  async updateCurrentUser(patch): Promise<User> {
    await delay(null, LATENCY.fast);
    return { ...clone(mockUser), ...patch, name: patch.name ?? mockUser.name };
  },
  async updatePreferences(patch: Partial<UserPreferences>): Promise<UserPreferences> {
    await delay(null, LATENCY.fast);
    const next = { ...clone(mockUser.preferences), ...patch } as UserPreferences;
    return next;
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
 *  WORKSPACES
 * ──────────────────────────────────────────────────────────────────────────── */

let currentWorkspaceId: ID = mockSession.workspaceId;

export const mockWorkspaceService: WorkspaceService = {
  async list(params): Promise<PageResult<Workspace>> {
    await delay(null, LATENCY.fast);
    return paginate(mockWorkspaces, params);
  },
  async get(id: ID): Promise<Workspace> {
    await delay(null, LATENCY.fast);
    const ws = mockWorkspaces.find((w) => w.id === id);
    if (!ws) throw new Error('Workspace not found');
    return clone(ws);
  },
  async getCurrent(): Promise<Workspace> {
    await delay(null, LATENCY.fast);
    const ws = mockWorkspaces.find((w) => w.id === currentWorkspaceId) ?? mockWorkspaces[0];
    return clone(ws)!;
  },
  async switchTo(id: ID): Promise<Workspace> {
    await delay(null, LATENCY.fast);
    const ws = mockWorkspaces.find((w) => w.id === id);
    if (!ws) throw new Error('Workspace not found');
    currentWorkspaceId = id;
    return clone(ws);
  },
  async create(data): Promise<Workspace> {
    await delay(null, LATENCY.normal);
    const id = `ws-new-${Date.now()}` as ID;
    return {
      id,
      settings: {
        name: data.name,
        description: data.description,
        icon: data.icon,
        defaultRole: 'member' as WorkspaceRole,
        allowInvites: false,
        requireTwoFactor: false,
        branding: {},
      },
      plan: 'free',
      memberCount: 1,
      storageUsedBytes: 0,
      storageLimitBytes: 1_000_000_000,
      audit: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      currentUserRole: 'owner' as WorkspaceRole,
    } as unknown as Workspace;
  },
  async update(id: ID, patch: Partial<WorkspaceSettings>): Promise<Workspace> {
    await delay(null, LATENCY.fast);
    const ws = mockWorkspaces.find((w) => w.id === id);
    if (!ws) throw new Error('Workspace not found');
    return { ...clone(ws), settings: { ...clone(ws.settings), ...patch } };
  },
  async delete(_id: ID): Promise<void> {
    await delay(null, LATENCY.fast);
  },
  async listMembers(workspaceId: ID, params): Promise<PageResult<WorkspaceMember>> {
    await delay(null, LATENCY.fast);
    void workspaceId;
    return paginate(mockWorkspaceMembers, params);
  },
  async updateMemberRole(_workspaceId: ID, memberId: ID, role: WorkspaceRole): Promise<WorkspaceMember> {
    await delay(null, LATENCY.fast);
    const m = mockWorkspaceMembers.find((x) => x.id === memberId);
    if (!m) throw new Error('Member not found');
    return { ...clone(m), role };
  },
  async removeMember(_workspaceId: ID, _memberId: ID): Promise<void> {
    await delay(null, LATENCY.fast);
  },
  async inviteMember(_workspaceId: ID, email: string, role: WorkspaceRole): Promise<Invite> {
    await delay(null, LATENCY.normal);
    return {
      id: `inv-${Date.now()}` as ID,
      email,
      role,
      invitedBy: mockUser.id,
      invitedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      accepted: false,
    };
  },
  async listInvites(_workspaceId: ID): Promise<readonly Invite[]> {
    await delay(null, LATENCY.fast);
    return [];
  },
  async revokeInvite(_workspaceId: ID, _inviteId: ID): Promise<void> {
    await delay(null, LATENCY.fast);
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
 *  CHAT
 * ──────────────────────────────────────────────────────────────────────────── */

export const mockChatService: ChatService = {
  async listConversations(params): Promise<PageResult<Conversation>> {
    await delay(null, LATENCY.fast);
    return paginate(mockConversations, params);
  },
  async getConversation(id: ID): Promise<Conversation> {
    await delay(null, LATENCY.fast);
    const c = mockConversations.find((x) => x.id === id);
    if (!c) throw new Error('Conversation not found');
    return clone(c);
  },
  async createConversation(data): Promise<Conversation> {
    await delay(null, LATENCY.fast);
    const id = `conv-${Date.now()}` as ID;
    return {
      id,
      workspaceId: mockSession.workspaceId,
      title: data.title ?? 'New conversation',
      preview: '',
      status: 'active',
      tags: [],
      agentIds: data.agentIds ?? [],
      messageCount: 0,
      lastMessageAt: new Date().toISOString(),
      audit: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    };
  },
  async updateConversation(id: ID, patch): Promise<Conversation> {
    await delay(null, LATENCY.fast);
    const c = mockConversations.find((x) => x.id === id);
    if (!c) throw new Error('Conversation not found');
    return { ...clone(c), ...patch };
  },
  async deleteConversation(_id: ID): Promise<void> {
    await delay(null, LATENCY.fast);
  },
  async listMessages(conversationId: ID, params): Promise<PageResult<ChatMessage>> {
    await delay(null, LATENCY.fast);
    const msgs = mockMessages.filter((m) => m.conversationId === conversationId);
    return paginate(msgs, params);
  },
  async sendMessage(data): Promise<ChatMessage> {
    await delay(null, LATENCY.slow);
    const userMsg = {
      id: `msg-u-${Date.now()}` as ID,
      conversationId: data.conversationId,
      role: 'user',
      content: data.content,
      attachments: data.attachments,
      audit: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    } as unknown as ChatMessage;
    void userMsg;
    const reply: ChatMessage = {
      id: `msg-a-${Date.now()}` as ID,
      conversationId: data.conversationId,
      role: 'assistant',
      content:
        "This is a mocked reply. In production the AI engine will reason over the user's message and the retrieved memory context, optionally invoke tools, and stream tokens back as they become available.",
      model: data.overrides?.model ?? 'gpt-4o',
      providerId: data.overrides?.providerId ?? ('prov-openai' as ID),
      tokens: { input: 1200 + data.content.length, output: 80 },
      latencyMs: 720,
      rating: 0,
      audit: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    };
    return reply;
  },
  streamMessage(data, handlers) {
    const full =
      "This is a streamed mock reply. Each token delta arrives individually. In production, this comes from the model's streaming API. The UI can render deltas as they arrive.";
    let i = 0;
    let stopped = false;
    void Promise.resolve().then(async () => {
      await delay(null, 160);
      while (i < full.length && !stopped) {
        const chunk = full.slice(i, i + 3);
        i += chunk.length;
        handlers.onDelta(chunk);
        await delay(null, 8);
      }
      if (!stopped) {
        handlers.onComplete({
          id: `msg-a-${Date.now()}` as ID,
          conversationId: data.conversationId,
          role: 'assistant',
          content: full,
          model: 'gpt-4o',
          providerId: 'prov-openai' as ID,
          tokens: { input: 800, output: full.length },
          audit: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        });
      }
    });
    return () => {
      stopped = true;
    };
  },
  async editMessage(id: ID, content: string): Promise<ChatMessage> {
    await delay(null, LATENCY.fast);
    const m = mockMessages.find((x) => x.id === id);
    if (!m) throw new Error('Message not found');
    return { ...clone(m), content, edited: true };
  },
  async deleteMessage(_id: ID): Promise<void> {
    await delay(null, LATENCY.fast);
  },
  async rateMessage(_id: ID, _rating: -1 | 0 | 1): Promise<void> {
    await delay(null, LATENCY.fast);
  },
  async regenerate(messageId: ID): Promise<ChatMessage> {
    await delay(null, LATENCY.slow);
    const original = mockMessages.find((x) => x.id === messageId);
    return {
      id: `msg-r-${Date.now()}` as ID,
      conversationId: original?.conversationId ?? ('conv-1' as ID),
      role: 'assistant',
      content: 'Regenerated version of the reply. Would sample new tokens from the provider.',
      audit: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    };
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
 *  NOTES
 * ──────────────────────────────────────────────────────────────────────────── */

export const mockNotesService: NotesService = {
  async list(params): Promise<PageResult<Note>> {
    await delay(null, LATENCY.fast);
    return paginate(mockNotes, params);
  },
  async get(id: ID): Promise<Note> {
    await delay(null, LATENCY.fast);
    const n = mockNotes.find((x) => x.id === id);
    if (!n) throw new Error('Note not found');
    return clone(n);
  },
  async getByPath(path: string): Promise<Note> {
    await delay(null, LATENCY.fast);
    const n = mockNotes.find((x) => x.path === path);
    if (!n) throw new Error('Note not found');
    return clone(n);
  },
  async create(data): Promise<Note> {
    await delay(null, LATENCY.normal);
    const id = `note-${Date.now()}` as ID;
    return {
      id,
      workspaceId: mockSession.workspaceId,
      path: data.path,
      title: data.title,
      content: data.content ?? `# ${data.title}`,
      excerpt: (data.content ?? '').slice(0, 160),
      wordCount: (data.content ?? '').split(/\s+/).filter(Boolean).length,
      frontmatter: data.frontmatter ?? {},
      tags: data.frontmatter?.tags ?? [],
      links: [],
      backlinkCount: 0,
      sizeBytes: new Blob([data.content ?? '']).size,
      checksum: `sha256:${Math.random().toString(36).slice(2)}`,
      audit: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      lastOpenedAt: new Date().toISOString(),
      syncStatus: 'modified-local',
    };
  },
  async update(id: ID, patch): Promise<Note> {
    await delay(null, LATENCY.fast);
    const n = mockNotes.find((x) => x.id === id);
    if (!n) throw new Error('Note not found');
    return {
      ...clone(n),
      ...patch,
      frontmatter: { ...clone(n.frontmatter), ...patch.frontmatter },
      audit: { ...n.audit, updatedAt: new Date().toISOString() },
    };
  },
  async delete(_id: ID): Promise<void> {
    await delay(null, LATENCY.fast);
  },
  async move(id: ID, newPath: string): Promise<Note> {
    await delay(null, LATENCY.fast);
    const n = mockNotes.find((x) => x.id === id);
    if (!n) throw new Error('Note not found');
    return { ...clone(n), path: newPath };
  },
  async listFolders() {
    await delay(null, LATENCY.fast);
    return {
      id: 'root' as ID,
      name: 'Vault',
      path: '/',
      noteCount: mockNotes.length,
      children: [
        {
          id: 'f-strategy' as ID,
          name: 'Strategy',
          path: 'Strategy/',
          noteCount: 2,
          children: [],
        },
        {
          id: 'f-journal' as ID,
          name: 'Journal',
          path: 'Journal/',
          noteCount: 1,
          children: [
            {
              id: 'f-daily' as ID,
              name: 'Daily',
              path: 'Journal/Daily/',
              noteCount: 1,
              children: [],
            },
          ],
        },
        {
          id: 'f-research' as ID,
          name: 'Research',
          path: 'Research/',
          noteCount: 1,
          children: [],
        },
        {
          id: 'f-personal' as ID,
          name: 'Personal',
          path: 'Personal/',
          noteCount: 1,
          children: [
            {
              id: 'f-recipes' as ID,
              name: 'Recipes',
              path: 'Personal/Recipes/',
              noteCount: 1,
              children: [],
            },
          ],
        },
      ],
    };
  },
  async listTags(params?: QueryParams) {
    await delay(null, LATENCY.fast);
    const counts = new Map<string, number>();
    for (const n of mockNotes) for (const t of n.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    const arr = [...counts.entries()].map(([tag, count]) => ({ tag, count }));
    return paginate(arr, params);
  },
  async getBacklinks(id: ID): Promise<readonly Note[]> {
    await delay(null, LATENCY.fast);
    void id;
    return mockNotes.slice(0, 2).map(clone);
  },
  async getDailyNote(date?: string): Promise<Note> {
    await delay(null, LATENCY.fast);
    const d = date ? new Date(date) : new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${dd}`;
    return (
      mockNotes.find((n) => n.path.includes(key)) ?? {
        ...clone(mockNotes[2])!,
        id: `note-daily-${key}` as ID,
        path: `Journal/Daily/${key}.md`,
        title: key,
        frontmatter: {
          date: d.toISOString(),
          type: 'journal',
          tags: ['journal', 'daily'],
        },
      }
    );
  },
  async syncNow() {
    await delay(null, LATENCY.slow);
    return { updated: 12, conflicts: 2 };
  },
  async getSyncStatus() {
    await delay(null, LATENCY.fast);
    return {
      lastSyncAt: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
      pendingLocal: 3,
      pendingRemote: 2,
      conflicts: 2,
    };
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
 *  TASKS
 * ──────────────────────────────────────────────────────────────────────────── */

export const mockTasksService: TasksService = {
  async list(params) {
    await delay(null, LATENCY.fast);
    return paginate(mockTasks, params);
  },
  async listTasks(params): Promise<PageResult<Task>> {
    await delay(null, LATENCY.fast);
    return paginate(mockTasks, params);
  },
  async getTask(id: ID): Promise<Task> {
    await delay(null, LATENCY.fast);
    const t = mockTasks.find((x) => x.id === id);
    if (!t) throw new Error('Task not found');
    return clone(t);
  },
  async createTask(data): Promise<Task> {
    await delay(null, LATENCY.normal);
    return {
      id: `task-${Date.now()}` as ID,
      workspaceId: mockSession.workspaceId,
      title: data.title,
      description: data.description,
      projectId: data.projectId,
      sectionId: data.sectionId,
      status: data.status ?? 'todo',
      priority: data.priority ?? 'no-priority',
      assigneeIds: data.assigneeIds ?? [],
      dueDate: data.dueDate,
      dueTime: data.dueTime,
      recurrence: data.recurrence,
      tags: data.tags ?? [],
      noteId: data.noteId,
      subtaskIds: [],
      parentTaskId: data.parentTaskId,
      order: mockTasks.length,
      estimatedMinutes: data.estimatedMinutes,
      audit: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    } as unknown as Task;
  },
  async updateTask(id: ID, patch): Promise<Task> {
    await delay(null, LATENCY.fast);
    const t = mockTasks.find((x) => x.id === id);
    if (!t) throw new Error('Task not found');
    return { ...clone(t), ...patch };
  },
  async deleteTask(_id: ID): Promise<void> {
    await delay(null, LATENCY.fast);
  },
  async reorderTasks(_ids: readonly ID[]): Promise<void> {
    await delay(null, LATENCY.fast);
  },
  async listProjects(params): Promise<PageResult<Project>> {
    await delay(null, LATENCY.fast);
    return paginate(mockProjects, params);
  },
  async getProject(id: ID): Promise<Project> {
    await delay(null, LATENCY.fast);
    const p = mockProjects.find((x) => x.id === id);
    if (!p) throw new Error('Project not found');
    return clone(p);
  },
  async createProject(data): Promise<Project> {
    await delay(null, LATENCY.normal);
    return {
      id: `proj-${Date.now()}` as ID,
      workspaceId: mockSession.workspaceId,
      name: data.name,
      description: data.description,
      color: data.color,
      icon: data.icon,
      status: 'active',
      defaultView: 'board',
      memberIds: [mockUser.id],
      progress: { total: 0, completed: 0 },
      audit: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    } as unknown as Project;
  },
  async updateProject(id: ID, patch): Promise<Project> {
    await delay(null, LATENCY.fast);
    const p = mockProjects.find((x) => x.id === id);
    if (!p) throw new Error('Project not found');
    return { ...clone(p), ...patch };
  },
  async deleteProject(_id: ID): Promise<void> {
    await delay(null, LATENCY.fast);
  },
  async listSections(projectId: ID): Promise<readonly Section[]> {
    await delay(null, LATENCY.fast);
    return mockSections.filter((s) => s.projectId === projectId).map(clone);
  },
  async createSection(projectId: ID, name: string): Promise<Section> {
    await delay(null, LATENCY.normal);
    return {
      id: `sec-${Date.now()}` as ID,
      projectId,
      name,
      order: mockSections.length,
      isDefault: false,
      audit: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    };
  },
  async updateSection(id: ID, patch): Promise<Section> {
    await delay(null, LATENCY.fast);
    const s = mockSections.find((x) => x.id === id);
    if (!s) throw new Error('Section not found');
    return { ...clone(s), ...patch };
  },
  async deleteSection(_id: ID): Promise<void> {
    await delay(null, LATENCY.fast);
  },
  async getUpcoming(windowDays: number): Promise<PageResult<Task>> {
    await delay(null, LATENCY.fast);
    const now = Date.now();
    const future = mockTasks.filter((t) => {
      if (!t.dueDate || t.status === 'done' || t.status === 'cancelled') return false;
      const due = new Date(t.dueDate).getTime();
      return due >= now && due <= now + windowDays * 24 * 60 * 60 * 1000;
    });
    return paginate(future);
  },
  async getToday(): Promise<PageResult<Task>> {
    await delay(null, LATENCY.fast);
    const todayStr = new Date().toISOString().slice(0, 10);
    return paginate(
      mockTasks.filter((t) => {
        if (t.status === 'done' || t.status === 'cancelled' || !t.dueDate) return false;
        return t.dueDate.slice(0, 10) === todayStr;
      }),
    );
  },
  async getOverdue(): Promise<PageResult<Task>> {
    await delay(null, LATENCY.fast);
    const todayStr = new Date().toISOString().slice(0, 10);
    return paginate(
      mockTasks.filter((t) => {
        if (t.status === 'done' || t.status === 'cancelled' || !t.dueDate) return false;
        return t.dueDate.slice(0, 10) < todayStr;
      }),
    );
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
 *  SEARCH
 * ──────────────────────────────────────────────────────────────────────────── */

export const mockSearchService: SearchService = {
  async query(query, options) {
    await delay(null, LATENCY.normal);
    const q = query.trim().toLowerCase();
    const start = performance.now();
    const fromNotes = mockNotes
      .filter((n) => !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
      .map<SearchHit>((n) => ({
        id: n.id,
        type: 'note',
        title: n.title,
        snippet: n.excerpt,
        path: n.path,
        score: 0.95,
        updatedAt: n.audit.updatedAt,
        url: `/notes/${encodeURIComponent(n.path)}`,
      }));
    const fromTasks = mockTasks
      .filter((t) => !q || t.title.toLowerCase().includes(q))
      .map<SearchHit>((t) => ({
        id: t.id,
        type: 'task',
        title: t.title,
        snippet: t.description ?? '',
        score: 0.9,
        updatedAt: t.audit.updatedAt,
        url: `/tasks/${t.id}`,
      }));
    void options;
    const items = [...fromNotes, ...fromTasks].slice(0, options?.limit ?? 20);
    return { items, total: items.length, latencyMs: Math.round(performance.now() - start) };
  },
  async suggest(query): Promise<readonly SearchSuggestion[]> {
    await delay(null, LATENCY.fast);
    const q = query.trim().toLowerCase();
    const suggestions: SearchSuggestion[] = [];
    for (const n of mockNotes) {
      if (n.title.toLowerCase().includes(q)) {
        suggestions.push({ text: n.title, type: 'entity' });
      }
    }
    if (query.startsWith('#')) suggestions.push({ text: query, type: 'filter' });
    if (suggestions.length < 5) suggestions.push({ text: query, type: 'query' });
    return suggestions.slice(0, 8);
  },
  async getRecent(limit = 10): Promise<readonly SearchHit[]> {
    await delay(null, LATENCY.fast);
    return mockSearchHits.slice(0, limit);
  },
  async clearRecent(): Promise<void> {
    await delay(null, LATENCY.fast);
  },
  async rebuildIndex() {
    await delay(null, LATENCY.slow * 2);
    return { indexed: mockNotes.length + mockTasks.length, durationMs: 1200 };
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
 *  NOTIFICATIONS
 * ──────────────────────────────────────────────────────────────────────────── */

let unreadNotifications = new Set(mockNotifications.filter((n) => !n.readAt).map((n) => n.id));

export const mockNotificationService: NotificationService = {
  async list(params): Promise<PageResult<Notification>> {
    await delay(null, LATENCY.fast);
    const items = mockNotifications.filter((n) => {
      if (params?.unreadOnly && n.readAt) return false;
      if (params?.includeArchived === false && n.archivedAt) return false;
      return true;
    });
    return paginate(items, params);
  },
  async get(id: ID): Promise<Notification> {
    await delay(null, LATENCY.fast);
    const n = mockNotifications.find((x) => x.id === id);
    if (!n) throw new Error('Notification not found');
    return clone(n);
  },
  async markRead(id: ID): Promise<Notification> {
    await delay(null, LATENCY.fast);
    const n = mockNotifications.find((x) => x.id === id);
    if (!n) throw new Error('Notification not found');
    unreadNotifications.delete(id);
    return { ...clone(n), readAt: new Date().toISOString() };
  },
  async markAllRead(): Promise<{ readonly updated: number }> {
    await delay(null, LATENCY.fast);
    const updated = unreadNotifications.size;
    unreadNotifications = new Set();
    return { updated };
  },
  async archive(_id: ID): Promise<void> {
    await delay(null, LATENCY.fast);
  },
  async unarchive(_id: ID): Promise<void> {
    await delay(null, LATENCY.fast);
  },
  async clearAll(): Promise<void> {
    await delay(null, LATENCY.fast);
  },
  async getUnreadCount(): Promise<number> {
    await delay(null, LATENCY.fast / 2);
    return unreadNotifications.size;
  },
  subscribe(_onNotification) {
    return () => {};
  },
  async listPreferences(): Promise<readonly NotificationPreference[]> {
    await delay(null, LATENCY.fast);
    const origins: NotificationOrigin[] = [
      'chat',
      'tasks',
      'notes',
      'sync',
      'agent',
      'workspace',
      'system',
      'integration',
    ];
    return origins.map((origin) => ({
      origin,
      inApp: true,
      email: origin === 'agent' || origin === 'system',
      desktop: origin !== 'system',
      minCategory: origin === 'sync' ? 'warning' : 'info',
    }));
  },
  async updatePreference(pref: NotificationPreference): Promise<NotificationPreference> {
    await delay(null, LATENCY.fast);
    return clone(pref);
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
 *  INTEGRATIONS
 * ──────────────────────────────────────────────────────────────────────────── */

export const mockIntegrationService: IntegrationService = {
  async listAvailable(params): Promise<PageResult<Integration>> {
    await delay(null, LATENCY.fast);
    return paginate(mockIntegrations, params);
  },
  async get(id: ID): Promise<Integration> {
    await delay(null, LATENCY.fast);
    const i = mockIntegrations.find((x) => x.id === id);
    if (!i) throw new Error('Integration not found');
    return clone(i);
  },
  async listConnections(params): Promise<PageResult<IntegrationConnection>> {
    await delay(null, LATENCY.fast);
    return paginate(mockConnections, params);
  },
  async getConnection(id: ID): Promise<IntegrationConnection> {
    await delay(null, LATENCY.fast);
    const c = mockConnections.find((x) => x.id === id);
    if (!c) throw new Error('Connection not found');
    return clone(c);
  },
  async beginConnect(integrationId: ID) {
    await delay(null, LATENCY.fast);
    const i = mockIntegrations.find((x) => x.id === integrationId);
    if (!i) throw new Error('Integration not found');
    if (i.authFlow === 'api-key') {
      return {
        flow: i.authFlow,
        requiresInput: true,
        fields: [
          { name: 'apiKey', label: 'API key', type: 'password' as const, placeholder: 'sk-...' },
          { name: 'baseUrl', label: 'Base URL (optional)', type: 'text' as const, placeholder: 'https://api.example.com' },
        ],
      };
    }
    return { flow: i.authFlow, authUrl: `https://example.com/oauth/authorize?state=${integrationId}`, requiresInput: false };
  },
  async completeConnect(integrationId: ID): Promise<IntegrationConnection> {
    await delay(null, LATENCY.normal);
    const integration = mockIntegrations.find((i) => i.id === integrationId);
    return {
      id: `conn-${Date.now()}` as ID,
      integrationId,
      integrationCode: integration?.code ?? 'unknown',
      connectedAt: new Date().toISOString(),
      scopes: integration?.capabilities ?? [],
      enabled: true,
      workspaceId: mockSession.workspaceId,
      audit: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    };
  },
  async disconnect(_connectionId: ID): Promise<void> {
    await delay(null, LATENCY.fast);
  },
  async toggleEnabled(connectionId: ID, enabled: boolean): Promise<IntegrationConnection> {
    await delay(null, LATENCY.fast);
    const c = mockConnections.find((x) => x.id === connectionId);
    if (!c) throw new Error('Connection not found');
    return { ...clone(c), enabled };
  },
  async triggerSync(connectionId: ID) {
    await delay(null, LATENCY.normal);
    return {
      id: `evt-${Date.now()}` as ID,
      connectionId,
      eventType: 'sync.trigger',
      status: 'running' as const,
      summary: 'Synchronizing…',
      startedAt: new Date().toISOString(),
    };
  },
  async listEvents(_connectionId: ID, params): Promise<PageResult<{ id: ID; connectionId: ID; eventType: string; status: 'success' | 'error' | 'running'; summary: string; startedAt: string; completedAt?: string; itemsProcessed?: number; errorMessage?: string }>> {
    await delay(null, LATENCY.fast);
    return paginate([], params);
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
 *  AGENTS
 * ──────────────────────────────────────────────────────────────────────────── */

export const mockAgentService: AgentService = {
  async list(params): Promise<PageResult<Agent>> {
    await delay(null, LATENCY.fast);
    return paginate(mockAgents, params);
  },
  async get(id: ID): Promise<Agent> {
    await delay(null, LATENCY.fast);
    const a = mockAgents.find((x) => x.id === id);
    if (!a) throw new Error('Agent not found');
    return clone(a);
  },
  async create(data): Promise<Agent> {
    await delay(null, LATENCY.normal);
    return {
      id: `agent-${Date.now()}` as ID,
      workspaceId: mockSession.workspaceId,
      code: data.code ?? data.name.toLowerCase().replace(/\W+/g, '-'),
      name: data.name,
      description: data.description ?? '',
      type: data.type ?? 'custom',
      status: 'available',
      systemPrompt: data.systemPrompt,
      providerId: data.providerId,
      defaultModel: data.defaultModel,
      temperature: data.temperature ?? 0.5,
      topP: data.topP ?? 0.95,
      maxTokens: data.maxTokens,
      toolIds: data.toolIds ?? [],
      capabilities: [],
      collaborator: data.collaborator ?? false,
      audit: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    } as unknown as Agent;
  },
  async update(id: ID, patch): Promise<Agent> {
    await delay(null, LATENCY.fast);
    const a = mockAgents.find((x) => x.id === id);
    if (!a) throw new Error('Agent not found');
    return { ...clone(a), ...patch };
  },
  async delete(_id: ID): Promise<void> {
    await delay(null, LATENCY.fast);
  },
  async listRuns(params): Promise<PageResult<AgentRun>> {
    await delay(null, LATENCY.fast);
    const items = params?.agentId ? mockAgentRuns.filter((r) => r.agentId === params.agentId) : mockAgentRuns;
    return paginate(items, params);
  },
  async getRun(id: ID): Promise<AgentRun> {
    await delay(null, LATENCY.fast);
    const r = mockAgentRuns.find((x) => x.id === id);
    if (!r) throw new Error('Run not found');
    return clone(r);
  },
  async cancelRun(_id: ID): Promise<void> {
    await delay(null, LATENCY.fast);
  },
  subscribeToRun(_runId, _onUpdate) {
    return () => {};
  },
  async listWorkflows(params): Promise<PageResult<Workflow>> {
    await delay(null, LATENCY.fast);
    return paginate(mockWorkflows, params);
  },
  async getWorkflow(id: ID): Promise<Workflow> {
    await delay(null, LATENCY.fast);
    const w = mockWorkflows.find((x) => x.id === id);
    if (!w) throw new Error('Workflow not found');
    return clone(w);
  },
  async createWorkflow(data): Promise<Workflow> {
    await delay(null, LATENCY.normal);
    return {
      id: `wf-${Date.now()}` as ID,
      ...data,
      audit: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    };
  },
  async updateWorkflow(id: ID, patch): Promise<Workflow> {
    await delay(null, LATENCY.fast);
    const w = mockWorkflows.find((x) => x.id === id);
    if (!w) throw new Error('Workflow not found');
    return { ...clone(w), ...patch };
  },
  async deleteWorkflow(_id: ID): Promise<void> {
    await delay(null, LATENCY.fast);
  },
  async runWorkflow(id: ID): Promise<AgentRun> {
    await delay(null, LATENCY.normal);
    return {
      id: `run-${Date.now()}` as ID,
      agentId: 'agent-memory' as ID,
      taskTitle: `Workflow run: ${id}`,
      status: 'queued',
      startedAt: new Date().toISOString(),
      trigger: 'user',
    };
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
 *  PROVIDERS
 * ──────────────────────────────────────────────────────────────────────────── */

export const mockProviderService: ProviderService = {
  async list(params): Promise<PageResult<Provider>> {
    await delay(null, LATENCY.fast);
    return paginate(mockProviders, params);
  },
  async get(id: ID): Promise<Provider> {
    await delay(null, LATENCY.fast);
    const p = mockProviders.find((x) => x.id === id);
    if (!p) throw new Error('Provider not found');
    return clone(p);
  },
  async listModels(providerId: ID): Promise<readonly Model[]> {
    await delay(null, LATENCY.fast);
    const p = mockProviders.find((x) => x.id === providerId);
    return p ? clone(p.models) : [];
  },
  async configure(providerCode: string): Promise<Provider> {
    await delay(null, LATENCY.normal);
    const existing = mockProviders.find((p) => p.code === providerCode);
    if (!existing) throw new Error('Unknown provider');
    return { ...clone(existing), isConfigured: true, status: 'configured' as ProviderStatus };
  },
  async testConnection(_providerId: ID) {
    await delay(null, LATENCY.normal);
    return { success: true, latencyMs: 142 };
  },
  async updateProvider(id: ID, patch): Promise<Provider> {
    await delay(null, LATENCY.fast);
    const p = mockProviders.find((x) => x.id === id);
    if (!p) throw new Error('Provider not found');
    return { ...clone(p), ...patch };
  },
  async updateModel(id: ID, patch): Promise<Model> {
    await delay(null, LATENCY.fast);
    for (const p of mockProviders) {
      const m = p.models.find((x) => x.id === id);
      if (m) return { ...clone(m), ...patch };
    }
    throw new Error('Model not found');
  },
  async disconnect(id: ID): Promise<void> {
    await delay(null, LATENCY.fast);
    void id;
  },
  async getUsage(options): Promise<readonly ProviderUsageStats[]> {
    await delay(null, LATENCY.fast);
    const window = options?.window ?? 'day';
    return mockProviders
      .filter((p) => p.isConfigured)
      .flatMap((p) =>
        p.models.slice(0, 1).map<ProviderUsageStats>((m) => ({
          providerId: p.id,
          modelId: m.id,
          window,
          requests: Math.floor(Math.random() * 2000) + 200,
          inputTokens: Math.floor(Math.random() * 5_000_000) + 200_000,
          outputTokens: Math.floor(Math.random() * 1_500_000) + 50_000,
          estimatedCost: +(Math.random() * 50 + 2).toFixed(2),
          latencyMs: { p50: 420, p95: 900, p99: 1400 },
          errorRate: +(Math.random() * 0.02).toFixed(3),
        })),
      );
  },
  async getDefaults() {
    await delay(null, LATENCY.fast);
    return {
      chatProviderId: 'prov-openai' as ID,
      chatModelId: 'prov-openai-gpt4o' as ID,
      embeddingProviderId: 'prov-openai' as ID,
      embeddingModelId: 'prov-openai-embedding-3' as ID,
    };
  },
  async setDefaults(_defaults): Promise<void> {
    await delay(null, LATENCY.fast);
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
 *  SYNC
 * ──────────────────────────────────────────────────────────────────────────── */

export const mockSyncService: SyncService = {
  async getCurrentState() {
    await delay(null, LATENCY.fast / 2);
    return {
      state: 'idle' as SyncState,
      lastSyncAt: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
      nextScheduledAt: new Date(Date.now() + 1000 * 60 * 9).toISOString(),
      pendingLocal: 3,
      pendingRemote: 2,
      enabled: true,
    };
  },
  async startSync(): Promise<SyncEvent> {
    await delay(null, LATENCY.normal);
    return {
      id: `sync-${Date.now()}` as ID,
      startedAt: new Date().toISOString(),
      state: 'scanning' as SyncState,
      totalItems: mockNotes.length + mockTasks.length,
      processedItems: 0,
      errors: 0,
      conflicts: 0,
    };
  },
  async cancelSync(): Promise<void> {
    await delay(null, LATENCY.fast);
  },
  async listConflicts(params): Promise<PageResult<SyncConflict>> {
    await delay(null, LATENCY.fast);
    const conflicts: SyncConflict[] = [
      {
        id: 'conf-1' as ID,
        path: 'Strategy/Vision.md',
        entityType: 'note',
        entityId: 'note-syntrophos-vision' as ID,
        localModifiedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        remoteModifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        localChecksum: 'local-a',
        remoteChecksum: 'remote-a',
      },
      {
        id: 'conf-2' as ID,
        path: 'Journal/Daily/2026-07-29.md',
        entityType: 'note',
        localModifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        remoteModifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
        localChecksum: 'local-b',
        remoteChecksum: 'remote-b',
      },
    ];
    return paginate(conflicts, params);
  },
  async resolveConflict(_id: ID, _resolution): Promise<void> {
    await delay(null, LATENCY.fast);
  },
  async resolveAllConflicts(_resolution) {
    await delay(null, LATENCY.fast);
    return { resolved: 2 };
  },
  async listHistory(params): Promise<PageResult<SyncEvent>> {
    await delay(null, LATENCY.fast);
    const events: SyncEvent[] = Array.from({ length: 8 }, (_, i) => ({
      id: `sync-hist-${i}` as ID,
      startedAt: new Date(Date.now() - i * 1000 * 60 * 60 * 6).toISOString(),
      completedAt: new Date(Date.now() - i * 1000 * 60 * 60 * 6 + 1000 * 45).toISOString(),
      state: i === 0 ? 'idle' : 'merging' as SyncState,
      totalItems: mockNotes.length,
      processedItems: mockNotes.length,
      errors: i === 2 ? 1 : 0,
      conflicts: i === 0 ? 2 : 0,
    }));
    return paginate(events, params);
  },
  async setSchedule(_enabled: boolean, _intervalMinutes?: number): Promise<void> {
    await delay(null, LATENCY.fast);
  },
  async forceFullReindex(): Promise<void> {
    await delay(null, LATENCY.slow);
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
 *  VOICE
 * ──────────────────────────────────────────────────────────────────────────── */

export const mockVoiceService: VoiceService = {
  async getCapabilities(): Promise<VoiceCapabilities> {
    await delay(null, LATENCY.fast);
    return {
      sttEnabled: true,
      ttsEnabled: true,
      availableInputLocales: ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'ja-JP', 'de-DE'],
      availableOutputVoices: [
        { id: 'alloy', name: 'Alloy', gender: 'neutral', locale: 'en-US' },
        { id: 'echo', name: 'Echo', gender: 'male', locale: 'en-US' },
        { id: 'shimmer', name: 'Shimmer', gender: 'female', locale: 'en-US' },
        { id: 'nova', name: 'Nova', gender: 'female', locale: 'en-GB' },
      ],
    };
  },
  async getState(): Promise<VoiceState> {
    return 'idle';
  },
  async startListening(): Promise<void> {
    await delay(null, 100);
  },
  async stopListening(): Promise<VoiceTranscript | null> {
    await delay(null, LATENCY.normal);
    return {
      id: `tx-${Date.now()}` as ID,
      text: 'Summarize my notes about retrieval evaluation and prepare a plan for improvements.',
      isFinal: true,
      confidence: 0.96,
      locale: 'en-US',
      timestamp: new Date().toISOString(),
    };
  },
  subscribeTranscript() {
    return () => {};
  },
  subscribeState() {
    return () => {};
  },
  async speak(text: string): Promise<Utterance> {
    await delay(null, LATENCY.normal);
    return {
      id: `utt-${Date.now()}` as ID,
      text,
      locale: 'en-US',
      voiceId: 'alloy',
      durationMs: text.length * 60,
      audioFormat: 'opus',
    };
  },
  async stopSpeaking(): Promise<void> {
    await delay(null, 80);
  },
  async uploadAudio(_audio: ArrayBuffer): Promise<VoiceTranscript> {
    await delay(null, LATENCY.normal);
    return {
      id: `tx-${Date.now()}` as ID,
      text: 'Transcribed audio.',
      isFinal: true,
      locale: 'en-US',
      timestamp: new Date().toISOString(),
    };
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
 *  PLUGINS
 * ──────────────────────────────────────────────────────────────────────────── */

export const mockPluginService: PluginService = {
  async listInstalled(params): Promise<PageResult<Plugin>> {
    await delay(null, LATENCY.fast);
    return paginate(mockPlugins, params);
  },
  async getInstalled(id: ID): Promise<Plugin> {
    await delay(null, LATENCY.fast);
    const p = mockPlugins.find((x) => x.id === id);
    if (!p) throw new Error('Plugin not found');
    return clone(p);
  },
  async listRegistry(params): Promise<PageResult<RegistryPlugin>> {
    await delay(null, LATENCY.fast);
    return paginate(mockRegistryPlugins, params);
  },
  async install(manifestId: string, _acceptPermissions): Promise<Plugin> {
    await delay(null, LATENCY.normal);
    const r = mockRegistryPlugins.find((x) => x.manifestId === manifestId);
    if (!r) throw new Error('Plugin not found in registry');
    return {
      id: `pl-${Date.now()}` as ID,
      manifest: clone(r.manifest),
      workspaceId: mockSession.workspaceId,
      installedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'enabled',
      audit: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    };
  },
  async update(id: ID): Promise<Plugin> {
    await delay(null, LATENCY.normal);
    const p = mockPlugins.find((x) => x.id === id);
    if (!p) throw new Error('Plugin not found');
    return clone(p);
  },
  async uninstall(_id: ID): Promise<void> {
    await delay(null, LATENCY.fast);
  },
  async enable(id: ID): Promise<Plugin> {
    await delay(null, LATENCY.fast);
    const p = mockPlugins.find((x) => x.id === id);
    if (!p) throw new Error('Plugin not found');
    return { ...clone(p), status: 'enabled' };
  },
  async disable(id: ID): Promise<Plugin> {
    await delay(null, LATENCY.fast);
    const p = mockPlugins.find((x) => x.id === id);
    if (!p) throw new Error('Plugin not found');
    return { ...clone(p), status: 'disabled' };
  },
  async getSettings(_id: ID) {
    await delay(null, LATENCY.fast);
    return {};
  },
  async updateSettings(_id: ID, _settings): Promise<void> {
    await delay(null, LATENCY.fast);
  },
  async checkForUpdates(): Promise<readonly Plugin[]> {
    await delay(null, LATENCY.normal);
    return [];
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
 *  CALENDAR
 * ──────────────────────────────────────────────────────────────────────────── */

export const mockCalendarService: CalendarService = {
  async listCalendars(): Promise<readonly Calendar[]> {
    await delay(null, LATENCY.fast);
    return clone(mockCalendars);
  },
  async listEvents(params) {
    await delay(null, LATENCY.fast);
    const items = mockCalendarEvents.filter((e) => {
      return e.startAt >= params.startAt && e.startAt <= params.endAt;
    });
    return paginate(items);
  },
  async getEvent(id: ID): Promise<CalendarEvent> {
    await delay(null, LATENCY.fast);
    const e = mockCalendarEvents.find((x) => x.id === id);
    if (!e) throw new Error('Event not found');
    return clone(e);
  },
  async createEvent(data): Promise<CalendarEvent> {
    await delay(null, LATENCY.normal);
    return {
      id: `evt-${Date.now()}` as ID,
      calendarId: data.calendarId,
      title: data.title,
      description: data.description,
      location: data.location,
      allDay: data.allDay,
      startAt: data.startAt,
      endAt: data.endAt,
      timezone: data.timezone,
      type: data.type ?? 'event',
      isRecurring: false,
      attendees: data.attendees,
      meetingUrl: data.meetingUrl,
      audit: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      source: 'syntrophos',
    } as unknown as CalendarEvent;
  },
  async updateEvent(id: ID, patch): Promise<CalendarEvent> {
    await delay(null, LATENCY.fast);
    const e = mockCalendarEvents.find((x) => x.id === id);
    if (!e) throw new Error('Event not found');
    return { ...clone(e), ...patch };
  },
  async deleteEvent(_id: ID): Promise<void> {
    await delay(null, LATENCY.fast);
  },
  async getFreeBusy(_params) {
    await delay(null, LATENCY.normal);
    return [];
  },
  async scheduleMeeting(params): Promise<CalendarEvent> {
    await delay(null, LATENCY.normal);
    const start = new Date();
    start.setHours(10, 0, 0, 0);
    start.setDate(start.getDate() + 1);
    const end = new Date(start.getTime() + params.durationMinutes * 60 * 1000);
    return {
      id: `evt-${Date.now()}` as ID,
      calendarId: 'cal-work' as ID,
      title: params.title,
      allDay: false,
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      type: 'meeting',
      isRecurring: false,
      attendees: params.attendeeEmails.map((email, i) => ({
        id: `ga-${i}` as ID,
        email,
        status: i === 0 ? 'accepted' : 'needs-action',
        isOrganizer: i === 0,
      })),
      audit: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      source: 'syntrophos',
    };
  },
};
