import { useState } from 'react';
import { Badge, Separator, Toggle } from '@/components/ui/primitives.js';
import { useTheme } from '@/lib/theme.js';

export default function SettingsAppearancePage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [density, setDensity] = useState<'compact' | 'comfortable' | 'spacious'>('comfortable');
  const [motion, setMotion] = useState<'auto' | 'reduced' | 'full'>('auto');
  const [font, setFont] = useState<'inter' | 'system' | 'serif' | 'mono'>('inter');
  const [accent, setAccent] = useState<'primary' | 'violet' | 'teal' | 'amber' | 'rose'>('primary');

  const ThemeButton = ({ value, label }: { value: typeof theme; label: string }) => (
    <button
      type="button"
      onClick={() => setTheme(value)}
      style={{
        padding: '12px 18px',
        border: theme === value ? '1px solid #ffaa30' : '1px solid rgba(255, 170, 48, 0.2)',
        background: theme === value ? 'rgba(255, 170, 48, 0.12)' : 'rgba(22, 12, 3, 0.6)',
        boxShadow: theme === value ? '0 0 12px rgba(255, 140, 20, 0.2) inset' : 'none',
        borderRadius: '6px',
        color: theme === value ? '#ffcc66' : '#d99a4e',
        fontWeight: theme === value ? 600 : 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: '1 1 0',
        minWidth: 110,
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
        fontSize: '13px',
        transition: 'all 140ms ease',
      }}
    >
      <span>{label}</span>
      {theme === value && <Badge size="sm" tone="primary">Active</Badge>}
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* THEME SECTION */}
      <div>
        <div style={{ fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.14em', color: '#ffaa30', marginBottom: 14 }}>
          ENVIRONMENT THEME
        </div>

        <div className="settings-form-row">
          <div className="settings-form-row__label">
            <div className="settings-form-row__title">Color mode</div>
            <div className="settings-form-row__desc">System follows your OS preference when set to System.</div>
          </div>
          <div className="settings-form-row__control" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <ThemeButton value="dark" label="Dark (Default)" />
              <ThemeButton value="light" label="Light" />
              <ThemeButton value="system" label="System" />
            </div>
            <div style={{ fontSize: 11, color: '#885522', fontFamily: 'monospace', marginTop: 4 }}>
              Active Environment: {resolvedTheme.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: 'rgba(255, 170, 48, 0.12)', margin: '4px 0' }} />

      {/* TYPOGRAPHY & DENSITY */}
      <div>
        <div style={{ fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.14em', color: '#ffaa30', marginBottom: 14 }}>
          DENSITY &amp; TYPOGRAPHY
        </div>

        <div className="settings-form-row">
          <div className="settings-form-row__label">
            <div className="settings-form-row__title">Interface density</div>
            <div className="settings-form-row__desc">Adjust padding and spacing across operational panels.</div>
          </div>
          <div className="settings-form-row__control">
            <select
              className="ui-input"
              style={{
                height: 38,
                maxWidth: 320,
                background: 'rgba(22, 12, 3, 0.85)',
                border: '1px solid rgba(255, 170, 48, 0.25)',
                borderRadius: 6,
                color: '#ffcc66',
                padding: '0 12px',
              }}
              value={density}
              onChange={(e) => setDensity(e.target.value as typeof density)}
            >
              <option value="compact">Compact (High Information Density)</option>
              <option value="comfortable">Comfortable (Recommended)</option>
              <option value="spacious">Spacious (Relaxed Rhythm)</option>
            </select>
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(255, 170, 48, 0.12)', margin: '14px 0' }} />

        <div className="settings-form-row">
          <div className="settings-form-row__label">
            <div className="settings-form-row__title">Animations &amp; motion</div>
            <div className="settings-form-row__desc">Control UI transitions and fluid micro-interactions.</div>
          </div>
          <div className="settings-form-row__control">
            <select
              className="ui-input"
              style={{
                height: 38,
                maxWidth: 320,
                background: 'rgba(22, 12, 3, 0.85)',
                border: '1px solid rgba(255, 170, 48, 0.25)',
                borderRadius: 6,
                color: '#ffcc66',
                padding: '0 12px',
              }}
              value={motion}
              onChange={(e) => setMotion(e.target.value as typeof motion)}
            >
              <option value="auto">Auto (Respect OS Preference)</option>
              <option value="reduced">Reduced Motion</option>
              <option value="full">Full Motion &amp; Shaders</option>
            </select>
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(255, 170, 48, 0.12)', margin: '14px 0' }} />

        <div className="settings-form-row">
          <div className="settings-form-row__label">
            <div className="settings-form-row__title">Default typeface</div>
            <div className="settings-form-row__desc">Primary font used for headings and operational readouts.</div>
          </div>
          <div className="settings-form-row__control">
            <select
              className="ui-input"
              style={{
                height: 38,
                maxWidth: 320,
                background: 'rgba(22, 12, 3, 0.85)',
                border: '1px solid rgba(255, 170, 48, 0.25)',
                borderRadius: 6,
                color: '#ffcc66',
                padding: '0 12px',
              }}
              value={font}
              onChange={(e) => setFont(e.target.value as typeof font)}
            >
              <option value="inter">Inter (Clean Primary)</option>
              <option value="system">Space Grotesk (Technical Display)</option>
              <option value="mono">JetBrains Mono (Monospace)</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: 'rgba(255, 170, 48, 0.12)', margin: '4px 0' }} />

      {/* FOCUS MODES */}
      <div>
        <div style={{ fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.14em', color: '#ffaa30', marginBottom: 14 }}>
          FOCUS &amp; WORKSPACE CONTROLS
        </div>

        <div className="settings-form-row">
          <div className="settings-form-row__label">
            <div className="settings-form-row__title">Show telemetry status bar</div>
            <div className="settings-form-row__desc">Compact bottom bar with node latency and agent swarm diagnostics.</div>
          </div>
          <div className="settings-form-row__control">
            <Toggle label="Show status bar" defaultChecked />
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(255, 170, 48, 0.12)', margin: '14px 0' }} />

        <div className="settings-form-row">
          <div className="settings-form-row__label">
            <div className="settings-form-row__title">Zen mode</div>
            <div className="settings-form-row__desc">Automatically collapse side navigation when composing notes or chat threads.</div>
          </div>
          <div className="settings-form-row__control">
            <Toggle label="Zen mode" defaultChecked={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
