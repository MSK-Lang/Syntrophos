import { useEffect, useState } from 'react';
import { Badge, Button, Card, CardBody, Progress, Separator, Toggle } from '@/components/ui/primitives.js';
import { PageLoader, ErrorState } from '@/components/ui/states.js';
import { IconRefresh, IconCloud } from '@/lib/icons.jsx';
import { useSync } from '@/lib/services/index.js';
import type { SyncState, SyncConflict } from '@/lib/services/sync.contract.js';

export default function SettingsSyncPage() {
  const { getCurrentState, startSync, cancelSync, listConflicts, listHistory, setSchedule, forceFullReindex, resolveConflict } = useSync();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [state, setState] = useState<Awaited<ReturnType<typeof getCurrentState>> | null>(null);
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [history, setHistory] = useState<readonly { id: string; startedAt: string; status: string; changes: number }[]>([]);
  const [schedule, setScheduleState] = useState<'realtime' | '15m' | 'hourly' | 'manual'>('realtime');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        setLoading(true);
        const [s, c, h] = await Promise.all([
          getCurrentState(),
          listConflicts?.() ?? Promise.resolve([] as unknown as { items: SyncConflict[] }),
          listHistory?.() ?? Promise.resolve([] as unknown as { items: { id: string; startedAt: string; status: string; changes: number }[] }),
        ]);
        if (!mounted) return;
        setState(s);
        setConflicts((Array.isArray(c) ? c : c.items ?? []) as SyncConflict[]);
        setHistory((Array.isArray(h) ? h : h.items ?? []) as never);
      } catch (err) {
        if (mounted) setError(err as Error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [getCurrentState, listConflicts, listHistory]);

  if (loading) return <PageLoader />;
  if (error) return <ErrorState title="Failed to load sync state" error={error.message} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <Card tone="default">
        <CardBody style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 'var(--space-5)', padding: 'var(--space-6)' }}>
          <div>
            <div className="inline-stack-sm" style={{ alignItems: 'center', marginBottom: 'var(--space-3)' }}>
              <span aria-hidden="true" style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: state?.state === 'idle' ? 'color-mix(in srgb, var(--color-success-500) 20%, transparent)' : 'color-mix(in srgb, var(--color-info-500) 20%, transparent)', color: state?.state === 'idle' ? 'var(--color-success-500)' : 'var(--color-info-500)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconCloud width={16} height={16} />
              </span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-size-md)' }}>Sync status</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-subtle)' }}>{state?.state ?? 'idle'}</div>
              </div>
            </div>
            <Progress value={state?.state === 'uploading' || state?.state === 'downloading' ? 50 : 100} tone={state?.state === 'conflict' ? 'danger' : 'success'} />
            <div style={{ marginTop: 'var(--space-3)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-subtle)' }}>
              <span>Last sync: {state?.lastSyncAt ? new Date(state.lastSyncAt).toLocaleString() : 'Never'}</span>
              <span>Pending local: {state?.pendingLocal ?? 0}</span>
              <span>Pending remote: {state?.pendingRemote ?? 0}</span>
            </div>
          </div>
          <Stat label="Pending local" value={String(state?.pendingLocal ?? 0)} />
          <Stat label="Pending remote" value={String(state?.pendingRemote ?? 0)} />
          <Stat label="Conflicts" value={String(conflicts.length)} error={conflicts.length > 0} />
        </CardBody>
      </Card>

      <div className="settings-row">
        <div className="settings-row__label">
          <div className="settings-row__title">Sync schedule</div>
          <div className="settings-row__desc">How often your vault synchronises.</div>
        </div>
        <div className="settings-row__control">
          <select className="ui-input" style={{ height: 40 }} value={schedule} onChange={(e) => {
            setScheduleState(e.target.value as typeof schedule);
            void setSchedule?.(e.target.value !== 'manual', e.target.value === '15m' ? 15 : e.target.value === 'hourly' ? 60 : 1);
          }}>
            <option value="realtime">Realtime (recommended)</option>
            <option value="15m">Every 15 minutes</option>
            <option value="hourly">Hourly</option>
            <option value="manual">Manual only</option>
          </select>
        </div>
      </div>
      <Separator />
      <div className="settings-row">
        <div className="settings-row__label">
          <div className="settings-row__title">Manual actions</div>
          <div className="settings-row__desc">Force a full sync now.</div>
        </div>
        <div className="settings-row__control inline-stack-sm">
          <Button variant="secondary" size="sm" onClick={async () => {
            if (syncing) { await cancelSync?.(); setSyncing(false); }
            else { setSyncing(true); void startSync?.(); setTimeout(() => setSyncing(false), 2500); }
          }} loading={syncing}>
            <IconRefresh width={14} height={14} /> {syncing ? 'Cancel sync' : 'Sync now'}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => void forceFullReindex?.()}>Rebuild index</Button>
        </div>
      </div>
      <Separator />

      <div>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 'var(--space-3)' }}>Unresolved conflicts</div>
        {conflicts.length === 0 ? (
          <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-subtle)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
            No conflicts. Everything is in sync.
          </div>
        ) : (
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
            {conflicts.map((c, i) => (
              <div key={c.id}>
                <div style={{ padding: 'var(--space-4) var(--space-5)', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto auto auto', gap: 'var(--space-4)', alignItems: 'center' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.path}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{c.entityType} · {new Date(c.localModifiedAt).toLocaleString()}</div>
                  </div>
                  <Badge tone="warning" size="sm">Needs action</Badge>
                  <Button variant="secondary" size="sm" onClick={() => void resolveConflict?.(c.id, 'keep-local')}>Keep local</Button>
                  <Button variant="primary" size="sm" onClick={() => void resolveConflict?.(c.id, 'keep-remote')}>Keep remote</Button>
                </div>
                {i < conflicts.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 'var(--space-3)' }}>Recent history</div>
        <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
          {history.length === 0 ? (
            <div style={{ padding: 'var(--space-5)', textAlign: 'center', color: 'var(--color-text-subtle)', fontSize: 13 }}>
              No sync history yet.
            </div>
          ) : (
            history.map((h, i) => (
              <div key={h.id}>
                <div style={{ padding: 'var(--space-4) var(--space-5)', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto auto', gap: 'var(--space-4)', alignItems: 'center' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{h.id}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{new Date(h.startedAt).toLocaleString()}</div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-subtle)' }}>{h.changes} change{h.changes === 1 ? '' : 's'}</div>
                  <Badge tone={h.status === 'success' ? 'success' : h.status === 'error' ? 'danger' : 'info'} size="sm" dot>{h.status}</Badge>
                </div>
                {i < history.length - 1 && <Separator />}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, error }: { readonly label: string; readonly value: string; readonly error?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, color: 'var(--color-text-subtle)', marginBottom: 'var(--space-2)' }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em', color: error ? 'var(--color-danger-500)' : 'var(--color-text)' }}>{value}</div>
    </div>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(2)} GB`;
}
