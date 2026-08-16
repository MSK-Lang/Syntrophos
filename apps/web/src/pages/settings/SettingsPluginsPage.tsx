import { Badge, Button, Card, CardBody, CardHeader, CardTitle, Separator, Toggle } from '@/components/ui/primitives';
import { EmptyState, PageLoader } from '@/components/ui/states';
import { IconPlugin } from '@/lib/icons';
import { useEffect, useState } from 'react';
import { usePlugins } from '@/lib/services/index';
import type { Plugin, PluginStatus } from '@/lib/services/plugins.contract';

export default function SettingsPluginsPage() {
  const { listInstalled, enable, disable, checkForUpdates } = usePlugins();
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [updates, setUpdates] = useState(0);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const r = await listInstalled({ pageSize: 50 });
        setPlugins(r.items as Plugin[]);
      } finally {
        setLoading(false);
      }
    })();
  }, [listInstalled]);

  if (loading) return <PageLoader />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div className="settings-row">
        <div className="settings-row__label">
          <div className="settings-row__title">Check for updates</div>
          <div className="settings-row__desc">Fetches from configured registry sources.</div>
        </div>
        <div className="settings-row__control">
          <div className="inline-stack-sm" style={{ alignItems: 'center' }}>
            <Button
              variant="secondary"
              size="sm"
              loading={updating}
              onClick={async () => {
                setUpdating(true);
                try {
                  const r = (await checkForUpdates?.()) ?? [];
                  setUpdates(Array.isArray(r) ? r.length : 0);
                } finally {
                  setUpdating(false);
                }
              }}
            >
              Check now
            </Button>
            {updates > 0 && <Badge tone="warning" size="sm">{updates} update{updates === 1 ? '' : 's'} available</Badge>}
          </div>
        </div>
      </div>
      <Separator />
      <div className="settings-row">
        <div className="settings-row__label">
          <div className="settings-row__title">Developer mode</div>
          <div className="settings-row__desc">Load plugins from local paths and enable debugging.</div>
        </div>
        <div className="settings-row__control">
          <Toggle label="Enable developer mode" defaultChecked={false} />
        </div>
      </div>
      <Separator />
      <Card tone="default">
        <CardHeader>
          <CardTitle>Installed plugins</CardTitle>
          <Badge size="sm" tone="default">{plugins.length} total</Badge>
        </CardHeader>
        <CardBody style={{ padding: 0 }}>
          {plugins.length === 0 ? (
            <div style={{ padding: 'var(--space-8)' }}>
              <EmptyState size="sm" icon={<IconPlugin width={28} height={28} />} title="No plugins installed" description="Install plugins from registry to extend capabilities." />
            </div>
          ) : (
            <ul role="list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {plugins.map((p, i) => (
                <li key={p.id}>
                  <div style={{ padding: 'var(--space-4) var(--space-5)', display: 'grid', gridTemplateColumns: '40px minmax(0, 1fr) auto auto auto', gap: 'var(--space-4)', alignItems: 'center' }}>
                    <span aria-hidden="true" style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'color-mix(in srgb, var(--color-accent-violet) 18%, transparent)', color: 'var(--color-accent-violet)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconPlugin width={18} height={18} />
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div className="inline-stack-sm" style={{ alignItems: 'center' }}>
                        <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{p.manifest?.name ?? p.id}</div>
                        <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--color-text-subtle)' }}>v{p.manifest?.version ?? '1.0.0'}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.manifest?.description ?? 'No description'}</div>
                    </div>
                    <Badge tone={statusTone(p.status)} size="sm" dot>{p.status}</Badge>
                    <Toggle
                      label={`Toggle ${p.manifest?.name ?? p.id}`}
                      checked={p.status === 'enabled'}
                      onChange={async (e) => {
                        const checked = e.target.checked;
                        if (checked) {
                          await enable?.(p.id);
                          setPlugins((cur) => cur.map((x) => (x.id === p.id ? { ...x, status: 'enabled' as PluginStatus } : x)));
                        } else {
                          await disable?.(p.id);
                          setPlugins((cur) => cur.map((x) => (x.id === p.id ? { ...x, status: 'disabled' as PluginStatus } : x)));
                        }
                      }}
                    />
                    <Button variant="ghost" size="sm">Permissions</Button>
                  </div>
                  {i < plugins.length - 1 && <Separator />}
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function statusTone(s: PluginStatus): 'success' | 'danger' | 'warning' | 'default' | 'info' {
  switch (s) {
    case 'enabled': return 'success';
    case 'error': return 'danger';
    case 'update-available': return 'info';
    case 'disabled':
    case 'installed': return 'warning';
    default: return 'default';
  }
}
