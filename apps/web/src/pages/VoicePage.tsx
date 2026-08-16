import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader.jsx';
import { Avatar, Badge, Button, Card, CardBody, CardHeader, CardTitle, Progress, Separator } from '@/components/ui/primitives.js';
import { ErrorState, EmptyState, PageLoader } from '@/components/ui/states.js';
import { IconBot, IconMic, IconStar } from '@/lib/icons.jsx';
import { useVoice } from '@/lib/services/index.js';
import type { VoiceCapabilities, VoiceState, VoiceTranscript } from '@/lib/services/voice.contract.js';

export default function VoicePage() {
  const { getState, getCapabilities, startListening, stopListening, subscribeTranscript, speak } = useVoice();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [state, setState] = useState<VoiceState | null>(null);
  const [caps, setCaps] = useState<VoiceCapabilities | null>(null);
  const [listening, setListening] = useState(false);
  const [transcripts, setTranscripts] = useState<VoiceTranscript[]>([]);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        setLoading(true);
        const [s, c] = await Promise.all([getState(), getCapabilities()]);
        if (!mounted) return;
        setState(s);
        setCaps(c);
      } catch (err) {
        if (mounted) setError(err as Error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [getState, getCapabilities]);

  useEffect(() => {
    if (!subscribeTranscript) return;
    const unsub = subscribeTranscript((t) => setTranscripts((cur) => [...cur, t]));
    return unsub;
  }, [subscribeTranscript]);

  const testPhrase = 'Good morning. What should we work on first today?';

  return (
    <div className="shell-page shell-page--wide">
      <PageHeader
        variant="wide"
        icon={<IconMic width={22} height={22} />}
        title="Voice mode"
        subtitle={caps ? `${caps.availableInputLocales.length} locales · ${caps.availableOutputVoices.length} voices available` : 'Speech-to-text and text-to-speech'}
        actions={[
          {
            id: 'toggle',
            label: listening ? 'Stop listening' : 'Start listening',
            variant: listening ? 'primary' : 'secondary',
            icon: <IconMic width={16} height={16} />,
            primary: true,
            onAction: async () => {
              if (listening) {
                await stopListening();
                setListening(false);
              } else {
                await startListening?.();
                setListening(true);
                setTimeout(async () => {
                  setListening(false);
                  setTranscripts((cur) => [
                    ...cur,
                    {
                      id: `t${Date.now()}`,
                      text: testPhrase,
                      isFinal: true,
                      timestamp: new Date().toISOString(),
                      locale: 'en-US',
                      confidence: 0.98,
                    },
                  ]);
                }, 3500);
              }
            },
          },
          {
            id: 'speak',
            label: 'Test voice',
            variant: 'ghost',
            onAction: async () => {
              try {
                const vId = caps?.availableOutputVoices[0]?.id;
                await speak?.(testPhrase, vId ? { voiceId: vId } : undefined);
              } finally {
                setTimeout(() => setSpeaking(false), 2200);
              }
            },
          },
        ]}
      />
      <div style={{ padding: '0 var(--space-6) var(--space-8)', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 'var(--space-6)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <Card tone="default">
            <CardHeader>
              <CardTitle>
                <div className="inline-stack">
                  <div
                    style={{
                      width: 10, height: 10, borderRadius: 'var(--radius-full)',
                      background: listening || state === 'listening' ? 'var(--color-danger-500)' : state === 'speaking' ? 'var(--color-warning-500)' : 'var(--color-success-500)',
                      boxShadow: listening ? '0 0 0 4px color-mix(in srgb, var(--color-danger-500) 20%, transparent)' : 'none',
                      animation: listening ? 'ui-pulse 1.2s ease-in-out infinite' : 'none',
                    }}
                  />
                  {listening ? 'Listening…' : speaking ? 'Speaking…' : 'Voice idle'}
                </div>
              </CardTitle>
              <Badge tone={listening ? 'danger' : speaking ? 'info' : 'success'} size="sm" dot>
                {listening ? 'microphone hot' : speaking ? 'TTS active' : 'ready'}
              </Badge>
            </CardHeader>
            <CardBody>
              <div
                role="img"
                aria-label="Voice waveform placeholder"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(60, 1fr)',
                  alignItems: 'end',
                  gap: 3,
                  height: 180,
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  background: `linear-gradient(180deg, ${listening ? 'color-mix(in srgb, var(--color-danger-500) 8%, transparent)' : 'var(--color-background-muted)'} 0%, transparent 100%)`,
                }}
              >
                {Array.from({ length: 60 }).map((_, i) => {
                  const h = listening
                    ? 20 + Math.abs(Math.sin(i * 0.7 + Date.now() / 220)) * 80
                    : 10 + ((i * 37) % 40);
                  return (
                    <div
                      key={i}
                      style={{
                        width: '100%',
                        height: `${Math.max(10, Math.min(100, h))}%`,
                        borderRadius: 2,
                        background: listening
                          ? 'linear-gradient(180deg, var(--color-primary-500), var(--color-accent-violet))'
                          : 'var(--color-border-strong)',
                        opacity: listening ? 0.8 : 0.5,
                      }}
                    />
                  );
                })}
              </div>
              <Separator />
              <div style={{ paddingTop: 'var(--space-4)' }}>
                <div style={{ fontSize: 12, color: 'var(--color-text-subtle)', marginBottom: 'var(--space-3)' }}>Live utterances</div>
                {loading ? (
                  <PageLoader />
                ) : error ? (
                  <ErrorState title="Voice unavailable" error={error.message} />
                ) : transcripts.length === 0 ? (
                  <EmptyState size="sm" icon={<IconMic width={24} height={24} />} title="No transcripts yet" description="Start listening to see your words appear here." />
                ) : (
                  <ul role="list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {transcripts.slice().reverse().map((t) => (
                      <li key={t.id}>
                        <div style={{ padding: 'var(--space-4)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                          <div className="inline-stack-sm" style={{ justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                            <Badge tone="violet" size="sm">{t.locale}</Badge>
                            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--color-text-subtle)' }}>
                              {new Date(t.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', lineHeight: 1.6 }}>{t.text}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <Card tone="default">
            <CardHeader>
              <CardTitle>Capabilities</CardTitle>
            </CardHeader>
            <CardBody>
              {loading ? <PageLoader /> : caps ? (
                <ul role="list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <CapabilityRow label="Speech to text" value={caps.sttEnabled ? 'Supported' : 'N/A'} ok={caps.sttEnabled} />
                  <CapabilityRow label="Text to speech" value={caps.ttsEnabled ? 'Supported' : 'N/A'} ok={caps.ttsEnabled} />
                  <Separator />
                  <CapabilityRow label="Locales" value={`${caps.availableInputLocales.length} installed`} />
                  <CapabilityRow label="Voices" value={`${caps.availableOutputVoices.length} voices`} />
                </ul>
              ) : <EmptyState size="sm" icon={<IconStar width={22} height={22} />} title="No capability info" />}
            </CardBody>
          </Card>

          <Card tone="default">
            <CardHeader>
              <CardTitle>Available voices</CardTitle>
            </CardHeader>
            <CardBody>
              {caps?.availableOutputVoices.length ? (
                <ul role="list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {caps.availableOutputVoices.slice(0, 5).map((v) => (
                    <li key={v.id}>
                      <div className="inline-stack-sm">
                        <Avatar size="sm" name={v.name} tone="violet" icon={<IconBot width={14} height={14} />} />
                        <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{v.name}</div>
                          <div style={{ fontSize: 10, color: 'var(--color-text-subtle)' }}>{v.locale} · {v.gender ?? 'neutral'}</div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => void speak?.('Hello, this is a voice preview.', { voiceId: v.id })}>Play</Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState size="sm" icon={<IconStar width={22} height={22} />} title="No voices configured" description="Add voices in Settings → Voice." />
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function CapabilityRow({ label, value, ok }: { readonly label: string; readonly value: string; readonly ok?: boolean }) {
  return (
    <li>
      <div className="inline-stack" style={{ justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{label}</span>
        <Badge size="sm" tone={ok === undefined ? 'default' : ok ? 'success' : 'warning'} dot>
          {value}
        </Badge>
      </div>
    </li>
  );
}
