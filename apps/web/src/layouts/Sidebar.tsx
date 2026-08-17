import { NavLink, useLocation } from 'react-router-dom';
import { useCallback, type ReactNode } from 'react';
import { Avatar } from '@/components/ui/primitives.js';
import { useAuth } from '@/lib/services/index.js';
import {
  IconCore,
  IconDashboard,
  IconChat,
  IconTasks,
  IconNotes,
  IconCalendar,
  IconBot,
  IconSettings,
  type IconComponent,
} from '@/lib/icons.js';

type NavItem = {
  readonly id: string;
  readonly label: string;
  readonly to: string;
  readonly Icon: IconComponent;
  readonly badge?: number;
};

const SYSTEM_NAV: readonly NavItem[] = [
  { id: 'core', label: 'CORE', to: '/core', Icon: IconCore },
  { id: 'dashboard', label: 'DASHBOARD', to: '/dashboard', Icon: IconDashboard },
];

const MODULE_NAV: readonly NavItem[] = [
  { id: 'chat', label: 'CHAT', to: '/chat', Icon: IconChat, badge: 3 },
  { id: 'tasks', label: 'TASKS', to: '/tasks', Icon: IconTasks, badge: 5 },
  { id: 'notes', label: 'NOTES', to: '/notes', Icon: IconNotes },
  { id: 'calendar', label: 'CALENDAR', to: '/calendar', Icon: IconCalendar },
  { id: 'agents', label: 'AGENTS', to: '/agents', Icon: IconBot, badge: 1 },
];

const UTILITY_NAV: readonly NavItem[] = [
  { id: 'settings', label: 'SETTINGS', to: '/settings', Icon: IconSettings },
];

export function Sidebar({
  onNavigate,
}: {
  readonly onNavigate?: () => void;
}) {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = useCallback(
    (to: string) => {
      if (to === '/core') {
        return location.pathname === '/' || location.pathname === '/core';
      }
      return location.pathname === to || location.pathname.startsWith(`${to}/`);
    },
    [location.pathname],
  );

  return (
    <aside
      className="shell-sidebar"
      aria-label="Syntrophos Navigation"
      style={{
        background: '#040200',
        borderRight: '1px solid rgba(255, 170, 48, 0.25)',
        fontFamily: '"Courier New", monospace, sans-serif',
      }}
    >
      <div
        className="shell-sidebar__brand"
        style={{
          borderBottom: '1px solid rgba(255, 170, 48, 0.25)',
          padding: '0 16px',
        }}
      >
        <span
          style={{
            color: '#ffaa30',
            fontSize: '18px',
            textShadow: '0 0 10px rgba(255, 170, 48, 0.8)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
          }}
        >
          ◉
        </span>
        <span
          className="shell-sidebar__brand-name"
          style={{
            fontFamily: '"Courier New", monospace',
            color: '#ffaa30',
            fontSize: '13px',
            letterSpacing: '0.2em',
            textShadow: '0 0 8px rgba(255, 170, 48, 0.6)',
          }}
        >
          SYNTHROPHOS
        </span>
      </div>

      <div
        className="shell-sidebar__body"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          padding: '16px 8px',
        }}
      >
        {/* System Environment Tier */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div
            className="shell-sidebar__section-title"
            style={{
              fontSize: '9px',
              letterSpacing: '0.15em',
              color: '#885522',
              padding: '0 10px',
              marginBottom: 4,
            }}
          >
            SYSTEM
          </div>
          {SYSTEM_NAV.map((item) => (
            <NavItemRow
              key={item.id}
              label={item.label}
              to={item.to}
              Icon={item.Icon}
              active={isActive(item.to)}
              onClick={onNavigate}
            />
          ))}
        </div>

        {/* Modules Tier */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div
            className="shell-sidebar__section-title"
            style={{
              fontSize: '9px',
              letterSpacing: '0.15em',
              color: '#885522',
              padding: '0 10px',
              marginBottom: 4,
            }}
          >
            OPERATIONS
          </div>
          {MODULE_NAV.map((item) => (
            <NavItemRow
              key={item.id}
              label={item.label}
              to={item.to}
              Icon={item.Icon}
              active={isActive(item.to)}
              onClick={onNavigate}
              badge={item.badge}
            />
          ))}
        </div>

        {/* Utility / Settings */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {UTILITY_NAV.map((item) => (
            <NavItemRow
              key={item.id}
              label={item.label}
              to={item.to}
              Icon={item.Icon}
              active={isActive(item.to)}
              onClick={onNavigate}
            />
          ))}
        </div>
      </div>

      <div
        className="shell-sidebar__footer"
        style={{
          borderTop: '1px solid rgba(255, 170, 48, 0.25)',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <Avatar size="sm" name={user?.displayName ?? user?.name ?? 'O'} tone="amber" />
        <div className="shell-sidebar__footer-user" style={{ minWidth: 0, flex: '1 1 auto' }}>
          <div style={{ fontSize: '11px', color: '#ffcc66', fontWeight: 600, letterSpacing: '0.05em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.displayName ?? user?.name ?? 'OPERATOR'}
          </div>
          <div style={{ fontSize: '9px', color: '#885522', fontFamily: 'monospace' }}>
            SYS // ONLINE
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavItemRow({
  label,
  to,
  Icon,
  active,
  onClick,
  badge,
}: {
  readonly label: string;
  readonly to: string;
  readonly Icon: IconComponent;
  readonly active: boolean;
  readonly onClick?: (() => void) | undefined;
  readonly badge?: number | undefined;
}) {
  return (
    <NavLink
      to={to}
      className="shell-nav__item"
      data-active={active}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '7px 12px',
        borderRadius: 4,
        color: active ? '#ffcc66' : '#d99a4e',
        background: active ? 'rgba(120, 60, 0, 0.6)' : 'transparent',
        border: active ? '1px solid rgba(255, 170, 48, 0.6)' : '1px solid transparent',
        boxShadow: active ? '0 0 10px rgba(255, 140, 20, 0.25) inset' : 'none',
        textShadow: active ? '0 0 6px rgba(255, 170, 48, 0.7)' : 'none',
        textDecoration: 'none',
        fontSize: '12px',
        fontWeight: active ? 700 : 500,
        letterSpacing: '0.08em',
        transition: 'all 120ms ease',
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 16,
          height: 16,
          color: active ? '#ffcc66' : '#ffaa30',
        }}
      >
        <Icon width={16} height={16} />
      </span>
      <span className="shell-nav__label" style={{ flex: '1 1 auto' }}>{label}</span>
      {badge ? (
        <span
          style={{
            fontSize: '9px',
            padding: '1px 5px',
            borderRadius: 3,
            background: 'rgba(255, 170, 48, 0.2)',
            color: '#ffcc66',
            border: '1px solid rgba(255, 170, 48, 0.4)',
          }}
        >
          {badge}
        </span>
      ) : null}
    </NavLink>
  );
}
