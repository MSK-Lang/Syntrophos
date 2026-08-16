import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader.jsx';
import { Avatar, Badge, Button, Card, CardBody, CardHeader, CardTitle, Separator } from '@/components/ui/primitives.js';
import { ErrorState, EmptyState, PageLoader } from '@/components/ui/states.js';
import { IconPlus, IconStar, IconWorkspace } from '@/lib/icons.jsx';
import { useWorkspace } from '@/lib/services/index.js';
import { WorkspaceMemberChips } from '@/components/workspaces/WorkspaceMemberChips.jsx';
import type { Workspace, WorkspaceMember } from '@/lib/services/workspace.contract.js';

export default function WorkspacesPage() {
  const { list, getCurrent, switchTo, create, listMembers } = useWorkspace();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        setLoading(true);
        const [all, cur] = await Promise.all([
          list({ pageSize: 20 }),
          getCurrent(),
        ]);
        if (!mounted) return;
        setWorkspaces(all.items as Workspace[]);
        setCurrentId(cur.id);
      } catch (err) {
        if (mounted) setError(err as Error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [list, getCurrent]);

  return (
    <div className="shell-page shell-page--wide">
      <PageHeader
        variant="wide"
        icon={<IconWorkspace width={22} height={22} />}
        title="Workspaces"
        subtitle={`${workspaces.length} workspace${workspaces.length === 1 ? '' : 's'} · Switch context for teams, projects, and enterprises`}
        actions={[
          { id: 'new', label: 'New workspace', variant: 'secondary', icon: <IconPlus width={14} height={14} />, primary: true },
        ]}
      />
      <div style={{ padding: '0 var(--space-6) var(--space-8)' }}>
        {loading ? (
          <PageLoader label="Loading workspaces…" />
        ) : error ? (
          <ErrorState title="Failed to load workspaces" error={error.message} />
        ) : workspaces.length === 0 ? (
          <EmptyState
            size="lg"
            tone="default"
            icon={<IconWorkspace width={36} height={36} />}
            title="Create your first workspace"
            description="Workspaces isolate notes, tasks, agents, and members. Switch between them in seconds."
            action={{ label: 'Create workspace' }}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 'var(--space-5)' }}>
            {workspaces.map((w) => (
              <WorkspaceCard
                key={w.id}
                workspace={w}
                isCurrent={w.id === currentId}
                onSwitch={() => {
                  void switchTo(w.id);
                  setCurrentId(w.id);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WorkspaceCard({
  workspace,
  isCurrent,
  onSwitch,
}: {
  readonly workspace: Workspace;
  readonly isCurrent: boolean;
  readonly onSwitch: () => void;
}) {
  const { listMembers } = useWorkspace();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  useEffect(() => {
    void (async () => {
      const r = await listMembers(workspace.id, { pageSize: 6 });
      setMembers(r.items as WorkspaceMember[]);
    })();
  }, [workspace.id, listMembers]);

  return (
    <Card
      tone={isCurrent ? 'primary' : 'default'}
      style={{
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {isCurrent && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: 'linear-gradient(90deg, var(--color-primary-500), var(--color-accent-violet))',
          }}
        />
      )}
      <CardHeader>
        <CardTitle>
          <div className="inline-stack-sm">
            <div
              aria-hidden="true"
              style={{
                width: 40, height: 40, borderRadius: 'var(--radius-md)',
                background: isCurrent
                  ? 'linear-gradient(135deg, var(--color-primary-500), var(--color-accent-violet))'
                  : 'var(--color-background-muted)',
                color: isCurrent ? 'white' : 'var(--color-text-muted)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700,
              }}
            >
              {workspace.settings.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                {workspace.settings.name}
                {workspace.settings.icon && <span>{workspace.settings.icon}</span>}
              </div>
              <div style={{ fontSize: 11, color: isCurrent ? 'color-mix(in srgb, white 70%, transparent)' : 'var(--color-text-subtle)', marginTop: 2 }}>
                {workspace.plan} plan
              </div>
            </div>
          </div>
        </CardTitle>
        {isCurrent ? (
          <Badge tone="primary" size="sm">Current</Badge>
        ) : (
          <Badge tone="default" size="sm">{workspace.currentUserRole}</Badge>
        )}
      </CardHeader>
      <CardBody style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {workspace.settings.description && (
          <p style={{ margin: 0, fontSize: 12, color: isCurrent ? 'color-mix(in srgb, white 80%, transparent)' : 'var(--color-text-muted)', lineHeight: 1.6 }}>
            {workspace.settings.description}
          </p>
        )}
        <div>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, color: isCurrent ? 'color-mix(in srgb, white 60%, transparent)' : 'var(--color-text-subtle)', marginBottom: 'var(--space-3)' }}>
            Team
          </div>
          <WorkspaceMemberChipsInline members={members} />
        </div>
        <Separator />
        <div className="inline-stack" style={{ justifyContent: 'space-between' }}>
          <div style={{ fontSize: 11, color: isCurrent ? 'color-mix(in srgb, white 70%, transparent)' : 'var(--color-text-subtle)' }}>
            Created {workspace.audit?.createdAt ? new Date(workspace.audit.createdAt).toLocaleDateString() : 'Recently'}
          </div>
          <div className="inline-stack-sm">
            <Button variant={isCurrent ? 'secondary' : 'ghost'} size="sm">Settings</Button>
            {!isCurrent && (
              <Button variant="primary" size="sm" onClick={onSwitch}>
                Switch
              </Button>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function WorkspaceMemberChipsInline({ members }: { readonly members: readonly WorkspaceMember[] }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
      <div style={{ display: 'flex' }}>
        {members.slice(0, 4).map((m, i) => (
          <Avatar
            key={m.id}
            size="sm"
            name={m.displayName ?? m.name}
            tone="teal"
            style={{ marginLeft: i === 0 ? 0 : -8, boxShadow: '0 0 0 2px var(--color-surface)' }}
          />
        ))}
      </div>
      <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
        {members.length} member{members.length === 1 ? '' : 's'}
      </span>
    </div>
  );
}
