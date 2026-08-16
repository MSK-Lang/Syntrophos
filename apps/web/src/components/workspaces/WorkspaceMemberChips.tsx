import { Avatar, AvatarGroup } from '@/components/ui/primitives.js';
import { useWorkspace } from '@/lib/services/index.js';
import { useEffect, useState } from 'react';
import type { WorkspaceMember } from '@/lib/services/workspace.contract.js';

export function WorkspaceMemberChips({ limit = 5 }: { readonly limit?: number }) {
  const { listMembers, currentWorkspace } = useWorkspace();
  const [members, setMembers] = useState<readonly WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const wsId = currentWorkspace.status === 'success' ? currentWorkspace.data.id : undefined;
  useEffect(() => {
    if (!wsId) return;
    setLoading(true);
    void (async () => {
      try {
        const r = await listMembers(wsId, { pageSize: limit + 5 });
        setMembers(r.items);
      } finally { setLoading(false); }
    })();
  }, [wsId, listMembers, limit]);

  if (loading) {
    return (
      <div className="inline-stack-sm">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="ui-skeleton ui-skeleton--r-full"
            style={{ width: 30, height: 30 }}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  const visible = members.slice(0, limit);

  return (
    <div className="inline-stack-sm" aria-label={`${members.length} workspace members`}>
      <AvatarGroup size="sm" max={limit}>
        {visible.map((m) => (
          <Avatar key={m.id} size="sm" name={m.displayName ?? m.name} tone={roleTone(m.role)} />
        ))}
      </AvatarGroup>
      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
        {members.length} members
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
