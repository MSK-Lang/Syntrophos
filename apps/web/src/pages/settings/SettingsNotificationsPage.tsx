import { Badge, Separator, Toggle, type BadgeTone } from '@/components/ui/primitives';

const ITEMS: ReadonlyArray<{ id: string; label: string; desc: string; defaultChecked: boolean; tone: BadgeTone }> = [
  { id: 'email-mentions', label: 'Email for mentions', desc: 'Someone @mentions you in a note or chat.', defaultChecked: true, tone: 'primary' },
  { id: 'email-digest', label: 'Daily digest email', desc: 'Morning recap of today\'s tasks and notes.', defaultChecked: false, tone: 'default' },
  { id: 'push-tasks', label: 'Push for assigned tasks', desc: 'A task is due soon or overdue.', defaultChecked: true, tone: 'warning' },
  { id: 'push-agent', label: 'Agent run completions', desc: 'An agent or workflow finishes.', defaultChecked: true, tone: 'violet' },
  { id: 'push-sync-error', label: 'Sync failures', desc: 'Only if a sync conflict cannot auto-resolve.', defaultChecked: true, tone: 'danger' },
  { id: 'product-updates', label: 'Product updates', desc: 'Occasional news about Syntrophos releases.', defaultChecked: false, tone: 'teal' },
  { id: 'marketing', label: 'Marketing emails', desc: 'Webinars, guides, and offers.', defaultChecked: false, tone: 'default' },
];

export default function SettingsNotificationsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {ITEMS.map((item, i) => (
        <div key={item.id}>
          <div className="settings-row">
            <div className="settings-row__label">
              <div className="settings-row__title inline-stack-sm">
                <span>{item.label}</span>
                <Badge tone={item.tone} size="sm">{item.id.split('-')[0]}</Badge>
              </div>
              <div className="settings-row__desc">{item.desc}</div>
            </div>
            <div className="settings-row__control">
              <Toggle label={item.label} defaultChecked={item.defaultChecked} />
            </div>
          </div>
          {i < ITEMS.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  );
}
