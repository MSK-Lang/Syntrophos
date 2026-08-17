import type { AgentRun } from '@/lib/services/agents.contract';
import type { Task } from '@/lib/services/tasks.contract';
import { IconCheckCircle, IconAlertCircle } from '@/lib/icons.js';

export type MorphingDetailModalProps = {
  readonly item: AgentRun | Task | null;
  readonly onClose: () => void;
  readonly onAction?: (action: 'pause' | 'approve' | 'complete') => void;
};

export function MorphingDetailModal({
  item,
  onClose,
  onAction,
}: MorphingDetailModalProps) {
  if (!item) return null;

  const isAgentRun = 'agentId' in item;
  const title = isAgentRun ? (item as AgentRun).taskTitle : (item as Task).title;

  return (
    <div className="morphing-modal-overlay" onClick={onClose}>
      <div className="morphing-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 170, 48, 0.3)',
            paddingBottom: '12px',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="island-pulse-orb" />
            <span style={{ fontSize: 12, fontWeight: 'bold', color: '#ffaa30', letterSpacing: '0.12em', fontFamily: 'monospace' }}>
              {isAgentRun ? 'SYNTHROPHOS // AGENT EXECUTION TRACE' : 'SYNTHROPHOS // DELIVERABLE DETAIL'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#885522',
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'monospace',
            }}
          >
            [ ESC ✕ ]
          </button>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 'bold', color: '#ffcc66', margin: '0 0 6px 0', letterSpacing: '0.04em' }}>
              {title}
            </h2>
            <div style={{ fontSize: 11, color: '#885522', fontFamily: 'monospace' }}>
              TARGET ID: {item.id} · STATUS: {isAgentRun ? (item as AgentRun).status.toUpperCase() : (item as Task).status.toUpperCase()}
            </div>
          </div>

          {/* Execution Pipeline Steps */}
          <div
            style={{
              background: 'rgba(25, 13, 2, 0.6)',
              border: '1px solid rgba(255, 170, 48, 0.25)',
              borderRadius: 6,
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ fontSize: 10, letterSpacing: '0.15em', color: '#ffaa30', fontFamily: 'monospace' }}>
              AUTONOMOUS EXECUTION PIPELINE
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, fontFamily: 'monospace' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#34d399' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <IconCheckCircle width={12} height={12} />
                  <span>01. WORKSPACE KNOWLEDGE INGEST</span>
                </span>
                <span style={{ fontSize: 10, color: '#885522' }}>COMPLETED · 12ms</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#34d399' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <IconCheckCircle width={12} height={12} />
                  <span>02. CALENDAR &amp; SCHEDULE CROSS-REFERENCE</span>
                </span>
                <span style={{ fontSize: 10, color: '#885522' }}>COMPLETED · 48ms</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#ffaa30' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="island-pulse-orb" style={{ width: 6, height: 6 }} />
                  <span>03. REASONING OVER VAULT ARTIFACTS</span>
                </span>
                <span style={{ fontSize: 10, color: '#ffaa30' }}>IN PROGRESS</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#885522' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <IconAlertCircle width={12} height={12} />
                  <span>04. COMPOSE OUTBOUND SYNTHESIS</span>
                </span>
                <span style={{ fontSize: 10, color: '#885522' }}>QUEUED</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#885522' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <IconAlertCircle width={12} height={12} />
                  <span>05. AWAIT OPERATOR APPROVAL</span>
                </span>
                <span style={{ fontSize: 10, color: '#885522' }}>GATEWAY</span>
              </div>
            </div>
          </div>

          {/* Evidence / Trust Breakdown */}
          <div className="evidence-container">
            <div style={{ fontSize: 11, fontWeight: 'bold', color: '#ffaa30', fontFamily: 'monospace' }}>
              WHY THIS RECOMMENDATION? (EVIDENCE &amp; PROVENANCE)
            </div>
            <div style={{ fontSize: 11, color: '#d99a4e', marginTop: 6, lineHeight: 1.6 }}>
              Based on:
            </div>
            <ul style={{ margin: '4px 0 0 16px', padding: 0, fontSize: 11, color: '#ffcc66', lineHeight: 1.6 }}>
              <li>3 calendar events (Q3 Planning, Team Sync, Client Call)</li>
              <li>12 relevant emails (Unanswered lead queries &amp; client requests)</li>
              <li>Project deadline (Q3 Roadmap launch in 5 days)</li>
              <li>Previous task history (Vault node: project-milestones.md)</li>
            </ul>
          </div>

          {/* Action Control Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              onClick={() => onAction?.('pause')}
              style={{
                background: 'rgba(255, 170, 48, 0.1)',
                border: '1px solid rgba(255, 170, 48, 0.3)',
                borderRadius: 4,
                color: '#d99a4e',
                fontFamily: 'monospace',
                fontSize: 11,
                padding: '8px 14px',
                cursor: 'pointer',
              }}
            >
              PAUSE PIPELINE
            </button>
            <button
              type="button"
              onClick={() => onAction?.('approve')}
              style={{
                background: '#ffaa30',
                border: 'none',
                borderRadius: 4,
                color: '#000000',
                fontWeight: 'bold',
                fontFamily: 'monospace',
                fontSize: 11,
                padding: '8px 18px',
                cursor: 'pointer',
                boxShadow: '0 0 12px rgba(255, 170, 48, 0.4)',
              }}
            >
              APPROVE &amp; DISPATCH
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
