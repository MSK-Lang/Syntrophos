import { useEffect, useState } from 'react';
import { Badge, Button, Input, Label, Separator, Toggle, Avatar, Field } from '@/components/ui/primitives.js';
import { PageLoader, EmptyState } from '@/components/ui/states.js';
import { useWorkspace } from '@/lib/services/index.js';
import type { WorkspaceMember } from '@/lib/services/workspace.contract.js';

export default function SettingsWorkspacePage() {
  const { currentWorkspace, update, listMembers, inviteMember } = useWorkspace();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<WorkspaceMember['role']>('member');

  useEffect(() => {
    if (currentWorkspace.status !== 'success') return;
    let mounted = true;
    void (async () => {
      try {
        setLoading(true);
        const r = await listMembers(currentWorkspace.data.id, { pageSize: 20 });
        if (mounted) setMembers(r.items as WorkspaceMember[]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [currentWorkspace, listMembers]);

  const ws = currentWorkspace.status === 'success' ? currentWorkspace.data : null;

  if (currentWorkspace.status === 'loading' || loading) return <PageLoader label="Loading workspace…" />;
  if (!ws) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div className="settings-row">
        <div className="settings-row__label">
          <div className="settings-row__title">Workspace name</div>
          <div className="settings-row__desc">Shown to all members and in the workspace switcher.</div>
        </div>
        <div className="settings-row__control">
          <Input value={ws.settings.name} onChange={(e) => void update?.(ws.id, { name: e.target.value })} />
        </div>
      </div>
      <Separator />
      <div className="settings-row">
        <div className="settings-row__label">
          <div className="settings-row__title">Workspace URL</div>
          <div className="settings-row__desc">syntrophos.app/w/…</div>
        </div>
        <div className="settings-row__control">
          <Input value={ws.id} readOnly />
        </div>
      </div>
      <Separator />
      <div className="settings-row">
        <div className="settings-row__label">
          <div className="settings-row__title">Description</div>
          <div className="settings-row__desc">What is this workspace for?</div>
        </div>
        <div className="settings-row__control">
          <Input value={ws.settings.description ?? ''} onChange={(e) => void update?.(ws.id, { description: e.target.value })} />
        </div>
      </div>
      <Separator />
      <div className="settings-row">
        <div className="settings-row__label">
          <div className="settings-row__title">Plan</div>
          <div className="settings-row__desc">Billing, limits, and features.</div>
        </div>
        <div className="settings-row__control">
          <Badge tone="violet" size="sm">{(ws.plan ?? 'free').toUpperCase()}</Badge>
          <Button variant="ghost" size="sm" style={{ marginLeft: 'var(--space-3)' }}>Manage billing →</Button>
        </div>
      </div>
      <Separator />
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 'var(--space-4)' }}>Members &amp; invitations ({members.length})</div>
        <div className="settings-row" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="settings-row__label">
            <div className="settings-row__title">Invite teammate</div>
            <div className="settings-row__desc">Send an email invitation.</div>
          </div>
          <div className="settings-row__control">
            <div className="inline-stack-sm" style={{ alignItems: 'flex-end' }}>
              <Field label="Email">
                <Input type="email" placeholder="colleague@company.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
              </Field>
              <Field label="Role">
                <select className="ui-input" style={{ height: 40 }} value={inviteRole} onChange={(e) => setInviteRole(e.target.value as WorkspaceMember['role'])}>
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
              </Field>
              <Button variant="primary" onClick={async () => {
                if (!inviteEmail) return;
                try {
                  await inviteMember?.(ws.id, inviteEmail, inviteRole);
                  setInviteEmail('');
                  const r = await listMembers(ws.id, { pageSize: 20 });
                  setMembers(r.items as WorkspaceMember[]);
                } catch { /* noop */ }
              }}>Invite</Button>
            </div>
          </div>
        </div>
        {members.length === 0 ? (
          <EmptyState size="sm" icon={<Avatar size="md" name="Team" tone="teal" />} title="No members yet" description="Invite collaborators to build a shared memory together." />
        ) : (
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
            <ul role="list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {members.map((m, i) => (
                <li key={m.id}>
                  <div style={{ display: 'grid', gridTemplateColumns: '48px minmax(0, 1fr) auto auto', gap: 'var(--space-4)', padding: 'var(--space-4) var(--space-5)', alignItems: 'center' }}>
                    <Avatar size="md" name={m.displayName ?? m.name} tone={roleTone(m.role)} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{m.displayName ?? m.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{m.email}</div>
                    </div>
                    <Badge size="sm" tone={roleTone(m.role) === 'primary' ? 'primary' : roleTone(m.role) === 'violet' ? 'violet' : roleTone(m.role) === 'teal' ? 'success' : 'default'}>{m.role}</Badge>
                    <Button variant="ghost" size="sm">Remove</Button>
                  </div>
                  {i < members.length - 1 && <Separator />}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <Separator />
      <div className="settings-row">
        <div className="settings-row__label">
          <div className="settings-row__title">Danger zone</div>
          <div className="settings-row__desc">Deleting a workspace is irreversible.</div>
        </div>
        <div className="settings-row__control">
          <Button variant="danger" size="sm">Delete workspace…</Button>
        </div>
      </div>
    </div>
  );
}

function roleTone(role: WorkspaceMember['role']): 'primary' | 'violet' | 'teal' | 'amber' | 'default' {
  switch (role) {
    case 'owner': return 'primary';
    case 'admin': return 'violet';
    case 'member': return 'teal';
    case 'viewer': return 'amber';
    default: return 'default';
  }
}
