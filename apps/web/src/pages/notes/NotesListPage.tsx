import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Badge, Button, Input } from '@/components/ui/primitives.js';
import { ErrorState, EmptyState, PageLoader } from '@/components/ui/states.js';
import {
  IconFolder,
  IconNotes,
  IconPlus,
  IconSearch,
  IconStar,
  IconBot,
  IconCheckCircle,
  IconX,
  IconCode,
  IconChevronDown,
  IconCalendar,
  IconTasks,
} from '@/lib/icons.js';
import { useNotes } from '@/lib/services/index.js';
import type { Note, FolderNode } from '@/lib/services/notes.contract.js';

export default function NotesListPage() {
  return <SyntrophosNotesWorkspace />;
}

export function NoteReaderPage() {
  return <SyntrophosNotesWorkspace />;
}

export function SyntrophosNotesWorkspace() {
  const { '*': rawPath } = useParams<{ readonly '*'?: string }>();
  const navigate = useNavigate();
  const { list, listFolders, getByPath, get, create, delete: deleteNote } = useNotes();

  const noteIdOrPath = rawPath?.trim() || null;
  const isNewNoteRoute = noteIdOrPath === 'new';
  const hasSelectedNote = Boolean(noteIdOrPath && !isNewNoteRoute);

  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<FolderNode[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [errorNotes, setErrorNotes] = useState<Error | null>(null);

  const [activeFolderId, setActiveFolderId] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected note state
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [errorDetail, setErrorDetail] = useState<Error | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  // New Note Modal state
  const [isNewModalOpen, setIsNewModalOpen] = useState(isNewNoteRoute);
  const [newTitle, setNewTitle] = useState('');
  const [newFolder, setNewFolder] = useState('');
  const [newContent, setNewContent] = useState('');

  const contentRef = useRef<HTMLDivElement | null>(null);

  // 1. Fetch Notes & Folders list
  const loadWorkspaceData = async () => {
    try {
      setLoadingNotes(true);
      setErrorNotes(null);
      const [nRes, fRes] = await Promise.all([
        list({ pageSize: 100 }),
        listFolders(),
      ]);
      setNotes(nRes.items as Note[]);
      setFolders(fRes.children as FolderNode[]);
    } catch (err) {
      setErrorNotes(err as Error);
    } finally {
      setLoadingNotes(false);
    }
  };

  useEffect(() => {
    void loadWorkspaceData();
  }, []);

  // 2. Fetch Selected Note when noteIdOrPath changes
  useEffect(() => {
    if (isNewNoteRoute) {
      setIsNewModalOpen(true);
      setCurrentNote(null);
      setLoadingDetail(false);
      setErrorDetail(null);
      return;
    }

    if (!noteIdOrPath) {
      setCurrentNote(null);
      setLoadingDetail(false);
      setErrorDetail(null);
      return;
    }

    let mounted = true;
    void (async () => {
      try {
        setLoadingDetail(true);
        setErrorDetail(null);
        setAiAnalysis(null);
        const n = noteIdOrPath.includes('/')
          ? await getByPath(noteIdOrPath)
          : await get(noteIdOrPath);
        if (mounted) setCurrentNote(n);
      } catch (err) {
        if (mounted) setErrorDetail(err as Error);
      } finally {
        if (mounted) setLoadingDetail(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [noteIdOrPath, isNewNoteRoute, getByPath, get]);

  // Filter notes by folder & search query
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      // Folder filter
      if (activeFolderId === '__starred') {
        if (!n.tags?.includes('starred') && !(n as { starred?: boolean }).starred) return false;
      } else if (activeFolderId !== 'all') {
        if (!n.path?.startsWith(activeFolderId)) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = (n.frontmatter?.title ?? n.title ?? '').toLowerCase().includes(q);
        const contentMatch = (n.content ?? '').toLowerCase().includes(q);
        const tagMatch = n.tags?.some((t) => t.toLowerCase().includes(q));
        if (!titleMatch && !contentMatch && !tagMatch) return false;
      }

      return true;
    });
  }, [notes, activeFolderId, searchQuery]);

  // Extract Markdown headings for outline Table of Contents
  const headings = useMemo(() => {
    if (!currentNote?.content) return [];
    const lines = currentNote.content.split('\n');
    const items: { level: number; text: string; id: string }[] = [];
    for (const line of lines) {
      const match = line.match(/^(#{1,3})\s+(.+)$/);
      if (match && match[1] && match[2]) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = text.toLowerCase().replace(/[^\w]+/g, '-');
        items.push({ level, text, id });
      }
    }
    return items;
  }, [currentNote?.content]);

  const handleCreateNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const notePath = newFolder
        ? `${newFolder}/${newTitle.toLowerCase().replace(/\s+/g, '-')}.md`
        : `${newTitle.toLowerCase().replace(/\s+/g, '-')}.md`;

      const created = await create?.({
        title: newTitle.trim(),
        path: notePath,
        content: newContent || '# ' + newTitle + '\n\nNote content...',
      });
      if (created) {
        setNotes((prev) => [created, ...prev]);
        setIsNewModalOpen(false);
        setNewTitle('');
        setNewContent('');
        navigate(`/notes/${created.path ?? created.id}`);
      }
    } catch (err) {
      setErrorNotes(err as Error);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      setNotes((cur) => cur.filter((x) => x.id !== id));
      if (currentNote?.id === id) {
        setCurrentNote(null);
        navigate('/notes');
      }
      await deleteNote?.(id);
    } catch {
      void loadWorkspaceData();
    }
  };

  const handleAskSyntrophos = (actionType: string) => {
    setAiAnalysis(`SYNTHROPHOS ANALYSIS (${actionType.toUpperCase()}):\n\nKey Insights Extracted:\n• Action items identified and linked to workspace priorities\n• Knowledge graph connected across 3 relevant vault nodes`);
  };

  return (
    <div className="notes-3col-workspace">
      {/* COLUMN 1: Folder & Category Navigation (240px) */}
      <aside className="notes-folder-sidebar">
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(255, 170, 48, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 13, fontWeight: 'bold', color: '#ffaa30', letterSpacing: '0.12em', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconNotes width={16} height={16} />
            <span>KNOWLEDGE VAULT</span>
          </div>
          <button
            type="button"
            onClick={() => setIsNewModalOpen(true)}
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

        <div style={{ padding: '12px 8px', overflowY: 'auto', flex: '1 1 auto' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.14em', color: '#885522', fontFamily: 'monospace', marginBottom: 8, padding: '0 8px' }}>
            CATEGORIES &amp; VAULTS
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <FolderCategoryRow
              icon={<IconNotes width={14} height={14} />}
              label="All Notes"
              count={notes.length}
              active={activeFolderId === 'all'}
              onClick={() => setActiveFolderId('all')}
            />
            <FolderCategoryRow
              icon={<IconStar width={14} height={14} />}
              label="Starred"
              count={notes.filter((n) => n.tags?.includes('starred') || (n as { starred?: boolean }).starred).length}
              active={activeFolderId === '__starred'}
              onClick={() => setActiveFolderId('__starred')}
            />

            <div style={{ height: 1, background: 'rgba(255, 170, 48, 0.15)', margin: '8px 0' }} />

            <div style={{ fontSize: 9, letterSpacing: '0.14em', color: '#885522', fontFamily: 'monospace', marginBottom: 6, padding: '0 8px' }}>
              FOLDERS
            </div>

            {folders.length === 0 ? (
              <div style={{ padding: '8px', fontSize: 11, color: '#885522', fontFamily: 'monospace' }}>
                Default Vault
              </div>
            ) : (
              folders.map((f) => (
                <FolderCategoryRow
                  key={f.id}
                  icon={<IconFolder width={14} height={14} />}
                  label={f.name}
                  count={f.noteCount}
                  active={activeFolderId === f.id}
                  onClick={() => setActiveFolderId(f.id)}
                />
              ))
            )}
          </ul>
        </div>
      </aside>

      {/* COLUMN 2: Note List & Search Navigation (320px) */}
      <div className="notes-index-column">
        {/* Search Input */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255, 170, 48, 0.25)' }}>
          <Input
            placeholder="Search notes… (⌘K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leading={<IconSearch width={14} height={14} />}
            style={{ background: 'rgba(20, 10, 2, 0.7)', borderColor: 'rgba(255, 170, 48, 0.3)', color: '#ffcc66', fontSize: 12, fontFamily: 'monospace' }}
          />
        </div>

        {/* Note List Scroll Area */}
        <div style={{ overflowY: 'auto', flex: '1 1 auto', padding: '10px 8px' }}>
          {loadingNotes ? (
            <PageLoader label="LOADING INDEX…" />
          ) : errorNotes ? (
            <ErrorState title="FAILED TO LOAD INDEX" error={errorNotes.message} />
          ) : filteredNotes.length === 0 ? (
            <div style={{ padding: '24px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#885522', fontFamily: 'monospace', marginBottom: 10 }}>
                {searchQuery ? 'NO MATCHES FOUND' : 'NO NOTES IN THIS VIEW'}
              </div>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(true)}
                style={{
                  background: 'rgba(255, 170, 48, 0.15)',
                  border: '1px solid rgba(255, 170, 48, 0.4)',
                  color: '#ffcc66',
                  fontFamily: 'monospace',
                  fontSize: 10,
                  padding: '5px 12px',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                + CREATE NOTE
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {filteredNotes.map((n) => {
                const notePath = n.path ?? n.id;
                const isSelected = noteIdOrPath === notePath || currentNote?.id === n.id;
                return (
                  <Link key={n.id} to={`/notes/${notePath}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div
                      style={{
                        padding: '10px 12px',
                        borderRadius: 6,
                        background: isSelected ? 'rgba(120, 60, 0, 0.6)' : 'rgba(25, 13, 2, 0.4)',
                        border: isSelected ? '1px solid rgba(255, 170, 48, 0.6)' : '1px solid rgba(255, 170, 48, 0.15)',
                        transition: 'all 140ms ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ fontSize: 12, fontWeight: isSelected ? 700 : 600, color: isSelected ? '#ffcc66' : '#d99a4e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: 6 }}>
                          {(n.tags?.includes('starred') || (n as { starred?: boolean }).starred) && (
                            <IconStar width={11} height={11} style={{ color: '#ffaa30' }} />
                          )}
                          <span>{n.frontmatter?.title ?? n.title ?? 'Untitled note'}</span>
                        </div>
                        <Badge size="sm" tone={(n.frontmatter?.status ?? 'published') === 'published' ? 'success' : 'default'}>
                          {n.frontmatter?.status ?? 'note'}
                        </Badge>
                      </div>

                      <div style={{ fontSize: 11, color: '#885522', fontFamily: 'monospace', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {n.excerpt ?? n.content ?? 'No content yet.'}
                      </div>

                      <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 9, fontFamily: 'monospace', color: '#885522' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{n.path ?? 'root'}</span>
                        <span>{new Date(n.audit?.updatedAt ?? n.audit?.createdAt ?? Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* COLUMN 3: Right Note Reader / Content Pane (1fr) */}
      <main className="notes-content-pane" ref={contentRef}>
        {loadingDetail ? (
          <PageLoader label="OPENING VAULT NOTE…" />
        ) : errorDetail ? (
          <div style={{ margin: 'auto', textAlign: 'center', padding: '40px' }}>
            <ErrorState title="FAILED TO LOAD NOTE" error={errorDetail.message} />
          </div>
        ) : !hasSelectedNote || !currentNote ? (
          /* Centered Empty State inside Note Detail Pane */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: 'auto', maxWidth: 520, padding: '40px 24px', textAlign: 'center' }}>
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
              <IconNotes width={24} height={24} />
            </div>

            <div style={{ fontSize: 10, letterSpacing: '0.22em', color: '#885522', fontFamily: 'monospace', marginBottom: 6 }}>
              SYNTHROPHOS // NOTES
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 'bold', color: '#ffaa30', letterSpacing: '0.03em', margin: '0 0 8px 0', textShadow: '0 0 10px rgba(255, 170, 48, 0.4)' }}>
              Select a note to read
            </h2>

            <p style={{ fontSize: 13, color: '#d99a4e', lineHeight: 1.6, maxWidth: 440, margin: '0 0 24px 0', fontFamily: 'monospace' }}>
              Choose a note from the library, or create a new one. Your notes are indexed in your Obsidian knowledge vault.
            </p>

            <button
              type="button"
              onClick={() => setIsNewModalOpen(true)}
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
                boxShadow: '0 0 15px rgba(255, 170, 48, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <IconPlus width={14} height={14} /> [ + New note ]
            </button>
          </div>
        ) : (
          /* Active Selected Note View */
          <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', width: '100%' }}>
            {/* Note Reader Header & Context Toolbar */}
            <header style={{ padding: '14px 32px', borderBottom: '1px solid rgba(255, 170, 48, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(14, 7, 1, 0.95)', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: '#885522', fontFamily: 'monospace', marginBottom: 2 }}>
                  VAULT PATH: {currentNote.path ?? currentNote.id}
                </div>
                <div style={{ fontSize: 16, fontWeight: 'bold', color: '#ffaa30' }}>
                  {currentNote.frontmatter?.title ?? currentNote.title ?? 'Untitled Note'}
                </div>
              </div>

              {/* Context Action Toolbar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => handleAskSyntrophos('summarize')}
                  style={{
                    background: 'rgba(255, 170, 48, 0.15)',
                    border: '1px solid rgba(255, 170, 48, 0.4)',
                    borderRadius: 4,
                    color: '#ffcc66',
                    fontFamily: 'monospace',
                    fontSize: 10,
                    fontWeight: 'bold',
                    padding: '5px 10px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <IconBot width={12} height={12} /> [ ASK SYNTROPHOS ]
                </button>
                <button
                  type="button"
                  onClick={() => void handleDeleteNote(currentNote.id)}
                  style={{
                    background: 'rgba(255, 85, 51, 0.15)',
                    border: '1px solid rgba(255, 85, 51, 0.3)',
                    borderRadius: 4,
                    color: '#ff5533',
                    fontFamily: 'monospace',
                    fontSize: 10,
                    padding: '5px 10px',
                    cursor: 'pointer',
                  }}
                >
                  DELETE
                </button>
              </div>
            </header>

            {/* Note Reader Body Container */}
            <article style={{ padding: '32px', maxWidth: '76ch', width: '100%', margin: '0 auto', flex: '1 1 auto' }}>
              {/* Optional Table of Contents Outline Widget (ONLY when headings exist!) */}
              {headings.length > 0 && (
                <div className="notes-outline-widget">
                  <div style={{ fontSize: 10, letterSpacing: '0.14em', color: '#ffaa30', fontWeight: 'bold', fontFamily: 'monospace', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <IconCode width={12} height={12} />
                    <span>OUTLINE // TABLE OF CONTENTS</span>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'monospace', fontSize: 11 }}>
                    {headings.map((h, i) => (
                      <li key={i} style={{ paddingLeft: (h.level - 1) * 12 }}>
                        <a
                          href={`#${h.id}`}
                          style={{ color: '#d99a4e', textDecoration: 'none' }}
                          onClick={(e) => {
                            e.preventDefault();
                            const el = document.getElementById(h.id);
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                        >
                          # {h.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Syntrophos AI Analysis Overlay (if triggered) */}
              {aiAnalysis && (
                <div style={{ background: 'rgba(22, 10, 2, 0.95)', border: '1px solid rgba(255, 170, 48, 0.5)', borderRadius: 6, padding: '14px', marginBottom: 24, fontSize: 11, fontFamily: 'monospace', color: '#ffcc66', lineHeight: 1.5 }}>
                  <div style={{ color: '#ffaa30', fontWeight: 'bold', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <IconBot width={14} height={14} />
                    <span>SYNTHROPHOS INTELLIGENCE</span>
                  </div>
                  <pre style={{ margin: 0, fontFamily: 'inherit', whiteSpace: 'pre-wrap' }}>{aiAnalysis}</pre>
                </div>
              )}

              {/* Note Content Body */}
              <div
                style={{ lineHeight: 1.7, fontSize: 15, color: '#ffcc66' }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(currentNote.content ?? '') }}
              />
            </article>
          </div>
        )}
      </main>

      {/* New Note Creation Modal */}
      {isNewModalOpen && (
        <CreateNoteModal
          title={newTitle}
          setTitle={setNewTitle}
          folder={newFolder}
          setFolder={setNewFolder}
          content={newContent}
          setContent={setNewContent}
          onClose={() => {
            setIsNewModalOpen(false);
            if (isNewNoteRoute) navigate('/notes');
          }}
          onSubmit={handleCreateNoteSubmit}
        />
      )}
    </div>
  );
}

function FolderCategoryRow({
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
          gap: 10,
          width: '100%',
          padding: '6px 10px',
          borderRadius: 4,
          border: active ? '1px solid rgba(255, 170, 48, 0.5)' : '1px solid transparent',
          background: active ? 'rgba(120, 60, 0, 0.5)' : 'transparent',
          color: active ? '#ffcc66' : '#d99a4e',
          fontSize: 12,
          fontFamily: 'monospace',
          cursor: 'pointer',
          fontWeight: active ? 'bold' : 'normal',
          textAlign: 'left',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', color: active ? '#ffcc66' : '#ffaa30' }}>{icon}</span>
        <span style={{ flex: '1 1 auto', minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
        <span style={{ fontSize: 9, background: 'rgba(255, 170, 48, 0.15)', padding: '1px 5px', borderRadius: 3, color: '#885522' }}>{count}</span>
      </button>
    </li>
  );
}

function CreateNoteModal({
  title,
  setTitle,
  folder,
  setFolder,
  content,
  setContent,
  onClose,
  onSubmit,
}: {
  readonly title: string;
  readonly setTitle: (v: string) => void;
  readonly folder: string;
  readonly setFolder: (v: string) => void;
  readonly content: string;
  readonly setContent: (v: string) => void;
  readonly onClose: () => void;
  readonly onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="task-modal-overlay" onClick={onClose}>
      <div
        style={{
          width: 540,
          maxWidth: '90vw',
          background: '#080401',
          border: '1px solid rgba(255, 170, 48, 0.4)',
          borderRadius: 8,
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.9)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255, 170, 48, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(14, 7, 1, 0.95)' }}>
          <div style={{ fontSize: 12, fontWeight: 'bold', color: '#ffaa30', letterSpacing: '0.12em', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconPlus width={14} height={14} />
            <span>CREATE KNOWLEDGE NOTE</span>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#885522', cursor: 'pointer' }}>
            <IconX width={16} height={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14, fontFamily: 'monospace' }}>
          <div>
            <label style={{ display: 'block', fontSize: 10, color: '#885522', marginBottom: 6 }}>NOTE TITLE *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q3 Strategic Planning & Roadmap"
              required
              autoFocus
              style={{ background: 'rgba(20, 10, 2, 0.8)', borderColor: 'rgba(255, 170, 48, 0.3)', color: '#ffcc66' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 10, color: '#885522', marginBottom: 6 }}>FOLDER / PATH</label>
            <Input
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              placeholder="e.g. strategy"
              style={{ background: 'rgba(20, 10, 2, 0.8)', borderColor: 'rgba(255, 170, 48, 0.3)', color: '#ffcc66' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 10, color: '#885522', marginBottom: 6 }}>CONTENT BODY (MARKDOWN)</label>
            <textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="# Heading 1&#10;&#10;Type note content here..."
              style={{
                width: '100%',
                background: 'rgba(20, 10, 2, 0.8)',
                border: '1px solid rgba(255, 170, 48, 0.3)',
                borderRadius: 4,
                padding: '10px',
                color: '#ffcc66',
                fontSize: 12,
                fontFamily: 'monospace',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              [ SAVE NOTE TO VAULT ]
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function renderMarkdown(md: string): string {
  if (!md) return '';
  const lines = md.split('\n');
  const htmlLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith('# ')) {
      const text = line.slice(2).trim();
      const id = text.toLowerCase().replace(/[^\w]+/g, '-');
      htmlLines.push(`<h1 id="${id}" style="font-size:24px;font-weight:800;color:#ffaa30;margin:1.4em 0 0.6em;border-bottom:1px solid rgba(255,170,48,0.25);padding-bottom:6px">${text}</h1>`);
    } else if (line.startsWith('## ')) {
      const text = line.slice(3).trim();
      const id = text.toLowerCase().replace(/[^\w]+/g, '-');
      htmlLines.push(`<h2 id="${id}" style="font-size:20px;font-weight:700;color:#ffaa30;margin:1.2em 0 0.5em">${text}</h2>`);
    } else if (line.startsWith('### ')) {
      const text = line.slice(4).trim();
      const id = text.toLowerCase().replace(/[^\w]+/g, '-');
      htmlLines.push(`<h3 id="${id}" style="font-size:16px;font-weight:700;color:#ffcc66;margin:1em 0 0.4em">${text}</h3>`);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const text = parseInlineMarkdown(line.slice(2));
      htmlLines.push(`<li style="margin:4px 0 4px 20px;color:#ffcc66">${text}</li>`);
    } else if (line.trim() === '') {
      htmlLines.push('<div style="height:10px"></div>');
    } else {
      const text = parseInlineMarkdown(line);
      htmlLines.push(`<p style="margin:0 0 10px 0;color:#ffcc66;line-height:1.7">${text}</p>`);
    }
  }

  return htmlLines.join('\n');
}

function parseInlineMarkdown(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '<code style="font-family:monospace;font-size:0.9em;background:rgba(255,170,48,0.15);color:#ffcc66;padding:1px 6px;border-radius:4px;border:1px solid rgba(255,170,48,0.3)">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#ffaa30">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}
