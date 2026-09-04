/**
 * Syntrophos Demo Central Store & Persistence Layer
 * Single source of truth for all demo state:
 * - Tasks (active, completed, scheduled)
 * - Reminders
 * - Activity Feed (chronological history)
 * - Notifications
 * - Active Monitors
 * - System Status & Orb State
 * 
 * Persistence Adapter:
 * Uses localStorage for seamless offline/paused demo persistence.
 * Cleanly abstracted to allow swap to SupabasePersistenceAdapter in the future.
 */

export type OrbState = 'IDLE' | 'LISTENING' | 'THINKING' | 'ACTING' | 'ALERT';

export interface DemoTask {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueTime?: string | undefined;
  createdAt: string;
  completedAt?: string | undefined;
}

export interface ScheduledReminder {
  id: string;
  title: string;
  targetTime: string;
  dueTimestamp: number;
  triggered: boolean;
  createdAt: string;
}

export interface ActivityEvent {
  id: string;
  time: string; // e.g. "18:42"
  timestamp: number;
  title: string;
  detail?: string | undefined;
  type: 'reminder' | 'task' | 'monitor' | 'system' | 'agent';
}

export interface DemoNotification {
  id: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'reminder' | 'monitor' | 'task' | 'system';
  timestamp: string;
  read: boolean;
  source: 'Syntrophos Core' | 'Project Watcher' | 'Scheduler' | 'Autonomous Agent';
  targetDevice: 'Laptop' | 'Phone' | 'Email' | 'Slack' | 'WhatsApp';
}

export interface ActiveMonitor {
  id: string;
  name: string;
  target: string;
  status: 'active' | 'paused';
  lastChecked: string;
  findingsCount: number;
  description: string;
}

export interface DemoSessionState {
  operatorName: string;
  isGuest: boolean;
  joinedAt: string;
}

export interface SyntrophosState {
  orbState: OrbState;
  tasks: DemoTask[];
  reminders: ScheduledReminder[];
  activity: ActivityEvent[];
  notifications: DemoNotification[];
  monitors: ActiveMonitor[];
  session: DemoSessionState;
}

const STORAGE_KEY = 'syntrophos_demo_state_v1';

function formatCurrentTime(date = new Date()): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function getInitialState(): SyntrophosState {
  return {
    orbState: 'IDLE',
    session: {
      operatorName: 'Guest Operator',
      isGuest: true,
      joinedAt: new Date().toISOString(),
    },
    tasks: [
      {
        id: 'task-1',
        title: 'Finish AWS course',
        completed: false,
        priority: 'high',
        dueTime: '20:00',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'task-2',
        title: 'Review project',
        completed: false,
        priority: 'medium',
        dueTime: 'Today',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'task-3',
        title: 'Gym workout',
        completed: true,
        priority: 'low',
        dueTime: 'Morning',
        createdAt: new Date(Date.now() - 14400000).toISOString(),
        completedAt: new Date(Date.now() - 7200000).toISOString(),
      },
    ],
    reminders: [
      {
        id: 'rem-1',
        title: 'Study at 8 PM',
        targetTime: '20:00',
        dueTimestamp: new Date().setHours(20, 0, 0, 0),
        triggered: false,
        createdAt: new Date(Date.now() - 1800000).toISOString(),
      },
    ],
    activity: [
      {
        id: 'act-1',
        time: '18:42',
        timestamp: Date.now() - 600000,
        title: 'Reminder scheduled',
        detail: 'Study session scheduled for 20:00',
        type: 'reminder',
      },
      {
        id: 'act-2',
        time: '18:30',
        timestamp: Date.now() - 1320000,
        title: 'Project status checked',
        detail: 'Repository clean; 0 build regressions detected',
        type: 'monitor',
      },
      {
        id: 'act-3',
        time: '17:55',
        timestamp: Date.now() - 3420000,
        title: 'Task created',
        detail: 'Finish AWS course added to TODAY queue',
        type: 'task',
      },
      {
        id: 'act-4',
        time: '16:20',
        timestamp: Date.now() - 9120000,
        title: 'New activity detected',
        detail: 'Syntrophos autonomous telemetry verified',
        type: 'system',
      },
    ],
    notifications: [
      {
        id: 'notif-1',
        message: 'Reminder — AWS course at 8:00 PM',
        priority: 'high',
        category: 'reminder',
        timestamp: '18:42',
        read: false,
        source: 'Scheduler',
        targetDevice: 'Laptop',
      },
      {
        id: 'notif-2',
        message: 'System telemetry nominal — 2 monitors online',
        priority: 'low',
        category: 'system',
        timestamp: '16:20',
        read: true,
        source: 'Syntrophos Core',
        targetDevice: 'Laptop',
      },
    ],
    monitors: [
      {
        id: 'mon-1',
        name: 'Workspace Integrity Watcher',
        target: 'Syntrophos Engine',
        status: 'active',
        lastChecked: '2m ago',
        findingsCount: 0,
        description: 'Monitors runtime state, memory pressure, and local sync',
      },
      {
        id: 'mon-2',
        name: 'Project Timeline Monitor',
        target: 'Sprint Roadmap',
        status: 'active',
        lastChecked: '12m ago',
        findingsCount: 1,
        description: 'Tracking milestones, pending tasks, and scheduled deliverables',
      },
    ],
  };
}

class DemoPersistenceAdapter {
  load(): SyntrophosState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SyntrophosState;
        // Verify key integrity
        if (Array.isArray(parsed.tasks) && Array.isArray(parsed.activity)) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('[Syntrophos Store] LocalStorage unavailable or corrupt:', err);
    }
    return getInitialState();
  }

  save(state: SyntrophosState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn('[Syntrophos Store] Failed to write state:', err);
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // noop
    }
  }
}

export class SyntrophosDemoStore {
  private persistence = new DemoPersistenceAdapter();
  private state: SyntrophosState;
  private listeners = new Set<(state: SyntrophosState) => void>();

  constructor() {
    this.state = this.persistence.load();
  }

  public getState(): SyntrophosState {
    return this.state;
  }

  public subscribe(listener: (state: SyntrophosState) => void): () => void {
    this.listeners.add(listener);
    // Emit current state immediately to the subscriber
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.persistence.save(this.state);
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (err) {
        console.error('[Syntrophos Store] Listener error:', err);
      }
    }
  }

  // --- ORB & SYSTEM STATE ---
  public setOrbState(orbState: OrbState): void {
    if (this.state.orbState === orbState) return;
    this.state = {
      ...this.state,
      orbState,
    };
    this.notify();
  }

  // --- TASKS ---
  public addTask(title: string, priority: 'low' | 'medium' | 'high' = 'medium', dueTime?: string): DemoTask {
    const newTask: DemoTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      completed: false,
      priority,
      dueTime: dueTime || 'Today',
      createdAt: new Date().toISOString(),
    };

    this.state = {
      ...this.state,
      tasks: [newTask, ...this.state.tasks],
    };
    this.addActivity('Task created', `"${title}" added to task list`, 'task');
    this.notify();
    return newTask;
  }

  public toggleTask(taskId: string): void {
    let toggledTaskTitle = '';
    let isNowCompleted = false;

    this.state = {
      ...this.state,
      tasks: this.state.tasks.map((t) => {
        if (t.id === taskId) {
          toggledTaskTitle = t.title;
          isNowCompleted = !t.completed;
          return {
            ...t,
            completed: isNowCompleted,
            completedAt: isNowCompleted ? new Date().toISOString() : undefined,
          };
        }
        return t;
      }),
    };

    if (toggledTaskTitle) {
      this.addActivity(
        isNowCompleted ? 'Task completed' : 'Task reopened',
        `"${toggledTaskTitle}" marked as ${isNowCompleted ? 'complete' : 'pending'}`,
        'task'
      );
    }
    this.notify();
  }

  public deleteTask(taskId: string): void {
    this.state = {
      ...this.state,
      tasks: this.state.tasks.filter((t) => t.id !== taskId),
    };
    this.notify();
  }

  // --- REMINDERS ---
  public addReminder(title: string, targetTime: string, dueTimestamp?: number): ScheduledReminder {
    const reminder: ScheduledReminder = {
      id: `rem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      targetTime,
      dueTimestamp: dueTimestamp ?? Date.now() + 60000,
      triggered: false,
      createdAt: new Date().toISOString(),
    };

    this.state = {
      ...this.state,
      reminders: [reminder, ...this.state.reminders],
    };
    this.addActivity('Reminder scheduled', `"${title}" scheduled for ${targetTime}`, 'reminder');
    this.notify();
    return reminder;
  }

  public markReminderTriggered(reminderId: string): void {
    this.state = {
      ...this.state,
      reminders: this.state.reminders.map((r) =>
        r.id === reminderId ? { ...r, triggered: true } : r
      ),
    };
    this.notify();
  }

  // --- ACTIVITY FEED ---
  public addActivity(
    title: string,
    detail?: string,
    type: ActivityEvent['type'] = 'system'
  ): ActivityEvent {
    const event: ActivityEvent = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      time: formatCurrentTime(),
      timestamp: Date.now(),
      title,
      detail,
      type,
    };

    this.state = {
      ...this.state,
      activity: [event, ...this.state.activity.slice(0, 49)], // Cap at 50 recent events
    };
    this.notify();
    return event;
  }

  // --- NOTIFICATIONS ---
  public addNotification(
    message: string,
    priority: DemoNotification['priority'] = 'medium',
    category: DemoNotification['category'] = 'system',
    source: DemoNotification['source'] = 'Syntrophos Core',
    targetDevice: DemoNotification['targetDevice'] = 'Laptop'
  ): DemoNotification {
    const notif: DemoNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      message,
      priority,
      category,
      timestamp: formatCurrentTime(),
      read: false,
      source,
      targetDevice,
    };

    this.state = {
      ...this.state,
      notifications: [notif, ...this.state.notifications],
    };
    this.notify();
    return notif;
  }

  public markNotificationRead(notifId: string): void {
    this.state = {
      ...this.state,
      notifications: this.state.notifications.map((n) =>
        n.id === notifId ? { ...n, read: true } : n
      ),
    };
    this.notify();
  }

  public markAllNotificationsRead(): void {
    this.state = {
      ...this.state,
      notifications: this.state.notifications.map((n) => ({ ...n, read: true })),
    };
    this.notify();
  }

  public clearNotifications(): void {
    this.state = {
      ...this.state,
      notifications: [],
    };
    this.notify();
  }

  // --- MONITORS ---
  public addMonitor(name: string, target: string, description: string): ActiveMonitor {
    const existing = this.state.monitors.find(
      (m) => m.name.toLowerCase() === name.toLowerCase() || m.target.toLowerCase() === target.toLowerCase()
    );
    if (existing) {
      return existing;
    }

    const monitor: ActiveMonitor = {
      id: `mon-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      target,
      status: 'active',
      lastChecked: 'Just now',
      findingsCount: 0,
      description,
    };

    this.state = {
      ...this.state,
      monitors: [monitor, ...this.state.monitors],
    };
    this.addActivity('Monitor activated', `Autonomous watch established on: ${target}`, 'monitor');
    this.notify();
    return monitor;
  }

  public updateMonitorCheck(monitorId: string, findingsCount = 0): void {
    this.state = {
      ...this.state,
      monitors: this.state.monitors.map((m) =>
        m.id === monitorId ? { ...m, lastChecked: 'Just now', findingsCount } : m
      ),
    };
    this.notify();
  }

  // --- RESET DEMO ---
  public resetToDefault(): void {
    this.persistence.clear();
    this.state = getInitialState();
    this.notify();
  }
}

// Global Singleton Instance
export const demoStore = new SyntrophosDemoStore();
