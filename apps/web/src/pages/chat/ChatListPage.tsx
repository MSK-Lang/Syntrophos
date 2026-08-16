import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Avatar, Badge, Button, Input, Separator } from '@/components/ui/primitives.js';
import { ErrorState, EmptyState, PageLoader } from '@/components/ui/states.js';
import { IconBot, IconChat, IconChevronDown, IconMic, IconPaperclip, IconPlus, IconSearch, IconSend, IconStar, IconX } from '@/lib/icons.jsx';
import { useChat, useAgents, useProviders } from '@/lib/services/index.js';
import type { Conversation, ChatMessage, MessageRole } from '@/lib/services/chat.contract.js';
import type { Agent } from '@/lib/services/agents.contract.js';
import type { Provider } from '@/lib/services/providers.contract.js';

export default function ChatListPage() {
  const navigate = useNavigate();
  const { listConversations, createConversation } = useChat();
  const [query, setQuery] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        setLoading(true);
        const r = await listConversations({ pageSize: 50 });
        if (mounted) setConversations(r.items as Conversation[]);
      } catch (err) {
        if (mounted) setError(err as Error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [listConversations]);

  const filtered = useMemo(() => {
    if (!query.trim()) return conversations;
    const q = query.toLowerCase();
    return conversations.filter((c) => (c.title ?? '').toLowerCase().includes(q));
  }, [conversations, query]);

  const pinned = filtered.filter((c) => c.status === 'pinned');
  const active = filtered.filter((c) => c.status === 'active');
  const archived = filtered.filter((c) => c.status === 'archived');

  return (
    <div className="chat-layout">
      <aside className="chat-conversations">
        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div className="inline-stack" style={{ justifyContent: 'space-between' }}>
            <h1 style={{ fontSize: 16, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <IconChat width={18} height={18} /> Chat
            </h1>
            <button
              type="button"
              className="ui-btn ui-btn--primary ui-btn--sm"
              onClick={() => {
                void (async () => {
                  const c = await createConversation({ title: 'New conversation' });
                  navigate(`/chat/${c.id}`);
                })();
              }}
            >
              <IconPlus width={14} height={14} /> New
            </button>
          </div>
          <Input
            placeholder="Search conversations…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leading={<IconSearch width={14} height={14} />}
          />
        </div>

        <div style={{ overflowY: 'auto', flex: '1 1 auto', padding: 'var(--space-2)' }}>
          {loading ? (
            <PageLoader label="Loading conversations…" />
          ) : error ? (
            <ErrorState title="Failed to load conversations" error={error.message} />
          ) : conversations.length === 0 ? (
            <div style={{ padding: 'var(--space-6)' }}>
              <EmptyState
                size="sm"
                icon={<IconChat width={24} height={24} />}
                title="No conversations yet"
                description="Start a new chat to begin collaborating with Syntrophos."
                action={{
                  label: 'Start chat',
                  onClick: () => void createConversation({ title: 'New conversation' }).then((c) => navigate(`/chat/${c.id}`)),
                }}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {pinned.length > 0 && <ConversationGroup label="Pinned" items={pinned} />}
              {active.length > 0 && <ConversationGroup label="Recent" items={active} />}
              {archived.length > 0 && <ConversationGroup label="Archived" items={archived} />}
            </div>
          )}
        </div>
      </aside>
      <div className="chat-thread">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%', padding: 'var(--space-8)', gap: 'var(--space-5)' }}>
          <div
            aria-hidden="true"
            style={{
              width: 72, height: 72, borderRadius: 'var(--radius-xl)',
              background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-accent-violet))',
              color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <IconBot width={32} height={32} />
          </div>
          <div style={{ textAlign: 'center', maxWidth: 480 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>Good thinking starts with a conversation</h2>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-3)', lineHeight: 1.5 }}>
              Pick a conversation from the sidebar or start a new one. Ask questions, plan tasks, summarise long notes, collaborate with agents, or just think out loud.
            </p>
          </div>
          <div className="inline-stack" style={{ flexWrap: 'wrap', justifyContent: 'center', gap: 'var(--space-3)' }}>
            <Button variant="primary" onClick={() => navigate('/chat/new')}><IconPlus width={16} height={16} /> New conversation</Button>
            <Button variant="ghost" onClick={() => navigate('/agents')}><IconBot width={16} height={16} /> Browse agents</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConversationGroup({ label, items }: { readonly label: string; readonly items: Conversation[] }) {
  if (items.length === 0) return null;
  return (
    <div style={{ padding: 'var(--space-3) 0' }}>
      <div style={{ padding: '0 var(--space-4)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, color: 'var(--color-text-subtle)', marginBottom: 'var(--space-1)' }}>
        {label} · {items.length}
      </div>
      <ul role="list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {items.map((c) => (
          <li key={c.id}>
            <Link
              to={`/chat/${c.id}`}
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <div className="chat-conv-row">
                <Avatar size="sm" name={c.title ?? 'Chat'} tone={c.status === 'pinned' ? 'primary' : 'default'} />
                <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                  <div className="chat-conv-row__title inline-stack-sm">
                    <span>{c.title ?? 'Untitled conversation'}</span>
                    {c.status === 'pinned' && <IconStar width={12} height={12} style={{ color: 'var(--color-warning-500)' }} />}
                  </div>
                  <div className="chat-conv-row__subtitle">{c.preview || 'No messages yet'}</div>
                </div>
                {c.tags?.[0] && <Badge size="sm" tone="violet">{c.tags[0].name}</Badge>}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 *  CHAT THREAD PAGE
 * ──────────────────────────────────────────────────────────────────────────── */

export function ChatThreadPage() {
  const { conversationId } = useParams();
  const { getConversation, listMessages, sendMessage, createConversation } = useChat();
  const { list: listAgents } = useAgents();
  const { list: listProviders, getDefaults } = useProviders();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isNew = !conversationId;

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        setLoading(true);
        const [a, p] = await Promise.all([
          listAgents({ pageSize: 20 }),
          listProviders(),
        ]);
        if (mounted) setAgents(a.items as Agent[]);
        if (mounted) setProviders(p.items as Provider[]);
        if (isNew) {
          if (mounted) {
            const created = await createConversation({ title: 'New conversation' });
            setConversation(created);
          }
        } else if (conversationId) {
          const [conv, msgs] = await Promise.all([
            getConversation(conversationId),
            listMessages(conversationId, { pageSize: 100 }),
          ]);
          if (mounted) {
            setConversation(conv);
            setMessages(msgs.items as ChatMessage[]);
          }
        }
      } catch (err) {
        if (mounted) setError(err as Error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isNew, conversationId, getConversation, listMessages, listAgents, listProviders, createConversation]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, loading]);

  const submit = async () => {
    const text = input.trim();
    if (!text || !conversation || sending) return;
    setSending(true);
    setInput('');
    try {
      const userMsg: ChatMessage = {
        id: `u${Date.now()}` as never,
        conversationId: conversation.id,
        role: 'user' as MessageRole,
        content: text,
        audit: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      };
      setMessages((cur) => [...cur, userMsg]);
      const reply = await sendMessage({ conversationId: conversation.id, content: text });
      setMessages((cur) => [...cur, reply]);
    } catch (err) {
      setError(err as Error);
    } finally {
      setSending(false);
    }
  };

  const back = (
    <Link
      to="/chat"
      className="ui-btn ui-btn--ghost ui-btn--icon"
      style={{ width: 32, height: 32, textDecoration: 'none' }}
      aria-label="Back to conversations"
    >
      <IconChevronDown width={16} height={16} style={{ transform: 'rotate(90deg)' }} />
    </Link>
  );

  return (
    <div className="chat-layout">
      <aside className="chat-conversations chat-conversations--detail">
        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
          <div className="inline-stack" style={{ justifyContent: 'space-between' }}>
            {back}
            <button
              type="button"
              className="ui-btn ui-btn--ghost ui-btn--icon"
              style={{ width: 32, height: 32 }}
              onClick={() => navigate('/chat')}
              aria-label="Close thread"
            >
              <IconX width={16} height={16} />
            </button>
          </div>
        </div>
        <div style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, color: 'var(--color-text-subtle)', marginBottom: 'var(--space-3)' }}>
              Agents in thread
            </div>
            <div className="stack-sm">
              {agents.slice(0, 4).map((a) => (
                <div key={a.id} className="agent-chip">
                  <Avatar size="sm" name={a.name} tone={a.status === 'available' ? 'teal' : 'default'} icon={<IconBot width={14} height={14} />} />
                  <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                    <div className="agent-chip__name">{a.name}</div>
                    <div className="agent-chip__desc">{a.type}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Separator />
          <div>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, color: 'var(--color-text-subtle)', marginBottom: 'var(--space-3)' }}>
              Provider &amp; Model
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {providers.filter((p) => p.status === 'configured').slice(0, 3).map((p) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-surface)' }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{p.name}</div>
                  <Badge size="sm" tone="success" dot>configured</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <div className="chat-thread">
        <header style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {conversation?.title ?? isNew ? 'New conversation' : 'Loading…'}
            </div>
            {conversation?.tags?.[0] && (
              <div className="inline-stack-sm" style={{ marginTop: 4 }}>
                <Badge size="sm" tone="violet">{conversation.tags[0].name}</Badge>
                <Badge size="sm" tone="default">{messages.length} messages</Badge>
              </div>
            )}
          </div>
        </header>

        <div ref={scrollRef} className="chat-thread__messages">
          {loading ? (
            <PageLoader />
          ) : error ? (
            <ErrorState title="Failed to load conversation" error={error.message} />
          ) : messages.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, padding: 'var(--space-8)' }}>
              <EmptyState
                size="md"
                tone="default"
                icon={<IconChat width={32} height={32} />}
                title="Start the conversation"
                description="Ask a question, brainstorm, or drop a note for context. Syntrophos will help you think it through."
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', padding: 'var(--space-6)', maxWidth: 860, margin: '0 auto', width: '100%' }}>
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
            </div>
          )}
        </div>

        <div className="chat-composer">
          <div className="chat-composer__inner">
            <button
              type="button"
              className="ui-btn ui-btn--ghost ui-btn--icon"
              style={{ width: 36, height: 36, alignSelf: 'flex-end' }}
              aria-label="Attach file"
            >
              <IconPaperclip width={16} height={16} />
            </button>
            <textarea
              className="chat-composer__input"
              rows={2}
              placeholder="Message Syntrophos… (press ⏎ to send, ⇧⏎ for newline)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void submit();
                }
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', alignSelf: 'flex-end' }}>
              <button
                type="button"
                className="ui-btn ui-btn--ghost ui-btn--icon"
                style={{ width: 36, height: 36 }}
                aria-label="Voice input"
              >
                <IconMic width={16} height={16} />
              </button>
              <button
                type="button"
                className="ui-btn ui-btn--primary ui-btn--icon"
                style={{ width: 36, height: 36 }}
                disabled={!input.trim() || sending}
                onClick={() => void submit()}
                aria-label="Send message"
              >
                <IconSend width={16} height={16} />
              </button>
            </div>
          </div>
          <div className="chat-composer__footer">
            <span className="muted">AI may produce inaccurate information. Verify important outputs.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { readonly message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={`chat-msg ${isUser ? 'chat-msg--user' : 'chat-msg--assistant'}`}>
      <Avatar
        size="sm"
        tone={isUser ? 'primary' : 'violet'}
        name={isUser ? 'You' : 'AI'}
        icon={!isUser ? <IconBot width={14} height={14} /> : undefined}
      />
      <div style={{ minWidth: 0, flex: '1 1 auto', maxWidth: '100%' }}>
        <div className="inline-stack-sm" style={{ marginBottom: 'var(--space-2)' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)' }}>
            {isUser ? 'You' : 'Assistant'}
          </span>
          {message.tokens && (
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--color-text-subtle)' }}>
              {message.tokens.input}→{message.tokens.output} tokens
            </span>
          )}
          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--color-text-subtle)' }}>
            {new Date(message.audit?.createdAt ?? Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="chat-msg__body">
          {message.content.split('\n').map((line, i) => (
            <p key={i} style={{ margin: i === 0 ? 0 : 'var(--space-3) 0 0' }}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
