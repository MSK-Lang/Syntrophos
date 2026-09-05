import { useBusiness } from '@/lib/services/business/useBusiness.js';
import { IconGraph, IconCheckCircle, IconZap, IconWorkflow } from '@/lib/icons.js';

export default function BusinessReportsPage() {
  const { report, workflows, objectives } = useBusiness();

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
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: '#ffaa30',
              letterSpacing: '0.12em',
              marginBottom: 4,
            }}
          >
            DAILY FULFILLMENT REPORT // {report.date}
          </div>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: '#ffcc66',
              margin: 0,
              letterSpacing: '0.02em',
              textShadow: '0 0 10px rgba(255, 170, 48, 0.4)',
            }}
          >
            Executive Fulfillment Digest
          </h1>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          style={{
            background: 'rgba(255, 170, 48, 0.15)',
            border: '1px solid rgba(255, 170, 48, 0.4)',
            borderRadius: 6,
            padding: '6px 14px',
            color: '#ffcc66',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            cursor: 'pointer',
          }}
        >
          EXPORT SUMMARY
        </button>
      </div>

      {/* Summary KPI Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 14,
          marginBottom: 24,
        }}
      >
        <div style={{ background: 'rgba(15, 8, 2, 0.8)', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 8, padding: '14px 16px' }}>
          <div style={{ fontSize: '10px', color: '#885522', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: 4 }}>
            FULFILLMENT RATE
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#ffcc66' }}>
            {report.overallFulfillmentRate}%
          </div>
        </div>

        <div style={{ background: 'rgba(15, 8, 2, 0.8)', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 8, padding: '14px 16px' }}>
          <div style={{ fontSize: '10px', color: '#885522', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: 4 }}>
            AGENT EXECUTIONS
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#88ddff' }}>
            {report.agentCompletedCount} <span style={{ fontSize: '12px', color: '#885522' }}>tasks</span>
          </div>
        </div>

        <div style={{ background: 'rgba(15, 8, 2, 0.8)', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 8, padding: '14px 16px' }}>
          <div style={{ fontSize: '10px', color: '#885522', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: 4 }}>
            HUMAN EXECUTIONS
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#ffaa30' }}>
            {report.humanCompletedCount} <span style={{ fontSize: '12px', color: '#885522' }}>tasks</span>
          </div>
        </div>

        <div style={{ background: 'rgba(15, 8, 2, 0.8)', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 8, padding: '14px 16px' }}>
          <div style={{ fontSize: '10px', color: '#885522', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: 4 }}>
            ACTIVE BLOCKERS
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: report.totalBlocked > 0 ? '#ff8877' : '#66ffaa' }}>
            {report.totalBlocked}
          </div>
        </div>
      </div>

      {/* Main Report Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
        {/* Left Column: Progress & Blockers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Active Objectives Progress */}
          <div style={{ background: 'rgba(15, 8, 2, 0.8)', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 8, padding: '18px' }}>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#ffaa30', letterSpacing: '0.1em', marginBottom: 12 }}>
              OBJECTIVES PROGRESS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {report.objectiveSummaries.map((op, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: 4 }}>
                    <span style={{ color: '#ffcc66' }}>{op.title}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: '#ffaa30' }}>{op.progress}%</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255, 170, 48, 0.15)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${op.progress}%`, height: '100%', background: '#ffaa30' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Blockers Digest */}
          <div style={{ background: 'rgba(15, 8, 2, 0.8)', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 8, padding: '18px' }}>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#ff8877', letterSpacing: '0.1em', marginBottom: 12 }}>
              BLOCKERS DIGEST
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {report.activeBlockers.map((b, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(30, 10, 5, 0.7)',
                    border: '1px solid rgba(255, 80, 50, 0.4)',
                    borderRadius: 4,
                    padding: '10px 12px',
                    fontSize: '12px',
                    color: '#ffaaaa',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                  }}
                >
                  <span style={{ color: '#ff5533', marginTop: 1 }}>⚠</span>
                  <div>
                    <div style={{ fontWeight: 600, color: '#ffcc66' }}>{b.title}</div>
                    <div style={{ fontSize: '11px', color: '#ffaaaa', marginTop: 2 }}>{b.reason}</div>
                    <div style={{ fontSize: '10px', color: '#88ddff', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                      Action: {b.resolutionAction}
                    </div>
                  </div>
                </div>
              ))}
              {report.activeBlockers.length === 0 && (
                <div style={{ color: '#66ffaa', fontSize: '12px' }}>
                  No active bottlenecks detected in pipeline execution today.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recommended Next Actions */}
        <div style={{ background: 'rgba(15, 8, 2, 0.8)', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 8, padding: '18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#ffaa30', letterSpacing: '0.1em' }}>
            RECOMMENDED NEXT ACTIONS (SYNTHROPHOS SYNTHESIS)
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {report.recommendedActions.map((action, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(5, 3, 1, 0.7)',
                  border: '1px solid rgba(255, 170, 48, 0.2)',
                  borderRadius: 6,
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                }}
              >
                <span style={{ color: '#ffaa30', fontFamily: 'var(--font-mono)', fontSize: '12px', marginTop: 1 }}>
                  0{idx + 1}
                </span>
                <div style={{ fontSize: '12px', color: '#ffcc66', lineHeight: 1.5 }}>
                  {action}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255, 170, 48, 0.15)', paddingTop: 12, fontSize: '11px', color: '#885522' }}>
            Syntrophos autonomous agents continuously cycle through pending verifications and low-risk workflows.
          </div>
        </div>
      </div>
    </div>
  );
}
