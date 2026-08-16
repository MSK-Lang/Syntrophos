import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, Separator } from '@/components/ui/primitives';
import { ErrorState, EmptyState, PageLoader } from '@/components/ui/states';
import { IconPlus, IconPlugin, IconStar } from '@/lib/icons';
import { usePlugins } from '@/lib/services/index';
import type { Plugin, RegistryPlugin, PluginStatus } from '@/lib/services/plugins.contract';

export default function PluginsPage() {
  const { listInstalled, listRegistry, enable, disable, checkForUpdates } = usePlugins();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [installed, setInstalled] = useState<Plugin[]>([]);
  const [registry, setRegistry] = useState<RegistryPlugin[]>([]);
  const [tab, setTab] = useState<'installed' | 'registry'>('installed');

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        setLoading(true);
        const [ins, reg] = await Promise.all([
          listInstalled(),
          listRegistry?.() ?? Promise.resolve({ items: [] as RegistryPlugin[], total: 0, hasMore: false }),
        ]);
        if (!mounted) return;
        setInstalled(ins.items as Plugin[]);
        setRegistry(reg.items as RegistryPlugin[]);
      } catch (err) {
        if (mounted) setError(err as Error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [listInstalled, listRegistry]);

  return (
    <div className="shell-page shell-page--wide">
      <PageHeader
        variant="wide"
        icon={<IconPlugin width={22} height={22} />}
        title="Plugins"
        subtitle={`${installed.length} installed · ${registry.length} in registry`}
        actions={[
          {
            id: 'updates',
            label: 'Check for updates',
            variant: 'ghost',
            onAction: async () => {
              const res = await checkForUpdates?.() ?? [];
              alert(Array.isArray(res) && res.length ? `${res.length} updates available` : 'All plugins up to date');
            },
          },
          { id: 'install', label: 'Install plugin', variant: 'secondary', icon: <IconPlus width={14} height={14} />, primary: true },
        ]}
      />
      <div style={{ padding: '0 var(--space-6) var(--space-8)' }}>
        {loading ? (
          <PageLoader label="Loading plugins…" />
        ) : error ? (
          <ErrorState title="Failed to load plugins" error={error.message} />
        ) : (
          <div>
            <div className="inline-stack-sm" style={{ marginBottom: 'var(--space-5)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-2)' }}>
              <Button
                variant={tab === 'installed' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setTab('installed')}
              >
                Installed ({installed.length})
              </Button>
              <Button
                variant={tab === 'registry' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setTab('registry')}
              >
                Registry ({registry.length})
              </Button>
            </div>

            {tab === 'installed' ? (
              installed.length === 0 ? (
                <EmptyState
                  size="lg"
                  tone="default"
                  icon={<IconPlugin width={36} height={36} />}
                  title="No plugins installed"
                  description="Plugins extend Syntrophos with custom commands, UI, workflows, and integrations. Browse the registry to get started."
                  action={{ label: 'Browse registry', onClick: () => setTab('registry') }}
                />
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
                  {installed.map((p) => (
                    <Card key={p.id} tone="default">
                      <CardHeader>
                        <CardTitle>
                          <div className="inline-stack-sm">
                            <PluginIcon name={p.manifest?.name ?? p.id} tone={p.status === 'enabled' ? 'teal' : 'default'} />
                            {p.manifest?.name ?? p.id}
                          </div>
                        </CardTitle>
                        <Badge size="sm" tone={p.status === 'enabled' ? 'success' : p.status === 'error' ? 'danger' : 'default'} dot>
                          {p.status}
                        </Badge>
                      </CardHeader>
                      <CardBody style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-subtle)' }}>
                          v{p.manifest?.version ?? '1.0.0'}
                        </div>
                        <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                          {p.manifest?.description ?? 'Plugin installed.'}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                          {p.manifest?.permissions.slice(0, 3).map((perm) => (
                            <Badge key={perm} size="sm" tone="amber">{perm}</Badge>
                          ))}
                        </div>
                        <Separator />
                        <div className="inline-stack" style={{ justifyContent: 'space-between' }}>
                          <div style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>
                            {p.manifest?.runtime ?? 'browser'} runtime
                          </div>
                          <div className="inline-stack-sm">
                            <Button variant="ghost" size="sm">Settings</Button>
                            <Button
                              variant={p.status === 'enabled' ? 'secondary' : 'primary'}
                              size="sm"
                              onClick={async () => {
                                if (p.status === 'enabled') {
                                  await disable?.(p.id);
                                  setInstalled((cur) => cur.map((x) => (x.id === p.id ? { ...x, status: 'disabled' as PluginStatus } : x)));
                                } else {
                                  await enable?.(p.id);
                                  setInstalled((cur) => cur.map((x) => (x.id === p.id ? { ...x, status: 'enabled' as PluginStatus } : x)));
                                }
                              }}
                            >
                              {p.status === 'enabled' ? 'Disable' : 'Enable'}
                            </Button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )
            ) : (
              registry.length === 0 ? (
                <EmptyState icon={<IconStar width={28} height={28} />} title="Plugin registry unavailable" description="Check your network connection or configure a registry source." />
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
                  {registry.map((p) => (
                    <Card key={p.manifestId} tone="default">
                      <CardHeader>
                        <CardTitle>
                          <div className="inline-stack-sm">
                            <PluginIcon name={p.manifest?.name ?? p.manifestId} tone="violet" />
                            {p.manifest?.name ?? p.manifestId}
                          </div>
                        </CardTitle>
                        <Badge size="sm" tone="primary">v{p.manifest?.version ?? '1.0.0'}</Badge>
                      </CardHeader>
                      <CardBody style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                          {p.manifest?.description ?? 'No description'}
                        </p>
                        <Separator />
                        <div className="inline-stack" style={{ justifyContent: 'flex-end' }}>
                          <Button variant="ghost" size="sm">Details</Button>
                          <Button variant="primary" size="sm">Install</Button>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PluginIcon({ tone }: { readonly name: string; readonly tone: 'teal' | 'violet' | 'default' }) {
  const map = {
    teal: { bg: 'var(--color-accent-teal)', opacity: 16 },
    violet: { bg: 'var(--color-accent-violet)', opacity: 18 },
    default: { bg: 'var(--color-text-subtle)', opacity: 18 },
  } as const;
  const c = map[tone];
  return (
    <span
      aria-hidden="true"
      style={{
        width: 32,
        height: 32,
        borderRadius: 'var(--radius-md)',
        background: `color-mix(in srgb, ${c.bg} ${c.opacity}%, transparent)`,
        color: c.bg,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <IconPlugin width={16} height={16} />
    </span>
  );
}
