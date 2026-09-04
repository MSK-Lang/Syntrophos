import { useState, type FormEvent } from 'react';
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
import {
  IconTasks,
  IconCalendar,
  IconBell,
  IconCheckCircle,
  IconBot,
} from '@/lib/icons.js';

export interface SyntrophosHUDPanelsProps {
  readonly orbState: OrbState;
  readonly tasks: readonly DemoTask[];
  readonly activity: readonly ActivityEvent[];
  readonly notifications: readonly DemoNotification[];
  readonly monitors: readonly ActiveMonitor[];
  readonly isGuest: boolean;
  readonly onSaveSyntrophos: () => void;
}

export function SyntrophosHUDPanels({
  orbState,
  tasks,
  activity,
  notifications,
  monitors,
  isGuest,
  onSaveSyntrophos,
}: SyntrophosHUDPanelsProps) {
  const [activeTab, setActiveTab] = useState<'none' | 'tasks' | 'activity' | 'notifications'>('none');
  const [newTaskInput, setNewTaskInput] = useState('');
  const [notificationPermission, setNotificationPermission] = useState(
    notificationService.getPermissionStatus()
  );

  const unreadNotifications = notifications.filter((n) => !n.read);
  const scheduledCount = tasks.filter((t) => !t.completed).length;
  const activeMonitorsCount = monitors.filter((m) => m.status === 'active').length;

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

  const stateColors: Record<OrbState, { label: string; color: string; glow: string }> = {
    IDLE: { label: 'STANDBY // OBSERVING', color: '#ffaa30', glow: 'rgba(255, 170, 48, 0.4)' },
    LISTENING: { label: 'AUDIO INGEST // ACTIVE', color: '#00f0ff', glow: 'rgba(0, 240, 255, 0.5)' },
    THINKING: { label: 'NEURAL COGNITION // SYNTHESIS', color: '#a78bfa', glow: 'rgba(167, 139, 250, 0.6)' },
    ACTING: { label: 'AUTONOMOUS EXECUTION // ACTING', color: '#10b981', glow: 'rgba(16, 185, 129, 0.6)' },
    ALERT: { label: 'ANOMALY DETECTED // ALERT', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.6)' },
  };

  const currentConfig = stateColors[orbState];

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────────────────────
       * 1. TOP SYSTEM STATUS BAR
       * ──────────────────────────────────────────────────────────────────────────── */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 64,
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          background: 'rgba(5, 3, 1, 0.75)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 170, 48, 0.18)',
          pointerEvents: 'auto',
          fontFamily: 'var(--font-mono)',
        }}
      >
        {/* LEFT CLUSTER: Brand & Status summary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              textDecoration: 'none',
              color: '#fff5e6',
              fontWeight: 800,
              fontSize: 14,
              letterSpacing: '0.12em',
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#ffaa30',
                boxShadow: '0 0 10px #ffaa30',
              }}
            />
            <span>SYNTHROPHOS</span>
          </Link>

          {/* System Status Indicators */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              fontSize: 12,
              color: '#d99a4e',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 8px #10b981',
                  display: 'inline-block',
                }}
              />
              <span style={{ color: '#fff5e6', fontWeight: 600 }}>Syntrophos Online</span>
            </div>

            <span style={{ color: 'rgba(255, 170, 48, 0.3)' }}>|</span>

            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'tasks' ? 'none' : 'tasks')}
              style={{
                background: 'transparent',
                border: 'none',
                color: activeTab === 'tasks' ? '#ffaa30' : '#d99a4e',
                fontSize: 12,
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <span>{activeMonitorsCount} active monitors</span>
            </button>

            <span style={{ color: 'rgba(255, 170, 48, 0.3)' }}>|</span>

            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'tasks' ? 'none' : 'tasks')}
              style={{
                background: 'transparent',
                border: 'none',
                color: activeTab === 'tasks' ? '#ffaa30' : '#d99a4e',
                fontSize: 12,
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <span>{scheduledCount} scheduled tasks</span>
            </button>

            <span style={{ color: 'rgba(255, 170, 48, 0.3)' }}>|</span>

            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'notifications' ? 'none' : 'notifications')}
              style={{
                background: 'transparent',
                border: 'none',
                color: unreadNotifications.length > 0 ? '#ffaa30' : '#885522',
                fontSize: 12,
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontWeight: unreadNotifications.length > 0 ? 'bold' : 'normal',
              }}
            >
              <span>{unreadNotifications.length} unread notification{unreadNotifications.length === 1 ? '' : 's'}</span>
            </button>
          </div>
        </div>

        {/* CENTER: Live Orb State Pill */}
        <div
          style={{
            background: 'rgba(10, 5, 2, 0.65)',
            border: `1px solid ${currentConfig.color}`,
            boxShadow: `0 0 16px ${currentConfig.glow}`,
            borderRadius: 20,
            padding: '4px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 11,
            fontWeight: 'bold',
            color: currentConfig.color,
            letterSpacing: '0.08em',
            transition: 'all 240ms ease',
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: currentConfig.color,
              boxShadow: `0 0 10px ${currentConfig.color}`,
            }}
          />
          <span>{currentConfig.label}</span>
        </div>

        {/* RIGHT CLUSTER: HUD Action Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Quick HUD View Toggles */}
          <button
            type="button"
            className="hud-btn"
            onClick={() => setActiveTab(activeTab === 'tasks' ? 'none' : 'tasks')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              padding: '6px 12px',
              height: 32,
              borderColor: activeTab === 'tasks' ? '#ffaa30' : undefined,
              color: activeTab === 'tasks' ? '#ffcc66' : undefined,
            }}
          >
            <IconTasks className="w-3.5 h-3.5" />
            <span>TASKS</span>
          </button>

          <button
            type="button"
            className="hud-btn"
            onClick={() => setActiveTab(activeTab === 'activity' ? 'none' : 'activity')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              padding: '6px 12px',
              height: 32,
              borderColor: activeTab === 'activity' ? '#ffaa30' : undefined,
              color: activeTab === 'activity' ? '#ffcc66' : undefined,
            }}
          >
            <IconCalendar className="w-3.5 h-3.5" />
            <span>ACTIVITY</span>
          </button>

          <button
            type="button"
            className="hud-btn"
            onClick={() => setActiveTab(activeTab === 'notifications' ? 'none' : 'notifications')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              padding: '6px 12px',
              height: 32,
              position: 'relative',
              borderColor: activeTab === 'notifications' ? '#ffaa30' : undefined,
              color: activeTab === 'notifications' ? '#ffcc66' : undefined,
            }}
          >
            <IconBell className="w-3.5 h-3.5" />
            <span>NOTIFICATIONS</span>
            {unreadNotifications.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  background: '#ffaa30',
                  color: '#000000',
                  fontSize: 9,
                  fontWeight: 'bold',
                  borderRadius: '50%',
                  width: 15,
                  height: 15,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {unreadNotifications.length}
              </span>
            )}
          </button>

          {/* Guest Operator / Save my Syntrophos */}
          {isGuest && (
            <button
              type="button"
              onClick={onSaveSyntrophos}
              style={{
                background: 'rgba(255, 170, 48, 0.15)',
                border: '1px solid rgba(255, 170, 48, 0.4)',
                borderRadius: 4,
                color: '#ffcc66',
                padding: '6px 12px',
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
              title="Save state to permanent account"
            >
              [ Save my Syntrophos ]
            </button>
          )}

          <Link
            to="/dashboard"
            className="hud-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              textDecoration: 'none',
              fontSize: 11,
              padding: '6px 12px',
              height: 32,
            }}
          >
            <span>DASHBOARD</span>
          </Link>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────────────────────
       * 2. SLIDE-OUT HUD DRAWER (TASKS / ACTIVITY / NOTIFICATIONS)
       * ──────────────────────────────────────────────────────────────────────────── */}
      {activeTab !== 'none' && (
        <aside
          style={{
            position: 'fixed',
            top: 76,
            right: 24,
            width: 'min(420px, 92vw)',
            maxHeight: 'calc(100vh - 180px)',
            zIndex: 35,
            background: 'rgba(8, 4, 1, 0.92)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 170, 48, 0.35)',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9)',
            borderRadius: 12,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            pointerEvents: 'auto',
            animation: 'fadeIn 200ms ease',
          }}
        >
          {/* DRAWER HEADER */}
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid rgba(255, 170, 48, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255, 170, 48, 0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#ffaa30', fontWeight: 'bold', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                {activeTab === 'tasks' && 'TASK CENTER // TODAY'}
                {activeTab === 'activity' && 'AUTONOMOUS ACTIVITY FEED'}
                {activeTab === 'notifications' && 'NOTIFICATION CENTER'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('none')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#885522',
                cursor: 'pointer',
                fontSize: 16,
                padding: '2px 6px',
              }}
            >
              ✕
            </button>
          </div>

          {/* DRAWER BODY */}
          <div
            style={{
              padding: '16px 18px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              maxHeight: 'calc(100vh - 250px)',
            }}
          >
            {/* --- TAB: TASKS --- */}
            {activeTab === 'tasks' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontFamily: 'var(--font-mono)',
                      color: '#885522',
                      letterSpacing: '0.1em',
                    }}
                  >
                    ACTIVE &amp; SCHEDULED TASKS
                  </div>

                  <form onSubmit={handleAddTask} style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      value={newTaskInput}
                      onChange={(e) => setNewTaskInput(e.target.value)}
                      placeholder="+ Quick add task..."
                      style={{
                        flex: 1,
                        background: 'rgba(255, 170, 48, 0.06)',
                        border: '1px solid rgba(255, 170, 48, 0.25)',
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
                        padding: '0 12px',
                        fontSize: 11,
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                      }}
                    >
                      ADD
                    </button>
                  </form>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => demoStore.toggleTask(task.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '8px 10px',
                          background: task.completed
                            ? 'rgba(255, 170, 48, 0.03)'
                            : 'rgba(255, 170, 48, 0.08)',
                          border: '1px solid rgba(255, 170, 48, 0.15)',
                          borderRadius: 6,
                          cursor: 'pointer',
                          transition: 'background 160ms ease',
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
                            fontSize: 13,
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
                              fontSize: 10,
                              color: '#d99a4e',
                              background: 'rgba(255, 170, 48, 0.1)',
                              padding: '2px 6px',
                              borderRadius: 4,
                            }}
                          >
                            {task.dueTime}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* ACTIVE MONITORS SUBSECTION */}
                <div style={{ borderTop: '1px solid rgba(255, 170, 48, 0.15)', paddingTop: 14 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontFamily: 'var(--font-mono)',
                      color: '#885522',
                      letterSpacing: '0.1em',
                      marginBottom: 8,
                    }}
                  >
                    AUTONOMOUS MONITORS ({monitors.length})
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {monitors.map((mon) => (
                      <div
                        key={mon.id}
                        style={{
                          padding: '10px 12px',
                          background: 'rgba(10, 5, 2, 0.6)',
                          border: '1px solid rgba(255, 170, 48, 0.2)',
                          borderRadius: 6,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#ffcc66' }}>{mon.name}</span>
                          <span
                            style={{
                              fontSize: 9,
                              fontFamily: 'var(--font-mono)',
                              color: '#10b981',
                              background: 'rgba(16, 185, 129, 0.15)',
                              padding: '2px 5px',
                              borderRadius: 3,
                            }}
                          >
                            ● ACTIVE
                          </span>
                        </div>
                        <span style={{ fontSize: 11, color: '#aa7744' }}>Target: {mon.target}</span>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#774411', fontFamily: 'var(--font-mono)' }}>
                          <span>Checked {mon.lastChecked}</span>
                          <span>Findings: {mon.findingsCount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* --- TAB: ACTIVITY FEED --- */}
            {activeTab === 'activity' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {activity.map((event) => (
                  <div
                    key={event.id}
                    style={{
                      padding: '10px 12px',
                      background: 'rgba(255, 170, 48, 0.05)',
                      border: '1px solid rgba(255, 170, 48, 0.15)',
                      borderRadius: 6,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#fff5e6' }}>
                        {event.title}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 10,
                          color: '#ffaa30',
                        }}
                      >
                        {event.time}
                      </span>
                    </div>
                    {event.detail && (
                      <span style={{ fontSize: 12, color: '#d99a4e', lineHeight: 1.4 }}>
                        {event.detail}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* --- TAB: NOTIFICATIONS --- */}
            {activeTab === 'notifications' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Browser Notification Opt-In Banner */}
                {notificationPermission !== 'granted' && (
                  <div
                    style={{
                      padding: '12px',
                      background: 'rgba(255, 170, 48, 0.12)',
                      border: '1px solid rgba(255, 170, 48, 0.3)',
                      borderRadius: 6,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 'bold', color: '#ffcc66' }}>
                      Enable Browser Desktop Alerts
                    </div>
                    <div style={{ fontSize: 11, color: '#d99a4e', lineHeight: 1.4 }}>
                      Receive proactive Syntrophos reminders and autonomous monitor alerts on your device.
                    </div>
                    <button
                      type="button"
                      onClick={handleEnableBrowserNotifications}
                      style={{
                        background: '#ffaa30',
                        color: '#000000',
                        border: 'none',
                        borderRadius: 4,
                        padding: '6px 12px',
                        fontSize: 11,
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        alignSelf: 'flex-start',
                      }}
                    >
                      [ Allow Browser Notifications ]
                    </button>
                  </div>
                )}

                {/* Notification Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#885522', fontFamily: 'var(--font-mono)' }}>
                    {unreadNotifications.length} UNREAD
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => demoStore.markAllNotificationsRead()}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#d99a4e',
                        fontSize: 11,
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                      }}
                    >
                      Mark all read
                    </button>
                    <button
                      type="button"
                      onClick={() => demoStore.clearNotifications()}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#885522',
                        fontSize: 11,
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Notifications List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '24px 0', textAlign: 'center', color: '#885522', fontSize: 12 }}>
                      No notifications logged.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => demoStore.markNotificationRead(notif.id)}
                        style={{
                          padding: '12px',
                          background: notif.read
                            ? 'rgba(255, 170, 48, 0.03)'
                            : 'rgba(255, 170, 48, 0.1)',
                          border: notif.read
                            ? '1px solid rgba(255, 170, 48, 0.15)'
                            : '1px solid rgba(255, 170, 48, 0.45)',
                          borderRadius: 6,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: 9,
                              fontWeight: 'bold',
                              color:
                                notif.priority === 'urgent'
                                  ? '#ef4444'
                                  : notif.priority === 'high'
                                  ? '#ffaa30'
                                  : '#38bdf8',
                              background: 'rgba(0, 0, 0, 0.4)',
                              padding: '2px 6px',
                              borderRadius: 3,
                            }}
                          >
                            {notif.priority.toUpperCase()} · {notif.source}
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#885522' }}>
                            {notif.timestamp}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, color: notif.read ? '#aa7744' : '#fff5e6', lineHeight: 1.4 }}>
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
