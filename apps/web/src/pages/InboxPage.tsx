import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader.js';
import { Badge, Button, Input } from '@/components/ui/primitives.js';
import { ErrorState, EmptyState } from '@/components/ui/states.js';
import {
  IconMail,
  IconPlus,
  IconSearch,
  IconBot,
  IconCheckCircle,
  IconX,
  IconCalendar,
  IconTasks,
  IconCode,
  IconChevronRight,
  IconStar,
} from '@/lib/icons.js';

export type InboxItemType = 'human' | 'agent' | 'system';
export type InboxItemStatus = 'action_required' | 'unread' | 'completed' | 'read';

export type InboxItem = {
  readonly id: string;
  readonly type: InboxItemType;
  readonly status: InboxItemStatus;
  readonly sender: string;
  readonly roleOrAgent?: string;
  readonly title: string;
  readonly preview: string;
  readonly content: string;
  readonly timestamp: string;
  readonly actionRequired?: boolean;
  readonly actions?: readonly string[];
  readonly contextBadge?: string;
};

const INITIAL_INBOX_ITEMS: InboxItem[] = [
  {
    id: 'inbox-1',
    type: 'agent',
    status: 'action_required',
    sender: 'Planner Agent',
    roleOrAgent: 'PLANNING OPERATOR',
    title: 'Q3 Milestone Breakdown & Task Allocation',
    preview: 'Generated 6 proposed tasks for the engineering pipeline. 2 milestones require your explicit approval before dispatching.',
    content: `SYNTHROPHOS PLANNER AGENT SUMMARY:\n\nObjective: Q3 Strategic Roadmap Execution\nProposed Tasks: 6 tasks generated with estimates and dependency tree.\n\nActions Needing Approval:\n1. Allocate 40h dev time to ColBERT reranker integration\n2. Schedule production staging deployment for Thursday 08:00 PM`,
    timestamp: '18m ago',
    actionRequired: true,
    actions: ['Review', 'Approve', 'Reject'],
    contextBadge: '2 APPROVALS NEEDED',
  },
  {
    id: 'inbox-2',
    type: 'human',
    status: 'unread',
    sender: 'Sarah Chen',
    roleOrAgent: 'Head of Product',
    title: 'Re: Q3 launch timeline review',
    preview: 'Can we move the architecture review session to Thursday afternoon? Need to align on dev dependencies.',
    content: `Hi Operator,\n\nFollowing up on the Q3 launch schedule. Can we move the architecture review session to Thursday at 02:00 PM?\n\nLet me know if that works with your calendar.`,
    timestamp: '10m ago',
    actions: ['Reply', 'Schedule', 'Create task'],
    contextBadge: 'HUMAN DIRECTIVE',
  },
  {
    id: 'inbox-3',
    type: 'agent',
    status: 'completed',
    sender: 'Researcher Agent',
    roleOrAgent: 'RESEARCH OPERATOR',
    title: 'Retrieval Evaluation & Benchmark Report Completed',
    preview: 'Deep-dive analysis on dense vector retrieval completed. Syntrophos vault notes indexed with 14 source citations.',
    content: `RESEARCH REPORT SUMMARY:\n\nEvaluated 3 vector embeddings across 1,200 knowledge nodes. Dense retrieval precision achieved 94.2% recall@10.\n\nArtifact saved to Knowledge Vault: /research/retrieval-eval-2026.md`,
    timestamp: '2h ago',
    actions: ['Open result', 'Share'],
    contextBadge: 'VAULT INDEXED',
  },
  {
    id: 'inbox-4',
    type: 'system',
    status: 'unread',
    sender: 'System Monitor',
    roleOrAgent: 'SYSTEM TELEMETRY',
    title: 'Calendar Conflict Detected: 03:00 PM Team Sync',
    preview: 'Overlap detected between Q3 Strategic Planning and 03:00 PM Team Sync on Thursday.',
    content: `CALENDAR CONFLICT ALERT:\n\nTwo overlapping events detected on Thursday 2026-08-20:\n• 03:00 PM - 04:00 PM: Team Sync\n• 03:30 PM - 04:30 PM: Client Review\n\nSuggested Resolution: Shift Team Sync to Friday morning.`,
    timestamp: '3h ago',
    actions: ['Resolve conflict'],
    contextBadge: 'CALENDAR CONFLICT',
  },
  {
    id: 'inbox-5',
    type: 'agent',
    status: 'completed',
    sender: 'Engineer Agent',
    roleOrAgent: 'CODE OPERATOR',
    title: 'Automated Code Review Completed (PR #184)',
    preview: '3 issues identified in ColBERT reranker integration. 1 performance bottleneck requires your review.',
    content: `CODE REVIEW REPORT:\n\nAnalyzed 14 modified files in @syntrophos/core.\n• 2 minor lint suggestions (auto-fixed)\n• 1 blocking cache synchronization bottleneck in worker thread pool`,
    timestamp: '4h ago',
    actions: ['View report'],
    contextBadge: 'PR #184 AUDITED',
  },
  {
    id: 'inbox-6',
    type: 'human',
    status: 'read',
    sender: 'Jordan Vance',
    roleOrAgent: 'Lead Architect',
    title: 'Design Tokens & Typography Refresh',
    preview: 'Updated color palette definitions for Space Grotesk and JetBrains Mono fonts across design systems.',
    content: `Hey team,\n\nThe Space Grotesk + JetBrains Mono design token updates are live in main branch. All UI components inherit the technical amber visual hierarchy.`,
    timestamp: '6h ago',
    actions: ['Reply'],
    contextBadge: 'DESIGN TOKENS',
  },
  {
    id: 'inbox-7',
    type: 'agent',
    status: 'completed',
    sender: 'Memory Curator',
    roleOrAgent: 'MEMORY OPERATOR',
    title: 'Weekly Knowledge Vault Cleanup Completed',
    preview: 'Indexed 12 new notes, established 8 cross-vault backlinks, and prepared weekly review highlights.',
    content: `MEMORY CURATOR REPORT:\n\nScanned 48 active vault files.\n• 12 new notes auto-tagged\n• 8 knowledge graph links connected\n• Weekly review summary prepared`,
    timestamp: '1d ago',
    actions: ['View activity'],
    contextBadge: 'GRAPH LINKED',
  },
];

export default function InboxPage() {
  const [items, setItems] = useState<InboxItem[]>(INITIAL_INBOX_ITEMS);
  const [filterType, setFilterType] = useState<'all' | 'human' | 'agent' | 'system'>('all');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedItem, setSelectedItem] = useState<InboxItem | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  // Compose Form
  const [composeRecipient, setComposeRecipient] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filterType !== 'all' && item.type !== filterType) return false;
      if (unreadOnly && item.status === 'read') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const senderMatch = item.sender.toLowerCase().includes(q);
        const titleMatch = item.title.toLowerCase().includes(q);
        const previewMatch = item.preview.toLowerCase().includes(q);
        if (!senderMatch && !titleMatch && !previewMatch) return false;
      }
      return true;
    });
  }, [items, filterType, unreadOnly, searchQuery]);

  const attentionCount = useMemo(() => {
    return items.filter((x) => x.status === 'action_required' || x.status === 'unread').length;
  }, [items]);

  const handleItemClick = (item: InboxItem) => {
    setSelectedItem(item);
    if (item.status === 'unread') {
      setItems((cur) =>
        cur.map((x) => (x.id === item.id ? { ...x, status: 'read' as const } : x))
      );
    }
  };

  const handleAction = (id: string, actionName: string) => {
    if (actionName === 'Approve' || actionName === 'Resolve conflict') {
      setItems((cur) =>
        cur.map((x) =>
          x.id === id ? { ...x, status: 'completed' as const, actionRequired: false } : x
        )
      );
    }
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
  };

  const handleComposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeSubject.trim()) return;
    const newItem: InboxItem = {
      id: `inbox-${Date.now()}`,
      type: 'human',
      status: 'read',
      sender: 'Operator (You)',
      roleOrAgent: 'OPERATOR',
      title: composeSubject.trim(),
      preview: composeBody.trim() || 'Sent message',
      content: `TO: ${composeRecipient || 'Team'}\n\n${composeBody}`,
      timestamp: 'just now',
      actions: ['Reply'],
      contextBadge: 'SENT MESSAGE',
    };
    setItems((prev) => [newItem, ...prev]);
    setIsComposeOpen(false);
    setComposeRecipient('');
    setComposeSubject('');
    setComposeBody('');
  };

  return (
    <div className="shell-page shell-page--wide" style={{ background: '#000000', color: '#ffcc66', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-sans)' }}>
      {/* 1. OPERATIONAL HEADER */}
      <PageHeader
        variant="wide"
        icon={<IconMail width={22} height={22} />}
        title="INBOX // COMMUNICATIONS & ATTENTION"
        subtitle={`${attentionCount} ITEMS NEED ATTENTION`}
        actions={[
          {
            id: 'compose',
            label: '+ Compose',
            variant: 'primary',
            icon: <IconPlus width={14} height={14} />,
            onAction: () => setIsComposeOpen(true),
            primary: true,
          },
        ]}
      />

      <div style={{ padding: '0 24px 24px 24px', display: 'flex', flexDirection: 'column', gap: 20, flex: '1 1 auto' }}>
        {/* 2. CATEGORY & FILTER CONTROL BAR */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, borderBottom: '1px solid rgba(255, 170, 48, 0.25)', paddingBottom: 14 }}>
          {/* Category Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={() => setFilterType('all')}
              style={{
                background: filterType === 'all' ? 'rgba(120, 60, 0, 0.6)' : 'transparent',
                border: filterType === 'all' ? '1px solid rgba(255, 170, 48, 0.6)' : '1px solid transparent',
                color: filterType === 'all' ? '#ffcc66' : '#d99a4e',
                borderRadius: 4,
                padding: '6px 14px',
                fontSize: 12,
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              All ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('human')}
              style={{
                background: filterType === 'human' ? 'rgba(120, 60, 0, 0.6)' : 'transparent',
                border: filterType === 'human' ? '1px solid rgba(255, 170, 48, 0.6)' : '1px solid transparent',
                color: filterType === 'human' ? '#ffcc66' : '#d99a4e',
                borderRadius: 4,
                padding: '6px 14px',
                fontSize: 12,
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              People ({items.filter((x) => x.type === 'human').length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('agent')}
              style={{
                background: filterType === 'agent' ? 'rgba(120, 60, 0, 0.6)' : 'transparent',
                border: filterType === 'agent' ? '1px solid rgba(255, 170, 48, 0.6)' : '1px solid transparent',
                color: filterType === 'agent' ? '#ffcc66' : '#d99a4e',
                borderRadius: 4,
                padding: '6px 14px',
                fontSize: 12,
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Agents ({items.filter((x) => x.type === 'agent').length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('system')}
              style={{
                background: filterType === 'system' ? 'rgba(120, 60, 0, 0.6)' : 'transparent',
                border: filterType === 'system' ? '1px solid rgba(255, 170, 48, 0.6)' : '1px solid transparent',
                color: filterType === 'system' ? '#ffcc66' : '#d99a4e',
                borderRadius: 4,
                padding: '6px 14px',
                fontSize: 12,
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              System ({items.filter((x) => x.type === 'system').length})
            </button>
          </div>

          {/* Search & Unread Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: 'var(--font-mono)', color: '#d99a4e', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={(e) => setUnreadOnly(e.target.checked)}
                style={{ accentColor: '#ffaa30' }}
              />
              <span>Unread Only</span>
            </label>
            <div style={{ width: 280 }}>
              <Input
                placeholder="Search inbox… (⌘K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leading={<IconSearch width={14} height={14} />}
                style={{ background: 'rgba(20, 10, 2, 0.8)', borderColor: 'rgba(255, 170, 48, 0.3)', color: '#ffcc66', fontSize: 12 }}
              />
            </div>
          </div>
        </div>

        {/* 3. INBOX ITEMS LIST */}
        {filteredItems.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <EmptyState
              icon={<IconMail width={36} height={36} />}
              title="INBOX CLEAR"
              description="Nothing requires your attention. All communications and agent actions are up to date."
              action={{ label: 'Compose message', onClick: () => setIsComposeOpen(true) }}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredItems.map((item) => (
              <InboxItemCard
                key={item.id}
                item={item}
                onClick={() => handleItemClick(item)}
                onAction={(actionName) => handleAction(item.id, actionName)}
              />
            ))}
          </div>
        )}
      </div>

      {/* INBOX DETAIL DRAWER */}
      {selectedItem && (
        <InboxDetailDrawer
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAction={(act) => handleAction(selectedItem.id, act)}
        />
      )}

      {/* COMPOSE MODAL */}
      {isComposeOpen && (
        <ComposeMessageModal
          recipient={composeRecipient}
          setRecipient={setComposeRecipient}
          subject={composeSubject}
          setSubject={setComposeSubject}
          body={composeBody}
          setBody={setComposeBody}
          onClose={() => setIsComposeOpen(false)}
          onSubmit={handleComposeSubmit}
        />
      )}
    </div>
  );
}

function InboxItemCard({
  item,
  onClick,
  onAction,
}: {
  readonly item: InboxItem;
  readonly onClick: () => void;
  readonly onAction: (actionName: string) => void;
}) {
  const isActionRequired = item.status === 'action_required' || item.actionRequired;
  const isUnread = item.status === 'unread';

  return (
    <div
      onClick={onClick}
      style={{
        padding: '14px 18px',
        borderRadius: 8,
        background: isActionRequired
          ? 'rgba(40, 20, 4, 0.9)'
          : isUnread
            ? 'rgba(25, 13, 2, 0.7)'
            : 'rgba(12, 6, 1, 0.85)',
        border: isActionRequired
          ? '1px solid rgba(255, 170, 48, 0.6)'
          : isUnread
            ? '1px solid rgba(255, 170, 48, 0.35)'
            : '1px solid rgba(255, 170, 48, 0.18)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        cursor: 'pointer',
        transition: 'all 140ms ease',
        boxShadow: isActionRequired ? '0 0 14px rgba(255, 170, 48, 0.15)' : 'none',
      }}
    >
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Source Badge Icon */}
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: item.type === 'agent'
                ? 'rgba(255, 170, 48, 0.15)'
                : item.type === 'human'
                  ? 'rgba(52, 211, 153, 0.15)'
                  : 'rgba(255, 85, 51, 0.15)',
              border: item.type === 'agent'
                ? '1px solid rgba(255, 170, 48, 0.4)'
                : item.type === 'human'
                  ? '1px solid rgba(52, 211, 153, 0.4)'
                  : '1px solid rgba(255, 85, 51, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: item.type === 'agent' ? '#ffaa30' : item.type === 'human' ? '#34d399' : '#ff5533',
            }}
          >
            {item.type === 'agent' ? (
              <IconBot width={14} height={14} />
            ) : item.type === 'human' ? (
              <IconMail width={14} height={14} />
            ) : (
              <IconCalendar width={14} height={14} />
            )}
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 'bold', color: isUnread ? '#ffcc66' : '#d99a4e', fontFamily: 'var(--font-sans)' }}>
              {item.sender}
            </div>
            {item.roleOrAgent && (
              <div style={{ fontSize: 9, color: '#885522', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
                {item.roleOrAgent}
              </div>
            )}
          </div>
        </div>

        {/* Right Status & Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isActionRequired && (
            <Badge tone="warning" size="sm" dot>
              ACTION REQUIRED
            </Badge>
          )}
          {item.contextBadge && (
            <span style={{ fontSize: 9, background: 'rgba(255, 170, 48, 0.15)', border: '1px solid rgba(255, 170, 48, 0.3)', color: '#ffaa30', padding: '2px 6px', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>
              {item.contextBadge}
            </span>
          )}
          <span style={{ fontSize: 10, color: '#885522', fontFamily: 'var(--font-mono)' }}>
            {item.timestamp}
          </span>
        </div>
      </div>

      {/* Message Title & Preview */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 'bold', color: isUnread ? '#ffcc66' : '#e6a84d', fontFamily: 'var(--font-sans)', marginBottom: 3 }}>
          {item.title}
        </div>
        <p style={{ fontSize: 12, color: '#885522', lineHeight: 1.5, margin: 0, fontFamily: 'var(--font-sans)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {item.preview}
        </p>
      </div>

      {/* Action Buttons Row */}
      {item.actions && item.actions.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          {item.actions.map((act) => (
            <button
              key={act}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAction(act);
              }}
              style={{
                background: act === 'Approve' || act === 'Review'
                  ? '#ffaa30'
                  : 'rgba(255, 170, 48, 0.12)',
                border: act === 'Approve' || act === 'Review'
                  ? 'none'
                  : '1px solid rgba(255, 170, 48, 0.3)',
                color: act === 'Approve' || act === 'Review' ? '#000000' : '#ffcc66',
                borderRadius: 4,
                padding: '4px 10px',
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              [ {act.toUpperCase()} ]
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function InboxDetailDrawer({
  item,
  onClose,
  onAction,
}: {
  readonly item: InboxItem;
  readonly onClose: () => void;
  readonly onAction: (act: string) => void;
}) {
  return (
    <div className="task-detail-drawer" style={{ color: '#ffcc66', fontFamily: 'var(--font-sans)' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 170, 48, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(14, 7, 1, 0.95)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#ffaa30', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
          <IconMail width={14} height={14} />
          <span>INBOX DETAIL // {item.id.toUpperCase()}</span>
        </div>
        <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#885522', cursor: 'pointer' }}>
          <IconX width={16} height={16} />
        </button>
      </div>

      {/* Content Body */}
      <div style={{ padding: '20px', flex: '1 1 auto', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <div style={{ fontSize: 10, color: '#885522', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>
            SENDER: {item.sender} ({item.roleOrAgent ?? 'OPERATOR'})
          </div>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: '#ffcc66', lineHeight: 1.3 }}>
            {item.title}
          </div>
          <div style={{ fontSize: 10, color: '#885522', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
            RECEIVED: {item.timestamp}
          </div>
        </div>

        <div style={{ background: 'rgba(20, 10, 2, 0.8)', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 6, padding: '14px', fontSize: 13, color: '#ffcc66', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
          {item.content}
        </div>

        {item.type === 'agent' && (
          <div style={{ background: 'rgba(14, 7, 1, 0.9)', border: '1px solid rgba(255, 170, 48, 0.3)', borderRadius: 6, padding: '12px', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
            <div style={{ color: '#ffaa30', fontWeight: 'bold', marginBottom: 6 }}>OBSERVABLE AGENT ACTIVITY</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, color: '#34d399' }}>
              <div>✓ Analyzed objective &amp; workspace graph</div>
              <div>✓ Verified task dependencies &amp; estimates</div>
              <div style={{ color: '#ffaa30' }}>● Awaiting human operator approval</div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {item.actions && item.actions.length > 0 && (
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255, 170, 48, 0.3)', display: 'flex', gap: 10, background: 'rgba(14, 7, 1, 0.95)' }}>
          {item.actions.map((act) => (
            <button
              key={act}
              type="button"
              onClick={() => onAction(act)}
              style={{
                flex: 1,
                background: act === 'Approve' || act === 'Review' ? '#ffaa30' : 'rgba(255, 170, 48, 0.15)',
                border: act === 'Approve' || act === 'Review' ? 'none' : '1px solid rgba(255, 170, 48, 0.4)',
                borderRadius: 4,
                color: act === 'Approve' || act === 'Review' ? '#000000' : '#ffcc66',
                padding: '8px',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              [ {act.toUpperCase()} ]
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ComposeMessageModal({
  recipient,
  setRecipient,
  subject,
  setSubject,
  body,
  setBody,
  onClose,
  onSubmit,
}: {
  readonly recipient: string;
  readonly setRecipient: (v: string) => void;
  readonly subject: string;
  readonly setSubject: (v: string) => void;
  readonly body: string;
  readonly setBody: (v: string) => void;
  readonly onClose: () => void;
  readonly onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="task-modal-overlay" onClick={onClose}>
      <div
        style={{
          width: 520,
          maxWidth: '90vw',
          background: '#080401',
          border: '1px solid rgba(255, 170, 48, 0.4)',
          borderRadius: 8,
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.9)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'var(--font-sans)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255, 170, 48, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(14, 7, 1, 0.95)' }}>
          <div style={{ fontSize: 12, fontWeight: 'bold', color: '#ffaa30', letterSpacing: '0.12em', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconMail width={14} height={14} />
            <span>COMPOSE COMMUNICATION</span>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#885522', cursor: 'pointer' }}>
            <IconX width={16} height={16} />
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 10, color: '#885522', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>RECIPIENT / CHANNEL</label>
            <Input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g. Sarah Chen or Planner Agent"
              autoFocus
              style={{ background: 'rgba(20, 10, 2, 0.8)', borderColor: 'rgba(255, 170, 48, 0.3)', color: '#ffcc66' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 10, color: '#885522', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>SUBJECT *</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Q3 Launch Timeline Alignment"
              required
              style={{ background: 'rgba(20, 10, 2, 0.8)', borderColor: 'rgba(255, 170, 48, 0.3)', color: '#ffcc66' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 10, color: '#885522', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>MESSAGE BODY</label>
            <textarea
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Type message content or agent directive..."
              style={{ width: '100%', background: 'rgba(20, 10, 2, 0.8)', border: '1px solid rgba(255, 170, 48, 0.3)', borderRadius: 4, padding: '10px', color: '#ffcc66', fontSize: 12, fontFamily: 'var(--font-sans)', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              [ SEND MESSAGE ]
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
