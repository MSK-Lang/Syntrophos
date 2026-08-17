import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader.js';
import { Badge, Button, Input } from '@/components/ui/primitives.js';
import { ErrorState, EmptyState } from '@/components/ui/states.js';
import {
  IconFolder,
  IconPlus,
  IconSearch,
  IconBot,
  IconCheckCircle,
  IconX,
  IconCalendar,
  IconTasks,
  IconNotes,
  IconWorkflow,
  IconMail,
} from '@/lib/icons.js';

export type ProjectStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';

export type ProjectActivity = {
  readonly id: string;
  readonly timestamp: string;
  readonly type: 'agent' | 'task' | 'note' | 'calendar' | 'workflow';
  readonly title: string;
  readonly description: string;
};

export type Project = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly status: ProjectStatus;
  readonly progress: number;
  readonly taskCount: number;
  readonly noteCount: number;
  readonly agentCount: number;
  readonly lastActivityText: string;
  readonly dueDate?: string;
  readonly activities: readonly ProjectActivity[];
  readonly relatedTasks: readonly string[];
  readonly relatedNotes: readonly string[];
};

const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Syntrophos V1 Release',
    description: 'Building the production release of the AI-native workspace matrix, spatial Core, and operations engine.',
    status: 'ACTIVE',
    progress: 68,
    taskCount: 12,
    noteCount: 4,
    agentCount: 2,
    lastActivityText: '18 min ago',
    dueDate: '2026-09-30',
    relatedTasks: ['Build ColBERT reranker integration', 'Refine topbar command surface', 'Verify theme tokens'],
    relatedNotes: ['Q3 Launch Architecture Specs', 'Knowledge Vault Schema'],
    activities: [
      { id: 'act-1', timestamp: '18m ago', type: 'agent', title: 'Agent completed research', description: 'Researcher Agent completed benchmark report on ColBERT reranker.' },
      { id: 'act-2', timestamp: '1h ago', type: 'task', title: 'Task completed', description: 'Operator completed "Refine topbar command surface".' },
      { id: 'act-3', timestamp: '3h ago', type: 'note', title: 'Note updated', description: 'Updated "Q3 Launch Architecture Specs" with JetBrains Mono design tokens.' },
      { id: 'act-4', timestamp: '5h ago', type: 'calendar', title: 'Meeting scheduled', description: 'Scheduled "Q3 Review Session" for Thursday 02:00 PM.' },
    ],
  },
  {
    id: 'proj-2',
    name: 'Dense Retrieval Evaluation',
    description: 'Benchmarking vector embeddings, semantic ranking, and cross-encoder retrieval precision across knowledge graph nodes.',
    status: 'ACTIVE',
    progress: 84,
    taskCount: 6,
    noteCount: 8,
    agentCount: 3,
    lastActivityText: '2 hours ago',
    dueDate: '2026-08-28',
    relatedTasks: ['Run recall@10 benchmark', 'Index 1,200 vault notes'],
    relatedNotes: ['Retrieval Evaluation & Benchmark Report'],
    activities: [
      { id: 'act-1', timestamp: '2h ago', type: 'agent', title: 'Benchmark completed', description: 'Achieved 94.2% recall@10 across 1,200 knowledge nodes.' },
      { id: 'act-2', timestamp: '6h ago', type: 'workflow', title: 'Workflow executed', description: 'Weekly Knowledge Cleanup workflow executed successfully.' },
    ],
  },
  {
    id: 'proj-3',
    name: 'Client Operations & Integrations',
    description: 'Connecting Gmail, Google Calendar, GitHub, and agent workflows into unified inbox attention streams.',
    status: 'PAUSED',
    progress: 40,
    taskCount: 8,
    noteCount: 3,
    agentCount: 1,
    lastActivityText: '2 days ago',
    dueDate: '2026-10-15',
    relatedTasks: ['Validate GitHub token', 'Configure Slack webhook'],
    relatedNotes: ['Integrations Roadmap'],
    activities: [
      { id: 'act-1', timestamp: '2d ago', type: 'calendar', title: 'Integration token verified', description: 'GitHub OAuth token validated.' },
    ],
  },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New Project Form State
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDueDate, setNewDueDate] = useState('');

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (filter === 'active' && p.status !== 'ACTIVE') return false;
      if (filter === 'paused' && p.status !== 'PAUSED') return false;
      if (filter === 'completed' && p.status !== 'COMPLETED') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = p.name.toLowerCase().includes(q);
        const descMatch = p.description.toLowerCase().includes(q);
        if (!nameMatch && !descMatch) return false;
      }
      return true;
    });
  }, [projects, filter, searchQuery]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: newName.trim(),
      description: newDesc.trim() || 'New Syntrophos operational project workspace.',
      status: 'ACTIVE',
      progress: 0,
      taskCount: 0,
      noteCount: 0,
      agentCount: 1,
      lastActivityText: 'Just created',
      ...(newDueDate ? { dueDate: newDueDate } : {}),
      relatedTasks: [],
      relatedNotes: [],
      activities: [
        { id: 'act-0', timestamp: 'Just now', type: 'task', title: 'Project created', description: 'Project workspace initialized.' },
      ],
    };
    setProjects((prev) => [newProj, ...prev]);
    setIsCreateOpen(false);
    setNewName('');
    setNewDesc('');
    setNewDueDate('');
  };

  return (
    <div className="shell-page shell-page--wide" style={{ background: '#000000', color: '#ffcc66', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-sans)' }}>
      {/* 1. COMPACT PAGE HEADER */}
      <PageHeader
        variant="wide"
        icon={<IconFolder width={22} height={22} />}
        title="PROJECTS // CONNECTIVE WORKSPACE MATRIX"
        subtitle="Everything you're working on, in one place."
        actions={[
          {
            id: 'create',
            label: '+ New project',
            variant: 'primary',
            icon: <IconPlus width={14} height={14} />,
            onAction: () => setIsCreateOpen(true),
            primary: true,
          },
        ]}
      />

      <div style={{ padding: '0 24px 24px 24px', display: 'flex', flexDirection: 'column', gap: 20, flex: '1 1 auto' }}>
        {/* 2. FILTER & SEARCH CONTROL BAR */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, borderBottom: '1px solid rgba(255, 170, 48, 0.25)', paddingBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={() => setFilter('all')}
              style={{
                background: filter === 'all' ? 'rgba(120, 60, 0, 0.6)' : 'transparent',
                border: filter === 'all' ? '1px solid rgba(255, 170, 48, 0.6)' : '1px solid transparent',
                color: filter === 'all' ? '#ffcc66' : '#d99a4e',
                borderRadius: 4,
                padding: '6px 14px',
                fontSize: 12,
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              All ({projects.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('active')}
              style={{
                background: filter === 'active' ? 'rgba(120, 60, 0, 0.6)' : 'transparent',
                border: filter === 'active' ? '1px solid rgba(255, 170, 48, 0.6)' : '1px solid transparent',
                color: filter === 'active' ? '#ffcc66' : '#d99a4e',
                borderRadius: 4,
                padding: '6px 14px',
                fontSize: 12,
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Active ({projects.filter((p) => p.status === 'ACTIVE').length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('paused')}
              style={{
                background: filter === 'paused' ? 'rgba(120, 60, 0, 0.6)' : 'transparent',
                border: filter === 'paused' ? '1px solid rgba(255, 170, 48, 0.6)' : '1px solid transparent',
                color: filter === 'paused' ? '#ffcc66' : '#d99a4e',
                borderRadius: 4,
                padding: '6px 14px',
                fontSize: 12,
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Paused ({projects.filter((p) => p.status === 'PAUSED').length})
            </button>
          </div>

          <div style={{ width: 280 }}>
            <Input
              placeholder="Search projects… (⌘K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leading={<IconSearch width={14} height={14} />}
              style={{ background: 'rgba(20, 10, 2, 0.8)', borderColor: 'rgba(255, 170, 48, 0.3)', color: '#ffcc66', fontSize: 12 }}
            />
          </div>
        </div>

        {/* 3. PROJECT CARDS GRID */}
        {filteredProjects.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <EmptyState
              icon={<IconFolder width={36} height={36} />}
              title="NO PROJECTS"
              description="Connect tasks, notes, calendar events, and agents into unified project workspaces."
              action={{ label: 'Create project', onClick: () => setIsCreateOpen(true) }}
            />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}>
            {filteredProjects.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                onOpen={() => setSelectedProject(p)}
              />
            ))}
          </div>
        )}
      </div>

      {/* PROJECT DETAIL WORKSPACE DRAWER */}
      {selectedProject && (
        <ProjectDetailDrawer
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}

      {/* CREATE PROJECT MODAL */}
      {isCreateOpen && (
        <CreateProjectModal
          name={newName}
          setName={setNewName}
          desc={newDesc}
          setDesc={setNewDesc}
          dueDate={newDueDate}
          setDueDate={setNewDueDate}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreateSubmit}
        />
      )}
    </div>
  );
}

function ProjectCard({
  project,
  onOpen,
}: {
  readonly project: Project;
  readonly onOpen: () => void;
}) {
  const isActive = project.status === 'ACTIVE';

  return (
    <div
      onClick={onOpen}
      style={{
        background: 'rgba(12, 6, 1, 0.9)',
        border: '1px solid rgba(255, 170, 48, 0.25)',
        borderRadius: 8,
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        cursor: 'pointer',
        transition: 'all 140ms ease',
      }}
    >
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: '#ffcc66', fontFamily: 'var(--font-sans)', marginBottom: 4 }}>
            {project.name}
          </div>
          <p style={{ fontSize: 12, color: '#885522', lineHeight: 1.4, margin: 0, fontFamily: 'var(--font-sans)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {project.description}
          </p>
        </div>

        <span
          style={{
            background: isActive ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255, 170, 48, 0.15)',
            border: isActive ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid rgba(255, 170, 48, 0.4)',
            color: isActive ? '#34d399' : '#ffaa30',
            borderRadius: 4,
            padding: '2px 8px',
            fontSize: 9,
            fontFamily: 'var(--font-mono)',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
          }}
        >
          {isActive ? '● ACTIVE' : '○ PAUSED'}
        </span>
      </div>

      {/* Metrics Row */}
      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#d99a4e', background: 'rgba(20, 10, 2, 0.7)', border: '1px solid rgba(255, 170, 48, 0.15)', padding: '8px 12px', borderRadius: 4, display: 'flex', gap: 12 }}>
        <span>{project.taskCount} tasks</span>
        <span>·</span>
        <span>{project.noteCount} notes</span>
        <span>·</span>
        <span>{project.agentCount} agents</span>
      </div>

      {/* Progress Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: '#885522' }}>PROGRESS</span>
          <span style={{ color: '#ffaa30', fontWeight: 'bold' }}>{project.progress}%</span>
        </div>
        <div style={{ width: '100%', height: 5, background: 'rgba(255, 170, 48, 0.15)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${project.progress}%`, height: '100%', background: '#ffaa30' }} />
        </div>
      </div>

      {/* Footer Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid rgba(255, 170, 48, 0.15)' }}>
        <span style={{ fontSize: 10, color: '#885522', fontFamily: 'var(--font-mono)' }}>
          Last activity {project.lastActivityText}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#ffaa30',
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          [ Open Workspace → ]
        </button>
      </div>
    </div>
  );
}

function ProjectDetailDrawer({
  project,
  onClose,
}: {
  readonly project: Project;
  readonly onClose: () => void;
}) {
  const [tab, setTab] = useState<'activity' | 'tasks' | 'notes'>('activity');

  return (
    <div className="task-detail-drawer" style={{ color: '#ffcc66', fontFamily: 'var(--font-sans)' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 170, 48, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(14, 7, 1, 0.95)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#ffaa30', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
          <IconFolder width={14} height={14} />
          <span>PROJECT WORKSPACE // {project.name.toUpperCase()}</span>
        </div>
        <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#885522', cursor: 'pointer' }}>
          <IconX width={16} height={16} />
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '20px', flex: '1 1 auto', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 'bold', color: '#ffcc66', marginBottom: 4 }}>{project.name}</div>
          <div style={{ fontSize: 12, color: '#885522', lineHeight: 1.5 }}>{project.description}</div>
        </div>

        {/* Progress & AI Prompt */}
        <div style={{ background: 'rgba(20, 10, 2, 0.8)', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 6, padding: '14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: '#885522' }}>COMPLETION METRIC</span>
            <span style={{ color: '#ffaa30', fontWeight: 'bold' }}>{project.progress}%</span>
          </div>
          <div style={{ width: '100%', height: 6, background: 'rgba(255, 170, 48, 0.15)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${project.progress}%`, height: '100%', background: '#ffaa30' }} />
          </div>

          <button
            type="button"
            onClick={() => window.alert('Syntrophos AI Context query initiated for project.')}
            style={{
              marginTop: 4,
              background: '#ffaa30',
              border: 'none',
              borderRadius: 4,
              color: '#000000',
              padding: '6px',
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <IconBot width={13} height={13} />
            [ ASK SYNTROPHOS ABOUT THIS PROJECT ]
          </button>
        </div>

        {/* Section Tabs */}
        <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid rgba(255, 170, 48, 0.2)', paddingBottom: 6 }}>
          {(['activity', 'tasks', 'notes'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              style={{
                background: tab === t ? 'rgba(255, 170, 48, 0.18)' : 'transparent',
                border: tab === t ? '1px solid rgba(255, 170, 48, 0.4)' : '1px solid transparent',
                color: tab === t ? '#ffcc66' : '#d99a4e',
                borderRadius: 4,
                padding: '4px 10px',
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
                fontWeight: 'bold',
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === 'activity' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 10, color: '#ffaa30', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
              UNIFIED ACTIVITY STREAM
            </div>
            {project.activities.map((act) => (
              <div key={act.id} style={{ background: 'rgba(20, 10, 2, 0.7)', border: '1px solid rgba(255, 170, 48, 0.2)', borderRadius: 4, padding: '8px 10px', fontSize: 11 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2, fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: '#ffaa30', fontWeight: 'bold' }}>[{act.type.toUpperCase()}] {act.title}</span>
                  <span style={{ color: '#885522' }}>{act.timestamp}</span>
                </div>
                <div style={{ color: '#ffcc66' }}>{act.description}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'tasks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 10, color: '#ffaa30', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
              CONNECTED TASKS ({project.relatedTasks.length})
            </div>
            {project.relatedTasks.map((t) => (
              <div key={t} style={{ background: 'rgba(20, 10, 2, 0.7)', border: '1px solid rgba(255, 170, 48, 0.2)', borderRadius: 4, padding: '8px 10px', fontSize: 12, color: '#ffcc66', display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconTasks width={14} height={14} style={{ color: '#ffaa30' }} />
                <span>{t}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'notes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 10, color: '#ffaa30', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
              CONNECTED NOTES ({project.relatedNotes.length})
            </div>
            {project.relatedNotes.map((n) => (
              <div key={n} style={{ background: 'rgba(20, 10, 2, 0.7)', border: '1px solid rgba(255, 170, 48, 0.2)', borderRadius: 4, padding: '8px 10px', fontSize: 12, color: '#ffcc66', display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconNotes width={14} height={14} style={{ color: '#ffaa30' }} />
                <span>{n}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255, 170, 48, 0.3)', display: 'flex', justifyContent: 'flex-end', background: 'rgba(14, 7, 1, 0.95)' }}>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close Workspace
        </Button>
      </div>
    </div>
  );
}

function CreateProjectModal({
  name,
  setName,
  desc,
  setDesc,
  dueDate,
  setDueDate,
  onClose,
  onSubmit,
}: {
  readonly name: string;
  readonly setName: (v: string) => void;
  readonly desc: string;
  readonly setDesc: (v: string) => void;
  readonly dueDate: string;
  readonly setDueDate: (v: string) => void;
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
            <IconFolder width={14} height={14} />
            <span>CREATE PROJECT WORKSPACE</span>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#885522', cursor: 'pointer' }}>
            <IconX width={16} height={16} />
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 10, color: '#885522', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>PROJECT NAME *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Syntrophos V2 Core Architecture"
              required
              autoFocus
              style={{ background: 'rgba(20, 10, 2, 0.8)', borderColor: 'rgba(255, 170, 48, 0.3)', color: '#ffcc66' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 10, color: '#885522', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>DESCRIPTION</label>
            <textarea
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Describe project objectives and scope..."
              style={{ width: '100%', background: 'rgba(20, 10, 2, 0.8)', border: '1px solid rgba(255, 170, 48, 0.3)', borderRadius: 4, padding: '10px', color: '#ffcc66', fontSize: 12, fontFamily: 'var(--font-sans)', resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 10, color: '#885522', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>TARGET DUE DATE</label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{ background: 'rgba(20, 10, 2, 0.8)', borderColor: 'rgba(255, 170, 48, 0.3)', color: '#ffcc66' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              [ INITIALIZE PROJECT ]
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
