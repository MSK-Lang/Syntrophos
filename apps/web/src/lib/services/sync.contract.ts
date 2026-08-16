import type { AuditInfo, ID, PageResult, QueryParams } from './types.js';

export type SyncState = 'idle' | 'scanning' | 'uploading' | 'downloading' | 'merging' | 'conflict';

export type ConflictResolution = 'keep-local' | 'keep-remote' | 'merge' | 'manual';

export type SyncConflict = {
  readonly id: ID;
  readonly path: string;
  readonly entityType: 'note' | 'task' | 'project' | 'preferences';
  readonly entityId?: ID;
  readonly localModifiedAt: string;
  readonly remoteModifiedAt: string;
  readonly localChecksum: string;
  readonly remoteChecksum: string;
  readonly diffPreview?: string;
  readonly resolution?: ConflictResolution;
};

export type SyncEvent = {
  readonly id: ID;
  readonly startedAt: string;
  readonly completedAt?: string;
  readonly state: SyncState;
  readonly totalItems: number;
  readonly processedItems: number;
  readonly errors: number;
  readonly conflicts: number;
  readonly phase?: string;
};

export interface SyncService {
  readonly getCurrentState: () => Promise<{
    readonly state: SyncState;
    readonly lastSyncAt?: string;
    readonly nextScheduledAt?: string;
    readonly pendingLocal: number;
    readonly pendingRemote: number;
    readonly enabled: boolean;
  }>;
  readonly startSync: () => Promise<SyncEvent>;
  readonly cancelSync: () => Promise<void>;
  readonly listConflicts: (params?: QueryParams) => Promise<PageResult<SyncConflict>>;
  readonly resolveConflict: (
    id: ID,
    resolution: ConflictResolution,
    manualContent?: string,
  ) => Promise<void>;
  readonly resolveAllConflicts: (resolution: ConflictResolution) => Promise<{
    readonly resolved: number;
  }>;
  readonly listHistory: (params?: QueryParams) => Promise<PageResult<SyncEvent>>;
  readonly setSchedule: (enabled: boolean, intervalMinutes?: number) => Promise<void>;
  readonly forceFullReindex: () => Promise<void>;
}
