import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader.jsx';
import { Avatar, Badge, Button, Card, CardBody, CardHeader, CardTitle, Input, Separator } from '@/components/ui/primitives.js';
import { ErrorState, EmptyState, PageLoader } from '@/components/ui/states.js';
import { IconFolder, IconNotes, IconPlus, IconSearch, IconStar } from '@/lib/icons.jsx';
import { useNotes } from '@/lib/services/index.js';
import type { Note, FolderNode } from '@/lib/services/notes.contract.js';

export default function NotesListPage() {
  const { list, listFolders } = useNotes();
  const [query, setQuery] = useState('');
  const [folderId, setFolderId] = useState<string | 'all'>('all');
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<FolderNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        setLoading(true);
        const [n, f] = await Promise.all([list({ pageSize: 50 }), listFolders()]);
        if (!mounted) return;
        setNotes(n.items as Note[]);
        setFolders(f.children as FolderNode[]);
      } catch (err) {
        if (mounted) setError(err as Error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [list, listFolders]);

  const filtered = useMemo(() => {
    return notes.filter((n) => {
      if (folderId !== 'all' && !n.path?.startsWith(folderId)) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return ((n.frontmatter?.title ?? n.title ?? '').toLowerCase().includes(q) || (n.content ?? '').toLowerCase().includes(q));
    });
  }, [notes, folderId, query]);

  return (
    <div className="notes-layout">
      <aside className="notes-folders">
        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div className="inline-stack" style={{ justifyContent: 'space-between' }}>
            <h1 style={{ fontSize: 16, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <IconNotes width={18} height={18} /> Notes
            </h1>
            <Link to="/notes/new" className="ui-btn ui-btn--primary ui-btn--sm" style={{ textDecoration: 'none' }}>
              <IconPlus width={14} height={14} /> New
            </Link>
          </div>
        </div>
        <div style={{ overflowY: 'auto', flex: '1 1 auto' }}>
          {loading ? (
            <PageLoader />
          ) : error ? (
            <ErrorState title="Failed to load notes" error={error.message} />
          ) : (
            <ul role="list" style={{ listStyle: 'none', padding: 'var(--space-3)', margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <FolderRow
                icon={<IconNotes width={16} height={16} />}
                label="All notes"
                count={notes.length}
                active={folderId === 'all'}
                onClick={() => setFolderId('all')}
              />
              <FolderRow
                icon={<IconStar width={16} height={16} />}
                label="Starred"
                count={notes.filter((n) => n.tags?.includes('starred') || (n as { starred?: boolean }).starred).length}
                active={folderId === '__starred'}
                onClick={() => setFolderId('__starred')}
              />
              <div style={{ height: 'var(--space-2)' }} />
              {folders.map((f) => (
                <FolderTree key={f.id} node={f} depth={0} activeFolder={folderId} onSelect={setFolderId} />
              ))}
            </ul>
          )}
        </div>
      </aside>

      <div className="notes-list">
        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
          <Input
            id="notes-search"
            placeholder="Search notes by title, tag, or content…"
            leading={<IconSearch width={16} height={16} />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div style={{ overflowY: 'auto', flex: '1 1 auto' }}>
          {loading ? (
            <PageLoader />
          ) : filtered.length === 0 ? (
            <div style={{ padding: 'var(--space-8)' }}>
              <EmptyState
                icon={<IconNotes width={36} height={36} />}
                title={query ? 'No notes match your search' : 'No notes in this view'}
                description={query ? 'Try different keywords or clear filters.' : 'Create your first note to start building your knowledge base.'}
                action={{ label: 'Create note', onClick: () => (window.location.href = '/notes/new') }}
              />
            </div>
          ) : (
            <ul role="list" style={{ listStyle: 'none', padding: 'var(--space-3)', margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              {filtered.map((n) => (
                <li key={n.id}>
                  <Link to={`/notes/${n.path ?? n.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                    <div
                      style={{
                        padding: 'var(--space-4)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid transparent',
                        transition: 'background 120ms ease, border-color 120ms ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface-hover)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.borderColor = ''; }}
                    >
                      <div className="inline-stack" style={{ justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          {(n.tags?.includes('starred') || (n as { starred?: boolean }).starred) && <IconStar width={12} height={12} style={{ color: 'var(--color-warning-500)' }} />}
                          {n.frontmatter?.title ?? n.title ?? 'Untitled'}
                        </div>
                        <Badge size="sm" tone={(n.frontmatter?.status ?? 'published') === 'published' ? 'success' : 'default'} dot>
                          {n.frontmatter?.status ?? 'note'}
                        </Badge>
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {n.excerpt ?? n.content ?? 'No content yet.'}
                      </p>
                      <div style={{ marginTop: 'var(--space-3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--color-text-subtle)' }}>
                        <span>{n.path}</span>
                        <span>{new Date(n.audit?.updatedAt ?? n.audit?.createdAt ?? Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="notes-reader">
        <div style={{ padding: 'var(--space-8)', maxWidth: '72ch', margin: '0 auto' }}>
          <EmptyState
            tone="default"
            size="md"
            icon={<IconNotes width={36} height={36} />}
            title="Select a note to read"
            description="Pick a note from the list, or create a new one. Your notes are stored as Markdown in your vault."
            action={{
              label: 'Create note',
              onClick: () => (window.location.href = '/notes/new'),
            }}
          />
        </div>
      </div>
    </div>
  );
}

function FolderRow({
  icon,
  label,
  count,
  active,
  onClick,
}: {
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly count: number;
  readonly active?: boolean;
  readonly onClick?: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          width: '100%',
          padding: 'var(--space-2) var(--space-3)',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          background: active ? 'color-mix(in srgb, var(--color-primary-500) 12%, transparent)' : 'transparent',
          color: active ? 'var(--color-primary-600)' : 'var(--color-text)',
          fontSize: 'var(--font-size-sm)',
          cursor: 'pointer',
          fontWeight: active ? 600 : 500,
          textAlign: 'left',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>{icon}</span>
        <span style={{ flex: '1 1 auto', minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
        <Badge size="sm" tone={active ? 'primary' : 'default'}>{count}</Badge>
      </button>
    </li>
  );
}

function FolderTree({
  node,
  depth,
  activeFolder,
  onSelect,
}: {
  readonly node: FolderNode;
  readonly depth: number;
  readonly activeFolder: string | 'all';
  readonly onSelect: (id: string) => void;
}) {
  return (
    <>
      <FolderRow
        icon={<IconFolder width={16} height={16} />}
        label={node.name}
        count={node.noteCount}
        active={activeFolder === node.id}
        onClick={() => onSelect(node.id)}
      />
      {node.children?.map((child) => (
        <FolderTree key={child.id} node={child} depth={depth + 1} activeFolder={activeFolder} onSelect={onSelect} />
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 *  NOTE READER PAGE
 * ──────────────────────────────────────────────────────────────────────────── */

export function NoteReaderPageInner() {
  const { '*': path } = useParams<{ readonly '*'?: string }>();
  const { getByPath, get } = useNotes();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isNew = !path || path === 'new';

  useEffect(() => {
    if (isNew) {
      setNote(null);
      setLoading(false);
      return;
    }
    let mounted = true;
    void (async () => {
      try {
        setLoading(true);
        const n = path?.includes('/') ? await getByPath(path) : await get(path);
        if (mounted) setNote(n);
      } catch (err) {
        if (mounted) setError(err as Error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isNew, path, getByPath, get]);

  return (
    <div className="notes-layout">
      <aside className="notes-folders notes-folders--detail">
        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{isNew ? 'New note' : note?.frontmatter?.title ?? note?.title ?? 'Reading…'}</div>
        </div>
        <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, color: 'var(--color-text-subtle)', marginBottom: 'var(--space-3)' }}>
              Metadata
            </div>
            {!loading && note && (
              <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-2)', fontSize: 12 }}>
                <div className="inline-stack" style={{ justifyContent: 'space-between' }}>
                  <dt style={{ color: 'var(--color-text-muted)' }}>Status</dt>
                  <Badge size="sm" tone={(note.frontmatter?.status ?? 'published') === 'published' ? 'success' : 'default'} dot>{note.frontmatter?.status ?? 'note'}</Badge>
                </div>
                <div className="inline-stack" style={{ justifyContent: 'space-between' }}>
                  <dt style={{ color: 'var(--color-text-muted)' }}>Path</dt>
                  <dd style={{ fontFamily: 'var(--font-mono)', fontSize: 10, margin: 0 }}>{note.path ?? note.id}</dd>
                </div>
                <div className="inline-stack" style={{ justifyContent: 'space-between' }}>
                  <dt style={{ color: 'var(--color-text-muted)' }}>Updated</dt>
                  <dd style={{ margin: 0, fontSize: 11 }}>{new Date(note.audit?.updatedAt ?? note.audit?.createdAt ?? Date.now()).toLocaleDateString()}</dd>
                </div>
              </dl>
            )}
          </div>
          <Separator />
          <div>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, color: 'var(--color-text-subtle)', marginBottom: 'var(--space-3)' }}>
              Tags
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {note?.tags?.map((t) => (
                <Badge key={t} tone="violet" size="sm">#{t}</Badge>
              )) ?? (
                <span style={{ fontSize: 12, color: 'var(--color-text-subtle)' }}>No tags yet</span>
              )}
            </div>
          </div>
        </div>
      </aside>
      <div className="notes-list notes-list--empty" />
      <div className="notes-reader">
        <div style={{ overflowY: 'auto', flex: '1 1 auto' }}>
          {loading ? (
            <PageLoader />
          ) : error ? (
            <ErrorState title="Failed to load note" error={error.message} />
          ) : isNew ? (
            <NewNoteDraft />
          ) : note ? (
            <article style={{ padding: 'var(--space-8)', maxWidth: '72ch', margin: '0 auto' }}>
              <header style={{ marginBottom: 'var(--space-6)' }}>
                <div style={{ fontSize: 12, color: 'var(--color-text-subtle)', fontFamily: 'var(--font-mono)', marginBottom: 'var(--space-3)' }}>
                  {note.path}
                </div>
                <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0 }}>
                  {note.frontmatter?.title ?? note.title ?? 'Untitled note'}
                </h1>
                {note.excerpt && <p style={{ fontSize: 16, color: 'var(--color-text-muted)', marginTop: 'var(--space-3)' }}>{note.excerpt}</p>}
              </header>
              <div
                style={{ lineHeight: 1.7, fontSize: 16 }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(note.content ?? '') }}
              />
            </article>
          ) : (
            <div style={{ padding: 'var(--space-8)' }}>
              <EmptyState icon={<IconNotes width={28} height={28} />} title="Note not found" description="This note may have been moved or renamed." />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NewNoteDraft() {
  return (
    <div style={{ padding: 'var(--space-8)', maxWidth: '72ch', margin: '0 auto' }}>
      <header style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0, outline: 'none' }} contentEditable suppressContentEditableWarning>
          Untitled note
        </h1>
        <p style={{ fontSize: 16, color: 'var(--color-text-muted)', marginTop: 'var(--space-3)' }}>Start typing your note…</p>
      </header>
      <div style={{ lineHeight: 1.7, fontSize: 16, minHeight: 300, outline: 'none' }} contentEditable suppressContentEditableWarning />
    </div>
  );
}

function renderMarkdown(md: string): string {
  const paragraphs = md.split(/\n\n+/).map((p) => {
    const inline = p
      .replace(/^# (.*)$/gm, '<h1 style="font-size:26px;font-weight:800;letter-spacing:-0.01em;margin:1.2em 0 0.6em">$1</h1>')
      .replace(/^## (.*)$/gm, '<h2 style="font-size:22px;font-weight:700;margin:1.2em 0 0.6em">$1</h2>')
      .replace(/^### (.*)$/gm, '<h3 style="font-size:18px;font-weight:700;margin:1em 0 0.5em">$1</h3>')
      .replace(/`([^`]+)`/g, '<code style="font-family:var(--font-mono);font-size:0.9em;background:var(--color-background-muted);padding:1px 6px;border-radius:var(--radius-sm)">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>');
    if (inline.startsWith('<h')) return inline;
    return `<p style="margin:0 0 var(--space-4)">${inline}</p>`;
  });
  return paragraphs.join('\n');
}

export const NoteReaderPage = NoteReaderPageInner;
