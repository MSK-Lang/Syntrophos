import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  demoStore,
  type DemoTask,
  type ActivityEvent,
  type DemoNotification,
  type ActiveMonitor,
  type OrbState,
} from '@/lib/syntrophosDemoStore.js';
import { notificationService } from '@/lib/notificationService.js';

export interface SyntrophosHUDPanelsProps {
  readonly orbState: OrbState;
  readonly tasks: readonly DemoTask[];
  readonly activity: readonly ActivityEvent[];
  readonly notifications: readonly DemoNotification[];
  readonly monitors: readonly ActiveMonitor[];
  readonly isGuest: boolean;
  readonly showOrbControls: boolean;
  readonly onToggleOrbControls: () => void;
  readonly onSaveSyntrophos: () => void;
}

export function SyntrophosHUDPanels({
  tasks,
  activity,
  notifications,
  monitors,
  isGuest,
  showOrbControls,
  onToggleOrbControls,
  onSaveSyntrophos,
}: SyntrophosHUDPanelsProps) {
  const [activeDrawer, setActiveDrawer] = useState<'none' | 'tasks' | 'activity' | 'notifications'>('none');
  const [showMenu, setShowMenu] = useState(false);
  const [newTaskInput, setNewTaskInput] = useState('');
  const [notificationPermission, setNotificationPermission] = useState(
    notificationService.getPermissionStatus()
  );

  const menuRef = useRef<HTMLDivElement>(null);

  const unreadNotifications = notifications.filter((n) => !n.read);
  const activeMonitorsCount = monitors.filter((m) => m.status === 'active').length;
  const scheduledCount = tasks.filter((t) => !t.completed).length;

  // Close menu on outside click
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleDocumentClick);
      return () => document.removeEventListener('mousedown', handleDocumentClick);
    }
  }, [showMenu]);

  const handleAddTask = (e: FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    demoStore.addTask(newTaskInput.trim(), 'medium', 'Today');
    setNewTaskInput('');
  };

  const handleEnableBrowserNotifications = async () => {
    const granted = await notificationService.requestBrowserPermission();
    if (granted) {
      setNotificationPermission('granted');
    }
  };

  const toggleDrawer = (drawer: 'tasks' | 'activity' | 'notifications') => {
    setActiveDrawer((prev) => (prev === drawer ? 'none' : drawer));
    setShowMenu(false);
  };

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────────────────────
       * 1. TOP MINIMAL NAVIGATION BAR (THIN, QUIET, RESTRAINED)
       * ──────────────────────────────────────────────────────────────────────────── */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 48,
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          background: 'transparent',
          pointerEvents: 'auto',
          fontFamily: 'var(--font-mono)',
        }}
      >
        {/* LEFT: ORIGINAL SYNTHROPHOS BRANDING */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
            color: '#fff5e6',
            fontWeight: 800,
            fontSize: 15,
            letterSpacing: '0.12em',
            opacity: 0.95,
            transition: 'opacity 160ms ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.95')}
        >
          <div
            style={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: '#ffaa30',
              boxShadow: '0 0 10px rgba(255, 170, 48, 0.85)',
            }}
          />
          <span>SYNTHROPHOS</span>
        </Link>

        {/* RIGHT: QUIET ACTION BUTTONS & MENU (TASKS · ACTIVITY · NOTIFICATIONS · DASHBOARD · ⋮) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <button
            type="button"
            onClick={() => toggleDrawer('tasks')}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeDrawer === 'tasks' ? '#ffaa30' : '#885522',
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              letterSpacing: '0.08em',
              cursor: 'pointer',
              padding: '4px 0',
              transition: 'color 160ms ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffaa30')}
            onMouseLeave={(e) => (e.currentTarget.style.color = activeDrawer === 'tasks' ? '#ffaa30' : '#885522')}
          >
            Tasks
          </button>

          <button
            type="button"
            onClick={() => toggleDrawer('activity')}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeDrawer === 'activity' ? '#ffaa30' : '#885522',
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              letterSpacing: '0.08em',
              cursor: 'pointer',
              padding: '4px 0',
              transition: 'color 160ms ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffaa30')}
            onMouseLeave={(e) => (e.currentTarget.style.color = activeDrawer === 'activity' ? '#ffaa30' : '#885522')}
          >
            Activity
          </button>

          <button
            type="button"
            onClick={() => toggleDrawer('notifications')}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeDrawer === 'notifications' ? '#ffaa30' : '#885522',
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              letterSpacing: '0.08em',
              cursor: 'pointer',
              padding: '4px 0',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              transition: 'color 160ms ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffaa30')}
            onMouseLeave={(e) => (e.currentTarget.style.color = activeDrawer === 'notifications' ? '#ffaa30' : '#885522')}
          >
            <span>Notifications</span>
            {unreadNotifications.length > 0 && (
              <span
                style={{
                  background: '#ffaa30',
                  color: '#000000',
                  fontSize: 9,
                  fontWeight: 'bold',
                  borderRadius: 10,
                  padding: '1px 5px',
                  lineHeight: '12px',
                }}
              >
                {unreadNotifications.length}
              </span>
            )}
          </button>

          {/* DASHBOARD LINK BUTTON */}
          <Link
            to="/dashboard"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#885522',
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textDecoration: 'none',
              padding: '4px 0',
              transition: 'color 160ms ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffaa30')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#885522')}
          >
            Dashboard
          </Link>

          {/* SECONDARY MENU (⋮) */}
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              style={{
                background: 'transparent',
                border: 'none',
                color: showMenu ? '#ffaa30' : '#885522',
                fontSize: 16,
                cursor: 'pointer',
                padding: '4px 8px',
                lineHeight: 1,
                transition: 'color 160ms ease',
              }}
              aria-label="Settings and System Menu"
              title="Settings & System Menu"
            >
              ⋮
            </button>

            {/* DROPDOWN MENU */}
            {showMenu && (
              <div
                className="ui-dropdown__content"
                style={{
                  position: 'absolute',
                  top: 36,
                  right: 0,
                  width: 240,
                  background: 'rgba(8, 4, 1, 0.95)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255, 170, 48, 0.3)',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9)',
                  borderRadius: 8,
                  padding: '8px 0',
                  display: 'flex',
                  flexDirection: 'column',
                  zIndex: 50,
                }}
              >
                {/* Status snippet */}
                <div
                  style={{
                    padding: '8px 16px',
                    borderBottom: '1px solid rgba(255, 170, 48, 0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#fff5e6', fontWeight: 600 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981' }} />
                    <span>Syntrophos Online</span>
                  </div>
                  <div style={{ fontSize: 10, color: '#aa7744' }}>
                    {activeMonitorsCount} monitors · {scheduledCount} tasks
                  </div>
                </div>

                {/* Orb Controls Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    onToggleOrbControls();
                    setShowMenu(false);
                  }}
                  style={{
                    padding: '10px 16px',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    color: showOrbControls ? '#ffaa30' : '#d99a4e',
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 170, 48, 0.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span>Orb Dev Controls</span>
                  <span style={{ fontSize: 9, color: showOrbControls ? '#10b981' : '#664422' }}>
                    {showOrbControls ? 'ON' : 'OFF'}
                  </span>
                </button>

                {/* Save my Syntrophos */}
                {isGuest && (
                  <button
                    type="button"
                    onClick={() => {
                      onSaveSyntrophos();
                      setShowMenu(false);
                    }}
                    style={{
                      padding: '10px 16px',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      color: '#ffcc66',
                      fontSize: 11,
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 170, 48, 0.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    Save my Syntrophos
                  </button>
                )}

                {/* Dashboard Link */}
                <Link
                  to="/dashboard"
                  style={{
                    padding: '10px 16px',
                    color: '#d99a4e',
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    textDecoration: 'none',
                    display: 'block',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 170, 48, 0.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  Open Dashboard
                </Link>

                {/* Help */}
                <Link
                  to="/help"
                  style={{
                    padding: '10px 16px',
                    color: '#885522',
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    textDecoration: 'none',
                    display: 'block',
                    borderTop: '1px solid rgba(255, 170, 48, 0.1)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 170, 48, 0.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  Help &amp; Guide
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────────────────────
       * 2. SLIDE-OUT DRAWER (TASKS / ACTIVITY / NOTIFICATIONS)
       * ──────────────────────────────────────────────────────────────────────────── */}
      {activeDrawer !== 'none' && (
        <aside
          className="ui-drawer--right"
          style={{
            position: 'fixed',
            top: 56,
            right: 20,
            width: 'min(380px, 90vw)',
            maxHeight: 'calc(100vh - 120px)',
            zIndex: 35,
            background: 'rgba(7, 3, 1, 0.94)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 170, 48, 0.28)',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9)',
            borderRadius: 10,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            pointerEvents: 'auto',
          }}
        >
          {/* DRAWER HEADER */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid rgba(255, 170, 48, 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255, 170, 48, 0.04)',
            }}
          >
            <span style={{ color: '#ffaa30', fontWeight: 'bold', fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
              {activeDrawer === 'tasks' && "Today's Tasks"}
              {activeDrawer === 'activity' && 'Recent Activity'}
              {activeDrawer === 'notifications' && 'Notifications'}
            </span>

            <button
              type="button"
              onClick={() => setActiveDrawer('none')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#885522',
                cursor: 'pointer',
                fontSize: 14,
                padding: '0 4px',
              }}
            >
              ✕
            </button>
          </div>

          {/* DRAWER CONTENT */}
          <div
            style={{
              padding: '14px 16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              maxHeight: 'calc(100vh - 200px)',
            }}
          >
            {/* --- TAB: TASKS --- */}
            {activeDrawer === 'tasks' && (
              <>
                <form onSubmit={handleAddTask} style={{ display: 'flex', gap: 6 }}>
                  <input
                    type="text"
                    value={newTaskInput}
                    onChange={(e) => setNewTaskInput(e.target.value)}
                    placeholder="+ Add task..."
                    style={{
                      flex: 1,
                      background: 'rgba(255, 170, 48, 0.05)',
                      border: '1px solid rgba(255, 170, 48, 0.2)',
                      borderRadius: 4,
                      color: '#fff5e6',
                      padding: '6px 10px',
                      fontSize: 12,
                      fontFamily: 'var(--font-sans)',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: '#ffaa30',
                      color: '#000000',
                      border: 'none',
                      borderRadius: 4,
                      padding: '0 10px',
                      fontSize: 10,
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    ADD
                  </button>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => demoStore.toggleTask(task.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '7px 9px',
                        background: task.completed
                          ? 'rgba(255, 170, 48, 0.02)'
                          : 'rgba(255, 170, 48, 0.07)',
                        border: '1px solid rgba(255, 170, 48, 0.12)',
                        borderRadius: 5,
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => {}}
                        style={{ accentColor: '#ffaa30', cursor: 'pointer' }}
                      />
                      <span
                        style={{
                          flex: 1,
                          fontSize: 12.5,
                          color: task.completed ? '#775533' : '#fff5e6',
                          textDecoration: task.completed ? 'line-through' : 'none',
                        }}
                      >
                        {task.title}
                      </span>
                      {task.dueTime && (
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 9.5,
                            color: '#d99a4e',
                            background: 'rgba(255, 170, 48, 0.08)',
                            padding: '1px 5px',
                            borderRadius: 3,
                          }}
                        >
                          {task.dueTime}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Monitors */}
                <div style={{ borderTop: '1px solid rgba(255, 170, 48, 0.12)', paddingTop: 10 }}>
                  <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#885522', marginBottom: 6 }}>
                    AUTONOMOUS MONITORS ({monitors.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {monitors.map((mon) => (
                      <div
                        key={mon.id}
                        style={{
                          padding: '8px 10px',
                          background: 'rgba(10, 5, 2, 0.5)',
                          border: '1px solid rgba(255, 170, 48, 0.16)',
                          borderRadius: 5,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 3,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 11.5, fontWeight: 600, color: '#ffcc66' }}>{mon.name}</span>
                          <span style={{ fontSize: 8.5, fontFamily: 'var(--font-mono)', color: '#10b981' }}>● ACTIVE</span>
                        </div>
                        <span style={{ fontSize: 10.5, color: '#aa7744' }}>Target: {mon.target}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* --- TAB: ACTIVITY --- */}
            {activeDrawer === 'activity' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activity.map((event) => (
                  <div
                    key={event.id}
                    style={{
                      padding: '9px 11px',
                      background: 'rgba(255, 170, 48, 0.04)',
                      border: '1px solid rgba(255, 170, 48, 0.12)',
                      borderRadius: 5,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 3,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11.5, fontWeight: 600, color: '#fff5e6' }}>
                        {event.title}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: '#ffaa30' }}>
                        {event.time}
                      </span>
                    </div>
                    {event.detail && (
                      <span style={{ fontSize: 11, color: '#d99a4e', lineHeight: 1.35 }}>
                        {event.detail}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* --- TAB: NOTIFICATIONS --- */}
            {activeDrawer === 'notifications' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {notificationPermission !== 'granted' && (
                  <div
                    style={{
                      padding: '10px',
                      background: 'rgba(255, 170, 48, 0.1)',
                      border: '1px solid rgba(255, 170, 48, 0.25)',
                      borderRadius: 5,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 'bold', color: '#ffcc66' }}>
                      Browser Alerts
                    </div>
                    <button
                      type="button"
                      onClick={handleEnableBrowserNotifications}
                      style={{
                        background: '#ffaa30',
                        color: '#000000',
                        border: 'none',
                        borderRadius: 3,
                        padding: '5px 10px',
                        fontSize: 10,
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        alignSelf: 'flex-start',
                      }}
                    >
                      Enable Desktop Notifications
                    </button>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: '#885522' }}>{unreadNotifications.length} UNREAD</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => demoStore.markAllNotificationsRead()}
                      style={{ background: 'transparent', border: 'none', color: '#d99a4e', cursor: 'pointer', fontSize: 10, padding: 0 }}
                    >
                      Mark read
                    </button>
                    <button
                      type="button"
                      onClick={() => demoStore.clearNotifications()}
                      style={{ background: 'transparent', border: 'none', color: '#885522', cursor: 'pointer', fontSize: 10, padding: 0 }}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '20px 0', textAlign: 'center', color: '#885522', fontSize: 11 }}>
                      No notifications logged.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => demoStore.markNotificationRead(notif.id)}
                        style={{
                          padding: '9px 11px',
                          background: notif.read ? 'rgba(255, 170, 48, 0.02)' : 'rgba(255, 170, 48, 0.08)',
                          border: notif.read ? '1px solid rgba(255, 170, 48, 0.12)' : '1px solid rgba(255, 170, 48, 0.35)',
                          borderRadius: 5,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4,
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: 8.5,
                              fontWeight: 'bold',
                              color: notif.priority === 'urgent' ? '#ef4444' : '#ffaa30',
                            }}
                          >
                            {notif.priority.toUpperCase()} · {notif.source}
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#885522' }}>
                            {notif.timestamp}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: notif.read ? '#aa7744' : '#fff5e6', lineHeight: 1.35 }}>
                          {notif.message}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>
      )}
    </>
  );
}
