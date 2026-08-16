import { Button, Input, Label, Separator, Toggle, Field } from '@/components/ui/primitives.js';

export default function SettingsAiPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <div className="settings-row">
        <div className="settings-row__label">
          <div className="settings-row__title">Reasoning effort</div>
          <div className="settings-row__desc">How deeply models think before responding.</div>
        </div>
        <div className="settings-row__control">
          <select className="ui-input" style={{ height: 40 }} defaultValue="balanced">
            <option value="fast">Fast (lowest latency, lowest cost)</option>
            <option value="balanced">Balanced</option>
            <option value="deep">Deep (slower, more careful)</option>
          </select>
        </div>
      </div>
      <Separator />
      <div className="settings-row">
        <div className="settings-row__label">
          <div className="settings-row__title">Temperature</div>
          <div className="settings-row__desc">0 = deterministic. Higher = more creative.</div>
        </div>
        <div className="settings-row__control">
          <div className="inline-stack-sm" style={{ alignItems: 'center' }}>
            <input type="range" min={0} max={1.5} step={0.05} defaultValue={0.7} style={{ width: 240 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)', width: 40 }}>0.70</span>
          </div>
        </div>
      </div>
      <Separator />
      <div className="settings-row">
        <div className="settings-row__label">
          <div className="settings-row__title">Top-P</div>
          <div className="settings-row__desc">Nucleus sampling threshold.</div>
        </div>
        <div className="settings-row__control">
          <div className="inline-stack-sm" style={{ alignItems: 'center' }}>
            <input type="range" min={0} max={1} step={0.01} defaultValue={0.95} style={{ width: 240 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)', width: 40 }}>0.95</span>
          </div>
        </div>
      </div>
      <Separator />
      <div className="settings-row">
        <div className="settings-row__label">
          <div className="settings-row__title">Context window usage</div>
          <div className="settings-row__desc">Truncate memory before model limits.</div>
        </div>
        <div className="settings-row__control">
          <div className="inline-stack-sm" style={{ alignItems: 'center' }}>
            <input type="range" min={50} max={98} step={1} defaultValue={80} style={{ width: 240 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)', width: 40 }}>80%</span>
          </div>
        </div>
      </div>
      <Separator />
      <div className="settings-row">
        <div className="settings-row__label">
          <div className="settings-row__title">Stream responses</div>
          <div className="settings-row__desc">Render tokens as they arrive. Turn off on very slow connections.</div>
        </div>
        <div className="settings-row__control">
          <Toggle label="Stream responses" defaultChecked />
        </div>
      </div>
      <Separator />
      <div className="settings-row">
        <div className="settings-row__label">
          <div className="settings-row__title">Cite sources</div>
          <div className="settings-row__desc">Show referenced notes, messages, and files.</div>
        </div>
        <div className="settings-row__control">
          <Toggle label="Cite sources" defaultChecked />
        </div>
      </div>
      <Separator />
      <div className="settings-row">
        <div className="settings-row__label">
          <div className="settings-row__title">Auto-save to notes</div>
          <div className="settings-row__desc">After every chat, save a structured note with key decisions and next steps.</div>
        </div>
        <div className="settings-row__control">
          <Toggle label="Auto-save to notes" defaultChecked={false} />
        </div>
      </div>
      <Separator />
      <div className="settings-row">
        <div className="settings-row__label">
          <div className="settings-row__title">Custom system prompt</div>
          <div className="settings-row__desc">Appended to the default assistant instructions.</div>
        </div>
        <div className="settings-row__control" style={{ flex: 2 }}>
          <textarea
            className="chat-composer__input"
            rows={4}
            placeholder="Always think step by step. Cite sources when relevant. Prefer concise answers…"
            style={{ minHeight: 120 }}
          />
        </div>
      </div>
    </div>
  );
}
