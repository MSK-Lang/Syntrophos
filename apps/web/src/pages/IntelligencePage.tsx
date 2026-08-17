import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader.js';
import { Badge, Button, Input } from '@/components/ui/primitives.js';
import { ErrorState, EmptyState } from '@/components/ui/states.js';
import AgentsPage from '@/pages/AgentsPage.js';
import WorkflowsPage from '@/pages/WorkflowsPage.js';
import {
  IconBot,
  IconWorkflow,
  IconZap,
  IconPlus,
  IconSearch,
  IconCheckCircle,
  IconX,
  IconPlay,
  IconPause,
} from '@/lib/icons.js';

export type IntelligenceRun = {
  readonly id: string;
  readonly name: string;
  readonly type: 'Agent' | 'Workflow';
  readonly sourceName: string;
  readonly triggerText: string;
  readonly status: 'SUCCESS' | 'RUNNING' | 'NEEDS_APPROVAL' | 'FAILED';
  readonly timestamp: string;
  readonly duration?: string;
  readonly progress?: number;
};

const MOCK_RUNS: IntelligenceRun[] = [
  {
    id: 'run-1',
    name: 'Client Follow-Up & Task Allocation',
    type: 'Workflow',
    sourceName: 'Researcher Agent',
    triggerText: 'New Client Email Received',
    status: 'SUCCESS',
    timestamp: '09:42 AM',
    duration: '1.4s',
  },
  {
    id: 'run-2',
    name: 'Q3 Product Milestone Breakdown',
    type: 'Agent',
    sourceName: 'Planner Agent',
    triggerText: 'Manual Trigger',
    status: 'RUNNING',
    timestamp: '09:18 AM',
    progress: 64,
  },
  {
    id: 'run-3',
    name: 'Weekly Knowledge Vault Cleanup',
    type: 'Workflow',
    sourceName: 'Memory Curator',
    triggerText: 'Schedule: Sunday 00:00',
    status: 'NEEDS_APPROVAL',
    timestamp: '08:51 AM',
  },
  {
    id: 'run-4',
    name: 'Automated Code Audit PR #184',
    type: 'Agent',
    sourceName: 'Engineer Agent',
    triggerText: 'GitHub Webhook',
    status: 'SUCCESS',
    timestamp: 'Yesterday',
    duration: '3.2s',
  },
];

export default function IntelligencePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'agents' | 'workflows' | 'runs'>('overview');
  const [runs, setRuns] = useState<IntelligenceRun[]>(MOCK_RUNS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRun, setSelectedRun] = useState<IntelligenceRun | null>(null);

  const filteredRuns = useMemo(() => {
    if (!searchQuery.trim()) return runs;
    const q = searchQuery.toLowerCase();
    return runs.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.sourceName.toLowerCase().includes(q) ||
        r.triggerText.toLowerCase().includes(q)
    );
  }, [runs, searchQuery]);

  return (
    <div className="shell-page shell-page--wide" style={{ background: '#000000', color: '#ffcc66', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-sans)' }}>
      {/* 1. SHARED WORKSPACE HEADER */}
      <PageHeader
        variant="wide"
        icon={<IconBot width={22} height={22} />}
        title="INTELLIGENCE // AGENTS & WORKFLOWS CONTROL CENTER"
        subtitle="Agents, workflows, and autonomous execution."
        actions={[
          {
            id: 'create-agent',
            label: '+ Create agent',
            variant: 'ghost',
            icon: <IconBot width={14} height={14} />,
            onAction: () => setActiveTab('agents'),
          },
          {
            id: 'create-workflow',
            label: '+ Create workflow',
            variant: 'primary',
            icon: <IconPlus width={14} height={14} />,
            onAction: () => setActiveTab('workflows'),
            primary: true,
          },
        ]}
      />

      <div style={{ padding: '0 24px 24px 24px', display: 'flex', flexDirection: 'column', gap: 20, flex: '1 1 auto' }}>
        {/* 2. SEGMENTED TAB NAVIGATION */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, borderBottom: '1px solid rgba(255, 170, 48, 0.25)', paddingBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {(['overview', 'agents', 'workflows', 'runs'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                style={{
                  background: activeTab === tab ? 'rgba(120, 60, 0, 0.6)' : 'transparent',
                  border: activeTab === tab ? '1px solid rgba(255, 170, 48, 0.6)' : '1px solid transparent',
                  color: activeTab === tab ? '#ffcc66' : '#d99a4e',
                  borderRadius: 4,
                  padding: '6px 16px',
                  fontSize: 12,
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'runs' && (
            <div style={{ width: 280 }}>
              <Input
                placeholder="Search execution runs… (⌘K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leading={<IconSearch width={14} height={14} />}
                style={{ background: 'rgba(20, 10, 2, 0.8)', borderColor: 'rgba(255, 170, 48, 0.3)', color: '#ffcc66', fontSize: 12 }}
              />
            </div>
          )}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Status Metrics Bar */}
            <div style={{ background: 'rgba(12, 6, 1, 0.9)', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 8, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 12, fontWeight: 'bold', color: '#ffaa30', letterSpacing: '0.12em', fontFamily: 'var(--font-mono)' }}>
                INTELLIGENCE MATRIX STATE
              </div>
              <div style={{ display: 'flex', gap: 24, fontSize: 13, fontFamily: 'var(--font-mono)' }}>
                <span style={{ color: '#ffcc66' }}><strong style={{ color: '#ffaa30' }}>4</strong> active agents</span>
                <span style={{ color: '#885522' }}>·</span>
                <span style={{ color: '#ffcc66' }}><strong style={{ color: '#ffaa30' }}>2</strong> running</span>
                <span style={{ color: '#885522' }}>·</span>
                <span style={{ color: '#ffcc66' }}><strong style={{ color: '#ffaa30' }}>8</strong> active workflows</span>
                <span style={{ color: '#885522' }}>·</span>
                <span style={{ color: '#ffcc66' }}><strong style={{ color: '#ffaa30' }}>1</strong> approval needed</span>
              </div>
            </div>

            {/* Live Active Execution Hero Card */}
            <div style={{ background: 'rgba(20, 10, 2, 0.9)', border: '1px solid rgba(255, 170, 48, 0.4)', borderRadius: 8, padding: '20px', display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 0 20px rgba(255, 170, 48, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 10, color: '#ffaa30', fontWeight: 'bold', letterSpacing: '0.12em', fontFamily: 'var(--font-mono)' }}>
                  ACTIVE EXECUTION RUNNING
                </span>
                <span style={{ fontSize: 10, color: '#34d399', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
                  ● RUNNING 64%
                </span>
              </div>

              <div>
                <div style={{ fontSize: 18, fontWeight: 'bold', color: '#ffcc66' }}>
                  Q3 Product Milestone Breakdown
                </div>
                <div style={{ fontSize: 11, color: '#885522', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                  PLANNER AGENT // Started 18m ago · Est. 12m left
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: 6, background: 'rgba(255, 170, 48, 0.15)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: '64%', height: '100%', background: '#ffaa30' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 6 }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('runs')}
                  style={{ background: '#ffaa30', border: 'none', borderRadius: 4, color: '#000000', padding: '6px 14px', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  [ OPEN RUN WORKSPACE → ]
                </button>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <button
                type="button"
                onClick={() => setActiveTab('agents')}
                style={{ background: 'rgba(12, 6, 1, 0.85)', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 6, padding: '16px', color: '#ffcc66', textAlign: 'left', cursor: 'pointer' }}
              >
                <div style={{ fontSize: 12, fontWeight: 'bold', color: '#ffaa30', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>+ CREATE AGENT</div>
                <div style={{ fontSize: 11, color: '#885522' }}>Configure autonomous agent operators &amp; capabilities.</div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('workflows')}
                style={{ background: 'rgba(12, 6, 1, 0.85)', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 6, padding: '16px', color: '#ffcc66', textAlign: 'left', cursor: 'pointer' }}
              >
                <div style={{ fontSize: 12, fontWeight: 'bold', color: '#ffaa30', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>+ CREATE WORKFLOW</div>
                <div style={{ fontSize: 11, color: '#885522' }}>Build natural language automation pipelines.</div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('runs')}
                style={{ background: 'rgba(12, 6, 1, 0.85)', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 6, padding: '16px', color: '#ffcc66', textAlign: 'left', cursor: 'pointer' }}
              >
                <div style={{ fontSize: 12, fontWeight: 'bold', color: '#ffaa30', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>VIEW RUN HISTORY</div>
                <div style={{ fontSize: 11, color: '#885522' }}>Inspect live agent execution traces &amp; telemetry.</div>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: AGENTS (EMBEDS FULL AGENT CONTROL CENTER) */}
        {activeTab === 'agents' && (
          <AgentsPage embedInWorkspace />
        )}

        {/* TAB 3: WORKFLOWS (EMBEDS FULL WORKFLOW PIPELINE CENTER) */}
        {activeTab === 'workflows' && (
          <WorkflowsPage embedInWorkspace />
        )}

        {/* TAB 4: RUNS (EXECUTION TRACE MATRIX) */}
        {activeTab === 'runs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredRuns.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedRun(r)}
                style={{
                  background: 'rgba(12, 6, 1, 0.9)',
                  border: r.status === 'RUNNING' ? '1px solid rgba(255, 170, 48, 0.5)' : '1px solid rgba(255, 170, 48, 0.2)',
                  borderRadius: 6,
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span
                    style={{
                      background: r.status === 'SUCCESS' ? 'rgba(52, 211, 153, 0.15)' : r.status === 'RUNNING' ? 'rgba(255, 170, 48, 0.15)' : 'rgba(255, 85, 51, 0.15)',
                      border: r.status === 'SUCCESS' ? '1px solid rgba(52, 211, 153, 0.4)' : r.status === 'RUNNING' ? '1px solid rgba(255, 170, 48, 0.4)' : '1px solid rgba(255, 85, 51, 0.4)',
                      color: r.status === 'SUCCESS' ? '#34d399' : r.status === 'RUNNING' ? '#ffaa30' : '#ff5533',
                      fontSize: 9,
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 'bold',
                      padding: '3px 8px',
                      borderRadius: 4,
                    }}
                  >
                    ● {r.status}
                  </span>

                  <div>
                    <div style={{ fontSize: 14, fontWeight: 'bold', color: '#ffcc66' }}>{r.name}</div>
                    <div style={{ fontSize: 10, color: '#885522', fontFamily: 'var(--font-mono)' }}>
                      SOURCE: {r.sourceName} ({r.type}) · TRIGGER: {r.triggerText}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontSize: 10, color: '#885522', fontFamily: 'var(--font-mono)' }}>
                    {r.timestamp} {r.duration ? `(${r.duration})` : ''}
                  </span>
                  <button
                    type="button"
                    style={{ background: 'transparent', border: 'none', color: '#ffaa30', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    [ Inspect → ]
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RUN DETAIL INSPECTION DRAWER */}
      {selectedRun && (
        <RunDetailDrawer
          run={selectedRun}
          onClose={() => setSelectedRun(null)}
        />
      )}
    </div>
  );
}

function RunDetailDrawer({
  run,
  onClose,
}: {
  readonly run: IntelligenceRun;
  readonly onClose: () => void;
}) {
  return (
    <div className="task-detail-drawer" style={{ color: '#ffcc66', fontFamily: 'var(--font-sans)' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 170, 48, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(14, 7, 1, 0.95)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#ffaa30', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
          <IconBot width={14} height={14} />
          <span>EXECUTION TRACE // {run.id.toUpperCase()}</span>
        </div>
        <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#885522', cursor: 'pointer' }}>
          <IconX width={16} height={16} />
        </button>
      </div>

      <div style={{ padding: '20px', flex: '1 1 auto', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: '#ffcc66', marginBottom: 2 }}>{run.name}</div>
          <div style={{ fontSize: 11, color: '#885522', fontFamily: 'var(--font-mono)' }}>SOURCE: {run.sourceName} ({run.type})</div>
        </div>

        {/* Observable Execution Steps */}
        <div>
          <div style={{ fontSize: 10, color: '#ffaa30', fontWeight: 'bold', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
            OBSERVABLE STEP TRACE
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 11 }}>
            <div style={{ color: '#34d399' }}>✓ Trigger received ({run.triggerText})</div>
            <div style={{ color: '#34d399' }}>✓ Workspace context retrieved &amp; indexed</div>
            <div style={{ color: run.status === 'RUNNING' ? '#ffaa30' : '#34d399' }}>
              {run.status === 'RUNNING' ? '● Agent executing pipeline steps' : '✓ Pipeline execution completed'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255, 170, 48, 0.3)', display: 'flex', justifyContent: 'flex-end', background: 'rgba(14, 7, 1, 0.95)' }}>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close Trace
        </Button>
      </div>
    </div>
  );
}
