import { useEffect, useState } from 'react';
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, Separator, Toggle } from '@/components/ui/primitives.js';
import { PageLoader, EmptyState } from '@/components/ui/states.js';
import { IconIntegration, IconRefresh } from '@/lib/icons.jsx';
import { useIntegrations } from '@/lib/services/index.js';
import type { Integration, IntegrationConnection } from '@/lib/services/integrations.contract.js';

export default function SettingsIntegrationsPage() {
  const { listAvailable, listConnections, toggleEnabled, triggerSync } = useIntegrations();
  const [loading, setLoading] = useState(true);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [connections, setConnections] = useState<IntegrationConnection[]>([]);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        setLoading(true);
        const [all, conns] = await Promise.all([
          listAvailable({ pageSize: 50 }),
          listConnections(),
        ]);
        if (!mounted) return;
        setIntegrations(all.items as Integration[]);
        setConnections((Array.isArray(conns) ? conns : conns.items ?? []) as IntegrationConnection[]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [listAvailable, listConnections]);

  if (loading) return <PageLoader />;

  const connected = new Map(connections.map((c) => [c.integrationId, c]));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <Card tone="default">
        <CardHeader>
          <CardTitle>Connected accounts</CardTitle>
          <Button variant="ghost" size="sm"><IconRefresh width={14} height={14} /> Sync all</Button>
        </CardHeader>
        <CardBody style={{ padding: 0 }}>
          {connections.length === 0 ? (
            <div style={{ padding: 'var(--space-8)' }}>
              <EmptyState size="sm" icon={<IconIntegration width={28} height={28} />} title="Nothing connected yet" description="Enable integrations below to link your tools and data." />
            </div>
          ) : (
            <ul role="list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {connections.map((c, i) => {
                const info = integrations.find((x) => x.id === c.integrationId);
                return (
                  <li key={c.id}>
                    <div style={{ padding: 'var(--space-4) var(--space-5)', display: 'grid', gridTemplateColumns: '36px minmax(0, 1fr) auto auto auto', gap: 'var(--space-4)', alignItems: 'center' }}>
                      <IntIcon name={info?.name ?? c.id} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{info?.name ?? c.integrationId}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-subtle)', fontFamily: 'var(--font-mono)' }}>{c.accountName ?? 'Connected account'}</div>
                      </div>
                      <Badge tone={c.errorMessage ? 'danger' : c.enabled ? 'success' : 'warning'} size="sm" dot>
                        {c.errorMessage ? 'error' : c.enabled ? 'connected' : 'disabled'}
                      </Badge>
                      <Toggle
                        label={`Enable ${info?.name ?? c.integrationId}`}
                        checked={c.enabled}
                        onChange={(e) => void toggleEnabled?.(c.id, e.target.checked)}
                      />
                      <Button variant="ghost" size="sm" onClick={() => void triggerSync?.(c.id)}>Sync now</Button>
                    </div>
                    {i < connections.length - 1 && <Separator />}
                  </li>
                );
              })}
            </ul>
          )}
        </CardBody>
      </Card>

      <div>
        <div style={{ fontSize: 14, fontWeight: 700, margin: 'var(--space-2) 0 var(--space-4)' }}>Available integrations</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
          {integrations.map((i) => (
            <div key={i.id} style={{ padding: 'var(--space-4)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-surface)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div className="inline-stack-sm" style={{ alignItems: 'center' }}>
                <IntIcon name={i.name} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{i.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>{i.category}</div>
                </div>
                {connected.has(i.id) && <Badge tone="success" size="sm">Connected</Badge>}
              </div>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{i.description}</p>
              <Separator />
              <div className="inline-stack" style={{ justifyContent: 'space-between' }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>{i.capabilities.length} capabilities</div>
                <Button variant={connected.has(i.id) ? 'secondary' : 'primary'} size="sm">
                  {connected.has(i.id) ? 'Manage' : 'Connect'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function IntIcon({ name }: { readonly name: string }) {
  return (
    <span aria-hidden="true" style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: 'var(--color-background-muted)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
}
