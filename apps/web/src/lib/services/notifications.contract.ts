import type { AuditInfo, ID, PageResult, QueryParams, Timestamp } from './types.js';

export type NotificationCategory = 'info' | 'success' | 'warning' | 'error' | 'mention';

export type NotificationOrigin =
  | 'chat'
  | 'tasks'
  | 'notes'
  | 'sync'
  | 'agent'
  | 'workspace'
  | 'system'
  | 'integration';

export type Notification = {
  readonly id: ID;
  readonly workspaceId: ID;
  readonly userId: ID;
  readonly category: NotificationCategory;
  readonly origin: NotificationOrigin;
  readonly title: string;
  readonly body: string;
  readonly actionUrl?: string;
  readonly actionLabel?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
  readonly readAt?: Timestamp;
  readonly archivedAt?: Timestamp;
  readonly deliveredAt: Timestamp;
  readonly actor?: {
    readonly id: ID;
    readonly name: string;
    readonly avatarUrl?: string;
  };
};

export type NotificationPreference = {
  readonly origin: NotificationOrigin;
  readonly inApp: boolean;
  readonly email: boolean;
  readonly desktop: boolean;
  readonly minCategory: NotificationCategory;
};

export interface NotificationService {
  readonly list: (
    params?: QueryParams & {
      readonly includeArchived?: boolean;
      readonly unreadOnly?: boolean;
      readonly origins?: readonly NotificationOrigin[];
    },
  ) => Promise<PageResult<Notification>>;
  readonly get: (id: ID) => Promise<Notification>;
  readonly markRead: (id: ID) => Promise<Notification>;
  readonly markAllRead: () => Promise<{ readonly updated: number }>;
  readonly archive: (id: ID) => Promise<void>;
  readonly unarchive: (id: ID) => Promise<void>;
  readonly clearAll: () => Promise<void>;
  readonly getUnreadCount: () => Promise<number>;
  readonly subscribe: (onNotification: (notification: Notification) => void) => () => void;
  readonly listPreferences: () => Promise<readonly NotificationPreference[]>;
  readonly updatePreference: (preference: NotificationPreference) => Promise<NotificationPreference>;
}
