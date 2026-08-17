import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader.js';
import { Badge, Button, Input } from '@/components/ui/primitives.js';
import { ErrorState, EmptyState } from '@/components/ui/states.js';
import {
  IconWorkflow,
  IconPlus,
  IconSearch,
  IconZap,
  IconBot,
  IconCheckCircle,
  IconX,
  IconPlay,
  IconPause,
  IconChevronRight,
  IconCalendar,
  IconMail,
  IconTasks,
  IconNotes,
} from '@/lib/icons.js';

export type WorkflowStatus = 'ACTIVE' | 'PAUSED' | 'RUNNING' | 'NEEDS_APPROVAL' | 'FAILED';

export type WorkflowStep = {
  readonly id: string;
  readonly type: 'TRIGGER' | 'AGENT' | 'CONDITION' | 'ACTION' | 'APPROVAL';
  readonly title: string;
  readonly description: string;
  readonly agentName?: string;
};

export type WorkflowRunHistory = {
  readonly id: string;
  readonly timestamp: string;
  readonly status: 'SUCCESS' | 'NEEDS_APPROVAL' | 'FAILED';
  readonly summary: string;
  readonly duration?: string;
};

export type Workflow = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly status: WorkflowStatus;
  readonly triggerText: string;
  readonly lastRunText: string;
  readonly totalRuns: number;
  readonly successfulRuns: number;
  readonly steps: readonly WorkflowStep[];
  readonly runsHistory: readonly WorkflowRunHistory[];
};

const MOCK_WORKFLOWS: Workflow[] = [
  {
    id: 'wf-1',
    name: 'Client Follow-Up & Task Allocation',
    description: 'When a new client email arrives, research context, generate a follow-up plan, and request operator approval before sending.',
    status: 'ACTIVE',
    triggerText: 'When a new client email arrives',
    lastRunText: 'Last run 2h ago',
    totalRuns: 24,
    successfulRuns: 22,
    steps: [
      { id: 's1', type: 'TRIGGER', title: 'New Client Email Received', description: 'Source: Email / Inbox stream' },
      { id: 's2', type: 'AGENT', title: 'Analyze Client Context', description: 'Inputs: Email body + Knowledge Vault notes', agentName: 'Researcher Agent' },
      { id: 's3', type: 'AGENT', title: 'Prepare Follow-Up Plan', description: 'Outputs: Draft email + 2 proposed tasks', agentName: 'Planner Agent' },
      { id: 's4', type: 'APPROVAL', title: 'Ask Operator Approval', description: 'Pause execution until human confirmation' },
      { id: 's5', type: 'ACTION', title: 'Dispatch Response & Create Tasks', description: 'Execute approved actions in workspace' },
    ],
    runsHistory: [
      { id: 'r-1', timestamp: '09:42 AM', status: 'SUCCESS', summary: 'Email from Sarah Chen → Researcher analyzed → 2 tasks created', duration: '1.4s' },
      { id: 'r-2', timestamp: '08:15 AM', status: 'NEEDS_APPROVAL', summary: 'Email from Jordan Vance → Draft generated → Awaiting approval', duration: '0.8s' },
      { id: 'r-3', timestamp: 'Yesterday', status: 'SUCCESS', summary: 'Client inquiry processed → Follow-up dispatched', duration: '1.1s' },
    ],
  },
  {
    id: 'wf-2',
    name: 'Daily Planning & Context Digest',
    description: 'Every morning at 08:00 AM, scan calendar conflicts, overdue tasks, and generate an executive summary digest in Inbox.',
    status: 'ACTIVE',
    triggerText: 'Schedule: 08:00 AM daily',
    lastRunText: 'Last run 14h ago',
    totalRuns: 62,
    successfulRuns: 60,
    steps: [
      { id: 's1', type: 'TRIGGER', title: 'Schedule: 08:00 AM Daily', description: 'Cron trigger' },
      { id: 's2', type: 'AGENT', title: 'Scan Calendar & Workspace Tasks', description: 'Pulls today tasks & event overlaps', agentName: 'Planner Agent' },
      { id: 's3', type: 'ACTION', title: 'Generate Executive Summary Note', description: 'Create markdown digest in /notes/daily/' },
      { id: 's4', type: 'ACTION', title: 'Notify Operator Inbox', description: 'Post summary item in Inbox' },
    ],
    runsHistory: [
      { id: 'r-1', timestamp: '08:00 AM Today', status: 'SUCCESS', summary: 'Daily digest generated (5 tasks, 2 meetings indexed)', duration: '2.1s' },
      { id: 'r-2', timestamp: '08:00 AM Yesterday', status: 'SUCCESS', summary: 'Daily digest generated', duration: '1.9s' },
    ],
  },
  {
    id: 'wf-3',
    name: 'Weekly Knowledge Vault Cleanup',
    description: 'Every Sunday at 00:00, index unlinked notes, build cross-vault backlinks, and summarize knowledge graph growth.',
    status: 'ACTIVE',
    triggerText: 'Schedule: Sunday 00:00',
    lastRunText: 'Last run 1d ago',
    totalRuns: 14,
    successfulRuns: 14,
    steps: [
      { id: 's1', type: 'TRIGGER', title: 'Schedule: Sunday 00:00', description: 'Weekly cron trigger' },
      { id: 's2', type: 'AGENT', title: 'Audit Vault Graph', description: 'Scans for orphaned markdown notes', agentName: 'Memory Curator' },
      { id: 's3', type: 'ACTION', title: 'Generate Cross-Vault Backlinks', description: 'Auto-link semantic topics' },
    ],
    runsHistory: [
      { id: 'r-1', timestamp: 'Sunday 00:00', status: 'SUCCESS', summary: '12 notes indexed, 8 backlinks established', duration: '4.2s' },
    ],
  },
  {
    id: 'wf-4',
    name: 'Meeting Preparation & Context Brief',
    description: '15 minutes before any calendar event, research attendees, pull past meeting notes, and prepare a 1-page briefing note.',
    status: 'PAUSED',
    triggerText: 'When a calendar event approaches (< 15m)',
    lastRunText: 'Last run 3d ago',
    totalRuns: 8,
    successfulRuns: 7,
    steps: [
      { id: 's1', type: 'TRIGGER', title: 'Calendar Event Approaching (< 15m)', description: 'Source: Google Calendar stream' },
      { id: 's2', type: 'AGENT', title: 'Pull Attendee & Topic Context', description: 'Scans past notes & chat threads', agentName: 'Researcher Agent' },
      { id: 's3', type: 'ACTION', title: 'Generate Briefing Note', description: 'Saves note to /notes/meetings/' },
    ],
    runsHistory: [
      { id: 'r-1', timestamp: '3d ago', status: 'SUCCESS', summary: 'Briefing generated for Q3 Launch Review', duration: '1.6s' },
    ],
  },
];

const TEMPLATES = [
  {
    name: 'Client Follow-Up',
    description: 'Automatically research incoming client inquiries, draft follow-up tasks, and request approval before sending.',
    prompt: 'When a client sends an email, research the client, summarize the request, create a task, and ask me before sending a response.',
  },
  {
    name: 'Daily Planning Digest',
    description: 'Schedule an 08:00 AM daily scan of calendar conflicts and task priorities to post an executive summary in Inbox.',
    prompt: 'Every morning at 08:00 AM, scan calendar events and overdue tasks, create a daily planning note, and notify my inbox.',
  },
  {
    name: 'Meeting Preparation',
    description: '15 minutes before any meeting, pull participant context and create a concise briefing note.',
    prompt: '15 minutes before a calendar meeting, research participants and topic history, then generate a meeting briefing note.',
  },
  {
    name: 'Weekly Knowledge Cleanup',
    description: 'Index unlinked markdown notes every Sunday and auto-link cross-vault topics.',
    prompt: 'Every Sunday at 00:00, index unlinked vault notes, generate cross-topic backlinks, and summarize graph updates.',
  },
  {
    name: 'Task Triage & Assignment',
    description: 'When high-priority tasks are created, assign to appropriate agent for breakdown and estimates.',
    prompt: 'When a high-priority task is created, dispatch Planner Agent to generate subtasks and time estimates.',
  },
];

export default function WorkflowsPage({ embedInWorkspace = false }: { readonly embedInWorkspace?: boolean }) {
  const [workflows, setWorkflows] = useState<Workflow[]>(MOCK_WORKFLOWS);
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'attention'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);

  // Builder Prompt State
  const [builderPrompt, setBuilderPrompt] = useState('');

  const filteredWorkflows = useMemo(() => {
    return workflows.filter((w) => {
      if (filter === 'active' && w.status !== 'ACTIVE') return false;
      if (filter === 'paused' && w.status !== 'PAUSED') return false;
      if (filter === 'attention' && w.status !== 'NEEDS_APPROVAL') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = w.name.toLowerCase().includes(q);
        const triggerMatch = w.triggerText.toLowerCase().includes(q);
        if (!nameMatch && !triggerMatch) return false;
      }
      return true;
    });
  }, [workflows, filter, searchQuery]);

  const toggleWorkflowStatus = (id: string) => {
    setWorkflows((cur) =>
      cur.map((w) => {
        if (w.id !== id) return w;
        const nextStatus: WorkflowStatus = w.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
        return { ...w, status: nextStatus };
      })
    );
  };

  const handleUseTemplate = (prompt: string) => {
    setBuilderPrompt(prompt);
    setIsTemplatesOpen(false);
    setIsBuilderOpen(true);
  };

  const handleSaveNewWorkflow = (newWf: Workflow) => {
    setWorkflows((prev) => [newWf, ...prev]);
    setIsBuilderOpen(false);
    setBuilderPrompt('');
  };

  return (
    <div className="shell-page shell-page--wide" style={{ background: '#000000', color: '#ffcc66', minHeight: embedInWorkspace ? 'auto' : '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-sans)' }}>
      {/* 1. COMPACT PAGE HEADER */}
      {!embedInWorkspace && (
        <PageHeader
          variant="wide"
          icon={<IconWorkflow width={22} height={22} />}
          title="WORKFLOWS // AUTOMATION & AGENT EXECUTION"
          subtitle="Automate recurring work across your workspace."
          actions={[
            {
              id: 'templates',
              label: 'Templates',
              variant: 'ghost',
              onAction: () => setIsTemplatesOpen(true),
            },
            {
              id: 'create',
              label: '+ Create workflow',
              variant: 'primary',
              icon: <IconPlus width={14} height={14} />,
              onAction: () => setIsBuilderOpen(true),
              primary: true,
            },
          ]}
        />
      )}

      <div style={{ padding: '0 24px 24px 24px', display: 'flex', flexDirection: 'column', gap: 20, flex: '1 1 auto' }}>
        {/* 2. FILTER & SEARCH CONTROL BAR */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, borderBottom: '1px solid rgba(255, 170, 48, 0.25)', paddingBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={() => setFilter('all')}
              style={{
                background: filter === 'all' ? 'rgba(120, 60, 0, 0.6)' : 'transparent',
                border: filter === 'all' ? '1px solid rgba(255, 170, 48, 0.6)' : '1px solid transparent',
                color: filter === 'all' ? '#ffcc66' : '#d99a4e',
                borderRadius: 4,
                padding: '6px 14px',
                fontSize: 12,
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              All ({workflows.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('active')}
              style={{
                background: filter === 'active' ? 'rgba(120, 60, 0, 0.6)' : 'transparent',
                border: filter === 'active' ? '1px solid rgba(255, 170, 48, 0.6)' : '1px solid transparent',
                color: filter === 'active' ? '#ffcc66' : '#d99a4e',
                borderRadius: 4,
                padding: '6px 14px',
                fontSize: 12,
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Active ({workflows.filter((w) => w.status === 'ACTIVE').length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('paused')}
              style={{
                background: filter === 'paused' ? 'rgba(120, 60, 0, 0.6)' : 'transparent',
                border: filter === 'paused' ? '1px solid rgba(255, 170, 48, 0.6)' : '1px solid transparent',
                color: filter === 'paused' ? '#ffcc66' : '#d99a4e',
                borderRadius: 4,
                padding: '6px 14px',
                fontSize: 12,
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Paused ({workflows.filter((w) => w.status === 'PAUSED').length})
            </button>
          </div>

          <div style={{ width: 280 }}>
            <Input
              placeholder="Search workflows… (⌘K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leading={<IconSearch width={14} height={14} />}
              style={{ background: 'rgba(20, 10, 2, 0.8)', borderColor: 'rgba(255, 170, 48, 0.3)', color: '#ffcc66', fontSize: 12 }}
            />
          </div>
        </div>

        {/* 3. WORKFLOW OPERATIONAL CARDS GRID */}
        {filteredWorkflows.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <EmptyState
              icon={<IconWorkflow width={36} height={36} />}
              title="NO WORKFLOWS YET"
              description="Automate the repetitive work you don't want to think about twice."
              action={{ label: 'Create workflow', onClick: () => setIsBuilderOpen(true) }}
            />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 16 }}>
            {filteredWorkflows.map((wf) => (
              <WorkflowCard
                key={wf.id}
                workflow={wf}
                onOpen={() => setSelectedWorkflow(wf)}
                onTogglePause={() => toggleWorkflowStatus(wf.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* WORKFLOW BUILDER WORKSPACE MODAL */}
      {isBuilderOpen && (
        <WorkflowBuilderModal
          initialPrompt={builderPrompt}
          onClose={() => setIsBuilderOpen(false)}
          onSave={handleSaveNewWorkflow}
        />
      )}

      {/* TEMPLATES MODAL */}
      {isTemplatesOpen && (
        <WorkflowTemplatesModal
          templates={TEMPLATES}
          onClose={() => setIsTemplatesOpen(false)}
          onSelectTemplate={handleUseTemplate}
        />
      )}

      {/* WORKFLOW DETAIL DRAWER */}
      {selectedWorkflow && (
        <WorkflowDetailDrawer
          workflow={selectedWorkflow}
          onClose={() => setSelectedWorkflow(null)}
          onTogglePause={() => toggleWorkflowStatus(selectedWorkflow.id)}
        />
      )}
    </div>
  );
}

function WorkflowCard({
  workflow,
  onOpen,
  onTogglePause,
}: {
  readonly workflow: Workflow;
  readonly onOpen: () => void;
  readonly onTogglePause: () => void;
}) {
  const isActive = workflow.status === 'ACTIVE';

  return (
    <div
      style={{
        background: 'rgba(12, 6, 1, 0.9)',
        border: '1px solid rgba(255, 170, 48, 0.25)',
        borderRadius: 8,
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        position: 'relative',
        transition: 'all 140ms ease',
      }}
    >
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 'bold', color: '#ffcc66', fontFamily: 'var(--font-sans)', marginBottom: 2 }}>
            {workflow.name}
          </div>
          <div style={{ fontSize: 10, color: '#885522', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
            TRIGGER: {workflow.triggerText}
          </div>
        </div>

        <button
          type="button"
          onClick={onTogglePause}
          style={{
            background: isActive ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255, 170, 48, 0.15)',
            border: isActive ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid rgba(255, 170, 48, 0.4)',
            color: isActive ? '#34d399' : '#ffaa30',
            borderRadius: 4,
            padding: '3px 8px',
            fontSize: 9,
            fontFamily: 'var(--font-mono)',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {isActive ? '● ACTIVE' : '○ PAUSED'}
        </button>
      </div>

      {/* Pipeline Summary Nodes */}
      <div style={{ background: 'rgba(20, 10, 2, 0.8)', border: '1px solid rgba(255, 170, 48, 0.15)', borderRadius: 6, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11, fontFamily: 'var(--font-mono)' }}>
        {workflow.steps.slice(0, 4).map((step, idx) => (
          <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: 8, color: step.type === 'APPROVAL' ? '#ffaa30' : '#ffcc66' }}>
            <span style={{ color: '#885522', width: 14 }}>{idx + 1}.</span>
            <span style={{ color: step.type === 'TRIGGER' ? '#34d399' : step.type === 'APPROVAL' ? '#ffaa30' : '#d99a4e', fontWeight: 'bold' }}>
              [{step.type}]
            </span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{step.title}</span>
          </div>
        ))}
        {workflow.steps.length > 4 && (
          <div style={{ color: '#885522', fontSize: 10 }}>+ {workflow.steps.length - 4} more step(s)</div>
        )}
      </div>

      {/* Footer Run Telemetry */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid rgba(255, 170, 48, 0.15)' }}>
        <div style={{ fontSize: 10, color: '#885522', fontFamily: 'var(--font-mono)' }}>
          {workflow.totalRuns} runs · {workflow.successfulRuns} successful · {workflow.lastRunText}
        </div>

        <button
          type="button"
          onClick={onOpen}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#ffaa30',
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          [ Open → ]
        </button>
      </div>
    </div>
  );
}

function WorkflowBuilderModal({
  initialPrompt,
  onClose,
  onSave,
}: {
  readonly initialPrompt?: string;
  readonly onClose: () => void;
  readonly onSave: (wf: Workflow) => void;
}) {
  const [prompt, setPrompt] = useState(initialPrompt ?? '');
  const [name, setName] = useState('Custom Syntrophos Workflow');
  const [steps, setSteps] = useState<WorkflowStep[]>([
    { id: 'b1', type: 'TRIGGER', title: 'New Event / Message Received', description: 'Triggered when input stream arrives' },
    { id: 'b2', type: 'AGENT', title: 'Analyze Context with Researcher', description: 'Pulls Knowledge Vault links', agentName: 'Researcher Agent' },
    { id: 'b3', type: 'APPROVAL', title: 'Ask Operator Approval', description: 'Requires manual click to dispatch' },
    { id: 'b4', type: 'ACTION', title: 'Create Task & Dispatch Response', description: 'Executes approved actions' },
  ]);

  const handleGenerateFromPrompt = () => {
    if (!prompt.trim()) return;
    setName(`Workflow: ${prompt.slice(0, 32)}…`);
    setSteps([
      { id: 'b1', type: 'TRIGGER', title: 'Natural Language Input Trigger', description: prompt },
      { id: 'b2', type: 'AGENT', title: 'Syntrophos Agent Context Synthesis', description: 'Analyzes intent & dependencies', agentName: 'Planner Agent' },
      { id: 'b3', type: 'ACTION', title: 'Generate Workspace Deliverables', description: 'Creates tasks & notes' },
      { id: 'b4', type: 'APPROVAL', title: 'Request Operator Approval', description: 'Pauses before dispatch' },
    ]);
  };

  const handleSave = () => {
    const newWf: Workflow = {
      id: `wf-${Date.now()}`,
      name: name || 'Custom Automation Workflow',
      description: prompt || 'User-configured automation pipeline.',
      status: 'ACTIVE',
      triggerText: steps[0]?.title ?? 'Manual Trigger',
      lastRunText: 'Never run',
      totalRuns: 0,
      successfulRuns: 0,
      steps,
      runsHistory: [],
    };
    onSave(newWf);
  };

  return (
    <div className="task-modal-overlay" onClick={onClose}>
      <div
        style={{
          width: 780,
          maxWidth: '94vw',
          maxHeight: '90vh',
          background: '#080401',
          border: '1px solid rgba(255, 170, 48, 0.4)',
          borderRadius: 8,
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.9)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'var(--font-sans)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 170, 48, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(14, 7, 1, 0.95)' }}>
          <div style={{ fontSize: 13, fontWeight: 'bold', color: '#ffaa30', letterSpacing: '0.12em', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconZap width={16} height={16} />
            <span>SYNTHROPHOS WORKFLOW BUILDER</span>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#885522', cursor: 'pointer' }}>
            <IconX width={16} height={16} />
          </button>
        </div>

        {/* Builder Content Body */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20, flex: '1 1 auto' }}>
          {/* Natural Language Prompt Surface */}
          <div style={{ background: 'rgba(20, 10, 2, 0.8)', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 6, padding: '14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 10, color: '#ffaa30', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
              DESCRIBE WORKFLOW IN NATURAL LANGUAGE
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. When a client sends an email, research the client, summarize the request, create a task, and ask me before sending a response."
              style={{ width: '100%', background: 'rgba(10, 5, 1, 0.9)', border: '1px solid rgba(255, 170, 48, 0.3)', borderRadius: 4, padding: '10px', color: '#ffcc66', fontSize: 12, fontFamily: 'var(--font-sans)', resize: 'none' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="ghost" size="sm" type="button" onClick={handleGenerateFromPrompt}>
                [ GENERATE FLOW PIPELINE ]
              </Button>
            </div>
          </div>

          {/* Workflow Name */}
          <div>
            <label style={{ display: 'block', fontSize: 10, color: '#885522', marginBottom: 4, fontFamily: 'var(--font-mono)' }}>WORKFLOW NAME</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ background: 'rgba(20, 10, 2, 0.8)', borderColor: 'rgba(255, 170, 48, 0.3)', color: '#ffcc66' }}
            />
          </div>

          {/* Step Pipeline Visualization */}
          <div>
            <div style={{ fontSize: 10, color: '#ffaa30', fontWeight: 'bold', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
              CONFIGURED EXECUTION PIPELINE ({steps.length} STEPS)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {steps.map((st, idx) => (
                <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(16, 8, 2, 0.8)', border: '1px solid rgba(255, 170, 48, 0.2)', borderRadius: 6, padding: '10px 14px' }}>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#885522', width: 20 }}>0{idx + 1}</span>
                  <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 'bold', padding: '2px 6px', borderRadius: 3, background: st.type === 'TRIGGER' ? 'rgba(52, 211, 153, 0.2)' : st.type === 'APPROVAL' ? 'rgba(255, 170, 48, 0.2)' : 'rgba(255, 170, 48, 0.1)', color: st.type === 'TRIGGER' ? '#34d399' : '#ffaa30' }}>
                    {st.type}
                  </span>
                  <div style={{ flex: '1 1 auto' }}>
                    <div style={{ fontSize: 13, fontWeight: 'bold', color: '#ffcc66' }}>{st.title}</div>
                    <div style={{ fontSize: 10, color: '#885522' }}>{st.description}</div>
                  </div>
                  {st.agentName && (
                    <span style={{ fontSize: 9, color: '#ffaa30', fontFamily: 'var(--font-mono)' }}>[{st.agentName}]</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255, 170, 48, 0.3)', display: 'flex', justifyContent: 'flex-end', gap: 10, background: 'rgba(14, 7, 1, 0.95)' }}>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            [ SAVE &amp; ENABLE WORKFLOW ]
          </Button>
        </div>
      </div>
    </div>
  );
}

function WorkflowTemplatesModal({
  templates,
  onClose,
  onSelectTemplate,
}: {
  readonly templates: typeof TEMPLATES;
  readonly onClose: () => void;
  readonly onSelectTemplate: (prompt: string) => void;
}) {
  return (
    <div className="task-modal-overlay" onClick={onClose}>
      <div
        style={{
          width: 640,
          maxWidth: '92vw',
          maxHeight: '85vh',
          background: '#080401',
          border: '1px solid rgba(255, 170, 48, 0.4)',
          borderRadius: 8,
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.9)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'var(--font-sans)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 170, 48, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(14, 7, 1, 0.95)' }}>
          <div style={{ fontSize: 13, fontWeight: 'bold', color: '#ffaa30', letterSpacing: '0.12em', fontFamily: 'var(--font-mono)' }}>
            WORKFLOW TEMPLATES
          </div>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#885522', cursor: 'pointer' }}>
            <IconX width={16} height={16} />
          </button>
        </div>

        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {templates.map((tpl) => (
            <div
              key={tpl.name}
              style={{
                background: 'rgba(20, 10, 2, 0.8)',
                border: '1px solid rgba(255, 170, 48, 0.25)',
                borderRadius: 6,
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 14,
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 'bold', color: '#ffcc66', marginBottom: 2 }}>{tpl.name}</div>
                <div style={{ fontSize: 11, color: '#885522', lineHeight: 1.4 }}>{tpl.description}</div>
              </div>
              <button
                type="button"
                onClick={() => onSelectTemplate(tpl.prompt)}
                style={{
                  background: '#ffaa30',
                  border: 'none',
                  borderRadius: 4,
                  color: '#000000',
                  padding: '6px 12px',
                  fontSize: 10,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                [ USE TEMPLATE ]
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WorkflowDetailDrawer({
  workflow,
  onClose,
  onTogglePause,
}: {
  readonly workflow: Workflow;
  readonly onClose: () => void;
  readonly onTogglePause: () => void;
}) {
  const isActive = workflow.status === 'ACTIVE';

  return (
    <div className="task-detail-drawer" style={{ color: '#ffcc66', fontFamily: 'var(--font-sans)' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 170, 48, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(14, 7, 1, 0.95)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#ffaa30', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
          <IconWorkflow width={14} height={14} />
          <span>WORKFLOW DETAIL // {workflow.id.toUpperCase()}</span>
        </div>
        <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#885522', cursor: 'pointer' }}>
          <IconX width={16} height={16} />
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '20px', flex: '1 1 auto', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: '#ffcc66', marginBottom: 4 }}>{workflow.name}</div>
          <div style={{ fontSize: 12, color: '#885522', lineHeight: 1.5 }}>{workflow.description}</div>
        </div>

        {/* Flow Pipeline */}
        <div>
          <div style={{ fontSize: 10, color: '#ffaa30', fontWeight: 'bold', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
            PIPELINE FLOW ({workflow.steps.length} NODES)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 11 }}>
            {workflow.steps.map((st, i) => (
              <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ffcc66' }}>
                <span style={{ color: '#885522' }}>{i + 1}.</span>
                <span style={{ color: '#ffaa30', fontWeight: 'bold' }}>[{st.type}]</span>
                <span>{st.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Execution History */}
        <div>
          <div style={{ fontSize: 10, color: '#ffaa30', fontWeight: 'bold', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
            RECENT EXECUTION HISTORY
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {workflow.runsHistory.map((rh) => (
              <div key={rh.id} style={{ background: 'rgba(20, 10, 2, 0.7)', border: '1px solid rgba(255, 170, 48, 0.2)', borderRadius: 4, padding: '8px 10px', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ color: rh.status === 'SUCCESS' ? '#34d399' : '#ffaa30', fontWeight: 'bold' }}>● {rh.status}</span>
                  <span style={{ color: '#885522' }}>{rh.timestamp} ({rh.duration ?? '1s'})</span>
                </div>
                <div style={{ color: '#ffcc66' }}>{rh.summary}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255, 170, 48, 0.3)', display: 'flex', gap: 10, background: 'rgba(14, 7, 1, 0.95)' }}>
        <button
          type="button"
          onClick={onTogglePause}
          style={{
            flex: 1,
            background: isActive ? 'rgba(255, 170, 48, 0.15)' : 'rgba(52, 211, 153, 0.15)',
            border: isActive ? '1px solid rgba(255, 170, 48, 0.4)' : '1px solid rgba(52, 211, 153, 0.4)',
            borderRadius: 4,
            color: isActive ? '#ffaa30' : '#34d399',
            padding: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          {isActive ? '[ PAUSE WORKFLOW ]' : '[ ACTIVATE WORKFLOW ]'}
        </button>
        <button
          type="button"
          onClick={onClose}
          style={{
            flex: 1,
            background: '#ffaa30',
            border: 'none',
            borderRadius: 4,
            color: '#000000',
            padding: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          [ RUN NOW ]
        </button>
      </div>
    </div>
  );
}
