import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Avatar, Badge, Button, Card, CardBody, CardHeader, CardTitle, Separator } from '@/components/ui/primitives';
import { ErrorState, EmptyState, PageLoader } from '@/components/ui/states';
import { IconBot, IconPlus, IconStar } from '@/lib/icons';
import { useAgents, useProviders } from '@/lib/services/index';
import type { Agent, AgentRun, Workflow, AgentStatus } from '@/lib/services/agents.contract';
import type { Provider } from '@/lib/services/providers.contract';
import { Link } from 'react-router-dom';

export default function AgentsPage() {
  const { list: listAgents, listRuns, listWorkflows } = useAgents();
  const { list: listProviders } = useProviders();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [tab, setTab] = useState<'agents' | 'runs' | 'workflows'>('agents');

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        setLoading(true);
        const [a, r, w, p] = await Promise.all([
          listAgents(),
          listRuns?.() ?? Promise.resolve({ items: [] as AgentRun[], total: 0, hasMore: false }),
          listWorkflows?.() ?? Promise.resolve({ items: [] as Workflow[], total: 0, hasMore: false }),
          listProviders(),
        ]);
        if (!mounted) return;
        setAgents(a.items as Agent[]);
        setRuns((r.items ?? []) as AgentRun[]);
        setWorkflows((w.items ?? []) as Workflow[]);
        setProviders(p.items as Provider[]);
      } catch (err) {
        if (mounted) setError(err as Error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [listAgents, listRuns, listWorkflows, listProviders]);

  return (
    <div className="shell-page shell-page--wide">
      <PageHeader
        variant="wide"
        icon={<IconBot width={22} height={22} />}
        title="Agents"
        subtitle={`${agents.length} active agents · ${runs.length} recent runs`}
        actions={[
          { id: 'new-agent', label: 'Create agent', variant: 'primary', icon: <IconPlus width={14} height={14} />, primary: true },
        ]}
      />
      <div style={{ padding: '0 var(--space-6) var(--space-8)' }}>
        {loading ? (
          <PageLoader label="Loading agents…" />
        ) : error ? (
          <ErrorState title="Failed to load agents" error={error.message} />
        ) : (
          <div>
            <div className="inline-stack-sm" style={{ marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-2)' }}>
              <Button variant={tab === 'agents' ? 'primary' : 'ghost'} size="sm" onClick={() => setTab('agents')}>
                Agents ({agents.length})
              </Button>
              <Button variant={tab === 'runs' ? 'primary' : 'ghost'} size="sm" onClick={() => setTab('runs')}>
                Recent runs ({runs.length})
              </Button>
              <Button variant={tab === 'workflows' ? 'primary' : 'ghost'} size="sm" onClick={() => setTab('workflows')}>
                Workflows ({workflows.length})
              </Button>
            </div>

            {tab === 'agents' && (
              agents.length === 0 ? (
                <EmptyState
                  icon={<IconBot width={36} height={36} />}
                  title="Create your first agent"
                  description="Agents are AI collaborators with specialised skills, tools, and models."
                  action={{ label: 'Create agent' }}
                />
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
                  {agents.map((a) => (
                    <AgentCard key={a.id} agent={a} providers={providers} />
                  ))}
                </div>
              )
            )}

            {tab === 'runs' && (
              <Card tone="default">
                <CardHeader>
                  <CardTitle>Recent runs</CardTitle>
                </CardHeader>
                <CardBody style={{ padding: 0 }}>
                  {runs.length === 0 ? (
                    <div style={{ padding: 'var(--space-6)' }}>
                      <EmptyState size="sm" icon={<IconBot width={24} height={24} />} title="No agent runs yet" />
                    </div>
                  ) : (
                    <ul role="list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {runs.map((r, i) => (
                        <li key={r.id}>
                          <div style={{ padding: 'var(--space-3) var(--space-5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13 }}>{r.taskTitle}</div>
                              <div style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>{formatRelative(r.startedAt)}</div>
                            </div>
                            <Badge tone={runTone(r.status)} size="sm">{r.status}</Badge>
                          </div>
                          {i < runs.length - 1 && <Separator />}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardBody>
              </Card>
            )}

            {tab === 'workflows' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
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
          </div>
        )}
      </div>
    </div>
  );
}

function AgentCard({ agent, providers }: { readonly agent: Agent; readonly providers: Provider[] }) {
  const provider = providers.find((p) => p.id === agent.providerId);
  const toneMap: Record<AgentStatus, BadgeTone> = {
    available: 'success',
    busy: 'warning',
    offline: 'default',
    error: 'danger',
  };

  return (
    <Card tone="default">
      <CardBody style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <div className="inline-stack">
          <Avatar size="md" name={agent.name} tone={agent.status === 'available' ? 'teal' : 'default'} icon={<IconBot width={18} height={18} />} />
          <div style={{ minWidth: 0, flex: '1 1 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: 'var(--font-size-base)' }}>{agent.name}</span>
              <Badge tone={toneMap[agent.status] ?? 'default'} size="sm" dot>{agent.status}</Badge>
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{agent.type}</div>
          </div>
        </div>
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0, minHeight: 40 }}>
          {agent.description}
        </p>
        <div className="inline-stack-sm" style={{ flexWrap: 'wrap' }}>
          {agent.capabilities.slice(0, 3).map((cap) => (
            <Badge key={cap.id} tone="violet" size="sm">{cap.name}</Badge>
          ))}
          {agent.collaborator ? <Badge tone="teal" size="sm" dot>collaborator</Badge> : null}
        </div>
        <Separator />
        <div className="inline-stack" style={{ justifyContent: 'space-between' }}>
          <div style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>
            {provider?.name ?? 'Default provider'} · {agent.defaultModel ?? 'Standard'}
          </div>
          <Link to={`/agents/${agent.id}`} style={{ fontSize: 12, textDecoration: 'none' }}>Open →</Link>
        </div>
      </CardBody>
    </Card>
  );
}

type BadgeTone = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'violet' | 'teal' | 'rose' | 'amber';

function runTone(s: string): BadgeTone {
  switch (s) {
    case 'success': return 'success';
    case 'error': return 'danger';
    case 'running': return 'info';
    case 'waiting': return 'warning';
    default: return 'default';
  }
}

function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60000) return 'just now';
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export { AgentDetailPage };
function AgentDetailPage() {
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
