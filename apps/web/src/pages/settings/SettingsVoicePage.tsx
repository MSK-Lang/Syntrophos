import { Badge, Card, CardBody, Separator, Toggle } from '@/components/ui/primitives';
import { PageLoader } from '@/components/ui/states';
import { useEffect, useState } from 'react';
import { useVoice } from '@/lib/services/index';
import type { VoiceCapabilities } from '@/lib/services/voice.contract';

export default function SettingsVoicePage() {
  const { getCapabilities } = useVoice();
  const [caps, setCaps] = useState<VoiceCapabilities | null>(null);

  useEffect(() => {
    void (async () => {
      const c = await getCapabilities();
      setCaps(c);
    })();
  }, [getCapabilities]);

  if (!caps) return <PageLoader />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <div className="settings-row">
        <div className="settings-row__label">
          <div className="settings-row__title">Push-to-talk hotkey</div>
          <div className="settings-row__desc">Hold to start listening, release to stop.</div>
        </div>
        <div className="settings-row__control">
          <Badge tone="primary" size="sm" style={{ fontFamily: 'var(--font-mono)' }}>⌥ Space</Badge>
        </div>
      </div>
      <Separator />
      <div className="settings-row">
        <div className="settings-row__label">
          <div className="settings-row__title">Default input locale</div>
          <div className="settings-row__desc">Speech recognition locale.</div>
        </div>
        <div className="settings-row__control">
          <select className="ui-input" style={{ height: 40 }} defaultValue="en-US">
            {caps.availableInputLocales.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>
      <Separator />
      <div className="settings-row">
        <div className="settings-row__label">
          <div className="settings-row__title">Default TTS voice</div>
          <div className="settings-row__desc">Voice used for assistant replies.</div>
        </div>
        <div className="settings-row__control">
          <select className="ui-input" style={{ height: 40 }}>
            {caps.availableOutputVoices.map((v) => <option key={v.id} value={v.id}>{v.name} · {v.locale}</option>)}
          </select>
        </div>
      </div>
      <Separator />
      <div className="settings-row">
        <div className="settings-row__label">
          <div className="settings-row__title">Wake word</div>
          <div className="settings-row__desc">Say the wake word to start listening (runs locally when possible).</div>
        </div>
        <div className="settings-row__control inline-stack-sm" style={{ alignItems: 'center' }}>
          <Toggle label="Enable wake word detection" defaultChecked={false} />
          <Badge tone="violet" size="sm">Hey Syntrophos</Badge>
        </div>
      </div>
      <Separator />
      <div className="settings-row">
        <div className="settings-row__label">
          <div className="settings-row__title">Always-on transcription</div>
          <div className="settings-row__desc">Run STT persistently. Saves device energy when disabled.</div>
        </div>
        <div className="settings-row__control">
          <Toggle label="Always on transcription" defaultChecked={caps.sttEnabled} />
        </div>
      </div>
      <Separator />
      <Card tone="default">
        <CardBody>
          <div className="inline-stack" style={{ justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Voice capabilities</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-subtle)', marginTop: 2 }}>
                {caps.sttEnabled ? 'STT' : '—'} · {caps.ttsEnabled ? 'TTS' : '—'}
              </div>
            </div>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-subtle)' }}>
              {caps.availableInputLocales.length} locales · {caps.availableOutputVoices.length} voices
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
