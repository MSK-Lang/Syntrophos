import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusiness } from '@/lib/services/business/useBusiness.js';
import { SyntrophosPromptBar } from '@/components/ui/SyntrophosPromptBar.js';
import {
  IconWorkflow,
  IconCheckCircle,
  IconBot,
  IconTasks,
} from '@/lib/icons.js';
import type { AgentResponse } from '@/lib/agentEngine.js';

export default function BusinessCommandCenterPage() {
  const navigate = useNavigate();
  const {
    objectives,
    workflows,
    agents,
    team,
    activities,
    metrics,
    approveNode,
    resolveBlocker,
  } = useBusiness();

  const [promptResponse, setPromptResponse] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Conversational dispatcher
  const handleExecutePrompt = useCallback(
    async (prompt: string): Promise<AgentResponse | void> => {
      const lower = prompt.toLowerCase();
      let reply = '';

      if (lower.includes('blocked') || lower.includes('stuck')) {
        reply = `Identified 1 active blocker: [Acme Global Onboarding] - Node "Approve Enterprise Security Firewall Rules" is awaiting SecOps sign-off. Downstream ingress routing is held until human approval.`;
      } else if (lower.includes('risk') || lower.includes('objective')) {
        reply = `Objective "Zero-Friction Client Onboarding Pipeline" is currently at 61% progress (AT RISK) due to security review hold. All other objectives are ON TRACK.`;
      } else if (lower.includes('hermes') || lower.includes('agent')) {
        const hermes = agents.find((a) => a.callsign === 'HERMES');
        reply = `Hermes (Researcher) completed 100 ICP SaaS company profile scrapings today. Current status: ACTIVE under low-risk autonomy policy.`;
      } else if (lower.includes('report') || lower.includes('fulfillment') || lower.includes('today')) {
        reply = `Today's Business Pulse: ${metrics.avgFulfillment}% overall fulfillment rate. 8 active workers (4 AI agents · 4 human staff). 1 approval required.`;
      } else if (lower.includes('attention') || lower.includes('needs me')) {
        reply = `1 item needs your attention: Approve Enterprise Security Firewall Rules for Acme Global. Delegated to David Chen (SecOps Lead).`;
      } else {
        reply = `Syntrophos Business Dispatcher processed: "${prompt}". Directing intent to fulfillment orchestrator under verified permission boundaries.`;
      }

      setPromptResponse(reply);
    },
    [agents, metrics]
  );

  // Compute active worker numbers
  const activeAgentsCount = agents.filter((a) => a.status === 'executing' || a.status === 'active').length;
  const activeStaffCount = 4;
  const totalActiveWorkers = activeAgentsCount + activeStaffCount;

  // Find top 1-2 critical attention items
  const allNodes = workflows.flatMap((w) =>
    w.nodes.map((n) => ({ ...n, workflowId: w.id, workflowName: w.name }))
  );
  const pendingApprovals = allNodes.filter((n) => n.autonomyState === 'awaiting_approval');
  const blockedNodes = allNodes.filter((n) => n.autonomyState === 'blocked' || n.autonomyState === 'failed');

  // Combined critical attention items (capped at 2 for calm scannability)
  const criticalAttentionItems = [
    ...pendingApprovals.map((node) => ({ ...node, attentionType: 'approval' as const })),
    ...blockedNodes.map((node) => ({ ...node, attentionType: 'blocker' as const })),
  ].slice(0, 2);

  // Recent operational activity items (compact 4 items)
  const recentActivities = activities.slice(0, 4);

  return (
    <div
      style={{
        minHeight: '100%',
        background: '#000000',
        color: '#ffcc66',
        fontFamily: 'var(--font-sans)',
        padding: '24px 32px 80px 32px',
        position: 'relative',
      }}
    >
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 32,
            zIndex: 9999,
            background: 'rgba(15, 8, 2, 0.96)',
            border: '1px solid #ffaa30',
            boxShadow: '0 0 20px rgba(255, 170, 48, 0.4)',
            color: '#ffcc66',
            padding: '8px 16px',
            borderRadius: 6,
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ color: '#66ffaa' }}>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Spacious Container */}
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* ============================================================ */}
        {/* 5. COMPACT HEADER                                            */}
        {/* ============================================================ */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 20,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: '#ffaa30',
                letterSpacing: '0.14em',
                marginBottom: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: '#ffaa30', boxShadow: '0 0 5px #ffaa30' }} />
              BUSINESS FULFILLMENT OS // COMMAND CENTER
            </div>
            <h1
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#ffcc66',
                margin: 0,
                letterSpacing: '0.01em',
                lineHeight: 1.2,
              }}
            >
              Operational Command & Orchestration
            </h1>
          </div>

          <button
            type="button"
            onClick={() => navigate('/business/fulfillment')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255, 170, 48, 0.1)',
              border: '1px solid rgba(255, 170, 48, 0.35)',
              borderRadius: 5,
              padding: '6px 12px',
              color: '#ffcc66',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 120ms ease',
            }}
          >
            <IconWorkflow width={13} height={13} />
            OPEN FULFILLMENT →
          </button>
        </div>

        {/* ============================================================ */}
        {/* 3 & 4. ONE COMPACT BUSINESS PULSE ROW                        */}
        {/* Replaces the previous 5 large numbered cards                 */}
        {/* ============================================================ */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
            background: 'rgba(15, 8, 2, 0.75)',
            border: '1px solid rgba(255, 170, 48, 0.25)',
            borderRadius: 6,
            padding: '12px 18px',
            marginBottom: 24,
          }}
        >
          {/* 1. Objectives */}
          <div
            onClick={() => navigate('/business/objectives')}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#885522', letterSpacing: '0.08em' }}>
              OBJECTIVES
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#ffcc66', marginTop: 2 }}>
              {objectives.length}
            </div>
            <div style={{ fontSize: '10px', color: '#d99a4e', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
              {objectives.filter((o) => o.status === 'on_track').length} active on track
            </div>
          </div>

          {/* 2. Fulfillment */}
          <div
            onClick={() => navigate('/business/fulfillment')}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#885522', letterSpacing: '0.08em' }}>
              FULFILLMENT
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#ffcc66', marginTop: 2 }}>
              {metrics.avgFulfillment}%
            </div>
            <div style={{ fontSize: '10px', color: '#66ffaa', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
              +4.2% today
            </div>
          </div>

          {/* 3. Active */}
          <div
            onClick={() => navigate('/business/agents')}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#885522', letterSpacing: '0.08em' }}>
              ACTIVE
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#ffcc66', marginTop: 2 }}>
              {totalActiveWorkers}
            </div>
            <div style={{ fontSize: '10px', color: '#d99a4e', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
              {activeAgentsCount} agents · {activeStaffCount} humans
            </div>
          </div>

          {/* 4. Needs Me */}
          <div
            onClick={() => navigate('/business/fulfillment')}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: pendingApprovals.length > 0 ? '#ffaa30' : '#885522', letterSpacing: '0.08em' }}>
              NEEDS ME
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: pendingApprovals.length > 0 ? '#ffaa30' : '#66ffaa', marginTop: 2 }}>
              {pendingApprovals.length}
            </div>
            <div style={{ fontSize: '10px', color: pendingApprovals.length > 0 ? '#ffcc66' : '#66ffaa', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
              {pendingApprovals.length > 0 ? `${pendingApprovals.length} approval waiting` : 'Autonomous hold 0'}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 6 & 7. PROMPTBAR AS PRIMARY INTERACTION                      */}
        {/* With only 2-3 compact suggestions                            */}
        {/* ============================================================ */}
        <div style={{ marginBottom: 28 }}>
          <SyntrophosPromptBar
            variant="dashboard"
            mode="business"
            placeholder="What should Syntrophos handle? e.g. 'What's blocking the business?', 'Today's fulfillment'"
            suggestionsTitle="SUGGESTED"
            suggestions={[
              'What needs my attention?',
              "Today's fulfillment",
              'At-risk objectives',
            ]}
            onExecute={handleExecutePrompt}
          />

          {/* Prompt Output Banner (if executed) */}
          {promptResponse && (
            <div
              style={{
                marginTop: 10,
                background: 'rgba(25, 14, 4, 0.85)',
                border: '1px solid rgba(255, 170, 48, 0.35)',
                borderRadius: 6,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                boxShadow: '0 0 14px rgba(255, 170, 48, 0.15)',
              }}
            >
              <span style={{ color: '#ffaa30', fontSize: '14px', marginTop: 1 }}>◉</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#ffaa30', letterSpacing: '0.08em', marginBottom: 2 }}>
                  SYNTHROPHOS OPERATIONAL DISPATCH
                </div>
                <div style={{ fontSize: '12px', color: '#ffcc66', lineHeight: 1.45 }}>
                  {promptResponse}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPromptResponse(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#885522',
                  cursor: 'pointer',
                  fontSize: '12px',
                  padding: '0 4px',
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Divider with breathing room */}
        <div style={{ borderTop: '1px solid rgba(255, 170, 48, 0.15)', margin: '28px 0' }} />

        {/* ============================================================ */}
        {/* 8. NEEDS YOUR ATTENTION (Focused 1-2 items)                  */}
        {/* ============================================================ */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#ffaa30', letterSpacing: '0.12em', fontWeight: 600 }}>
              NEEDS YOUR ATTENTION
            </div>
            <button
              type="button"
              onClick={() => navigate('/business/fulfillment')}
              style={{
                background: 'none',
                border: 'none',
                color: '#885522',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              VIEW ALL →
            </button>
          </div>

          {criticalAttentionItems.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {criticalAttentionItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: 'rgba(20, 10, 3, 0.85)',
                    border: '1px solid rgba(255, 170, 48, 0.4)',
                    boxShadow: '0 0 14px rgba(255, 170, 48, 0.15) inset',
                    borderRadius: 6,
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span
                        style={{
                          fontSize: '9px',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          padding: '1px 5px',
                          borderRadius: 3,
                          background: item.attentionType === 'approval' ? 'rgba(255, 170, 48, 0.25)' : 'rgba(255, 60, 40, 0.25)',
                          border: item.attentionType === 'approval' ? '1px solid rgba(255, 170, 48, 0.6)' : '1px solid rgba(255, 80, 50, 0.6)',
                          color: item.attentionType === 'approval' ? '#ffcc66' : '#ff8877',
                        }}
                      >
                        {item.attentionType === 'approval' ? 'APPROVAL REQUIRED' : 'EXECUTION BLOCKED'}
                      </span>
                      <span style={{ fontSize: '10px', color: '#885522', fontFamily: 'var(--font-mono)' }}>
                        Workflow: {item.workflowName}
                      </span>
                    </div>

                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffcc66' }}>
                      {item.title}
                    </div>

                    <div style={{ fontSize: '11px', color: '#d99a4e', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>Executor: <strong style={{ color: '#ffcc66' }}>{item.executorName}</strong></span>
                      <span style={{ color: '#885522' }}>·</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: '#ffaa30' }}>
                        {item.executorType === 'human' ? 'HUMAN' : 'AGENT'}
                      </span>
                      {item.blockerReason && (
                        <>
                          <span style={{ color: '#885522' }}>·</span>
                          <span style={{ color: '#ff8877' }}>{item.blockerReason}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Focused Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => navigate('/business/fulfillment')}
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(255, 170, 48, 0.25)',
                        color: '#d99a4e',
                        borderRadius: 4,
                        padding: '6px 12px',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                      }}
                    >
                      Inspect
                    </button>

                    {item.attentionType === 'approval' ? (
                      <button
                        type="button"
                        onClick={() => {
                          approveNode(item.workflowId, item.id);
                          showToast(`Approved ${item.title}. Execution resumed.`);
                        }}
                        style={{
                          background: 'rgba(255, 170, 48, 0.22)',
                          border: '1px solid #ffaa30',
                          color: '#ffffff',
                          borderRadius: 4,
                          padding: '6px 14px',
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <IconCheckCircle width={12} height={12} />
                        Approve
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          resolveBlocker(item.workflowId, item.id);
                          showToast(`Resolved blocker for ${item.title}.`);
                        }}
                        style={{
                          background: 'rgba(0, 180, 100, 0.2)',
                          border: '1px solid rgba(0, 220, 120, 0.5)',
                          color: '#66ffbb',
                          borderRadius: 4,
                          padding: '6px 14px',
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                background: 'rgba(10, 6, 2, 0.5)',
                border: '1px solid rgba(255, 170, 48, 0.15)',
                borderRadius: 6,
                padding: '16px',
                textAlign: 'center',
                color: '#885522',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
              }}
            >
              ✓ All business workflows moving autonomously. No active human interventions required.
            </div>
          )}
        </div>

        {/* Divider with breathing room */}
        <div style={{ borderTop: '1px solid rgba(255, 170, 48, 0.15)', margin: '28px 0' }} />

        {/* ============================================================ */}
        {/* 10. PRIORITY OBJECTIVES (Compact rows, not giant cards)      */}
        {/* ============================================================ */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#ffaa30', letterSpacing: '0.12em', fontWeight: 600 }}>
              PRIORITY OBJECTIVES
            </div>
            <button
              type="button"
              onClick={() => navigate('/business/objectives')}
              style={{
                background: 'none',
                border: 'none',
                color: '#885522',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              VIEW ALL →
            </button>
          </div>

          <div
            style={{
              background: 'rgba(12, 6, 2, 0.75)',
              border: '1px solid rgba(255, 170, 48, 0.2)',
              borderRadius: 6,
              padding: '10px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {objectives.slice(0, 3).map((obj, i) => (
              <div
                key={obj.id}
                onClick={() => navigate('/business/objectives')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: i < 2 ? '1px solid rgba(255, 170, 48, 0.08)' : 'none',
                  paddingBottom: i < 2 ? 10 : 0,
                  cursor: 'pointer',
                }}
              >
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffcc66' }}>
                    {obj.title}
                  </div>
                  <div style={{ fontSize: '10px', color: '#885522', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                    Target: {obj.targetOutcome.slice(0, 65)}…
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: '100px', height: 3, background: 'rgba(255, 170, 48, 0.15)', borderRadius: 2, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${obj.progress}%`,
                        height: '100%',
                        background: obj.status === 'at_risk' ? '#ff6644' : '#ffaa30',
                      }}
                    />
                  </div>

                  <span
                    style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: obj.status === 'at_risk' ? '#ff8877' : '#ffaa30',
                      minWidth: '35px',
                      textAlign: 'right',
                    }}
                  >
                    {obj.progress}%
                  </span>

                  <span
                    style={{
                      fontSize: '8px',
                      fontFamily: 'var(--font-mono)',
                      padding: '1px 5px',
                      borderRadius: 3,
                      background: obj.status === 'at_risk' ? 'rgba(255, 80, 50, 0.15)' : 'rgba(0, 200, 100, 0.12)',
                      color: obj.status === 'at_risk' ? '#ff8877' : '#66ffaa',
                      border: obj.status === 'at_risk' ? '1px solid rgba(255, 80, 50, 0.3)' : '1px solid rgba(0, 200, 100, 0.25)',
                      minWidth: '55px',
                      textAlign: 'center',
                    }}
                  >
                    {obj.status === 'at_risk' ? 'AT RISK' : 'ON TRACK'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider with breathing room */}
        <div style={{ borderTop: '1px solid rgba(255, 170, 48, 0.15)', margin: '28px 0' }} />

        {/* ============================================================ */}
        {/* 11. RECENT ACTIVITY (Compact operational stream)             */}
        {/* ============================================================ */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#ffaa30', letterSpacing: '0.12em', fontWeight: 600 }}>
              RECENT ACTIVITY
            </div>
            <button
              type="button"
              onClick={() => navigate('/business/fulfillment')}
              style={{
                background: 'none',
                border: 'none',
                color: '#885522',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              VIEW FULFILLMENT →
            </button>
          </div>

          <div
            style={{
              background: 'rgba(12, 6, 2, 0.75)',
              border: '1px solid rgba(255, 170, 48, 0.2)',
              borderRadius: 6,
              padding: '10px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            {recentActivities.map((act) => {
              const isAgent = act.actorType === 'agent';
              const isHuman = act.actorType === 'human';

              return (
                <div
                  key={act.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '5px 8px',
                    borderRadius: 4,
                    background: 'rgba(5, 3, 1, 0.4)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: '#885522', minWidth: '38px' }}>{act.timestamp}</span>
                    <span
                      style={{
                        fontSize: '8px',
                        padding: '1px 4px',
                        borderRadius: 2,
                        color: isAgent ? '#88ddff' : isHuman ? '#ffcc66' : '#aaaaaa',
                        background: isAgent ? 'rgba(0, 150, 255, 0.1)' : isHuman ? 'rgba(255, 170, 48, 0.1)' : 'rgba(100, 100, 100, 0.1)',
                      }}
                    >
                      {act.actorType.toUpperCase()}
                    </span>
                    <span style={{ color: '#ffcc66' }}>
                      <strong style={{ color: '#ffaa30' }}>{act.actorName}</strong> {act.action}
                    </span>
                  </div>

                  <span style={{ color: act.severity === 'alert' ? '#ff6666' : act.severity === 'warning' ? '#ffaa30' : '#66ffaa', fontWeight: 700 }}>
                    {act.severity === 'alert' ? '!' : act.severity === 'warning' ? '●' : '✓'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
