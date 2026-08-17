import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Avatar, Badge, Button, Input, Separator } from '@/components/ui/primitives.js';
import { ErrorState, PageLoader } from '@/components/ui/states.js';
import {
  IconBot,
  IconChat,
  IconChevronDown,
  IconMic,
  IconPaperclip,
  IconPlus,
  IconSearch,
  IconSend,
  IconStar,
  IconX,
  IconCore,
  IconNotes,
  IconCalendar,
  IconTasks,
  IconCheckCircle,
  IconAlertCircle,
  IconCode,
} from '@/lib/icons.js';
import { useChat, useAgents, useProviders } from '@/lib/services/index.js';
import type { Conversation, ChatMessage, MessageRole } from '@/lib/services/chat.contract.js';

const INTENT_SUGGESTIONS = [
  {
    id: 'research',
    title: 'Research something',
    description: 'Synthesize knowledge vault and external web sources',
    prompt: 'Research the latest market trends and synthesize key insights into my vault',
    directive: '/research',
    Icon: IconCode,
  },
  {
    id: 'plan',
    title: 'Plan my day',
    description: 'Organize calendar, tasks, and priority horizons',
    prompt: 'Review today’s schedule, tasks, and suggest an optimal priority plan',
    directive: '/plan',
    Icon: IconCalendar,
  },
  {
    id: 'notes',
    title: 'Analyze my notes',
    description: 'Extract insights and connections across Obsidian nodes',
    prompt: 'Analyze my recent Obsidian notes and highlight connected themes',
    directive: '/research',
    Icon: IconNotes,
  },
  {
    id: 'project',
    title: 'Break down a project',
    description: 'Decompose goals into milestones and task pipelines',
    prompt: 'Decompose my current project goal into actionable milestones and task steps',
    directive: '/task',
    Icon: IconCore,
  },
  {
    id: 'knowledge',
    title: 'Search my knowledge',
    description: 'Query indexed workspace context and documents',
    prompt: 'Search my workspace knowledge vault for relevant project references',
    directive: '/research',
    Icon: IconBot,
  },
] as const;

const DIRECTIVES = [
  { id: 'research', label: '/research', hint: 'Synthesize knowledge vault' },
  { id: 'plan', label: '/plan', hint: 'Organize schedule & priorities' },
  { id: 'task', label: '/task', hint: 'Create deliverable item' },
  { id: 'email', label: '/email', hint: 'Draft contextual outbound email' },
  { id: 'agent', label: '/agent', hint: 'Deploy autonomous worker' },
] as const;

export default function ChatListPage() {
  return <SyntrophosChatWorkspace />;
}

export function ChatThreadPage() {
  return <SyntrophosChatWorkspace />;
}

export function SyntrophosChatWorkspace() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { listConversations, getConversation, listMessages, sendMessage, createConversation } = useChat();

  const isNewOrNoConversation = !conversationId || conversationId === 'new';

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [query, setQuery] = useState('');

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [threadLoading, setThreadLoading] = useState(!isNewOrNoConversation);
  const [error, setError] = useState<Error | null>(null);

  const [input, setInput] = useState('');
  const [activeDirective, setActiveDirective] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isProcessExpanded, setIsProcessExpanded] = useState(true);
  const [isContextExpanded, setIsContextExpanded] = useState(false);
  const [approvedActionIds, setApprovedActionIds] = useState<string[]>([]);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // 1. Fetch conversation sidebar list
  const loadSidebarConversations = async () => {
    try {
      setConversationsLoading(true);
      const r = await listConversations({ pageSize: 50 });
      setConversations(r.items as Conversation[]);
    } catch {
      // Sidebar list error non-fatal fallback
    } finally {
      setConversationsLoading(false);
    }
  };

  useEffect(() => {
    void loadSidebarConversations();
  }, []);

  // 2. Fetch active thread when conversationId changes
  const loadThreadData = async (id: string) => {
    try {
      setThreadLoading(true);
      setError(null);
      const [conv, msgs] = await Promise.all([
        getConversation(id),
        listMessages(id, { pageSize: 100 }),
      ]);
      setConversation(conv);
      setMessages(msgs.items as ChatMessage[]);
    } catch (err) {
      setError(err as Error);
    } finally {
      setThreadLoading(false);
    }
  };

  useEffect(() => {
    if (isNewOrNoConversation) {
      setConversation(null);
      setMessages([]);
      setThreadLoading(false);
      setError(null);
    } else if (conversationId) {
      void loadThreadData(conversationId);
    }
  }, [conversationId, isNewOrNoConversation]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, threadLoading, isSending]);

  const filteredConversations = useMemo(() => {
    if (!query.trim()) return conversations;
    const q = query.toLowerCase();
    return conversations.filter((c) => (c.title ?? '').toLowerCase().includes(q));
  }, [conversations, query]);

  const pinned = filteredConversations.filter((c) => c.status === 'pinned');
  const active = filteredConversations.filter((c) => c.status === 'active' || !c.status);
  const archived = filteredConversations.filter((c) => c.status === 'archived');

  // Submit message: handles NO_CONVERSATION -> STARTING -> ACTIVE -> THINKING -> RESPONSE
  const submitMessage = async (overridePrompt?: string) => {
    const text = (overridePrompt ?? input).trim();
    if (!text || isStarting || isSending) return;

    setInput('');
    setActiveDirective(null);

    let currentConvId = conversationId;

    // If no active conversation exists, create one first!
    if (isNewOrNoConversation || !currentConvId) {
      try {
        setIsStarting(true);
        const created = await createConversation({ title: text.slice(0, 36) });
        currentConvId = created.id;
        setConversation(created);
        setConversations((prev) => [created, ...prev]);
        navigate(`/chat/${created.id}`, { replace: true });
      } catch (err) {
        setError(err as Error);
        setIsStarting(false);
        return;
      } finally {
        setIsStarting(false);
      }
    }

    if (!currentConvId) return;

    try {
      setIsSending(true);
      const userMsg: ChatMessage = {
        id: `u_${Date.now()}` as never,
        conversationId: currentConvId as never,
        role: 'user' as MessageRole,
        content: text,
        audit: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      };
      setMessages((cur) => [...cur, userMsg]);

      const reply = await sendMessage({ conversationId: currentConvId as never, content: text });
      setMessages((cur) => [...cur, reply]);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsSending(false);
    }
  };

  const handleApproveAction = (id: string) => {
    setApprovedActionIds((prev) => [...prev, id]);
    void submitMessage('Approved proposed action: Send follow-up email to client');
  };

  return (
    <div className="chat-layout" style={{ background: '#000000', color: '#ffcc66', display: 'flex', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Left Conversations Sidebar */}
      <aside className="chat-conversations" style={{ background: '#070401', borderRight: '1px solid rgba(255, 170, 48, 0.25)', width: 300, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(255, 170, 48, 0.25)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, fontWeight: 'bold', color: '#ffaa30', letterSpacing: '0.12em', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconChat width={16} height={16} />
              <span>SYNTHROPHOS // CHAT</span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/chat/new')}
              style={{
                background: '#ffaa30',
                color: '#000000',
                border: 'none',
                borderRadius: 4,
                padding: '4px 10px',
                fontSize: 11,
                fontFamily: 'monospace',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <IconPlus width={12} height={12} /> NEW
            </button>
          </div>
          <Input
            placeholder="Search threads… (⌘K)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leading={<IconSearch width={14} height={14} />}
            style={{ background: 'rgba(20, 10, 2, 0.6)', borderColor: 'rgba(255, 170, 48, 0.25)', color: '#ffcc66' }}
          />
        </div>

        <div style={{ overflowY: 'auto', flex: '1 1 auto', padding: '8px' }}>
          {conversationsLoading ? (
            <PageLoader label="LOADING CHAT INDEX…" />
          ) : conversations.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#885522', fontFamily: 'monospace', marginBottom: 12 }}>
                NO CONVERSATIONS YET
              </div>
              <button
                type="button"
                onClick={() => navigate('/chat/new')}
                style={{
                  background: 'rgba(255, 170, 48, 0.15)',
                  border: '1px solid rgba(255, 170, 48, 0.4)',
                  color: '#ffcc66',
                  fontFamily: 'monospace',
                  fontSize: 11,
                  padding: '6px 14px',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                START A CONVERSATION
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {pinned.length > 0 && <ConversationGroup label="Pinned" items={pinned} activeId={conversationId} />}
              {active.length > 0 && <ConversationGroup label="Recent" items={active} activeId={conversationId} />}
              {archived.length > 0 && <ConversationGroup label="Archived" items={archived} activeId={conversationId} />}
            </div>
          )}
        </div>
      </aside>

      {/* Right Primary Active Chat Workspace */}
      <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', minHeight: 0, background: '#000000' }}>
        {/* Workspace Header */}
        <header style={{ padding: '14px 24px', borderBottom: '1px solid rgba(255, 170, 48, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(14, 7, 1, 0.9)' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: '#ffaa30', letterSpacing: '0.04em' }}>
              {isNewOrNoConversation ? 'SYNTHROPHOS // CHAT WORKSPACE' : (conversation?.title ?? 'Active Conversation')}
            </div>
            <div style={{ fontSize: 10, color: '#885522', fontFamily: 'monospace', marginTop: 2 }}>
              MODEL: SYNTROPHOS COGNITION V1.0 · {isNewOrNoConversation ? 'STANDBY MODE' : `${messages.length} MESSAGES`}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={() => navigate('/agents')}
              style={{
                background: 'rgba(255, 170, 48, 0.1)',
                border: '1px solid rgba(255, 170, 48, 0.3)',
                borderRadius: 4,
                color: '#d99a4e',
                fontSize: 10,
                fontFamily: 'monospace',
                padding: '4px 10px',
                cursor: 'pointer',
              }}
            >
              [ BROWSE AGENTS ]
            </button>
          </div>
        </header>

        {/* Content Body: NO_CONVERSATION vs ACTIVE vs ERROR */}
        <div ref={scrollRef} style={{ flex: '1 1 auto', overflowY: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column' }}>
          {threadLoading ? (
            <PageLoader label="INITIALIZING NEURAL CHAT STREAM…" />
          ) : error ? (
            /* REAL Exception Error State Only */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: 'auto', maxWidth: 480, textAlign: 'center', gap: 14 }}>
              <ErrorState title="FAILED TO LOAD MESSAGES" error={error.message} />
              <button
                type="button"
                onClick={() => {
                  if (conversationId) void loadThreadData(conversationId);
                  else setError(null);
                }}
                style={{
                  background: '#ffaa30',
                  color: '#000000',
                  border: 'none',
                  borderRadius: 4,
                  padding: '6px 16px',
                  fontFamily: 'monospace',
                  fontSize: 11,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                [ RETRY ]
              </button>
            </div>
          ) : isNewOrNoConversation ? (
            /* NO_CONVERSATION Initial Empty State */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: 'auto', maxWidth: 680, textAlign: 'center' }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255, 170, 48, 0.3) 0%, rgba(0, 0, 0, 0) 70%)',
                  border: '1px solid rgba(255, 170, 48, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffaa30',
                  marginBottom: 16,
                  boxShadow: '0 0 18px rgba(255, 170, 48, 0.25)',
                }}
              >
                <IconCore width={24} height={24} />
              </div>

              <div style={{ fontSize: 10, letterSpacing: '0.22em', color: '#885522', fontFamily: 'monospace', marginBottom: 6 }}>
                SYNTHROPHOS // CHAT
              </div>

              <h2 style={{ fontSize: 22, fontWeight: 'bold', color: '#ffaa30', letterSpacing: '0.03em', margin: '0 0 8px 0', textShadow: '0 0 10px rgba(255, 170, 48, 0.4)' }}>
                Start a conversation
              </h2>

              <p style={{ fontSize: 13, color: '#d99a4e', lineHeight: 1.6, maxWidth: 480, margin: '0 0 24px 0', fontFamily: 'monospace' }}>
                Ask Syntrophos to research something, plan a task, analyze your context, or simply think something through.
              </p>

              <button
                type="button"
                onClick={() => void submitMessage('Help me organize today’s work and key priority horizons')}
                style={{
                  background: '#ffaa30',
                  color: '#000000',
                  border: 'none',
                  borderRadius: 4,
                  padding: '8px 20px',
                  fontSize: 12,
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginBottom: 28,
                  boxShadow: '0 0 15px rgba(255, 170, 48, 0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <IconPlus width={14} height={14} /> [ Start a conversation ]
              </button>

              {/* Interactive Suggestion Cards Grid */}
              <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {INTENT_SUGGESTIONS.map((item) => {
                  const ItemIcon = item.Icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => void submitMessage(item.prompt)}
                      className="chat-suggestion-card"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ffaa30', fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace' }}>
                        <ItemIcon width={13} height={13} />
                        <span>{item.title}</span>
                      </div>
                      <div style={{ fontSize: 10, color: '#885522', fontFamily: 'monospace', lineHeight: 1.4 }}>
                        {item.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ACTIVE Conversation Message Stream */
            <div style={{ maxWidth: 880, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#885522', fontFamily: 'monospace', fontSize: 12 }}>
                  Thread initialized. Type a directive below to start.
                </div>
              ) : (
                messages.map((m, idx) => (
                  <div key={m.id || idx}>
                    <ChatMessageRow
                      message={m}
                      isProcessExpanded={isProcessExpanded}
                      onToggleProcess={() => setIsProcessExpanded((v) => !v)}
                      isContextExpanded={isContextExpanded}
                      onToggleContext={() => setIsContextExpanded((v) => !v)}
                      approved={approvedActionIds.includes('action-followup')}
                      onApprove={() => handleApproveAction('action-followup')}
                      onFollowupClick={(actionText) => void submitMessage(actionText)}
                    />
                  </div>
                ))
              )}

              {(isSending || isStarting) && (
                <div className="chat-process-bar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 'bold', color: '#ffaa30', fontFamily: 'monospace' }}>
                    <span className="island-pulse-orb" style={{ width: 6, height: 6 }} />
                    <span>SYNTHROPHOS PROCESS STATE // REASONING…</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8, fontSize: 11, fontFamily: 'monospace', color: '#34d399' }}>
                    <div>✓ Understanding directive &amp; intent</div>
                    <div>● Searching workspace context &amp; knowledge vault</div>
                    <div style={{ color: '#885522' }}>○ Composing response</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SINGLE Primary Bottom Message Composer */}
        <div style={{ padding: '16px 24px 24px 24px', borderTop: '1px solid rgba(255, 170, 48, 0.25)', background: '#050300' }}>
          <div style={{ maxWidth: 880, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Directive Pill Triggers */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
              {DIRECTIVES.map((d) => {
                const isSelected = activeDirective === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setActiveDirective(isSelected ? null : d.id);
                      inputRef.current?.focus();
                    }}
                    className={`directive-chip ${isSelected ? 'directive-chip--active' : ''}`}
                    title={d.hint}
                  >
                    <span>{d.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Input Composer Box */}
            <div
              style={{
                background: 'rgba(14, 7, 1, 0.95)',
                border: '1px solid rgba(255, 170, 48, 0.4)',
                borderRadius: 10,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'flex-end',
                gap: 12,
                boxShadow: '0 6px 24px rgba(0, 0, 0, 0.8)',
              }}
            >
              <textarea
                ref={inputRef}
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void submitMessage();
                  }
                }}
                placeholder='Ask Syntrophos anything... (e.g. "Draft Q3 status report or /research notes")'
                style={{
                  flex: '1 1 auto',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#ffcc66',
                  fontSize: 14,
                  fontFamily: 'monospace',
                  resize: 'none',
                }}
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <button
                  type="button"
                  style={{
                    background: 'rgba(255, 170, 48, 0.1)',
                    border: '1px solid rgba(255, 170, 48, 0.3)',
                    borderRadius: 4,
                    color: '#d99a4e',
                    padding: '6px 10px',
                    fontFamily: 'monospace',
                    fontSize: 10,
                    cursor: 'pointer',
                  }}
                  title="Attach Workspace Artifact"
                >
                  <IconPaperclip width={13} height={13} />
                </button>
                <button
                  type="button"
                  style={{
                    background: 'rgba(255, 170, 48, 0.1)',
                    border: '1px solid rgba(255, 170, 48, 0.3)',
                    borderRadius: 4,
                    color: '#d99a4e',
                    padding: '6px 10px',
                    fontFamily: 'monospace',
                    fontSize: 10,
                    cursor: 'pointer',
                  }}
                  title="Voice Input"
                >
                  <IconMic width={13} height={13} />
                </button>
                <button
                  type="button"
                  disabled={!input.trim() || isSending || isStarting}
                  onClick={() => void submitMessage()}
                  style={{
                    background: input.trim() ? '#ffaa30' : 'rgba(255, 170, 48, 0.15)',
                    color: input.trim() ? '#000000' : '#885522',
                    border: 'none',
                    borderRadius: 4,
                    padding: '6px 14px',
                    fontFamily: 'monospace',
                    fontSize: 11,
                    fontWeight: 'bold',
                    cursor: input.trim() ? 'pointer' : 'default',
                  }}
                >
                  [ ↵ DISPATCH ]
                </button>
              </div>
            </div>

            <div style={{ fontSize: 10, color: '#885522', fontFamily: 'monospace', textAlign: 'center' }}>
              SYNTROPHOS CHAT // PRESS ↵ TO DISPATCH · ⇧↵ FOR NEWLINE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConversationGroup({ label, items, activeId }: { readonly label: string; readonly items: Conversation[]; readonly activeId?: string | undefined }) {
  if (items.length === 0) return null;
  return (
    <div style={{ padding: '4px 0' }}>
      <div style={{ padding: '0 8px', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 700, color: '#885522', marginBottom: 6, fontFamily: 'monospace' }}>
        {label} · {items.length}
      </div>
      <ul role="list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map((c) => {
          const isSelected = c.id === activeId;
          return (
            <li key={c.id}>
              <Link
                to={`/chat/${c.id}`}
                style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 6,
                    background: isSelected ? 'rgba(120, 60, 0, 0.6)' : 'rgba(25, 13, 2, 0.4)',
                    border: isSelected ? '1px solid rgba(255, 170, 48, 0.6)' : '1px solid rgba(255, 170, 48, 0.15)',
                    transition: 'all 140ms ease',
                  }}
                >
                  <div style={{ minWidth: 0, flex: '1 1 auto', marginRight: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: isSelected ? 700 : 500, color: isSelected ? '#ffcc66' : '#d99a4e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{c.title ?? 'Untitled thread'}</span>
                      {c.status === 'pinned' && <IconStar width={10} height={10} style={{ color: '#ffaa30' }} />}
                    </div>
                    <div style={{ fontSize: 10, color: '#885522', fontFamily: 'monospace', marginTop: 2 }}>
                      2m ago {c.tags?.[0] ? `· ${c.tags[0].name.toUpperCase()}` : ''}
                    </div>
                  </div>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: isSelected ? '#ffaa30' : '#885522', display: 'inline-block' }} />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ChatMessageRow({
  message,
  isProcessExpanded,
  onToggleProcess,
  isContextExpanded,
  onToggleContext,
  approved,
  onApprove,
  onFollowupClick,
}: {
  readonly message: ChatMessage;
  readonly isProcessExpanded: boolean;
  readonly onToggleProcess: () => void;
  readonly isContextExpanded: boolean;
  readonly onToggleContext: () => void;
  readonly approved: boolean;
  readonly onApprove: () => void;
  readonly onFollowupClick: (action: string) => void;
}) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
        <div
          style={{
            maxWidth: '75%',
            background: 'rgba(25, 13, 2, 0.75)',
            border: '1px solid rgba(255, 170, 48, 0.35)',
            borderRadius: 8,
            padding: '12px 16px',
            color: '#ffcc66',
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          <div style={{ fontSize: 10, color: '#885522', fontFamily: 'monospace', marginBottom: 4 }}>
            OPERATOR DIRECTIVE · {new Date(message.audit?.createdAt ?? Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div>{message.content}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, fontFamily: 'monospace', color: '#ffaa30' }}>
        <IconBot width={14} height={14} />
        <span>SYNTHROPHOS // ASSISTANT</span>
        <span style={{ fontSize: 10, color: '#885522', marginLeft: 'auto' }}>
          {new Date(message.audit?.createdAt ?? Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* AI Process State Bar */}
      <div className="chat-process-bar">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, fontWeight: 'bold', color: '#ffaa30', fontFamily: 'monospace' }}>
            <span className="island-pulse-orb" style={{ width: 5, height: 5 }} />
            <span>PROCESS STATE: COMPLETE</span>
          </div>
          <button
            type="button"
            onClick={onToggleProcess}
            style={{ background: 'transparent', border: 'none', color: '#885522', fontSize: 10, fontFamily: 'monospace', cursor: 'pointer' }}
          >
            {isProcessExpanded ? '[ HIDE TRACE ]' : '[ SHOW TRACE ]'}
          </button>
        </div>

        {isProcessExpanded && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8, fontSize: 10, fontFamily: 'monospace', color: '#34d399' }}>
            <div>✓ Understanding directive &amp; intent</div>
            <div>✓ Searching workspace knowledge vault &amp; calendar nodes</div>
            <div>✓ Formatting structured synthesis</div>
          </div>
        )}
      </div>

      {/* Accessed Context Cards */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <div className="chat-context-card" onClick={onToggleContext}>
          <div style={{ fontSize: 10, color: '#ffaa30', fontFamily: 'monospace', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconCalendar width={12} height={12} />
            <span>Calendar · 2 relevant events</span>
          </div>
        </div>
        <div className="chat-context-card" onClick={onToggleContext}>
          <div style={{ fontSize: 10, color: '#ffaa30', fontFamily: 'monospace', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconNotes width={12} height={12} />
            <span>Knowledge Vault · 7 indexed notes</span>
          </div>
        </div>
      </div>

      {/* Expanded Context Details */}
      {isContextExpanded && (
        <div className="evidence-container">
          <div style={{ fontSize: 10, color: '#ffaa30', fontFamily: 'monospace', fontWeight: 'bold' }}>
            ACCESSED WORKSPACE CONTEXT:
          </div>
          <ul style={{ margin: '4px 0 0 16px', padding: 0, fontSize: 10, color: '#885522', fontFamily: 'monospace', lineHeight: 1.5 }}>
            <li>Calendar: Q3 Strategic Planning (2:00 PM)</li>
            <li>Vault Note: q3-roadmap-milestones.md</li>
            <li>Vault Note: team-status-report.md</li>
          </ul>
        </div>
      )}

      {/* Response Text Body */}
      <div style={{ fontSize: 13, color: '#ffcc66', lineHeight: 1.6, paddingLeft: 4 }}>
        {message.content.split('\n').map((line, i) => (
          <p key={i} style={{ margin: i === 0 ? 0 : '8px 0 0 0' }}>{line}</p>
        ))}
      </div>

      {/* Human-In-The-Loop Proposed Action Card */}
      {!approved ? (
        <div className="chat-proposed-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#ffaa30', fontFamily: 'monospace', fontWeight: 'bold' }}>
            <IconAlertCircle width={12} height={12} />
            <span>SYNTHROPHOS PROPOSES</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 'bold', color: '#ffcc66', marginTop: 4 }}>
            Send follow-up status email to team lead
          </div>
          <div style={{ fontSize: 11, color: '#885522', fontFamily: 'monospace', marginTop: 2 }}>
            Based on the context analysis above, I can draft and dispatch a follow-up email.
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button
              type="button"
              onClick={onApprove}
              style={{
                background: '#ffaa30',
                border: 'none',
                borderRadius: 4,
                color: '#000000',
                fontWeight: 'bold',
                fontFamily: 'monospace',
                fontSize: 10,
                padding: '5px 14px',
                cursor: 'pointer',
              }}
            >
              [ APPROVE &amp; DISPATCH ]
            </button>
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 11, color: '#34d399', fontFamily: 'monospace', padding: '4px 0' }}>
          ✓ PROPOSED ACTION APPROVED &amp; DISPATCHED
        </div>
      )}

      {/* Suggested Follow-up Actions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
        <button
          type="button"
          onClick={() => onFollowupClick('Create deliverable task from this synthesis')}
          style={{
            background: 'rgba(255, 170, 48, 0.1)',
            border: '1px solid rgba(255, 170, 48, 0.25)',
            borderRadius: 4,
            color: '#d99a4e',
            fontFamily: 'monospace',
            fontSize: 10,
            padding: '4px 10px',
            cursor: 'pointer',
          }}
        >
          [ CREATE TASK ]
        </button>
        <button
          type="button"
          onClick={() => onFollowupClick('Schedule follow-up event in calendar')}
          style={{
            background: 'rgba(255, 170, 48, 0.1)',
            border: '1px solid rgba(255, 170, 48, 0.25)',
            borderRadius: 4,
            color: '#d99a4e',
            fontFamily: 'monospace',
            fontSize: 10,
            padding: '4px 10px',
            cursor: 'pointer',
          }}
        >
          [ SCHEDULE EVENT ]
        </button>
        <button
          type="button"
          onClick={() => onFollowupClick('Save summary to Obsidian knowledge vault')}
          style={{
            background: 'rgba(255, 170, 48, 0.1)',
            border: '1px solid rgba(255, 170, 48, 0.25)',
            borderRadius: 4,
            color: '#d99a4e',
            fontFamily: 'monospace',
            fontSize: 10,
            padding: '4px 10px',
            cursor: 'pointer',
          }}
        >
          [ SAVE TO VAULT ]
        </button>
      </div>
    </div>
  );
}
