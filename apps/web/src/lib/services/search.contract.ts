import type { ID, Timestamp } from './types.js';

export type SearchScope = 'global' | 'notes' | 'tasks' | 'messages' | 'files' | 'projects';

export type SearchResultItemType =
  | 'note'
  | 'task'
  | 'project'
  | 'message'
  | 'file'
  | 'tag'
  | 'person'
  | 'command'
  | 'settings';

export type SearchHit = {
  readonly id: ID;
  readonly type: SearchResultItemType;
  readonly title: string;
  readonly snippet: string;
  readonly path?: string;
  readonly highlights?: readonly { readonly field: string; readonly text: string }[];
  readonly score: number;
  readonly updatedAt: Timestamp;
  readonly url: string;
};

export type SearchFilters = {
  readonly types?: readonly SearchResultItemType[];
  readonly tags?: readonly string[];
  readonly createdAfter?: Timestamp;
  readonly createdBefore?: Timestamp;
  readonly modifiedAfter?: Timestamp;
  readonly modifiedBefore?: Timestamp;
  readonly authorIds?: readonly ID[];
  readonly projectIds?: readonly ID[];
  readonly minScore?: number;
};

export type SearchSuggestion = {
  readonly text: string;
  readonly type: 'query' | 'filter' | 'entity' | 'command';
  readonly payload?: unknown;
};

export interface SearchService {
  readonly query: (
    query: string,
    options?: {
      readonly scope?: SearchScope;
      readonly filters?: SearchFilters;
      readonly limit?: number;
      readonly semantic?: boolean;
    },
  ) => Promise<{ readonly items: readonly SearchHit[]; readonly total: number; readonly latencyMs: number }>;
  readonly suggest: (
    query: string,
    options?: { readonly scope?: SearchScope; readonly limit?: number },
  ) => Promise<readonly SearchSuggestion[]>;
  readonly getRecent: (limit?: number) => Promise<readonly SearchHit[]>;
  readonly clearRecent: () => Promise<void>;
  readonly rebuildIndex: (scope?: SearchScope) => Promise<{ readonly indexed: number; readonly durationMs: number }>;
}
