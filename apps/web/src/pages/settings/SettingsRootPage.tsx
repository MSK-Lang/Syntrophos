import { Link, Outlet, useLocation } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader.jsx';
import { IconSettings } from '@/lib/icons.jsx';
import { useAuth, useWorkspace } from '@/lib/services/index.js';

type NavItem = {
  readonly id: string;
  readonly to: string;
  readonly label: string;
  readonly hint?: string;
  readonly group: 'account' | 'ai' | 'workspace' | 'platform';
};

const NAV: readonly NavItem[] = [
  { id: 'account', to: '/settings/account', label: 'Account', hint: 'Profile, password, email', group: 'account' },
  { id: 'appearance', to: '/settings/appearance', label: 'Appearance', hint: 'Theme, density, motion', group: 'account' },
  { id: 'notifications', to: '/settings/notifications', label: 'Notifications', hint: 'Alerts, badges, channels', group: 'account' },

  { id: 'ai', to: '/settings/ai', label: 'AI behavior', hint: 'Defaults, temperature, context', group: 'ai' },
  { id: 'providers', to: '/settings/providers', label: 'Providers & models', hint: 'LLMs, embeddings, STT/TTS', group: 'ai' },
  { id: 'voice', to: '/settings/voice', label: 'Voice', hint: 'Languages, microphones, TTS', group: 'ai' },

  { id: 'workspace', to: '/settings/workspace', label: 'Workspace', hint: 'Branding, members, billing', group: 'workspace' },
  { id: 'sync', to: '/settings/sync', label: 'Sync & storage', hint: 'Vault, schedule, conflicts', group: 'workspace' },

  { id: 'integrations', to: '/settings/integrations', label: 'Integrations', hint: 'Apps, webhooks, auth', group: 'platform' },
  { id: 'plugins', to: '/settings/plugins', label: 'Plugins', hint: 'Installed, permissions, dev', group: 'platform' },
];

const GROUP_LABELS: Record<NonNullable<NavItem['group']>, string> = {
  account: 'YOUR ACCOUNT',
  ai: 'AI & MODELS',
  workspace: 'WORKSPACE',
  platform: 'PLATFORM',
};

export default function SettingsRootPage() {
  const location = useLocation();
  const active = NAV.find((n) => location.pathname === n.to || location.pathname.startsWith(n.to + '/')) ?? NAV[0]!;
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();

  return (
    <div className="settings-page-wrapper">
      <div style={{ maxWidth: 1240, margin: '0 auto 28px auto' }}>
        <PageHeader
          variant="wide"
          icon={<IconSettings width={20} height={20} />}
          title="Settings"
          subtitle={currentWorkspace.status === 'success' ? currentWorkspace.data.settings.name : user?.email ?? 'System Configuration'}
        />
      </div>

      <div className="settings-layout">
        {/* Settings Navigation Column */}
        <nav className="settings-nav" aria-label="Settings navigation">
          {(['account', 'ai', 'workspace', 'platform'] as const).map((g) => (
            <div key={g} className="settings-nav__section">
              <div className="settings-nav__group-title">{GROUP_LABELS[g]}</div>
              <ul role="list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {NAV.filter((n) => n.group === g).map((n) => {
                  const isActive = n.id === active.id;
                  return (
                    <li key={n.id}>
                      <Link
                        to={n.to}
                        className={`settings-nav__item ${isActive ? 'is-active' : ''}`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                          <div className="settings-nav__item-title">{n.label}</div>
                          {n.hint && <div className="settings-nav__item-hint">{n.hint}</div>}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Main Settings Content Card with Max Width */}
        <div className="settings-main-card">
          <div className="settings-header-banner">
            <div>
              <h2 className="settings-header-title">{active.label}</h2>
              {active.hint && <div className="settings-header-subtitle">{active.hint}</div>}
            </div>

            <div className="settings-save-indicator">
              <span style={{ fontSize: 8 }}>●</span>
              <span>CHANGES AUTO-SAVED</span>
            </div>
          </div>

          <div className="settings-body-content">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
