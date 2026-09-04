import { NavLink, useLocation } from 'react-router-dom';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
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
  IconMail,
  IconFolder,
  IconGraph,
  IconCheckCircle,
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
  { id: 'core', label: 'Core', to: '/core', Icon: IconCore },
  { id: 'dashboard', label: 'Dashboard', to: '/dashboard', Icon: IconDashboard },
];

const MODULE_NAV: readonly NavItem[] = [
  { id: 'inbox', label: 'Inbox', to: '/inbox', Icon: IconMail, badge: 7 },
  { id: 'chat', label: 'Chat', to: '/chat', Icon: IconChat, badge: 3 },
  { id: 'tasks', label: 'Tasks', to: '/tasks', Icon: IconTasks, badge: 5 },
  { id: 'projects', label: 'Projects', to: '/projects', Icon: IconFolder, badge: 3 },
  { id: 'notes', label: 'Notes', to: '/notes', Icon: IconNotes },
  { id: 'people-schedule', label: 'People & Schedule', to: '/calendar', Icon: IconCalendar, badge: 2 },
  { id: 'intelligence', label: 'Intelligence', to: '/intelligence', Icon: IconBot, badge: 5 },
  { id: 'knowledge', label: 'Knowledge', to: '/knowledge', Icon: IconGraph, badge: 184 },
];

const UTILITY_NAV: readonly NavItem[] = [
  { id: 'help', label: 'Help & Guide', to: '/help', Icon: IconCheckCircle },
  { id: 'settings', label: 'Settings', to: '/settings', Icon: IconSettings },
];

export interface HighlightRect {
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;
}

interface SidebarNavContextValue {
  readonly onItemHover: (el: HTMLElement) => void;
}

const SidebarNavContext = createContext<SidebarNavContextValue>({
  onItemHover: () => {},
});

export function useSidebarNav() {
  return useContext(SidebarNavContext);
}

/**
 * Shared animated floating highlight that glides smoothly behind the hovered row.
 */
export function SharedHoverHighlight({
  rect,
  visible,
  hasMoved,
}: {
  readonly rect: HighlightRect | null;
  readonly visible: boolean;
  readonly hasMoved: boolean;
}) {
  if (!rect) return null;

  return (
    <div
      aria-hidden="true"
      className="sidebar-hover-highlight"
      style={{
        transform: `translate3d(${rect.left}px, ${rect.top}px, 0)`,
        width: rect.width,
        height: rect.height,
        opacity: visible ? 1 : 0,
        transition: hasMoved
          ? 'transform 150ms cubic-bezier(0.16, 1, 0.3, 1), width 150ms cubic-bezier(0.16, 1, 0.3, 1), height 150ms cubic-bezier(0.16, 1, 0.3, 1), opacity 130ms ease-out'
          : 'opacity 130ms ease-out',
      }}
    />
  );
}

/**
 * Sidebar navigation container managing shared hover highlight geometry.
 */
export function SidebarNav({
  children,
  className = '',
  style,
}: {
  readonly children: ReactNode;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}) {
  const containerRef = useRef<HTMLElement>(null);
  const [highlightRect, setHighlightRect] = useState<HighlightRect | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const currentHoveredElRef = useRef<HTMLElement | null>(null);

  const handleItemHover = useCallback((el: HTMLElement) => {
    if (!containerRef.current) return;
    if (currentHoveredElRef.current === el && isHovered) return;
    currentHoveredElRef.current = el;

    const containerRect = containerRef.current.getBoundingClientRect();
    const itemRect = el.getBoundingClientRect();

    const top = itemRect.top - containerRect.top + containerRef.current.scrollTop;
    const left = itemRect.left - containerRect.left + containerRef.current.scrollLeft;
    const width = itemRect.width;
    const height = itemRect.height;

    setHighlightRect({ top, left, width, height });
    setIsHovered(true);
    setHasMoved(true);
  }, [isHovered]);

  const handleContainerLeave = useCallback(() => {
    currentHoveredElRef.current = null;
    setIsHovered(false);
  }, []);

  // Update highlight dimensions on window / sidebar resize
  useEffect(() => {
    const handleResize = () => {
      if (currentHoveredElRef.current && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const itemRect = currentHoveredElRef.current.getBoundingClientRect();
        setHighlightRect({
          top: itemRect.top - containerRect.top + containerRef.current.scrollTop,
          left: itemRect.left - containerRect.left + containerRef.current.scrollLeft,
          width: itemRect.width,
          height: itemRect.height,
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <SidebarNavContext.Provider value={{ onItemHover: handleItemHover }}>
      <nav
        ref={containerRef}
        className={`shell-sidebar__body ${className}`.trim()}
        onPointerLeave={handleContainerLeave}
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          padding: '16px 8px',
          ...style,
        }}
      >
        <SharedHoverHighlight
          rect={highlightRect}
          visible={isHovered}
          hasMoved={hasMoved}
        />
        {children}
      </nav>
    </SidebarNavContext.Provider>
  );
}

/**
 * Individual sidebar navigation row with subtle scale-on-press and shared hover feedback.
 */
export function SidebarNavItem({
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
  const itemRef = useRef<HTMLAnchorElement>(null);
  const { onItemHover } = useSidebarNav();

  const handlePointerEnter = () => {
    if (itemRef.current) {
      onItemHover(itemRef.current);
    }
  };

  const handleFocus = () => {
    if (itemRef.current) {
      onItemHover(itemRef.current);
    }
  };

  return (
    <NavLink
      ref={itemRef}
      to={to}
      className="shell-nav__item"
      data-active={active}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      onPointerEnter={handlePointerEnter}
      onFocus={handleFocus}
      title={label}
      style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 12px',
        borderRadius: 6,
        color: active ? '#ffcc66' : '#d99a4e',
        background: active ? 'rgba(120, 60, 0, 0.6)' : 'transparent',
        border: active ? '1px solid rgba(255, 170, 48, 0.6)' : '1px solid transparent',
        boxShadow: active ? '0 0 10px rgba(255, 140, 20, 0.25) inset' : 'none',
        textShadow: active ? '0 0 6px rgba(255, 170, 48, 0.7)' : 'none',
        textDecoration: 'none',
        fontFamily: 'var(--font-sans)',
        fontSize: '13px',
        fontWeight: active ? 600 : 500,
        letterSpacing: '0.01em',
        transition: 'transform 120ms ease, color 120ms ease, text-shadow 120ms ease, border-color 120ms ease',
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
          transition: 'color 120ms ease',
          flexShrink: 0,
        }}
      >
        <Icon width={16} height={16} />
      </span>
      <span className="shell-nav__label" style={{ flex: '1 1 auto' }}>{label}</span>
      {badge ? (
        <span
          className="shell-nav__badge"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            padding: '1px 5px',
            borderRadius: 3,
            background: 'rgba(255, 170, 48, 0.2)',
            color: '#ffcc66',
            border: '1px solid rgba(255, 170, 48, 0.4)',
            lineHeight: '12px',
            flexShrink: 0,
          }}
        >
          {badge}
        </span>
      ) : null}
    </NavLink>
  );
}

// Backward compatibility alias
export const NavItemRow = SidebarNavItem;

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
        fontFamily: 'var(--font-sans)',
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
            fontFamily: 'var(--font-sans)',
            color: '#ffaa30',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            textShadow: '0 0 8px rgba(255, 170, 48, 0.6)',
          }}
        >
          SYNTHROPHOS
        </span>
      </div>

      <SidebarNav>
        {/* System Environment Tier */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div
            className="shell-sidebar__section-title"
            style={{
              fontFamily: 'var(--font-mono)',
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
            <SidebarNavItem
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
              fontFamily: 'var(--font-mono)',
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
            <SidebarNavItem
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
            <SidebarNavItem
              key={item.id}
              label={item.label}
              to={item.to}
              Icon={item.Icon}
              active={isActive(item.to)}
              onClick={onNavigate}
            />
          ))}
        </div>
      </SidebarNav>

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
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: '#ffcc66', fontWeight: 600, letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.displayName ?? user?.name ?? 'Operator'}
          </div>
          <div style={{ fontSize: '9px', color: '#885522', fontFamily: 'var(--font-mono)' }}>
            Online
          </div>
        </div>
      </div>
    </aside>
  );
}
