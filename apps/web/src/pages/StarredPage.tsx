import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge, Card, CardBody } from '@/components/ui/primitives';
import { ErrorState, EmptyState, PageLoader } from '@/components/ui/states';
import { IconChat, IconNotes, IconStar, IconTasks } from '@/lib/icons';
import { useNotes, useTasks, useChat } from '@/lib/services/index';
import type { Note } from '@/lib/services/notes.contract';
import type { Task } from '@/lib/services/tasks.contract';
import type { Conversation } from '@/lib/services/chat.contract';

export default function StarredPage() {
  const { list: listNotes } = useNotes();
  const { listTasks } = useTasks();
  const { listConversations } = useChat();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [chats, setChats] = useState<Conversation[]>([]);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        setLoading(true);
        const [n, t, c] = await Promise.all([
          listNotes({ pageSize: 50 }),
          listTasks ? listTasks({ pageSize: 100 }) : Promise.resolve({ items: [] as Task[], total: 0, hasMore: false }),
          listConversations({ pageSize: 50 }),
        ]);
        if (!mounted) return;
        setNotes((n.items ?? []).filter((x: Note) => x.tags?.includes('starred') || (x as { starred?: boolean }).starred) as Note[]);
        setTasks((t.items ?? []).filter((x: Task) => x.tags?.includes('starred') || (x as { starred?: boolean }).starred) as Task[]);
        setChats((c.items ?? []).filter((x: Conversation) => x.status === 'pinned' || x.tags?.some((tag) => tag.name === 'pinned' || tag.name === 'starred')) as Conversation[]);
      } catch (err) {
        if (mounted) setError(err as Error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [listNotes, listTasks, listConversations]);

  const total = notes.length + tasks.length + chats.length;

  return (
    <div className="shell-page shell-page--wide">
      <PageHeader
        variant="wide"
        icon={<IconStar width={22} height={22} />}
        title="Starred"
        subtitle={`${total} starred items across your workspace`}
      />
      <div style={{ padding: '0 var(--space-6) var(--space-8)' }}>
        {loading ? (
          <PageLoader />
        ) : error ? (
          <ErrorState title="Failed to load starred items" error={error.message} />
        ) : total === 0 ? (
          <EmptyState
            size="lg"
            tone="default"
            icon={<IconStar width={36} height={36} />}
            title="No starred items"
            description="Star notes, tasks, or conversations for quick access here."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {chats.length > 0 && (
              <section>
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, color: 'var(--color-text-subtle)', marginBottom: 'var(--space-3)' }}>
                  Conversations ({chats.length})
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
                  {chats.map((c) => (
                    <Link key={c.id} to={`/chat/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <Card tone="default">
                        <CardBody style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <IconChat width={18} height={18} style={{ color: 'var(--color-accent-violet)', flexShrink: 0 }} />
                          <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                            <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</div>
                            <div style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>{c.preview || 'Conversation'}</div>
                          </div>
                          <Badge tone="violet" size="sm">Pinned</Badge>
                        </CardBody>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {notes.length > 0 && (
              <section>
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, color: 'var(--color-text-subtle)', marginBottom: 'var(--space-3)' }}>
                  Notes ({notes.length})
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
                  {notes.map((n) => (
                    <Link key={n.id} to={`/notes/${n.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <Card tone="default">
                        <CardBody style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <IconNotes width={18} height={18} style={{ color: 'var(--color-primary-500)', flexShrink: 0 }} />
                          <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                            <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.title}</div>
                            <div style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>{n.path}</div>
                          </div>
                        </CardBody>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {tasks.length > 0 && (
              <section>
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, color: 'var(--color-text-subtle)', marginBottom: 'var(--space-3)' }}>
                  Tasks ({tasks.length})
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
                  {tasks.map((t) => (
                    <Link key={t.id} to="/tasks" style={{ textDecoration: 'none', color: 'inherit' }}>
                      <Card tone="default">
                        <CardBody style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <IconTasks width={18} height={18} style={{ color: 'var(--color-accent-amber)', flexShrink: 0 }} />
                          <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                            <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</div>
                            <div style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>{t.status}</div>
                          </div>
                          <Badge tone="warning" size="sm">{t.priority}</Badge>
                        </CardBody>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
