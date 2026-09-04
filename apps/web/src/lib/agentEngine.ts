/**
 * Syntrophos Agent Engine
 * 
 * Orchestrates natural language command parsing, intent extraction,
 * real internal state mutation in SyntrophosDemoStore, and state machine transitions:
 * IDLE -> LISTENING -> THINKING -> ACTING -> IDLE
 * 
 * Structured to allow dropping in an LLM / Autonomous Agent API backend in the future.
 */

import { demoStore, type OrbState } from './syntrophosDemoStore.js';
import { notificationService } from './notificationService.js';

export interface AgentResponse {
  readonly text: string;
  readonly actionSummary?: string;
  readonly state: OrbState;
}

export class SyntrophosAgentEngine {
  /**
   * Processes a natural-language prompt from the user.
   * Produces real state mutations and returns an intelligent response.
   */
  public async processCommand(rawInput: string): Promise<AgentResponse> {
    const prompt = rawInput.trim();
    if (!prompt) {
      return {
        text: 'I am standing by. How can I assist you?',
        state: 'IDLE',
      };
    }

    const lower = prompt.toLowerCase();

    // 1. Enter THINKING state
    demoStore.setOrbState('THINKING');
    await new Promise((res) => setTimeout(res, 450));

    // --- INTENT 1: REMINDER ---
    // e.g. "Remind me to study at 8 PM", "Remind me to call John at 5:30", "Set a reminder to drink water"
    if (lower.includes('remind') || lower.includes('reminder')) {
      demoStore.setOrbState('ACTING');

      // Extract subject and time
      let targetTime = '20:00';
      let subject = 'study session';

      const timeMatch = prompt.match(/at\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM)?|\d{1,2}:\d{2})/i);
      if (timeMatch && timeMatch[1]) {
        targetTime = timeMatch[1].toUpperCase();
      }

      const cleanSubjectMatch = prompt.match(/remind\s+(?:me\s+)?(?:to\s+)?(.+?)(?:\s+at\s+.*|\s*$)/i);
      if (cleanSubjectMatch && cleanSubjectMatch[1]) {
        subject = cleanSubjectMatch[1].trim();
      }

      const formattedTitle = subject.charAt(0).toUpperCase() + subject.slice(1);
      const reminder = demoStore.addReminder(formattedTitle, targetTime);

      // Dispatch notification to user
      notificationService.dispatch({
        message: `Reminder scheduled — "${formattedTitle}" at ${targetTime}`,
        priority: 'high',
        category: 'reminder',
        source: 'Scheduler',
        targetDevice: 'Laptop',
      });

      await new Promise((res) => setTimeout(res, 400));
      demoStore.setOrbState('IDLE');

      return {
        text: `Understood. I have scheduled a reminder for "${formattedTitle}" at ${targetTime}. I will notify you across your active devices when the time arrives.`,
        actionSummary: `Reminder created: [${reminder.title} at ${reminder.targetTime}]`,
        state: 'IDLE',
      };
    }

    // --- INTENT 2: SCHEDULE / PLAN QUERY ---
    // e.g. "What do I have planned today?", "What are my tasks today?", "Show my schedule"
    if (
      lower.includes('planned today') ||
      lower.includes('schedule') ||
      lower.includes('my plan') ||
      lower.includes('what do i have') ||
      lower.includes('agenda')
    ) {
      demoStore.setOrbState('ACTING');
      const state = demoStore.getState();
      const pendingTasks = state.tasks.filter((t) => !t.completed);
      const completedTasks = state.tasks.filter((t) => t.completed);
      const upcomingReminders = state.reminders.filter((r) => !r.triggered);

      demoStore.addActivity(
        'Schedule queried',
        `Assessed ${pendingTasks.length} pending tasks & ${upcomingReminders.length} scheduled reminders`,
        'agent'
      );

      await new Promise((res) => setTimeout(res, 350));
      demoStore.setOrbState('IDLE');

      let summary = `You have ${pendingTasks.length} pending task${pendingTasks.length === 1 ? '' : 's'}`;
      if (pendingTasks.length > 0) {
        summary += `: ${pendingTasks.map((t) => `"${t.title}"`).join(', ')}.`;
      } else {
        summary += ` — your queue is clear.`;
      }

      if (upcomingReminders.length > 0) {
        summary += ` Additionally, you have ${upcomingReminders.length} scheduled reminder${
          upcomingReminders.length === 1 ? '' : 's'
        } (${upcomingReminders.map((r) => `${r.title} at ${r.targetTime}`).join(', ')}).`;
      }

      if (completedTasks.length > 0) {
        summary += ` You have already completed ${completedTasks.length} item today.`;
      }

      return {
        text: summary,
        actionSummary: `Agenda synthesized: ${pendingTasks.length} pending, ${completedTasks.length} completed.`,
        state: 'IDLE',
      };
    }

    // --- INTENT 3: TASK CREATION ---
    // e.g. "Create a task to finish the project", "Add task buy milk", "New task: write tests"
    if (lower.includes('create a task') || lower.includes('add task') || lower.includes('new task') || lower.startsWith('task:')) {
      demoStore.setOrbState('ACTING');

      let taskTitle = 'Finish project deliverables';
      const taskMatch = prompt.match(/(?:create\s+(?:a\s+)?task\s+(?:to\s+)?|add\s+task\s+|new\s+task\s*:?\s*)(.+)/i);
      if (taskMatch && taskMatch[1]) {
        taskTitle = taskMatch[1].trim();
      }

      const formattedTitle = taskTitle.charAt(0).toUpperCase() + taskTitle.slice(1);
      const newTask = demoStore.addTask(formattedTitle, 'high', 'Today');

      notificationService.dispatch({
        message: `Task queued: "${formattedTitle}" added to TODAY`,
        priority: 'medium',
        category: 'task',
        source: 'Syntrophos Core',
        targetDevice: 'Laptop',
      });

      await new Promise((res) => setTimeout(res, 400));
      demoStore.setOrbState('IDLE');

      return {
        text: `Task created. I have added "${formattedTitle}" to your active TODAY queue with high priority.`,
        actionSummary: `Task added to store: [${newTask.title}]`,
        state: 'IDLE',
      };
    }

    // --- INTENT 4: ACTIVITY QUERY ---
    // e.g. "Show me what changed today", "What happened today?", "Recent activity"
    if (
      lower.includes('what changed') ||
      lower.includes('recent activity') ||
      lower.includes('activity log') ||
      lower.includes('what happened')
    ) {
      demoStore.setOrbState('ACTING');
      const state = demoStore.getState();
      const recent = state.activity.slice(0, 4);

      demoStore.addActivity('Activity summary requested', 'Telemetry history analyzed', 'agent');
      await new Promise((res) => setTimeout(res, 350));
      demoStore.setOrbState('IDLE');

      if (recent.length === 0) {
        return {
          text: 'No state modifications have been recorded yet today. All subsystems are quiet.',
          state: 'IDLE',
        };
      }

      const bulletPoints = recent.map((a) => `${a.time} — ${a.title} (${a.detail || 'nominal'})`).join('. ');

      return {
        text: `Here is what changed today: ${bulletPoints}. All autonomous monitors report steady state.`,
        actionSummary: `Reported ${recent.length} recent activity events`,
        state: 'IDLE',
      };
    }

    // --- INTENT 5: MONITORING ---
    // e.g. "Watch my project for changes", "Monitor repository", "Enable watch mode"
    if (
      lower.includes('watch') ||
      lower.includes('monitor') ||
      lower.includes('track changes')
    ) {
      demoStore.setOrbState('ACTING');

      let target = 'Project Repository & Build Tree';
      if (lower.includes('file') || lower.includes('code')) {
        target = 'Local File System & Git Diff';
      }

      const monitor = demoStore.addMonitor(
        'Project Delta Watcher',
        target,
        'Continuous observation for git diffs, pipeline changes, and dependency vulnerabilities'
      );

      notificationService.dispatch({
        message: `Autonomous monitor armed: Watching ${target}`,
        priority: 'high',
        category: 'monitor',
        source: 'Project Watcher',
        targetDevice: 'Laptop',
      });

      await new Promise((res) => setTimeout(res, 450));
      demoStore.setOrbState('IDLE');

      return {
        text: `Autonomous monitor armed. I am now watching "${target}" for modifications, build shifts, and anomalies. I will notify you immediately if updates occur.`,
        actionSummary: `Active monitor registered: [${monitor.name}]`,
        state: 'IDLE',
      };
    }

    // --- CONVERSATIONAL / GENERAL FALLBACK ---
    demoStore.setOrbState('ACTING');
    demoStore.addActivity('Response generated', `Parsed query: "${prompt.slice(0, 32)}..."`, 'agent');

    await new Promise((res) => setTimeout(res, 500));
    demoStore.setOrbState('IDLE');

    return {
      text: `I've received your request: "${prompt}". I can schedule reminders, manage tasks, coordinate monitors, or track your workspace changes.`,
      actionSummary: `Processed request: "${prompt.slice(0, 40)}"`,
      state: 'IDLE',
    };
  }
}

export const agentEngine = new SyntrophosAgentEngine();
