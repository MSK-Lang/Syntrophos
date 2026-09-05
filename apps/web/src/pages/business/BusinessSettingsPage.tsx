import { useState } from 'react';
import { IconSettings, IconZap, IconCheckCircle } from '@/lib/icons.js';

export default function BusinessSettingsPage() {
  const [autonomyLevel, setAutonomyLevel] = useState<number>(3);
  const [approvalThreshold, setApprovalThreshold] = useState<string>('high_risk');

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
            GOVERNANCE, AUTONOMY POLICIES & PROVIDERS
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
            Business Workspace Settings
          </h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
        {/* Left Column: Autonomy Levels & Policies */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Progressive Autonomy Matrix */}
          <div style={{ background: 'rgba(15, 8, 2, 0.8)', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 8, padding: '20px' }}>
            <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#ffaa30', letterSpacing: '0.1em', marginBottom: 6 }}>
              PROGRESSIVE AUTONOMY LEVEL
            </div>
            <div style={{ fontSize: '13px', color: '#d99a4e', marginBottom: 16 }}>
              Determines how far Syntrophos agents are authorized to proceed without requiring human intervention.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { level: 0, name: 'Level 0 — Observe', desc: 'Syntrophos observes business activity. No automated actions permitted.' },
                { level: 1, name: 'Level 1 — Recommend', desc: 'Syntrophos recommends the next action or workflow.' },
                { level: 2, name: 'Level 2 — Delegate', desc: 'Syntrophos assigns approved work to humans or agents.' },
                { level: 3, name: 'Level 3 — Execute', desc: 'Syntrophos executes permitted workflows according to low-risk policies.' },
                { level: 4, name: 'Level 4 — Closed-loop fulfillment', desc: 'Syntrophos evaluates outcomes and continues/retries/escalates work until the objective is fulfilled.' },
              ].map((item) => (
                <div
                  key={item.level}
                  onClick={() => setAutonomyLevel(item.level)}
                  style={{
                    background: autonomyLevel === item.level ? 'rgba(255, 170, 48, 0.2)' : 'rgba(5, 3, 1, 0.6)',
                    border: autonomyLevel === item.level ? '1px solid #ffaa30' : '1px solid rgba(255, 170, 48, 0.15)',
                    borderRadius: 6,
                    padding: '12px 14px',
                    cursor: 'pointer',
                    transition: 'all 120ms ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: autonomyLevel === item.level ? '#ffcc66' : '#d99a4e' }}>
                      {item.name}
                    </span>
                    {autonomyLevel === item.level && (
                      <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#66ffaa' }}>
                        ● ACTIVE
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: '#885522', marginTop: 4 }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Autonomy Policies Separation (Policy vs State) */}
          <div style={{ background: 'rgba(15, 8, 2, 0.8)', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 8, padding: '20px' }}>
            <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#ffaa30', letterSpacing: '0.1em', marginBottom: 6 }}>
              POLICY VS STATE SEPARATION
            </div>
            <div style={{ fontSize: '12px', color: '#d99a4e', marginBottom: 14 }}>
              <strong>State</strong> is what is happening right now (Suggested, Approved, Executing, Completed, Blocked, Failed).
              <br />
              <strong>Policy</strong> is what Syntrophos is authorized to do (Manual, Approval Required, Low-risk Auto, High-risk Auto, Fully Autonomous).
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(5, 3, 1, 0.7)', borderRadius: 4 }}>
                <span style={{ color: '#ffcc66' }}>Lead Research & Sourcing</span>
                <span style={{ color: '#66ffaa' }}>low_risk_auto</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(5, 3, 1, 0.7)', borderRadius: 4 }}>
                <span style={{ color: '#ffcc66' }}>Client-Facing Deliverable Sending</span>
                <span style={{ color: '#ffaa30' }}>approval_required</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(5, 3, 1, 0.7)', borderRadius: 4 }}>
                <span style={{ color: '#ffcc66' }}>Production Infrastructure Modification</span>
                <span style={{ color: '#ff8877' }}>manual / human operator</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(5, 3, 1, 0.7)', borderRadius: 4 }}>
                <span style={{ color: '#ffcc66' }}>Financial / Invoicing Transactions</span>
                <span style={{ color: '#ffaa30' }}>approval_required</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Model / Provider Configurations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ background: 'rgba(15, 8, 2, 0.8)', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 8, padding: '20px' }}>
            <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#ffaa30', letterSpacing: '0.1em', marginBottom: 6 }}>
              CONFIGURED PROVIDERS (MODEL AGNOSTIC)
            </div>
            <div style={{ fontSize: '12px', color: '#d99a4e', marginBottom: 14 }}>
              Agents are instances with bindings to arbitrary foundation models.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { name: 'Anthropic Claude', models: 'Claude 3.7 Sonnet, Claude 3.5 Haiku', status: 'Connected' },
                { name: 'OpenAI', models: 'GPT-4o, GPT-4o-mini', status: 'Connected' },
                { name: 'Google Vertex AI', models: 'Gemini 2.5 Pro, Gemini 2.5 Flash', status: 'Connected' },
                { name: 'Local Ollama / vLLM', models: 'DeepSeek-R1, Qwen-2.5-72B', status: 'Standby' },
              ].map((prov) => (
                <div
                  key={prov.name}
                  style={{
                    background: 'rgba(5, 3, 1, 0.7)',
                    border: '1px solid rgba(255, 170, 48, 0.15)',
                    borderRadius: 6,
                    padding: '10px 12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#ffcc66' }}>
                    <span>{prov.name}</span>
                    <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: prov.status === 'Connected' ? '#66ffaa' : '#885522' }}>
                      {prov.status.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#885522', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                    Models: {prov.models}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Logging Policy */}
          <div style={{ background: 'rgba(15, 8, 2, 0.8)', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 8, padding: '20px' }}>
            <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#ffaa30', letterSpacing: '0.1em', marginBottom: 6 }}>
              AUDIT & TRACE RETENTION
            </div>
            <div style={{ fontSize: '11px', color: '#d99a4e', lineHeight: 1.5 }}>
              All execution traces record: <strong>Input, Actions Executed, Output Deliverables, and Verification Results</strong>.
              Private chain-of-thought is never exposed externally, ensuring full operational transparency without leakages.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
