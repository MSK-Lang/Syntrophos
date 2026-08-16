import type { AuditInfo, ID, PageResult, QueryParams, Timestamp } from './types.js';

export type TaskPriority = 'no-priority' | 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in-progress' | 'blocked' | 'done' | 'cancelled';

export type RecurrenceRule = {
  readonly frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  readonly interval: number;
  readonly weekdays?: readonly number[];
  readonly monthDays?: readonly number[];
  readonly endAt?: Timestamp;
};

export type Task = {
  readonly id: ID;
  readonly workspaceId: ID;
  readonly title: string;
  readonly description?: string;
  readonly projectId?: ID;
  readonly sectionId?: ID;
  readonly status: TaskStatus;
  readonly priority: TaskPriority;
  readonly assigneeIds: readonly ID[];
  readonly dueDate?: Timestamp;
  readonly dueTime?: string;
  readonly recurrence?: RecurrenceRule;
  readonly tags: readonly string[];
  readonly noteId?: ID;
  readonly subtaskIds: readonly ID[];
  readonly parentTaskId?: ID;
  readonly completedAt?: Timestamp;
  readonly completedById?: ID;
  readonly order: number;
  readonly estimatedMinutes?: number;
  readonly actualMinutes?: number;
  readonly audit: AuditInfo;
};

export type ProjectStatus = 'active' | 'on-hold' | 'completed' | 'archived';

export type ProjectView = 'board' | 'list' | 'calendar' | 'gantt' | 'kanban';

export type Project = {
  readonly id: ID;
  readonly workspaceId: ID;
  readonly name: string;
  readonly description?: string;
  readonly color?: string;
  readonly icon?: string;
  readonly status: ProjectStatus;
  readonly defaultView: ProjectView;
  readonly memberIds: readonly ID[];
  readonly progress: {
    readonly total: number;
    readonly completed: number;
  };
  readonly startDate?: Timestamp;
  readonly endDate?: Timestamp;
  readonly audit: AuditInfo;
};

export type Section = {
  readonly id: ID;
  readonly projectId: ID;
  readonly name: string;
  readonly order: number;
  readonly isDefault: boolean;
  readonly audit: AuditInfo;
};

export interface TasksService {
  readonly list?: (params?: QueryParams) => Promise<PageResult<Task>>;
  readonly listTasks: (params?: QueryParams) => Promise<PageResult<Task>>;
  readonly getTask: (id: ID) => Promise<Task>;
  readonly createTask: (
    data: Readonly<
      Partial<
        Pick<
          Task,
          | 'title'
          | 'description'
          | 'projectId'
          | 'sectionId'
          | 'status'
          | 'priority'
          | 'assigneeIds'
          | 'dueDate'
          | 'dueTime'
          | 'recurrence'
          | 'tags'
          | 'noteId'
          | 'parentTaskId'
          | 'estimatedMinutes'
        >
      > & { readonly title: string }
    >,
  ) => Promise<Task>;
  readonly updateTask: (id: ID, patch: Readonly<Partial<Task>>) => Promise<Task>;
  readonly deleteTask: (id: ID) => Promise<void>;
  readonly reorderTasks: (ids: readonly ID[]) => Promise<void>;
  readonly listProjects: (params?: QueryParams) => Promise<PageResult<Project>>;
  readonly getProject: (id: ID) => Promise<Project>;
  readonly createProject: (data: Readonly<Pick<Project, 'name' | 'description' | 'color' | 'icon'>>) => Promise<Project>;
  readonly updateProject: (id: ID, patch: Readonly<Partial<Project>>) => Promise<Project>;
  readonly deleteProject: (id: ID) => Promise<void>;
  readonly listSections: (projectId: ID) => Promise<readonly Section[]>;
  readonly createSection: (projectId: ID, name: string) => Promise<Section>;
  readonly updateSection: (id: ID, patch: Readonly<Partial<Section>>) => Promise<Section>;
  readonly deleteSection: (id: ID) => Promise<void>;
  readonly getUpcoming: (windowDays: number) => Promise<PageResult<Task>>;
  readonly getToday: () => Promise<PageResult<Task>>;
  readonly getOverdue: () => Promise<PageResult<Task>>;
}
