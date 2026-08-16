import type { AuditInfo, ID, PageResult, QueryParams, Timestamp } from './types.js';

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export type ToolCallStatus = 'pending' | 'running' | 'success' | 'error';

export type ToolCall = {
  readonly id: ID;
  readonly name: string;
  readonly arguments: unknown;
  readonly status: ToolCallStatus;
  readonly result?: unknown;
  readonly error?: string;
  readonly startedAt?: Timestamp;
  readonly completedAt?: Timestamp;
};

export type MessageAttachment = {
  readonly id: ID;
  readonly type: 'note' | 'file' | 'url' | 'image';
  readonly referenceId?: ID;
  readonly title: string;
  readonly url?: string;
  readonly mimeType?: string;
  readonly sizeBytes?: number;
};

export type ChatMessage = {
  readonly id: ID;
  readonly conversationId: ID;
  readonly role: MessageRole;
  readonly content: string;
  readonly reasoningContent?: string;
  readonly toolCalls?: readonly ToolCall[];
  readonly attachments?: readonly MessageAttachment[];
  readonly model?: string;
  readonly providerId?: ID;
  readonly tokens?: {
    readonly input: number;
    readonly output: number;
  };
  readonly latencyMs?: number;
  readonly rating?: -1 | 0 | 1;
  readonly edited?: boolean;
  readonly audit: AuditInfo;
};

export type ConversationStatus = 'active' | 'archived' | 'pinned';

export type ConversationTag = {
  readonly id: ID;
  readonly name: string;
  readonly color?: string;
};

export type Conversation = {
  readonly id: ID;
  readonly workspaceId: ID;
  readonly title: string;
  readonly preview: string;
  readonly status: ConversationStatus;
  readonly agentIds?: readonly ID[];
  readonly tags: readonly ConversationTag[];
  readonly messageCount: number;
  readonly lastMessageAt: Timestamp;
  readonly audit: AuditInfo;
};

export interface ChatService {
  readonly listConversations: (params?: QueryParams) => Promise<PageResult<Conversation>>;
  readonly getConversation: (id: ID) => Promise<Conversation>;
  readonly createConversation: (data: {
    readonly title?: string;
    readonly agentIds?: readonly ID[];
    readonly tags?: readonly string[];
  }) => Promise<Conversation>;
  readonly updateConversation: (
    id: ID,
    patch: Readonly<Partial<Pick<Conversation, 'title' | 'status' | 'tags'>>>,
  ) => Promise<Conversation>;
  readonly deleteConversation: (id: ID) => Promise<void>;
  readonly listMessages: (
    conversationId: ID,
    params?: QueryParams & { readonly after?: Timestamp },
  ) => Promise<PageResult<ChatMessage>>;
  readonly sendMessage: (data: {
    readonly conversationId: ID;
    readonly content: string;
    readonly attachments?: readonly MessageAttachment[];
    readonly parentMessageId?: ID;
    readonly overrides?: {
      readonly providerId?: ID;
      readonly model?: string;
      readonly temperature?: number;
      readonly agentIds?: readonly ID[];
    };
  }) => Promise<ChatMessage>;
  readonly streamMessage: (
    data: Parameters<ChatService['sendMessage']>[0],
    handlers: {
      readonly onDelta: (delta: string) => void;
      readonly onToolCall?: (toolCall: ToolCall) => void;
      readonly onComplete: (message: ChatMessage) => void;
      readonly onError: (error: Error) => void;
    },
  ) => () => void;
  readonly editMessage: (id: ID, content: string) => Promise<ChatMessage>;
  readonly deleteMessage: (id: ID) => Promise<void>;
  readonly rateMessage: (id: ID, rating: -1 | 0 | 1) => Promise<void>;
  readonly regenerate: (messageId: ID) => Promise<ChatMessage>;
}
