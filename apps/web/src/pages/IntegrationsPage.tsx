import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, Separator } from '@/components/ui/primitives';
import { ErrorState, EmptyState, PageLoader } from '@/components/ui/states';
import { IconIntegration, IconPlus } from '@/lib/icons';
import { useIntegrations } from '@/lib/services/index';
import type { Integration, IntegrationConnection, IntegrationCategory } from '@/lib/services/integrations.contract';

export default function IntegrationsPage() {
  const { listAvailable: listIntegrations, listConnections, disconnect, triggerSync } = useIntegrations();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [connections, setConnections] = useState<IntegrationConnection[]>([]);
  const [tab, setTab] = useState<'connected' | 'browse'>('connected');

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        setLoading(true);
        const [i, c] = await Promise.all([
          listIntegrations(),
          listConnections?.() ?? Promise.resolve({ items: [] as IntegrationConnection[], total: 0, hasMore: false }),
        ]);
        if (!mounted) return;
        setIntegrations(i.items as Integration[]);
        setConnections(c.items as IntegrationConnection[]);
      } catch (err) {
        if (mounted) setError(err as Error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [listIntegrations, listConnections]);

  const connectedWithMeta = connections.map((c) => ({
    ...c,
    integration: integrations.find((i) => i.id === c.integrationId),
  }));

  return (
    <div className="shell-page shell-page--wide">
      <PageHeader
        variant="wide"
        icon={<IconIntegration width={22} height={22} />}
        title="Integrations"
        subtitle={`${connections.length} connected · ${integrations.length} available`}
        actions={[
          { id: 'browse', label: 'Browse catalog', variant: 'secondary', icon: <IconPlus width={14} height={14} />, onAction: () => setTab('browse') },
        ]}
      />
      <div style={{ padding: '0 var(--space-6) var(--space-8)' }}>
        {loading ? (
          <PageLoader label="Loading integrations…" />
        ) : error ? (
          <ErrorState title="Failed to load integrations" error={error.message} />
        ) : (
          <div>
            <div className="inline-stack-sm" style={{ marginBottom: 'var(--space-5)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-2)' }}>
              <Button variant={tab === 'connected' ? 'primary' : 'ghost'} size="sm" onClick={() => setTab('connected')}>
                Connected ({connections.length})
              </Button>
              <Button variant={tab === 'browse' ? 'primary' : 'ghost'} size="sm" onClick={() => setTab('browse')}>
                Available ({integrations.length})
              </Button>
            </div>

            {tab === 'connected' ? (
              connectedWithMeta.length === 0 ? (
                <EmptyState
                  size="lg"
                  tone="default"
                  icon={<IconIntegration width={36} height={36} />}
                  title="No integrations connected"
                  description="Connect tools you already use. Your notes, calendar, tasks, and chats will flow into a single shared memory."
                  action={{ label: 'Browse integrations', onClick: () => setTab('browse') }}
                />
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
                  {connectedWithMeta.map((c) => (
                    <Card key={c.id} tone="default">
                      <CardHeader>
                        <CardTitle>
                          <div className="inline-stack-sm">
                            <IntegrationIcon category={c.integration?.category ?? 'productivity'} />
                            {c.integration?.name ?? c.accountName ?? c.id}
                          </div>
                        </CardTitle>
                        <Badge size="sm" tone={c.errorMessage ? 'danger' : c.enabled ? 'success' : 'warning'} dot>
                          {c.errorMessage ? 'error' : c.enabled ? 'connected' : 'disabled'}
                        </Badge>
                      </CardHeader>
                      <CardBody style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-muted)' }}>
                          {c.integration?.description ?? 'Connected external service.'}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                          {c.lastSyncAt && (
                            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--color-text-subtle)' }}>
                              synced {formatRelative(c.lastSyncAt)}
                            </span>
                          )}
                        </div>
                        <Separator />
                        <div className="inline-stack" style={{ justifyContent: 'space-between' }}>
                          <Button variant="ghost" size="sm" onClick={() => void triggerSync?.(c.id)}>Sync now</Button>
                          <Button variant="danger" size="sm" onClick={() => void disconnect?.(c.id)}>Disconnect</Button>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
                {integrations.map((i) => (
                  <Card key={i.id} tone="default">
                    <CardHeader>
                      <CardTitle>
                        <div className="inline-stack-sm">
                          <IntegrationIcon category={i.category} />
                          {i.name}
                        </div>
                      </CardTitle>
                      <Badge size="sm" tone="violet">{i.category}</Badge>
                    </CardHeader>
                    <CardBody style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                      <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.5, minHeight: 36 }}>
                        {i.description}
                      </p>
                      <Separator />
                      <div className="inline-stack" style={{ justifyContent: 'flex-end' }}>
                        <Button variant="primary" size="sm">Connect</Button>
                      </div>
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

function IntegrationIcon({ category }: { readonly category: IntegrationCategory }) {
  const categoryToneMap: Record<IntegrationCategory, string> = {
    storage: 'var(--color-accent-teal)',
    productivity: 'var(--color-primary-500)',
    communication: 'var(--color-accent-violet)',
    calendar: 'var(--color-accent-amber)',
    development: 'var(--color-success-500)',
    browser: 'var(--color-accent-sky)',
    ai: 'var(--color-accent-rose)',
    other: 'var(--color-text-subtle)',
  };
  const color = categoryToneMap[category] ?? 'var(--color-primary-500)';

  return (
    <span
      aria-hidden="true"
      style={{
        width: 32,
        height: 32,
        borderRadius: 'var(--radius-md)',
        background: `color-mix(in srgb, ${color} 18%, transparent)`,
        color,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <IconIntegration width={16} height={16} />
    </span>
  );
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
