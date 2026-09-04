/**
 * Syntrophos Notification Service
 * Abstraction layer for multi-device notifications.
 * 
 * Supports:
 * - In-App Notification Center & Toasts (Always active)
 * - Browser Web Notification API (Opt-in upon user gesture)
 * - Prepared for future Web Push / Service Worker / Multi-device dispatch (Laptop, Phone, Email, Slack, WhatsApp)
 */

import { demoStore, type DemoNotification } from './syntrophosDemoStore.js';

export interface DispatchNotificationOptions {
  message: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: 'reminder' | 'monitor' | 'task' | 'system';
  source?: 'Syntrophos Core' | 'Project Watcher' | 'Scheduler' | 'Autonomous Agent';
  targetDevice?: 'Laptop' | 'Phone' | 'Email' | 'Slack' | 'WhatsApp';
  /** If true, attempts to trigger the browser Notification API if permission was granted */
  browserAlert?: boolean;
}

export class NotificationService {
  private hasBrowserSupport: boolean;

  constructor() {
    this.hasBrowserSupport = typeof window !== 'undefined' && 'Notification' in window;
  }

  /**
   * Current permission status: 'default' | 'granted' | 'denied' | 'unsupported'
   */
  public getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (!this.hasBrowserSupport) return 'unsupported';
    return Notification.permission;
  }

  /**
   * Request browser notification permissions.
   * MUST be triggered by user action (e.g. clicking notification bell or toggle).
   */
  public async requestBrowserPermission(): Promise<boolean> {
    if (!this.hasBrowserSupport) return false;
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.dispatch({
          message: 'Browser notifications enabled for Syntrophos',
          priority: 'low',
          category: 'system',
          source: 'Syntrophos Core',
          targetDevice: 'Laptop',
          browserAlert: true,
        });
        return true;
      }
      return false;
    } catch (err) {
      console.warn('[Syntrophos Notification] Permission request failed:', err);
      return false;
    }
  }

  /**
   * Dispatches a notification into the central store and optionally triggers
   * a native browser notification if granted.
   */
  public dispatch(options: DispatchNotificationOptions): DemoNotification {
    const {
      message,
      priority = 'medium',
      category = 'system',
      source = 'Syntrophos Core',
      targetDevice = 'Laptop',
      browserAlert = true,
    } = options;

    // 1. Commit to central store (In-app notification)
    const notif = demoStore.addNotification(message, priority, category, source, targetDevice);

    // 2. Trigger native browser notification if allowed
    if (browserAlert && this.hasBrowserSupport && Notification.permission === 'granted') {
      try {
        const title = `Syntrophos // ${source}`;
        const nativeNotif = new Notification(title, {
          body: message,
          icon: '/favicon.ico',
          tag: notif.id,
          silent: priority === 'low',
        });

        nativeNotif.onclick = () => {
          window.focus();
          demoStore.markNotificationRead(notif.id);
        };
      } catch (err) {
        console.warn('[Syntrophos Notification] Native notification failed:', err);
      }
    }

    return notif;
  }
}

export const notificationService = new NotificationService();
