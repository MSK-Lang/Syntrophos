import { useEffect, useState } from 'react';
import { useAgents } from '@/lib/services/index';
import type { Agent, AgentRun } from '@/lib/services/agents.contract';
import { Avatar, Badge, type BadgeTone } from '@/components/ui/primitives';

export function AgentChip({
  agent,
  selected = false,
  onSelect,
}: {
  readonly agent: Agent;
  readonly selected?: boolean;
  readonly onSelect?: (agentId: string) => void;
}) {
  return (
    <div
      className={`agent-chip ${selected ? 'agent-chip--selected' : ''}`}
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(agent.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onSelect?.(agent.id);
      }}
    >
      <Avatar size="sm" name={agent.name} tone={agent.status === 'available' ? 'teal' : agent.status === 'busy' ? 'amber' : 'default'} />
      <div style={{ flex: '1 1 auto', minWidth: 0 }}>
        <div className="agent-chip__name inline-stack-sm">
          <span>{agent.name}</span>
          <StatusBadge status={agent.status} />
        </div>
        <div className="agent-chip__desc">{agent.description}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { readonly status: Agent['status'] }) {
  const map: Record<Agent['status'], { tone: BadgeTone; label: string }> = {
    available: { tone: 'success', label: 'Online' },
    busy: { tone: 'warning', label: 'Busy' },
    offline: { tone: 'default', label: 'Offline' },
    error: { tone: 'danger', label: 'Error' },
  };
  const cfg = map[status];
  return (
    <Badge tone={cfg.tone} size="sm" dot>
      {cfg.label}
    </Badge>
  );
}

export function RecentRunsCompact() {
  const { listRuns } = useAgents();
  const [runs, setRuns] = useState<readonly AgentRun[]>([]);
  useEffect(() => {
    void (async () => {
      const r = (await listRuns?.({ pageSize: 6 })) ?? { items: [] };
      setRuns(r.items);
    })();
  }, [listRuns]);
  return (
    <ul role="list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {runs.map((r) => (
        <li
          key={r.id}
          style={{
            padding: 'var(--space-3) var(--space-4)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-surface)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 'var(--space-3)',
          }}
        >
          <div style={{ minWidth: 0, flex: '1 1 auto' }}>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {r.taskTitle}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-subtle)', marginTop: 2 }}>
              {new Date(r.startedAt).toLocaleString()}
            </div>
          </div>
          <Badge tone={runTone(r.status)} size="sm" dot>
            {capitalize(r.status)}
          </Badge>
        </li>
      ))}
    </ul>
  );
}

function runTone(s: AgentRun['status']): BadgeTone {
  switch (s) {
    case 'success': return 'success';
    case 'error': return 'danger';
    case 'running': return 'info';
    case 'waiting': return 'warning';
    case 'queued':
    case 'cancelled':
    default: return 'default';
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ');
}
