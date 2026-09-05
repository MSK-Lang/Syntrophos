import { useState } from 'react';
import { useBusiness } from '@/lib/services/business/useBusiness.js';
import type { BusinessAgent, AgentCapability } from '@/lib/services/business/business.contract.js';
import { IconBot, IconZap, IconCheckCircle, IconSettings, IconCode } from '@/lib/icons.js';

export default function BusinessAgentsPage() {
  const { agents } = useBusiness();
  const [capabilityFilter, setCapabilityFilter] = useState<string>('all');
  const [selectedAgent, setSelectedAgent] = useState<BusinessAgent | null>(agents[0] ?? null);

  const filteredAgents = agents.filter((ag) => {
    if (capabilityFilter === 'all') return true;
    return ag.capabilities.includes(capabilityFilter as AgentCapability);
  });

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
            AUTONOMOUS FLEET & CAPABILITY REGISTRY // MODEL AGNOSTIC
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
            Configured AI Agents
          </h1>
        </div>

        {/* Capability Filters */}
        <div style={{ display: 'flex', gap: 6, background: 'rgba(20, 10, 2, 0.8)', padding: 3, borderRadius: 6, border: '1px solid rgba(255, 170, 48, 0.25)', overflowX: 'auto' }}>
          {['all', 'web_research', 'lead_qualification', 'crm_write', 'doc_generation', 'code_execution', 'data_analytics'].map((cap) => (
            <button
              key={cap}
              type="button"
              onClick={() => setCapabilityFilter(cap)}
              style={{
                background: capabilityFilter === cap ? 'rgba(255, 170, 48, 0.25)' : 'transparent',
                color: capabilityFilter === cap ? '#ffcc66' : '#885522',
                border: 'none',
                borderRadius: 4,
                padding: '5px 10px',
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {cap.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Agent Roster + Agent Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedAgent ? '1.3fr 1fr' : '1fr', gap: 20 }}>
        {/* Agent Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filteredAgents.map((ag) => {
            const isSelected = selectedAgent?.id === ag.id;

            return (
              <div
                key={ag.id}
                onClick={() => setSelectedAgent(ag)}
                style={{
                  background: isSelected ? 'rgba(30, 16, 4, 0.9)' : 'rgba(15, 8, 2, 0.8)',
                  border: isSelected ? '1px solid #ffaa30' : '1px solid rgba(255, 170, 48, 0.25)',
                  boxShadow: isSelected ? '0 0 14px rgba(255, 170, 48, 0.2) inset' : 'none',
                  borderRadius: 8,
                  padding: '18px',
                  cursor: 'pointer',
                  transition: 'all 120ms ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 6,
                        background: 'rgba(255, 170, 48, 0.15)',
                        border: '1px solid rgba(255, 170, 48, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffaa30',
                      }}
                    >
                      <IconBot width={18} height={18} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '15px', fontWeight: 600, color: '#ffcc66' }}>{ag.name}</span>
                        <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#885522', background: 'rgba(5, 3, 1, 0.6)', padding: '1px 5px', borderRadius: 3 }}>
                          // {ag.callsign}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#d99a4e', marginTop: 2 }}>{ag.role}</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        fontSize: '9px',
                        fontFamily: 'var(--font-mono)',
                        padding: '2px 6px',
                        borderRadius: 3,
                        background: ag.status === 'executing' ? 'rgba(0, 200, 100, 0.2)' : 'rgba(255, 170, 48, 0.2)',
                        border: '1px solid rgba(255, 170, 48, 0.4)',
                        color: ag.status === 'executing' ? '#66ffaa' : '#ffcc66',
                      }}
                    >
                      {ag.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Model & Provider Badges */}
                <div style={{ display: 'flex', gap: 8, margin: '8px 0', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ background: 'rgba(0, 150, 255, 0.15)', color: '#88ddff', padding: '2px 6px', borderRadius: 3, border: '1px solid rgba(0, 150, 255, 0.3)' }}>
                    MODEL: {ag.modelName}
                  </span>
                  <span style={{ background: 'rgba(255, 170, 48, 0.1)', color: '#ffaa30', padding: '2px 6px', borderRadius: 3, border: '1px solid rgba(255, 170, 48, 0.2)' }}>
                    PROVIDER: {ag.provider.toUpperCase()}
                  </span>
                  <span style={{ background: 'rgba(100, 100, 100, 0.15)', color: '#ffcc66', padding: '2px 6px', borderRadius: 3 }}>
                    POLICY: {ag.defaultAutonomyPolicy.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                {/* Capabilities Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                  {ag.capabilities.map((cap) => (
                    <span
                      key={cap}
                      style={{
                        fontSize: '9px',
                        fontFamily: 'var(--font-mono)',
                        background: 'rgba(5, 3, 1, 0.8)',
                        border: '1px solid rgba(255, 170, 48, 0.15)',
                        color: '#ffcc66',
                        padding: '2px 6px',
                        borderRadius: 3,
                      }}
                    >
                      {cap.replace('_', ' ')}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: 12,
                    borderTop: '1px solid rgba(255, 170, 48, 0.1)',
                    paddingTop: 8,
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    color: '#885522',
                  }}
                >
                  <span>Completed Today: <strong style={{ color: '#ffcc66' }}>{ag.tasksCompletedToday}</strong></span>
                  <span>Success Rate: <strong style={{ color: '#66ffaa' }}>{ag.successRate}%</strong></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Agent Inspector */}
        {selectedAgent && (
          <div
            style={{
              background: 'rgba(15, 8, 2, 0.95)',
              border: '1px solid rgba(255, 170, 48, 0.4)',
              borderRadius: 8,
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              boxShadow: '0 0 20px rgba(0, 0, 0, 0.8)',
              height: 'fit-content',
              position: 'sticky',
              top: 20,
            }}
          >
            <div style={{ borderBottom: '1px solid rgba(255, 170, 48, 0.2)', paddingBottom: 12 }}>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#885522', letterSpacing: '0.1em' }}>
                AGENT CONFIGURATION & PERMISSIONS
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#ffcc66', marginTop: 4 }}>
                {selectedAgent.name} ({selectedAgent.callsign})
              </div>
              <div style={{ fontSize: '12px', color: '#d99a4e', marginTop: 2 }}>
                {selectedAgent.role}
              </div>
            </div>

            {/* Architecture Stack */}
            <div>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#885522', letterSpacing: '0.08em', marginBottom: 6 }}>
                INFRASTRUCTURE STACK
              </div>
              <div style={{ background: 'rgba(5, 3, 1, 0.7)', border: '1px solid rgba(255, 170, 48, 0.15)', borderRadius: 4, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6, fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#885522' }}>Provider:</span>
                  <span style={{ color: '#ffcc66' }}>{selectedAgent.provider}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#885522' }}>Model Target:</span>
                  <span style={{ color: '#88ddff' }}>{selectedAgent.modelName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#885522' }}>Autonomy Policy:</span>
                  <span style={{ color: '#ffaa30' }}>{selectedAgent.defaultAutonomyPolicy}</span>
                </div>
              </div>
            </div>

            {/* Capabilities Authorized */}
            <div>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#885522', letterSpacing: '0.08em', marginBottom: 6 }}>
                AUTHORIZED CAPABILITIES ({selectedAgent.capabilities.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {selectedAgent.capabilities.map((cap) => (
                  <span
                    key={cap}
                    style={{
                      background: 'rgba(255, 170, 48, 0.1)',
                      border: '1px solid rgba(255, 170, 48, 0.3)',
                      color: '#ffcc66',
                      padding: '4px 8px',
                      borderRadius: 4,
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    ⚙ {cap.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>

            {/* Permissions Boundaries */}
            <div>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#885522', letterSpacing: '0.08em', marginBottom: 6 }}>
                PERMISSION BOUNDARIES ({selectedAgent.permissions.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {selectedAgent.permissions.map((perm) => (
                  <div
                    key={perm}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: '#66ffaa',
                    }}
                  >
                    <span>✓</span>
                    <span>{perm}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255, 170, 48, 0.15)', paddingTop: 10, fontSize: '11px', color: '#885522', fontStyle: 'italic' }}>
              Model-agnostic instance. Prompts and tool bindings are normalized by Syntrophos Agent Runtime.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
