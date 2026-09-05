import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusiness } from '@/lib/services/business/useBusiness.js';
import { IconWorkspace, IconFolder, IconCheckCircle } from '@/lib/icons.js';

export default function BusinessClientsPage() {
  const navigate = useNavigate();
  const { clients, projects } = useBusiness();
  const [tierFilter, setTierFilter] = useState<'all' | 'enterprise' | 'growth' | 'startup'>('all');

  const filteredClients = clients.filter((c) => {
    if (tierFilter === 'all') return true;
    return c.tier === tierFilter;
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
            EXTERNAL STAKEHOLDERS & CLIENTS
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
            Client Portfolio & Fulfillment Health
          </h1>
        </div>

        {/* Tier Filters */}
        <div style={{ display: 'flex', gap: 6, background: 'rgba(20, 10, 2, 0.8)', padding: 3, borderRadius: 6, border: '1px solid rgba(255, 170, 48, 0.25)' }}>
          {(['all', 'enterprise', 'growth', 'startup'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTierFilter(t)}
              style={{
                background: tierFilter === t ? 'rgba(255, 170, 48, 0.25)' : 'transparent',
                color: tierFilter === t ? '#ffcc66' : '#885522',
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
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 18 }}>
        {filteredClients.map((client) => {
          const clientProjects = projects.filter((p) => p.clientId === client.id);

          return (
            <div
              key={client.id}
              style={{
                background: 'rgba(15, 8, 2, 0.8)',
                border:
                  client.fulfillmentHealth === 'at_risk'
                    ? '1px solid rgba(255, 140, 40, 0.4)'
                    : '1px solid rgba(255, 170, 48, 0.25)',
                borderRadius: 8,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        fontSize: '9px',
                        fontFamily: 'var(--font-mono)',
                        padding: '2px 6px',
                        borderRadius: 3,
                        background: 'rgba(255, 170, 48, 0.15)',
                        color: '#ffcc66',
                        border: '1px solid rgba(255, 170, 48, 0.3)',
                      }}
                    >
                      {client.tier.toUpperCase()}
                    </span>
                    <span
                      style={{
                        fontSize: '9px',
                        fontFamily: 'var(--font-mono)',
                        padding: '2px 6px',
                        borderRadius: 3,
                        background:
                          client.fulfillmentHealth === 'excellent' || client.fulfillmentHealth === 'good'
                            ? 'rgba(0, 200, 100, 0.15)'
                            : 'rgba(255, 140, 40, 0.15)',
                        color: client.fulfillmentHealth === 'at_risk' ? '#ffaa30' : '#66ffaa',
                        border: '1px solid currentColor',
                      }}
                    >
                      HEALTH: {client.fulfillmentHealth.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: '#ffcc66', marginTop: 8 }}>
                    {client.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#d99a4e', marginTop: 2 }}>
                    {client.industry} · MRR: ${client.mrr.toLocaleString()}/mo
                  </div>
                </div>
              </div>

              {/* Lead Contact */}
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
                }}
              >
                <div>
                  <div style={{ color: '#ffcc66', fontWeight: 600 }}>
                    {typeof client.leadContact === 'string' ? client.leadContact : client.leadContact.name}
                  </div>
                  <div style={{ color: '#885522', fontSize: '10px' }}>
                    {typeof client.leadContact === 'object' ? client.leadContact.title : 'Primary Contact'}
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', color: '#d99a4e', fontSize: '10px' }}>
                  {typeof client.leadContact === 'object' ? client.leadContact.email : client.contactEmail}
                </div>
              </div>

              {/* Active Projects */}
              <div>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#885522', letterSpacing: '0.08em', marginBottom: 6 }}>
                  ACTIVE PROJECTS ({clientProjects.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {clientProjects.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        background: 'rgba(5, 3, 1, 0.4)',
                        border: '1px solid rgba(255, 170, 48, 0.1)',
                        borderRadius: 4,
                        padding: '6px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '11px',
                      }}
                    >
                      <span style={{ color: '#ffcc66' }}>{p.name}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: '#ffaa30' }}>
                        {p.progress}%
                      </span>
                    </div>
                  ))}
                  {clientProjects.length === 0 && (
                    <div style={{ color: '#885522', fontSize: '11px', fontStyle: 'italic' }}>
                      No active projects in this sprint.
                    </div>
                  )}
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
                <span style={{ color: '#885522' }}>Contract Status: {client.status.toUpperCase()}</span>
                <button
                  type="button"
                  onClick={() => navigate('/business/projects')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ffaa30',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  View Client Work →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
