import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/primitives.js';
import {
  getOnboardingState,
  toggleStepCompleted,
  getOnboardingProgress,
} from '@/lib/services/onboarding.js';
import {
  IconCore,
  IconDashboard,
  IconMail,
  IconChat,
  IconTasks,
  IconFolder,
  IconCalendar,
  IconBot,
  IconGraph,
  IconSettings,
  IconCheckCircle,
} from '@/lib/icons.js';

export default function HelpPage() {
  const navigate = useNavigate();
  const [onboardingState, setOnboardingState] = useState(getOnboardingState());

  const handleToggleStep = (stepId: string) => {
    const next = toggleStepCompleted(stepId);
    setOnboardingState(next);
  };

  const progress = getOnboardingProgress();

  const guidedSteps = [
    {
      id: 'step-1',
      num: '01',
      title: 'SET UP YOUR WORKSPACE',
      desc: 'Choose Personal or Business mode and configure your workspace permissions.',
      actionLabel: 'Open settings',
      route: '/settings',
    },
    {
      id: 'step-2',
      num: '02',
      title: 'CONNECT YOUR CONTEXT',
      desc: 'Connect the notes, files, and sources Syntrophos will use to build your context graph.',
      actionLabel: 'View knowledge matrix',
      route: '/knowledge',
    },
    {
      id: 'step-3',
      num: '03',
      title: 'CREATE YOUR FIRST TASK',
      desc: 'Use Tasks or Core to give Syntrophos something structured to work on.',
      actionLabel: 'Open tasks',
      route: '/tasks',
    },
    {
      id: 'step-4',
      num: '04',
      title: 'MEET YOUR AGENTS',
      desc: 'Understand what specialized Planner and Researcher agents can execute.',
      actionLabel: 'View intelligence',
      route: '/intelligence',
    },
    {
      id: 'step-5',
      num: '05',
      title: 'BUILD A WORKFLOW',
      desc: 'Combine agents and actions into natural language repeatable processes.',
      actionLabel: 'Open workflows',
      route: '/workflows',
    },
    {
      id: 'step-6',
      num: '06',
      title: 'EXPLORE KNOWLEDGE',
      desc: 'Understand how Syntrophos tracks knowledge provenance and telemetry.',
      actionLabel: 'Explore knowledge',
      route: '/knowledge',
    },
  ];

  const modules = [
    { icon: IconCore, title: 'Syntrophos Core', desc: '3D spatial orbital representation of system memory and neural telemetry.', route: '/core' },
    { icon: IconDashboard, title: 'Dashboard', desc: 'Unified overview of active agent runs, urgent inbox tasks, and state metrics.', route: '/dashboard' },
    { icon: IconMail, title: 'Inbox', desc: 'Centralized attention layer for human communications and agent approvals.', route: '/inbox' },
    { icon: IconChat, title: 'Chat & Reason', desc: 'Context-aware conversational interface connected to your workspace graph.', route: '/chat' },
    { icon: IconTasks, title: 'Tasks', desc: 'Turn intentions and agent outputs into structured, trackable execution.', route: '/tasks' },
    { icon: IconFolder, title: 'Projects', desc: 'Connect tasks, notes, calendar meetings, agents, and progress in one view.', route: '/projects' },
    { icon: IconCalendar, title: 'People & Schedule', desc: 'Consolidated workspace for contacts, meetings, and calendar events.', route: '/calendar' },
    { icon: IconBot, title: 'Agents & Workflows', desc: 'Autonomous AI operators and natural language automation routines.', route: '/intelligence' },
    { icon: IconGraph, title: 'Knowledge Matrix', desc: 'Source provenance, usage telemetry, and connected workspace intelligence.', route: '/knowledge' },
    { icon: IconSettings, title: 'Settings', desc: 'Configure LLM providers, workspace mode, voice, and system integrations.', route: '/settings' },
  ];

  return (
    <div className="workspace-container" style={{ display: 'flex', flexDirection: 'column', gap: 40, padding: '32px 40px', maxWidth: 1200, margin: '0 auto' }}>
      {/* PAGE HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: 24, flexWrap: 'wrap', gap: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--color-primary-500)', fontWeight: 'bold', fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', marginBottom: 4 }}>
            DOCUMENTATION &amp; ONBOARDING CENTER
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Help &amp; Getting Started</h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
            Understand how Syntrophos unifies context, intelligence, and execution across your workspace.
          </p>
        </div>

        {/* LIGHTWEIGHT PROGRESS BAR */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8, minWidth: 260 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>GETTING STARTED</span>
            <span style={{ color: 'var(--color-primary-500)', fontWeight: 'bold' }}>{progress.completed} / {progress.total} COMPLETED</span>
          </div>
          <div style={{ width: '100%', height: 6, background: 'rgba(255, 170, 48, 0.15)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${progress.percentage}%`, height: '100%', background: 'var(--color-primary-500)', transition: 'width 0.3s ease' }} />
          </div>
        </div>
      </div>

      {/* GUIDED SEQUENCE (6 CORE STEPS) */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--color-primary-500)', fontWeight: 'bold', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
            GUIDED ONBOARDING SEQUENCE //
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Recommended Steps</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {guidedSteps.map((step) => {
            const isCompleted = onboardingState.completedSteps.includes(step.id);
            return (
              <div
                key={step.id}
                style={{
                  background: 'var(--color-surface)',
                  border: isCompleted ? '1px solid var(--color-primary-500)' : '1px solid var(--color-border)',
                  borderRadius: 8,
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 12, color: 'var(--color-primary-500)', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
                    STEP {step.num}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleStep(step.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: isCompleted ? '#34d399' : 'var(--color-text-subtle)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 11,
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    <IconCheckCircle width={16} height={16} />
                    <span>{isCompleted ? 'Completed' : 'Mark done'}</span>
                  </button>
                </div>

                <div>
                  <div style={{ fontSize: 16, fontWeight: 'bold', color: 'var(--color-text)' }}>{step.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.5, marginTop: 4 }}>{step.desc}</div>
                </div>

                <div style={{ paddingTop: 8 }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(step.route)}
                    style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}
                  >
                    {step.actionLabel} &rarr;
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SYSTEM MODULES DOCUMENTATION */}
      <section style={{ borderTop: '1px solid var(--color-border)', paddingTop: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--color-primary-500)', fontWeight: 'bold', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
            SYSTEM MODULES //
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Working with Syntrophos</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {modules.map((m) => {
            const IconComp = m.icon;
            return (
              <div
                key={m.title}
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ color: 'var(--color-primary-500)' }}>
                    <IconComp width={22} height={22} />
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 'bold' }}>{m.title}</div>
                </div>

                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                  {m.desc}
                </div>

                <div style={{ marginTop: 'auto', paddingTop: 8 }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(m.route)}
                    style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}
                  >
                    Open module &rarr;
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
