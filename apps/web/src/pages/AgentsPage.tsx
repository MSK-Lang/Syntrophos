import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader.js';
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, Input, Separator } from '@/components/ui/primitives.js';
import { ErrorState, EmptyState, PageLoader } from '@/components/ui/states.js';
import {
  IconBot,
  IconPlus,
  IconSearch,
  IconCode,
  IconTasks,
  IconCheckCircle,
  IconX,
  IconChevronRight,
  IconFolder,
  IconStar,
  IconPlay,
  IconPause,
} from '@/lib/icons.js';
import { useAgents, useProviders } from '@/lib/services/index.js';
import type { Agent, AgentRun, Workflow, AgentStatus } from '@/lib/services/agents.contract.js';
import type { Provider } from '@/lib/services/providers.contract.js';

export default function AgentsPage({ embedInWorkspace = false }: { readonly embedInWorkspace?: boolean }) {
  const { list: listAgents, listRuns, listWorkflows, create: createAgent } = useAgents();
  const { list: listProviders } = useProviders();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [agents, setAgents] = useState<Agent[]>([]);
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);

  // Navigation & Filtering
  const [tab, setTab] = useState<'agents' | 'runs' | 'workflows'>('agents');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  // Drawer / Modal states
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Agent Form
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentType, setNewAgentType] = useState('research');
  const [newAgentDesc, setNewAgentDesc] = useState('');
  const [newAgentModel, setNewAgentModel] = useState('gpt-4o');

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        setLoading(true);
        const [a, r, w, p] = await Promise.all([
          listAgents(),
          listRuns?.({ pageSize: 10 }) ?? Promise.resolve({ items: [] }),
          listWorkflows?.({ pageSize: 10 }) ?? Promise.resolve({ items: [] }),
          listProviders?.({ pageSize: 10 }) ?? Promise.resolve({ items: [] }),
        ]);
        if (!mounted) return;
        setAgents((a.items ?? []) as Agent[]);
        setRuns((r.items ?? []) as AgentRun[]);
        setWorkflows((w.items ?? []) as Workflow[]);
        setProviders((p.items ?? []) as Provider[]);
      } catch (err) {
        if (mounted) setError(err as Error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [listAgents, listRuns, listWorkflows, listProviders]);

  const filteredAgents = useMemo(() => {
    return agents.filter((a) => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (typeFilter !== 'all' && a.type.toLowerCase() !== typeFilter.toLowerCase()) return false;
      if (modelFilter !== 'all' && (a.defaultModel ?? '').toLowerCase() !== modelFilter.toLowerCase()) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = a.name.toLowerCase().includes(q);
        const descMatch = (a.description ?? '').toLowerCase().includes(q);
        const capMatch = a.capabilities.some((c) => c.name.toLowerCase().includes(q));
        if (!titleMatch && !descMatch && !capMatch) return false;
      }
      return true;
    });
  }, [agents, statusFilter, typeFilter, modelFilter, searchQuery]);

  const handleCreateAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName.trim()) return;
    try {
      await createAgent({
        name: newAgentName.trim(),
        type: newAgentType as never,
      });
      setIsCreateModalOpen(false);
      setNewAgentName('');
      setNewAgentDesc('');
      const a = await listAgents();
      setAgents((a.items ?? []) as Agent[]);
    } catch (err) {
      setError(err as Error);
    }
  };

  return (
    <div className="shell-page shell-page--wide" style={{ background: '#000000', color: '#ffcc66', minHeight: embedInWorkspace ? 'auto' : '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. HEADER */}
      {!embedInWorkspace && (
        <PageHeader
          variant="wide"
          icon={<IconBot width={22} height={22} />}
          title="AGENTS // CONTROL CENTER"
          subtitle={`${agents.length} active agents · ${runs.length} recent runs`}
          actions={[
            {
              id: 'new-agent',
              label: '+ Create agent',
              variant: 'primary',
              icon: <IconPlus width={14} height={14} />,
              onAction: () => setIsCreateModalOpen(true),
              primary: true,
            },
          ]}
        />
      )}

      <div style={{ padding: '0 24px 24px 24px', display: 'flex', flexDirection: 'column', gap: 20, flex: '1 1 auto' }}>
        {loading ? (
          <PageLoader label="LOADING AGENT PIPELINES…" />
        ) : error ? (
          <ErrorState title="FAILED TO LOAD AGENTS" error={error.message} />
        ) : (
          <>
            {/* 2. TABS */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 170, 48, 0.25)', paddingBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setTab('agents')}
                  style={{
                    background: tab === 'agents' ? 'rgba(120, 60, 0, 0.6)' : 'transparent',
                    border: tab === 'agents' ? '1px solid rgba(255, 170, 48, 0.6)' : '1px solid transparent',
                    color: tab === 'agents' ? '#ffcc66' : '#d99a4e',
                    borderRadius: 4,
                    padding: '6px 14px',
                    fontSize: 12,
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <IconBot width={14} height={14} /> AGENTS ({agents.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTab('runs')}
                  style={{
                    background: tab === 'runs' ? 'rgba(120, 60, 0, 0.6)' : 'transparent',
                    border: tab === 'runs' ? '1px solid rgba(255, 170, 48, 0.6)' : '1px solid transparent',
                    color: tab === 'runs' ? '#ffcc66' : '#d99a4e',
                    borderRadius: 4,
                    padding: '6px 14px',
                    fontSize: 12,
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <IconPlay width={14} height={14} /> RECENT RUNS ({runs.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTab('workflows')}
                  style={{
                    background: tab === 'workflows' ? 'rgba(120, 60, 0, 0.6)' : 'transparent',
                    border: tab === 'workflows' ? '1px solid rgba(255, 170, 48, 0.6)' : '1px solid transparent',
                    color: tab === 'workflows' ? '#ffcc66' : '#d99a4e',
                    borderRadius: 4,
                    padding: '6px 14px',
                    fontSize: 12,
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <IconTasks width={14} height={14} /> WORKFLOWS ({workflows.length})
                </button>
              </div>
            </div>

            {/* 3. SEARCH & FILTER CONTROL BAR */}
            {tab === 'agents' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 auto', maxWidth: 640 }}>
                  <Input
                    placeholder="Search agents by name, skill, or role…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leading={<IconSearch width={14} height={14} />}
                    style={{ background: 'rgba(20, 10, 2, 0.8)', borderColor: 'rgba(255, 170, 48, 0.3)', color: '#ffcc66', fontSize: 12, fontFamily: 'monospace' }}
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ background: 'rgba(20, 10, 2, 0.8)', border: '1px solid rgba(255, 170, 48, 0.3)', borderRadius: 4, color: '#ffcc66', fontSize: 11, fontFamily: 'monospace', padding: '7px 10px' }}
                  >
                    <option value="all">All status ▼</option>
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="offline">Offline</option>
                  </select>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    style={{ background: 'rgba(20, 10, 2, 0.8)', border: '1px solid rgba(255, 170, 48, 0.3)', borderRadius: 4, color: '#ffcc66', fontSize: 11, fontFamily: 'monospace', padding: '7px 10px' }}
                  >
                    <option value="all">All types ▼</option>
                    <option value="research">Research</option>
                    <option value="code">Code</option>
                    <option value="planning">Planning</option>
                    <option value="memory">Memory</option>
                  </select>
                </div>

                {/* View mode toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(20, 10, 2, 0.8)', border: '1px solid rgba(255, 170, 48, 0.3)', borderRadius: 4, padding: 2 }}>
                  <button
                    type="button"
                    onClick={() => setViewMode('board')}
                    style={{
                      background: viewMode === 'board' ? 'rgba(255, 170, 48, 0.25)' : 'transparent',
                      border: 'none',
                      color: '#ffcc66',
                      borderRadius: 3,
                      padding: '4px 8px',
                      fontSize: 10,
                      fontFamily: 'monospace',
                      cursor: 'pointer',
                    }}
                  >
                    ▦ BOARD
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    style={{
                      background: viewMode === 'list' ? 'rgba(255, 170, 48, 0.25)' : 'transparent',
                      border: 'none',
                      color: '#ffcc66',
                      borderRadius: 3,
                      padding: '4px 8px',
                      fontSize: 10,
                      fontFamily: 'monospace',
                      cursor: 'pointer',
                    }}
                  >
                    ☰ LIST
                  </button>
                </div>
              </div>
            )}

            {/* 4. AGENT CARDS GRID */}
            {tab === 'agents' && (
              filteredAgents.length === 0 ? (
                <EmptyState
                  icon={<IconBot width={36} height={36} />}
                  title="No agents match filter"
                  description="Adjust your search query or filter settings to view agents."
                  action={{ label: 'Create agent', onClick: () => setIsCreateModalOpen(true) }}
                />
              ) : viewMode === 'board' ? (
                <div className="agents-workspace-grid">
                  {filteredAgents.map((agent) => (
                    <AgentCardItem
                      key={agent.id}
                      agent={agent}
                      providers={providers}
                      onOpen={() => setSelectedAgent(agent)}
                    />
                  ))}
                </div>
              ) : (
                /* List View Mode */
                <div style={{ background: 'rgba(12, 6, 1, 0.85)', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 120px', padding: '10px 16px', background: 'rgba(14, 7, 1, 0.95)', borderBottom: '1px solid rgba(255, 170, 48, 0.25)', fontSize: 10, color: '#885522', fontFamily: 'monospace', fontWeight: 'bold' }}>
                    <span>AGENT NAME &amp; ROLE</span>
                    <span>STATUS</span>
                    <span>MODEL</span>
                    <span>SUCCESS RATE</span>
                    <span>ACTION</span>
                  </div>
                  {filteredAgents.map((agent) => (
                    <div
                      key={agent.id}
                      style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 120px', padding: '12px 16px', borderBottom: '1px solid rgba(255, 170, 48, 0.15)', alignItems: 'center', fontSize: 12, fontFamily: 'monospace' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255, 170, 48, 0.15)', border: '1px solid rgba(255, 170, 48, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffaa30' }}>
                          <AgentTypeIcon type={agent.type} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#ffcc66' }}>{agent.name}</div>
                          <div style={{ fontSize: 10, color: '#885522' }}>{agent.type.toUpperCase()}</div>
                        </div>
                      </div>

                      <div>
                        <Badge tone={agent.status === 'available' ? 'success' : agent.status === 'busy' ? 'warning' : 'default'} size="sm" dot>
                          {agent.status}
                        </Badge>
                      </div>

                      <div style={{ color: '#d99a4e', fontSize: 11 }}>{agent.defaultModel ?? 'OpenAI · gpt-4o'}</div>
                      <div style={{ color: '#34d399', fontSize: 11 }}>98%</div>

                      <div>
                        <button
                          type="button"
                          onClick={() => setSelectedAgent(agent)}
                          style={{ background: 'transparent', border: '1px solid rgba(255, 170, 48, 0.4)', borderRadius: 4, color: '#ffcc66', padding: '4px 10px', fontSize: 10, cursor: 'pointer' }}
                        >
                          Open →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* RECENT RUNS TAB */}
            {tab === 'runs' && (
              <div style={{ background: 'rgba(12, 6, 1, 0.85)', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 8, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 'bold', color: '#ffaa30', letterSpacing: '0.12em', fontFamily: 'monospace', marginBottom: 16 }}>
                  AGENT EXECUTION RUNS HISTORY
                </div>
                {runs.length === 0 ? (
                  <EmptyState icon={<IconBot width={32} height={32} />} title="No execution runs recorded" />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {runs.map((r) => (
                      <div key={r.id} style={{ padding: '12px 16px', background: 'rgba(22, 11, 2, 0.8)', border: '1px solid rgba(255, 170, 48, 0.2)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 'bold', color: '#ffcc66' }}>{r.taskTitle}</div>
                          <div style={{ fontSize: 11, color: '#885522', fontFamily: 'monospace', marginTop: 2 }}>{formatRelative(r.startedAt)}</div>
                        </div>
                        <Badge tone={r.status === 'success' ? 'success' : 'warning'} size="sm">{r.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* WORKFLOWS TAB */}
            {tab === 'workflows' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {workflows.map((w) => (
                  <Card key={w.id} tone="default">
                    <CardHeader>
                      <CardTitle>{w.name}</CardTitle>
                      <Badge size="sm" tone="violet">{w.trigger.type}</Badge>
                    </CardHeader>
                    <CardBody>
                      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>{w.description ?? 'Autonomous multi-step pipeline.'}</p>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}

            {/* 7. LOWER OPERATIONS AREA */}
            <div className="agent-operations-grid" style={{ marginTop: 8 }}>
              {/* AREA 1: AGENT SYSTEM STATUS */}
              <div style={{ background: '#080401', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 11, fontWeight: 'bold', color: '#ffaa30', letterSpacing: '0.12em', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="island-pulse-orb" style={{ width: 6, height: 6, background: '#34d399' }} />
                    <span>AGENT SYSTEM STATUS</span>
                  </div>
                  <span style={{ fontSize: 9, color: '#885522', fontFamily: 'monospace' }}>This week</span>
                </div>

                <div style={{ fontSize: 11, color: '#34d399', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <IconCheckCircle width={12} height={12} />
                  <span>All systems operational</span>
                </div>

                {/* 4 Stat Boxes */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div className="agent-stat-box">
                    <div style={{ fontSize: 20, fontWeight: 'bold', color: '#ffaa30', fontFamily: 'monospace' }}>4</div>
                    <div style={{ fontSize: 9, color: '#885522', fontFamily: 'monospace', marginTop: 2 }}>Active agents</div>
                  </div>
                  <div className="agent-stat-box">
                    <div style={{ fontSize: 20, fontWeight: 'bold', color: '#ffaa30', fontFamily: 'monospace' }}>2</div>
                    <div style={{ fontSize: 9, color: '#885522', fontFamily: 'monospace', marginTop: 2 }}>Runs in progress</div>
                  </div>
                  <div className="agent-stat-box">
                    <div style={{ fontSize: 20, fontWeight: 'bold', color: '#34d399', fontFamily: 'monospace' }}>98%</div>
                    <div style={{ fontSize: 9, color: '#885522', fontFamily: 'monospace', marginTop: 2 }}>Avg success rate</div>
                  </div>
                  <div className="agent-stat-box">
                    <div style={{ fontSize: 20, fontWeight: 'bold', color: '#ffaa30', fontFamily: 'monospace' }}>124</div>
                    <div style={{ fontSize: 9, color: '#885522', fontFamily: 'monospace', marginTop: 2 }}>Tasks automated</div>
                  </div>
                </div>
              </div>

              {/* AREA 2: RECENT RUNS */}
              <div style={{ background: '#080401', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 'bold', color: '#ffaa30', letterSpacing: '0.12em', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <IconPlay width={12} height={12} />
                  <span>RECENT RUNS</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ padding: '8px 10px', background: 'rgba(20, 10, 2, 0.6)', border: '1px solid rgba(255, 170, 48, 0.2)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, fontFamily: 'monospace' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#ffcc66' }}>Q3 Product Planning</div>
                      <div style={{ fontSize: 9, color: '#885522' }}>Planner</div>
                    </div>
                    <span style={{ color: '#ffaa30', fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                      In progress 62% <span className="island-pulse-orb" style={{ width: 5, height: 5 }} />
                    </span>
                  </div>

                  <div style={{ padding: '8px 10px', background: 'rgba(20, 10, 2, 0.6)', border: '1px solid rgba(255, 170, 48, 0.2)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, fontFamily: 'monospace' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#ffcc66' }}>Research: Retrieval Evaluation</div>
                      <div style={{ fontSize: 9, color: '#885522' }}>Researcher</div>
                    </div>
                    <span style={{ color: '#34d399', fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                      Completed <IconCheckCircle width={10} height={10} />
                    </span>
                  </div>

                  <div style={{ padding: '8px 10px', background: 'rgba(20, 10, 2, 0.6)', border: '1px solid rgba(255, 170, 48, 0.2)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, fontFamily: 'monospace' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#ffcc66' }}>Code review: ColBERT reranker</div>
                      <div style={{ fontSize: 9, color: '#885522' }}>Engineer</div>
                    </div>
                    <span style={{ color: '#34d399', fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                      Completed <IconCheckCircle width={10} height={10} />
                    </span>
                  </div>
                </div>
              </div>

              {/* AREA 3: QUICK ACTIONS */}
              <div style={{ background: '#080401', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 'bold', color: '#ffaa30', letterSpacing: '0.12em', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <IconTasks width={12} height={12} />
                  <span>QUICK ACTIONS</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="agent-quick-action-item" onClick={() => setIsCreateModalOpen(true)}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 'bold', color: '#ffcc66', fontFamily: 'monospace' }}>+ Create custom agent</div>
                      <div style={{ fontSize: 9, color: '#885522', fontFamily: 'monospace' }}>Build an agent for your workflow</div>
                    </div>
                    <IconPlus width={14} height={14} style={{ color: '#ffaa30' }} />
                  </div>

                  <div className="agent-quick-action-item">
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 'bold', color: '#ffcc66', fontFamily: 'monospace' }}>Browse templates</div>
                      <div style={{ fontSize: 9, color: '#885522', fontFamily: 'monospace' }}>Use a proven agent template</div>
                    </div>
                    <IconFolder width={14} height={14} style={{ color: '#ffaa30' }} />
                  </div>

                  <div className="agent-quick-action-item">
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 'bold', color: '#ffcc66', fontFamily: 'monospace' }}>Agent marketplace</div>
                      <div style={{ fontSize: 9, color: '#885522', fontFamily: 'monospace' }}>Discover community agents</div>
                    </div>
                    <IconChevronRight width={14} height={14} style={{ color: '#ffaa30' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM COMMAND TIP BAR */}
            <div style={{ background: 'rgba(14, 7, 1, 0.95)', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 6, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 11, fontFamily: 'monospace', color: '#885522' }}>
              <span>Tip: Ask Syntrophos to run an agent.</span>
              <span style={{ background: 'rgba(255, 170, 48, 0.15)', border: '1px solid rgba(255, 170, 48, 0.4)', borderRadius: 4, color: '#ffcc66', padding: '3px 10px', fontSize: 10 }}>
                /agent run researcher on &quot;Q3 roadmap&quot;
              </span>
            </div>
          </>
        )}
      </div>

      {/* AGENT DETAIL DRAWER */}
      {selectedAgent && (
        <AgentDetailDrawer
          agent={selectedAgent}
          providers={providers}
          onClose={() => setSelectedAgent(null)}
        />
      )}

      {/* CREATE AGENT MODAL */}
      {isCreateModalOpen && (
        <CreateAgentModal
          name={newAgentName}
          setName={setNewAgentName}
          type={newAgentType}
          setType={setNewAgentType}
          desc={newAgentDesc}
          setDesc={setNewAgentDesc}
          model={newAgentModel}
          setModel={setNewAgentModel}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateAgentSubmit}
        />
      )}
    </div>
  );
}

function AgentCardItem({
  agent,
  providers,
  onOpen,
}: {
  readonly agent: Agent;
  readonly providers: Provider[];
  readonly onOpen: () => void;
}) {
  const isBusy = agent.status === 'busy' || agent.name.toLowerCase().includes('planner');
  const provider = providers.find((p) => p.id === agent.providerId);

  return (
    <div className="agent-card-item">
      {/* Card Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'rgba(255, 170, 48, 0.15)',
              border: '1px solid rgba(255, 170, 48, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffaa30',
            }}
          >
            <AgentTypeIcon type={agent.type} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: '#ffcc66' }}>{agent.name}</div>
            <div style={{ fontSize: 9, color: '#885522', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
              {agent.type.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {isBusy ? (
            <span style={{ fontSize: 10, color: '#ffaa30', fontFamily: 'monospace', display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(255, 170, 48, 0.15)', padding: '2px 6px', borderRadius: 4, border: '1px solid rgba(255, 170, 48, 0.4)' }}>
              <span className="island-pulse-orb" style={{ width: 5, height: 5 }} /> Busy
            </span>
          ) : (
            <span style={{ fontSize: 10, color: '#34d399', fontFamily: 'monospace', display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(52, 211, 153, 0.15)', padding: '2px 6px', borderRadius: 4, border: '1px solid rgba(52, 211, 153, 0.3)' }}>
              ● Available
            </span>
          )}
        </div>
      </div>

      {/* Description Body */}
      <p style={{ fontSize: 11, color: '#d99a4e', lineHeight: 1.5, margin: 0, minHeight: 48, fontFamily: 'monospace' }}>
        {agent.description ?? 'Autonomous AI agent tailored for specialized execution tasks across your workspace.'}
      </p>

      {/* Capability Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {agent.capabilities.slice(0, 2).map((cap) => (
          <span key={cap.id} style={{ fontSize: 10, background: 'rgba(255, 170, 48, 0.12)', border: '1px solid rgba(255, 170, 48, 0.3)', color: '#ffaa30', borderRadius: 4, padding: '2px 6px', fontFamily: 'monospace' }}>
            {cap.name}
          </span>
        ))}
        {agent.collaborator && (
          <span style={{ fontSize: 10, background: 'rgba(52, 211, 153, 0.12)', border: '1px solid rgba(52, 211, 153, 0.3)', color: '#34d399', borderRadius: 4, padding: '2px 6px', fontFamily: 'monospace' }}>
            ● Collaborator
          </span>
        )}
      </div>

      {/* Active Run Block (for Busy Agents) */}
      {isBusy && (
        <div style={{ background: 'rgba(25, 13, 2, 0.9)', border: '1px solid rgba(255, 170, 48, 0.4)', borderRadius: 6, padding: '8px 10px', fontSize: 10, fontFamily: 'monospace', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ color: '#885522', fontSize: 8, letterSpacing: '0.1em' }}>ACTIVE RUN</div>
          <div style={{ color: '#ffcc66', fontWeight: 'bold' }}>Q3 Product Planning</div>
          <div style={{ width: '100%', height: 4, background: 'rgba(255, 170, 48, 0.2)', borderRadius: 2, overflow: 'hidden', margin: '3px 0' }}>
            <div style={{ width: '62%', height: '100%', background: '#ffaa30' }} />
          </div>
          <div style={{ color: '#885522', fontSize: 9 }}>Started 18m ago · Est. 12m left</div>
        </div>
      )}

      <div style={{ height: 1, background: 'rgba(255, 170, 48, 0.15)', margin: '2px 0' }} />

      {/* Metadata Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, fontSize: 9, fontFamily: 'monospace', color: '#885522' }}>
        <div>
          <div style={{ fontSize: 8 }}>MODEL</div>
          <div style={{ color: '#ffcc66', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.defaultModel ?? 'gpt-4o'}</div>
        </div>
        <div>
          <div style={{ fontSize: 8 }}>LAST RUN</div>
          <div style={{ color: '#ffcc66' }}>{isBusy ? '18m ago' : '2h ago'}</div>
        </div>
        <div>
          <div style={{ fontSize: 8 }}>SUCCESS RATE</div>
          <div style={{ color: '#34d399' }}>98%</div>
        </div>
      </div>

      {/* Footer Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
        <div style={{ fontSize: 10, color: '#ffaa30', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 4 }}>
          ⚡ Capabilities {agent.capabilities.length || 5}
        </div>
        <button
          type="button"
          onClick={onOpen}
          style={{ background: 'transparent', border: 'none', color: '#ffcc66', fontSize: 11, fontFamily: 'monospace', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Open →
        </button>
      </div>
    </div>
  );
}

function AgentTypeIcon({ type }: { readonly type: string }) {
  switch (type.toLowerCase()) {
    case 'research':
      return <IconSearch width={16} height={16} />;
    case 'code':
      return <IconCode width={16} height={16} />;
    case 'planning':
      return <IconTasks width={16} height={16} />;
    default:
      return <IconBot width={16} height={16} />;
  }
}

function AgentDetailDrawer({
  agent,
  providers,
  onClose,
}: {
  readonly agent: Agent;
  readonly providers: Provider[];
  readonly onClose: () => void;
}) {
  return (
    <div className="task-detail-drawer" style={{ color: '#ffcc66', fontFamily: 'monospace' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 170, 48, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(14, 7, 1, 0.95)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#ffaa30', fontWeight: 'bold' }}>
          <IconBot width={14} height={14} />
          <span>AGENT INSPECTOR // {agent.name.toUpperCase()}</span>
        </div>
        <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#885522', cursor: 'pointer' }}>
          <IconX width={16} height={16} />
        </button>
      </div>

      <div style={{ padding: '20px', flex: '1 1 auto', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: '#ffcc66' }}>{agent.name}</div>
          <div style={{ fontSize: 10, color: '#885522', marginTop: 2 }}>{agent.type.toUpperCase()} OPERATOR</div>
        </div>

        <p style={{ fontSize: 12, color: '#d99a4e', lineHeight: 1.6, margin: 0 }}>
          {agent.description ?? 'Autonomous AI agent initialized for workspace operations.'}
        </p>

        <div style={{ background: 'rgba(20, 10, 2, 0.6)', padding: '12px', borderRadius: 6, border: '1px solid rgba(255, 170, 48, 0.2)', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#885522' }}>STATUS</span>
            <Badge tone={agent.status === 'available' ? 'success' : 'warning'} size="sm">{agent.status}</Badge>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#885522' }}>MODEL</span>
            <span style={{ color: '#ffcc66' }}>{agent.defaultModel ?? 'gpt-4o'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#885522' }}>COLLABORATOR</span>
            <span style={{ color: agent.collaborator ? '#34d399' : '#885522' }}>{agent.collaborator ? 'Enabled' : 'Disabled'}</span>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.12em', color: '#ffaa30', fontWeight: 'bold', marginBottom: 8 }}>
            CAPABILITIES &amp; TOOL ACCESS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {agent.capabilities.map((c) => (
              <div key={c.id} style={{ padding: '8px 10px', background: 'rgba(25, 13, 2, 0.8)', border: '1px solid rgba(255, 170, 48, 0.2)', borderRadius: 4, fontSize: 11 }}>
                <div style={{ color: '#ffcc66', fontWeight: 'bold' }}>{c.name}</div>
                {c.description && <div style={{ fontSize: 9, color: '#885522', marginTop: 2 }}>{c.description}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255, 170, 48, 0.3)', display: 'flex', gap: 10, background: 'rgba(14, 7, 1, 0.95)' }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            flex: 1,
            background: '#ffaa30',
            border: 'none',
            borderRadius: 4,
            color: '#000000',
            padding: '8px',
            fontFamily: 'monospace',
            fontSize: 11,
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          [ DISPATCH AGENT RUN ]
        </button>
      </div>
    </div>
  );
}

function CreateAgentModal({
  name,
  setName,
  type,
  setType,
  desc,
  setDesc,
  model,
  setModel,
  onClose,
  onSubmit,
}: {
  readonly name: string;
  readonly setName: (v: string) => void;
  readonly type: string;
  readonly setType: (v: string) => void;
  readonly desc: string;
  readonly setDesc: (v: string) => void;
  readonly model: string;
  readonly setModel: (v: string) => void;
  readonly onClose: () => void;
  readonly onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="task-modal-overlay" onClick={onClose}>
      <div
        style={{
          width: 480,
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
        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255, 170, 48, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(14, 7, 1, 0.95)' }}>
          <div style={{ fontSize: 12, fontWeight: 'bold', color: '#ffaa30', letterSpacing: '0.12em', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconPlus width={14} height={14} />
            <span>INITIALIZE AUTONOMOUS AGENT</span>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#885522', cursor: 'pointer' }}>
            <IconX width={16} height={16} />
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14, fontFamily: 'monospace' }}>
          <div>
            <label style={{ display: 'block', fontSize: 10, color: '#885522', marginBottom: 6 }}>AGENT NAME *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Synthesis Analyst"
              required
              autoFocus
              style={{ background: 'rgba(20, 10, 2, 0.8)', borderColor: 'rgba(255, 170, 48, 0.3)', color: '#ffcc66' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 10, color: '#885522', marginBottom: 6 }}>AGENT TYPE / ROLE</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{ width: '100%', background: 'rgba(20, 10, 2, 0.8)', border: '1px solid rgba(255, 170, 48, 0.3)', borderRadius: 4, padding: '8px 10px', color: '#ffcc66', fontSize: 12, fontFamily: 'monospace' }}
            >
              <option value="research">Research</option>
              <option value="code">Code / Engineer</option>
              <option value="planning">Planning</option>
              <option value="memory">Memory Curator</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 10, color: '#885522', marginBottom: 6 }}>MODEL ARCHITECTURE</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              style={{ width: '100%', background: 'rgba(20, 10, 2, 0.8)', border: '1px solid rgba(255, 170, 48, 0.3)', borderRadius: 4, padding: '8px 10px', color: '#ffcc66', fontSize: 12, fontFamily: 'monospace' }}
            >
              <option value="gpt-4o">OpenAI · gpt-4o</option>
              <option value="gpt-4o-mini">OpenAI · gpt-4o-mini</option>
              <option value="claude-3-5-sonnet">Anthropic · claude-3-5-sonnet</option>
              <option value="gemini-1.5-pro">Google · gemini-1.5-pro</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 10, color: '#885522', marginBottom: 6 }}>SYSTEM INSTRUCTIONS / DESCRIPTION</label>
            <textarea
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              style={{ width: '100%', background: 'rgba(20, 10, 2, 0.8)', border: '1px solid rgba(255, 170, 48, 0.3)', borderRadius: 4, padding: '8px 10px', color: '#ffcc66', fontSize: 12, fontFamily: 'monospace' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              [ INITIALIZE AGENT ]
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatRelative(iso: string): string {
  if (!iso) return 'recently';
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60000) return 'just now';
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export function AgentDetailPage() {
  return (
    <div className="shell-page shell-page--narrow">
      <PageHeader icon={<IconBot width={22} height={22} />} title="Agent details" subtitle="Agent configuration, runs, and permissions" />
      <div style={{ padding: '0 var(--space-6) var(--space-8)' }}>
        <EmptyState
          tone="default"
          size="md"
          icon={<IconBot width={32} height={32} />}
          title="Select an agent"
          description="Pick an agent from the Agents list to see detail, configuration, recent runs, and audit history."
          action={{ label: 'Browse agents', onClick: () => (window.location.href = '/agents') }}
        />
      </div>
    </div>
  );
}
