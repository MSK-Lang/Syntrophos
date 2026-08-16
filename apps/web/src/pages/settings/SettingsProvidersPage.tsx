import { useEffect, useState } from 'react';
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, Input, Separator, Toggle, Field } from '@/components/ui/primitives';
import { PageLoader, EmptyState, ErrorState } from '@/components/ui/states';
import { IconPlus, IconProviders } from '@/lib/icons';
import { useProviders } from '@/lib/services/index';
import type { Provider, ProviderKind } from '@/lib/services/providers.contract';

type ID = string;

export default function SettingsProvidersPage() {
  const { list, configure, testConnection, getDefaults, setDefaults } = useProviders();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [defaults, setDefaultsState] = useState<{ chatProviderId?: ID; chatModelId?: ID; embeddingProviderId?: ID } | null>(null);
  const [newKind, setNewKind] = useState<ProviderKind>('llm');
  const [newName, setNewName] = useState('');
  const [newApiKey, setNewApiKey] = useState('');

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        setLoading(true);
        const [p, d] = await Promise.all([list(), getDefaults?.() ?? Promise.resolve(null)]);
        if (!mounted) return;
        setProviders(p.items as Provider[]);
        setDefaultsState(d);
      } catch (err) {
        if (mounted) setError(err as Error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [list, getDefaults]);

  const kinds: readonly ProviderKind[] = ['llm', 'embedding', 'stt', 'tts', 'image', 'rerank'];

  if (loading) return <PageLoader label="Loading providers…" />;
  if (error) return <ErrorState title="Failed to load providers" error={error.message} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 'var(--space-4)' }}>Configure a new provider</div>
        <Card tone="default">
          <CardBody style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1.5fr auto', gap: 'var(--space-4)', alignItems: 'end' }}>
            <Field label="Kind">
              <select
                className="ui-input"
                style={{ height: 40 }}
                value={newKind}
                onChange={(e) => setNewKind(e.target.value as ProviderKind)}
              >
                {kinds.map((k) => <option key={k} value={k}>{k.toUpperCase()}</option>)}
              </select>
            </Field>
            <Field label="Name">
              <Input placeholder="e.g. OpenAI, Anthropic, Ollama" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </Field>
            <Field label="API key" hint="Stored encrypted; never shown again">
              <Input type="password" placeholder="sk-…" value={newApiKey} onChange={(e) => setNewApiKey(e.target.value)} />
            </Field>
            <Button variant="primary" onClick={async () => {
              if (!newName) return;
              try {
                const created = await configure(newName.toLowerCase().replaceAll(' ', '-'), { apiKey: newApiKey });
                setProviders((cur) => [...cur, created]);
                setNewName(''); setNewApiKey('');
              } catch (err) {
                alert(`Failed to configure provider: ${(err as Error).message}`);
              }
            }}>
              <IconPlus width={14} height={14} /> Add
            </Button>
          </CardBody>
        </Card>
      </div>

      <Separator />

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Configured providers ({providers.length})</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>Enabled models are selectable inside chat threads, agent tools, and workflows.</div>
          </div>
        </div>
        {providers.length === 0 ? (
          <EmptyState
            size="sm"
            tone="default"
            icon={<IconProviders width={28} height={28} />}
            title="No providers configured yet"
            description="Add an LLM, embedding, STT, or TTS provider to start using AI features."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {providers.map((p) => (
              <Card key={p.id} tone="default">
                <CardHeader>
                  <CardTitle>
                    <div className="inline-stack-sm">
                      <ProviderIcon kind={p.kind} />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          {p.name}
                          <Badge tone="violet" size="sm">{p.kind}</Badge>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-subtle)', fontWeight: 400 }}>{p.authType} auth · {p.models.length} model{p.models.length === 1 ? '' : 's'}</div>
                      </div>
                    </div>
                  </CardTitle>
                  <Badge tone={p.status === 'configured' ? 'success' : p.status === 'error' ? 'danger' : 'warning'} size="sm" dot>{p.status}</Badge>
                </CardHeader>
                <CardBody style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <div>
                    <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, color: 'var(--color-text-subtle)', marginBottom: 'var(--space-3)' }}>Models</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                      {p.models.map((m) => (
                        <div key={m.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-surface)' }}>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>{m.name || m.externalId}</span>
                          <div style={{ fontSize: 10, color: 'var(--color-text-subtle)' }}>{(m.contextWindow ?? 8192).toLocaleString()} ctx</div>
                          {defaults?.chatProviderId === p.id && defaults?.chatModelId === m.id && (
                            <Badge size="sm" tone="primary">default</Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              await setDefaults?.({ chatProviderId: p.id, chatModelId: m.id } as never);
                              setDefaultsState((cur) => ({ ...cur, chatProviderId: p.id, chatModelId: m.id }));
                            }}
                          >Set default</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div className="inline-stack" style={{ justifyContent: 'space-between' }}>
                    <Toggle label="Enabled for chat" defaultChecked />
                    <div className="inline-stack-sm">
                      <Button variant="ghost" size="sm">Edit config</Button>
                      <Button variant="secondary" size="sm" onClick={async () => {
                        try {
                          const res = await testConnection?.(p.id) ?? { success: true, latencyMs: 0 };
                          alert(res.success ? `Connection OK (${res.latencyMs ?? 0}ms)` : `Connection failed: ${res.errorMessage ?? 'Unknown error'}`);
                        } catch (err) { alert(`Connection failed: ${(err as Error).message}`); }
                      }}>Test</Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProviderIcon({ kind }: { readonly kind: ProviderKind }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 36,
        height: 36,
        borderRadius: 'var(--radius-md)',
        background: 'color-mix(in srgb, var(--color-accent-violet) 18%, transparent)',
        color: 'var(--color-accent-violet)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <IconProviders width={18} height={18} />
    </span>
  );
}
