/**
 * Syntrophos Autonomous Engine (Demo Scheduler & Background Watcher)
 * 
 * NOTE: This is a client-side demo runner executing while the browser tab is open.
 * In a full production deployment, this scheduler runs via backend server workers,
 * cron jobs, Supabase Edge Functions, or message queues.
 * 
 * Responsibilities:
 * 1. Periodic check of scheduled reminders.
 * 2. Periodic heartbeat / simulated delta checks from active monitors.
 * 3. Autonomous dispatch of notifications and activity feed logs.
 */

import { demoStore } from './syntrophosDemoStore.js';
import { notificationService } from './notificationService.js';

export interface AutonomousEngineStatus {
  isRunning: boolean;
  activeMonitorsCount: number;
  lastHeartbeat: string;
}

export class SyntrophosAutonomousEngine {
  private timerId: ReturnType<typeof setInterval> | null = null;
  private monitorCycleCount = 0;

  public start(): void {
    if (this.timerId) return;

    // Run scheduler check every 15 seconds
    this.timerId = setInterval(() => {
      this.tick();
    }, 15000);

    // Initial tick on start
    setTimeout(() => this.tick(), 1500);
  }

  public stop(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  public getStatus(): AutonomousEngineStatus {
    const state = demoStore.getState();
    return {
      isRunning: this.timerId !== null,
      activeMonitorsCount: state.monitors.filter((m) => m.status === 'active').length,
      lastHeartbeat: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }

  private tick(): void {
    this.monitorCycleCount++;
    const state = demoStore.getState();
    const now = Date.now();

    // 1. Check scheduled reminders
    for (const reminder of state.reminders) {
      if (!reminder.triggered && reminder.dueTimestamp <= now + 30000) {
        // Due now or soon!
        demoStore.markReminderTriggered(reminder.id);
        notificationService.dispatch({
          message: `🔔 Due Now: ${reminder.title} (${reminder.targetTime})`,
          priority: 'urgent',
          category: 'reminder',
          source: 'Scheduler',
          targetDevice: 'Laptop',
          browserAlert: true,
        });
        demoStore.addActivity(
          'Reminder triggered',
          `Autonomous alert dispatched for "${reminder.title}"`,
          'reminder'
        );
      }
    }

    // 2. Heartbeat on active monitors (every ~45 seconds)
    if (this.monitorCycleCount % 3 === 0) {
      const activeMonitors = state.monitors.filter((m) => m.status === 'active');
      for (const monitor of activeMonitors) {
        demoStore.updateMonitorCheck(monitor.id, monitor.findingsCount);
      }

      // Occasionally emit a subtle autonomous telemetry notification
      if (this.monitorCycleCount % 9 === 0 && activeMonitors.length > 0) {
        const randomMonitor = activeMonitors[0];
        if (randomMonitor) {
          demoStore.addActivity(
            'Monitor heartbeat',
            `${randomMonitor.name}: Verified target [${randomMonitor.target}]. All signals green.`,
            'monitor'
          );
        }
      }
    }
  }
}

export const autonomousEngine = new SyntrophosAutonomousEngine();
