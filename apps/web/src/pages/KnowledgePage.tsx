import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader.js';
import { Badge, Button, Input } from '@/components/ui/primitives.js';
import { ErrorState, EmptyState } from '@/components/ui/states.js';
import {
  IconGraph,
  IconSearch,
  IconBot,
  IconFolder,
  IconNotes,
  IconTasks,
  IconUser,
  IconWorkflow,
  IconX,
  IconPlus,
} from '@/lib/icons.js';

export type KnowledgeSource = {
  readonly id: string;
  readonly name: string;
  readonly type: 'Markdown' | 'PDF' | 'Folder' | 'Repository' | 'Note';
  readonly category: 'Documents' | 'Notes' | 'Files' | 'Repositories' | 'Other';
  readonly updatedText: string;
  readonly relationshipCount: number;
  readonly agentUsageCount: number;
  readonly lastAccessedText: string;
  readonly primaryAgent: string;
  readonly accessCount: number;
  readonly description: string;
  readonly relatedProjects: readonly string[];
  readonly relatedAgents: readonly string[];
  readonly relatedWorkflows: readonly string[];
  readonly relatedPeople: readonly string[];
  readonly relatedTasksCount: number;
  readonly relatedNotesCount: number;
};

export type AgentUsageStat = {
  readonly agentName: string;
  readonly totalAccesses: number;
  readonly sources: readonly {
    readonly name: string;
    readonly accesses: number;
    readonly percentage: number;
  }[];
};

export type KnowledgeEvent = {
  readonly id: string;
  readonly timestamp: string;
  readonly actor: string;
  readonly action: string;
  readonly target: string;
};

const MOCK_SOURCES: KnowledgeSource[] = [
  {
    id: 'src-1',
    name: 'Q3 Product Strategy.md',
    type: 'Markdown',
    category: 'Documents',
    updatedText: 'Today · 09:42',
    relationshipCount: 12,
    agentUsageCount: 3,
    lastAccessedText: '18m ago',
    primaryAgent: 'Planner Agent',
    accessCount: 42,
    description: 'Core strategic roadmap document and milestone definitions for Syntrophos V1.',
    relatedProjects: ['Syntrophos V1 Release'],
    relatedAgents: ['Planner Agent', 'Researcher Agent'],
    relatedWorkflows: ['Weekly Review'],
    relatedPeople: ['Sarah Chen'],
    relatedTasksCount: 6,
    relatedNotesCount: 3,
  },
  {
    id: 'src-2',
    name: 'Product Roadmap.pdf',
    type: 'PDF',
    category: 'Documents',
    updatedText: 'Yesterday · 14:20',
    relationshipCount: 27,
    agentUsageCount: 4,
    lastAccessedText: '2h ago',
    primaryAgent: 'Researcher Agent',
    accessCount: 27,
    description: 'Executive PDF feature roadmap and competitive matrix evaluation.',
    relatedProjects: ['Syntrophos V1 Release'],
    relatedAgents: ['Researcher Agent', 'Planner Agent'],
    relatedWorkflows: ['Daily Planning Digest'],
    relatedPeople: ['Jordan Vance'],
    relatedTasksCount: 4,
    relatedNotesCount: 2,
  },
  {
    id: 'src-3',
    name: 'Meeting Notes / Q3 Kickoff',
    type: 'Note',
    category: 'Notes',
    updatedText: 'Today · 08:15',
    relationshipCount: 19,
    agentUsageCount: 2,
    lastAccessedText: '3h ago',
    primaryAgent: 'Weekly Review',
    accessCount: 19,
    description: 'Transcript and decisions from the Q3 Strategic Allocation session.',
    relatedProjects: ['Syntrophos V1 Release'],
    relatedAgents: ['Planner Agent'],
    relatedWorkflows: ['Weekly Review'],
    relatedPeople: ['Sarah Chen', 'Jordan Vance'],
    relatedTasksCount: 3,
    relatedNotesCount: 5,
  },
  {
    id: 'src-4',
    name: 'Client Research Archive',
    type: 'Folder',
    category: 'Files',
    updatedText: '3 days ago',
    relationshipCount: 41,
    agentUsageCount: 2,
    lastAccessedText: '5h ago',
    primaryAgent: 'Researcher Agent',
    accessCount: 11,
    description: 'Customer interviews, feedback logs, and external market research assets.',
    relatedProjects: ['Client Operations'],
    relatedAgents: ['Researcher Agent'],
    relatedWorkflows: ['Client Follow-Up'],
    relatedPeople: ['Sarah Chen'],
    relatedTasksCount: 8,
    relatedNotesCount: 4,
  },
  {
    id: 'src-5',
    name: 'syntrophos-core-repo',
    type: 'Repository',
    category: 'Repositories',
    updatedText: 'Today · 10:10',
    relationshipCount: 34,
    agentUsageCount: 3,
    lastAccessedText: '1h ago',
    primaryAgent: 'Engineer Agent',
    accessCount: 38,
    description: 'Main application repository, spatial Core shaders, and UI package architecture.',
    relatedProjects: ['Syntrophos V1 Release', 'Dense Retrieval Evaluation'],
    relatedAgents: ['Engineer Agent', 'Planner Agent'],
    relatedWorkflows: ['Automated PR Code Review'],
    relatedPeople: ['Jordan Vance'],
    relatedTasksCount: 12,
    relatedNotesCount: 6,
  },
];

const AGENT_USAGE_STATS: AgentUsageStat[] = [
  {
    agentName: 'Planner Agent',
    totalAccesses: 79,
    sources: [
      { name: 'Q3 Product Strategy.md', accesses: 42, percentage: 53 },
      { name: 'Product Roadmap.pdf', accesses: 27, percentage: 34 },
      { name: 'Meeting Notes / Q3 Kickoff', accesses: 10, percentage: 13 },
    ],
  },
  {
    agentName: 'Researcher Agent',
    totalAccesses: 56,
    sources: [
      { name: 'Client Research Archive', accesses: 28, percentage: 50 },
      { name: 'Product Roadmap.pdf', accesses: 18, percentage: 32 },
      { name: 'Q3 Product Strategy.md', accesses: 10, percentage: 18 },
    ],
  },
  {
    agentName: 'Engineer Agent',
    totalAccesses: 38,
    sources: [
      { name: 'syntrophos-core-repo', accesses: 26, percentage: 68 },
      { name: 'Q3 Product Strategy.md', accesses: 12, percentage: 32 },
    ],
  },
];

const MOCK_ACTIVITIES: KnowledgeEvent[] = [
  { id: 'ev-1', timestamp: '10:42 AM', actor: 'PLANNER AGENT', action: 'Accessed', target: 'Q3 Product Strategy.md' },
  { id: 'ev-2', timestamp: '10:18 AM', actor: 'RESEARCHER AGENT', action: 'Referenced', target: 'Product Roadmap.pdf' },
  { id: 'ev-3', timestamp: '09:51 AM', actor: 'KNOWLEDGE SYSTEM', action: 'Source updated', target: 'Meeting Notes / Q3 Kickoff' },
  { id: 'ev-4', timestamp: '09:32 AM', actor: 'PLANNER AGENT', action: 'Retrieved', target: 'Q3 Planning Notes' },
  { id: 'ev-5', timestamp: '08:15 AM', actor: 'ENGINEER AGENT', action: 'Indexed repository commit', target: 'syntrophos-core-repo' },
];

export default function KnowledgePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'sources' | 'activity'>('overview');
  const [sources] = useState<KnowledgeSource[]>(MOCK_SOURCES);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [selectedSource, setSelectedSource] = useState<KnowledgeSource | null>(null);

  const filteredSources = useMemo(() => {
    return sources.filter((s) => {
      if (categoryFilter !== 'All' && s.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.primaryAgent.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [sources, categoryFilter, searchQuery]);

  return (
    <div className="shell-page shell-page--wide" style={{ background: '#000000', color: '#ffcc66', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-sans)' }}>
      {/* 1. WORKSPACE HEADER */}
      <PageHeader
        variant="wide"
        icon={<IconGraph width={22} height={22} />}
        title="KNOWLEDGE // INTELLIGENCE MATRIX"
        subtitle="Everything Syntrophos knows, connected and searchable."
        actions={[
          {
            id: 'reindex',
            label: 'Re-index sources',
            variant: 'ghost',
            onAction: () => window.alert('Knowledge sources re-indexed cleanly.'),
          },
        ]}
      />

      <div style={{ padding: '0 24px 24px 24px', display: 'flex', flexDirection: 'column', gap: 20, flex: '1 1 auto' }}>
        {/* 2. SEGMENTED TAB NAVIGATION */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, borderBottom: '1px solid rgba(255, 170, 48, 0.25)', paddingBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {(['overview', 'sources', 'activity'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                style={{
                  background: activeTab === tab ? 'rgba(120, 60, 0, 0.6)' : 'transparent',
                  border: activeTab === tab ? '1px solid rgba(255, 170, 48, 0.6)' : '1px solid transparent',
                  color: activeTab === tab ? '#ffcc66' : '#d99a4e',
                  borderRadius: 4,
                  padding: '6px 16px',
                  fontSize: 12,
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div style={{ width: 300 }}>
            <Input
              placeholder="Search knowledge sources… (⌘K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leading={<IconSearch width={14} height={14} />}
              style={{ background: 'rgba(20, 10, 2, 0.8)', borderColor: 'rgba(255, 170, 48, 0.3)', color: '#ffcc66', fontSize: 12 }}
            />
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Knowledge Summary Context Bar */}
            <div style={{ background: 'rgba(12, 6, 1, 0.9)', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 8, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 11, fontWeight: 'bold', color: '#ffaa30', letterSpacing: '0.12em', fontFamily: 'var(--font-mono)' }}>
                KNOWLEDGE MATRIX STATE
              </div>
              <div style={{ display: 'flex', gap: 24, fontSize: 13, fontFamily: 'var(--font-mono)' }}>
                <span style={{ color: '#ffcc66' }}><strong style={{ color: '#ffaa30' }}>184</strong> sources</span>
                <span style={{ color: '#885522' }}>·</span>
                <span style={{ color: '#ffcc66' }}><strong style={{ color: '#ffaa30' }}>1,248</strong> connected entities</span>
                <span style={{ color: '#885522' }}>·</span>
                <span style={{ color: '#ffcc66' }}><strong style={{ color: '#ffaa30' }}>12</strong> recently updated</span>
                <span style={{ color: '#885522' }}>·</span>
                <span style={{ color: '#ffcc66' }}><strong style={{ color: '#ffaa30' }}>36</strong> active sources</span>
              </div>
            </div>

            {/* Most Used Knowledge */}
            <div>
              <div style={{ fontSize: 11, color: '#ffaa30', fontWeight: 'bold', letterSpacing: '0.12em', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
                MOST USED KNOWLEDGE SOURCES
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 14 }}>
                {sources.slice(0, 4).map((src) => (
                  <div
                    key={src.id}
                    onClick={() => setSelectedSource(src)}
                    style={{ background: 'rgba(12, 6, 1, 0.9)', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 6, padding: '16px', display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 14, fontWeight: 'bold', color: '#ffcc66' }}>{src.name}</span>
                      <span style={{ fontSize: 10, color: '#ffaa30', fontFamily: 'var(--font-mono)' }}>{src.type}</span>
                    </div>

                    <div style={{ fontSize: 11, color: '#885522' }}>{src.description}</div>

                    {/* Usage Progress Bar */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: 'var(--font-mono)', color: '#d99a4e', marginBottom: 4 }}>
                        <span>PRIMARY: {src.primaryAgent}</span>
                        <span>{src.accessCount} accesses</span>
                      </div>
                      <div style={{ width: '100%', height: 4, background: 'rgba(255, 170, 48, 0.15)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, src.accessCount * 2)}%`, height: '100%', background: '#ffaa30' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Agent Knowledge Usage Breakdown */}
            <div>
              <div style={{ fontSize: 11, color: '#ffaa30', fontWeight: 'bold', letterSpacing: '0.12em', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
                AGENT KNOWLEDGE USAGE BREAKDOWN
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
                {AGENT_USAGE_STATS.map((stat) => (
                  <div key={stat.agentName} style={{ background: 'rgba(12, 6, 1, 0.9)', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 6, padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 170, 48, 0.2)', paddingBottom: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 'bold', color: '#ffcc66' }}>{stat.agentName}</span>
                      <span style={{ fontSize: 10, color: '#ffaa30', fontFamily: 'var(--font-mono)' }}>{stat.totalAccesses} total accesses</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {stat.sources.map((s) => (
                        <div key={s.name} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                            <span style={{ color: '#d99a4e' }}>{s.name}</span>
                            <span style={{ color: '#885522' }}>{s.accesses} accesses</span>
                          </div>
                          <div style={{ width: '100%', height: 4, background: 'rgba(255, 170, 48, 0.15)', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ width: `${s.percentage}%`, height: '100%', background: 'linear-gradient(90deg, #ffaa30, #cc7800)' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SOURCES LIBRARY */}
        {activeTab === 'sources' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Category Filters */}
            <div style={{ display: 'flex', gap: 6 }}>
              {(['All', 'Documents', 'Notes', 'Files', 'Repositories', 'Other'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  style={{
                    background: categoryFilter === cat ? '#ffaa30' : 'rgba(20, 10, 2, 0.6)',
                    color: categoryFilter === cat ? '#000000' : '#d99a4e',
                    border: '1px solid rgba(255, 170, 48, 0.25)',
                    borderRadius: 4,
                    padding: '4px 12px',
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sources List Table Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredSources.map((src) => (
                <div
                  key={src.id}
                  onClick={() => setSelectedSource(src)}
                  style={{
                    background: 'rgba(12, 6, 1, 0.9)',
                    border: '1px solid rgba(255, 170, 48, 0.2)',
                    borderRadius: 6,
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 10, background: 'rgba(255, 170, 48, 0.15)', border: '1px solid rgba(255, 170, 48, 0.3)', color: '#ffaa30', padding: '2px 6px', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>
                      {src.type}
                    </span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 'bold', color: '#ffcc66' }}>{src.name}</div>
                      <div style={{ fontSize: 10, color: '#885522', fontFamily: 'var(--font-mono)' }}>{src.description}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                    <span style={{ color: '#d99a4e' }}>{src.relationshipCount} relationships</span>
                    <span style={{ color: '#885522' }}>·</span>
                    <span style={{ color: '#ffaa30' }}>{src.agentUsageCount} agents</span>
                    <span style={{ color: '#885522' }}>·</span>
                    <span style={{ color: '#885522' }}>Last accessed {src.lastAccessedText}</span>
                    <button type="button" style={{ background: 'transparent', border: 'none', color: '#ffaa30', fontWeight: 'bold', cursor: 'pointer' }}>
                      [ Inspect → ]
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ACTIVITY STREAM */}
        {activeTab === 'activity' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {MOCK_ACTIVITIES.map((act) => (
              <div key={act.id} style={{ background: 'rgba(12, 6, 1, 0.85)', border: '1px solid rgba(255, 170, 48, 0.2)', borderRadius: 6, padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 10, color: '#885522', fontFamily: 'var(--font-mono)' }}>{act.timestamp}</span>
                  <span style={{ color: '#ffaa30', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>[{act.actor}]</span>
                  <span style={{ color: '#d99a4e' }}>{act.action}</span>
                  <span style={{ color: '#ffcc66', fontWeight: 600 }}>{act.target}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CONTEXTUAL SOURCE DETAIL DRAWER */}
      {selectedSource && (
        <SourceDetailDrawer
          source={selectedSource}
          onClose={() => setSelectedSource(null)}
        />
      )}
    </div>
  );
}

function SourceDetailDrawer({
  source,
  onClose,
}: {
  readonly source: KnowledgeSource;
  readonly onClose: () => void;
}) {
  return (
    <div className="task-detail-drawer" style={{ color: '#ffcc66', fontFamily: 'var(--font-sans)' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 170, 48, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(14, 7, 1, 0.95)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#ffaa30', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
          <IconGraph width={14} height={14} />
          <span>SOURCE DETAIL // {source.name.toUpperCase()}</span>
        </div>
        <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#885522', cursor: 'pointer' }}>
          <IconX width={16} height={16} />
        </button>
      </div>

      <div style={{ padding: '20px', flex: '1 1 auto', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: '#ffcc66', marginBottom: 4 }}>{source.name}</div>
          <div style={{ fontSize: 11, color: '#885522', fontFamily: 'var(--font-mono)' }}>TYPE: {source.type} · UPDATED: {source.updatedText}</div>
        </div>

        {/* Telemetry Box */}
        <div style={{ background: 'rgba(20, 10, 2, 0.8)', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 6, padding: '14px', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11, fontFamily: 'var(--font-mono)' }}>
          <div style={{ color: '#ffaa30', fontWeight: 'bold' }}>USED BY AGENTS &amp; WORKFLOWS</div>
          <div>Planner Agent — 42 accesses</div>
          <div>Researcher Agent — 18 accesses</div>
          <div>Weekly Review — 7 accesses</div>
        </div>

        {/* Related Context Matrix */}
        <div>
          <div style={{ fontSize: 10, color: '#ffaa30', fontWeight: 'bold', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
            RELATED CONTEXT MATRIX
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11, fontFamily: 'var(--font-mono)' }}>
            <div>Projects → {source.relatedProjects.join(', ')}</div>
            <div>Agents → {source.relatedAgents.join(', ')}</div>
            <div>Workflows → {source.relatedWorkflows.join(', ')}</div>
            <div>People → {source.relatedPeople.join(', ')}</div>
            <div>Tasks → {source.relatedTasksCount} related tasks</div>
            <div>Notes → {source.relatedNotesCount} related notes</div>
          </div>
        </div>

        {/* Provenance Timeline */}
        <div>
          <div style={{ fontSize: 10, color: '#ffaa30', fontWeight: 'bold', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
            KNOWLEDGE PROVENANCE TIMELINE
          </div>
          <div style={{ background: 'rgba(16, 8, 2, 0.8)', border: '1px solid rgba(255, 170, 48, 0.2)', borderRadius: 6, padding: '12px', fontSize: 10, fontFamily: 'var(--font-mono)', display: 'flex', flexDirection: 'column', gap: 6, color: '#34d399' }}>
            <div>SOURCE: {source.name}</div>
            <div>↓ RETRIEVED BY AGENT: {source.primaryAgent}</div>
            <div>↓ USED IN WORKFLOW: Q3 Planning Pipeline</div>
            <div>↓ PRODUCED RESULT: 6 proposed tasks</div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.alert(`Opening source ${source.name}`)}
          style={{ background: '#ffaa30', border: 'none', borderRadius: 4, color: '#000000', padding: '8px', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 'bold', cursor: 'pointer' }}
        >
          [ OPEN SOURCE ASSET → ]
        </button>
      </div>
    </div>
  );
}
