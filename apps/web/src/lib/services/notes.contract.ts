import type { AuditInfo, ID, PageResult, QueryParams, Timestamp } from './types.js';

export type NoteType = 'note' | 'journal' | 'project' | 'reference' | 'template';

export type NoteStatus = 'draft' | 'published' | 'archived';

export type NoteFrontmatter = {
  readonly title?: string;
  readonly tags?: readonly string[];
  readonly aliases?: readonly string[];
  readonly date?: Timestamp;
  readonly dueDate?: Timestamp;
  readonly status?: NoteStatus;
  readonly type?: NoteType;
  readonly projectId?: ID;
  readonly author?: string;
  readonly sources?: readonly string[];
  readonly custom?: Readonly<Record<string, unknown>>;
};

export type NoteLink = {
  readonly sourceNoteId: ID;
  readonly targetNoteId: ID;
  readonly label?: string;
  readonly type: 'wikilink' | 'tag' | 'mention' | 'backlink';
};

export type Note = {
  readonly id: ID;
  readonly workspaceId: ID;
  readonly path: string;
  readonly title: string;
  readonly content: string;
  readonly excerpt: string;
  readonly wordCount: number;
  readonly frontmatter: NoteFrontmatter;
  readonly tags: readonly string[];
  readonly links: readonly NoteLink[];
  readonly backlinkCount: number;
  readonly sizeBytes: number;
  readonly checksum: string;
  readonly audit: AuditInfo;
  readonly lastOpenedAt?: Timestamp;
  readonly syncStatus: 'synced' | 'modified-local' | 'modified-remote' | 'conflict';
};

export type FolderNode = {
  readonly id: ID;
  readonly name: string;
  readonly path: string;
  readonly children: readonly FolderNode[];
  readonly noteCount: number;
};

export interface NotesService {
  readonly list: (params?: QueryParams) => Promise<PageResult<Note>>;
  readonly get: (id: ID) => Promise<Note>;
  readonly getByPath: (path: string) => Promise<Note>;
  readonly create: (data: {
    readonly path: string;
    readonly title: string;
    readonly content?: string;
    readonly frontmatter?: NoteFrontmatter;
  }) => Promise<Note>;
  readonly update: (
    id: ID,
    patch: {
      readonly content?: string;
      readonly path?: string;
      readonly frontmatter?: NoteFrontmatter;
    },
  ) => Promise<Note>;
  readonly delete: (id: ID) => Promise<void>;
  readonly move: (id: ID, newPath: string) => Promise<Note>;
  readonly listFolders: () => Promise<FolderNode>;
  readonly listTags: () => Promise<PageResult<{ readonly tag: string; readonly count: number }>>;
  readonly getBacklinks: (id: ID) => Promise<readonly Note[]>;
  readonly getDailyNote: (date?: string) => Promise<Note>;
  readonly syncNow: () => Promise<{ readonly updated: number; readonly conflicts: number }>;
  readonly getSyncStatus: () => Promise<{
    readonly lastSyncAt?: Timestamp;
    readonly pendingLocal: number;
    readonly pendingRemote: number;
    readonly conflicts: number;
  }>;
}
