import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusiness } from '@/lib/services/business/useBusiness.js';
import { IconFolder, IconWorkflow, IconCheckCircle, IconX } from '@/lib/icons.js';

export default function BusinessProjectsPage() {
  const navigate = useNavigate();
  const { projects, clients, workflows } = useBusiness();
  const [healthFilter, setHealthFilter] = useState<'all' | 'healthy' | 'at_risk' | 'blocked'>('all');

  const filteredProjects = projects.filter((p) => {
    if (healthFilter === 'all') return true;
    return p.health === healthFilter;
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
            OPERATIONAL PROJECTS & INITIATIVES
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
            Business Projects
          </h1>
        </div>

        {/* Health Filters */}
        <div style={{ display: 'flex', gap: 6, background: 'rgba(20, 10, 2, 0.8)', padding: 3, borderRadius: 6, border: '1px solid rgba(255, 170, 48, 0.25)' }}>
          {(['all', 'healthy', 'at_risk', 'blocked'] as const).map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setHealthFilter(h)}
              style={{
                background: healthFilter === h ? 'rgba(255, 170, 48, 0.25)' : 'transparent',
                color: healthFilter === h ? '#ffcc66' : '#885522',
                border: 'none',
                borderRadius: 4,
                padding: '5px 12px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {h.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 18 }}>
        {filteredProjects.map((proj) => {
          const client = proj.clientId ? clients.find((c) => c.id === proj.clientId) : null;
          const linkedWfs = workflows.filter((w) => proj.activeWorkflowIds.includes(w.id));

          return (
            <div
              key={proj.id}
              style={{
                background: 'rgba(15, 8, 2, 0.8)',
                border:
                  proj.health === 'critical'
                    ? '1px solid rgba(255, 60, 40, 0.5)'
                    : proj.health === 'at_risk'
                    ? '1px solid rgba(255, 140, 40, 0.4)'
                    : '1px solid rgba(255, 170, 48, 0.25)',
                borderRadius: 8,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        fontSize: '9px',
                        fontFamily: 'var(--font-mono)',
                        padding: '2px 6px',
                        borderRadius: 3,
                        background:
                          proj.health === 'healthy'
                            ? 'rgba(0, 200, 100, 0.2)'
                            : proj.health === 'at_risk'
                            ? 'rgba(255, 140, 40, 0.2)'
                            : 'rgba(255, 60, 40, 0.2)',
                        color:
                          proj.health === 'healthy'
                            ? '#66ffaa'
                            : proj.health === 'at_risk'
                            ? '#ffaa30'
                            : '#ff8877',
                        border: '1px solid currentColor',
                      }}
                    >
                      {proj.health.toUpperCase()}
                    </span>
                    {client ? (
                      <span style={{ fontSize: '11px', color: '#ffcc66', fontFamily: 'var(--font-mono)' }}>
                        Client: {client.name}
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#885522', fontFamily: 'var(--font-mono)' }}>
                        Internal Initiative
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#ffcc66', marginTop: 8 }}>
                    {proj.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#d99a4e', marginTop: 4 }}>
                    {proj.description}
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
                  <span style={{ color: '#885522' }}>PROGRESS</span>
                  <span style={{ color: '#ffcc66', fontWeight: 600 }}>{proj.progress}%</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255, 170, 48, 0.15)', borderRadius: 3, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${proj.progress}%`,
                      height: '100%',
                      background: proj.health === 'critical' ? '#ff5533' : '#ffaa30',
                    }}
                  />
                </div>
              </div>

              {/* Deliverables Roster */}
              <div>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#885522', letterSpacing: '0.08em', marginBottom: 6 }}>
                  DELIVERABLES SUMMARY
                </div>
                <div
                  style={{
                    background: 'rgba(5, 3, 1, 0.6)',
                    border: '1px solid rgba(255, 170, 48, 0.12)',
                    borderRadius: 4,
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <span style={{ color: '#ffcc66' }}>
                    {proj.completedDeliverablesCount} of {proj.deliverablesCount} Deliverables Signed Off
                  </span>
                  <span style={{ color: '#66ffaa' }}>
                    {Math.round((proj.completedDeliverablesCount / (proj.deliverablesCount || 1)) * 100)}%
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div
                style={{
                  borderTop: '1px solid rgba(255, 170, 48, 0.12)',
                  paddingTop: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <span style={{ color: '#885522' }}>{linkedWfs.length} Linked Workflows</span>
                <button
                  type="button"
                  onClick={() => navigate('/business/fulfillment')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ffaa30',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Inspect Workflows →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
